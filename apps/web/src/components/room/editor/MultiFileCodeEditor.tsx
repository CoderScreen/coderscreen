'use client';

import { useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { EditorHeader } from '@/components/room/editor/EditorHeader';
import { useMultiFileCodeEditor } from '@/query/realtime/multiFileCode.query';
import { FileExplorer } from './FileExplorer';

interface MultiFileCodeEditorProps {
  className?: string;
}

export function MultiFileCodeEditor({ className }: MultiFileCodeEditorProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const {
    files,
    selectedFile,
    setSelectedFile,
    focusEditor,
    editorVisible,
    handleWorkspaceReset,
    createFile,
    createFolder,
    checkIfPathExists,
  } = useMultiFileCodeEditor(elementRef);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <EditorHeader handleWorkspaceReset={handleWorkspaceReset} />

      {/* Editor and File Explorer */}
      <div className='flex-1 flex'>
        <PanelGroup direction='horizontal'>
          {/* File Explorer */}
          <Panel defaultSize={20} minSize={15} maxSize={590}>
            <FileExplorer
              files={files}
              selectedFile={selectedFile}
              onFileSelect={(file) => setSelectedFile(file.path)}
              onFileCreate={createFile}
              onFolderCreate={createFolder}
              checkIfPathExists={checkIfPathExists}
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
