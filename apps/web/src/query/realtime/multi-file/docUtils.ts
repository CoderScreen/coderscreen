import * as Y from 'yjs';

// HELPER METHODS FOR Yjs DOC
export const FS_MAP_KEY = 'fs';
export const getFileKey = (fileName: string) => `file:${fileName}`;

export const getParentPath = (path: string): string => {
  // remove last part of path
  const parts = path.split('/');
  parts.pop();
  return parts.join('/');
};

export interface FSEntry {
  type: 'file' | 'folder';
  children?: string[]; // For folders - array of child paths
}

// #########################################################
// UNIFIED FS MAP HELPER FUNCTIONS
// #########################################################

export const addItemToParent = (
  fsMap: Y.Map<FSEntry>,
  itemPath: string,
  _itemType: 'file' | 'folder'
) => {
  const parentPath = getParentPath(itemPath);

  if (parentPath) {
    const parentEntry = fsMap.get(parentPath);
    if (parentEntry && parentEntry.type === 'folder') {
      const children = parentEntry.children || [];
      if (!children.includes(itemPath)) {
        children.push(itemPath);
        fsMap.set(parentPath, { ...parentEntry, children });
      }
    }
  }
};

export const removeItemFromParent = (fsMap: Y.Map<FSEntry>, itemPath: string) => {
  const parentPath = getParentPath(itemPath);

  if (parentPath) {
    const parentEntry = fsMap.get(parentPath);
    if (parentEntry && parentEntry.type === 'folder') {
      const children = (parentEntry.children || []).filter((child) => child !== itemPath);
      fsMap.set(parentPath, { ...parentEntry, children });
    }
  }
};

export const renameItemInParent = (fsMap: Y.Map<FSEntry>, oldPath: string, newPath: string) => {
  const parentPath = getParentPath(oldPath);

  if (parentPath) {
    const parentEntry = fsMap.get(parentPath);
    if (parentEntry && parentEntry.type === 'folder') {
      const children = (parentEntry.children || []).map((child) =>
        child === oldPath ? newPath : child
      );
      fsMap.set(parentPath, { ...parentEntry, children });
    }
  }
};

// Helper function to get all file paths from the fs map
export const getAllFilePaths = (fsMap: Y.Map<FSEntry>): string[] => {
  const filePaths: string[] = [];

  fsMap.forEach((entry, path) => {
    if (entry.type === 'file') {
      filePaths.push(path);
    }
  });

  return filePaths;
};

// Helper function to get all folder paths from the fs map
export const getAllFolderPaths = (fsMap: Y.Map<FSEntry>): string[] => {
  const folderPaths: string[] = [];

  fsMap.forEach((entry, path) => {
    if (entry.type === 'folder') {
      folderPaths.push(path);
    }
  });

  return folderPaths;
};

// Helper function to create a file entry
export const createFileEntry = (): FSEntry => ({
  type: 'file',
});

// Helper function to create a folder entry
export const createFolderEntry = (children: string[] = []): FSEntry => ({
  type: 'folder',
  children,
});
