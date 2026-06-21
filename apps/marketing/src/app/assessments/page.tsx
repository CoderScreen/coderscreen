import type { Metadata } from 'next';
import { type FeatureContent, FeaturePageView } from '@/components/feature/FeaturePageView';
import { AssessmentVisual, TakeHomeVisual } from '@/components/landing/FeatureVisuals';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';

const SITE_URL = 'https://coderscreen.com';
const PAGE_URL = `${SITE_URL}/assessments`;

const SEO = {
  title: 'Coding Assessments - Screen Candidates Automatically | CoderScreen',
  description:
    'Send candidates a real coding assessment, get back auto-graded results. Reusable question library, weighted scoring, and 20+ languages. Start free.',
  keywords: [
    'coding assessment',
    'automated coding test',
    'technical screening',
    'developer assessment platform',
    'auto-graded coding test',
    'take home coding test',
    'candidate screening software',
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
      { url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'CoderScreen Assessments' },
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
    title: 'Screen smarter, not harder',
    subtitle: 'Coding assessments that grade themselves',
    description:
      'Send candidates a real coding challenge, get back scored results, and only spend live-interview time on the people who can actually code.',
  },
  valueProps: {
    title: 'Why teams screen with CoderScreen',
    items: [
      {
        title: 'Auto-graded',
        description:
          'Candidates solve real problems checked against your test cases. Scoring is automatic, so there is no rubric to argue over.',
      },
      {
        title: 'Real coding, not trivia',
        description:
          'Skip the multiple-choice quizzes. Candidates write actual code in the language they would use on the job.',
      },
      {
        title: 'Candidate-friendly',
        description:
          'A clean editor, clear instructions, and no account to create. Candidates just open a link and start.',
      },
      {
        title: 'Fewer wasted interviews',
        description:
          'Filter your pipeline before anyone gets on a call. Your team spends its time on the strongest candidates.',
      },
      {
        title: 'Hidden test cases',
        description:
          'Keep some tests private so candidates cannot hardcode the answers. You see exactly what passed and what did not.',
      },
      {
        title: 'Open source',
        description:
          'CoderScreen is fully open source. Inspect the code, self-host, or contribute.',
      },
    ],
  },
  features: {
    title: 'Everything you need to screen at scale',
    items: [
      {
        title: 'A reusable question library',
        description:
          'Build your coding questions once and drop them into any assessment. See how each question performs over time so you keep the ones that actually tell candidates apart.',
        bullets: [
          'Reuse questions across every assessment',
          'Track times taken and average score per question',
          'Build a bank of questions your whole team can pull from',
        ],
        visual: <AssessmentVisual />,
      },
      {
        title: 'Weighted scoring you control',
        description:
          'Assign points per question so the harder problems count for more. Every candidate comes back with one clear, weighted score you can rank by.',
        bullets: [
          'Set points per question',
          'One weighted score per candidate',
          'Sort and compare your whole pipeline at a glance',
        ],
        visual: <AssessmentVisual />,
      },
      {
        title: 'Auto-grading in their language',
        description:
          'Candidates solve real problems in the language they choose, and we run their code against your test cases automatically across 20+ languages.',
        bullets: [
          '20+ languages supported',
          'Visible and hidden test cases',
          'Instant, consistent scoring with no manual review',
        ],
        visual: <TakeHomeVisual />,
      },
    ],
  },
  faq: [
    {
      question: 'How are assessments graded?',
      answer:
        'Each question runs the candidate code against your test cases and scores it automatically. You can weight questions by points, so harder problems count for more, and every candidate gets one clear weighted score.',
    },
    {
      question: 'Can I reuse questions across assessments?',
      answer:
        'Yes. Questions live in a shared library, so you build them once and add them to any assessment. You can also see how each question performs over time to keep the ones that work.',
    },
    {
      question: 'What languages are supported?',
      answer:
        'Candidates can solve assessments in 20+ languages, and their code is graded automatically in the language they choose.',
    },
    {
      question: 'Can candidates cheat?',
      answer:
        'You can mark test cases as hidden so candidates cannot simply hardcode the expected output. You see exactly which visible and hidden tests passed.',
    },
    {
      question: 'Do candidates need an account?',
      answer:
        'No. You invite a candidate by email and they open a link to start. There is nothing for them to install or sign up for.',
    },
  ],
};

export default function AssessmentsPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Assessments', href: '/assessments' },
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
