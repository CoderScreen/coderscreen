import type { AssessmentSchema } from '@coderscreen/api/schema/assessment';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { RiArrowLeftLine, RiCheckLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { usePublishAssessment } from '@/query/assessment.query';
import { parseApiError } from '@/query/error.query';
import { getPublishBlockers } from './publishBlockers';

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
  assessment: AssessmentSchema & {
    questions?: { title: string; testCases?: unknown[] }[];
  };
}

export const AssessmentDetailHeader = ({ assessment }: AssessmentDetailHeaderProps) => {
  const { publishAssessment, isLoading: isPublishing, error } = usePublishAssessment();

  const isDraft = assessment.status === 'draft';
  const blockers = isDraft ? getPublishBlockers(assessment.questions) : [];

  return (
    <div className='py-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Link to='/assessments'>
            <Button variant='ghost' icon={RiArrowLeftLine} className='p-1' />
          </Link>
          <SmallHeader>{assessment.title}</SmallHeader>
        </div>

        <div className='flex items-center gap-2'>
          <StatusBadge status={assessment.status} />
          {isDraft && (
            <Button
              variant='primary'
              icon={RiCheckLine}
              onClick={() => {
                // The reason is rendered below from `error`.
                publishAssessment(assessment.id).catch(() => {});
              }}
              isLoading={isPublishing}
              disabled={blockers.length > 0}
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      {isDraft && blockers.length > 0 && (
        <div className='mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800'>
          <p>
            This assessment is a draft. Publish it to start inviting candidates. Before you can
            publish:
          </p>
          <ul className='list-disc pl-5 mt-1'>
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {isDraft && blockers.length === 0 && error && (
        <div className='mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
          Couldn't publish: {parseApiError(error).message}
        </div>
      )}
    </div>
  );
};
