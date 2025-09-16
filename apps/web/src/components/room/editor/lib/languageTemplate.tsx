import { RoomSchema } from '@coderscreen/api/schema/room';
import {
  REACT_WORKSPACE_TEMPLATE,
  SVELTE_WORKSPACE_TEMPLATE,
  VUEJS_WORKSPACE_TEMPLATE,
} from '@/components/room/editor/lib/multiFileTemplates';
import {
  BASH_SINGLE_FILE_TEMPLATE,
  C_SINGLE_FILE_TEMPLATE,
  CPP_SINGLE_FILE_TEMPLATE,
  GO_SINGLE_FILE_TEMPLATE,
  JAVA_SINGLE_FILE_TEMPLATE,
  JAVASCRIPT_SINGLE_FILE_TEMPLATE,
  PHP_SINGLE_FILE_TEMPLATE,
  PYTHON_SINGLE_FILE_TEMPLATE,
  RUBY_SINGLE_FILE_TEMPLATE,
  RUST_SINGLE_FILE_TEMPLATE,
  TYPESCRIPT_SINGLE_FILE_TEMPLATE,
} from '@/components/room/editor/lib/singleFileTemplates';

export type WorkspaceTemplate = {
  path: string;
  code: string;
  isFolder?: boolean;
}[];

export const getWorkspaceTemplate = (workspaceType: RoomSchema['language']): WorkspaceTemplate => {
  switch (workspaceType) {
    case 'react':
      return REACT_WORKSPACE_TEMPLATE;
    case 'vue':
      return VUEJS_WORKSPACE_TEMPLATE;
    case 'svelte':
      return SVELTE_WORKSPACE_TEMPLATE;
    default:
      return [];
  }
};

export const getSingleFileTemplate = (language: RoomSchema['language']): WorkspaceTemplate => {
  switch (language) {
    case 'typescript':
      return TYPESCRIPT_SINGLE_FILE_TEMPLATE;
    case 'javascript':
      return JAVASCRIPT_SINGLE_FILE_TEMPLATE;
    case 'python':
      return PYTHON_SINGLE_FILE_TEMPLATE;
    case 'bash':
      return BASH_SINGLE_FILE_TEMPLATE;
    case 'rust':
      return RUST_SINGLE_FILE_TEMPLATE;
    case 'c++':
      return CPP_SINGLE_FILE_TEMPLATE;
    case 'c':
      return C_SINGLE_FILE_TEMPLATE;
    case 'java':
      return JAVA_SINGLE_FILE_TEMPLATE;
    case 'go':
      return GO_SINGLE_FILE_TEMPLATE;
    case 'php':
      return PHP_SINGLE_FILE_TEMPLATE;
    case 'ruby':
      return RUBY_SINGLE_FILE_TEMPLATE;
    default:
      return [];
  }
};
