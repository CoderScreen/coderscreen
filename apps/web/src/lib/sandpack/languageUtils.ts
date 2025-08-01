import { RoomSchema } from '@coderscreen/api/schema/room';

export const isLanguage = (language: RoomSchema['language']) => {
  return !isFramework(language);
};

export const isFramework = (language: RoomSchema['language']) => {
  switch (language) {
    case 'react':
      return true;
    case 'nextjs':
      return true;
    case 'svelte':
      return true;
    case 'remixjs':
      return true;
    case 'solidjs':
      return true;
    case 'vue':
      return true;
    default:
      return false;
  }
};
