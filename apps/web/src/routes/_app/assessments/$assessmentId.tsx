import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { AssessmentDetailHeader } from '@/components/assessments/detail/AssessmentDetailHeader';
import { useCurrentAssessmentId } from '@/lib/params';
import { cx } from '@/lib/utils';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId')({
  component: RouteComponent,
});

const tabs = [
  { label: 'Questions', path: 'questions' },
  { label: 'Submissions', path: 'submissions' },
  { label: 'Settings', path: 'settings' },
] as const;

function RouteComponent() {
  const assessmentId = useCurrentAssessmentId();
  const { assessment, isLoading } = useAssessment(assessmentId);
  const location = useLocation();

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

  // Determine active tab from pathname
  const activeTab = tabs.find((t) =>
    location.pathname.includes(`/assessments/${assessmentId}/${t.path}`)
  );

  return (
    <div className='w-full px-4'>
      <AssessmentDetailHeader assessment={assessment} />

      <div className='flex items-center border-b border-gray-200'>
        {tabs.map((tab) => {
          const isActive = activeTab?.path === tab.path;
          return (
            <Link
              key={tab.path}
              to={`/assessments/$assessmentId/${tab.path}`}
              params={{ assessmentId }}
              className={cx(
                'px-4 py-2.5 text-sm font-medium transition-colors -mb-px',
                isActive
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
