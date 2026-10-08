import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type * as LSP from 'vscode-languageserver-protocol';

export type LspContents = string | LSP.MarkupContent | LSP.MarkedString | LSP.MarkedString[];

const toMarkdown = (contents: LspContents): string => {
  if (Array.isArray(contents)) return contents.map(toMarkdown).join('\n\n');
  if (typeof contents === 'string') return contents;
  if ('kind' in contents) {
    return contents.kind === 'markdown' ? contents.value : `\`\`\`text\n${contents.value}\n\`\`\``;
  }
  return `\`\`\`${contents.language}\n${contents.value}\n\`\`\``;
};

const Markdown = ({ children }: { children: string }) => (
  <ReactMarkdown
    components={{
      code({ className, children }) {
        const language = /language-(\w+)/.exec(className ?? '')?.[1];
        if (!language) {
          return <code className='rounded bg-neutral-100 px-1 font-mono'>{children}</code>;
        }
        return (
          <SyntaxHighlighter
            PreTag='div'
            language={language === 'text' ? undefined : language}
            customStyle={{ margin: 0, padding: 0, background: 'transparent', fontSize: 'inherit' }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      },
      p: ({ children }) => <p className='my-1'>{children}</p>,
      a: ({ children }) => <span className='underline'>{children}</span>,
    }}
  >
    {children}
  </ReactMarkdown>
);

/** Hover and completion documentation from the language server. */
export const LspDocs = ({ contents }: { contents: LspContents }) => (
  <div className='max-h-72 max-w-lg overflow-auto px-3 py-2 text-xs leading-relaxed text-neutral-800'>
    <Markdown>{toMarkdown(contents)}</Markdown>
  </div>
);

const splitAtParameter = (label: string, parameter: LSP.ParameterInformation | undefined) => {
  if (!parameter) return [label, '', ''];
  const [start, end] =
    typeof parameter.label === 'string'
      ? [label.indexOf(parameter.label), label.indexOf(parameter.label) + parameter.label.length]
      : parameter.label;
  if (start < 0) return [label, '', ''];
  return [label.slice(0, start), label.slice(start, end), label.slice(end)];
};

/** The signature of the function being called, with the current argument highlighted. */
export const LspSignature = ({
  help,
  activeSignature,
  activeParameter,
}: {
  help: LSP.SignatureHelp;
  activeSignature: number;
  activeParameter?: number;
}) => {
  const signature = help.signatures[activeSignature] ?? help.signatures[0];
  if (!signature) return null;

  const parameter =
    activeParameter === undefined ? undefined : signature.parameters?.[activeParameter];
  const [before, current, after] = splitAtParameter(signature.label, parameter);

  return (
    <div className='max-h-72 max-w-lg overflow-auto px-3 py-2 text-xs leading-relaxed text-neutral-800'>
      <code className='whitespace-pre-wrap font-mono'>
        {before}
        <span className='font-semibold text-blue-700 underline'>{current}</span>
        {after}
      </code>
      {parameter?.documentation && (
        <div className='mt-1'>
          <Markdown>{toMarkdown(parameter.documentation)}</Markdown>
        </div>
      )}
      {signature.documentation && (
        <div className='mt-1 border-neutral-200 border-t pt-1'>
          <Markdown>{toMarkdown(signature.documentation)}</Markdown>
        </div>
      )}
    </div>
  );
};
