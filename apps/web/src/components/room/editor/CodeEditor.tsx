'use client';

import { RoomSchema } from '@coderscreen/api/schema/room';
import { Editor } from '@monaco-editor/react';
import { RiPlayFill } from '@remixicon/react';
import * as monaco from 'monaco-editor';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isLanguage } from '@/lib/sandpack/languageUtils';
import { useCodeEditor } from '@/query/realtime/code.query';
import { useCodeExecutionHistory } from '@/query/realtime/execution.query';
import { type EditorSettings, EditorSettingsDialog } from './EditorSettingsDialog';

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

interface CodeEditorProps {
  selectedFile?: string;
  onFileChange?: (filePath: string) => void;
}

export function CodeEditor({ selectedFile, onFileChange }: CodeEditorProps) {
  const {
    setupCollaboration,
    cleanupCollaboration,
    language,
    setLanguage,
    subscribeToLanguageChanges,
    isReady,
    isReadOnly,
  } = useCodeEditor();
  const { executeCode, isLoading } = useCodeExecutionHistory();
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();

  // Editor settings state
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Consolas, monospace',
    theme: 'vs',
    minimap: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    roundedSelection: false,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    padding: { top: 10, bottom: 10 },
  });

  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
  }, []);

  // Subscribe to shared language changes
  useEffect(() => {
    if (!isReady) return;

    const unsubscribe = subscribeToLanguageChanges((newLanguage) => {
      // Update Monaco editor language if editor is ready
      if (editorRef) {
        const model = editorRef.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, newLanguage);
        }
      }
    });

    return unsubscribe;
  }, [isReady, subscribeToLanguageChanges, editorRef]);

  // Setup collaboration when editor is ready
  useEffect(() => {
    if (editorRef && isReady) {
      const cleanup = setupCollaboration(editorRef);
      return cleanup;
    }
  }, [editorRef, isReady, setupCollaboration]);

  // Cleanup collaboration when component unmounts
  useEffect(() => {
    return () => {
      cleanupCollaboration();
    };
  }, [cleanupCollaboration]);

  // Update editor options when settings change
  useEffect(() => {
    if (editorRef) {
      editorRef.updateOptions({
        fontSize: editorSettings.fontSize,
        fontFamily: editorSettings.fontFamily,
        minimap: { enabled: editorSettings.minimap },
        wordWrap: editorSettings.wordWrap,
        lineNumbers: editorSettings.lineNumbers,
        folding: editorSettings.folding,
        automaticLayout: editorSettings.automaticLayout,
        scrollBeyondLastLine: editorSettings.scrollBeyondLastLine,
        roundedSelection: editorSettings.roundedSelection,
        lineDecorationsWidth: editorSettings.lineDecorationsWidth,
        lineNumbersMinChars: editorSettings.lineNumbersMinChars,
        glyphMargin: editorSettings.glyphMargin,
        padding: editorSettings.padding,
      });
    }
  }, [editorRef, editorSettings]);

  const handleRunCode = useCallback(async () => {
    if (!editorRef || !language) {
      return;
    }

    const code = editorRef.getModel()?.getValue() ?? '';
    await executeCode(code, language);
  }, [editorRef, executeCode, language]);

  const handleLanguageChange = useCallback(
    (value: RoomSchema['language']) => {
      setLanguage(value);

      if (editorRef) {
        const model = editorRef.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, value);
        }
      }
    },
    [editorRef, setLanguage]
  );

  const handleSettingsChange = useCallback((newSettings: EditorSettings) => {
    setEditorSettings(newSettings);
  }, []);

  const monacoLanguage = useMemo(() => {
    switch (language) {
      case 'c++':
        return 'cpp';
      default:
        return language;
    }
  }, [language]);

  return (
    <div className='h-full w-full bg-white text-gray-900 relative flex flex-col'>
      {/* Menu Bar */}
      <div className='flex items-center justify-between border-b p-2 py-1'>
        <div className='flex items-center gap-2'>
          <Select value={language} onValueChange={handleLanguageChange} disabled={isReadOnly}>
            <SelectTrigger className='min-w-40'>
              <SelectValue placeholder='Select a language' />
            </SelectTrigger>
            <SelectContent className='[&_[data-radix-select-viewport]]:p-0'>
              <div className='grid grid-cols-2 gap-4 p-4'>
                <div className='flex flex-col gap-2'>
                  <div className='text-sm font-medium text-gray-500 mb-2'>Languages</div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <span className='flex items-center gap-1'>
                        <LanguageIcon language={lang.value} />
                        {lang.label}
                      </span>
                    </SelectItem>
                  ))}
                </div>

                <div className='flex flex-col gap-2'>
                  <div className='text-sm font-medium text-gray-500 mb-2'>Web Frameworks</div>
                  {SUPPORTED_WEB_FRAMEWORKS.map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      <span className='flex items-center gap-1'>
                        <LanguageIcon language={framework.value} />
                        {framework.label}
                      </span>
                    </SelectItem>
                  ))}
                </div>
              </div>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <EditorSettingsDialog
            settings={editorSettings}
            onSettingsChange={handleSettingsChange}
            disabled={isReadOnly}
          />

          {language && isLanguage(language) && (
            <Button
              onClick={handleRunCode}
              isLoading={isLoading}
              icon={RiPlayFill}
              disabled={isReadOnly}
            >
              Run code
            </Button>
          )}
        </div>
      </div>

      <div className='flex flex-row h-full'>
        <Editor
          onMount={handleOnMount}
          language={monacoLanguage}
          theme={editorSettings.theme}
          className='pr-2'
          height='100%'
          width='100%'
          options={{
            minimap: { enabled: editorSettings.minimap },
            fontSize: editorSettings.fontSize,
            fontFamily: editorSettings.fontFamily,
            lineNumbers: editorSettings.lineNumbers,
            roundedSelection: editorSettings.roundedSelection,
            scrollBeyondLastLine: editorSettings.scrollBeyondLastLine,
            automaticLayout: editorSettings.automaticLayout,
            wordWrap: editorSettings.wordWrap,
            folding: editorSettings.folding,
            lineDecorationsWidth: editorSettings.lineDecorationsWidth,
            lineNumbersMinChars: editorSettings.lineNumbersMinChars,
            glyphMargin: editorSettings.glyphMargin,
            padding: editorSettings.padding,
            readOnly: isReadOnly,
          }}
        />
      </div>
    </div>
  );
}
