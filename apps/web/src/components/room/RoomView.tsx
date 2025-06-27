import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditor } from './CodeEditor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  RiTerminalLine,
  RiFileTextLine,
  RiPencilLine,
  RiChatAiLine,
} from '@remixicon/react';
import { InstructionEditor } from '@/components/room/InstructionEditor';
import { CodeOutput } from '@/components/room/CodeOutput';
import { HostRoomHeader } from './host/HostRoomHeader';
import { RoomProvider, useRoomContext } from '@/contexts/RoomContext';
import { useCodeExecutionWebSocket } from '@/query/codeExecution.query';
import { useInstructionEditorCollaboration } from '@/query/realtime.query';

export const RoomView = () => {
  // You can get this from URL params or props
  const roomId = 'test';

  const handleEndInterview = () => {
    // Handle ending the interview
    console.log('Ending interview...');
  };

  const handleResetRoom = () => {
    // Handle resetting the room
    console.log('Resetting room...');
  };

  const handleUpdateRoomTitle = (title: string) => {
    // Handle updating room title
    console.log('Updating room title to:', title);
  };

  return (
    <RoomProvider>
      <RoomContent
        roomId={roomId}
        onEndInterview={handleEndInterview}
        onResetRoom={handleResetRoom}
        onUpdateRoomTitle={handleUpdateRoomTitle}
      />
    </RoomProvider>
  );
};

interface RoomContentProps {
  roomId: string;
  onEndInterview: () => void;
  onResetRoom: () => void;
  onUpdateRoomTitle: (title: string) => void;
}

const RoomContent = ({
  roomId,
  onEndInterview,
  onResetRoom,
  onUpdateRoomTitle,
}: RoomContentProps) => {
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
      <HostRoomHeader
        roomId={roomId}
        roomTitle='Frontend Interview - React'
        onEndInterview={onEndInterview}
        onResetRoom={onResetRoom}
        onUpdateRoomTitle={onUpdateRoomTitle}
      />
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
