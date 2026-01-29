export interface UseCaseData {
  slug: string;
  type: 'persona' | 'role';
  displayName: string;
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
  valueProps: {
    title: string;
    items: Array<{ title: string; description: string }>;
  };
  features: {
    title: string;
    items: Array<{ title: string; description: string }>;
  };
  faq: Array<{ question: string; answer: string }>;
}

export const personaData: Record<string, UseCaseData> = {
  startups: {
    slug: 'startups',
    type: 'persona',
    displayName: 'Startups',
    hero: {
      title: 'Technical Hiring for Startups',
      subtitle: 'Hire your first 10 engineers without enterprise overhead',
      description:
        'CoderScreen gives early-stage teams a fast, affordable way to run professional technical interviews. Start free and scale as you grow.',
    },
    seo: {
      title: 'CoderScreen for Startups - Fast Technical Hiring',
      description:
        'Hire engineers faster with CoderScreen. Free plan, live coding interviews, and no enterprise overhead. Built for startup hiring.',
      keywords: [
        'technical hiring for startups',
        'startup developer screening',
        'startup coding interview',
        'hire developers startup',
        'affordable interview platform',
        'startup engineering hiring',
      ],
    },
    valueProps: {
      title: 'Why startups choose CoderScreen',
      items: [
        {
          title: 'Start Free, Scale Later',
          description:
            'Our free plan includes everything you need to start hiring. Upgrade only when your team grows and you need more capacity.',
        },
        {
          title: 'No Sales Calls Required',
          description:
            'Sign up, create your first interview, and start evaluating candidates in minutes. No demos, no procurement, no waiting.',
        },
        {
          title: 'Compete with Big Tech',
          description:
            'Give candidates a modern, polished interview experience that rivals FAANG. First impressions matter when you are competing for talent.',
        },
        {
          title: 'Evaluate Real Skills',
          description:
            'Live coding interviews reveal how candidates think, communicate, and solve problems — not just whether they memorized algorithms.',
        },
        {
          title: 'Open Source Transparency',
          description:
            'As a startup, you value transparency. CoderScreen is fully open source — inspect the code, self-host, or contribute.',
        },
        {
          title: 'All-in-One Platform',
          description:
            'Code editor, whiteboard, AI assistant, and recording in one tool. No need to stitch together multiple products.',
        },
      ],
    },
    features: {
      title: 'Features that matter for startups',
      items: [
        {
          title: 'Live Collaborative Coding',
          description:
            'Pair program with candidates in real time. See their thought process, not just the final answer.',
        },
        {
          title: 'System Design Whiteboard',
          description:
            'Evaluate architecture thinking early. Important for the senior hires that will shape your technical direction.',
        },
        {
          title: 'Interview Playback',
          description:
            'Share recordings with co-founders and advisors who could not attend the live session. Make better hiring decisions together.',
        },
        {
          title: 'AI Assistant',
          description:
            'Assess how candidates work with AI tools — a critical skill for startup engineers who need to move fast.',
        },
      ],
    },
    faq: [
      {
        question: 'Is CoderScreen really free for startups?',
        answer:
          'Yes. Our Basic plan is free forever and includes 3 interviews per month with full platform access. Most early-stage startups can operate on this plan until they scale their hiring.',
      },
      {
        question: 'How quickly can I set up my first interview?',
        answer:
          'You can sign up and run your first interview in under 5 minutes. No setup, no configuration, no sales calls. Just create an account and send a link to your candidate.',
      },
      {
        question: 'Can I use CoderScreen for take-home assignments?',
        answer:
          'Yes. CoderScreen supports both live interviews and asynchronous projects, so you can mix approaches based on the role and candidate.',
      },
      {
        question: 'What languages and frameworks do you support?',
        answer:
          'We support TypeScript, Python, JavaScript, Go, Rust, Java, C, C++, PHP, Ruby, and Bash with real-time code execution.',
      },
      {
        question: 'How does CoderScreen compare to just using a Google Doc or Zoom?',
        answer:
          'CoderScreen gives candidates a real code editor with execution, syntax highlighting, and collaboration — not a text box. Plus you get recording, playback, and a whiteboard.',
      },
    ],
  },
  enterprise: {
    slug: 'enterprise',
    type: 'persona',
    displayName: 'Enterprise',
    hero: {
      title: 'Enterprise Technical Assessment',
      subtitle: 'Scale your technical hiring with confidence',
      description:
        'CoderScreen gives enterprise teams the tools to run consistent, high-quality technical interviews across departments, offices, and time zones.',
    },
    seo: {
      title: 'CoderScreen for Enterprise - Technical Hiring at Scale',
      description:
        'Scale technical hiring across your organization. SSO, ATS integrations, custom branding, and dedicated support for enterprise teams.',
      keywords: [
        'enterprise technical assessment',
        'large scale developer hiring',
        'enterprise coding interview',
        'enterprise technical screening',
        'corporate developer assessment',
        'enterprise hiring platform',
      ],
    },
    valueProps: {
      title: 'Why enterprise teams choose CoderScreen',
      items: [
        {
          title: 'SSO & Security',
          description:
            'Single sign-on integration, SOC 2 compliance readiness, and enterprise-grade security for your hiring data.',
        },
        {
          title: 'ATS Integrations',
          description:
            'Connect with Greenhouse, Lever, Ashby, and other ATS platforms. Keep your hiring workflow unified.',
        },
        {
          title: 'Custom Branding',
          description:
            'White-label the interview experience with your company branding. Candidates see your brand, not ours.',
        },
        {
          title: 'Consistent Evaluation',
          description:
            'Standardize your interview process across teams with reusable question libraries and structured evaluation criteria.',
        },
        {
          title: 'Interview Analytics',
          description:
            'Track hiring metrics across your organization. Identify bottlenecks, calibrate interviewers, and improve over time.',
        },
        {
          title: 'Dedicated Support',
          description:
            'White-glove onboarding, dedicated account manager, and priority support for your team.',
        },
      ],
    },
    features: {
      title: 'Enterprise-grade features',
      items: [
        {
          title: 'Team Management',
          description:
            'Organize interviewers by department, set permissions, and manage access at scale with unlimited team members.',
        },
        {
          title: 'Question Library',
          description:
            'Build and maintain a standardized question bank. Tag, categorize, and share across your organization.',
        },
        {
          title: 'Interview Playback & Calibration',
          description:
            'Review recorded interviews for quality assurance. Calibrate interviewers and train new team members.',
        },
        {
          title: 'API Access',
          description:
            'Full API for custom integrations with your internal tools, reporting systems, and hiring workflows.',
        },
      ],
    },
    faq: [
      {
        question: 'Does CoderScreen support SSO?',
        answer:
          'Yes. Our Enterprise plan includes SSO integration with SAML and OAuth providers like Okta, Azure AD, and Google Workspace.',
      },
      {
        question: 'What ATS integrations are available?',
        answer:
          'We integrate with Greenhouse, Lever, Ashby, and others. Our API also allows custom integrations with any ATS.',
      },
      {
        question: 'Can we self-host CoderScreen?',
        answer:
          'Yes. CoderScreen is open source and can be self-hosted on your own infrastructure for maximum control and compliance.',
      },
      {
        question: 'What security certifications do you have?',
        answer:
          'We follow SOC 2 security practices and encrypt all data in transit and at rest. Contact us for our detailed security documentation.',
      },
      {
        question: 'How does enterprise pricing work?',
        answer:
          'Enterprise plans are custom-priced based on your team size, interview volume, and feature requirements. Contact our sales team for a quote.',
      },
    ],
  },
  recruiters: {
    slug: 'recruiters',
    type: 'persona',
    displayName: 'Recruiters',
    hero: {
      title: 'Technical Recruiting Tools',
      subtitle: 'Screen developer candidates with confidence',
      description:
        'CoderScreen helps recruiting agencies and in-house recruiters run professional technical screens without being engineers themselves.',
    },
    seo: {
      title: 'CoderScreen for Recruiters - Technical Screening Tools',
      description:
        'Run professional technical screens for developer roles. Pre-built assessments, interview recording, and easy candidate sharing.',
      keywords: [
        'technical recruiting tools',
        'recruiter coding assessment',
        'technical screening for recruiters',
        'developer screening tool',
        'recruiting agency coding test',
        'technical recruiter platform',
      ],
    },
    valueProps: {
      title: 'Why recruiters choose CoderScreen',
      items: [
        {
          title: 'No Engineering Degree Needed',
          description:
            'Pre-built assessments and automated evaluation let you screen technical candidates without writing code yourself.',
        },
        {
          title: 'Share Results Easily',
          description:
            'Send interview recordings and results to hiring managers with a single link. No logins required for reviewers.',
        },
        {
          title: 'Professional Candidate Experience',
          description:
            'Candidates get a polished, modern interview environment. Reflect well on your agency and your clients.',
        },
        {
          title: 'Faster Pipeline',
          description:
            'Screen candidates in real time or asynchronously. Move qualified developers through your pipeline faster.',
        },
        {
          title: 'Multi-Client Support',
          description:
            'Manage interviews across multiple clients from one account. Organize by company, role, or team.',
        },
        {
          title: 'Affordable Per-Seat Pricing',
          description:
            'Predictable monthly costs that scale with your recruiter headcount, not your candidate volume.',
        },
      ],
    },
    features: {
      title: 'Features recruiters love',
      items: [
        {
          title: 'Interview Recording & Sharing',
          description:
            'Record every technical screen. Share recordings with clients so they can see candidates in action before committing to interviews.',
        },
        {
          title: 'Pre-Built Assessments',
          description:
            'Use our question library to create technical screens for any role — frontend, backend, fullstack, DevOps, and more.',
        },
        {
          title: 'Candidate Scheduling',
          description:
            'Send interview links directly to candidates. They join from their browser with no downloads or account creation.',
        },
        {
          title: 'Real-Time Code Execution',
          description:
            'Candidates write and run real code during the screen. See if they can actually build, not just talk about building.',
        },
      ],
    },
    faq: [
      {
        question: 'Do I need to know how to code to use CoderScreen?',
        answer:
          'No. You can set up assessments using pre-built questions, and the platform handles code execution and evaluation automatically. You can also invite a technical team member to co-host.',
      },
      {
        question: 'Can I share results with my clients?',
        answer:
          'Yes. Interview recordings and candidate reports can be shared via link with anyone — no CoderScreen account required.',
      },
      {
        question: 'How many candidates can I screen per month?',
        answer:
          'Depends on your plan. The Starter plan includes 20 interviews per month, and the Scale plan includes 200. Contact us for higher volumes.',
      },
      {
        question: 'Does CoderScreen integrate with my ATS?',
        answer:
          'Yes. We integrate with Greenhouse, Lever, Ashby, and others. Our API also supports custom integrations.',
      },
      {
        question: 'Can candidates use CoderScreen without creating an account?',
        answer:
          'Yes. Candidates join via a link in their browser. No downloads, no sign-up, no friction.',
      },
    ],
  },
  'remote-teams': {
    slug: 'remote-teams',
    type: 'persona',
    displayName: 'Remote Teams',
    hero: {
      title: 'Remote Technical Hiring',
      subtitle: 'Hire distributed engineers with the same rigor as in-person',
      description:
        'CoderScreen is built for remote-first teams. Run live collaborative interviews across time zones with real-time code execution and whiteboard.',
    },
    seo: {
      title: 'CoderScreen for Remote Teams - Distributed Hiring',
      description:
        'Hire remote developers with live coding interviews, real-time collaboration, and async assessments. Built for distributed teams.',
      keywords: [
        'remote technical hiring',
        'distributed team interviews',
        'remote coding interview',
        'remote developer assessment',
        'async technical interview',
        'remote hiring platform',
      ],
    },
    valueProps: {
      title: 'Why remote teams choose CoderScreen',
      items: [
        {
          title: 'Built for Async & Live',
          description:
            'Run live interviews across time zones or send async take-home projects. Flexible workflows for distributed teams.',
        },
        {
          title: 'Browser-Based, Zero Setup',
          description:
            'Candidates join from any browser, anywhere in the world. No downloads, no IT setup, no VPN requirements.',
        },
        {
          title: 'Interview Recording',
          description:
            'Team members in different time zones can review recorded interviews at their convenience. No one misses context.',
        },
        {
          title: 'Real-Time Collaboration',
          description:
            'Pair program with candidates just like you would with a teammate. See their cursor, edits, and thought process live.',
        },
        {
          title: 'Evaluate Remote Work Skills',
          description:
            'CoderScreen naturally tests written communication, independent problem-solving, and async collaboration — the skills remote work demands.',
        },
        {
          title: 'Global Talent Pool',
          description:
            'Support for 12+ programming languages and a platform that works on any connection. Hire the best, wherever they are.',
        },
      ],
    },
    features: {
      title: 'Features for distributed hiring',
      items: [
        {
          title: 'Live Collaborative Editor',
          description:
            'Real-time pair programming with multi-cursor support. Feels like working together, even when you are thousands of miles apart.',
        },
        {
          title: 'Async Take-Home Projects',
          description:
            'Send candidates real-world coding projects they complete on their own schedule. Review submissions with code playback.',
        },
        {
          title: 'Collaborative Whiteboard',
          description:
            'Discuss system design and architecture visually. Essential for evaluating senior candidates in distributed environments.',
        },
        {
          title: 'Shareable Interview Links',
          description:
            'Send a link, run the interview. No calendar coordination beyond agreeing on a time. Works across every time zone.',
        },
      ],
    },
    faq: [
      {
        question: 'Does CoderScreen work well with slow internet connections?',
        answer:
          'Yes. Our editor is optimized for low-bandwidth connections. Code execution happens server-side, so candidates do not need powerful machines.',
      },
      {
        question: 'Can team members in different time zones review the same interview?',
        answer:
          'Yes. Every interview is recorded with full playback. Team members can review at their convenience and leave notes.',
      },
      {
        question: 'Does CoderScreen support async assessments?',
        answer:
          'Yes. You can send candidates take-home projects that they complete on their own time, with full code playback for review.',
      },
      {
        question: 'What time zones does your support cover?',
        answer:
          'Our platform is self-serve and available 24/7. Paid plans include support during US and EU business hours, with enterprise plans offering 24/7 dedicated support.',
      },
      {
        question: 'Can I customize the interview experience for different regions?',
        answer:
          'Yes. Custom branding, question libraries, and flexible scheduling let you tailor the experience for candidates in any region.',
      },
    ],
  },
};
