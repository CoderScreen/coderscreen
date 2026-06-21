import { useRef, useEffect } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { php } from '@codemirror/lang-php';
import { placeholder as placeholderExt } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { cx } from '@/lib/utils';

function getLanguageExtension(language?: string): Extension | null {
  switch (language) {
    case 'python':
      return python();
    case 'javascript':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'java':
      return java();
    case 'c':
    case 'c++':
      return cpp();
    case 'rust':
      return rust();
    case 'go':
      return go();
    case 'php':
      return php();
    default:
      return null;
  }
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export const CodeEditor = ({
  value,
  onChange,
  language,
  placeholder,
  className,
  readOnly = false,
}: CodeEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions: Extension[] = [
      basicSetup,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
    ];

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true), EditorView.editable.of(false));
    }

    if (placeholder) {
      extensions.push(placeholderExt(placeholder));
    }

    const langExt = getLanguageExtension(language);
    if (langExt) {
      extensions.push(langExt);
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]); // Recreate editor when language changes

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={cx('border border-gray-200 rounded-lg overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto', className)}
    />
  );
};
