import type { ISandbox } from '@cloudflare/sandbox';
import * as Y from 'yjs';

const FS_MAP_KEY = 'fs';

interface FSEntry {
  type: 'file' | 'folder';
  name: string;
  parentId: string | null;
  children?: string[];
}

export class FileSyncService {
  private observedTexts = new Map<string, { text: Y.Text; observer: () => void }>();
  private fsMapObserver: ((event: Y.YMapEvent<FSEntry>) => void) | null = null;
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private pathCache = new Map<string, string>();
  private disposed = false;

  constructor(
    private sandbox: ISandbox,
    private doc: Y.Doc
  ) {}

  /** Initial full sync — writes all folders and files to the sandbox */
  async syncAllFiles(): Promise<void> {
    const fsMap = this.doc.getMap<FSEntry>(FS_MAP_KEY);

    const folders: string[] = [];
    const files: Array<{ id: string; path: string }> = [];

    fsMap.forEach((entry, id) => {
      const path = this.resolvePath(fsMap, id);
      if (!path) return;

      this.pathCache.set(id, path);

      if (entry.type === 'folder') {
        folders.push(path);
      } else {
        files.push({ id, path });
      }
    });

    // Sort folders by depth so parents are created before children
    folders.sort((a, b) => a.split('/').length - b.split('/').length);

    for (const path of folders) {
      try {
        await this.sandbox.mkdir(`/workspace/${path}`, { recursive: true });
      } catch (e) {
        console.error(`[FileSyncService] mkdir failed: ${path}`, e);
      }
    }

    for (const { id, path } of files) {
      try {
        const content = this.doc.getText(`file:${id}`).toJSON();
        await this.sandbox.writeFile(`/workspace/${path}`, content);
      } catch (e) {
        console.error(`[FileSyncService] writeFile failed: ${path}`, e);
      }
    }
  }

  /** Start observing Y.Doc for changes and syncing them to the sandbox */
  startObserving(): void {
    const fsMap = this.doc.getMap<FSEntry>(FS_MAP_KEY);

    // Observe content changes for existing files
    fsMap.forEach((entry, id) => {
      if (entry.type === 'file') {
        this.observeFileText(id);
      }
    });

    // Observe structural changes (add/delete/rename)
    this.fsMapObserver = (event: Y.YMapEvent<FSEntry>) => {
      event.changes.keys.forEach((change, id) => {
        if (change.action === 'add') {
          this.handleAdd(id);
        } else if (change.action === 'delete') {
          this.handleDelete(id, change.oldValue as FSEntry | undefined);
        } else if (change.action === 'update') {
          this.handleUpdate(id);
        }
      });
    };

    fsMap.observe(this.fsMapObserver);
  }

  /** Clean up all observers and timers */
  dispose(): void {
    this.disposed = true;

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    for (const [id] of this.observedTexts) {
      this.unobserveFileText(id);
    }

    if (this.fsMapObserver) {
      this.doc.getMap<FSEntry>(FS_MAP_KEY).unobserve(this.fsMapObserver);
      this.fsMapObserver = null;
    }

    this.pathCache.clear();
  }

  // ── Event handlers ──────────────────────────────────────

  private handleAdd(id: string): void {
    const fsMap = this.doc.getMap<FSEntry>(FS_MAP_KEY);
    const entry = fsMap.get(id);
    if (!entry) return;

    const path = this.resolvePath(fsMap, id);
    if (!path) return;

    this.pathCache.set(id, path);

    if (entry.type === 'folder') {
      this.sandbox.mkdir(`/workspace/${path}`, { recursive: true }).catch((e) => {
        console.error(`[FileSyncService] mkdir failed: ${path}`, e);
      });
    } else {
      const writeNewFile = async () => {
        // Ensure parent directory exists
        const lastSlash = path.lastIndexOf('/');
        if (lastSlash > 0) {
          await this.sandbox.mkdir(`/workspace/${path.substring(0, lastSlash)}`, {
            recursive: true,
          });
        }
        const content = this.doc.getText(`file:${id}`).toJSON();
        await this.sandbox.writeFile(`/workspace/${path}`, content);
      };

      writeNewFile().catch((e) => {
        console.error(`[FileSyncService] writeFile failed: ${path}`, e);
      });

      this.observeFileText(id);
    }
  }

  private handleDelete(id: string, oldEntry?: FSEntry): void {
    const cachedPath = this.pathCache.get(id);
    if (cachedPath) {
      const fullPath = `/workspace/${cachedPath}`;
      if (oldEntry?.type === 'folder') {
        this.sandbox.exec(`rm -rf '${fullPath}'`).catch((e) => {
          console.error(`[FileSyncService] rm folder failed: ${cachedPath}`, e);
        });
      } else {
        this.sandbox.deleteFile(fullPath).catch((e) => {
          console.error(`[FileSyncService] deleteFile failed: ${cachedPath}`, e);
        });
      }
      this.pathCache.delete(id);
    }

    this.unobserveFileText(id);
  }

  private handleUpdate(id: string): void {
    const fsMap = this.doc.getMap<FSEntry>(FS_MAP_KEY);
    const entry = fsMap.get(id);
    if (!entry) return;

    const oldPath = this.pathCache.get(id);
    const newPath = this.resolvePath(fsMap, id);
    if (!newPath) return;

    this.pathCache.set(id, newPath);

    // If path changed (rename or move), move in sandbox
    if (oldPath && oldPath !== newPath) {
      const doMove = async () => {
        const lastSlash = newPath.lastIndexOf('/');
        if (lastSlash > 0) {
          await this.sandbox.mkdir(`/workspace/${newPath.substring(0, lastSlash)}`, {
            recursive: true,
          });
        }
        await this.sandbox.exec(`mv '/workspace/${oldPath}' '/workspace/${newPath}'`);
      };

      doMove().catch((e) => {
        console.error(`[FileSyncService] move failed: ${oldPath} -> ${newPath}`, e);
      });

      // Update cached paths for children of a renamed folder
      if (entry.type === 'folder') {
        const prefix = oldPath + '/';
        for (const [childId, childPath] of this.pathCache.entries()) {
          if (childPath.startsWith(prefix)) {
            this.pathCache.set(childId, newPath + childPath.substring(oldPath.length));
          }
        }
      }
    }
  }

  // ── Y.Text observation ──────────────────────────────────

  private observeFileText(fileId: string): void {
    if (this.observedTexts.has(fileId)) return;

    const text = this.doc.getText(`file:${fileId}`);
    const observer = () => {
      this.debouncedWriteFile(fileId);
    };

    text.observe(observer);
    this.observedTexts.set(fileId, { text, observer });
  }

  private unobserveFileText(fileId: string): void {
    const entry = this.observedTexts.get(fileId);
    if (!entry) return;

    entry.text.unobserve(entry.observer);
    this.observedTexts.delete(fileId);

    const timer = this.debounceTimers.get(fileId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(fileId);
    }
  }

  private debouncedWriteFile(fileId: string): void {
    const existing = this.debounceTimers.get(fileId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.debounceTimers.delete(fileId);
      if (this.disposed) return;

      const fsMap = this.doc.getMap<FSEntry>(FS_MAP_KEY);
      const entry = fsMap.get(fileId);
      if (!entry || entry.type !== 'file') return;

      const path = this.pathCache.get(fileId) || this.resolvePath(fsMap, fileId);
      if (!path) return;

      const content = this.doc.getText(`file:${fileId}`).toJSON();
      this.sandbox.writeFile(`/workspace/${path}`, content).catch((e) => {
        console.error(`[FileSyncService] debounced writeFile failed: ${path}`, e);
      });
    }, 500);

    this.debounceTimers.set(fileId, timer);
  }

  // ── Path resolution ─────────────────────────────────────

  private resolvePath(fsMap: Y.Map<FSEntry>, itemId: string): string {
    const entry = fsMap.get(itemId);
    if (!entry) return '';

    if (!entry.parentId) {
      return entry.name;
    }

    const parentPath = this.resolvePath(fsMap, entry.parentId);
    return parentPath ? `${parentPath}/${entry.name}` : entry.name;
  }
}
