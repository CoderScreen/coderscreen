import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Placeholder from '@tiptap/extension-placeholder';
import { UseEditorOptions, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useMemo } from 'react';
import useYProvider from 'y-partykit/react';
import { useCurrentRoomId } from '@/lib/params';
import { useSession } from '@/query/auth.query';
import { getRandomColor } from '@/query/realtime/utils';

const PARTY_NAME = 'private-room';
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL is not set');
}

// Shared hook for creating notes editor
export function useNotesEditor() {
  const currentRoomId = useCurrentRoomId();

  const provider = useYProvider({
    party: PARTY_NAME,
    room: currentRoomId,
    host: `${API_URL}/rooms/${currentRoomId}/connect`,
  });

  const { user } = useSession();

  const editorConfig: UseEditorOptions = useMemo(
    () => ({
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Placeholder.configure({
          placeholder: 'Write your notes here...',
        }),
        Collaboration.configure({
          document: provider.doc,
          field: 'notes',
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
