import { StarterKit } from '@tiptap/starter-kit';
import { useEditor } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import Placeholder from '@tiptap/extension-placeholder';
import { useMemo } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useSession } from '@/query/auth.query';
import { getRandomColor } from '@/query/realtime/utils';

// Shared hook for creating instruction editor
export function useInstructionEditor() {
  const { provider } = useRoomContext();
  const { user } = useSession();

  const editorConfig = useMemo(
    () => ({
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Placeholder.configure({
          placeholder: 'Write your instructions here...',
        }),
        Collaboration.configure({
          document: provider.doc,
          field: 'instructions',
        }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: user?.name ?? 'Anonymous',
            color: getRandomColor(user?.id),
          },
        }),
      ],
    }),
    [provider, user]
  );

  return useEditor(editorConfig);
}
