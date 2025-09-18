export interface FeatureComparison {
  name: string;
  coderScreenHas: boolean;
  competitorHas: boolean;
  isCoreFeature?: boolean;
}

export interface CompetitorData {
  name: string;
  displayName: string;
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
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
    hero: {
      title: 'The open-source CoderPad alternative',
      subtitle: 'A modern, open-source platform for technical interviews',
      description:
        'CoderScreen is the open-source alternative to CoderPad, offering transparency, customization, and community-driven development for technical interviews.',
    },
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
    hero: {
      title: 'The open-source HackerRank alternative',
      subtitle: 'An open-source platform for comprehensive technical interviews',
      description:
        'CoderScreen is the open-source alternative to HackerRank, providing transparency, customization, and community-driven development for technical interviews.',
    },
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
    hero: {
      title: 'The open-source CodeSignal alternative',
      subtitle: 'An open-source platform for transparent technical assessments',
      description:
        'CoderScreen is the open-source alternative to CodeSignal, offering full transparency, customization, and community-driven development for technical assessments.',
    },
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
    hero: {
      title: 'The open-source Coderbyte alternative',
      subtitle: 'An open-source platform for transparent coding challenges',
      description:
        'CoderScreen is the open-source alternative to Coderbyte, providing full transparency, customization, and community-driven development for coding challenges.',
    },
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
};
