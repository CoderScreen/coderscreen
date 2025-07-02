import { useCallback, useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import { useRoomContext } from '@/contexts/RoomContext';
import * as Y from 'yjs';

// Shared hook for creating collaborative code editor
export function useCodeEditor() {
  const { provider } = useRoomContext();
  const bindingRef = useRef<MonacoBinding | null>(null);
  const subdocRef = useRef<Y.Doc | null>(null);

  const setupCollaboration = useCallback(
    (editorRef: editor.IStandaloneCodeEditor) => {
      if (!editorRef || !provider) return;

      // Create or get the subdoc for code
      const subdoc = provider.doc.getMap('subdocs').get('code') as Y.Doc;
      if (!subdoc) {
        const newSubdoc = new Y.Doc();
        provider.doc.getMap('subdocs').set('code', newSubdoc);
        subdocRef.current = newSubdoc;
      } else {
        subdocRef.current = subdoc;
      }

      // Get or create the Yjs text for code in the subdoc
      const ytext = subdocRef.current.getText('code');

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
