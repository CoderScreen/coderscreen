import { autocompletion } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { languageServerWithClient } from '@valtown/codemirror-ls';
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { type LspContents, LspDocs, LspSignature } from './LspDocs';
import type { LspSession } from './LspSession';
import { lspCompletionSource } from './lspCompletions';

// Render synchronously so the content is in place before CodeMirror measures
// and positions the tooltip.
const renderInto = (dom: HTMLElement, node: ReactNode) => {
  flushSync(() => createRoot(dom).render(node));
};

const renderDocs = async (dom: HTMLElement, contents: LspContents) => {
  renderInto(dom, <LspDocs contents={contents} />);
};

/**
 * Autocomplete, hover docs and signature help from the room's language
 * server, for one file. `path` is relative to the workspace, e.g. `main.ts`.
 */
export const lspExtensions = (
  session: LspSession,
  { path, languageId }: { path: string; languageId: string }
): Extension => [
  languageServerWithClient({
    client: session.client,
    documentUri: `file:///workspace/${path}`,
    languageId,
    features: {
      hovers: { render: renderDocs },
      signatureHelp: {
        render: async (dom, help, activeSignature, activeParameter) => {
          renderInto(
            dom,
            <LspSignature
              help={help}
              activeSignature={activeSignature}
              activeParameter={activeParameter}
            />
          );
        },
      },
      // Completions come from lspCompletionSource below, which falls back to
      // the editor's built-in ones when the server is unavailable.
      completion: { disabled: true },
      // Just completions, hover and signature help: no error squiggles,
      // inlay hints, rename or go-to-definition.
      linting: { disabled: true },
      inlayHints: { disabled: true },
      renames: { disabled: true },
      references: { disabled: true },
      contextMenu: { disabled: true },
      window: { disabled: true },
    },
  }),
  autocompletion({ override: [lspCompletionSource(renderDocs)] }),
  // Connect as soon as someone clicks into the editor, so suggestions are
  // ready by the time they type.
  EditorView.domEventHandlers({
    focus: () => {
      session.activate();
      return false;
    },
  }),
];
