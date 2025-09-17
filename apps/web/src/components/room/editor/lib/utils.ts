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

/**
 * Check if a language should use SandpackOutput (multi-file/web frameworks)
 * @param language
 * @returns
 */
export const shouldUseSandpackOutput = (language: RoomSchema['language']) => {
  return isLanguageMultiFile(language);
};

/**
 * Check if a language should use SingleFileOutput (single-file languages)
 * @param language
 * @returns
 */
export const shouldUseSingleFileOutput = (language: RoomSchema['language']) => {
  return !isLanguageMultiFile(language);
};
