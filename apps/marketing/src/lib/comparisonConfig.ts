import { FAQItem } from './alternativeConfig';

export interface ComparisonFeature {
  name: string;
  toolA: string | boolean;
  toolB: string | boolean;
  coderScreen: string | boolean;
}

export interface ComparisonData {
  slug: string;
  toolA: {
    name: string;
    displayName: string;
  };
  toolB: {
    name: string;
    displayName: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  verdict: {
    summary: string;
    toolABestFor: string;
    toolBBestFor: string;
    coderScreenAdvantage: string;
  };
  comparison: {
    features: ComparisonFeature[];
  };
  pricing: {
    toolAPrice: string;
    toolBPrice: string;
    coderScreenPrice: string;
    toolANotes?: string;
    toolBNotes?: string;
    coderScreenNotes?: string;
  };
  faq: FAQItem[];
}

export const comparisonData: Record<string, ComparisonData> = {
  'coderpad-vs-hackerrank': {
    slug: 'coderpad-vs-hackerrank',
    toolA: {
      name: 'coderpad',
      displayName: 'CoderPad',
    },
    toolB: {
      name: 'hackerrank',
      displayName: 'HackerRank',
    },
    hero: {
      title: 'CoderPad vs HackerRank',
      subtitle: 'Which technical interview platform is right for your team?',
      description:
        'Compare CoderPad and HackerRank side-by-side to find the best coding interview platform for your hiring needs. We break down features, pricing, and use cases.',
    },
    seo: {
      title: 'CoderPad vs HackerRank: Complete Comparison Guide 2026 | CoderScreen',
      description:
        'Comparing CoderPad vs HackerRank for technical interviews? See our detailed breakdown of features, pricing, and pros/cons.',
      keywords: [
        'coderpad vs hackerrank',
        'coderpad or hackerrank',
        'hackerrank vs coderpad',
        'coderpad hackerrank comparison',
        'best coding interview platform',
        'technical interview tools comparison',
      ],
    },
    verdict: {
      summary:
        'CoderPad excels at live collaborative coding interviews, while HackerRank is better for automated assessments and screening at scale. Both have significant limitations that CoderScreen addresses.',
      toolABestFor:
        'Teams prioritizing live pair programming interviews with real-time collaboration',
      toolBBestFor:
        'High-volume hiring with automated coding assessments and a large question library',
      coderScreenAdvantage:
        'CoderScreen combines the best of both: live collaboration like CoderPad, assessment capabilities, plus open-source transparency and system design tools neither offers.',
    },
    comparison: {
      features: [
        { name: 'Live Collaboration', toolA: true, toolB: false, coderScreen: true },
        { name: 'Automated Assessments', toolA: false, toolB: true, coderScreen: true },
        { name: 'System Design Whiteboard', toolA: false, toolB: false, coderScreen: true },
        { name: 'Open Source', toolA: false, toolB: false, coderScreen: true },
        { name: 'Question Library', toolA: 'Limited', toolB: '2000+', coderScreen: 'Custom' },
        { name: 'Interview Recording', toolA: true, toolB: false, coderScreen: true },
        { name: 'AI Integration', toolA: false, toolB: true, coderScreen: true },
        { name: 'ATS Integrations', toolA: true, toolB: true, coderScreen: true },
        { name: 'Plagiarism Detection', toolA: false, toolB: true, coderScreen: true },
        { name: 'Multiple Languages', toolA: '30+', toolB: '40+', coderScreen: '12+' },
      ],
    },
    pricing: {
      toolAPrice: '$100/month',
      toolBPrice: '$199/month',
      coderScreenPrice: '$50/month',
      toolANotes: '5 interviews included',
      toolBNotes: '10 attempts included',
      coderScreenNotes: '20 interviews included',
    },
    faq: [
      {
        question: 'Is CoderPad or HackerRank better for live interviews?',
        answer:
          'CoderPad is better for live interviews with its real-time collaboration features. HackerRank is primarily designed for automated assessments. However, CoderScreen offers the best of both with live collaboration and assessment capabilities.',
      },
      {
        question: 'Which platform has better pricing?',
        answer:
          "CoderPad starts at $100/month for 5 interviews, HackerRank at $199/month for 10 attempts. CoderScreen offers 20 interviews for $50/month, making it the most cost-effective option.",
      },
      {
        question: 'Can I use both CoderPad and HackerRank together?',
        answer:
          "Some teams use HackerRank for initial screening and CoderPad for live interviews. This adds complexity and cost. CoderScreen handles both use cases in one platform.",
      },
      {
        question: 'Which platform is better for system design interviews?',
        answer:
          'Neither CoderPad nor HackerRank have built-in whiteboard tools for system design. CoderScreen includes a collaborative whiteboard specifically designed for architecture discussions.',
      },
      {
        question: 'How do the question libraries compare?',
        answer:
          "HackerRank has the largest library with 2000+ questions. CoderPad has a limited set. CoderScreen focuses on custom questions tailored to your tech stack, which often better predicts job performance.",
      },
    ],
  },
  'coderbyte-vs-hackerrank': {
    slug: 'coderbyte-vs-hackerrank',
    toolA: {
      name: 'coderbyte',
      displayName: 'Coderbyte',
    },
    toolB: {
      name: 'hackerrank',
      displayName: 'HackerRank',
    },
    hero: {
      title: 'Coderbyte vs HackerRank',
      subtitle: 'Comparing two popular coding assessment platforms',
      description:
        'A detailed comparison of Coderbyte and HackerRank to help you choose the right technical assessment platform for your hiring process.',
    },
    seo: {
      title: 'Coderbyte vs HackerRank: Which Platform is Better? | CoderScreen',
      description:
        'Comparing Coderbyte vs HackerRank for developer hiring? See our detailed feature comparison, pricing breakdown, and why teams are choosing CoderScreen instead.',
      keywords: [
        'coderbyte vs hackerrank',
        'hackerrank vs coderbyte',
        'coderbyte or hackerrank',
        'coding assessment comparison',
        'developer assessment tools',
        'technical screening platforms',
      ],
    },
    verdict: {
      summary:
        'Both platforms focus on automated coding assessments. HackerRank offers more scale and enterprise features, while Coderbyte is more affordable for smaller teams. Neither excels at live interviews.',
      toolABestFor:
        'Smaller teams wanting affordable coding challenges with a modern interface',
      toolBBestFor:
        'Enterprise teams needing large question libraries and advanced plagiarism detection',
      coderScreenAdvantage:
        'CoderScreen offers what both lack: live collaborative interviews, system design tools, and open-source transparency at a lower price point.',
    },
    comparison: {
      features: [
        { name: 'Live Collaboration', toolA: false, toolB: false, coderScreen: true },
        { name: 'Automated Assessments', toolA: true, toolB: true, coderScreen: true },
        { name: 'System Design Whiteboard', toolA: false, toolB: false, coderScreen: true },
        { name: 'Open Source', toolA: false, toolB: false, coderScreen: true },
        { name: 'Question Library', toolA: '300+', toolB: '2000+', coderScreen: 'Custom' },
        { name: 'Interview Recording', toolA: false, toolB: false, coderScreen: true },
        { name: 'AI Integration', toolA: true, toolB: true, coderScreen: true },
        { name: 'ATS Integrations', toolA: true, toolB: true, coderScreen: true },
        { name: 'Plagiarism Detection', toolA: 'Basic', toolB: 'Advanced', coderScreen: true },
        { name: 'Modern Interface', toolA: false, toolB: false, coderScreen: true },
      ],
    },
    pricing: {
      toolAPrice: '$199/month',
      toolBPrice: '$199/month',
      coderScreenPrice: '$50/month',
      toolANotes: '10 candidates',
      toolBNotes: '10 attempts',
      coderScreenNotes: '20 interviews',
    },
    faq: [
      {
        question: 'Which has more coding challenges - Coderbyte or HackerRank?',
        answer:
          'HackerRank has a significantly larger library with 2000+ questions compared to Coderbyte\'s 300+. However, custom questions tailored to your stack often work better than generic challenges.',
      },
      {
        question: 'Is Coderbyte or HackerRank better for small companies?',
        answer:
          "Both start around $199/month. Coderbyte is slightly more accessible for smaller teams. CoderScreen at $50/month is more affordable for startups and small companies.",
      },
      {
        question: 'Can I do live coding interviews on either platform?',
        answer:
          'Both platforms focus on automated assessments rather than live interviews. For real-time pair programming, consider CoderScreen which was built specifically for live collaboration.',
      },
      {
        question: 'Which platform has better enterprise features?',
        answer:
          'HackerRank has more enterprise features including advanced plagiarism detection, SSO, and dedicated support. Coderbyte is better suited for mid-market companies.',
      },
      {
        question: 'How do candidates feel about these platforms?',
        answer:
          'Both platforms can feel impersonal with automated tests. Many candidates prefer live interviews where they can demonstrate problem-solving skills and ask questions, which CoderScreen enables.',
      },
    ],
  },
};
