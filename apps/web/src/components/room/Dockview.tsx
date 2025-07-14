import { DockviewTheme, IDockviewPanelHeaderProps, IDockviewPanelProps } from 'dockview';
import { useCallback, useMemo } from 'react';
import { cx } from '@/lib/utils';
import {
  RiTerminalLine,
  RiFileTextLine,
  RiPencilLine,
  RiChatAiLine,
  RiCodeLine,
  RiSlideshowLine,
  RiStickyNoteLine,
} from '@remixicon/react';
import { CodeEditor } from '@/components/room/editor/CodeEditor';
import { InstructionEditor } from '@/components/room/tiptap/InstructionEditor';
import { CodeOutput } from '@/components/room/CodeOutput';
import { WhiteboardView } from '@/components/room/whiteboard/WhiteboardView';
import { AiChatView } from '@/components/room/ai-chat/AiChatView';
import { NotesEditor } from '@/components/room/tiptap/NotesEditor';

export const DOCKVIEW_PANEL_IDS = {
  CODE_EDITOR: 'code-editor',
  INSTRUCTIONS: 'instructions',
  PROGRAM_OUTPUT: 'program-output',
  WHITEBOARD: 'whiteboard',
  AI_CHAT: 'ai-chat',
  NOTES: 'notes',
  TAB: 'tab',
};

export const lightDockviewTheme: DockviewTheme = {
  name: 'light',
  className: 'dockview-theme-light',
};

// Common tab icons function
export const getTabIcon = (panelId: string) => {
  switch (panelId) {
    case DOCKVIEW_PANEL_IDS.CODE_EDITOR:
      return <RiCodeLine className='size-4' />;
    case DOCKVIEW_PANEL_IDS.INSTRUCTIONS:
      return <RiPencilLine className='size-4' />;
    case DOCKVIEW_PANEL_IDS.PROGRAM_OUTPUT:
      return <RiTerminalLine className='size-4' />;
    case DOCKVIEW_PANEL_IDS.WHITEBOARD:
      return <RiSlideshowLine className='size-4' />;
    case DOCKVIEW_PANEL_IDS.AI_CHAT:
      return <RiChatAiLine className='size-4' />;
    case DOCKVIEW_PANEL_IDS.NOTES:
      return <RiStickyNoteLine className='size-4' />;
    default:
      return null;
  }
};

// Common components mapping
export const useDockviewComponents = (isGuest: boolean) =>
  useMemo(
    () => ({
      'code-editor': (props: IDockviewPanelProps) => (
        <div className='h-full'>
          <CodeEditor />
        </div>
      ),
      instructions: (props: IDockviewPanelProps) => (
        <div className='h-full overflow-y-auto'>
          <InstructionEditor isGuest={isGuest} />
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
          <AiChatView role={isGuest ? 'guest' : 'host'} />
        </div>
      ),
      notes: (props: IDockviewPanelProps) => (
        <div className='h-full overflow-y-auto'>
          <NotesEditor />
        </div>
      ),
    }),
    [isGuest]
  );

// Common tab components
export const useTabComponents = () =>
  useMemo(
    () => ({
      tab: (props: IDockviewPanelHeaderProps) => (
        <div
          className={cx(
            'h-fit flex shrink-0 items-center gap-2 p-2 pt-1 text-sm font-medium transition-all',
            props.api.isFocused && 'border-b-2 border-primary'
          )}
        >
          {getTabIcon(props.api.id)}
          <span className='truncate'>{props.api.title}</span>
        </div>
      ),
    }),
    []
  );
