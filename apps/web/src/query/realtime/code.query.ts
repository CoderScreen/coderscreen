import { useCallback, useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import { useRoomContext } from '@/contexts/RoomContext';
import { RoomSchema } from '@coderscreen/api/schema/room';

// Shared hook for creating collaborative code editor
export function useCodeEditor() {
  const { provider } = useRoomContext();
  const bindingRef = useRef<MonacoBinding | null>(null);

  const setupCollaboration = useCallback(
    (editorRef: editor.IStandaloneCodeEditor) => {
      if (!editorRef || !provider) return;

      // Get or create the Yjs text for code directly in the main doc
      const ytext = provider.doc.getText('code');

      // Attach Yjs to Monaco
      const binding = new MonacoBinding(
        ytext,
        editorRef.getModel() as editor.ITextModel,
        new Set([editorRef]),
        provider.awareness
      );
      bindingRef.current = binding;

      return () => {
        binding?.destroy();
        bindingRef.current = null;
      };
    },
    [provider]
  );

  const cleanupCollaboration = useCallback(() => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
  }, []);

  // Get the shared language from Yjs document
  const getSharedLanguage = useCallback((): RoomSchema['language'] => {
    if (!provider) return 'javascript';
    const language = provider.doc.get('language');
    return typeof language === 'string'
      ? (language as RoomSchema['language'])
      : 'javascript';
  }, [provider]);

  // Set the shared language in Yjs document
  const setSharedLanguage = useCallback(
    (language: RoomSchema['language']) => {
      if (!provider) return;

      const ytext = provider.doc.getText('language');
      ytext.insert(0, language);
    },
    [provider]
  );

  // Subscribe to language changes
  const subscribeToLanguageChanges = useCallback(
    (callback: (language: RoomSchema['language']) => void) => {
      if (!provider) return () => {};

      const ymap = provider.doc.getMap('metadata');
      const observer = () => {
        const language = ymap.get('language');
        callback(
          typeof language === 'string'
            ? (language as RoomSchema['language'])
            : 'javascript'
        );
      };

      ymap.observe(observer);
      return () => ymap.unobserve(observer);
    },
    [provider]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCollaboration();
    };
  }, [cleanupCollaboration]);

  return {
    setupCollaboration,
    cleanupCollaboration,
    getSharedLanguage,
    setSharedLanguage,
    subscribeToLanguageChanges,
    isReady: !!provider,
  };
}
