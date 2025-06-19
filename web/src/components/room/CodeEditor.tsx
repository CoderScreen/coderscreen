'use client';

import { Button } from '@/components/ui/button';
import { RiPlayFill } from '@remixicon/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { Editor } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
];

interface CodeEditorProps {
  roomId?: string;
  websocketUrl?: string;
}

export function CodeEditor({
  roomId = 'default-room',
  websocketUrl = 'ws://localhost:8000/room',
}: CodeEditorProps) {
  const [language, setLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(false);
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
  const bindingRef = useRef<MonacoBinding>(null);
  const providerRef = useRef<WebsocketProvider>(null);

  // Set up Yjs provider and attach Monaco editor
  useEffect(() => {
    if (!editorRef) return;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('monaco');

    const provider = new WebsocketProvider(websocketUrl, roomId, ydoc);
    providerRef.current = provider;

    // Handle connection status
    provider.on('status', ({ status }: { status: string }) => {
      setIsConnected(status === 'connected');
    });

    // Attach Yjs to Monaco
    const binding = new MonacoBinding(
      ytext,
      editorRef.getModel() as editor.ITextModel,
      new Set([editorRef]),
      provider.awareness
    );
    bindingRef.current = binding;

    return () => {
      binding?.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [editorRef, roomId, websocketUrl]);

  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
  }, []);

  // Handle language change
  useEffect(() => {
    if (editorRef) {
      monaco.editor.setModelLanguage(editorRef.getModel()!, language);
    }
  }, [language, editorRef]);

  return (
    <div className='h-full w-full border rounded-lg bg-[#2D2D30] text-white overflow-hidden'>
      {/* Menu Bar */}
      <div className='flex items-center justify-between p-3 border-b border-gray-700 bg-[#1E1E1E]'>
        <div className='flex items-center gap-2'>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className='bg-[#3C3C3C] text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500'
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Connection Status */}
          <div className='flex items-center gap-2 text-sm'>
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button className='bg-green-600 hover:bg-green-700 text-white'>
            <RiPlayFill className='size-4 shrink-0' />
            Run
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        onMount={handleOnMount}
        height='100%'
        defaultLanguage={language}
        theme='vs-dark'
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          padding: { top: 10, bottom: 10 },
        }}
      />
    </div>
  );
}
