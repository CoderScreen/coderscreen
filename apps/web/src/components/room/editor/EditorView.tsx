import { isLanguageMultiFile } from '@/components/room/editor/lib/utils';
import { useRoomContext } from '@/contexts/RoomContext';
import { MultiFileCodeEditor } from './MultiFileCodeEditor';
import { SingleFileCodeEditor } from './SingleFileCodeEditor';

export const EditorView = () => {
  const { currentLanguage } = useRoomContext();

  // Show loading state while language is being determined
  if (!currentLanguage) {
    return (
      <div className='h-full w-full bg-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='relative mx-auto mb-2'>
            <div className='h-8 w-8 rounded-full border-4 border-gray-200'></div>
            <div className='absolute inset-0 h-8 w-8 animate-spin rounded-full border-4 border-transparent border-t-blue-500'></div>
          </div>
          <p className='text-sm text-gray-500'>Loading...</p>
        </div>
      </div>
    );
  }

  // Conditionally render based on language type
  if (isLanguageMultiFile(currentLanguage)) {
    return <MultiFileCodeEditor />;
  }

  return <SingleFileCodeEditor />;
};
