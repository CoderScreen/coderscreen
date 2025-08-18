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
import { FileNode } from '@/query/realtime/multiFileCode.query';
import { AddFileInput } from './multi-file/AddFileInput';

interface FileExplorerProps {
  files: FileNode[];
  selectedFile?: string;
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (path: string, type: 'file' | 'folder') => void;
  onFileDelete: (path: string) => void;
  onFileRename: (oldPath: string, newPath: string) => void;
  className?: string;
}

const FileIcon = ({ file }: { file: FileNode }) => {
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
  addingFilePath,
  onFileSelect,
  onToggleExpand,
  onConfirmFile,
  onCancelFile,
}: {
  file: FileNode;
  level?: number;
  selectedFile?: string;
  focusedFile?: FileNode | null;
  addingFilePath?: string | null;
  onFileSelect: (file: FileNode) => void;
  onToggleExpand: (file: FileNode) => void;
  onConfirmFile: (fileName: string) => void;
  onCancelFile: () => void;
}) => {
  const isSelected = selectedFile === file.path;
  const isFocused = focusedFile?.path === file.path;

  if (file.type === 'folder') {
    console.log('folder.path', file.path, 'addingFilePath', addingFilePath);
  }

  const handleClick = useCallback(() => {
    if (file.type === 'folder') {
      onToggleExpand(file);
    } else {
      onFileSelect(file);
    }
  }, [file, onFileSelect, onToggleExpand]);

  return (
    <div>
      <button
        type='button'
        className={cn(
          'flex items-center gap-2 w-full text-left p-1 text-xs text-muted-foreground group',
          'hover:bg-white rounded relative',
          isSelected && 'text-black',
          isFocused && !addingFilePath && 'ring-2 ring-blue-500/50 ring-offset-1 z-20'
        )}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className='flex-shrink-0'>
          <FileIcon file={file} />
        </div>
        <span className='truncate flex-1 flex items-center justify-between'>
          <span>{file.name}</span>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <RiMore2Line className='h-3 w-3' />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className='flex items-center gap-2 text-muted-foreground'>
                <RiDeleteBinLine className='h-3 w-3 text-red-500' />
                <span className='text-xs'>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </button>

      {file.type === 'folder' && file.isExpanded && file.children && (
        <div className='mt-1 border-l border-gray-300 ml-2 pl-2'>
          {file.children.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              level={level + 1}
              selectedFile={selectedFile}
              focusedFile={focusedFile}
              addingFilePath={addingFilePath}
              onFileSelect={onFileSelect}
              onToggleExpand={onToggleExpand}
              onConfirmFile={onConfirmFile}
              onCancelFile={onCancelFile}
            />
          ))}

          {addingFilePath === file.path && (
            <div className='mt-1'>
              <AddFileInput
                onConfirm={onConfirmFile}
                onCancel={onCancelFile}
                placeholder='Enter file name...'
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
  className,
}: FileExplorerProps) => {
  const [focusedFile, setFocusedFile] = useState<FileNode | null>(null);
  const [addingFilePath, setAddingFilePath] = useState<string | null>(null);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback(
    (file: FileNode) => {
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
    (file: FileNode) => {
      setFocusedFile(file);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const handleClickNewFile = useCallback((file: FileNode | null) => {
    if (!file) return;

    if (file.type === 'file') {
      const dirPath = file.path.split('/').slice(0, -1).join('/');
      setAddingFilePath(dirPath);
    } else {
      setAddingFilePath(file.path);
    }
  }, []);

  const handleConfirmFile = useCallback(
    (fileName: string) => {
      if (addingFilePath !== null && onFileCreate) {
        const fullPath = addingFilePath ? `${addingFilePath}/${fileName}` : fileName;
        onFileCreate(fullPath, 'file');
      }
      setAddingFilePath(null);
    },
    [addingFilePath, onFileCreate]
  );

  const handleCancelFile = useCallback(() => {
    setAddingFilePath(null);
  }, []);

  const toggleExpandedFolders = useCallback(
    (files: FileNode[]): FileNode[] => {
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
      <div className='flex items-center justify-between p-2'>
        <h3 className='text-xs text-muted-foreground'>Files</h3>
        <span className='text-xs text-muted-foreground'>adding: {addingFilePath ?? 'null'}</span>
        <DropdownMenu>
          <DropdownMenuTrigger className='hover:bg-muted rounded-md p-1 cursor-pointer'>
            <RiMore2Line className='h-3 w-3' />
          </DropdownMenuTrigger>
          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem
              className='flex items-center gap-2 text-muted-foreground'
              onClick={() => handleClickNewFile(focusedFile)}
            >
              <RiFileAddLine className='h-3 w-3' />
              <span className='text-xs'>New File</span>
            </DropdownMenuItem>
            <DropdownMenuItem className='flex items-center gap-2 text-muted-foreground'>
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
              addingFilePath={addingFilePath}
              onFileSelect={handleFileSelect}
              onToggleExpand={handleToggleExpand}
              onConfirmFile={handleConfirmFile}
              onCancelFile={handleCancelFile}
            />
          ))
        )}
      </div>
    </div>
  );
};
