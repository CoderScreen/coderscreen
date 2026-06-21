import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { MutedText } from '@coderscreen/ui/typography';
import { RiAddLine, RiFileList3Line } from '@remixicon/react';
import { ActivityFeed } from './ActivityFeed';
import { InProgressAssessments } from './InProgressAssessments';
import { NeedsReview } from './NeedsReview';
import { QuickActions } from './QuickActions';

const DashboardOverviewHeader = () => {
  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex flex-col'>
        <SmallHeader>Dashboard</SmallHeader>
        <MutedText>Submissions waiting on you, and what’s happening across your team</MutedText>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='secondary' icon={RiFileList3Line}>
          New Assessment
        </Button>
        <Button icon={RiAddLine}>New Interview</Button>
      </div>
    </div>
  );
};

export const DashboardOverview = () => {
  return (
    <div className='w-full px-4 pb-10'>
      <DashboardOverviewHeader />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <NeedsReview />
          <ActivityFeed />
        </div>

        <div className='flex flex-col gap-6'>
          <QuickActions />
          <InProgressAssessments />
        </div>
      </div>
    </div>
  );
};
