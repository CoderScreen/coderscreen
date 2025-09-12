'use client';

import {
  RiDeleteBinLine,
  RiEditLine,
  RiFileAddLine,
  RiFileLine,
  RiFolderAddLine,
  RiFolderFill,
  RiFolderOpenFill,
  RiMore2Line,
} from '@remixicon/react';
import { useCallback, useState } from 'react';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { FsNode } from '@/query/realtime/multiFileCode.query';
import { AddItemInput } from './multi-file/AddItemInput';
import { DeleteFileDialog } from './multi-file/DeleteFileDialog';
import { RenameItemInput } from './multi-file/RenameItemInput';

interface FileExplorerProps {
  files: FsNode[];
  selectedFile?: string; // Now expects file ID instead of path
  onFileSelect: (file: FsNode) => void;
  onFileCreate: (path: string) => void;
  onFolderCreate: (path: string) => void;
  onFileDelete: (path: string) => void;
  onFileRename: (oldPath: string, newPath: string) => void;
  onFolderRename: (oldPath: string, newPath: string) => void;
  checkIfPathExists: (path: string, type: 'file' | 'folder') => boolean;
  className?: string;
}

const FileIcon = ({ file }: { file: FsNode }) => {
  if (file.type === 'folder') {
    return file.isExpanded ? (
      <RiFolderOpenFill className='h-4 w-4 text-yellow-500' />
    ) : (
      <RiFolderFill className='h-4 w-4 text-yellow-500' />
    );
  }

  // For files, use language icon if available
  if (file.language) {
    return <LanguageIcon language={file.language} className='h-4 w-4' />;
  }

  return <RiFileLine className='h-4 w-4 text-gray-500' />;
};

const FileTreeItem = ({
  file,
  level = 0,
  selectedFile,
  focusedFile,
  addingItem,
  renamingItem,
  onFileSelect,
  onToggleExpand,
  onConfirmFile,
  onCancelFile,
  onNewFile,
  onDeleteFile,
  onRenameFile,
  onCancelRename,
  onConfirmRename,
  checkIfPathExists,
}: {
  file: FsNode;
  level?: number;
  selectedFile?: string;
  focusedFile?: FsNode | null;
  addingItem?: { path: string; isFolder: boolean } | null;
  renamingItem?: FsNode | null;
  onFileSelect: (file: FsNode) => void;
  onToggleExpand: (file: FsNode) => void;
  onConfirmFile: (fileName: string, isFolder: boolean) => void;
  onCancelFile: () => void;
  onNewFile: (file: FsNode, isFolder: boolean) => void;
  onDeleteFile: (file: FsNode) => void;
  onRenameFile: (file: FsNode) => void;
  onCancelRename: () => void;
  onConfirmRename: (file: FsNode, newName: string) => void;
  checkIfPathExists: (path: string, type: 'file' | 'folder') => boolean;
}) => {
  const isSelected = selectedFile === file.id;
  const isFocused = focusedFile?.id === file.id;

  const handleClick = useCallback(() => {
    if (file.type === 'folder') {
      onToggleExpand(file);
    } else {
      onFileSelect(file);
    }
  }, [file, onFileSelect, onToggleExpand]);

  const isRenaming = renamingItem?.id === file.id;

  return (
    <div>
      {isRenaming ? (
        <RenameItemInput
          isFolder={file.type === 'folder'}
          currentName={file.name}
          onConfirm={(newName) => onConfirmRename(file, newName)}
          onCancel={onCancelRename}
          checkIfPathExists={checkIfPathExists}
          parentPath={file.path.split('/').slice(0, -1).join('/')}
        />
      ) : (
        <div
          className={cn(
            'flex items-center gap-2 w-full text-left p-1 text-xs text-muted-foreground group',
            'hover:bg-white rounded relative',
            isSelected && 'text-black',
            isFocused && 'ring-2 ring-blue-500/50 ring-offset-1 z-20'
          )}
        >
          <span
            role='button'
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
            className='flex items-center gap-2 flex-1'
          >
            <div className='flex-shrink-0'>
              <FileIcon file={file} />
            </div>
            <div>{file.name}</div>
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => {
                e.stopPropagation();
              }}
              className='opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <RiMore2Line className='shrink-0 h-3.5 w-3.5 cursor-pointer' />
            </DropdownMenuTrigger>
            <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
              {file.type === 'folder' && (
                <>
                  <DropdownMenuItem
                    className='flex items-center gap-2 text-muted-foreground'
                    onClick={() => onNewFile(file, false)}
                  >
                    <RiFileAddLine className='h-3 w-3' />
                    <span className='text-xs'>New File</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='flex items-center gap-2 text-muted-foreground'
                    onClick={() => onNewFile(file, true)}
                  >
                    <RiFolderAddLine className='h-3 w-3' />
                    <span className='text-xs'>New Folder</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                className='flex items-center gap-2 text-muted-foreground'
                onClick={() => onRenameFile(file)}
              >
                <RiEditLine className='h-3 w-3' />
                <span className='text-xs'>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='flex items-center gap-2 text-muted-foreground'
                onClick={() => onDeleteFile(file)}
              >
                <RiDeleteBinLine className='h-3 w-3 text-red-500' />
                <span className='text-xs'>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {file.type === 'folder' && file.isExpanded && file.children && (
        <div className='mt-1 border-l border-gray-300 ml-2 pl-2'>
          {file.children.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              level={level + 1}
              selectedFile={selectedFile}
              focusedFile={focusedFile}
              addingItem={addingItem}
              renamingItem={renamingItem}
              onFileSelect={onFileSelect}
              onToggleExpand={onToggleExpand}
              onConfirmFile={onConfirmFile}
              onCancelFile={onCancelFile}
              onNewFile={onNewFile}
              onDeleteFile={onDeleteFile}
              onRenameFile={onRenameFile}
              onCancelRename={onCancelRename}
              onConfirmRename={onConfirmRename}
              checkIfPathExists={checkIfPathExists}
            />
          ))}

          {addingItem?.path === file.path && (
            <div className='mt-1'>
              <AddItemInput
                isFolder={addingItem.isFolder}
                onConfirm={(fileName) => onConfirmFile(fileName, addingItem.isFolder)}
                onCancel={onCancelFile}
                placeholder={`Enter ${addingItem.isFolder ? 'folder' : 'file'} name...`}
                checkIfPathExists={checkIfPathExists}
                parentPath={file.path}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const FileExplorer = ({
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
}: FileExplorerProps) => {
  const [focusedFile, setFocusedFile] = useState<FsNode | null>(null);
  const [addingItem, setAddingItem] = useState<{
    path: string;
    isFolder: boolean;
  } | null>(null);
  const [renamingItem, setRenamingItem] = useState<FsNode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FsNode | null>(null);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback(
    (file: FsNode) => {
      setFocusedFile(file);
      if (file.type === 'folder') {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(file.id)) {
          newExpanded.delete(file.id);
        } else {
          newExpanded.add(file.id);
        }
        setExpandedFolders(newExpanded);
      }
    },
    [expandedFolders]
  );

  const handleFileSelect = useCallback(
    (file: FsNode) => {
      setFocusedFile(file);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const handleDeselectFile = useCallback(() => {
    setFocusedFile(null);
  }, []);

  const handleClickNewFile = useCallback(
    (file: FsNode | null, isFolder: boolean) => {
      if (!file) {
        setAddingItem({
          path: '/',
          isFolder,
        });

        return;
      }

      // Ensure the folder is expanded when adding a new file/folder
      if (file.type === 'folder') {
        const newExpanded = new Set(expandedFolders);
        newExpanded.add(file.path);
        setExpandedFolders(newExpanded);
        setAddingItem({
          path: file.path,
          isFolder,
        });
      } else {
        const rawDirPath = file.path.split('/').slice(0, -1).join('/');
        const dirPath = rawDirPath.startsWith('/') ? rawDirPath.substring(1) : rawDirPath;

        // Also expand the parent directory
        if (dirPath) {
          const newExpanded = new Set(expandedFolders);
          newExpanded.add(dirPath);
          setExpandedFolders(newExpanded);
        }
        setAddingItem({
          path: dirPath,
          isFolder,
        });
      }
    },
    [expandedFolders]
  );

  const handleConfirmFile = useCallback(
    (fileName: string, isFolder: boolean) => {
      if (addingItem !== null) {
        const fullPath = addingItem ? `${addingItem.path}/${fileName}` : fileName;

        if (isFolder) {
          onFolderCreate(fullPath);
        } else {
          onFileCreate(fullPath);
        }
      }
      setAddingItem(null);
    },
    [addingItem, onFileCreate, onFolderCreate]
  );

  const handleCancelFile = useCallback(() => {
    setAddingItem(null);
  }, []);

  const handleDeleteFile = useCallback((file: FsNode) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (fileToDelete) {
      onFileDelete(fileToDelete.path);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  }, [fileToDelete, onFileDelete]);

  const handleRenameFile = useCallback((file: FsNode) => {
    setRenamingItem(file);
  }, []);

  const handleCancelRename = useCallback(() => {
    setRenamingItem(null);
  }, []);

  const handleConfirmRename = useCallback(
    (file: FsNode, newName: string) => {
      if (newName.trim() && newName.trim() !== file.name) {
        const parentPath = file.path.split('/').slice(0, -1).join('/');
        const newPath = parentPath ? `${parentPath}/${newName.trim()}` : newName.trim();

        if (file.type === 'folder') {
          onFolderRename(file.path, newPath);
        } else {
          onFileRename(file.path, newPath);
        }
      }
      setRenamingItem(null);
    },
    [onFileRename, onFolderRename]
  );

  const toggleExpandedFolders = useCallback(
    (files: FsNode[]): FsNode[] => {
      return files.map((file) => ({
        ...file,
        isExpanded: expandedFolders.has(file.id),
        children: file.children ? toggleExpandedFolders(file.children) : undefined,
      }));
    },
    [expandedFolders]
  );

  const processedFiles = toggleExpandedFolders(files);

  return (
    <div className={cn('h-full flex flex-col bg-gray-50 border-r px-1', className)}>
      {/* Header */}
      <div className='flex items-center justify-between pt-2 px-2'>
        <h3 className='text-xs text-muted-foreground'>Files</h3>

        <Button type='button' variant='secondary' onClick={() => console.log(processedFiles)}>
          print files
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className='hover:bg-muted rounded-md p-1 cursor-pointer'>
            <RiMore2Line className='h-3 w-3' />
          </DropdownMenuTrigger>
          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem
              className='flex items-center gap-2 text-muted-foreground'
              onClick={() => handleClickNewFile(focusedFile, false)}
            >
              <RiFileAddLine className='h-3 w-3' />
              <span className='text-xs'>New File</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='flex items-center gap-2 text-muted-foreground'
              onClick={() => handleClickNewFile(focusedFile, true)}
            >
              <RiFolderAddLine className='h-3 w-3' />
              <span className='text-xs'>New Folder</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* File Tree */}
      <div className='overflow-y-auto py-2 px-1'>
        {processedFiles.length === 0 ? (
          <div className='px-4 py-8 text-center'>
            <div className='text-gray-400 text-sm'>No files</div>
          </div>
        ) : (
          <>
            {processedFiles.map((file) => (
              <FileTreeItem
                key={file.id}
                file={file}
                selectedFile={selectedFile}
                focusedFile={focusedFile}
                addingItem={addingItem}
                renamingItem={renamingItem}
                onFileSelect={handleFileSelect}
                onToggleExpand={handleToggleExpand}
                onConfirmFile={handleConfirmFile}
                onCancelFile={handleCancelFile}
                onNewFile={handleClickNewFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                onCancelRename={handleCancelRename}
                onConfirmRename={handleConfirmRename}
                checkIfPathExists={checkIfPathExists}
              />
            ))}
            {addingItem?.path === '/' && (
              <AddItemInput
                isFolder={addingItem.isFolder}
                parentPath=''
                onConfirm={(fileName) => handleConfirmFile(fileName, addingItem.isFolder)}
                onCancel={handleCancelFile}
                placeholder={`Enter ${addingItem.isFolder ? 'folder' : 'file'} name...`}
                checkIfPathExists={checkIfPathExists}
              />
            )}
          </>
        )}
      </div>

      <div
        className='flex-1'
        onClick={handleDeselectFile}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleDeselectFile();
          }
        }}
        role='button'
        tabIndex={0}
        aria-label='Deselect active file'
      />

      <DeleteFileDialog
        file={fileToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
};
