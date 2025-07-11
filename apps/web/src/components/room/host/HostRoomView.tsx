import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditor } from '@/components/room/CodeEditor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  RiTerminalLine,
  RiFileTextLine,
  RiPencilLine,
  RiChatAiLine,
  RiLockLine,
} from '@remixicon/react';
import { InstructionEditor } from '@/components/room/InstructionEditor';
import { CodeOutput } from '@/components/room/CodeOutput';
import { RoomProvider, useRoomContext } from '@/contexts/RoomContext';
import { HostRoomHeader } from '@/components/room/host/HostRoomHeader';
import { RoomFooter } from '@/components/room/RoomFooter';
import { WhiteboardView } from '@/components/room/whiteboard/WhiteboardView';
import { AiChatView } from '@/components/room/ai-chat/AiChatView';

export const HostRoomView = () => {
  return (
    <RoomProvider>
      <HostRoomContent />
    </RoomProvider>
  );
};

const HostRoomContent = () => {
  const { currentStatus } = useRoomContext();

  return (
    <div className='h-screen w-screen flex flex-col'>
      <HostRoomHeader />

      {/* Read-only banner */}
      {currentStatus === 'completed' && (
        <div className='bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-amber-800'>
          <RiLockLine className='size-4' />
          <span className='text-sm font-medium'>
            Interview ended - This room is now in read-only mode except for your notes.
          </span>
        </div>
      )}

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
                <InstructionEditor />
              </TabsContent>

              <TabsContent value='whiteboard' className='flex-1 overflow-y-auto'>
                <WhiteboardView />
              </TabsContent>

              <TabsContent value='ai-chat' className='flex-1 overflow-y-auto'>
                <AiChatView role='host' />
              </TabsContent>
            </Tabs>
          </Panel>
        </PanelGroup>
      </div>
      <RoomFooter />
    </div>
  );
};
