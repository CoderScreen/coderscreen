import { Tabs, TabsContent, TabsList, TabsTrigger } from '@coderscreen/ui/tabs';
import { useCurrentAssessmentId } from '@/lib/params';
import { useAssessment } from '@/query/assessment.query';
import { AssessmentDetailHeader } from './AssessmentDetailHeader';
import { AssessmentQuestionsTab } from './AssessmentQuestionsTab';
import { AssessmentSettingsTab } from './AssessmentSettingsTab';
import { AssessmentSubmissionsTab } from './AssessmentSubmissionsTab';

export const AssessmentDetailView = () => {
  const assessmentId = useCurrentAssessmentId();
  const { assessment, isLoading } = useAssessment(assessmentId);

  if (isLoading) {
    return (
      <div className='w-full px-4 py-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/3' />
          <div className='h-4 bg-gray-200 rounded w-1/4' />
          <div className='h-64 bg-gray-200 rounded' />
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className='w-full px-4 py-8'>
        <p className='text-gray-500'>Assessment not found.</p>
      </div>
    );
  }

  return (
    <div className='w-full px-4'>
      <AssessmentDetailHeader assessment={assessment} />

      <Tabs defaultValue='questions'>
        <TabsList variant='line'>
          <TabsTrigger value='questions'>Questions</TabsTrigger>
          <TabsTrigger value='submissions'>Submissions</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>
        <TabsContent value='questions'>
          <AssessmentQuestionsTab assessment={assessment} />
        </TabsContent>
        <TabsContent value='submissions'>
          <AssessmentSubmissionsTab assessmentId={assessment.id} />
        </TabsContent>
        <TabsContent value='settings'>
          <AssessmentSettingsTab assessment={assessment} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
