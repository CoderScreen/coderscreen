import { useCallback, useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import { useRoomContext } from '@/contexts/RoomContext';
import * as Y from 'yjs';

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCollaboration();
    };
  }, [cleanupCollaboration]);

  return {
    setupCollaboration,
    cleanupCollaboration,
    isReady: !!provider,
  };
}
