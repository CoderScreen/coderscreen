import { StarterKit } from '@tiptap/starter-kit';
import { useEditor } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import Placeholder from '@tiptap/extension-placeholder';
import { useMemo } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useSession } from '@/query/auth.query';
import { getRandomColor } from '@/query/realtime/utils';
import { getGuest } from '@/lib/guest';

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

export function useGuestInstructionEditor() {
  const { provider } = useRoomContext();
  // load user data from local storage
  const user = useMemo(() => getGuest(), []);

  console.log('guest-user', user);

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
          user,
        }),
      ],
    }),
    [provider, user]
  );

  return useEditor(editorConfig);
}
