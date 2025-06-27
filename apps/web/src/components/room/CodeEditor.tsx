'use client';

import { Button } from '@/components/ui/button';
import { RiPlayFill } from '@remixicon/react';
import { useCallback, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { useRunRoomCode } from '@/query/room.query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LanguageIcon } from '@/components/common/LanguageIcon';

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
];

export function CodeEditor() {
  const [language, setLanguage] = useState('javascript');
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
  const { runRoomCode, isLoading } = useRunRoomCode();

  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
  }, []);

  const handleRunCode = useCallback(async () => {
    if (!editorRef) return;
    const code = editorRef.getModel()?.getValue() ?? '';
    runRoomCode({ code, language });
  }, [editorRef, runRoomCode, language]);

  const handleLanguageChange = useCallback(
    (value: string) => {
      setLanguage(value);

      if (editorRef) {
        monaco.editor.setModelLanguage(editorRef.getModel()!, language);
      }
    },
    [editorRef, language]
  );

  return (
    <div className='h-full w-full border bg-white text-gray-900 overflow-hidden'>
      {/* Menu Bar */}
      <div className='flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center gap-2'>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder='Select a language' />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className='flex items-center gap-1'>
                    <LanguageIcon language={lang.value as any} />
                    {lang.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            onClick={handleRunCode}
            isLoading={isLoading}
            icon={RiPlayFill}
          >
            Run code
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        onMount={handleOnMount}
        height='100%'
        defaultLanguage={language}
        theme='vs'
        className='pr-2'
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
