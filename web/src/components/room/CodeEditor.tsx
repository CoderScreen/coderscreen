import { Button } from '@/components/ui/button';
import Editor, { type OnMount } from '@monaco-editor/react';
import { RiPlayFill } from '@remixicon/react';
import { useState } from 'react';

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

export function CodeEditor() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const [editorHeight, setEditorHeight] = useState('400px');

  const handleEditorDidMount: OnMount = (editor) => {
    // Auto-resize editor based on content
    const updateHeight = () => {
      const lineCount = editor.getModel()?.getLineCount() || 1;
      const lineHeight = 20; // Default line height
      const newHeight = Math.max(
        200,
        Math.min(600, lineCount * lineHeight + 50)
      );
      setEditorHeight(`${newHeight}px`);
    };

    editor.onDidChangeModelContent(updateHeight);
    updateHeight();
  };

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
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={(value) => setCode(value || '')}
        onMount={handleEditorDidMount}
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
