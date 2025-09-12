'use client';

import {
  RiDeleteBinLine,
  RiFileAddLine,
  RiFileLine,
  RiFolderAddLine,
  RiFolderFill,
  RiFolderOpenFill,
  RiMore2Line,
} from '@remixicon/react';
import { useCallback, useState } from 'react';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { FsNode } from '@/query/realtime/multiFileCode.query';
import { AddItemInput } from './multi-file/AddItemInput';

interface FileExplorerProps {
  files: FsNode[];
  selectedFile?: string;
  onFileSelect: (file: FsNode) => void;
  onFileCreate: (path: string) => void;
  onFolderCreate: (path: string) => void;
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
  onFileSelect,
  onToggleExpand,
  onConfirmFile,
  onCancelFile,
  onNewFile,
  checkIfPathExists,
}: {
  file: FsNode;
  level?: number;
  selectedFile?: string;
  focusedFile?: FsNode | null;
  addingItem?: { path: string; isFolder: boolean } | null;
  onFileSelect: (file: FsNode) => void;
  onToggleExpand: (file: FsNode) => void;
  onConfirmFile: (fileName: string, isFolder: boolean) => void;
  onCancelFile: () => void;
  onNewFile: (file: FsNode, isFolder: boolean) => void;
  checkIfPathExists: (path: string, type: 'file' | 'folder') => boolean;
}) => {
  const isSelected = selectedFile === file.path;
  const isFocused = focusedFile?.path === file.path;

  const handleClick = useCallback(() => {
    if (file.type === 'folder') {
      onToggleExpand(file);
    } else {
      onFileSelect(file);
    }
  }, [file, onFileSelect, onToggleExpand]);

  return (
    <div>
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
          >
            <RiMore2Line className='shrink-0 h-3 w-3 cursor-pointer' />
          </DropdownMenuTrigger>
          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
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
            <DropdownMenuItem className='flex items-center gap-2 text-muted-foreground'>
              <RiDeleteBinLine className='h-3 w-3 text-red-500' />
              <span className='text-xs'>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
              onFileSelect={onFileSelect}
              onToggleExpand={onToggleExpand}
              onConfirmFile={onConfirmFile}
              onCancelFile={onCancelFile}
              onNewFile={onNewFile}
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
  checkIfPathExists,
  className,
}: FileExplorerProps) => {
  const [focusedFile, setFocusedFile] = useState<FsNode | null>(null);
  const [addingItem, setAddingItem] = useState<{
    path: string;
    isFolder: boolean;
  } | null>(null);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback(
    (file: FsNode) => {
      console.log('toggleExpand', file.path);
      setFocusedFile(file);
      if (file.type === 'folder') {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(file.path)) {
          newExpanded.delete(file.path);
        } else {
          newExpanded.add(file.path);
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

  const handleClickNewFile = useCallback(
    (file: FsNode | null, isFolder: boolean) => {
      if (!file) return;

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

  const toggleExpandedFolders = useCallback(
    (files: FsNode[]): FsNode[] => {
      return files.map((file) => ({
        ...file,
        isExpanded: expandedFolders.has(file.path),
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
        <span className='text-xs text-muted-foreground'>
          adding: {addingItem ? JSON.stringify(addingItem) : 'null'}
        </span>
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
      <div className='flex-1 overflow-y-auto py-2 px-1'>
        {processedFiles.length === 0 ? (
          <div className='px-4 py-8 text-center'>
            <div className='text-gray-400 text-sm'>No files</div>
          </div>
        ) : (
          processedFiles.map((file) => (
            <FileTreeItem
              key={file.id}
              file={file}
              selectedFile={selectedFile}
              focusedFile={focusedFile}
              addingItem={addingItem}
              onFileSelect={handleFileSelect}
              onToggleExpand={handleToggleExpand}
              onConfirmFile={handleConfirmFile}
              onCancelFile={handleCancelFile}
              onNewFile={handleClickNewFile}
              checkIfPathExists={checkIfPathExists}
            />
          ))
        )}
      </div>
    </div>
  );
};
