import { RoomSchema } from '@coderscreen/api/schema/room';
import { RiFileLine, RiFolderLine } from '@remixicon/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { cn } from '@/lib/utils';
import { getLanguageFromPath } from '@/query/realtime/multiFileCode.query';

interface AddFileInputProps {
  isFolder: boolean;
  onConfirm: (fileName: string) => void;
  onCancel: () => void;
  checkIfPathExists: (fileName: string, type: 'file' | 'folder') => boolean;
  parentPath?: string;
  placeholder?: string;
  className?: string;
}

const FileIcon = ({ language }: { language: RoomSchema['language'] | null }) => {
  if (language) {
    return <LanguageIcon language={language} />;
  }

  return <RiFileLine className='h-4 w-4 text-gray-500 shrink-0' />;
};

export const AddItemInput = ({
  isFolder,
  onConfirm,
  onCancel,
  checkIfPathExists,
  parentPath = '',
  placeholder = 'Enter file name...',
  className,
}: AddFileInputProps) => {
  const [fileName, setFileName] = useState('');
  const [disabled, setDisabled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Check if path exists and update disabled state
  useEffect(() => {
    if (fileName.trim()) {
      const fullPath = parentPath ? `${parentPath}/${fileName.trim()}` : fileName.trim();
      const pathExists = checkIfPathExists(fullPath, isFolder ? 'folder' : 'file');

      setDisabled(pathExists);
    } else {
      setDisabled(false);
    }
  }, [fileName, parentPath, isFolder, checkIfPathExists]);

  // Ensure focus when component mounts
  useEffect(() => {
    if (inputRef.current) {
      // add a small delay to ensure the input is mounted
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 20);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (fileName.trim() && !disabled) {
      onConfirm(fileName.trim());
    }
  }, [fileName, onConfirm, disabled]);

  const handleCancel = useCallback(() => {
    setFileName('');
    onCancel();
  }, [onCancel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleConfirm, handleCancel]
  );

  const language = useMemo(() => {
    return getLanguageFromPath(fileName);
  }, [fileName]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 w-full text-left p-1 text-xs text-black group',
        'hover:bg-white rounded relative',
        'border border-stone-300 focus:outline-none',
        'focus-within:ring-1 focus-within:ring-primary/70 z-20',
        disabled && 'opacity-50 border-red-300 bg-red-50',
        className
      )}
    >
      {isFolder ? (
        <RiFolderLine className='h-4 w-4 text-gray-500' />
      ) : (
        <FileIcon language={language} />
      )}

      <input
        ref={inputRef}
        // biome-ignore lint/a11y/noAutofocus: needed for focus on input
        autoFocus={true}
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className='flex-1 border-none text-xs outline-none '
      />
      {disabled && <span className='text-xs text-red-500 shrink-0'>Already exists</span>}
    </div>
  );
};
