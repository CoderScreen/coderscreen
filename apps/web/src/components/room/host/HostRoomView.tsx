import { RiLockLine } from '@remixicon/react';
import { RoomProvider, useRoomContext } from '@/contexts/RoomContext';
import { HostRoomHeader } from '@/components/room/host/HostRoomHeader';
import { RoomFooter } from '@/components/room/RoomFooter';
import { DockviewReact } from 'dockview';
import { useMemo } from 'react';
import {
  DOCKVIEW_PANEL_IDS,
  lightDockviewTheme,
  useDockviewComponents,
  useTabComponents,
} from '../Dockview';

export const HostRoomView = () => {
  return (
    <RoomProvider>
      <HostRoomContent />
    </RoomProvider>
  );
};

const HostRoomContent = () => {
  const { currentStatus } = useRoomContext();

  const components = useDockviewComponents(false);
  const tabComponents = useTabComponents();

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
