import type { MDXComponents } from 'mdx/types';
import { useMDXComponents as getComponents } from './components/blog/MDXComponents';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getComponents(components);
}
