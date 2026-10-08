/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: these strings are snippet syntax, not templates */
type SnippetNode =
  | { type: 'text'; text: string }
  | { type: 'tabstop'; index: number; children: SnippetNode[] }
  | { type: 'variable'; name: string; children: SnippetNode[] | null };

const DIGITS = /^\d+/;
const VARIABLE_NAME = /^[_a-zA-Z][_a-zA-Z0-9]*/;

/**
 * Parses LSP snippet syntax: `$1`, `${1}`, `${1:placeholder}` (placeholders
 * can nest), `${1|one,two|}`, `$name`, `${name:default}`, and backslash
 * escapes. https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#snippet_syntax
 */
const parse = (snippet: string) => {
  let pos = 0;

  const parseUntil = (closing: string | null): SnippetNode[] => {
    const nodes: SnippetNode[] = [];
    let text = '';
    const flush = () => {
      if (text) nodes.push({ type: 'text', text });
      text = '';
    };

    while (pos < snippet.length) {
      const char = snippet[pos];
      if (char === closing) break;

      if (char === '\\' && '$}\\'.includes(snippet[pos + 1] ?? '')) {
        text += snippet[pos + 1];
        pos += 2;
        continue;
      }
      if (char !== '$') {
        text += char;
        pos += 1;
        continue;
      }

      const rest = snippet.slice(pos + 1);
      const digits = DIGITS.exec(rest)?.[0];
      const name = VARIABLE_NAME.exec(rest)?.[0];
      if (digits) {
        flush();
        nodes.push({ type: 'tabstop', index: Number(digits), children: [] });
        pos += 1 + digits.length;
      } else if (name) {
        flush();
        nodes.push({ type: 'variable', name, children: null });
        pos += 1 + name.length;
      } else if (rest.startsWith('{')) {
        flush();
        nodes.push(parseBraced());
      } else {
        text += char;
        pos += 1;
      }
    }
    flush();
    return nodes;
  };

  // At `${`. Unrecognized forms are kept as text.
  const parseBraced = (): SnippetNode => {
    const start = pos;
    pos += 2;
    const rest = snippet.slice(pos);
    const digits = DIGITS.exec(rest)?.[0];
    const name = digits ? undefined : VARIABLE_NAME.exec(rest)?.[0];
    const id = digits ?? name;
    if (!id) {
      pos = start + 1;
      return { type: 'text', text: '$' };
    }
    pos += id.length;

    let children: SnippetNode[] | null = null;
    if (snippet[pos] === ':') {
      pos += 1;
      children = parseUntil('}');
    } else if (snippet[pos] === '|' && digits) {
      // A choice: use the first option.
      const end = snippet.indexOf('|}', pos + 1);
      if (end < 0) {
        pos = start + 1;
        return { type: 'text', text: '$' };
      }
      const first = snippet.slice(pos + 1, end).split(/(?<!\\),/)[0] ?? '';
      children = [{ type: 'text', text: first.replace(/\\(.)/g, '$1') }];
      pos = end + 1;
    } else if (snippet[pos] === '/' && name) {
      // A variable transform: skip it, we don't resolve variables.
      const end = snippet.indexOf('}', pos);
      pos = end < 0 ? snippet.length : end;
      children = [];
    }

    if (snippet[pos] !== '}') {
      pos = start + 1;
      return { type: 'text', text: '$' };
    }
    pos += 1;
    return digits
      ? { type: 'tabstop', index: Number(digits), children: children ?? [] }
      : { type: 'variable', name: id, children: children ?? [{ type: 'text', text: id }] };
  };

  return parseUntil(null);
};

const plainText = (nodes: SnippetNode[]): string =>
  nodes
    .map((node) => {
      if (node.type === 'text') return node.text;
      if (node.type === 'tabstop') return plainText(node.children);
      return node.children ? plainText(node.children) : `$${node.name}`;
    })
    .join('');

// CodeMirror reads `${`/`#{` as fields and `\{`/`\}` as literal braces, so
// escaping every brace in plain text keeps all of it literal.
const escapeBraces = (text: string) => text.replace(/[{}]/g, '\\$&');

const toTemplate = (nodes: SnippetNode[]): string =>
  nodes
    .map((node) => {
      if (node.type === 'text') return escapeBraces(node.text);
      if (node.type === 'variable') {
        // We don't know any variables. Like VS Code, insert `$name` as
        // written (it's likely a PHP or shell variable) and use defaults.
        return node.children ? toTemplate(node.children) : escapeBraces(`$${node.name}`);
      }
      // $0 is where the cursor ends up. A CodeMirror field without a number
      // comes after all the numbered ones.
      if (node.index === 0) return '${}';
      // CodeMirror field names can't contain braces, even escaped.
      const placeholder = plainText(node.children).replace(/[{}]/g, '');
      return placeholder ? `\${${node.index}:${placeholder}}` : `\${${node.index}}`;
    })
    .join('');

/**
 * Converts an LSP snippet into a CodeMirror snippet template, e.g.
 * `insert(${1:k}, ${2:v})$0` to `insert(${1:k}, ${2:v})${}`. Nested
 * placeholders are flattened into their text and choices become their first
 * option.
 */
export const lspSnippetToTemplate = (snippet: string): string => toTemplate(parse(snippet));
