export interface FeatureComparison {
  name: string;
  coderScreenHas: boolean;
  competitorHas: boolean;
  isCoreFeature?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CompetitorData {
  name: string;
  displayName: string;
  slug: string;
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
  whySwitch: {
    title: string;
    reasons: Array<{
      title: string;
      description: string;
    }>;
  };
  faq: FAQItem[];
  comparison: {
    features: FeatureComparison[];
  };
  pricing: {
    title: string;
    description: string;
    plans: Array<{
      name: string;
      coderScreenPrice: string;
      competitorPrice: string;
      coderScreenFeatures: string[];
      competitorFeatures: string[];
    }>;
  };
}

export const competitorData: Record<string, CompetitorData> = {
  'coderpad-alternative': {
    name: 'coderpad',
    displayName: 'CoderPad',
    slug: 'coderpad-alternative',
    hero: {
      title: 'The open-source CoderPad alternative',
      subtitle: 'A modern, open-source platform for technical interviews',
      description:
        'CoderScreen is the open-source alternative to CoderPad, offering transparency, customization, and community-driven development for technical interviews.',
    },
    seo: {
      title: 'CoderPad Alternative - Open Source Technical Interview Platform | CoderScreen',
      description:
        'Looking for a CoderPad alternative? CoderScreen offers live coding interviews, collaborative whiteboard, AI integration, and transparent pricing. Free plan available.',
      keywords: [
        'coderpad alternative',
        'coderpad free alternative',
        'coderpad competitors',
        'coderpad vs coderscreen',
        'open source coderpad',
        'coding interview platform',
        'live coding interview tool',
      ],
    },
    whySwitch: {
      title: 'Why teams switch from CoderPad to CoderScreen',
      reasons: [
        {
          title: 'Open Source & Transparent',
          description:
            'Unlike CoderPad, CoderScreen is fully open source. Inspect the code, contribute features, and never worry about vendor lock-in.',
        },
        {
          title: 'Modern Developer Experience',
          description:
            'Built with the latest technologies, CoderScreen offers a faster, more intuitive interface that candidates and interviewers love.',
        },
        {
          title: 'Collaborative Whiteboard Included',
          description:
            'System design interviews are first-class citizens. Our built-in whiteboard supports real-time collaboration without extra cost.',
        },
        {
          title: 'AI-Powered Insights',
          description:
            'Get AI-assisted candidate evaluation and interview summaries to make better hiring decisions faster.',
        },
        {
          title: 'Better Value',
          description:
            'Get more interviews per month, advanced features, and priority support at a fraction of CoderPad pricing.',
        },
        {
          title: 'Interview Playback',
          description:
            'Review every keystroke and decision with full interview playback. Share recordings with your team for collaborative evaluation.',
        },
      ],
    },
    faq: [
      {
        question: 'Can I migrate my questions from CoderPad to CoderScreen?',
        answer:
          'Yes! You can easily import your existing coding challenges and questions into CoderScreen. Our support team can help you migrate your question library.',
      },
      {
        question: 'Does CoderScreen support the same programming languages as CoderPad?',
        answer:
          'CoderScreen supports TypeScript, Python, JavaScript, Go, Rust, Java, C, C++, PHP, Ruby, Bash, and more. We continuously add new languages based on community feedback.',
      },
      {
        question: 'Is there a free plan available?',
        answer:
          'Yes! Our Basic tier includes core features and up to 3 interviews per month at no cost. No credit card required to get started.',
      },
      {
        question: 'How does CoderScreen pricing compare to CoderPad?',
        answer:
          'CoderScreen offers significantly more interviews per month at lower price points. Our Starter plan at $50/month includes 20 interviews, while CoderPad charges $100/month for just 5 interviews.',
      },
      {
        question: 'Can I use CoderScreen for system design interviews?',
        answer:
          'Absolutely! Unlike CoderPad, CoderScreen includes a collaborative whiteboard specifically designed for system design interviews at no extra cost.',
      },
    ],
    comparison: {
      features: [
        { name: 'Open Source', coderScreenHas: true, competitorHas: false, isCoreFeature: true },
        {
          name: 'Live Collaboration',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        { name: 'AI Integration', coderScreenHas: true, competitorHas: false },
        { name: 'Collaborative Whiteboard', coderScreenHas: true, competitorHas: false },
        { name: 'System Design Tools', coderScreenHas: true, competitorHas: false },
        { name: 'Modern Interface', coderScreenHas: true, competitorHas: false },
        {
          name: 'Real-time Coding',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        {
          name: 'Multiple Languages',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        { name: 'Interview Recording', coderScreenHas: true, competitorHas: true },
      ],
    },
    pricing: {
      title: "How do CoderPad's plans compare?",
      description:
        "Get more interviews, advanced features, and a better candidate experience for less with CoderScreen's transparent pricing.",
      plans: [
        {
          name: 'Starter',
          coderScreenPrice: '$50/month',
          competitorPrice: '$100/month',
          coderScreenFeatures: [
            '20 interviews/month',
            '5 team members',
            'Advanced interviews & whiteboard',
            'API access & integrations',
            'Interview playback',
            'Priority support',
          ],
          competitorFeatures: [
            '5 interviews/month',
            'Unlimited users',
            'Basic coding sessions only',
            'Sample questions & reports',
            'Basic code playback',
            'Basic support',
          ],
        },
        {
          name: 'Scale',
          coderScreenPrice: '$350/month',
          competitorPrice: '$375/month',
          coderScreenFeatures: [
            '200 interviews/month',
            'Unlimited team members',
            'Advanced interviews & whiteboard',
            'API access & integrations',
            'ATS integrations',
            'Custom branding & domains',
            'Dedicated support',
          ],
          competitorFeatures: [
            '30 interviews/month',
            'Unlimited users',
            'Basic coding sessions only',
            '1,400 ready-to-use questions',
            '20 custom questions',
            'Email support',
          ],
        },
      ],
    },
  },
  'hackerrank-alternative': {
    name: 'hackerrank',
    displayName: 'HackerRank',
    slug: 'hackerrank-alternative',
    hero: {
      title: 'The open-source HackerRank alternative',
      subtitle: 'An open-source platform for comprehensive technical interviews',
      description:
        'CoderScreen is the open-source alternative to HackerRank, providing transparency, customization, and community-driven development for technical interviews.',
    },
    seo: {
      title: 'HackerRank Alternative - Modern Technical Interview Platform | CoderScreen',
      description:
        'Looking for a HackerRank alternative? CoderScreen offers live coding interviews, real-time collaboration, interview playback, and better pricing. Try free today.',
      keywords: [
        'hackerrank alternative',
        'hackerrank competitors',
        'hackerrank vs coderscreen',
        'better than hackerrank',
        'coding assessment platform',
        'technical screening tool',
        'developer assessment',
      ],
    },
    whySwitch: {
      title: 'Why teams switch from HackerRank to CoderScreen',
      reasons: [
        {
          title: 'Live Collaboration Focus',
          description:
            'While HackerRank focuses on automated assessments, CoderScreen prioritizes real-time collaboration between interviewers and candidates.',
        },
        {
          title: 'Interview Recording & Playback',
          description:
            'Record and replay every interview session. Review candidate thought processes and share with your hiring team.',
        },
        {
          title: 'No Per-Attempt Pricing',
          description:
            'HackerRank charges $20 per additional attempt. CoderScreen offers predictable monthly pricing with generous interview limits.',
        },
        {
          title: 'Open Source Transparency',
          description:
            'See exactly how the platform works. Contribute features, report issues, and never worry about opaque algorithms.',
        },
        {
          title: 'Built-in Whiteboard',
          description:
            'Conduct system design interviews with our collaborative whiteboard. No need for separate tools or screen sharing.',
        },
        {
          title: 'Modern Tech Stack',
          description:
            'Built with React, TypeScript, and modern tooling. Candidates experience a familiar, responsive development environment.',
        },
      ],
    },
    faq: [
      {
        question: 'How is CoderScreen different from HackerRank?',
        answer:
          'CoderScreen focuses on live, collaborative interviews while HackerRank emphasizes automated assessments. CoderScreen includes features like real-time collaboration, interview playback, and collaborative whiteboard that HackerRank lacks.',
      },
      {
        question: 'Does CoderScreen have a question library like HackerRank?',
        answer:
          'Yes! CoderScreen includes a Question Library where you can create, organize, and reuse interview questions. You can also import questions from other platforms.',
      },
      {
        question: 'Can I run automated coding assessments with CoderScreen?',
        answer:
          'CoderScreen supports both live interviews and take-home assessments with automated test case validation. You get the best of both worlds.',
      },
      {
        question: 'What about plagiarism detection?',
        answer:
          'CoderScreen includes code similarity checking and interview playback so you can verify candidate work is original by reviewing their problem-solving process.',
      },
      {
        question: 'Is CoderScreen suitable for high-volume hiring?',
        answer:
          'Absolutely! Our Scale plan supports 200 interviews per month with unlimited team members, ATS integrations, and dedicated support.',
      },
    ],
    comparison: {
      features: [
        { name: 'Open Source', coderScreenHas: true, competitorHas: false, isCoreFeature: true },
        { name: 'Live Collaboration', coderScreenHas: true, competitorHas: false },
        { name: 'AI Integration', coderScreenHas: true, competitorHas: true },
        { name: 'Collaborative Whiteboard', coderScreenHas: true, competitorHas: false },
        { name: 'System Design Tools', coderScreenHas: true, competitorHas: false },
        { name: 'Modern Interface', coderScreenHas: true, competitorHas: false },
        {
          name: 'Real-time Coding',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        {
          name: 'Multiple Languages',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        { name: 'Interview Recording', coderScreenHas: true, competitorHas: false },
      ],
    },
    pricing: {
      title: 'Complete solution, transparent pricing',
      description:
        "Get unlimited interviews and advanced features for less than HackerRank's limited plans",
      plans: [
        {
          name: 'Starter',
          coderScreenPrice: '$50/month',
          competitorPrice: '$199/month',
          coderScreenFeatures: [
            '20 interviews/month',
            '5 team members',
            'Live interviews & whiteboard',
            'AI integration',
            'Interview playback',
            'API access',
            'Priority support',
          ],
          competitorFeatures: [
            '10 attempts/month',
            '1 user',
            'Screen + Interview access',
            '2000+ questions',
            '$20 per additional attempt',
            'Advanced plagiarism detection',
            'Basic support',
          ],
        },
        {
          name: 'Pro',
          coderScreenPrice: '$350/month',
          competitorPrice: '$449/month',
          coderScreenFeatures: [
            '200 interviews/month',
            'Unlimited team members',
            'Live interviews & whiteboard',
            'AI integration',
            'ATS integrations',
            'Custom branding',
            'Dedicated support',
          ],
          competitorFeatures: [
            '25 attempts/month',
            'Unlimited users',
            'Screen + Interview access',
            'Advanced plagiarism detection',
            'ATS integrations',
          ],
        },
      ],
    },
  },
  'codesignal-alternative': {
    name: 'codesignal',
    displayName: 'CodeSignal',
    slug: 'codesignal-alternative',
    hero: {
      title: 'The open-source CodeSignal alternative',
      subtitle: 'An open-source platform for transparent technical assessments',
      description:
        'CoderScreen is the open-source alternative to CodeSignal, offering full transparency, customization, and community-driven development for technical assessments.',
    },
    seo: {
      title: 'CodeSignal Alternative - Transparent Technical Assessments | CoderScreen',
      description:
        'Looking for a CodeSignal alternative with transparent pricing? CoderScreen offers live interviews, system design tools, and open-source transparency. No sales calls required.',
      keywords: [
        'codesignal alternative',
        'codesignal competitors',
        'codesignal vs coderscreen',
        'codesignal pricing',
        'technical assessment platform',
        'coding skills assessment',
        'developer screening',
      ],
    },
    whySwitch: {
      title: 'Why teams choose CoderScreen over CodeSignal',
      reasons: [
        {
          title: 'Transparent Pricing',
          description:
            'No sales calls required. See our pricing upfront and start immediately. CodeSignal requires enterprise contracts with hidden costs.',
        },
        {
          title: 'Live Interview Support',
          description:
            'CodeSignal focuses on automated assessments. CoderScreen excels at live, collaborative technical interviews.',
        },
        {
          title: 'Real-time Collaboration',
          description:
            'Watch candidates code in real-time, provide hints, and collaborate on solutions. True pair programming experience.',
        },
        {
          title: 'Open Source',
          description:
            'Full transparency into how the platform works. No black-box algorithms or opaque scoring systems.',
        },
        {
          title: 'Flexible Problem Solving',
          description:
            'Create custom challenges tailored to your tech stack. Not limited to standardized question banks.',
        },
        {
          title: 'System Design Ready',
          description:
            'Built-in whiteboard for architecture discussions. Evaluate senior candidates on real-world design problems.',
        },
      ],
    },
    faq: [
      {
        question: 'What is CodeSignal pricing?',
        answer:
          'CodeSignal requires enterprise contracts and sales calls to get pricing. CoderScreen offers transparent pricing starting with a free tier, $50/month Starter, and $350/month Scale plans.',
      },
      {
        question: 'Does CoderScreen offer standardized assessments like CodeSignal?',
        answer:
          'CoderScreen focuses on customizable interviews rather than standardized tests. You can create your own question library tailored to your specific tech stack and requirements.',
      },
      {
        question: 'Can I use CoderScreen for pre-screening candidates?',
        answer:
          'Yes! CoderScreen supports both live interviews and asynchronous take-home assessments with automated test case validation for pre-screening.',
      },
      {
        question: 'How does CoderScreen handle candidate evaluation?',
        answer:
          'CoderScreen provides AI-powered insights, interview playback, and structured evaluation tools. Review the complete problem-solving process, not just the final answer.',
      },
      {
        question: 'Is CoderScreen suitable for enterprise teams?',
        answer:
          'Yes! Our Scale plan includes unlimited team members, ATS integrations, custom branding, SSO, and dedicated support for enterprise needs.',
      },
    ],
    comparison: {
      features: [
        { name: 'Open Source', coderScreenHas: true, competitorHas: false, isCoreFeature: true },
        { name: 'Live Collaboration', coderScreenHas: true, competitorHas: false },
        { name: 'AI Integration', coderScreenHas: true, competitorHas: false },
        { name: 'Collaborative Whiteboard', coderScreenHas: true, competitorHas: false },
        { name: 'System Design Tools', coderScreenHas: true, competitorHas: false },
        { name: 'Modern Interface', coderScreenHas: true, competitorHas: false },
        { name: 'Real-time Coding', coderScreenHas: true, competitorHas: false },
        {
          name: 'Multiple Languages',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        { name: 'Interview Recording', coderScreenHas: true, competitorHas: false },
      ],
    },
    pricing: {
      title: 'Transparent pricing vs. hidden costs',
      description:
        'While CodeSignal requires a sales call for pricing, CoderScreen offers transparent, upfront pricing with more features',
      plans: [
        {
          name: 'Enterprise',
          coderScreenPrice: '$350/month',
          competitorPrice: 'Enterprise Contract',
          coderScreenFeatures: [
            'Live interview platform',
            'System design capabilities',
            'AI-powered insights',
            'Flexible problem solving',
            'Real-time collaboration',
            'Interview playback',
            'Transparent pricing',
          ],
          competitorFeatures: [
            'Technical assessments only',
            'Automated scoring',
            'Standardized questions',
            'Anti-cheating measures',
            'No live collaboration',
            'Basic reporting',
            'Hidden pricing structure',
          ],
        },
      ],
    },
  },
  'coderbyte-alternative': {
    name: 'coderbyte',
    displayName: 'Coderbyte',
    slug: 'coderbyte-alternative',
    hero: {
      title: 'The open-source Coderbyte alternative',
      subtitle: 'An open-source platform for transparent coding challenges',
      description:
        'CoderScreen is the open-source alternative to Coderbyte, providing full transparency, customization, and community-driven development for coding challenges.',
    },
    seo: {
      title: 'Coderbyte Alternative - Modern Coding Interview Platform | CoderScreen',
      description:
        'Looking for a Coderbyte alternative? CoderScreen offers live coding interviews, modern interface, real-time collaboration, and better value. Start free today.',
      keywords: [
        'coderbyte alternative',
        'coderbyte alternatives',
        'coderbyte competitors',
        'coderbyte vs coderscreen',
        'coderbyte vs hackerrank',
        'coding challenge platform',
        'technical interview tool',
      ],
    },
    whySwitch: {
      title: 'Why teams switch from Coderbyte to CoderScreen',
      reasons: [
        {
          title: 'Modern Interface',
          description:
            'Coderbyte\'s interface feels dated. CoderScreen offers a modern, fast experience that impresses candidates and interviewers alike.',
        },
        {
          title: 'Live Collaboration',
          description:
            'Real-time pair programming with candidates. See their cursor, provide hints, and collaborate on solutions together.',
        },
        {
          title: 'Better Value',
          description:
            'Get live interviews, whiteboard, and advanced features for $50/month. Coderbyte charges $199/month for basic features.',
        },
        {
          title: 'Open Source',
          description:
            'Transparent, community-driven development. See the code, contribute features, and never worry about vendor lock-in.',
        },
        {
          title: 'System Design Tools',
          description:
            'Evaluate architecture skills with our collaborative whiteboard. Essential for senior engineering roles.',
        },
        {
          title: 'Interview Playback',
          description:
            'Review exactly how candidates approached problems. Share recordings with hiring managers for better decisions.',
        },
      ],
    },
    faq: [
      {
        question: 'How does CoderScreen compare to Coderbyte for coding challenges?',
        answer:
          'While Coderbyte focuses on pre-built challenges, CoderScreen emphasizes live collaboration and custom problem creation. You get more flexibility to evaluate candidates on real-world scenarios.',
      },
      {
        question: 'Does CoderScreen have a question library?',
        answer:
          'Yes! Create, organize, and reuse interview questions with our Question Library. Add starter code, test cases, and markdown instructions.',
      },
      {
        question: 'Can I use CoderScreen for take-home assessments?',
        answer:
          'Absolutely! CoderScreen supports both live interviews and asynchronous take-home challenges with automated test validation.',
      },
      {
        question: 'Is CoderScreen free to try?',
        answer:
          'Yes! Our Basic tier includes core features and up to 3 interviews per month completely free. No credit card required.',
      },
      {
        question: 'What programming languages does CoderScreen support?',
        answer:
          'CoderScreen supports TypeScript, Python, JavaScript, Go, Rust, Java, C, C++, PHP, Ruby, Bash, and we continuously add more based on community requests.',
      },
    ],
    comparison: {
      features: [
        { name: 'Open Source', coderScreenHas: true, competitorHas: false, isCoreFeature: true },
        { name: 'Live Collaboration', coderScreenHas: true, competitorHas: false },
        { name: 'AI Integration', coderScreenHas: true, competitorHas: true },
        { name: 'Collaborative Whiteboard', coderScreenHas: true, competitorHas: false },
        { name: 'System Design Tools', coderScreenHas: true, competitorHas: false },
        { name: 'Modern Interface', coderScreenHas: true, competitorHas: false },
        { name: 'Real-time Coding', coderScreenHas: true, competitorHas: false },
        {
          name: 'Multiple Languages',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        { name: 'Interview Recording', coderScreenHas: true, competitorHas: false },
      ],
    },
    pricing: {
      title: 'More than just challenges',
      description: 'Get a complete interview platform for the price of basic challenges',
      plans: [
        {
          name: 'Pro',
          coderScreenPrice: '$50/month',
          competitorPrice: '$199/month',
          coderScreenFeatures: [
            'Live technical interviews',
            'System design & whiteboard',
            'Modern development practices',
            'AI tool evaluation',
            'Real-time collaboration',
            'Interview playback',
          ],
          competitorFeatures: [
            '10 candidates simultaneously',
            'Assessments and interviews',
            'Full library of questions',
            'AI-assisted features',
            'Outdated interface',
          ],
        },
      ],
    },
  },
  'leetcode-alternative': {
    name: 'leetcode',
    displayName: 'LeetCode',
    slug: 'leetcode-alternative',
    hero: {
      title: 'The open-source LeetCode alternative for hiring',
      subtitle: 'A modern platform designed for evaluating real-world coding skills',
      description:
        'CoderScreen is the hiring-focused alternative to LeetCode, offering live interviews, collaborative assessments, and practical problem-solving evaluation instead of algorithmic puzzle memorization.',
    },
    seo: {
      title: 'LeetCode Alternative for Hiring - Practical Technical Interviews | CoderScreen',
      description:
        'Looking for a LeetCode alternative for technical hiring? CoderScreen offers live coding interviews, real-world problems, and collaborative assessments. No algorithm memorization required.',
      keywords: [
        'leetcode alternative',
        'leetcode alternative for hiring',
        'leetcode for interviews',
        'leetcode vs coderscreen',
        'practical coding interview',
        'technical interview platform',
        'coding assessment tool',
      ],
    },
    whySwitch: {
      title: 'Why teams choose CoderScreen over LeetCode for hiring',
      reasons: [
        {
          title: 'Built for Hiring, Not Practice',
          description:
            'LeetCode is designed for individual practice. CoderScreen is purpose-built for technical interviews with collaboration, evaluation tools, and hiring workflows.',
        },
        {
          title: 'Real-World Problems',
          description:
            'Evaluate candidates on practical coding challenges, not algorithm trivia. Test skills that actually matter for the job.',
        },
        {
          title: 'Live Collaboration',
          description:
            'Watch candidates code in real-time, provide hints, and have technical discussions. True pair programming experience.',
        },
        {
          title: 'System Design Support',
          description:
            'LeetCode focuses only on algorithms. CoderScreen includes whiteboard tools for system design interviews essential for senior roles.',
        },
        {
          title: 'Interview Recording & Playback',
          description:
            'Review how candidates approached problems. Share recordings with hiring managers who couldn\'t attend live.',
        },
        {
          title: 'Open Source Transparency',
          description:
            'See exactly how the platform works. No proprietary black-box scoring or hidden evaluation criteria.',
        },
      ],
    },
    faq: [
      {
        question: 'Why use CoderScreen instead of LeetCode for hiring?',
        answer:
          'LeetCode is designed for individual practice and algorithm drilling. CoderScreen is purpose-built for technical interviews with live collaboration, interview recording, evaluation tools, and ATS integrations that LeetCode lacks.',
      },
      {
        question: 'Does CoderScreen have algorithm problems like LeetCode?',
        answer:
          'Yes, you can create algorithm challenges in CoderScreen. But we also support real-world coding problems, system design, and practical assessments that better predict job performance than LeetCode-style puzzles.',
      },
      {
        question: 'Can candidates practice on CoderScreen before interviews?',
        answer:
          'CoderScreen is focused on the interview experience rather than practice. For candidate preparation, the live interview environment helps them showcase real problem-solving skills rather than memorized solutions.',
      },
      {
        question: 'How does pricing compare to LeetCode Premium?',
        answer:
          'LeetCode Premium is $35/month per user for practice features. CoderScreen starts at $50/month for your entire team with 20 interviews, making it far more cost-effective for hiring.',
      },
      {
        question: 'Is LeetCode-style interviewing effective?',
        answer:
          'Research shows algorithm puzzles poorly predict job performance. CoderScreen enables practical assessments, pair programming, and system design interviews that better evaluate real engineering skills.',
      },
    ],
    comparison: {
      features: [
        { name: 'Open Source', coderScreenHas: true, competitorHas: false, isCoreFeature: true },
        { name: 'Live Collaboration', coderScreenHas: true, competitorHas: false },
        { name: 'AI Integration', coderScreenHas: true, competitorHas: true },
        { name: 'Collaborative Whiteboard', coderScreenHas: true, competitorHas: false },
        { name: 'System Design Tools', coderScreenHas: true, competitorHas: false },
        { name: 'Interview Recording', coderScreenHas: true, competitorHas: false },
        { name: 'Real-time Coding', coderScreenHas: true, competitorHas: false },
        {
          name: 'Multiple Languages',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        { name: 'ATS Integration', coderScreenHas: true, competitorHas: false },
      ],
    },
    pricing: {
      title: 'Purpose-built for hiring',
      description:
        'LeetCode is great for practice, but CoderScreen is built specifically for technical interviews',
      plans: [
        {
          name: 'Team Hiring',
          coderScreenPrice: '$50/month',
          competitorPrice: '$35/user/month',
          coderScreenFeatures: [
            '20 interviews/month',
            '5 team members included',
            'Live collaboration',
            'Interview recording',
            'System design whiteboard',
            'ATS integrations',
            'Evaluation tools',
          ],
          competitorFeatures: [
            'Individual practice only',
            'Per-user pricing',
            'No live collaboration',
            'No interview features',
            'Algorithm focus only',
            'No ATS integration',
            'Self-assessment only',
          ],
        },
      ],
    },
  },
  'karat-alternative': {
    name: 'karat',
    displayName: 'Karat',
    slug: 'karat-alternative',
    hero: {
      title: 'The self-service Karat alternative',
      subtitle: 'Run your own technical interviews without outsourcing',
      description:
        'CoderScreen gives you the tools to conduct professional technical interviews in-house, without the per-interview costs and dependency of outsourced interviewing services like Karat.',
    },
    seo: {
      title: 'Karat Alternative - Run Technical Interviews In-House | CoderScreen',
      description:
        'Looking for a Karat alternative? CoderScreen lets you run professional technical interviews yourself with live collaboration, recording, and evaluation tools. No per-interview fees.',
      keywords: [
        'karat alternative',
        'karat competitors',
        'karat interview alternative',
        'outsourced interview alternative',
        'technical interview platform',
        'in-house technical interviews',
        'interview as a service alternative',
      ],
    },
    whySwitch: {
      title: 'Why teams choose CoderScreen over Karat',
      reasons: [
        {
          title: 'No Per-Interview Fees',
          description:
            'Karat charges $200-400 per interview. CoderScreen offers unlimited platform access for a flat monthly fee, dramatically reducing costs.',
        },
        {
          title: 'Keep Interviews In-House',
          description:
            'Your team knows your culture and requirements best. CoderScreen empowers your engineers to conduct great interviews, not outsourced contractors.',
        },
        {
          title: 'Immediate Availability',
          description:
            'No scheduling through a third party. Start interviews when you need them with candidates and your own team members.',
        },
        {
          title: 'Full Interview Control',
          description:
            'Design your own questions, evaluation criteria, and interview flow. Don\'t rely on Karat\'s standardized approach.',
        },
        {
          title: 'Open Source Platform',
          description:
            'Transparent, community-driven development. See exactly how everything works with no black-box processes.',
        },
        {
          title: 'Better Candidate Experience',
          description:
            'Candidates meet your actual team members, not contractors. Build rapport and sell your company culture during interviews.',
        },
      ],
    },
    faq: [
      {
        question: 'How much does Karat cost compared to CoderScreen?',
        answer:
          'Karat charges $200-400 per interview with outsourced interviewers. CoderScreen costs $50-350/month with unlimited platform access, so your own team can conduct as many interviews as needed.',
      },
      {
        question: 'Why not outsource interviews like Karat offers?',
        answer:
          'Outsourced interviewers don\'t know your codebase, culture, or specific requirements. Your engineers can better evaluate fit and sell candidates on joining your team.',
      },
      {
        question: 'Does CoderScreen provide interviewers?',
        answer:
          'No, CoderScreen is a platform that empowers your team to run great interviews. We provide the tools, you provide the expertise about what you\'re looking for.',
      },
      {
        question: 'Can CoderScreen help train our interviewers?',
        answer:
          'Yes! Interview recording and playback lets new interviewers learn from experienced team members. Review past interviews for calibration and training.',
      },
      {
        question: 'Is CoderScreen suitable for high-volume hiring?',
        answer:
          'Absolutely! Our Scale plan supports 200 interviews per month with unlimited team members. Unlike Karat, costs don\'t scale linearly with interview volume.',
      },
    ],
    comparison: {
      features: [
        { name: 'Open Source', coderScreenHas: true, competitorHas: false, isCoreFeature: true },
        { name: 'Live Collaboration', coderScreenHas: true, competitorHas: true },
        { name: 'Flat Monthly Pricing', coderScreenHas: true, competitorHas: false },
        { name: 'Collaborative Whiteboard', coderScreenHas: true, competitorHas: true },
        { name: 'In-House Control', coderScreenHas: true, competitorHas: false },
        { name: 'Interview Recording', coderScreenHas: true, competitorHas: true },
        { name: 'Real-time Coding', coderScreenHas: true, competitorHas: true, isCoreFeature: true },
        {
          name: 'Multiple Languages',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        { name: 'No Per-Interview Cost', coderScreenHas: true, competitorHas: false },
      ],
    },
    pricing: {
      title: 'Flat pricing vs. per-interview fees',
      description:
        'Stop paying $200-400 per interview. Get unlimited platform access for a flat monthly fee.',
      plans: [
        {
          name: 'Scale',
          coderScreenPrice: '$350/month flat',
          competitorPrice: '$200-400/interview',
          coderScreenFeatures: [
            '200 interviews/month',
            'Unlimited team members',
            'Your own interviewers',
            'Custom questions',
            'Full interview control',
            'Interview playback',
            'Predictable costs',
          ],
          competitorFeatures: [
            'Pay per interview',
            'Outsourced interviewers',
            'Karat\'s questions',
            'Standardized process',
            'Limited customization',
            'Interview reports',
            'Costs scale with volume',
          ],
        },
      ],
    },
  },
  'testgorilla-alternative': {
    name: 'testgorilla',
    displayName: 'TestGorilla',
    slug: 'testgorilla-alternative',
    hero: {
      title: 'The open-source TestGorilla alternative',
      subtitle: 'Live technical interviews instead of generic assessments',
      description:
        'CoderScreen is the developer-focused alternative to TestGorilla, offering live coding interviews and real-world technical assessments instead of multiple-choice tests.',
    },
    seo: {
      title: 'TestGorilla Alternative - Live Technical Interviews | CoderScreen',
      description:
        'Looking for a TestGorilla alternative for developer hiring? CoderScreen offers live coding interviews, collaborative whiteboard, and real technical assessments. Built for engineering teams.',
      keywords: [
        'testgorilla alternative',
        'testgorilla competitors',
        'testgorilla vs coderscreen',
        'skills assessment alternative',
        'technical interview platform',
        'developer assessment tool',
        'coding test platform',
      ],
    },
    whySwitch: {
      title: 'Why engineering teams choose CoderScreen over TestGorilla',
      reasons: [
        {
          title: 'Live Coding Interviews',
          description:
            'TestGorilla focuses on pre-recorded assessments. CoderScreen enables real-time pair programming where you can see how developers actually think and code.',
        },
        {
          title: 'Developer-Focused',
          description:
            'Built specifically for technical roles. TestGorilla covers everything from sales to accounting. CoderScreen is laser-focused on engineering hiring.',
        },
        {
          title: 'Real Code Execution',
          description:
            'Candidates write and run real code in a full development environment. No multiple-choice questions or simulated coding.',
        },
        {
          title: 'System Design Support',
          description:
            'Evaluate architecture skills with our collaborative whiteboard. Essential for senior engineering roles that TestGorilla can\'t assess.',
        },
        {
          title: 'Open Source',
          description:
            'Full transparency into how the platform works. Inspect the code and never worry about proprietary assessment algorithms.',
        },
        {
          title: 'Interview Playback',
          description:
            'Review every keystroke and decision. Share recordings with team members for collaborative hiring decisions.',
        },
      ],
    },
    faq: [
      {
        question: 'How is CoderScreen different from TestGorilla?',
        answer:
          'TestGorilla offers broad skills assessments across many job types. CoderScreen is specialized for software engineering with live coding interviews, real-time collaboration, and system design tools.',
      },
      {
        question: 'Does CoderScreen have pre-built assessments like TestGorilla?',
        answer:
          'CoderScreen focuses on customizable live interviews rather than standardized tests. You can create a question library tailored to your specific tech stack and requirements.',
      },
      {
        question: 'Can I use CoderScreen for screening before interviews?',
        answer:
          'Yes! CoderScreen supports take-home assessments with automated test validation for initial screening, plus live interviews for final rounds.',
      },
      {
        question: 'Is TestGorilla effective for developer hiring?',
        answer:
          'Generic assessments struggle to evaluate real coding ability. CoderScreen\'s live interviews and practical coding challenges better predict developer job performance.',
      },
      {
        question: 'How does pricing compare?',
        answer:
          'TestGorilla charges per candidate assessed. CoderScreen offers flat monthly pricing starting at $50/month for 20 interviews, making it more cost-effective for engineering teams.',
      },
    ],
    comparison: {
      features: [
        { name: 'Open Source', coderScreenHas: true, competitorHas: false, isCoreFeature: true },
        { name: 'Live Collaboration', coderScreenHas: true, competitorHas: false },
        { name: 'Developer Focused', coderScreenHas: true, competitorHas: false },
        { name: 'Collaborative Whiteboard', coderScreenHas: true, competitorHas: false },
        { name: 'System Design Tools', coderScreenHas: true, competitorHas: false },
        { name: 'Real Code Execution', coderScreenHas: true, competitorHas: false },
        {
          name: 'Real-time Coding',
          coderScreenHas: true,
          competitorHas: false,
        },
        {
          name: 'Multiple Languages',
          coderScreenHas: true,
          competitorHas: true,
          isCoreFeature: true,
        },
        { name: 'Interview Recording', coderScreenHas: true, competitorHas: false },
      ],
    },
    pricing: {
      title: 'Specialized for engineering hiring',
      description:
        'TestGorilla covers every role generically. CoderScreen is purpose-built for hiring developers.',
      plans: [
        {
          name: 'Starter',
          coderScreenPrice: '$50/month',
          competitorPrice: '$75/month + per candidate',
          coderScreenFeatures: [
            '20 interviews/month',
            'Live coding interviews',
            'System design whiteboard',
            'Interview playback',
            'Custom questions',
            'Real code execution',
            'Developer-focused',
          ],
          competitorFeatures: [
            'Unlimited assessments',
            'Pre-recorded tests only',
            'Generic skills tests',
            'Multiple-choice format',
            '400+ test templates',
            'Simulated coding',
            'All job types',
          ],
        },
      ],
    },
  },
};
