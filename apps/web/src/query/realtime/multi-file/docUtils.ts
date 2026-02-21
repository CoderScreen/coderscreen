import * as Y from 'yjs';

// HELPER METHODS FOR Yjs DOC
export const FS_MAP_KEY = 'fs';
export const getFileKey = (fileId: string) => `file:${fileId}`;

export const FILE_CHANGE_COUNTER_KEY = '__fileChangeCounter';

// Utility function to increment the file change counter
export const incrementFileChangeCounter = (doc: Y.Doc) => {
  const counterMap = doc.getMap(FILE_CHANGE_COUNTER_KEY);
  const currentValue = (counterMap.get('value') as number) || 0;
  counterMap.set('value', currentValue + 1);
};

// Generate a unique ID for files and folders
export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export interface FSEntry {
  type: 'file' | 'folder';
  name: string;
  parentId: string | null;
  children?: string[];
}

// #########################################################
// NEW ID-BASED FS MAP HELPER FUNCTIONS
// #########################################################

// Get the path for an item by traversing up the tree
export const getPathFromId = (fsMap: Y.Map<FSEntry>, itemId: string): string => {
  const entry = fsMap.get(itemId);
  if (!entry) return '';

  if (!entry.parentId) {
    return entry.name;
  }

  const parentPath = getPathFromId(fsMap, entry.parentId);
  return parentPath ? `${parentPath}/${entry.name}` : entry.name;
};

// Find an item by path by traversing the tree
export const findItemByPath = (
  fsMap: Y.Map<FSEntry>,
  path: string
): { id: string; entry: FSEntry } | null => {
  if (!path) return null;

  const pathParts = path.split('/').filter((part) => part.length > 0);
  if (pathParts.length === 0) return null;

  // Find root items (items with no parent)
  const rootItems: string[] = [];
  fsMap.forEach((entry, id) => {
    if (!entry.parentId) {
      rootItems.push(id);
    }
  });

  // Walk down the tree following the path
  let currentId: string | null = null;
  let currentEntry: FSEntry | null = null;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];

    if (i === 0) {
      // Look for root item
      for (const rootId of rootItems) {
        const entry = fsMap.get(rootId);
        if (entry && entry.name === part) {
          currentId = rootId;
          currentEntry = entry;
          break;
        }
      }
    } else {
      // Look for child item
      if (!currentEntry || currentEntry.type !== 'folder' || !currentEntry.children) {
        return null;
      }

      let found = false;
      for (const childId of currentEntry.children) {
        const childEntry = fsMap.get(childId);
        if (childEntry && childEntry.name === part) {
          currentId = childId;
          currentEntry = childEntry;
          found = true;
          break;
        }
      }

      if (!found) {
        return null;
      }
    }
  }

  return currentId && currentEntry ? { id: currentId, entry: currentEntry } : null;
};

// Check if a path exists and matches the expected type
export const checkPathExists = (
  fsMap: Y.Map<FSEntry>,
  path: string,
  type: 'file' | 'folder'
): boolean => {
  const result = findItemByPath(fsMap, path);
  return result?.entry.type === type;
};

// Add an item to its parent's children list
export const addItemToParentById = (
  fsMap: Y.Map<FSEntry>,
  itemId: string,
  parentId: string | null,
  doc: Y.Doc
) => {
  if (!parentId) return; // Root item, no parent to update

  const parentEntry = fsMap.get(parentId);
  if (parentEntry && parentEntry.type === 'folder') {
    const children = parentEntry.children || [];
    if (!children.includes(itemId)) {
      children.push(itemId);
      fsMap.set(parentId, { ...parentEntry, children });
      incrementFileChangeCounter(doc);
    }
  }
};

// Remove an item from its parent's children list
export const removeItemFromParentById = (fsMap: Y.Map<FSEntry>, itemId: string, doc: Y.Doc) => {
  const entry = fsMap.get(itemId);
  if (!entry?.parentId) {
    return; // Root item, no parent to update
  }

  const parentEntry = fsMap.get(entry.parentId);
  if (parentEntry && parentEntry.type === 'folder') {
    const children = (parentEntry.children || []).filter((child) => child !== itemId);
    fsMap.set(entry.parentId, { ...parentEntry, children });
    incrementFileChangeCounter(doc);
  }
};

// Rename an item (only updates the item itself)
export const renameItemById = (
  fsMap: Y.Map<FSEntry>,
  itemId: string,
  newName: string,
  doc: Y.Doc
) => {
  const entry = fsMap.get(itemId);
  if (!entry) return;

  // Update the entry with new name
  fsMap.set(itemId, { ...entry, name: newName });
  incrementFileChangeCounter(doc);
};

// Get all children of a folder recursively
export const getAllChildrenIds = (fsMap: Y.Map<FSEntry>, folderId: string): string[] => {
  const entry = fsMap.get(folderId);
  if (!entry || entry.type !== 'folder' || !entry.children) return [];

  const allChildren: string[] = [];

  for (const childId of entry.children) {
    allChildren.push(childId);
    // Recursively get children of this child
    allChildren.push(...getAllChildrenIds(fsMap, childId));
  }

  return allChildren;
};

// Helper function to get all file IDs from the fs map
export const getAllFileIds = (fsMap: Y.Map<FSEntry>): string[] => {
  const fileIds: string[] = [];

  fsMap.forEach((entry, id) => {
    if (entry.type === 'file') {
      fileIds.push(id);
    }
  });

  return fileIds;
};

// Helper function to get all folder IDs from the fs map
export const getAllFolderIds = (fsMap: Y.Map<FSEntry>): string[] => {
  const folderIds: string[] = [];

  fsMap.forEach((entry, id) => {
    if (entry.type === 'folder') {
      folderIds.push(id);
    }
  });

  return folderIds;
};

// Helper function to create a file entry
export const createFileEntry = (name: string, parentId: string | null): FSEntry => ({
  type: 'file',
  name,
  parentId,
});

// Helper function to create a folder entry
export const createFolderEntry = (
  name: string,
  parentId: string | null,
  children: string[] = []
): FSEntry => ({
  type: 'folder',
  name,
  parentId,
  children,
});

// Find a file ID by its path (convenience wrapper over findItemByPath)
export const findFileIdByPath = (fsMap: Y.Map<FSEntry>, path: string): string | null => {
  const result = findItemByPath(fsMap, path);
  return result ? result.id : null;
};

// Helper function to get language from file name
export const getLanguageFromName = (name: string): string | undefined => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
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
      return undefined;
  }
};
