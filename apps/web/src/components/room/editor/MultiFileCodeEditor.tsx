'use client';

import { EditorState } from '@codemirror/state';
// import { cpp } from '@codemirror/lang-cpp';
// import { css } from '@codemirror/lang-css';
// import { go } from '@codemirror/lang-go';
// import { html } from '@codemirror/lang-html';
// import { java } from '@codemirror/lang-java';
// import { javascript } from '@codemirror/lang-javascript';
// import { json } from '@codemirror/lang-json';
// import { markdown } from '@codemirror/lang-markdown';
// import { php } from '@codemirror/lang-php';
// import { python } from '@codemirror/lang-python';
// import { ruby } from '@codemirror/lang-ruby';
// import { rust } from '@codemirror/lang-rust';
// import { typescript } from '@codemirror/lang-typescript';
import { RoomSchema } from '@coderscreen/api/schema/room';
import { basicSetup, EditorView } from 'codemirror';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { yCollab } from 'y-codemirror.next';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { useCodeExecutionHistory } from '@/query/realtime/execution.query';
import { useMultiFileCodeEditor } from '@/query/realtime/multiFileCode.query';
import { type EditorSettings, EditorSettingsDialog } from './EditorSettingsDialog';
import { FileExplorer } from './FileExplorer';

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'c++', label: 'C++' },
  { value: 'bash', label: 'Bash' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
] satisfies {
  value: RoomSchema['language'];
  label: string;
}[];

const SUPPORTED_WEB_FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'remixjs', label: 'Remix.js' },
  { value: 'solidjs', label: 'Solid.js' },
] satisfies {
  value: RoomSchema['language'];
  label: string;
}[];

interface MultiFileCodeEditorProps {
  className?: string;
}

export function MultiFileCodeEditor({ className }: MultiFileCodeEditorProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const { files, selectedFile, setSelectedFile, focusEditor } = useMultiFileCodeEditor(elementRef);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between p-3 border-b border-gray-200 bg-white'>
        <div className='flex items-center gap-4'>
          <h2 className='text-lg font-semibold text-gray-900'>Multi-File Editor</h2>
        </div>
      </div>

      <div className='p-3 border-b border-gray-200 bg-white'>
        <div className='text-sm text-gray-600'>Selected file: {selectedFile}</div>
      </div>

      {/* Editor and File Explorer */}
      <div className='flex-1 flex'>
        <PanelGroup direction='horizontal'>
          {/* File Explorer */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <FileExplorer
              files={files.map((file) => ({
                id: file,
                name: file,
                type: 'file',
                path: file,
              }))}
              selectedFile={selectedFile}
              onFileSelect={(file) => setSelectedFile(file.path)}
            />
          </Panel>

          <PanelResizeHandle />

          {/* Code Editor */}
          <Panel>
            <div className='h-full' onClick={() => focusEditor()}>
              <div className='h-full w-full' ref={elementRef} />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

// Helper function to determine language from file path
function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'c':
      return 'c';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'swift':
      return 'swift';
    case 'kt':
      return 'kotlin';
    case 'scala':
      return 'scala';
    case 'r':
      return 'r';
    case 'sql':
      return 'sql';
    case 'md':
      return 'markdown';
    case 'xml':
      return 'xml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    default:
      return 'plaintext';
  }
}
