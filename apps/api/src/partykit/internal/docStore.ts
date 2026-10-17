import * as Sentry from '@sentry/cloudflare';
import * as Y from 'yjs';

/**
 * Durable Object storage for a room's live Yjs document.
 *
 * The document is saved to the DO's own SQLite storage on every (debounced)
 * edit: a local write with no network. Postgres only gets a checkpoint copy
 * ("export"), so a slow or failing database can no longer lose edits.
 *
 * `revision` counts local saves and `exportedRevision` records the last one
 * copied to Postgres. Comparing the two (instead of a boolean dirty flag)
 * keeps an export that started before newer edits from marking them exported.
 *
 * Export bookkeeping is stored too, not kept in memory, because hibernation
 * unloads the object between messages.
 */
const KEYS = {
  doc: 'doc',
  revision: 'revision',
  exportedRevision: 'exportedRevision',
  exportedAt: 'exportedAt',
  exportFailures: 'exportFailures',
} as const;

// A failed export is retried by alarm, so it lands even if nobody reconnects.
// Give up after a few tries: the document itself is safe in DO storage, and
// the next save or load tries again anyway.
const EXPORT_RETRY_DELAY_MS = 5 * 60 * 1000;
const MAX_EXPORT_RETRIES = 6;

// DO storage rejects values over 2 MiB. Warn well before that.
const MAX_VALUE_BYTES = 2 * 1024 * 1024;
const WARN_VALUE_BYTES = 1.5 * 1024 * 1024;

export class DocStore {
  constructor(
    private readonly storage: DurableObjectStorage,
    private readonly label: { party: 'room' | 'private-room'; roomId: string }
  ) {}

  /** Apply the stored document, if any. Returns whether one was found. */
  async load(doc: Y.Doc): Promise<boolean> {
    const stored = await this.storage.get<Uint8Array>(KEYS.doc);
    if (!stored || stored.byteLength === 0) {
      return false;
    }

    Y.applyUpdateV2(doc, stored);
    return true;
  }

  /** Save the whole document locally and return the new revision. */
  async save(doc: Y.Doc): Promise<number> {
    const update = Y.encodeStateAsUpdateV2(doc);

    if (update.byteLength > WARN_VALUE_BYTES) {
      Sentry.captureMessage(`Large ${this.label.party} document`, {
        level: update.byteLength > MAX_VALUE_BYTES ? 'error' : 'warning',
        tags: this.label,
        extra: { bytes: update.byteLength },
      });
    }

    const revision = ((await this.storage.get<number>(KEYS.revision)) ?? 0) + 1;
    await this.storage.put<Uint8Array | number>({
      [KEYS.doc]: update,
      [KEYS.revision]: revision,
    });
    return revision;
  }

  async currentRevision(): Promise<number> {
    return (await this.storage.get<number>(KEYS.revision)) ?? 0;
  }

  /** Record that everything up to `revision` has been copied to Postgres. */
  async markExported(revision: number): Promise<void> {
    const exported = (await this.storage.get<number>(KEYS.exportedRevision)) ?? 0;
    await this.storage.put<number>({
      [KEYS.exportedRevision]: Math.max(revision, exported),
      [KEYS.exportedAt]: Date.now(),
      [KEYS.exportFailures]: 0,
    });
  }

  /** When the document was last copied to Postgres, if ever. */
  async lastExportedAt(): Promise<number | undefined> {
    return this.storage.get<number>(KEYS.exportedAt);
  }

  /** Count a failed export and schedule a retry alarm unless we've given up. */
  async scheduleExportRetry(): Promise<void> {
    const failures = ((await this.storage.get<number>(KEYS.exportFailures)) ?? 0) + 1;
    await this.storage.put(KEYS.exportFailures, failures);
    if (failures <= MAX_EXPORT_RETRIES) {
      await this.storage.setAlarm(Date.now() + EXPORT_RETRY_DELAY_MS);
    }
  }

  async hasUnexportedChanges(): Promise<boolean> {
    const [revision, exported] = await Promise.all([
      this.storage.get<number>(KEYS.revision),
      this.storage.get<number>(KEYS.exportedRevision),
    ]);
    return (revision ?? 0) > (exported ?? 0);
  }
}

/**
 * partyserver gets a room's name after a hibernation wake from `ctx.id.name`.
 * Runtimes older than March 2026 (including local wrangler before then) don't
 * set it, and partyserver falls back to this storage record, which it only
 * writes itself when `ctx.id.name` exists. Without it every message that wakes
 * the room fails, dropping edits and presence.
 */
const PARTYSERVER_NAME_KEY = '__ps_name';

export async function rememberServerName(storage: DurableObjectStorage, name: string) {
  if ((await storage.get<string>(PARTYSERVER_NAME_KEY)) !== name) {
    await storage.put(PARTYSERVER_NAME_KEY, name);
  }
}

/**
 * Wrap an async task so concurrent calls share one run, and a call made while
 * it is running triggers exactly one more run afterwards. Used for exports, so
 * the last export always sees the latest document without piling up writes.
 */
export function coalesce(task: () => Promise<void>): () => Promise<void> {
  let running: Promise<void> | null = null;
  let runAgain = false;

  return () => {
    if (running) {
      runAgain = true;
      return running;
    }

    running = (async () => {
      try {
        do {
          runAgain = false;
          await task();
        } while (runAgain);
      } finally {
        running = null;
      }
    })();
    return running;
  };
}
