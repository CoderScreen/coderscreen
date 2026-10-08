import {
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource,
  completeFromList,
} from '@codemirror/autocomplete';
import { LSCore, offsetToPos } from '@valtown/codemirror-ls';
import { completions } from '@valtown/codemirror-ls/extensions';
import type * as LSP from 'vscode-languageserver-protocol';

// The server's trigger characters minus space, which would ask it for
// completions after every space.
const TRIGGER_CHARACTERS = new Set(['.', '"', "'", '`', '/', '@', '<', '#']);

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
    const triggerCharacter = TRIGGER_CHARACTERS.has(charBefore) ? charBefore : undefined;
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
      options: items.map((item) => ({
        ...completions.toCodemirrorCompletion(item, {
          hasResolveProvider,
          resolveItem: async (unresolved) =>
            (await lsp.requestWithLock('completionItem/resolve', unresolved)) ?? unresolved,
          render: renderDocs,
        }),
        boost: boosts.get(item.sortText ?? item.label),
      })),
    };
  };
