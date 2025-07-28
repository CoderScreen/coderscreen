import {
  RiArrowDownSLine,
  RiBold,
  RiCodeLine,
  RiDoubleQuotesL,
  RiH1,
  RiH2,
  RiH3,
  RiHeading,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiStrikethrough,
} from '@remixicon/react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { cx } from '@/lib/utils';

const BUTTON_CLASSNAME = 'p-1';

export const TipTapHeader = (props: { editor: Editor | null | undefined }) => {
  const editor = props.editor;

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const toggleStrike = () => {
    editor?.chain().focus().toggleStrike().run();
  };

  const toggleCode = () => {
    editor?.chain().focus().toggleCode().run();
  };

  const toggleBlockquote = () => {
    editor?.chain().focus().toggleBlockquote().run();
  };

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const toggleHeading = (level: 1 | 2 | 3 | 'normal') => {
    if (level === 'normal') {
      editor?.chain().focus().setParagraph().run();
    } else {
      editor?.chain().focus().toggleHeading({ level }).run();
    }
  };

  const getCurrentHeadingLevel = () => {
    if (editor?.isActive('heading', { level: 1 })) return '1';
    if (editor?.isActive('heading', { level: 2 })) return '2';
    if (editor?.isActive('heading', { level: 3 })) return '3';
    return 'normal';
  };

  const currentHeading = getCurrentHeadingLevel();

  const getHeadingIcon = () => {
    switch (currentHeading) {
      case '1':
        return <RiH1 className='size-4' />;
      case '2':
        return <RiH2 className='size-4' />;
      case '3':
        return <RiH3 className='size-4' />;
      default:
        return <RiHeading className='size-4' />;
    }
  };

  return (
    <div className='border-b border-gray-200 p-2 flex justify-between items-center flex-wrap gap-1 z-10'>
      <div className='flex flex-wrap gap-1'>
        <Button
          variant={editor?.isActive('bold') ? 'light' : 'ghost'}
          onClick={toggleBold}
          disabled={!editor?.isEditable}
          className={BUTTON_CLASSNAME}
        >
          <RiBold className='size-4' />
        </Button>
        <Button
          variant={editor?.isActive('italic') ? 'light' : 'ghost'}
          onClick={toggleItalic}
          disabled={!editor?.isEditable}
          className={BUTTON_CLASSNAME}
        >
          <RiItalic className='size-4' />
        </Button>
        <Button
          variant={editor?.isActive('strike') ? 'light' : 'ghost'}
          onClick={toggleStrike}
          disabled={!editor?.isEditable}
          className={BUTTON_CLASSNAME}
        >
          <RiStrikethrough className='size-4' />
        </Button>
        <Button
          variant={editor?.isActive('code') ? 'light' : 'ghost'}
          onClick={toggleCode}
          disabled={!editor?.isEditable}
          className={BUTTON_CLASSNAME}
        >
          <RiCodeLine className='size-4' />
        </Button>
        <Button
          variant={editor?.isActive('blockquote') ? 'light' : 'ghost'}
          onClick={toggleBlockquote}
          disabled={!editor?.isEditable}
          className={BUTTON_CLASSNAME}
        >
          <RiDoubleQuotesL className='size-4' />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={currentHeading !== 'normal' ? 'light' : 'ghost'}
              disabled={!editor?.isEditable}
              className={cx(BUTTON_CLASSNAME, 'flex items-center gap-1')}
            >
              {getHeadingIcon()}
              <RiArrowDownSLine className='size-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => toggleHeading(1)}
              className={editor?.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
            >
              <RiH1 className='size-4 mr-2' />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toggleHeading(2)}
              className={editor?.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
            >
              <RiH2 className='size-4 mr-2' />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toggleHeading(3)}
              className={editor?.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''}
            >
              <RiH3 className='size-4 mr-2' />
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={editor?.isActive('orderedList') ? 'light' : 'ghost'}
          onClick={toggleOrderedList}
          disabled={!editor?.isEditable}
          className={BUTTON_CLASSNAME}
        >
          <RiListOrdered className='size-4' />
        </Button>
        <Button
          variant={editor?.isActive('bulletList') ? 'light' : 'ghost'}
          onClick={toggleBulletList}
          disabled={!editor?.isEditable}
          className={BUTTON_CLASSNAME}
        >
          <RiListUnordered className='size-4' />
        </Button>
      </div>
    </div>
  );
};
