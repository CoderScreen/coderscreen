import type { Metadata } from 'next';
import { type FeatureContent, FeaturePageView } from '@/components/feature/FeaturePageView';
import {
  AIAssistantVisual,
  LiveInterviewVisual,
  WhiteboardVisual,
} from '@/components/landing/FeatureVisuals';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';

const SITE_URL = 'https://coderscreen.com';
const PAGE_URL = `${SITE_URL}/live-interviews`;

const SEO = {
  title: 'Live Coding Interviews - Collaborative Pair Programming | CoderScreen',
  description:
    'Run live coding interviews in a shared editor with your candidate. 20+ languages, live output, a whiteboard, and session playback. Start free.',
  keywords: [
    'live coding interview',
    'collaborative code editor',
    'pair programming interview',
    'technical interview platform',
    'remote coding interview',
    'real-time code interview',
    'interview recording playback',
  ],
};

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  keywords: SEO.keywords,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: PAGE_URL,
    siteName: 'CoderScreen',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'CoderScreen Live Interviews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.title,
    description: SEO.description,
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const content: FeatureContent = {
  hero: {
    title: 'Interview like you pair program',
    subtitle: 'Live coding interviews in a shared editor',
    description:
      'Forget awkward screen-shares and clunky setups. Run live coding sessions where you and the candidate write code together in the same editor, in real time.',
  },
  valueProps: {
    title: 'Why teams interview with CoderScreen',
    items: [
      {
        title: 'Truly collaborative',
        description:
          'You and the candidate share one editor with live cursors. See how they think and communicate, not just the final answer.',
      },
      {
        title: '20+ languages',
        description:
          'Interview in whatever language fits the role, with syntax highlighting and autocomplete built in.',
      },
      {
        title: 'Run code live',
        description:
          'Execute code during the session and see the output instantly. No local setup, no sharing screens.',
      },
      {
        title: 'Review afterward',
        description:
          'Every session can be played back, so the rest of your team can review the interview without sitting in on it.',
      },
      {
        title: 'One tool, not five',
        description:
          'Editor, whiteboard, AI assistant, and recording in a single product. Nothing to stitch together.',
      },
      {
        title: 'Open source',
        description:
          'CoderScreen is fully open source. Inspect the code, self-host, or contribute.',
      },
    ],
  },
  features: {
    title: 'Everything you need for a great interview',
    items: [
      {
        title: 'A shared, real-time editor',
        description:
          'You and the candidate work in the same editor with live cursors and instant updates. Pair on a problem the way you actually would on the job.',
        bullets: [
          'Live cursors and real-time sync',
          '20+ languages with highlighting and autocomplete',
          'Run code and see output without leaving the page',
        ],
        visual: <LiveInterviewVisual />,
      },
      {
        title: 'A whiteboard for system design',
        description:
          'Switch to a shared whiteboard for architecture and system-design rounds. Sketch boxes and arrows together without leaving the interview.',
        bullets: [
          'Shared, real-time canvas',
          'Great for system design and architecture rounds',
          'Stays in the same session as your coding round',
        ],
        visual: <WhiteboardVisual />,
      },
      {
        title: 'AI assistant and private notes',
        description:
          'Keep an AI assistant on hand for follow-up questions and jot private notes only your team can see while the interview runs.',
        bullets: [
          'Private notes the candidate never sees',
          'AI assistance for follow-ups and hints',
          'Full session playback to review later',
        ],
        visual: <AIAssistantVisual />,
      },
    ],
  },
  faq: [
    {
      question: 'How does the collaborative editor work?',
      answer:
        'You and the candidate share a single editor with live cursors. Edits sync in real time, so you can pair on a problem together instead of watching a screen-share.',
    },
    {
      question: 'Can candidates run their code during the interview?',
      answer:
        'Yes. Code runs in the session and the output appears instantly across 20+ languages, with no local setup for you or the candidate.',
    },
    {
      question: 'Can I review interviews afterward?',
      answer:
        'Every session can be played back, so teammates can review how a candidate worked through a problem without having to attend the interview live.',
    },
    {
      question: 'Is there a whiteboard for system design?',
      answer:
        'Yes. You can switch to a shared real-time whiteboard for architecture and system-design rounds, all within the same session.',
    },
    {
      question: 'Do candidates need to install anything?',
      answer:
        'No. Candidates join from a link in the browser. There is nothing to install and no account to create.',
    },
  ],
};

export default function LiveInterviewsPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Live Interviews', href: '/live-interviews' },
  ]);

  return (
    <>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FeaturePageView content={content} />
    </>
  );
}
