import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { MutedText } from '@coderscreen/ui/typography';
import { RiAddLine } from '@remixicon/react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { CreateAssessmentDialog } from '@/components/assessments/CreateAssessmentDialog';

export function AssessmentListHeader() {
  const search = useSearch({ from: '/_app/assessments/' });
  const navigate = useNavigate({ from: '/assessments' });
  const [dialogOpen, setDialogOpen] = useState(Boolean(search.new));

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    // drop ?new so a refresh doesn't reopen the dialog
    if (!open && search.new) {
      navigate({ search: {}, replace: true });
    }
  };

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

      <CreateAssessmentDialog open={dialogOpen} onOpenChange={handleOpenChange} />
    </>
  );
}
