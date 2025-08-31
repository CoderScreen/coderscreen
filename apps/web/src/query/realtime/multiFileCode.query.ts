import { indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import type { RoomSchema } from '@coderscreen/api/schema/room';
import { basicSetup, EditorView } from 'codemirror';
import { useCallback, useEffect, useRef, useState } from 'react';
import { yCollab } from 'y-codemirror.next';
import * as Y from 'yjs';
import { getWorkspaceTemplate } from '@/components/room/editor/lib/languageTemplate';
import { useRoomContext } from '@/contexts/RoomContext';
// import { cpp } from '@codemirror/lang-cpp';
// import { css } from '@codemirror/lang-css';
// import { go } from '@codemirror/lang-go';
// import { html } from '@codemirror/lang-html';
// import { java } from '@codemirror/lang-java';
// import { json } from '@codemirror/lang-json';
// import { markdown } from '@codemirror/lang-markdown';
// import { php } from '@codemirror/lang-php';
// import { python } from '@codemirror/lang-python';
// import { ruby } from '@codemirror/lang-ruby';
// import { rust } from '@codemirror/lang-rust';
// import { typescript } from '@codemirror/lang-typescript';

export interface FileNode {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'folder';
  language?: RoomSchema['language'];
  isExpanded?: boolean;
  children?: FileNode[];
}

// Helper function to get language from file path
export const getLanguageFromPath = (path: string): RoomSchema['language'] | null => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'jsx':
      return 'javascript';
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
      return 'c++';
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
    case 'sh':
      return 'bash';
    default:
      return null;
  }
};

// Helper function to create a FileNode from a path
const createFileNode = (path: string, type: 'file' | 'folder' = 'file'): FileNode => {
  const name = path.split('/').pop() || path;
  const language = type === 'file' ? getLanguageFromPath(path) || undefined : undefined;

  return {
    id: path, // Use path as id for uniqueness
    path,
    name,
    type,
    language,
    isExpanded: false,
    children: type === 'folder' ? [] : undefined,
  };
};

// Helper function to build file tree from flat paths
const buildFileTree = (paths: string[]): FileNode[] => {
  const fileMap = new Map<string, FileNode>();
  const rootNodes: FileNode[] = [];

  // Create all nodes first
  paths.forEach((path) => {
    // remove / prefix
    const parts = path.startsWith('/') ? path.split('/').slice(1) : path.split('/');
    // Handle files with folder structure
    let currentPath = '';

    // Create folder nodes for all parts except the last one
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];

      if (!fileMap.has(currentPath)) {
        const node = createFileNode(currentPath, 'folder');
        fileMap.set(currentPath, node);

        if (i === 0) {
          rootNodes.push(node);
        } else {
          const parentPath = parts.slice(0, i).join('/');
          const parent = fileMap.get(parentPath);
          if (parent?.children) {
            parent.children.push(node);
          }
        }
      }
    }

    // Create the file node (last part)
    const filePath = path;
    if (!fileMap.has(filePath)) {
      const node = createFileNode(filePath, 'file');
      fileMap.set(filePath, node);

      const parentPath = parts.slice(0, -1).join('/');
      const parent = fileMap.get(parentPath);
      if (parent?.children) {
        parent.children.push(node);
      } else if (parts.length === 1) {
        // If this is a root-level file (no parent directory), add it to rootNodes
        rootNodes.push(node);
      }
    }
  });

  // Sort function for folders first, then files, then alphabetically
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  // Sort root nodes
  sortNodes(rootNodes);

  // Sort children recursively
  const sortChildrenRecursively = (nodes: FileNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children);
        sortChildrenRecursively(node.children);
      }
    });
  };

  sortChildrenRecursively(rootNodes);

  return rootNodes;
};

export function useMultiFileCodeEditor(elementRef: React.RefObject<HTMLDivElement | null>) {
  const { provider } = useRoomContext();

  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, _setSelectedFile] = useState<string | undefined>(undefined);

  const editorViewRef = useRef<EditorView>(null);

  const getOrCreateView = useCallback(
    (initialState: EditorState) => {
      const viewRef = editorViewRef.current;
      if (viewRef) return viewRef;

      if (!elementRef.current) return;

      const view = new EditorView({
        state: initialState,
        parent: elementRef.current,
      });

      editorViewRef.current = view;
      return view;
    },
    [elementRef]
  );

  // Create or get Y.Text for a specific file
  const getOrCreateEditorState = useCallback(
    (filePath: string) => {
      const ytext = provider.doc.getText(`file:${filePath}`);
      const undoManager = new Y.UndoManager(ytext);

      const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
          basicSetup,
          yCollab(ytext, null, { undoManager }),
          keymap.of([indentWithTab]),
          javascript({
            jsx: true,
            typescript: true,
          }),
        ],
      });

      return state;
    },
    [provider]
  );

  const switchToFile = useCallback(
    (filePath: string) => {
      const state = getOrCreateEditorState(filePath);

      const view = getOrCreateView(state);
      view?.setState(state);
    },
    [getOrCreateEditorState, getOrCreateView]
  );

  // Create a new file
  const createFile = useCallback(
    (filePath: string, content?: string) => {
      const ytext = provider.doc.getText(`file:${filePath}`);
      ytext.insert(0, content ?? '');

      // Add to file map
      const fileMap = provider.doc.getMap<string>('files');
      fileMap.set(filePath, content ?? '');
    },
    [provider]
  );

  // Delete a file
  const deleteFile = useCallback(
    (filePath: string) => {
      const ytext = provider.doc.getText(`file:${filePath}`);
      ytext.delete(0, ytext.length);

      // Remove from file map
      const fileMap = provider.doc.getMap<string>('files');
      fileMap.delete(filePath);
    },
    [provider]
  );

  // Rename a file
  const renameFile = useCallback(
    (oldPath: string, newPath: string) => {
      const oldYText = provider.doc.getText(`file:${oldPath}`);
      const newYText = provider.doc.getText(`file:${newPath}`);

      // Copy content from old to new
      const content = oldYText.toString();
      newYText.insert(0, content);

      // Clear old content
      oldYText.delete(0, oldYText.length);

      // Update file map
      const fileMap = provider.doc.getMap<string>('files');
      const contentToMove = fileMap.get(oldPath);
      if (contentToMove !== undefined) {
        fileMap.set(newPath, contentToMove);
        fileMap.delete(oldPath);
      }
    },
    [provider]
  );

  const handleWorkspaceReset = useCallback(
    (language: RoomSchema['language']) => {
      // this function should go through all files and delete them.
      // then create the new files with the new language

      console.log('handleWorkspaceReset', language);

      provider.doc.transact(() => {
        const fileMap = provider.doc.getMap<string>('files');
        fileMap.forEach((_, key) => {
          deleteFile(key);
        });
        fileMap.clear();

        const template = getWorkspaceTemplate(language);

        template.forEach((file) => {
          if (file.isFolder) {
            // no-op for now for folders
            return;
          }

          createFile(file.path, file.code);
        });
      });
    },
    [createFile, deleteFile, provider.doc]
  );

  // #########################################################
  // CLEANUP FUNCTIONS
  // #########################################################

  useEffect(() => {
    // subscribe to filemap changes
    // Get files from the provider and convert to FileNode tree
    const fileMap = provider.doc.getMap<string>('files');

    fileMap.observe(() => {
      const filePaths = Array.from(fileMap.keys());
      setFiles(buildFileTree(filePaths));
    });

    return () => {
      editorViewRef.current?.destroy();
    };
  }, [provider]);

  const setSelectedFile = useCallback(
    (filePath: string) => {
      _setSelectedFile(filePath);
      switchToFile(filePath);
    },
    [switchToFile]
  );

  const focusEditor = useCallback(() => {
    editorViewRef.current?.focus();
  }, []);

  return {
    createFile,
    deleteFile,
    renameFile,
    handleWorkspaceReset,
    selectedFile,
    setSelectedFile,
    files,
    focusEditor,
    editorVisible: !!editorViewRef.current,
  };
}
