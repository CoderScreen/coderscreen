import { useSync } from '@tldraw/sync';
import { useMemo, useState } from 'react';
import { inlineBase64AssetStore, TLUserPreferences, Tldraw, useTldrawUser } from 'tldraw';
import { getGuest } from '@/lib/guest';
import { useCurrentRoomId } from '@/lib/params';
import { useSession } from '@/query/auth.query';
import { getRandomColor } from '@/query/realtime/utils';
import { getBookmarkPreview } from './getBookmarkPreview';
import 'tldraw/tldraw.css';

// Configure the worker URL - this should match your API endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const WhiteboardView = () => {
  const roomId = useCurrentRoomId();
  const { user: sessionUser } = useSession();

  // Get user information - either authenticated user or guest
  const userInfo = useMemo(() => {
    if (sessionUser) {
      return {
        id: sessionUser.id,
        name: sessionUser.name ?? 'Anonymous',
        color: getRandomColor(sessionUser.id),
      };
    } else {
      // Try to get guest user data
      const guest = getGuest();
      if (guest) {
        return {
          id: guest.id || `guest-${Math.random()}`,
          name: guest.name,
          color: guest.color,
        };
      }
      // Fallback for anonymous users
      return {
        id: `anonymous-${Math.random()}`,
        name: 'Anonymous',
        color: getRandomColor(),
      };
    }
  }, [sessionUser]);

  const [userPreferences, setUserPreferences] = useState<TLUserPreferences>({
    id: userInfo.id,
    name: userInfo.name,
    color: userInfo.color,
  });

  const store = useSync({
    uri: `${API_URL}/rooms/${roomId}/public/whiteboard/connect`,
    assets: inlineBase64AssetStore,
    userInfo,
  });

  const tldrawUser = useTldrawUser({ userPreferences, setUserPreferences });

  return (
    <div className='h-full w-full'>
      <Tldraw
        components={{
          PageMenu: null,
          MenuPanel: null,
        }}
        store={store}
        user={tldrawUser}
        onMount={(editor) => {
          editor.registerExternalAssetHandler('url', (info) =>
            getBookmarkPreview({
              url: info.url,
              roomId,
            })
          );
        }}
      />
    </div>
  );
};
