import * as Y from 'yjs';
import { StarterKit } from '@tiptap/starter-kit';
import { useEditor } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import Placeholder from '@tiptap/extension-placeholder';
import { useMemo } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';

// Shared hook for creating instruction editor
export function useInstructionEditor() {
  const { provider } = useRoomContext();

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
          document: provider.doc,
        }),
      ],
    }),
    [provider]
  );

  return useEditor(editorConfig);
}
