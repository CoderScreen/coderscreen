import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { MutedText } from '@coderscreen/ui/typography';
import { RiAddLine } from '@remixicon/react';
import { useState } from 'react';
import { CreateAssessmentDialog } from '@/components/assessments/CreateAssessmentDialog';

export function AssessmentListHeader() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className='flex items-center justify-between py-4'>
        <div className='flex flex-col'>
          <SmallHeader>Assessments</SmallHeader>
          <MutedText>Send take-home coding challenges to candidates</MutedText>
        </div>

        <div className='flex items-center gap-2'>
          <Button icon={RiAddLine} onClick={() => setDialogOpen(true)}>
            New Assessment
          </Button>
        </div>
      </div>

      <CreateAssessmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
