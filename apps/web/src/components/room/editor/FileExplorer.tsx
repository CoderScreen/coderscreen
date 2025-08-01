'use client';

import type { RoomSchema } from '@coderscreen/api/schema/room';
import {
  RiAddLine,
  RiFileTextLine,
  RiFolderFill,
  RiFolderOpenFill,
  RiMoreLine,
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
  files?: FileNode[];
  selectedFile?: string;
  onFileSelect?: (file: FileNode) => void;
  onFileCreate?: (path: string, type: 'file' | 'folder') => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
  className?: string;
}

// Mock data for demonstration - matches React framework template
const MOCK_FILES: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    isExpanded: true,
    children: [
      {
        id: '2',
        name: 'index.js',
        type: 'file',
        path: '/src/index.js',
        language: 'javascript',
      },
      {
        id: '3',
        name: 'App.js',
        type: 'file',
        path: '/src/App.js',
        language: 'javascript',
      },
    ],
  },
  {
    id: '4',
    name: 'public',
    type: 'folder',
    path: '/public',
    isExpanded: false,
    children: [
      {
        id: '5',
        name: 'index.html',
        type: 'file',
        path: '/public/index.html',
        language: 'javascript',
      },
    ],
  },
  {
    id: '6',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    language: 'javascript',
  },
];

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

  return <RiFileTextLine className='h-4 w-4 text-gray-400' />;
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
          'flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 rounded transition-colors w-full text-left',
          isSelected && 'bg-blue-50 text-blue-700',
          level > 0 && 'ml-4'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <FileIcon file={file} />
        <span className='truncate flex-1'>{file.name}</span>
      </button>

      {file.type === 'folder' && file.isExpanded && file.children && (
        <div>
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
  files = MOCK_FILES,
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
    <div className={cn('h-full flex flex-col bg-gray-50 border-r border-gray-200', className)}>
      {/* Header */}
      <div className='flex items-center justify-between p-3 border-b border-gray-200 bg-white'>
        <h3 className='text-sm font-medium text-gray-900'>Files</h3>
        <div className='flex items-center gap-1'>
          <Tooltip triggerAsChild content='New file'>
            <Button
              variant='ghost'
              className='h-6 w-6 p-0'
              onClick={() => onFileCreate?.('/new-file.txt', 'file')}
            >
              <RiAddLine className='h-3 w-3' />
            </Button>
          </Tooltip>
          <Tooltip triggerAsChild content='More options'>
            <Button variant='ghost' className='h-6 w-6 p-0'>
              <RiMoreLine className='h-3 w-3' />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* File Tree */}
      <div className='flex-1 overflow-y-auto p-2'>
        {processedFiles.map((file) => (
          <FileTreeItem
            key={file.id}
            file={file}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>

      {/* Footer with file count */}
      <div className='p-2 border-t border-gray-200 bg-white'>
        <div className='text-xs text-gray-500'>
          {files.length} {files.length === 1 ? 'item' : 'items'}
        </div>
      </div>
    </div>
  );
};
