import { cx } from '@/lib/utils';

/**
 * Shared class for a TipTap editor's editable root (the element `EditorContent`
 * renders into, or `editorProps.attributes.class`). Only covers layout/focus —
 * typography and the monospace font come from the global `.tiptap` CSS in
 * `packages/ui/src/styles.css`, so every editor stays visually consistent.
 *
 * Pass `extra` for the layout bits that genuinely differ per editor (padding,
 * height, min-height).
 */
export const tiptapContentClass = (extra?: string) =>
  cx('max-w-none focus:outline-none focus:ring-0 focus:border-none', extra);
