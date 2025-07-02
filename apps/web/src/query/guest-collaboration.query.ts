import { RealtimeConfig } from './realtime.query';
import { useRealtimeConnection } from './collaboration.utils';
import { useInstructionEditor } from '@/query/realtime/editor.query';

// Hook for guest instruction editor collaboration
export function useGuestInstructionEditorCollaboration(config: RealtimeConfig) {
  // const { setCollaborationStatus, setConnectedUsers } = useRoomContext();

  // // Memoize the userInfo to prevent infinite rerenders
  // const userInfo = useMemo(
  //   () => ({
  //     id: Math.random().toString(36).substring(2, 9),
  //     name: guestInfo.name,
  //     color: getRandomColor(guestInfo.email),
  //   }),
  //   [guestInfo.name, guestInfo.email]
  // );

  // // Memoize the userInfo object passed to useRealtimeConnection to ensure stable reference
  // const stableUserInfo = useMemo(
  //   () => ({
  //     email: guestInfo.email,
  //     name: guestInfo.name,
  //     id: userInfo.id,
  //   }),
  //   [guestInfo.email, guestInfo.name, userInfo.id]
  // );

  const { ydoc, provider, connectionStatus, connectedUsers } =
    useRealtimeConnection(config, () => {});

  // const [isReady, setIsReady] = useState(false);

  // useEffect(() => {
  //   if (ydoc && provider) {
  //     setIsReady(true);
  //   } else {
  //     setIsReady(false);
  //   }
  // }, [ydoc, provider]);

  const editor = useInstructionEditor(ydoc, provider);

  return {
    editor,
    connectionStatus,
    connectedUsers,
    // isReady,
    ydoc,
    provider,
  };
}
