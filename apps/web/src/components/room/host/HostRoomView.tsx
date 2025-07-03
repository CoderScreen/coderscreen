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
import { RoomProvider } from '@/contexts/RoomContext';
import { HostRoomHeader } from '@/components/room/host/HostRoomHeader';
import { RoomFooter } from '@/components/room/RoomFooter';

export const HostRoomView = () => {
  return (
    <RoomProvider>
      <HostRoomContent />
    </RoomProvider>
  );
};

const HostRoomContent = () => {
  return (
    <div className='h-screen w-screen flex flex-col'>
      <HostRoomHeader />
      <div className='flex-1 min-h-0'>
        <PanelGroup direction='horizontal' className='h-full'>
          <Panel>
            <CodeEditor />
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <Tabs
              defaultValue='instructions'
              className='h-full flex flex-col p-2 pt-4'
            >
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

              <TabsContent
                value='program-output'
                className='flex-1 overflow-y-auto'
              >
                <CodeOutput />
              </TabsContent>

              <TabsContent
                value='instructions'
                className='flex-1 overflow-y-auto'
              >
                <InstructionEditor />
              </TabsContent>
            </Tabs>
          </Panel>
        </PanelGroup>
      </div>
      <RoomFooter />
    </div>
  );
};
