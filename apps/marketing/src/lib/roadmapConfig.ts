export type RoadmapStatus = 'now' | 'next' | 'later';

export type RoadmapArea = 'Interviews' | 'Assessments' | 'Platform';

export interface RoadmapItem {
  title: string;
  description: string;
  status: RoadmapStatus;
  area: RoadmapArea;
}

export const roadmapColumns: { status: RoadmapStatus; title: string; description: string }[] = [
  { status: 'now', title: 'Now', description: "What we're building right now." },
  { status: 'next', title: 'Next', description: 'Planned and up after the current work.' },
  {
    status: 'later',
    title: 'Later',
    description: "Ideas we're exploring. Tell us if you need one.",
  },
];

// Bump this whenever the items below change.
export const roadmapUpdatedAt = '2026-10-09';

// When something ships, remove it from here and add an entry to content/changelog.
export const roadmapItems: RoadmapItem[] = [
  {
    title: 'Question templates',
    description:
      'A starter set of ready-made questions with test cases in the question library, so you can put together an assessment without writing everything from scratch.',
    status: 'now',
    area: 'Assessments',
  },
  {
    title: 'Notifications and a home dashboard',
    description:
      'An in-app inbox that tells you when a candidate finishes an assessment, plus a home page that shows recent activity across your team.',
    status: 'now',
    area: 'Platform',
  },
  {
    title: 'ATS integrations',
    description:
      'Send interviews and assessments from Greenhouse, Lever and Ashby, and get scores back on the candidate profile.',
    status: 'next',
    area: 'Platform',
  },
  {
    title: 'Slack and webhook alerts',
    description:
      'Get a Slack message or a webhook call when a candidate submits, so results show up where your team already works.',
    status: 'next',
    area: 'Platform',
  },
  {
    title: 'Take-home projects',
    description:
      'Longer, multi-file projects that candidates work on over a few days, reviewed in the same editor you use for live interviews.',
    status: 'later',
    area: 'Assessments',
  },
  {
    title: 'Interview templates',
    description:
      'Save a room setup with its questions, starter files and language, then reuse it for every candidate in a hiring loop.',
    status: 'later',
    area: 'Interviews',
  },
  {
    title: 'Notification preferences and digests',
    description: 'Choose which alerts you get and where, and roll quieter ones into a daily email.',
    status: 'later',
    area: 'Platform',
  },
];
