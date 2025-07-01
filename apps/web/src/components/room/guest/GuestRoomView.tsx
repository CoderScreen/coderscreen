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
import { RoomProvider, useRoomContext } from '@/contexts/RoomContext';
import { useCodeExecutionWebSocket } from '@/query/codeExecution.query';
import { useInstructionEditorCollaboration } from '@/query/realtime.query';
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

  // Save guest info to localStorage when it changes
  useEffect(() => {
    if (guestInfo) {
      localStorage.setItem(
        `guest-info-${currentRoomId}`,
        JSON.stringify(guestInfo)
      );
    } else {
      localStorage.removeItem(`guest-info-${currentRoomId}`);
    }
  }, [guestInfo, currentRoomId]);

  const handleJoinAsGuest = (name: string, email: string) => {
    setGuestInfo({ name, email });
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
      <GuestRoomContent
        guestName={guestInfo.name}
        guestEmail={guestInfo.email}
        onLogout={handleLogout}
      />
    </RoomProvider>
  );
};

interface GuestRoomContentProps {
  guestName: string;
  guestEmail: string;
  onLogout?: () => void;
}

const GuestRoomContent = ({
  guestName,
  guestEmail,
  onLogout,
}: GuestRoomContentProps) => {
  const { setCollaborationStatus, setExecutionStatus } = useRoomContext();

  // Initialize realtime connections at the top level
  const { editor: instructionEditor } = useInstructionEditorCollaboration(
    {
      documentType: 'instructions',
    },
    setCollaborationStatus
  );

  const { data: executionData } = useCodeExecutionWebSocket(setExecutionStatus);

  return (
    <div className='h-screen w-screen flex flex-col'>
      <CandidateRoomHeader onLogout={onLogout} />
      <div className='flex-1'>
        <PanelGroup direction='horizontal'>
          <Panel>
            <CodeEditor />
          </Panel>
          <PanelResizeHandle />
          <Panel>
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
                <CodeOutput data={executionData} />
              </TabsContent>

              <TabsContent value='instructions' className='h-full w-full'>
                <InstructionEditor editor={instructionEditor} />
              </TabsContent>
            </Tabs>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
