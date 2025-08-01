'use client';

import type { RoomSchema } from '@coderscreen/api/schema/room';
import {
  RiAddLine,
  RiFileLine,
  RiFileTextLine,
  RiFolderFill,
  RiFolderOpenFill,
  RiMore2Line,
} from '@remixicon/react';
import { useCallback, useState } from 'react';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// File system types
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  language?: RoomSchema['language'];
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FileExplorerProps {
  files: FileNode[];
  selectedFile?: string;
  onFileSelect?: (file: FileNode) => void;
  onFileCreate?: (path: string, type: 'file' | 'folder') => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
  className?: string;
}

const FileIcon = ({ file }: { file: FileNode }) => {
  if (file.type === 'folder') {
    return file.isExpanded ? (
      <RiFolderOpenFill className='h-4 w-4 text-blue-500' />
    ) : (
      <RiFolderFill className='h-4 w-4 text-blue-500' />
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
  onFileSelect,
  onToggleExpand,
}: {
  file: FileNode;
  level?: number;
  selectedFile?: string;
  onFileSelect?: (file: FileNode) => void;
  onToggleExpand?: (file: FileNode) => void;
}) => {
  const isSelected = selectedFile === file.path;

  const handleClick = useCallback(() => {
    if (file.type === 'folder') {
      onToggleExpand?.(file);
    } else {
      onFileSelect?.(file);
    }
  }, [file, onFileSelect, onToggleExpand]);

  return (
    <div>
      <button
        type='button'
        className={cn(
          'flex items-center gap-2 w-full text-left p-1 text-xs text-muted-foreground group',
          'hover:bg-white rounded-md',
          isSelected && 'text-black',
          level > 0 && 'ml-2'
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
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

          <Button variant='icon' className='h-5 w-5 group-hover:flex hidden'>
            <RiMore2Line className='h-3 w-3' />
          </Button>
        </span>
      </button>

      {file.type === 'folder' && file.isExpanded && file.children && (
        <div className='mt-1'>
          {file.children.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
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
  onFileDelete,
  onFileRename,
  className,
}: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback(
    (file: FileNode) => {
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
    <div className={cn('h-full flex flex-col bg-gray-50 border-r', className)}>
      {/* Header */}
      <div className='flex items-center justify-between p-2'>
        <h3 className='text-xs text-muted-foreground'>Files</h3>
        <Button variant='icon' className='h-6 w-6 p-0 hover:bg-gray-200'>
          <RiMore2Line className='h-3 w-3' />
        </Button>
      </div>

      {/* File Tree */}
      <div className='flex-1 overflow-y-auto py-2'>
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
              onFileSelect={onFileSelect}
              onToggleExpand={handleToggleExpand}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const getLanguageFromPath = (path: string): string | null => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'jsx':
      return 'javascript';
    case 'tsx':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
      return 'c++';
    case 'c':
      return 'c';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    default:
      return null;
  }
};
