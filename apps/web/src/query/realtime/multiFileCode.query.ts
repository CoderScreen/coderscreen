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
import {
  addItemToParent,
  createFileEntry,
  createFolderEntry,
  FS_MAP_KEY,
  FSEntry,
  getFileKey,
  getParentPath,
  removeItemFromParent,
  renameItemInParent,
} from '@/query/realtime/multi-file/docUtils';
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

export interface FsNode {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'folder';
  language?: RoomSchema['language'];
  isExpanded?: boolean;
  children?: FsNode[];
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

// Helper function to create a FsNode from a path
const createFsNode = (path: string, type: 'file' | 'folder' = 'file'): FsNode => {
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

// Helper function to build file tree from fs map
const buildFileTree = (fsMap: Y.Map<FSEntry>): FsNode[] => {
  const nodeMap = new Map<string, FsNode>();
  const rootNodes: FsNode[] = [];

  // First pass: Create all nodes from fs map entries
  fsMap.forEach((entry, path) => {
    const node = createFsNode(path, entry.type);
    nodeMap.set(path, node);
  });

  // Second pass: Build parent-child relationships
  fsMap.forEach((_entry, path) => {
    const node = nodeMap.get(path);
    if (!node) return;

    const parentPath = getParentPath(path);

    if (parentPath && nodeMap.has(parentPath)) {
      // Add to parent's children
      const parent = nodeMap.get(parentPath);
      if (parent?.children) {
        parent.children.push(node);
      }
    } else {
      // This is a root-level node
      rootNodes.push(node);
    }
  });

  // Sort function for folders first, then files, then alphabetically
  const sortNodes = (nodes: FsNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  // Sort root nodes
  sortNodes(rootNodes);

  // Sort children recursively
  const sortChildrenRecursively = (nodes: FsNode[]) => {
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

  const [files, setFiles] = useState<FsNode[]>([]);
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
      const ytext = provider.doc.getText(getFileKey(filePath));
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
      const ytext = provider.doc.getText(getFileKey(filePath));
      ytext.insert(0, content ?? '');

      // Add to fs map (content is stored in Y.Text, not in fs map)
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      fsMap.set(filePath, createFileEntry());

      // Add to parent folder if it exists
      addItemToParent(fsMap, filePath, 'file');
    },
    [provider]
  );

  // Delete a file
  const deleteFile = useCallback(
    (filePath: string) => {
      const ytext = provider.doc.getText(getFileKey(filePath));
      ytext.delete(0, ytext.length);

      // Remove from fs map
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      fsMap.delete(filePath);

      // Remove from parent folder
      removeItemFromParent(fsMap, filePath);
    },
    [provider]
  );

  // Rename a file
  const renameFile = useCallback(
    (oldPath: string, newPath: string) => {
      const oldYText = provider.doc.getText(getFileKey(oldPath));
      const newYText = provider.doc.getText(getFileKey(newPath));

      // Copy content from old to new
      const content = oldYText.toString();
      newYText.insert(0, content);

      // Clear old content
      oldYText.delete(0, oldYText.length);

      // Update fs map
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      const entryToMove = fsMap.get(oldPath);
      if (entryToMove !== undefined) {
        fsMap.set(newPath, entryToMove);
        fsMap.delete(oldPath);

        // Update parent folder references
        renameItemInParent(fsMap, oldPath, newPath);
      }
    },
    [provider]
  );

  const createFolder = useCallback(
    (folderPath: string) => {
      // Add to fs map with empty children list
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      fsMap.set(folderPath, createFolderEntry());

      // add item to parent children list
      addItemToParent(fsMap, folderPath, 'folder');
    },
    [provider]
  );

  const deleteFolder = useCallback(
    (folderPath: string) => {
      // Remove from fs map
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      fsMap.delete(folderPath);

      // remove item from parent children list
      removeItemFromParent(fsMap, folderPath);
    },
    [provider]
  );

  const renameFolder = useCallback(
    (oldPath: string, newPath: string) => {
      // rename item in fs map
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      const entryToMove = fsMap.get(oldPath);

      if (entryToMove !== undefined) {
        fsMap.set(newPath, entryToMove);
        fsMap.delete(oldPath);

        // rename item in parent children list
        renameItemInParent(fsMap, oldPath, newPath);
      }
    },
    [provider]
  );

  const handleWorkspaceReset = useCallback(
    (language: RoomSchema['language']) => {
      // this function should go through all files and delete them.
      // then create the new files with the new language
      provider.doc.transact(() => {
        const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

        // Clear all existing entries
        fsMap.forEach((_, key) => {
          const entry = fsMap.get(key);
          if (entry?.type === 'file') {
            deleteFile(key);
          } else if (entry?.type === 'folder') {
            deleteFolder(key);
          }
        });
        fsMap.clear();

        const template = getWorkspaceTemplate(language);

        template.forEach((file) => {
          if (file.isFolder) {
            createFolder(file.path);
          } else {
            createFile(file.path, file.code);
          }
        });
      });
    },
    [createFile, createFolder, deleteFile, deleteFolder, provider.doc]
  );

  // #########################################################
  // CLEANUP FUNCTIONS
  // #########################################################

  useEffect(() => {
    // subscribe to fs map changes
    // Get files from the provider and convert to FsNode tree
    const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

    fsMap.observe(() => {
      setFiles(buildFileTree(fsMap));
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

  // Check if a path exists in the file system
  const checkIfPathExists = useCallback(
    (path: string, type: 'file' | 'folder'): boolean => {
      console.log('total-map-keys', Array.from(provider.doc.getMap<FSEntry>(FS_MAP_KEY).keys()));
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      const item = fsMap.get(path);

      console.log('checkIfPathExists', path, type, item);

      return item?.type === type;
    },
    [provider]
  );

  return {
    createFile,
    deleteFile,
    renameFile,
    createFolder,
    deleteFolder,
    renameFolder,
    handleWorkspaceReset,
    selectedFile,
    setSelectedFile,
    files,
    focusEditor,
    editorVisible: !!editorViewRef.current,
    checkIfPathExists,
  };
}
