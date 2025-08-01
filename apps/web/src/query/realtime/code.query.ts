import { RoomSchema } from '@coderscreen/api/schema/room';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { useRoomContext } from '@/contexts/RoomContext';

// Shared hook for creating collaborative code editor
export function useCodeEditor() {
  const { provider, isReadOnly } = useRoomContext();
  const bindingRef = useRef<MonacoBinding | null>(null);
  const [language, setLanguage] = useState<RoomSchema['language'] | undefined>(undefined);

  const setupCollaboration = useCallback(
    (editorRef: editor.IStandaloneCodeEditor) => {
      if (!editorRef || !provider) return;

      // Get or create the Yjs text for code directly in the main doc
      const ytext = provider.doc.getText('code');

      // Attach Yjs to Monaco
      const model = editorRef.getModel();
      if (!model) return;

      const binding = new MonacoBinding(ytext, model, new Set([editorRef]), null);
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

  // Set the shared language in Yjs document
  const setSharedLanguage = useCallback(
    (language: RoomSchema['language']) => {
      if (!provider) return;

      const ytext = provider.doc.getText('language');

      provider.doc.transact(() => {
        ytext.delete(0, ytext.length);
        ytext.insert(0, language);
      });
    },
    [provider]
  );

  // Subscribe to language changes
  const subscribeToLanguageChanges = useCallback(
    (callback: (language: RoomSchema['language']) => void) => {
      if (!provider) return () => {};

      const ymap = provider.doc.getText('language');
      const observer = () => {
        const language = ymap.toJSON();
        callback(language as RoomSchema['language']);
      };

      ymap.observe(observer);
      return () => ymap.unobserve(observer);
    },
    [provider]
  );

  // Subscribe to language changes and update local state
  useEffect(() => {
    if (!provider) return;

    const unsubscribe = subscribeToLanguageChanges((newLanguage) => {
      setLanguage(newLanguage);
    });

    return unsubscribe;
  }, [provider, subscribeToLanguageChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCollaboration();
    };
  }, [cleanupCollaboration]);

  return {
    setupCollaboration,
    cleanupCollaboration,
    language,
    setLanguage: setSharedLanguage,
    subscribeToLanguageChanges,
    isReady: !!provider,
    isReadOnly,
  };
}
