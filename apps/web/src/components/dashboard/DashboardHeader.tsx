import { Button } from '@/components/ui/button';
import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import {
  RiAddLine,
  RiQuestionAnswerLine,
  RiFeedbackLine,
} from '@remixicon/react';

export function DashboardHeader() {
  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex flex-col'>
        <SmallHeader>Dashboard</SmallHeader>
        <MutedText>Manage your interviews and analytics here.</MutedText>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='secondary' icon={RiFeedbackLine}>
          Feedback
        </Button>
        <Button variant='secondary' icon={RiQuestionAnswerLine}>
          Help
        </Button>
      </div>
    </div>
  );
}
