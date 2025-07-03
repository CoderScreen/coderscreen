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
import { useInstructionEditor } from '@/query/realtime/instruction.query';
import { useCodeExecutionHistory } from '@/query/realtime/execution.query';
import { GuestStartView } from './GuestStartView';
import { useCurrentRoomId } from '@/lib/params';

interface GuestRoomViewProps {
  onLogout?: () => void;
}

export const GuestRoomView = ({ onLogout }: GuestRoomViewProps) => {
  const currentRoomId = useCurrentRoomId();
  const [guestInfo, setGuestInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

  console.log('rendering GuestRoomView');

  // Load guest info from localStorage on mount
  useEffect(() => {
    if (!guestInfo) {
      const storedGuestInfo = localStorage.getItem(
        `guest-info-${currentRoomId}`
      );
      if (storedGuestInfo) {
        try {
          const parsed = JSON.parse(storedGuestInfo);
          setGuestInfo(parsed);
        } catch (error) {
          // If parsing fails, remove the invalid data
          localStorage.removeItem(`guest-info-${currentRoomId}`);
        }
      }
    }
  }, [guestInfo, currentRoomId]);

  const handleJoinAsGuest = (name: string, email: string) => {
    setGuestInfo({ name, email });
    localStorage.setItem(
      `guest-info-${currentRoomId}`,
      JSON.stringify({ name, email })
    );
  };

  const handleLogout = () => {
    setGuestInfo(null);
    if (onLogout) {
      onLogout();
    }
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
  console.log('rendering GuestRoomContent');

  // Use the shared instruction editor from RoomContext
  const instructionEditor = useInstructionEditor();

  // Use the execution history from Y.js
  const { history } = useCodeExecutionHistory();

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
                {/* <CodeOutput history={history} /> */}
              </TabsContent>

              <TabsContent value='instructions' className='h-full w-full'>
                <InstructionEditor />
              </TabsContent>
            </Tabs>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
