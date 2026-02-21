'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorHeader } from '@/components/room/editor/EditorHeader';
import { getSingleFileTemplateFileName } from '@/components/room/editor/lib/languageTemplate';
import { useRoomContext } from '@/contexts/RoomContext';
import { useMultiFileCodeEditor } from '@/query/realtime/editor.query';
import { FS_MAP_KEY, FSEntry, findFileIdByPath } from '@/query/realtime/multi-file/docUtils';

interface SingleFileCodeEditorProps {
  selectedFile?: string;
  onFileChange?: (filePath: string) => void;
}

export function SingleFileCodeEditor(_props: SingleFileCodeEditorProps) {
  const { provider, currentLanguage } = useRoomContext();
  const editorElementRef = useRef<HTMLDivElement>(null);
  const [isElementReady, setIsElementReady] = useState(false);

  const { handleWorkspaceReset, setSelectedFile } = useMultiFileCodeEditor(editorElementRef);

  const fileId = useMemo(() => {
    if (!currentLanguage) {
      return null;
    }

    const filePath = getSingleFileTemplateFileName(currentLanguage);

    const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
    const id = findFileIdByPath(fsMap, filePath);
    return id;
  }, [currentLanguage, provider.doc]);

  // Effect to track when the DOM element is ready
  useEffect(() => {
    if (editorElementRef.current) {
      // Use a small delay to ensure the element is fully rendered
      const timer = setTimeout(() => {
        setIsElementReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Effect to initialize the editor when both fileId and element are ready
  useEffect(() => {
    if (fileId && isElementReady && editorElementRef.current) {
      setSelectedFile(fileId);
    }
  }, [fileId, isElementReady, setSelectedFile]);

  return (
    <div className='h-full w-full bg-white text-gray-900 relative flex flex-col'>
      {/* Menu Bar */}
      <EditorHeader handleWorkspaceReset={handleWorkspaceReset} />

      <div className='h-full w-full' ref={editorElementRef} />
    </div>
  );
}
