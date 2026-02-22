import { RoomSchema } from '@coderscreen/api/schema/room';

/**
 * Check if a language is a multi-file language / web framework
 * @param language
 * @returns
 */
export const isLanguageMultiFile = (language: RoomSchema['language']) => {
  const singleFileLanguages = [
    'javascript',
    'typescript',
    'python',
    'rust',
    'c++',
    'c',
    'java',
    'go',
    'php',
    'ruby',
    'bash',
  ];
  return !singleFileLanguages.includes(language);
};
