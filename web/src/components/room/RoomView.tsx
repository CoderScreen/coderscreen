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

export const RoomView = () => {
  // You can get this from URL params or props
  const roomId = 'interview-room-1';

  return (
    <div className='h-screen w-screen'>
      <PanelGroup direction='horizontal'>
        <Panel>
          <CodeEditor roomId={roomId} />
        </Panel>
        <PanelResizeHandle />
        <Panel>
          <Tabs className='p-4 h-full w-full'>
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
              <TabsTrigger value='ai-chat' className='flex items-center gap-1'>
                <RiChatAiLine className='size-4 shrink-0' />
                AI Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value='terminal' className='h-full w-full'>
              <div className='h-full w-full bg-blue-500'> </div>
            </TabsContent>

            <TabsContent value='instructions'>
              <InstructionEditor />
            </TabsContent>
          </Tabs>
        </Panel>
      </PanelGroup>
    </div>
  );
};
