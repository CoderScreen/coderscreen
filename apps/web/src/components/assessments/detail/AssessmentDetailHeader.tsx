import type { AssessmentSchema } from '@coderscreen/api/schema/assessment';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { RiArrowLeftLine, RiCheckLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { usePublishAssessment } from '@/query/assessment.query';

const StatusBadge = ({ status }: { status: AssessmentSchema['status'] }) => {
  switch (status) {
    case 'active':
      return <Badge variant='success'>Active</Badge>;
    case 'draft':
      return <Badge variant='warning'>Draft</Badge>;
    case 'archived':
      return <Badge variant='neutral'>Archived</Badge>;
    default:
      return <Badge variant='neutral'>Unknown</Badge>;
  }
};

interface AssessmentDetailHeaderProps {
  assessment: AssessmentSchema;
}

export const AssessmentDetailHeader = ({ assessment }: AssessmentDetailHeaderProps) => {
  const { publishAssessment, isLoading: isPublishing } = usePublishAssessment();

  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex items-center gap-2'>
        <Link to='/assessments'>
          <Button variant='ghost' icon={RiArrowLeftLine} className='p-1' />
        </Link>
        <SmallHeader>{assessment.title}</SmallHeader>
      </div>

      <div className='flex items-center gap-2'>
        <StatusBadge status={assessment.status} />
        {assessment.status === 'draft' && (
          <Button
            variant='primary'
            icon={RiCheckLine}
            onClick={() => publishAssessment(assessment.id)}
            isLoading={isPublishing}
          >
            Publish
          </Button>
        )}
      </div>
    </div>
  );
};
