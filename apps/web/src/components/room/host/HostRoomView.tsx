import { CodeEditor } from '@/components/room/editor/CodeEditor';
import {
  RiTerminalLine,
  RiFileTextLine,
  RiPencilLine,
  RiChatAiLine,
  RiLockLine,
  RiStickyNoteLine,
  RiCodeLine,
} from '@remixicon/react';
import { InstructionEditor } from '@/components/room/tiptap/InstructionEditor';
import { CodeOutput } from '@/components/room/CodeOutput';
import { RoomProvider, useRoomContext } from '@/contexts/RoomContext';
import { HostRoomHeader } from '@/components/room/host/HostRoomHeader';
import { RoomFooter } from '@/components/room/RoomFooter';
import { WhiteboardView } from '@/components/room/whiteboard/WhiteboardView';
import { AiChatView } from '@/components/room/ai-chat/AiChatView';
import { NotesEditor } from '@/components/room/tiptap/NotesEditor';
import {
  DockviewReact,
  IDockviewPanelHeaderProps,
  IDockviewPanelProps,
  themeVisualStudio,
} from 'dockview';
import { useCallback, useMemo } from 'react';
import { DOCKVIEW_PANEL_IDS, lightDockviewTheme } from '../Dockview';
import { cx } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const HostRoomView = () => {
  return (
    <RoomProvider>
      <HostRoomContent />
    </RoomProvider>
  );
};

const HostRoomContent = () => {
  const { currentStatus } = useRoomContext();

  const components = useMemo(
    () => ({
      'code-editor': (props: IDockviewPanelProps) => (
        <div className='h-full'>
          <CodeEditor />
        </div>
      ),
      instructions: (props: IDockviewPanelProps) => (
        <div className='h-full overflow-y-auto'>
          <InstructionEditor />
        </div>
      ),
      'program-output': (props: IDockviewPanelProps) => (
        <div className='h-full overflow-y-auto'>
          <CodeOutput />
        </div>
      ),
      whiteboard: (props: IDockviewPanelProps) => (
        <div className='h-full overflow-y-auto'>
          <WhiteboardView />
        </div>
      ),
      'ai-chat': (props: IDockviewPanelProps) => (
        <div className='h-full overflow-y-auto'>
          <AiChatView role='host' />
        </div>
      ),
      notes: (props: IDockviewPanelProps) => (
        <div className='h-full overflow-y-auto'>
          <NotesEditor />
        </div>
      ),
    }),
    []
  );

  const tabIcons = useCallback((panelId: string) => {
    switch (panelId) {
      case DOCKVIEW_PANEL_IDS.CODE_EDITOR:
        return <RiCodeLine className='size-4' />;
      case DOCKVIEW_PANEL_IDS.INSTRUCTIONS:
        return <RiPencilLine className='size-4' />;
      case DOCKVIEW_PANEL_IDS.PROGRAM_OUTPUT:
        return <RiTerminalLine className='size-4' />;
      case DOCKVIEW_PANEL_IDS.WHITEBOARD:
        return <RiStickyNoteLine className='size-4' />;
      case DOCKVIEW_PANEL_IDS.AI_CHAT:
        return <RiChatAiLine className='size-4' />;
      case DOCKVIEW_PANEL_IDS.NOTES:
        return <RiStickyNoteLine className='size-4' />;
    }
  }, []);

  const tabComponents = useMemo(
    () => ({
      tab: (props: IDockviewPanelHeaderProps) => (
        <div
          className={cx(
            'h-fit flex shrink-0 items-center gap-2 p-2 pt-1 text-sm font-medium transition-all',
            props.api.isFocused && 'border-b-2 border-primary'
          )}
        >
          {tabIcons(props.api.id)}
          <span className='truncate'>{props.api.title}</span>
        </div>
      ),
    }),
    [tabIcons]
  );

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
        <DockviewReact
          theme={lightDockviewTheme}
          components={components}
          tabComponents={tabComponents}
          onReady={(event) => {
            const { api } = event;

            // Add code editor panel
            api.addPanel({
              id: DOCKVIEW_PANEL_IDS.CODE_EDITOR,
              component: 'code-editor', // Use the original component names
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

            api.addPanel({
              id: DOCKVIEW_PANEL_IDS.NOTES,
              component: 'notes',
              title: 'Notes',
              tabComponent: 'tab',
            });
          }}
        />
      </div>
      <RoomFooter />
    </div>
  );
};
