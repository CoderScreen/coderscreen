import { RiFileLine, RiFolderLine } from '@remixicon/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { cn } from '@/lib/utils';
import { type FileType, getFileTypeFromPath } from '@/query/realtime/multiFileCode.query';

interface RenameItemInputProps {
  isFolder: boolean;
  currentName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
  checkIfPathExists: (fileName: string, type: 'file' | 'folder') => boolean;
  parentPath?: string;
  className?: string;
}

const FileIcon = ({ fileType }: { fileType: FileType | null }) => {
  if (fileType) {
    return <LanguageIcon language={fileType} />;
  }

  return <RiFileLine className='h-4 w-4 text-gray-500 shrink-0' />;
};

export const RenameItemInput = ({
  isFolder,
  currentName,
  onConfirm,
  onCancel,
  checkIfPathExists,
  parentPath,
  className,
}: RenameItemInputProps) => {
  const [newName, setNewName] = useState(currentName);
  const [disabled, setDisabled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Check if path exists and update disabled state
  useEffect(() => {
    if (newName.trim() && newName.trim() !== currentName) {
      const fullPath = `${parentPath}/${newName.trim()}`;
      const pathExists = checkIfPathExists(fullPath, isFolder ? 'folder' : 'file');

      setDisabled(pathExists);
    } else {
      setDisabled(false);
    }
  }, [newName, parentPath, isFolder, checkIfPathExists, currentName]);

  // Ensure focus when component mounts and select the name without extension
  useEffect(() => {
    if (inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        // Select the name without extension for easier editing
        const nameWithoutExt = currentName.split('.').slice(0, -1).join('.');
        if (nameWithoutExt && !isFolder) {
          inputRef.current?.setSelectionRange(0, nameWithoutExt.length);
        } else {
          inputRef.current?.select();
        }
      }, 20);

      return () => clearTimeout(timer);
    }
  }, [currentName, isFolder]);

  const handleConfirm = useCallback(() => {
    if (disabled || newName.trim() === currentName) {
      return;
    }

    if (newName.trim() && !disabled) {
      onConfirm(newName.trim());
    }
  }, [newName, onConfirm, disabled, currentName]);

  const handleCancel = useCallback(() => {
    setNewName(currentName);
    onCancel();
  }, [onCancel, currentName]);

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

  const handleBlur = useCallback(() => {
    if (newName.trim() === currentName) {
      // If no change, close without submitting
      handleCancel();
    } else {
      // If text was changed, try to submit
      handleConfirm();
    }
  }, [newName, handleCancel, handleConfirm, currentName]);

  const language = getFileTypeFromPath(newName);

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
        <FileIcon fileType={language} />
      )}

      <input
        ref={inputRef}
        // biome-ignore lint/a11y/noAutofocus: needed for focus on input
        autoFocus={true}
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className='flex-1 border-none text-xs outline-none'
      />
    </div>
  );
};
