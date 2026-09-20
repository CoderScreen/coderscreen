'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@coderscreen/ui/dropdown';
import type {
  FileTreeContextMenuItem,
  FileTreeContextMenuOpenContext,
  FileTreeDirectoryHandle,
  FileTreeRenameEvent,
} from '@pierre/trees';
import { FileTree, useFileTree } from '@pierre/trees/react';
import {
  RiDeleteBinLine,
  RiEditLine,
  RiFileAddLine,
  RiFolderAddLine,
  RiMore2Line,
} from '@remixicon/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { FsNode } from '@/query/realtime/editor.query';
import { AddItemInput } from './multi-file/AddItemInput';
import { DeleteFileDialog } from './multi-file/DeleteFileDialog';

// Keep the prop surface identical to FileExplorer so this is a true drop-in.
interface PierreFileExplorerProps {
  files: FsNode[];
  selectedFile?: string; // file ID
  onFileSelect: (file: FsNode) => void;
  onFileCreate: (path: string) => void;
  onFolderCreate: (path: string) => void;
  onFileDelete: (path: string) => void;
  onFileRename: (oldPath: string, newPath: string) => void;
  onFolderRename: (oldPath: string, newPath: string) => void;
  checkIfPathExists: (path: string, type: 'file' | 'folder') => boolean;
  className?: string;
}

interface FlatTree {
  // Input paths for @pierre/trees. Folders carry a trailing slash so empty
  // folders render (Pierre uses the trailing slash to mark directories on
  // input, then strips it — canonical/output paths are slash-less).
  inputPaths: string[];
  // canonical (slash-less) path -> node, for path->id/type lookups.
  pathToNode: Map<string, FsNode>;
  // node id -> canonical path, for id->path lookups (selection sync).
  idToPath: Map<string, string>;
}

const flatten = (nodes: FsNode[]): FlatTree => {
  const inputPaths: string[] = [];
  const pathToNode = new Map<string, FsNode>();
  const idToPath = new Map<string, string>();

  const walk = (list: FsNode[]) => {
    for (const node of list) {
      pathToNode.set(node.path, node);
      idToPath.set(node.id, node.path);
      inputPaths.push(node.type === 'folder' ? `${node.path}/` : node.path);
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  };
  walk(nodes);

  return { inputPaths, pathToNode, idToPath };
};

export const PierreFileExplorer = ({
  files,
  selectedFile,
  onFileSelect,
  onFileCreate,
  onFolderCreate,
  onFileDelete,
  onFileRename,
  onFolderRename,
  checkIfPathExists,
  className,
}: PierreFileExplorerProps) => {
  // ---------------------------------------------------------------------------
  // Refs so the callbacks captured once by useFileTree always see fresh props.
  // useFileTree builds the model a single time (useState initializer), so
  // options — including callbacks — are read at construction only.
  // ---------------------------------------------------------------------------
  const onFileSelectRef = useRef(onFileSelect);
  const onFileRenameRef = useRef(onFileRename);
  const onFolderRenameRef = useRef(onFolderRename);
  const selectedFileRef = useRef(selectedFile);
  const flatRef = useRef<FlatTree>({
    inputPaths: [],
    pathToNode: new Map(),
    idToPath: new Map(),
  });

  onFileSelectRef.current = onFileSelect;
  onFileRenameRef.current = onFileRename;
  onFolderRenameRef.current = onFolderRename;
  selectedFileRef.current = selectedFile;

  const [addingItem, setAddingItem] = useState<{ parentPath: string; isFolder: boolean } | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FsNode | null>(null);

  const { model } = useFileTree({
    paths: [],
    icons: { set: 'standard', colored: true },
    renaming: {
      canRename: () => true,
      onRename: (e: FileTreeRenameEvent) => {
        if (e.sourcePath === e.destinationPath) return;
        if (e.isFolder) {
          onFolderRenameRef.current(e.sourcePath, e.destinationPath);
        } else {
          onFileRenameRef.current(e.sourcePath, e.destinationPath);
        }
      },
      onError: (err: string) => console.warn('[tree] rename error:', err),
    },
    // Right-click / per-row button opens our context menu (see renderContextMenu).
    composition: {
      contextMenu: { triggerMode: 'both', buttonVisibility: 'when-needed' },
    },
    onSelectionChange: (paths: readonly string[]) => {
      const path = paths[paths.length - 1];
      if (!path) return;
      const node = flatRef.current.pathToNode.get(path);
      // Only switch the editor for files; folder clicks just expand/collapse.
      if (node && node.type === 'file' && node.id !== selectedFileRef.current) {
        onFileSelectRef.current(node);
      }
    },
  });

  // ---------------------------------------------------------------------------
  // Yjs -> tree: rebuild the model whenever the (structure-only) file list
  // changes. Uses resetPaths but re-applies expansion + selection so the user's
  // local view state survives collaborative structure edits.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const flat = flatten(files);
    flatRef.current = flat;

    // Snapshot still-existing expanded folders before the reset.
    const expandedPaths: string[] = [];
    for (const node of flat.pathToNode.values()) {
      if (node.type !== 'folder') continue;
      const handle = model.getItem(node.path);
      if (handle?.isDirectory() && (handle as FileTreeDirectoryHandle).isExpanded()) {
        expandedPaths.push(node.path);
      }
    }

    const previousSelection = model.getSelectedPaths();

    model.resetPaths(flat.inputPaths, { initialExpandedPaths: expandedPaths });

    // Re-apply selection for paths that still exist.
    for (const path of previousSelection) {
      model.getItem(path)?.select();
    }
  }, [files, model]);

  // ---------------------------------------------------------------------------
  // App -> tree: reflect an externally-driven selectedFile in the tree.
  // Guarded to avoid a ping-pong with onSelectionChange.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedFile) return;
    const path = flatRef.current.idToPath.get(selectedFile);
    if (!path) return;

    const current = model.getSelectedPaths();
    if (current.length === 1 && current[0] === path) return;

    model.getItem(path)?.select();
    model.scrollToPath(path, { offset: 'nearest' });
  }, [selectedFile, model]);

  // Resolve where a header-triggered "New file/folder" should be created:
  // the focused folder, the focused file's parent, or the root.
  const resolveCreateParent = useCallback((): string => {
    const focused = model.getFocusedPath();
    if (!focused) return '';
    const node = flatRef.current.pathToNode.get(focused);
    if (!node) return '';
    if (node.type === 'folder') return node.path;
    return node.path.split('/').slice(0, -1).join('/');
  }, [model]);

  const handleConfirmCreate = useCallback(
    (name: string) => {
      if (!addingItem) return;
      const trimmed = name.trim();
      if (trimmed) {
        const fullPath = addingItem.parentPath ? `${addingItem.parentPath}/${trimmed}` : trimmed;
        if (addingItem.isFolder) {
          onFolderCreate(fullPath);
        } else {
          onFileCreate(fullPath);
        }
      }
      setAddingItem(null);
    },
    [addingItem, onFileCreate, onFolderCreate]
  );

  const handleConfirmDelete = useCallback(() => {
    if (fileToDelete) {
      onFileDelete(fileToDelete.path);
    }
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  }, [fileToDelete, onFileDelete]);

  // Per-item context menu rendered into Pierre's context-menu slot.
  const renderContextMenu = useCallback(
    (item: FileTreeContextMenuItem, context: FileTreeContextMenuOpenContext) => {
      const isFolder = item.kind === 'directory';
      return (
        <div className='min-w-40 rounded-md border bg-white p-1 shadow-md'>
          {isFolder && (
            <>
              <ContextMenuButton
                icon={<RiFileAddLine className='h-3 w-3' />}
                label='New File'
                onClick={() => {
                  setAddingItem({ parentPath: item.path, isFolder: false });
                  context.close();
                }}
              />
              <ContextMenuButton
                icon={<RiFolderAddLine className='h-3 w-3' />}
                label='New Folder'
                onClick={() => {
                  setAddingItem({ parentPath: item.path, isFolder: true });
                  context.close();
                }}
              />
            </>
          )}
          <ContextMenuButton
            icon={<RiEditLine className='h-3 w-3' />}
            label='Rename'
            onClick={() => {
              context.close({ restoreFocus: false });
              model.startRenaming(item.path);
            }}
          />
          <ContextMenuButton
            icon={<RiDeleteBinLine className='h-3 w-3 text-red-500' />}
            label='Delete'
            onClick={() => {
              const node = flatRef.current.pathToNode.get(item.path);
              if (node) {
                setFileToDelete(node);
                setDeleteDialogOpen(true);
              }
              context.close();
            }}
          />
        </div>
      );
    },
    [model]
  );

  const emptyState = useMemo(() => files.length === 0, [files]);

  return (
    <div className={cn('h-full flex flex-col bg-gray-50 border-r px-1', className)}>
      {/* Header */}
      <div className='flex items-center justify-between pt-2 px-2'>
        <h3 className='text-xs text-muted-foreground'>Files</h3>

        <DropdownMenu>
          <DropdownMenuTrigger className='hover:bg-muted rounded-md p-1 cursor-pointer'>
            <RiMore2Line className='h-3 w-3' />
          </DropdownMenuTrigger>
          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem
              className='flex items-center gap-2 text-muted-foreground'
              onClick={() => setAddingItem({ parentPath: resolveCreateParent(), isFolder: false })}
            >
              <RiFileAddLine className='h-3 w-3' />
              <span className='text-xs'>New File</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='flex items-center gap-2 text-muted-foreground'
              onClick={() => setAddingItem({ parentPath: resolveCreateParent(), isFolder: true })}
            >
              <RiFolderAddLine className='h-3 w-3' />
              <span className='text-xs'>New Folder</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Inline create input (rendered above the tree, not inside Pierre's DOM) */}
      {addingItem && (
        <div className='px-1 pt-2'>
          <AddItemInput
            isFolder={addingItem.isFolder}
            parentPath={addingItem.parentPath}
            onConfirm={handleConfirmCreate}
            onCancel={() => setAddingItem(null)}
            placeholder={`Enter ${addingItem.isFolder ? 'folder' : 'file'} name...`}
            checkIfPathExists={checkIfPathExists}
          />
        </div>
      )}

      {/* File tree */}
      <div className='flex-1 min-h-0 overflow-hidden py-2'>
        {emptyState ? (
          <div className='px-4 py-8 text-center text-sm text-gray-400'>No files</div>
        ) : (
          <FileTree model={model} renderContextMenu={renderContextMenu} className='h-full' />
        )}
      </div>

      <DeleteFileDialog
        file={fileToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
};

const ContextMenuButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    type='button'
    onClick={onClick}
    className='flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-gray-100'
  >
    {icon}
    <span>{label}</span>
  </button>
);
