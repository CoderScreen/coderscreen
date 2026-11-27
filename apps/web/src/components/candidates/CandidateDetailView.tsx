import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
  TableSkeleton,
} from '@coderscreen/ui/table';
import { MutedText } from '@coderscreen/ui/typography';
import { RiArrowLeftLine } from '@remixicon/react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  getFinishedAt,
  getTimeTaken,
  type ReviewableSubmission,
  ReviewStateBadge,
} from '@/components/assessments/detail/submissionReview';
import { formatDatetime } from '@/lib/dateUtils';
import { useCandidate } from '@/query/assessment.query';

type CandidateSubmission = ReviewableSubmission & {
  assessmentId: string;
  assessmentTitle: string;
};

export const CandidateDetailView = ({ candidateId }: { candidateId: string }) => {
  const { candidate, isLoading } = useCandidate(candidateId);
  const navigate = useNavigate();
  const submissions = (
    candidate && 'submissions' in candidate ? candidate.submissions : []
  ) as CandidateSubmission[];

  return (
    <div className='w-full px-4 py-4'>
      <Link to='/candidates'>
        <Button variant='ghost' icon={RiArrowLeftLine} className='-ml-1 mb-4'>
          All candidates
        </Button>
      </Link>

      {!isLoading && !candidate ? (
        <MutedText>Candidate not found.</MutedText>
      ) : (
        <>
          <div className='mb-6'>
            <SmallHeader>{candidate && 'name' in candidate ? candidate.name : ''}</SmallHeader>
            <MutedText>{candidate && 'email' in candidate ? candidate.email : ''}</MutedText>
          </div>

          <TableRoot>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Assessment</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Score</TableHeaderCell>
                  <TableHeaderCell>Time taken</TableHeaderCell>
                  <TableHeaderCell>Finished</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton numRows={3} numCols={5} />
                ) : submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className='py-10 text-center'>
                        <MutedText>This candidate hasn't been sent an assessment yet.</MutedText>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((sub) => {
                    const finishedAt = getFinishedAt(sub);
                    return (
                      <TableRow
                        key={sub.id}
                        className={`cursor-pointer hover:bg-gray-50 ${sub.isArchived ? 'opacity-60' : ''}`}
                        onClick={() =>
                          navigate({
                            to: '/assessments/$assessmentId/submissions/$subId',
                            params: { assessmentId: sub.assessmentId, subId: sub.id },
                          })
                        }
                      >
                        <TableCell className='font-medium text-gray-900'>
                          {sub.assessmentTitle}
                        </TableCell>
                        <TableCell>
                          <ReviewStateBadge sub={sub} />
                        </TableCell>
                        <TableCell>
                          {sub.totalScore != null && sub.maxScore != null
                            ? `${sub.totalScore}/${sub.maxScore}`
                            : '-'}
                        </TableCell>
                        <TableCell>{getTimeTaken(sub) ?? '-'}</TableCell>
                        <TableCell>{finishedAt ? formatDatetime(finishedAt) : '-'}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableRoot>
        </>
      )}
    </div>
  );
};
