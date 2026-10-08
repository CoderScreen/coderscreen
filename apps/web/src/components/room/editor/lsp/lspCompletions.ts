import {
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource,
  completeFromList,
  insertCompletionText,
  snippet,
} from '@codemirror/autocomplete';
import type { EditorState } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { LSCore, offsetToPos, posToOffset } from '@valtown/codemirror-ls';
import { completions } from '@valtown/codemirror-ls/extensions';
import type * as LSP from 'vscode-languageserver-protocol';
import { lspSnippetToTemplate } from './lspSnippet';

const INSERT_TEXT_FORMAT_SNIPPET = 2;

const getLspPlugin = (context: CompletionContext) => {
  if (!context.view) return null;
  try {
    return LSCore.ofOrThrow(context.view);
  } catch {
    return null;
  }
};

/**
 * The editor's built-in completions for the language (keywords, snippets,
 * names in scope). Used whenever the language server can't answer, so the
 * editor never does worse than it did without one.
 */
const completeFromLanguage = async (
  context: CompletionContext
): Promise<CompletionResult | null> => {
  const sources = context.state
    .languageDataAt<CompletionSource | readonly (string | Completion)[]>(
      'autocomplete',
      context.pos
    )
    .map((source) => (typeof source === 'function' ? source : completeFromList(source)));
  const results = (await Promise.all(sources.map((source) => source(context)))).filter(
    (result): result is CompletionResult => result !== null
  );
  if (results.length === 0) return null;

  // One result is all an override source can return. The language's sources
  // all complete the word before the cursor, so merge those that agree.
  const [first] = results;
  return {
    from: first.from,
    options: results.filter((result) => result.from === first.from).flatMap((r) => r.options),
  };
};

/**
 * Ranks completions the way the server does: items sharing a `sortText` form
 * a group (TypeScript puts locals before globals, for example), and earlier
 * groups get a higher boost. CodeMirror still filters and orders by how well
 * each label matches what's typed.
 */
const boostsBySortText = (items: LSP.CompletionItem[]) => {
  const groups = [...new Set(items.map((item) => item.sortText ?? item.label))].sort();
  return new Map(groups.map((group, index) => [group, -Math.min(index, 99)]));
};

const toOffset = (state: EditorState, position: LSP.Position, fallback: number) =>
  posToOffset(state.doc, position) ?? fallback;

/**
 * Inserts a completion the way the server describes it. Replaces the one in
 * @valtown/codemirror-ls, which inserts snippet placeholders like `${1:k}`
 * literally when they come in a text edit (rust-analyzer, gopls and clangd
 * all send them that way).
 *
 * `getItem` returns the item with whatever `completionItem/resolve` has added
 * so far, which can include edits elsewhere in the file such as imports.
 */
const applyCompletion =
  (getItem: () => LSP.CompletionItem) =>
  (view: EditorView, completion: Completion, from: number, to: number) => {
    const item = getItem();
    let text = item.insertText ?? item.label;
    let start = from;
    let end = to;
    if (item.textEdit) {
      const range = 'range' in item.textEdit ? item.textEdit.range : item.textEdit.replace;
      text = item.textEdit.newText;
      start = toOffset(view.state, range.start, from);
      // The range was worked out when the completions were requested. If
      // more has been typed since, replace that too.
      end = Math.max(toOffset(view.state, range.end, to), to);
    }

    // Edits elsewhere in the file, mostly imports. They never overlap the
    // completion, so apply them first and shift the completion to match.
    const extraEdits = item.additionalTextEdits ?? [];
    if (extraEdits.length > 0) {
      const changes = view.state.changes(
        extraEdits.map(({ range, newText }) => {
          const editFrom = toOffset(view.state, range.start, 0);
          return { from: editFrom, to: toOffset(view.state, range.end, editFrom), insert: newText };
        })
      );
      view.dispatch({ changes });
      start = changes.mapPos(start, 1);
      end = changes.mapPos(end, 1);
    }

    if (item.insertTextFormat === INSERT_TEXT_FORMAT_SNIPPET) {
      snippet(lspSnippetToTemplate(text))(view, completion, start, end);
    } else {
      view.dispatch(insertCompletionText(view.state, text, start, end));
    }
  };

/**
 * Completion source for editors connected to a language server, with the
 * language's built-in completions as a fallback. Replaces the one in
 * @valtown/codemirror-ls, which returns nothing while the server is
 * unavailable and turns off CodeMirror's filtering.
 */
export const lspCompletionSource =
  (renderDocs: completions.CompletionRenderer): CompletionSource =>
  async (context) => {
    const lsp = getLspPlugin(context);
    const capabilities = lsp?.client.ready ? lsp.client.capabilities : null;
    if (!lsp || !capabilities?.completionProvider) return completeFromLanguage(context);

    const word = context.matchBefore(/[\w$]+/);
    const charBefore = context.state.sliceDoc(context.pos - 1, context.pos);
    // Whitespace triggers (jdtls has one) would ask for completions after every space.
    const triggerCharacter =
      charBefore.trim() && capabilities.completionProvider.triggerCharacters?.includes(charBefore)
        ? charBefore
        : undefined;
    if (!word && !triggerCharacter && !context.explicit) return null;

    let response: LSP.CompletionList | LSP.CompletionItem[] | null;
    try {
      response = await lsp.requestWithLock('textDocument/completion', {
        textDocument: { uri: lsp.documentUri },
        position: offsetToPos(context.state.doc, context.pos),
        // 2 = typed a trigger character, 1 = invoked (typing a word or Ctrl+Space).
        context: triggerCharacter ? { triggerKind: 2, triggerCharacter } : { triggerKind: 1 },
      });
    } catch {
      response = null;
    }
    // Disconnected mid-request or the server had nothing: use the language's own completions.
    if (!response) return completeFromLanguage(context);

    const items = Array.isArray(response) ? response : response.items;
    const boosts = boostsBySortText(items);
    const hasResolveProvider = capabilities.completionProvider.resolveProvider ?? false;

    return {
      from: word?.from ?? context.pos,
      options: items.map((item) => {
        // Resolved when the docs panel shows the item, which can add imports to apply.
        let resolvedItem = item;
        return {
          ...completions.toCodemirrorCompletion(item, {
            hasResolveProvider,
            resolveItem: async (unresolved) => {
              resolvedItem =
                (await lsp.requestWithLock('completionItem/resolve', unresolved)) ?? unresolved;
              return resolvedItem;
            },
            render: renderDocs,
          }),
          apply: applyCompletion(() => resolvedItem),
          boost: boosts.get(item.sortText ?? item.label),
        };
      }),
    };
  };
