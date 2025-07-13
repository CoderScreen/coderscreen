import { useState, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditor } from '@/components/room/editor/CodeEditor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RiTerminalLine, RiFileTextLine, RiPencilLine, RiChatAiLine } from '@remixicon/react';
import { GuestRoomHeader } from '@/components/room/guest/GuestRoomHeader';
import { RoomProvider, useRoomContext } from '@/contexts/RoomContext';
import { GuestStartView } from './GuestStartView';
import { GuestSummaryView } from './GuestSummaryView';
import { Guest, getGuest, setGuest } from '@/lib/guest';
import { getRandomColor } from '@/query/realtime/utils';
import { RoomFooter } from '@/components/room/RoomFooter';
import { InstructionEditor } from '@/components/room/InstructionEditor';
import { CodeOutput } from '@/components/room/CodeOutput';
import { WhiteboardView } from '@/components/room/whiteboard/WhiteboardView';
import { usePublicRoom } from '@/query/publicRoom.query';
import { AiChatView } from '@/components/room/ai-chat/AiChatView';

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

  // If status is completed, show summary view
  if (currentStatus === 'completed' || currentView === 'summary') {
    return <GuestSummaryView />;
  }

  // Show the room content
  return (
    <div className='h-screen w-screen flex flex-col'>
      <GuestRoomHeader />
      <div className='flex-1 min-h-0'>
        <PanelGroup direction='horizontal' className='h-full'>
          <Panel>
            <CodeEditor />
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <Tabs defaultValue='instructions' className='h-full flex flex-col p-2 pt-4'>
              <TabsList>
                <TabsTrigger value='instructions' className='flex items-center gap-1'>
                  <RiFileTextLine className='size-4 shrink-0' />
                  Instructions
                </TabsTrigger>
                <TabsTrigger value='program-output' className='flex items-center gap-1'>
                  <RiTerminalLine className='size-4 shrink-0' />
                  Program Output
                </TabsTrigger>
                <TabsTrigger value='whiteboard' className='flex items-center gap-1'>
                  <RiPencilLine className='size-4 shrink-0' />
                  Whiteboard
                </TabsTrigger>
                <TabsTrigger value='ai-chat' className='flex items-center gap-1'>
                  <RiChatAiLine className='size-4 shrink-0' />
                  AI Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value='program-output' className='flex-1 overflow-y-auto'>
                <CodeOutput />
              </TabsContent>

              <TabsContent value='instructions' className='flex-1 overflow-y-auto'>
                <InstructionEditor isGuest />
              </TabsContent>

              <TabsContent value='whiteboard' className='flex-1 overflow-y-auto'>
                <WhiteboardView />
              </TabsContent>

              <TabsContent value='ai-chat' className='flex-1 overflow-y-auto'>
                <AiChatView role='guest' />
              </TabsContent>
            </Tabs>
          </Panel>
        </PanelGroup>
      </div>
      <RoomFooter />
    </div>
  );
};
