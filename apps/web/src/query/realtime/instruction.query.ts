import { StarterKit } from '@tiptap/starter-kit';
import { useEditor } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import Placeholder from '@tiptap/extension-placeholder';
import { useMemo, useRef, useEffect } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import * as Y from 'yjs';

// Shared hook for creating instruction editor
export function useInstructionEditor() {
  const { provider } = useRoomContext();
  const subdocRef = useRef<Y.Doc | null>(null);

  // Create or get the subdoc for instructions
  useEffect(() => {
    if (!provider) return;

    const subdoc = provider.doc.getMap('subdocs').get('instructions') as Y.Doc;
    if (!subdoc) {
      const newSubdoc = new Y.Doc();
      provider.doc.getMap('subdocs').set('instructions', newSubdoc);
      subdocRef.current = newSubdoc;
    } else {
      subdocRef.current = subdoc;
    }
  }, [provider]);

  const editorConfig = useMemo(
    () => ({
      extensions: [
        StarterKit.configure({
          history: false, // Disable history as it's handled by Yjs
        }),
        Placeholder.configure({
          placeholder: 'Write your instructions here...',
        }),
        Collaboration.configure({
          document: subdocRef.current || provider.doc,
        }),
      ],
    }),
    [provider, subdocRef.current]
  );

  return useEditor(editorConfig);
}
