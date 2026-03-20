import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { MutedText } from '@coderscreen/ui/typography';
import { RiAddLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';

export function QuestionLibraryListHeader() {
  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex flex-col'>
        <SmallHeader>Question Library</SmallHeader>
        <MutedText>Manage your reusable coding questions</MutedText>
      </div>

      <div className='flex items-center gap-2'>
        <Link to='/questions/new'>
          <Button icon={RiAddLine}>New Question</Button>
        </Link>
      </div>
    </div>
  );
}
