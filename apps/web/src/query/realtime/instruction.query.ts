import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Placeholder from '@tiptap/extension-placeholder';
import { UseEditorOptions, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useMemo } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { getGuest } from '@/lib/guest';
import { useSession } from '@/query/auth.query';
import { getRandomColor } from '@/query/realtime/utils';

// Shared hook for creating instruction editor
export function useInstructionEditor() {
  const { provider, isReadOnly } = useRoomContext();
  const { user } = useSession();

  const editorConfig: UseEditorOptions = useMemo(() => {
    return {
      editable: !isReadOnly,
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
            id: user.id,
            name: user.name,
            email: user.email,
            color: getRandomColor(user.id),
          },
        }),
      ],
    };
  }, [provider, user, isReadOnly]) as UseEditorOptions;

  const editor = useEditor(editorConfig, [isReadOnly]);

  return editor;
}

export function useGuestInstructionEditor() {
  const { provider, isReadOnly } = useRoomContext();
  // load user data from local storage
  const user = useMemo(() => getGuest(), []);

  const editorConfig: UseEditorOptions = useMemo(() => {
    return {
      editable: !isReadOnly,
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
          user: user ?? {
            name: 'Guest',
            email: undefined,
            color: getRandomColor(),
          },
        }),
      ],
    };
  }, [provider, user, isReadOnly]);

  const editor = useEditor(editorConfig, [isReadOnly]);

  return editor;
}
