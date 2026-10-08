/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: these strings are snippet syntax, not templates */
import { snippet } from '@codemirror/autocomplete';
import { EditorState, type Transaction } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { lspSnippetToTemplate } from './lspSnippet';

/** Inserts an LSP snippet into an empty doc and returns the text and selected range. */
const insert = (lspSnippet: string) => {
  let state = EditorState.create({ doc: '' });
  const dispatch = (tr: Transaction) => {
    state = tr.state;
  };
  snippet(lspSnippetToTemplate(lspSnippet))({ state, dispatch }, null, 0, 0);
  const { from, to } = state.selection.main;
  return { text: state.doc.toString(), selected: state.sliceDoc(from, to), cursor: from };
};

describe('lspSnippetToTemplate', () => {
  it('turns tabstops and placeholders into fields, selecting the first', () => {
    // rust-analyzer
    expect(insert('insert(${1:k}, ${2:v})$0')).toEqual({
      text: 'insert(k, v)',
      selected: 'k',
      cursor: 7,
    });
  });

  it('puts the cursor at $0', () => {
    expect(insert('iter()$0')).toEqual({ text: 'iter()', selected: '', cursor: 6 });
    expect(insert('println!("$0")')).toEqual({ text: 'println!("")', selected: '', cursor: 10 });
  });

  it('handles empty placeholders', () => {
    // gopls
    expect(insert('Println(${1:})')).toEqual({ text: 'Println()', selected: '', cursor: 8 });
  });

  it('keeps braces in the code literal', () => {
    expect(insert('if ${1:cond} {\n\t$0\n}')).toMatchObject({ text: 'if cond {\n  \n}' });
    expect(insert('format!("{}", ${1:x})')).toMatchObject({ text: 'format!("{}", x)' });
    expect(insert('"#{${1:name}}"')).toMatchObject({ text: '"#{name}"', selected: 'name' });
  });

  it('unescapes LSP escapes', () => {
    // phpactor
    expect(insert('push(${1:\\$x})${0}')).toMatchObject({ text: 'push($x)', selected: '$x' });
    expect(insert('a \\} b \\\\ c')).toMatchObject({ text: 'a } b \\ c' });
  });

  it('flattens nested placeholders', () => {
    expect(insert('foo(${1:a, ${2:b}})')).toMatchObject({ text: 'foo(a, b)', selected: 'a, b' });
  });

  it('uses the first option of a choice', () => {
    expect(insert('${1|public,private|} x')).toMatchObject({
      text: 'public x',
      selected: 'public',
    });
  });

  it('inserts unknown variables as written and uses variable defaults', () => {
    expect(insert('echo $HOME')).toMatchObject({ text: 'echo $HOME' });
    expect(insert('${TM_SELECTED_TEXT:text}')).toMatchObject({ text: 'text' });
  });

  it('leaves a lone dollar sign alone', () => {
    expect(insert('cost $ 5')).toMatchObject({ text: 'cost $ 5' });
  });
});
