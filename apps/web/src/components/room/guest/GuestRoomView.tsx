import { useState, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditor } from '@/components/room/CodeEditor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  RiTerminalLine,
  RiFileTextLine,
  RiPencilLine,
  RiChatAiLine,
} from '@remixicon/react';
import { InstructionEditor } from '@/components/room/InstructionEditor';
import { CodeOutput } from '@/components/room/CodeOutput';
import { CandidateRoomHeader } from '@/components/room/guest/CandidateRoomHeader';
import { RoomProvider } from '@/contexts/RoomContext';
import { GuestStartView } from './GuestStartView';
import { Guest, getGuest, setGuest } from '@/lib/guest';
import { getRandomColor } from '@/query/realtime/utils';

export const GuestRoomView = () => {
  const [guestInfo, setGuestInfo] = useState<Guest | null>(null);

  // Load guest info from localStorage on mount
  useEffect(() => {
    if (!guestInfo) {
      const guest = getGuest();
      if (guest) {
        setGuestInfo(guest);
      }
    }
  }, [guestInfo]);

  const handleJoinAsGuest = (name: string) => {
    const newGuest = { id: name, name, color: getRandomColor(name) };
    setGuest(newGuest);
    setGuestInfo(newGuest);
  };

  // If no guest info, show the start view
  if (!guestInfo) {
    return <GuestStartView onJoinAsGuest={handleJoinAsGuest} />;
  }

  // If guest info exists, show the room content
  return (
    <RoomProvider>
      <GuestRoomContent />
    </RoomProvider>
  );
};

const GuestRoomContent = () => {
  return (
    <div className='h-screen w-screen flex flex-col'>
      <CandidateRoomHeader />
      <div className='flex-1 overflow-y-auto'>
        <PanelGroup direction='horizontal'>
          <Panel defaultSize={50}>
            <CodeEditor />
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={50}>
            <Tabs defaultValue='instructions' className='p-4 h-full w-full'>
              <TabsList>
                <TabsTrigger
                  value='instructions'
                  className='flex items-center gap-1'
                >
                  <RiFileTextLine className='size-4 shrink-0' />
                  Instructions
                </TabsTrigger>
                <TabsTrigger
                  value='program-output'
                  className='flex items-center gap-1'
                >
                  <RiTerminalLine className='size-4 shrink-0' />
                  Program Output
                </TabsTrigger>
                <TabsTrigger
                  value='whiteboard'
                  className='flex items-center gap-1'
                >
                  <RiPencilLine className='size-4 shrink-0' />
                  Whiteboard
                </TabsTrigger>
                <TabsTrigger
                  value='ai-chat'
                  className='flex items-center gap-1'
                >
                  <RiChatAiLine className='size-4 shrink-0' />
                  AI Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value='program-output' className='h-full w-full'>
                <CodeOutput />
              </TabsContent>

              <TabsContent value='instructions' className='h-full w-full'>
                <InstructionEditor isGuest />
              </TabsContent>
            </Tabs>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
