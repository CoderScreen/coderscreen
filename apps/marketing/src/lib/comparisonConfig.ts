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
  'codesignal-vs-leetcode': {
    slug: 'codesignal-vs-leetcode',
    toolA: {
      name: 'codesignal',
      displayName: 'CodeSignal',
    },
    toolB: {
      name: 'leetcode',
      displayName: 'LeetCode',
    },
    hero: {
      title: 'CodeSignal vs LeetCode',
      subtitle: 'Enterprise assessments vs algorithmic practice for hiring',
      description:
        'Compare CodeSignal and LeetCode side-by-side. One focuses on enterprise pre-screening, the other on algorithmic practice. See which fits your hiring process.',
    },
    seo: {
      title: 'CodeSignal vs LeetCode: Assessment Platform Comparison',
      description:
        'Comparing CodeSignal vs LeetCode for developer hiring? See our breakdown of features, pricing, and which platform fits your technical hiring needs.',
      keywords: [
        'codesignal vs leetcode',
        'leetcode vs codesignal',
        'codesignal or leetcode',
        'coding assessment comparison',
        'technical screening tools',
        'developer assessment platforms',
      ],
    },
    verdict: {
      summary:
        'CodeSignal is built for enterprise hiring with pre-built assessments and anti-cheating measures. LeetCode is primarily a practice platform adapted for hiring. Neither offers live collaborative interviews.',
      toolABestFor:
        'Enterprise teams needing standardized pre-screening assessments with anti-cheating features',
      toolBBestFor:
        'Teams that want to leverage a well-known platform candidates already practice on',
      coderScreenAdvantage:
        'CoderScreen offers live collaborative interviews, system design whiteboard, and open-source transparency — filling the gap both platforms leave for real-time technical evaluation.',
    },
    comparison: {
      features: [
        { name: 'Live Collaboration', toolA: false, toolB: false, coderScreen: true },
        { name: 'Automated Assessments', toolA: true, toolB: true, coderScreen: true },
        { name: 'System Design Whiteboard', toolA: false, toolB: false, coderScreen: true },
        { name: 'Open Source', toolA: false, toolB: false, coderScreen: true },
        { name: 'Question Library', toolA: 'Pre-built', toolB: '3000+', coderScreen: 'Custom' },
        { name: 'Interview Recording', toolA: false, toolB: false, coderScreen: true },
        { name: 'AI Integration', toolA: true, toolB: false, coderScreen: true },
        { name: 'ATS Integrations', toolA: true, toolB: false, coderScreen: true },
        { name: 'Anti-Cheating', toolA: 'Advanced', toolB: 'Basic', coderScreen: true },
        { name: 'Candidate Practice Mode', toolA: false, toolB: true, coderScreen: false },
      ],
    },
    pricing: {
      toolAPrice: 'Custom',
      toolBPrice: '$299/year',
      coderScreenPrice: '$50/month',
      toolANotes: 'Sales call required',
      toolBNotes: 'Per-candidate pricing for teams',
      coderScreenNotes: '20 interviews included',
    },
    faq: [
      {
        question: 'Is CodeSignal or LeetCode better for technical hiring?',
        answer:
          'CodeSignal is purpose-built for hiring with standardized assessments and enterprise features. LeetCode is a practice platform with hiring add-ons. CoderScreen combines assessment with live interviews in one tool.',
      },
      {
        question: 'Do candidates prefer CodeSignal or LeetCode?',
        answer:
          'Candidates are generally more familiar with LeetCode from interview prep. CodeSignal assessments can feel opaque. CoderScreen focuses on practical coding tasks that reflect real work.',
      },
      {
        question: 'Which platform has better anti-cheating measures?',
        answer:
          'CodeSignal has more advanced proctoring and anti-cheating technology. LeetCode has basic plagiarism detection. CoderScreen uses live interviews where cheating is naturally prevented.',
      },
      {
        question: 'Can I do live interviews on CodeSignal or LeetCode?',
        answer:
          'Neither platform is designed for live collaborative interviews. CodeSignal has a basic interview mode, but it lacks real-time collaboration. CoderScreen was built specifically for live pair programming.',
      },
      {
        question: 'How do pricing models compare?',
        answer:
          'CodeSignal requires a sales call with custom enterprise pricing. LeetCode charges per-candidate for teams at $299/year base. CoderScreen starts at $50/month with 20 interviews included.',
      },
    ],
  },
  'hackerrank-vs-leetcode': {
    slug: 'hackerrank-vs-leetcode',
    toolA: {
      name: 'hackerrank',
      displayName: 'HackerRank',
    },
    toolB: {
      name: 'leetcode',
      displayName: 'LeetCode',
    },
    hero: {
      title: 'HackerRank vs LeetCode',
      subtitle: 'The two biggest names in coding challenges — compared for hiring',
      description:
        'HackerRank and LeetCode are the most recognized platforms in technical hiring. See how they compare on features, pricing, and effectiveness for your team.',
    },
    seo: {
      title: 'HackerRank vs LeetCode: Which Is Better for Hiring?',
      description:
        'Comparing HackerRank vs LeetCode for technical hiring? See our detailed feature comparison, pricing, and which platform works best for your team.',
      keywords: [
        'hackerrank vs leetcode',
        'leetcode vs hackerrank',
        'hackerrank or leetcode',
        'hackerrank vs leetcode for hiring',
        'coding challenge platforms',
        'technical assessment comparison',
      ],
    },
    verdict: {
      summary:
        'HackerRank is built for enterprise hiring with automated assessments and a massive question library. LeetCode is primarily a practice platform that many teams use informally. Neither excels at live interviews.',
      toolABestFor:
        'Enterprise teams needing automated screening at scale with plagiarism detection and ATS integrations',
      toolBBestFor:
        'Teams comfortable with a familiar platform that candidates already know and practice on',
      coderScreenAdvantage:
        'CoderScreen provides the live collaboration missing from both platforms, plus system design tools and open-source transparency at a fraction of the cost.',
    },
    comparison: {
      features: [
        { name: 'Live Collaboration', toolA: false, toolB: false, coderScreen: true },
        { name: 'Automated Assessments', toolA: true, toolB: true, coderScreen: true },
        { name: 'System Design Whiteboard', toolA: false, toolB: false, coderScreen: true },
        { name: 'Open Source', toolA: false, toolB: false, coderScreen: true },
        { name: 'Question Library', toolA: '2000+', toolB: '3000+', coderScreen: 'Custom' },
        { name: 'Interview Recording', toolA: false, toolB: false, coderScreen: true },
        { name: 'AI Integration', toolA: true, toolB: false, coderScreen: true },
        { name: 'ATS Integrations', toolA: true, toolB: false, coderScreen: true },
        { name: 'Plagiarism Detection', toolA: 'Advanced', toolB: 'Basic', coderScreen: true },
        { name: 'Multiple Languages', toolA: '40+', toolB: '20+', coderScreen: '12+' },
      ],
    },
    pricing: {
      toolAPrice: '$199/month',
      toolBPrice: '$299/year',
      coderScreenPrice: '$50/month',
      toolANotes: '10 attempts included',
      toolBNotes: 'Per-candidate pricing for teams',
      coderScreenNotes: '20 interviews included',
    },
    faq: [
      {
        question: 'Is HackerRank or LeetCode better for hiring developers?',
        answer:
          'HackerRank is purpose-built for hiring with enterprise features, ATS integrations, and standardized assessments. LeetCode is better known as a practice tool. CoderScreen handles both assessment and live interviews.',
      },
      {
        question: 'Which has more coding problems?',
        answer:
          'LeetCode has 3000+ problems focused on algorithms and data structures. HackerRank has 2000+ covering a broader range including databases and DevOps. CoderScreen focuses on custom questions that match your actual tech stack.',
      },
      {
        question: 'Do candidates prefer HackerRank or LeetCode?',
        answer:
          'Most developers practice on LeetCode, so they may feel more comfortable there. HackerRank assessments can feel impersonal. CoderScreen focuses on live interviews where candidates can show their real skills.',
      },
      {
        question: 'Which is more affordable?',
        answer:
          'HackerRank starts at $199/month. LeetCode for teams charges per-candidate at $299/year base. CoderScreen is the most affordable at $50/month with 20 interviews included.',
      },
      {
        question: 'Can either platform do live coding interviews?',
        answer:
          'Neither HackerRank nor LeetCode was built for live collaborative interviews. For real-time pair programming and system design, CoderScreen is purpose-built with live collaboration tools.',
      },
    ],
  },
  'codesignal-vs-hackerrank': {
    slug: 'codesignal-vs-hackerrank',
    toolA: {
      name: 'codesignal',
      displayName: 'CodeSignal',
    },
    toolB: {
      name: 'hackerrank',
      displayName: 'HackerRank',
    },
    hero: {
      title: 'CodeSignal vs HackerRank',
      subtitle: 'Two enterprise assessment platforms compared head-to-head',
      description:
        'CodeSignal and HackerRank are the leading enterprise assessment platforms. Compare their features, pricing, and approach to technical hiring.',
    },
    seo: {
      title: 'CodeSignal vs HackerRank: Assessment Tools Compared',
      description:
        'Comparing CodeSignal vs HackerRank for technical assessments? See our detailed feature comparison, pricing, and the best alternative.',
      keywords: [
        'codesignal vs hackerrank',
        'hackerrank vs codesignal',
        'codesignal or hackerrank',
        'enterprise coding assessment',
        'technical screening comparison',
        'developer assessment tools',
      ],
    },
    verdict: {
      summary:
        'Both are strong enterprise assessment platforms. CodeSignal focuses on standardized, research-backed evaluations. HackerRank offers a broader question library and more flexibility. Neither is built for live interviews.',
      toolABestFor:
        'Enterprise teams wanting standardized, research-backed pre-screening with strong anti-cheating',
      toolBBestFor:
        'Teams needing a large question library, flexible assessments, and broad language support',
      coderScreenAdvantage:
        'CoderScreen adds live collaborative interviews, system design tools, and open-source transparency that both enterprise platforms lack — at a lower price.',
    },
    comparison: {
      features: [
        { name: 'Live Collaboration', toolA: false, toolB: false, coderScreen: true },
        { name: 'Automated Assessments', toolA: true, toolB: true, coderScreen: true },
        { name: 'System Design Whiteboard', toolA: false, toolB: false, coderScreen: true },
        { name: 'Open Source', toolA: false, toolB: false, coderScreen: true },
        { name: 'Question Library', toolA: 'Pre-built', toolB: '2000+', coderScreen: 'Custom' },
        { name: 'Interview Recording', toolA: false, toolB: false, coderScreen: true },
        { name: 'AI Integration', toolA: true, toolB: true, coderScreen: true },
        { name: 'ATS Integrations', toolA: true, toolB: true, coderScreen: true },
        { name: 'Anti-Cheating', toolA: 'Advanced', toolB: 'Advanced', coderScreen: true },
        { name: 'Multiple Languages', toolA: '40+', toolB: '40+', coderScreen: '12+' },
      ],
    },
    pricing: {
      toolAPrice: 'Custom',
      toolBPrice: '$199/month',
      coderScreenPrice: '$50/month',
      toolANotes: 'Sales call required',
      toolBNotes: '10 attempts included',
      coderScreenNotes: '20 interviews included',
    },
    faq: [
      {
        question: 'Is CodeSignal or HackerRank better for enterprise hiring?',
        answer:
          'Both serve enterprise teams well. CodeSignal is stronger on standardized evaluations and anti-cheating. HackerRank offers more question variety and flexibility. CoderScreen complements either with live interview capabilities.',
      },
      {
        question: 'Which platform has better anti-cheating features?',
        answer:
          'Both have strong anti-cheating measures. CodeSignal uses advanced proctoring and screen monitoring. HackerRank has plagiarism detection and browser lockdown. CoderScreen uses live interviews where proctoring is built-in.',
      },
      {
        question: 'How transparent is pricing?',
        answer:
          'HackerRank publishes starting prices ($199/month). CodeSignal requires a sales call for pricing. CoderScreen is fully transparent at $50/month with no hidden costs.',
      },
      {
        question: 'Can I use these for live coding interviews?',
        answer:
          'Neither CodeSignal nor HackerRank excels at live collaborative interviews. For real-time pair programming and system design, CoderScreen is purpose-built with a collaborative editor and whiteboard.',
      },
      {
        question: 'Which has a better candidate experience?',
        answer:
          'Both platforms focus on automated testing which can feel impersonal. CoderScreen emphasizes live, human interaction with a modern interface that makes candidates feel like they are actually working rather than being tested.',
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
