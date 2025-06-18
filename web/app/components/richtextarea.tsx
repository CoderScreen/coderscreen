'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useEditor, EditorContent, Editor, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention, { MentionOptions } from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { cn } from '@/components/ui/lib/utils';
import tippy, {
  Instance as TippyInstance,
  Props as TippyProps,
} from 'tippy.js';

// --- Data Structure (Keep your original structure) ---
export interface SuggestionDataItem {
  id: string | number;
  value: string; // Used for insertion/display text in mention node
  display?: React.ReactNode; // Used by your custom SuggestionItemComponent
  [key: string]: any;
}

// --- Suggestion List Component ---

interface MentionSuggestionListProps
  extends SuggestionProps<SuggestionDataItem> {
  component: React.ComponentType<{ item: SuggestionDataItem }>;
}

export interface MentionSuggestionListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const MentionSuggestionList = forwardRef<
  MentionSuggestionListRef,
  MentionSuggestionListProps
>((props, ref) => {
  const { items, command, component: ItemComponent } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectItem = useCallback(
    (index: number) => {
      if (index >= items.length || index < 0) {
        return; // Out of bounds
      }
      const item = items[index];
      if (item) {
        command(item); // Execute the command to insert the mention
      }
    },
    [command, items]
  );

  // Scroll the selected item into view
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    const item = container?.children[selectedIndex] as HTMLElement;

    if (container && item) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += itemRect.bottom - containerRect.bottom;
      } else if (itemRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - itemRect.top;
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const onKeyDown = useCallback(
    ({ event }: SuggestionKeyDownProps): boolean => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex(
          (prevIndex) => (prevIndex + items.length - 1) % items.length
        );
        return true; // Prevent default browser behavior
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % items.length);
        return true; // Prevent default browser behavior
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true; // Prevent default browser behavior
      }
      return false; // Let Tiptap handle other keys
    },
    [items.length, selectItem, selectedIndex]
  );

  // Expose the onKeyDown handler via the ref
  useImperativeHandle(ref, () => ({
    onKeyDown: (props: SuggestionKeyDownProps) => onKeyDown(props),
  }));

  // Reset index when items change
  useEffect(() => setSelectedIndex(0), [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'mention-suggestion-list', // Add a class for easier global styling
        'bg-background text-popover-foreground', // Use theme variables
        'border rounded-md shadow-md',
        'max-h-[300px] overflow-y-auto p-1 z-50' // Added z-index here too
      )}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          className={cn(
            'mention-suggestion-item flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none', // Mimic CommandItem
            index === selectedIndex
              ? 'bg-accent text-accent-foreground' // Focused style
              : '',
            'cursor-pointer text-left' // Ensure button looks clickable
          )}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)} // Select on hover
        >
          <ItemComponent item={item} />
        </button>
      ))}
    </div>
  );
});

// --- Component to render each suggestion item ---
const ChatSuggestionItem = ({ item }: { item: SuggestionDataItem }) => {
  // Simple display, customize as needed (e.g., add icons, avatars)
  return <span className='text-sm'>{item.display ?? item.value}</span>;
};

MentionSuggestionList.displayName = 'MentionSuggestionList';

export interface RichTextareaProps {
  value?: string; // Initial value (expects HTML string)
  onChange?: (value: string) => void; // Returns HTML string
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void; // Note: Event target is the editor div
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean | void;
  mentionTrigger?: string;
  fetchSuggestions: (
    query: string,
    selectedMentions?: Array<{ id: string; label: string }>
  ) => Promise<SuggestionDataItem[]> | SuggestionDataItem[];
  selectedMentions?: Array<{ id: string; label: string }>;
  onMentionSelect?: (item: { id: string; label: string }) => void; // New callback for mention selection
  onMentionRemove?: (item: { id: string; label: string }) => void; // New callback for mention removal
  placeholder?: string;
  disabled?: boolean;
  className?: string; // Applied to the editor container
  containerClassName?: string; // Applied to the outer wrapper div
  mentionOptions?: Partial<MentionOptions>;
  setEditor?: (editor: Editor | null) => void;
}

// --- Ref Handle ---
// Expose the Tiptap editor instance if needed
export interface RichTextareaRef {
  editor: Editor | null;
}

// --- Component Implementation ---
export const RichTextarea = forwardRef<RichTextareaRef, RichTextareaProps>(
  (
    {
      value = '',
      onChange,
      onBlur,
      onKeyDown,
      mentionTrigger = '@',
      fetchSuggestions,
      onMentionSelect,
      onMentionRemove,
      placeholder,
      disabled = false,
      className,
      containerClassName,
      mentionOptions = {},
      setEditor,
    },
    ref
  ) => {
    const editorRef = useRef<Editor | null>(null);
    const [isSuggestionActive, setIsSuggestionActive] = useState(false);

    // --- Mention Suggestion Configuration (Now inside the component) ---
    const mentionSuggestionConfig: MentionOptions['suggestion'] = {
      items: ({ query }) => {
        // Use the fetchSuggestions prop passed to the component
        return fetchSuggestions(query);
      },

      command: ({ editor, range, props }) => {
        // Call the onMentionSelect callback when a mention is selected
        if (onMentionSelect && props.id) {
          onMentionSelect({
            id: props.id,
            label: props.label ?? props.id,
          });
        }

        // Continue with the default behavior
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContentAt(range.from, [
            {
              type: 'mention',
              attrs: props,
            },
          ])
          .insertContent(' ')
          .run();
      },

      render: () => {
        let component: ReactRenderer<MentionSuggestionListRef> | undefined;
        let popup: TippyInstance[] | undefined; // Tippy returns an array

        return {
          onStart: (props) => {
            setIsSuggestionActive(true);

            // Pass the suggestionItemComponent from RichTextareaProps
            // down to MentionSuggestionList via the props object
            component = new ReactRenderer(MentionSuggestionList, {
              props: { ...props, component: ChatSuggestionItem }, // Pass the item component here
              editor: props.editor,
            });

            if (!props.clientRect) {
              return;
            }

            popup = tippy('body', {
              getReferenceClientRect: () =>
                props.clientRect?.() ?? DOM_RECT_FALLBACK,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },

          onUpdate(props) {
            component?.updateProps({
              ...props,
              component: ChatSuggestionItem,
            }); // Ensure component updates too

            if (!props.clientRect) {
              return;
            }

            popup?.[0]?.setProps({
              getReferenceClientRect: () =>
                props.clientRect?.() ?? DOM_RECT_FALLBACK,
            });
          },

          onKeyDown(props) {
            if (props.event.key === 'Enter') {
              props.event.preventDefault();
              const handled = component?.ref?.onKeyDown(props) ?? false;
              return handled;
            }
            return component?.ref?.onKeyDown(props) ?? false;
          },

          onExit() {
            setIsSuggestionActive(false);
            popup?.[0]?.destroy();
            component?.destroy();
            popup = undefined;
            component = undefined;
          },
        };
      },
      // Allow overriding other suggestion options via mentionOptions prop
      ...mentionOptions.suggestion,
      char: mentionTrigger, // Use the mentionTrigger prop
    };
    // --- End Mention Suggestion Configuration ---

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          // Disable heading/blockquote etc. if you want a simpler textarea-like experience
          heading: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
          bulletList: false,
          orderedList: false,
        }),
        Placeholder.configure({
          placeholder: placeholder ?? 'Type here...',
          emptyNodeClass:
            'cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-gray-500 before:opacity-50 before-pointer-events-none',
        }),
        Mention.configure({
          HTMLAttributes: {
            // Example: Style the mention node itself
            class: 'mention',
            id: 'mention-node',
          },
          // Map SuggestionDataItem to how the mention node stores data
          // This depends on what you need later (e.g., when getting HTML/JSON)
          // Example: store id and value (display text)
          renderLabel({ node }) {
            // Use the 'value' from SuggestionDataItem for display in the editor
            return `${mentionTrigger}${node.attrs.label ?? node.attrs.id}`;
          },
          // Use the dynamically created suggestion config
          suggestion: mentionSuggestionConfig,
          // Allow overriding other Mention options
          ...mentionOptions,
        }),
      ],
      // content: value, // Set initial content
      editable: !disabled,
      editorProps: {
        attributes: {
          // Mimic shadcn/ui Textarea styles
          class: cn(
            'min-h-[80px] w-full rounded-md text-sm outline-none border-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
            className // Allow overriding via prop
          ),
        },
        handleKeyDown: (_, event) => {
          // // If suggestions are active, let the suggestion plugin handle it
          if (isSuggestionActive) {
            return false;
          }

          // Otherwise, use our custom handler
          if (onKeyDown) {
            const handled = onKeyDown(
              event as unknown as React.KeyboardEvent<HTMLDivElement>
            );
            if (handled === true) {
              return true;
            }
          }
          return false;
        },
      },
      onUpdate: ({ editor }) => {
        onChange?.(editor.getText()); // Trigger onChange with HTML content
      },
      onBlur: ({ event }) => {
        if (onBlur) {
          // Cast the target, Tiptap's event target is the ProseMirror view's DOM element
          onBlur(event as unknown as React.FocusEvent<HTMLDivElement>);
        }
      },
      onTransaction: ({ transaction, editor }) => {
        if (onMentionRemove && transaction.docChanged) {
          const oldMentions = findMentionsInDoc(transaction.before);
          const newMentions = findMentionsInDoc(transaction.doc);

          // Find mentions that were in the old doc but not in the new doc
          oldMentions.forEach((mention) => {
            if (!newMentions.some((m) => m.id === mention.id)) {
              onMentionRemove({
                id: mention.id,
                label: mention.label ?? mention.id,
              });
            }
          });
        }
      },
    });

    // Helper function to find all mentions in a document
    const findMentionsInDoc = (doc: any) => {
      const mentions: Array<{ id: string; label?: string }> = [];

      doc.descendants((node: any) => {
        if (node.type.name === 'mention') {
          mentions.push({
            id: node.attrs.id,
            label: node.attrs.label,
          });
        }
        return true;
      });

      return mentions;
    };

    // Expose editor instance via ref
    useImperativeHandle(
      ref,
      () => ({
        editor: editor,
      }),
      [editor]
    );

    // Update editable state if disabled prop changes
    useEffect(() => {
      editor?.setEditable(!disabled);
    }, [disabled, editor]);

    // Store editor instance locally for cleanup
    useEffect(() => {
      editorRef.current = editor;
      setEditor?.(editor);
      return () => {
        editorRef.current?.destroy();
        editorRef.current = null;
      };
    }, [editor]);

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichTextarea.displayName = 'RichTextarea';

export type MentionSuggestion = {
  id: string;
  mentionLabel: string;
};

/**
 * Workaround for the current typing incompatibility between Tippy.js and Tiptap
 * Suggestion utility.
 *
 * @see https://github.com/ueberdosis/tiptap/issues/2795#issuecomment-1160623792
 *
 * Adopted from
 * https://github.com/Doist/typist/blob/a1726a6be089e3e1452def641dfcfc622ac3e942/stories/typist-editor/constants/suggestions.ts#L169-L186
 */
const DOM_RECT_FALLBACK: DOMRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON() {
    return {};
  },
};
