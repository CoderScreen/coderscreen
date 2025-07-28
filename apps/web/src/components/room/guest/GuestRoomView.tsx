import { DockviewReact } from 'dockview';
import { useEffect, useState } from 'react';
import { GuestRoomHeader } from '@/components/room/guest/GuestRoomHeader';
import { RoomFooter } from '@/components/room/RoomFooter';
import { RoomProvider, useRoomContext } from '@/contexts/RoomContext';
import { Guest, getGuest, setGuest } from '@/lib/guest';
import { usePublicRoom } from '@/query/publicRoom.query';
import { getRandomColor } from '@/query/realtime/utils';
import {
  DOCKVIEW_PANEL_IDS,
  lightDockviewTheme,
  useDockviewComponents,
  useTabComponents,
} from '../Dockview';
import { GuestStartView } from './GuestStartView';
import { GuestSummaryView } from './GuestSummaryView';

export const GuestRoomView = () => {
  const [guestInfo, setGuestInfo] = useState<Guest | null>(null);
  const { publicRoom, isLoading } = usePublicRoom();

  // Load guest info from localStorage on mount
  useEffect(() => {
    if (!guestInfo) {
      const guest = getGuest();
      if (guest) {
        setGuestInfo(guest);
      }
    }
  }, [guestInfo]);

  const handleJoinAsGuest = (name: string, email: string) => {
    const newGuest = { id: crypto.randomUUID(), name, color: getRandomColor(name), email };
    setGuest(newGuest);
    setGuestInfo(newGuest);
  };

  // Show loading state while room data is being fetched
  if (isLoading) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-white px-4 py-16'>
        <div className='text-center'>
          <p className='text-gray-600'>Loading room...</p>
        </div>
      </div>
    );
  }

  // If room is completed, show summary view regardless of guest info
  if (publicRoom?.status === 'completed') {
    return <GuestSummaryView />;
  }

  // If room is not active, show start view with appropriate message or If no guest info and room is active, show the start view
  if (publicRoom?.status !== 'active' || !guestInfo) {
    return <GuestStartView onJoinAsGuest={handleJoinAsGuest} />;
  }

  // If guest info exists and room is active, show the room content
  return (
    <RoomProvider>
      <GuestRoomContent />
    </RoomProvider>
  );
};

const GuestRoomContent = () => {
  const [currentView, setCurrentView] = useState<'room' | 'summary'>('room');
  const { subscribeToStatus, currentStatus } = useRoomContext();

  // Subscribe to live status changes
  useEffect(() => {
    const unsubscribe = subscribeToStatus((newStatus) => {
      console.log('Room status changed to:', newStatus);

      // Update view based on status change
      if (newStatus === 'completed') {
        setCurrentView('summary');
      } else if (newStatus === 'active') {
        setCurrentView('room');
      }
    });

    return unsubscribe;
  }, [subscribeToStatus]);

  const components = useDockviewComponents(true);
  const tabComponents = useTabComponents();

  // If status is completed, show summary view
  if (currentStatus === 'completed' || currentView === 'summary') {
    return <GuestSummaryView />;
  }

  // Show the room content
  return (
    <div className='h-screen w-screen flex flex-col'>
      <GuestRoomHeader />
      <div className='flex-1 min-h-0'>
        <DockviewReact
          theme={lightDockviewTheme}
          components={components}
          tabComponents={tabComponents}
          onReady={(event) => {
            const { api } = event;

            // Add code editor panel
            api.addPanel({
              id: DOCKVIEW_PANEL_IDS.CODE_EDITOR,
              component: 'code-editor',
              title: 'Code Editor',
              tabComponent: 'tab',
            });

            // Add other panels as tabs in a second panel
            api.addPanel({
              id: DOCKVIEW_PANEL_IDS.INSTRUCTIONS,
              component: 'instructions',
              title: 'Instructions',
              tabComponent: 'tab',
              position: {
                direction: 'right',
                referencePanel: 'code-editor',
              },
            });

            api.addPanel({
              id: DOCKVIEW_PANEL_IDS.PROGRAM_OUTPUT,
              component: 'program-output',
              title: 'Program Output',
              tabComponent: 'tab',
            });

            api.addPanel({
              id: DOCKVIEW_PANEL_IDS.WHITEBOARD,
              component: 'whiteboard',
              title: 'Whiteboard',
              tabComponent: 'tab',
            });

            api.addPanel({
              id: DOCKVIEW_PANEL_IDS.AI_CHAT,
              component: 'ai-chat',
              title: 'AI Chat',
              tabComponent: 'tab',
            });
          }}
        />
      </div>
      <RoomFooter />
    </div>
  );
};
