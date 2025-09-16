import { RoomSchema } from '@coderscreen/api/schema/room';
import { useEffect, useState } from 'react';
import { shouldUseSandpackOutput } from '@/components/room/editor/lib/utils';
import { SandpackOutput } from '@/components/room/output/SandpackOutput';
import { SingleFileOutput } from '@/components/room/output/SingleFileOutput';
import { useRoomContext } from '@/contexts/RoomContext';

export const CodeOutput = () => {
  const { provider } = useRoomContext();
  const [language, setLanguage] = useState<RoomSchema['language'] | undefined>(undefined);

  // Subscribe to language changes
  useEffect(() => {
    if (!provider) return;

    const subscribeToLanguageChanges = (callback: (language: RoomSchema['language']) => void) => {
      if (!provider) return () => {};

      const ymap = provider.doc.getText('language');
      const observer = () => {
        const language = ymap.toJSON();
        callback(language as RoomSchema['language']);
      };

      ymap.observe(observer);
      return () => ymap.unobserve(observer);
    };

    const unsubscribe = subscribeToLanguageChanges((newLanguage) => {
      setLanguage(newLanguage);
    });

    return unsubscribe;
  }, [provider]);

  // Show loading state while language is being determined
  if (!language) {
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
  if (shouldUseSandpackOutput(language)) {
    return <SandpackOutput />;
  }

  return <SingleFileOutput />;
};
