import { Badge } from '@coderscreen/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@coderscreen/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from '@coderscreen/ui/table';
import { MutedText } from '@coderscreen/ui/typography';
import { RiCheckboxCircleLine, RiCloseCircleLine } from '@remixicon/react';
import { formatDatetime } from '@/lib/dateUtils';
import { useSubmission } from '@/query/assessment.query';

interface SubmissionDetailDialogProps {
  assessmentId: string;
  subId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmissionDetailDialog = ({
  assessmentId,
  subId,
  open,
  onOpenChange,
}: SubmissionDetailDialogProps) => {
  const { submission, isLoading } = useSubmission(assessmentId, subId);

  const sub = submission as Record<string, unknown> | undefined;
  const candidate = sub?.candidate as Record<string, unknown> | undefined;
  const questionSubmissions = (sub?.questionSubmissions as Record<string, unknown>[]) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl max-h-[85vh] overflow-y-auto'>
        {isLoading ? (
          <div className='py-8 text-center text-gray-500'>Loading...</div>
        ) : !submission ? (
          <div className='py-8 text-center text-gray-500'>Submission not found</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{candidate?.name as string}</DialogTitle>
              <MutedText>{candidate?.email as string}</MutedText>
            </DialogHeader>

            {/* Submission info */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 py-4 mt-2 border-t border-b border-gray-200'>
              <InfoItem label='Status' value={<StatusBadge status={sub!.status as string} />} />
              <InfoItem
                label='Score'
                value={
                  sub!.totalScore != null && sub!.maxScore != null
                    ? `${sub!.totalScore}/${sub!.maxScore}`
                    : '-'
                }
              />
              <InfoItem
                label='Started'
                value={sub!.startedAt ? formatDatetime(sub!.startedAt as string) : '-'}
              />
              <InfoItem
                label='Submitted'
                value={sub!.submittedAt ? formatDatetime(sub!.submittedAt as string) : '-'}
              />
            </div>

            {/* Question submissions */}
            <div className='pt-2'>
              <MutedText className='mb-3'>
                {questionSubmissions.length} question
                {questionSubmissions.length !== 1 ? 's' : ''}
              </MutedText>

              <TableRoot>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className='w-12'>#</TableHeaderCell>
                      <TableHeaderCell>Question</TableHeaderCell>
                      <TableHeaderCell>Language</TableHeaderCell>
                      <TableHeaderCell>Test Results</TableHeaderCell>
                      <TableHeaderCell>Score</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questionSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className='text-center py-8'>
                            <MutedText>No question submissions yet.</MutedText>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      questionSubmissions.map((qs, index) => {
                        const testResults =
                          (qs.testCaseResults as Record<string, unknown>[]) ?? [];
                        const passed = testResults.filter((r) => r.passed).length;
                        const total = testResults.length;

                        return (
                          <TableRow key={qs.id as string}>
                            <TableCell className='text-gray-500 font-medium'>
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              {(qs.questionTitle as string) || `Question ${index + 1}`}
                            </TableCell>
                            <TableCell>{(qs.language as string) || '-'}</TableCell>
                            <TableCell>
                              {total > 0 ? (
                                <span className='inline-flex items-center gap-1'>
                                  {passed === total ? (
                                    <RiCheckboxCircleLine className='size-4 text-green-500' />
                                  ) : (
                                    <RiCloseCircleLine className='size-4 text-red-500' />
                                  )}
                                  {passed}/{total} passed
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{qs.score != null ? `${qs.score}` : '-'}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableRoot>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'not_started':
      return <Badge variant='neutral'>Not Started</Badge>;
    case 'in_progress':
      return <Badge variant='warning'>In Progress</Badge>;
    case 'submitted':
      return <Badge variant='success'>Submitted</Badge>;
    case 'expired':
      return <Badge variant='error'>Expired</Badge>;
    case 'graded':
      return <Badge variant='success'>Graded</Badge>;
    default:
      return <Badge variant='neutral'>{status}</Badge>;
  }
};

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <MutedText className='text-xs'>{label}</MutedText>
    <div className='text-sm font-medium text-gray-900 mt-0.5'>{value}</div>
  </div>
);
