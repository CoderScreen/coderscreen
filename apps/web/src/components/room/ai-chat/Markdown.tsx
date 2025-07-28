import { RiCheckLine, RiFileCopy2Line } from '@remixicon/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { visit } from 'unist-util-visit';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/query/realtime/chat.query';

const CodeBlockWithCopy = ({
  children,
  language,
  ...props
}: {
  children: React.ReactNode;
  language: string;
}) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className='relative group w-full'>
      <SyntaxHighlighter
        {...props}
        PreTag='div'
        language={language}
        className='my-2 bg-neutral-100/50 border border-neutral-200 text-neutral-800 p-3 rounded-md overflow-x-scroll'
      >
        {codeString}
      </SyntaxHighlighter>

      <button
        type='button'
        onClick={handleCopy}
        className={cn(
          'absolute top-2 right-2 px-2 py-1 text-[10px] rounded-md transition-all duration-200 flex items-center gap-1',
          'bg-neutral-200/80 hover:bg-neutral-300/90 text-neutral-700',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          'border border-neutral-300 hover:border-neutral-400'
        )}
      >
        {copied ? <RiCheckLine className='w-3 h-3' /> : <RiFileCopy2Line className='w-3 h-3' />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

export const Markdown = ({ message }: { message: ChatMessage }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[
        () => (tree) => {
          visit(tree, 'code', (node) => {
            node.lang = node.lang ?? 'plaintext';
          });
        },
      ]}
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          if (match) {
            return (
              <CodeBlockWithCopy {...props} language={match[1]}>
                {children}
              </CodeBlockWithCopy>
            );
          }

          return (
            <code
              {...props}
              className={cn(
                className,
                'bg-neutral-100/50 border border-neutral-200 text-neutral-800 px-1 py-0.5 rounded-md overflow-x-auto'
              )}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {message.content}
    </ReactMarkdown>
  );
};
