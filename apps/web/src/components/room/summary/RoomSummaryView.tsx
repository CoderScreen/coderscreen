import { CandidateView } from '@/components/room/summary/CandidateView';
import { InterviewerView } from '@/components/room/summary/InterviewerView';

export const RoomSummaryView = () => {
  return (
    <div className='bg-muted'>
      <InterviewerView />
    </div>
  );
};
