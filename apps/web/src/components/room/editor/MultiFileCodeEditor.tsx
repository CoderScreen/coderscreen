'use client';

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
import { useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { EditorHeader } from '@/components/room/editor/EditorHeader';
import { useMultiFileCodeEditor } from '@/query/realtime/multiFileCode.query';
import { FileExplorer, getLanguageFromPath } from './FileExplorer';

interface MultiFileCodeEditorProps {
  className?: string;
}

export function MultiFileCodeEditor({ className }: MultiFileCodeEditorProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const { files, selectedFile, setSelectedFile, focusEditor, editorVisible, handleWorkspaceReset } =
    useMultiFileCodeEditor(elementRef);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <EditorHeader handleWorkspaceReset={handleWorkspaceReset} />

      {/* Editor and File Explorer */}
      <div className='flex-1 flex'>
        <PanelGroup direction='horizontal'>
          {/* File Explorer */}
          <Panel defaultSize={20} minSize={15} maxSize={590}>
            <FileExplorer
              files={files.map((file) => ({
                id: file,
                name: file,
                type: 'file',
                path: file,
                language: getLanguageFromPath(file),
              }))}
              selectedFile={selectedFile}
              onFileSelect={(file) => setSelectedFile(file.path)}
            />
          </Panel>

          <PanelResizeHandle />

          {/* Code Editor */}
          <Panel>
            <div
              role='button'
              tabIndex={0}
              className='h-full w-full relative'
              onClick={() => focusEditor()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  focusEditor();
                }
              }}
            >
              <div className='h-full w-full' ref={elementRef} />
              {!editorVisible && (
                <div className='absolute inset-0 bg-white/50 flex items-center justify-center text-center'>
                  <div className='text-sm text-gray-500'>
                    <p>No file selected</p>
                    <p>Please select a file to edit</p>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
