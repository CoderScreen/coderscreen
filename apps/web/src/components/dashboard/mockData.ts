import {
  RemixiconComponentType,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiSendPlaneFill,
  RiUserAddLine,
} from '@remixicon/react';

// NOTE: Static placeholder data for the dashboard. Not wired to the API yet —
// these will be replaced by dashboard / notification query hooks.

// === Needs review ===

export interface ReviewItem {
  id: string;
  candidateName: string;
  assessmentTitle: string;
  score: string;
  scorePct: number;
  timeSpent: string;
  submittedAgo: string;
}

export const MOCK_NEEDS_REVIEW: ReviewItem[] = [
  {
    id: 'sub_1',
    candidateName: 'Priya Sharma',
    assessmentTitle: 'Senior Frontend Take-Home',
    score: '92 / 100',
    scorePct: 92,
    timeSpent: '1h 12m',
    submittedAgo: '12m ago',
  },
  {
    id: 'sub_2',
    candidateName: 'Marcus Lee',
    assessmentTitle: 'Backend Engineer Screen',
    score: '64 / 100',
    scorePct: 64,
    timeSpent: '54m',
    submittedAgo: '47m ago',
  },
  {
    id: 'sub_3',
    candidateName: 'Sofia Romano',
    assessmentTitle: 'Data Engineer Screen',
    score: '78 / 100',
    scorePct: 78,
    timeSpent: '1h 03m',
    submittedAgo: 'Yesterday',
  },
  {
    id: 'sub_4',
    candidateName: 'Liam O’Connor',
    assessmentTitle: 'Full-Stack Engineer',
    score: '85 / 100',
    scorePct: 85,
    timeSpent: '1h 28m',
    submittedAgo: '2 days ago',
  },
  {
    id: 'sub_5',
    candidateName: 'Hannah Berg',
    assessmentTitle: 'Senior Frontend Take-Home',
    score: '71 / 100',
    scorePct: 71,
    timeSpent: '48m',
    submittedAgo: '2 days ago',
  },
];

// === Recent activity ===

export type ActivityType =
  | 'assessment_submission_received'
  | 'candidate_invited'
  | 'assessment_published'
  | 'submission_graded';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  body: string;
  timeAgo: string;
  unread: boolean;
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'act_1',
    type: 'assessment_submission_received',
    title: 'Priya Sharma submitted Senior Frontend Take-Home',
    body: 'Scored 92 / 100',
    timeAgo: '12m ago',
    unread: true,
  },
  {
    id: 'act_2',
    type: 'candidate_invited',
    title: 'You invited Dana Whitfield',
    body: 'Full-Stack Engineer assessment',
    timeAgo: '2h ago',
    unread: false,
  },
  {
    id: 'act_3',
    type: 'submission_graded',
    title: 'Alex Chen’s submission was graded',
    body: 'Full-Stack Engineer · strong hire',
    timeAgo: '5h ago',
    unread: false,
  },
  {
    id: 'act_4',
    type: 'assessment_published',
    title: 'Data Engineer Screen was published',
    body: '3 questions · Python, SQL',
    timeAgo: 'Yesterday',
    unread: false,
  },
];

// Maps an activity type to its icon + accent color. Mirrors the server-side
// registry `renderInApp` concept from the notifications plan.
export const ACTIVITY_STYLES: Record<
  ActivityType,
  { icon: RemixiconComponentType; iconClassName: string; bgClassName: string }
> = {
  assessment_submission_received: {
    icon: RiSendPlaneFill,
    iconClassName: 'text-blue-600',
    bgClassName: 'bg-blue-50',
  },
  candidate_invited: {
    icon: RiUserAddLine,
    iconClassName: 'text-purple-600',
    bgClassName: 'bg-purple-50',
  },
  assessment_published: {
    icon: RiFileList3Line,
    iconClassName: 'text-amber-600',
    bgClassName: 'bg-amber-50',
  },
  submission_graded: {
    icon: RiCheckboxCircleLine,
    iconClassName: 'text-emerald-600',
    bgClassName: 'bg-emerald-50',
  },
};

// === In progress ===

export interface InProgressItem {
  id: string;
  candidateName: string;
  assessmentTitle: string;
  progressLabel: string;
  progressPct: number;
  timeLeft: string;
}

export const MOCK_IN_PROGRESS: InProgressItem[] = [
  {
    id: 'ip_1',
    candidateName: 'Dana Whitfield',
    assessmentTitle: 'Full-Stack Engineer',
    progressLabel: '2 / 3 questions',
    progressPct: 66,
    timeLeft: '38m left',
  },
  {
    id: 'ip_2',
    candidateName: 'Samuel Adeyemi',
    assessmentTitle: 'Backend Engineer Screen',
    progressLabel: '1 / 2 questions',
    progressPct: 50,
    timeLeft: '52m left',
  },
  {
    id: 'ip_3',
    candidateName: 'Yuki Tanaka',
    assessmentTitle: 'Data Engineer Screen',
    progressLabel: '0 / 3 questions',
    progressPct: 8,
    timeLeft: '1h 04m left',
  },
];
