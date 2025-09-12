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
  addItemToParentById,
  checkPathExists,
  createFileEntry,
  createFolderEntry,
  FS_MAP_KEY,
  FSEntry,
  findItemByPath,
  generateId,
  getFileKey,
  getLanguageFromName,
  getPathFromId,
  removeItemFromParentById,
  renameItemById,
} from '@/query/realtime/multi-file/docUtils';

export interface FsNode {
  id: string; // Stable ID (e.g., "id_1234567890_abc123")
  name: string; // Display name (e.g., "Button.tsx")
  type: 'file' | 'folder';
  parentId: string | null; // Reference to parent folder ID

  // Computed properties
  path: string; // Computed full path

  // optional prop
  children?: FsNode[];
  language?: string;
  isExpanded?: boolean;
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

// Helper function to create a FsNode from an entry and ID
const createFsNode = (entry: FSEntry, id: string, fsMap: Y.Map<FSEntry>): FsNode => {
  const path = getPathFromId(fsMap, id);
  const language = entry.type === 'file' ? getLanguageFromName(entry.name) : undefined;

  return {
    id,
    name: entry.name,
    type: entry.type,
    parentId: entry.parentId,
    language,
    isExpanded: false,
    children: entry.type === 'folder' ? [] : undefined,
    path,
  };
};

// Helper function to build file tree from fs map
const buildFileTree = (fsMap: Y.Map<FSEntry>): FsNode[] => {
  const nodeMap = new Map<string, FsNode>();
  const rootNodes: FsNode[] = [];

  // First pass: Create all nodes from fs map entries
  fsMap.forEach((entry, id) => {
    const node = createFsNode(entry, id, fsMap);
    nodeMap.set(id, node);
  });

  // Second pass: Build parent-child relationships
  fsMap.forEach((entry, id) => {
    const node = nodeMap.get(id);
    if (!node) return;

    if (entry.parentId && nodeMap.has(entry.parentId)) {
      // Add to parent's children
      const parent = nodeMap.get(entry.parentId);
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
    (fileId: string) => {
      const ytext = provider.doc.getText(getFileKey(fileId));

      const undoManager = new Y.UndoManager(ytext);

      // Set up observer for text changes to increment counter
      const handleTextChange = () => {
        const counterMap = provider.doc.getMap('__fileChangeCounter');
        const currentValue = (counterMap.get('value') as number) || 0;
        counterMap.set('value', currentValue + 1);
      };

      // Observe text changes
      ytext.observe(handleTextChange);

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
    (fileId: string) => {
      const state = getOrCreateEditorState(fileId);

      const view = getOrCreateView(state);
      view?.setState(state);
    },
    [getOrCreateEditorState, getOrCreateView]
  );

  // Create a new file
  const createFile = useCallback(
    (filePath: string, content?: string) => {
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

      // Generate unique ID for the file
      const fileId = generateId();

      // Parse the path to get name and parent
      const pathParts = filePath.split('/');
      const fileName = pathParts.pop() || '';
      const parentPath = pathParts.join('/');
      const parentResult = parentPath ? findItemByPath(fsMap, parentPath) : null;
      const parentId = parentResult?.entry.type === 'folder' ? parentResult.id : null;

      // Create file entry
      const fileEntry = createFileEntry(fileName, parentId);
      fsMap.set(fileId, fileEntry);

      // Add to parent folder if it exists
      if (parentId) {
        addItemToParentById(fsMap, fileId, parentId, provider.doc);
      }

      // Create Y.Text for file content
      const ytext = provider.doc.getText(getFileKey(fileId));
      ytext.insert(0, content ?? '');
    },
    [provider]
  );

  // Delete a file
  const deleteFile = useCallback(
    (filePath: string) => {
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

      const result = findItemByPath(fsMap, filePath);
      if (!result) return;

      const { id: fileId } = result;

      // Delete Y.Text content
      const ytext = provider.doc.getText(getFileKey(fileId));
      ytext.delete(0, ytext.length);

      // Remove from fs map
      fsMap.delete(fileId);

      // Remove from parent folder
      removeItemFromParentById(fsMap, fileId, provider.doc);
    },
    [provider]
  );

  // Rename a file
  const renameFile = useCallback(
    (oldPath: string, newPath: string) => {
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

      const result = findItemByPath(fsMap, oldPath);
      if (!result) return;

      const { id: fileId } = result;

      // Parse new path to get new name
      const newName = newPath.split('/').pop() || '';

      // Update the file entry
      renameItemById(fsMap, fileId, newName, provider.doc);
    },
    [provider]
  );

  const createFolder = useCallback(
    (folderPath: string) => {
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

      // Generate unique ID for the folder
      const folderId = generateId();

      // Parse the path to get name and parent
      const pathParts = folderPath.split('/');
      const folderName = pathParts.pop() || '';
      const parentPath = pathParts.join('/');
      const parentResult = parentPath ? findItemByPath(fsMap, parentPath) : null;
      const parentId = parentResult?.entry.type === 'folder' ? parentResult.id : null;

      // Create folder entry
      const folderEntry = createFolderEntry(folderName, parentId);
      fsMap.set(folderId, folderEntry);

      // Add to parent folder if it exists
      if (parentId) {
        addItemToParentById(fsMap, folderId, parentId, provider.doc);
      }
    },
    [provider]
  );

  const deleteFolder = useCallback(
    (folderPath: string) => {
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

      const result = findItemByPath(fsMap, folderPath);
      if (!result) return;

      const { id: folderId } = result;

      // Remove from fs map
      fsMap.delete(folderId);

      // Remove from parent folder
      removeItemFromParentById(fsMap, folderId, provider.doc);
    },
    [provider]
  );

  const renameFolder = useCallback(
    (oldPath: string, newPath: string) => {
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

      const result = findItemByPath(fsMap, oldPath);
      if (!result) return;

      const { id: folderId } = result;

      // Parse new path to get new name
      const newName = newPath.split('/').pop() || '';

      // Update the folder entry
      renameItemById(fsMap, folderId, newName, provider.doc);
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
        fsMap.forEach((_, id) => {
          const entry = fsMap.get(id);
          if (entry?.type === 'file') {
            const ytext = provider.doc.getText(getFileKey(id));
            ytext.delete(0, ytext.length);
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

        // Increment counter for workspace reset
        const counterMap = provider.doc.getMap('__fileChangeCounter');
        const currentValue = (counterMap.get('value') as number) || 0;
        counterMap.set('value', currentValue + 1);
      });
    },
    [createFile, createFolder, provider.doc]
  );

  // #########################################################
  // CLEANUP FUNCTIONS
  // #########################################################

  useEffect(() => {
    // subscribe to fs map changes
    // Get files from the provider and convert to FsNode tree
    const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);

    const updateFiles = () => {
      setFiles(buildFileTree(fsMap));
    };

    fsMap.observe(updateFiles);

    return () => {
      editorViewRef.current?.destroy();
    };
  }, [provider]);

  const setSelectedFile = useCallback(
    (fileId: string) => {
      _setSelectedFile(fileId);
      switchToFile(fileId);
    },
    [switchToFile]
  );

  // Helper function to find file ID by path (for backward compatibility)
  const findFileIdByPath = useCallback(
    (filePath: string): string | null => {
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      const result = findItemByPath(fsMap, filePath);
      return result?.id || null;
    },
    [provider]
  );

  const focusEditor = useCallback(() => {
    editorViewRef.current?.focus();
  }, []);

  // Check if a path exists in the file system
  const checkIfPathExists = useCallback(
    (path: string, type: 'file' | 'folder'): boolean => {
      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      return checkPathExists(fsMap, path, type);
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
    findFileIdByPath,
    files,
    focusEditor,
    editorVisible: !!editorViewRef.current,
    checkIfPathExists,
  };
}
