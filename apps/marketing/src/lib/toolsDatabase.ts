// Single source of truth for every tool that appears in a roundup page.
// Each competitor lives here once and is referenced by slug from roundupConfig,
// so updating a price or rating propagates to every roundup that lists it.
//
// Ratings are third-party review-site figures (G2 unless noted). Keep them honest
// and separate from our own marketing claims. Verify quarterly.
// Last verified: 2026-07-26.

export interface ToolRating {
  score: number;
  source: string; // e.g. 'G2'
  count?: number; // number of reviews
}

export interface ToolProfile {
  slug: string;
  name: string;
  isUs?: boolean; // CoderScreen, always positioned first (renders the brand mark, no logo file)
  website?: string;
  logo?: string; // path under /public; omitted for CoderScreen (uses the Logo component)
  rating?: ToolRating; // omitted for new tools with no meaningful sample
  bestForTag: string; // short one-liner used in the at-a-glance table and card header
  startingPrice: string; // headline price for the table, e.g. 'Free, then $50/mo'
  freeOption: string; // 'Free plan', '14-day trial', 'No free employer plan'
  idealTeamSize: string;
  pricingTiers: string[]; // one line per tier
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  bestForParagraph: string;
}

export const toolsDatabase: Record<string, ToolProfile> = {
  coderscreen: {
    slug: 'coderscreen',
    name: 'CoderScreen',
    isUs: true,
    website: 'https://coderscreen.com',
    bestForTag: 'Open-source live coding interviews with transparent pricing',
    startingPrice: 'Free, then $50/mo',
    freeOption: 'Free plan (3 interviews/mo)',
    idealTeamSize: 'Startups to scaling engineering teams',
    pricingTiers: [
      'Basic: free forever, 3 live interviews/mo, 1 member',
      'Starter: $50/mo, 20 live interviews/mo, 5 members, API access',
      'Scale: $350/mo, 200 live interviews/mo, unlimited members, ATS integrations, custom branding',
      'Enterprise: custom, unlimited interviews, SSO, whiteglove support',
    ],
    keyFeatures: [
      'Fully open source and self-hostable',
      'Real-time collaborative code editor with multi-file and framework support (React, Next.js)',
      'Collaborative whiteboard for system design, included at no extra cost',
      'Full interview playback to review every keystroke',
      'AI-assisted candidate evaluation and interview summaries',
      'Published, transparent pricing with no sales calls to start',
      'ATS integrations (Greenhouse, Lever, Ashby) on Scale and up',
    ],
    pros: [
      'Only fully open-source option here, so no vendor lock-in and you can self-host',
      'System-design whiteboard bundled instead of sold as an add-on',
      'Clear published pricing you can start on without talking to sales',
      'Generous entry price versus incumbents ($50/mo for 20 interviews)',
    ],
    cons: [
      'Newer platform with a smaller prebuilt question library than the incumbents',
      'Smaller brand and community than HackerRank or CodeSignal',
      'ATS integrations start on the Scale tier rather than the entry plan',
    ],
    bestForParagraph:
      'CoderScreen fits teams that want a modern, live technical interview without the vendor lock-in, add-on fees, or sales-gated quotes common in this category. Because it is open source, you can inspect it, extend it, or self-host it, and the system-design whiteboard and interview playback come standard rather than as paid upgrades.',
  },

  coderpad: {
    slug: 'coderpad',
    name: 'CoderPad',
    website: 'https://coderpad.io',
    logo: '/company-logos/coderpad.png',
    rating: { score: 4.4, source: 'G2', count: 435 },
    bestForTag: 'A polished live-interview IDE with broad language support',
    startingPrice: 'Free, then $80/mo (annual)',
    freeOption: 'Free plan (2 tests/mo) + 14-day trial',
    idealTeamSize: 'Small teams to mid-market',
    pricingTiers: [
      'Free: 2 tests/mo, pads expire after 4 days',
      'Starter: $120/mo ($80/mo annual), 5 tests/mo, 400+ questions',
      'Team: $400/mo, 30 tests/mo, 1,400+ questions',
      'Custom/Enterprise: AI Reviewer, ATS, SSO, anti-cheat',
    ],
    keyFeatures: [
      'Collaborative IDE with integrated video',
      '99+ languages and frameworks',
      'Code playback',
      'CodinGame-based gamified Screen module',
      'SOC 2 Type 2',
    ],
    pros: [
      'Intuitive real-time collaborative editor that candidates find easy to use',
      'Code playback shows how a candidate thinks and debugs',
      'Very broad language and framework coverage',
    ],
    cons: [
      'Free plan is very limited (2 tests/mo, pads expire in 4 days)',
      'Open API and advanced features are locked to the top tiers',
      'Native ATS integrations are thinner than HackerRank',
      'Overages billed at $25 per extra test',
    ],
    bestForParagraph:
      'CoderPad is a strong choice for teams that mainly run live technical interviews and want a refined editor with wide language support. The tradeoffs are a restrictive free plan and paid tiers that gate integrations and API access behind the more expensive plans.',
  },

  codesignal: {
    slug: 'codesignal',
    name: 'CodeSignal',
    website: 'https://codesignal.com',
    logo: '/company-logos/codesignal.png',
    rating: { score: 4.5, source: 'G2', count: 1408 },
    bestForTag: 'Standardized, defensible scoring for high-volume hiring',
    startingPrice: '$79/mo (annual)',
    freeOption: 'No free hiring tier',
    idealTeamSize: 'Mid-market to enterprise',
    pricingTiers: [
      'Build: $99/mo ($79/mo annual), 60 credits/yr',
      'Grow: $599/mo ($479/mo annual), 420 credits/yr',
      'Pro/Enterprise: custom, advanced fraud prevention, RBAC',
    ],
    keyFeatures: [
      'Standardized Coding Score for comparable results',
      'Real-IDE assessments across 70+ languages',
      'AI Interviewer spanning engineering and business roles',
      'Benchmarking data and analytics',
    ],
    pros: [
      'Standardized scoring makes candidate comparisons defensible in a hiring committee',
      'Realistic real-IDE tasks rather than puzzle-style editors',
      'AI Interviewer extends beyond engineering into sales and finance',
      'Trusted at scale by companies like Google, Meta, and Anthropic',
    ],
    cons: [
      'No public enterprise pricing and no free hiring tier to test first',
      'Credit model escalates quickly, with $20 per overage credit',
      'Large jump in price from the Build to the Grow tier',
      'Integrity monitoring is narrower than HackerRank',
    ],
    bestForParagraph:
      'CodeSignal suits mid-to-large engineering teams that hire continuously and need scores they can defend in a calibration meeting. It is a premium option: the credit model and the step up to the Grow tier make it expensive for teams with low or occasional hiring volume.',
  },

  hackerrank: {
    slug: 'hackerrank',
    name: 'HackerRank',
    website: 'https://www.hackerrank.com',
    logo: '/company-logos/hackerrank.jpg',
    rating: { score: 4.5, source: 'G2' },
    bestForTag: 'Volume developer hiring with deep proctoring and ATS support',
    startingPrice: '$165/mo ($1,990/yr)',
    freeOption: 'No free employer plan',
    idealTeamSize: 'Growing teams to enterprise',
    pricingTiers: [
      'Starter: $165/mo ($1,990/yr), 1 user, 120 attempts/yr',
      'Pro: $375/mo ($4,490/yr), unlimited users, 300 attempts/yr, ATS',
      'Enterprise: custom, 7,500+ questions, SSO/SCIM, 40+ integrations',
    ],
    keyFeatures: [
      'Large, validated question library',
      'Screen plus Interview covers the full funnel',
      'Strong plagiarism detection and proctoring',
      '40+ ATS integrations on Enterprise',
    ],
    pros: [
      'Huge, industrial-psychologist-validated question bank',
      'Covers the whole funnel from take-home screen to live interview',
      'Strong anti-cheat and wide ATS support',
      'Many candidates already know the format, and Starter/Pro pricing is published',
    ],
    cons: [
      'No free employer plan, and $165/mo is steep for occasional hiring',
      'Attempt-based metering can inflate real costs',
      'Some questions feel dated and there is no integrated debugger',
      'Timed tests stress some candidates',
    ],
    bestForParagraph:
      'HackerRank is the safe, established pick for engineering teams hiring developers at volume, where the question library, proctoring, and ATS depth justify the cost. It is harder to justify for small teams making occasional hires given the entry price and lack of a free employer plan.',
  },

  coderbyte: {
    slug: 'coderbyte',
    name: 'Coderbyte',
    website: 'https://coderbyte.com',
    logo: '/company-logos/coderbyte.png',
    rating: { score: 4.5, source: 'G2', count: 300 },
    bestForTag: 'Predictable flat pricing for unlimited async screening',
    startingPrice: '$199/mo',
    freeOption: '14-day trial',
    idealTeamSize: 'Small teams to mid-market',
    pricingTiers: [
      'Monthly: $199/mo, unlimited candidates, up to 10 simultaneous',
      'Annual: $1,799/yr, up to 50 simultaneous',
      'Enterprise: $12,495/yr, 100-500 simultaneous',
      'Add-ons (ATS, SSO, branding, proctoring) priced separately',
    ],
    keyFeatures: [
      'Unlimited-usage plans with locked pricing',
      'Screening, take-home projects, and interviews',
      'Automated grading and reporting',
      'Cheating detection and video responses',
    ],
    pros: [
      'Transparent, predictable, unlimited-usage pricing',
      'Covers screening through to interview in one tool',
      'Affordable flat entry price with unlimited AI credits',
    ],
    cons: [
      'Many features (ATS, SSO, branding, proctoring) are paid add-ons',
      'Native ATS integrations are limited out of the box',
      'Some reviewers report support and candidate-experience gaps',
    ],
    bestForParagraph:
      'Coderbyte works well for teams that want predictable, flat pricing for unlimited asynchronous screening and take-home projects. Watch the add-on model: the headline price is low, but ATS, SSO, branding, and advanced proctoring each cost extra on top.',
  },

  codeinterview: {
    slug: 'codeinterview',
    name: 'CodeInterview',
    website: 'https://codeinterview.io',
    logo: '/company-logos/codeinterview.png',
    rating: { score: 4.5, source: 'G2', count: 53 },
    bestForTag: 'A simple, affordable live coding interview tool',
    startingPrice: 'Free, then ~$89/mo',
    freeOption: 'Free plan (2 interviews/mo) + 14-day trial',
    idealTeamSize: 'Small to mid-sized teams',
    pricingTiers: [
      'Free: 2 interviews/mo',
      'Starter: ~$89/mo, 8 interviews/mo',
      'Pro: ~$320/mo, 40 interviews/mo',
      'Enterprise: custom, SSO, API, ATS integration',
    ],
    keyFeatures: [
      'Collaborative code editor with 40+ languages',
      'Shell access, code playback, and video calling',
      'Whiteboard, private notes, and templates',
      'Chrome extension',
    ],
    pros: [
      'Simple and fast to run interviews',
      'Transparent pricing with a genuine free tier',
      'Candidate-friendly, with whiteboard and playback included',
    ],
    cons: [
      'Focused on live interviews, lighter on automated assessments and take-homes',
      'ATS, SSO, and API are gated to the Enterprise tier',
      'Smaller question library and fewer enterprise features',
    ],
    bestForParagraph:
      'CodeInterview is a good fit for small-to-mid teams that want a straightforward, affordable live coding interview tool without a heavy assessment suite. Larger teams that need ATS, SSO, or API access will need the Enterprise tier.',
  },

  testgorilla: {
    slug: 'testgorilla',
    name: 'TestGorilla',
    website: 'https://www.testgorilla.com',
    logo: '/company-logos/testgorilla.png',
    rating: { score: 4.5, source: 'G2' },
    bestForTag: 'Broad skills testing across many roles, not just coding',
    startingPrice: 'Free, then $142/mo (annual)',
    freeOption: 'Free plan (10 credits/mo)',
    idealTeamSize: 'SMBs to mid-market hiring across roles',
    pricingTiers: [
      'Free: 5 essential tests, 10 credits/mo',
      'Core: $142/mo ($1,704/yr), 350+ test library, 250 credits',
      'Plus: from $400/mo, AI interviews, custom tests, ATS, API',
      'Enterprise: custom. Paid plans require a 12-month commitment',
    ],
    keyFeatures: [
      '350+ tests: coding, cognitive, personality, role-specific',
      'AI video interviews and AI resume scoring',
      'Anti-cheat monitoring',
      'Candidate sourcing pool and ATS integrations (Plus)',
    ],
    pros: [
      'Huge breadth of tests to screen almost any role, not only engineers',
      'Generous free plan to try skills-based hiring',
      'Easy enough for non-technical recruiters to run',
      'AI video interviews and resume scoring built in',
    ],
    cons: [
      'Paid plans require a 12-month commitment, rough for occasional hiring',
      'Credit-based pricing scales with volume',
      'Coding assessment depth is shallower than dedicated developer tools',
      'ATS integrations and API require the Plus plan',
    ],
    bestForParagraph:
      'TestGorilla is best for teams hiring across many different roles that want one library of skills tests rather than a dedicated coding tool. For deep engineering assessment or live technical interviews you will get more signal from a developer-focused platform, and the mandatory annual commitment can sting smaller teams.',
  },

  leetcode: {
    slug: 'leetcode',
    name: 'LeetCode',
    website: 'https://leetcode.com',
    logo: '/company-logos/leetcode.png',
    rating: { score: 4.2, source: 'G2', count: 18 },
    bestForTag: 'Candidate practice for FAANG-style algorithm interviews',
    startingPrice: 'Free, Premium $35/mo',
    freeOption: 'Free (3,000+ problems)',
    idealTeamSize: 'Individual candidates; limited employer use',
    pricingTiers: [
      'Free: 3,000+ practice problems',
      'Premium: $35/mo or $159/yr (company tags, editorials, debugger)',
      'Employer assessments: enterprise, custom pricing',
    ],
    keyFeatures: [
      'Largest FAANG-style algorithm problem library',
      'Company-tagged questions and weekly contests',
      'In-browser editor with 20+ languages',
      'Premium editorials and integrated debugger',
    ],
    pros: [
      'Largest and most relevant problem set for algorithm interviews',
      'Company tags show what specific firms ask',
      'Active community with many solution approaches',
      'Generous free tier for candidate practice',
    ],
    cons: [
      'Built for candidate practice, not employer hiring or interviewing',
      'Thin assessment and interview tooling for hiring teams',
      'Limited system-design coverage',
      'Best features require Premium; can reward memorization',
    ],
    bestForParagraph:
      'LeetCode is the default for candidates practicing algorithm interviews, and its problem library is unmatched. But it is a practice platform, not a hiring tool. If you are an employer who needs to run live interviews or scored assessments, you want a platform built for that, which is where the alternatives below come in.',
  },

  karat: {
    slug: 'karat',
    name: 'Karat',
    website: 'https://karat.com',
    logo: '/company-logos/karat.png',
    // No reliable public G2 score; shown as unrated rather than inventing a number.
    bestForTag: 'Outsourced technical interviews run by human interviewers',
    startingPrice: 'Custom (per interview)',
    freeOption: 'No free plan',
    idealTeamSize: 'Enterprises with high interview volume',
    pricingTiers: [
      'Custom, per-interview (~$200-450/interview by volume)',
      'Minimum annual interview-volume commitments',
      'Onboarding and custom-rubric fees quoted separately',
      'Multi-year terms unlock lower per-interview rates',
    ],
    keyFeatures: [
      'Interview-as-a-service with trained interviewers',
      '24/7 scheduling and standardized rubrics',
      'Structured scorecards and interview recordings',
      'ATS integrations (Greenhouse, Lever, and others)',
    ],
    pros: [
      'Offloads first-round technical interviewing from your engineers',
      '24/7 trained, calibrated interviewers',
      'Standardized rubrics reduce interviewer bias',
      'Scales interview capacity without hiring more engineers',
    ],
    cons: [
      'No public pricing and expensive on a per-interview basis',
      'Minimum volume commitments, impractical for startups',
      'Outsourced interviewers may miss company and culture fit',
      'Covers technical roles only, and you still source candidates yourself',
    ],
    bestForParagraph:
      'Karat fits large organizations that want to outsource high-volume first-round technical interviews to trained external interviewers. For most teams, especially startups and scale-ups, running your own interviews on a modern platform is far cheaper and keeps your engineers close to the hiring signal.',
  },

  qualified: {
    slug: 'qualified',
    name: 'Qualified',
    website: 'https://www.qualified.io',
    logo: '/company-logos/qualified.png',
    rating: { score: 4.8, source: 'G2' },
    bestForTag: 'Unit-test-driven, project-based coding assessments',
    startingPrice: 'Custom (quote)',
    freeOption: '14-day trial (up to 5 results)',
    idealTeamSize: 'Mid-market to enterprise dev hiring',
    pricingTiers: [
      'No public pricing; custom quote (est. $100-500/mo range)',
      '14-day free trial, capped at 5 assessment results',
      'Seats: configurable managers and reviewers',
      'Add-ons: SSO, ATS integration, API, dedicated account manager',
    ],
    keyFeatures: [
      'Unit-test-driven coding challenges and project assessments',
      'Browser IDE plus external IDE sync',
      'Automated scoring and code playback',
      'Pair-programming mode and code-similarity checks',
    ],
    pros: [
      'Realistic, test-driven assessments produce strong hiring signal',
      'Developer-friendly experience, including an external IDE option',
      'Automated scoring saves reviewer time',
      'High third-party review scores for content quality',
    ],
    cons: [
      'No public pricing and no free plan (trial capped at 5 results)',
      'Assessment-only, so it does not source candidates or run live interviews',
      'Controlled sandbox strips the AI tools candidates use day to day',
      'Opaque pricing means a sales call before you can properly test it',
    ],
    bestForParagraph:
      'Qualified is a strong pick for teams that want rigorous, unit-test-driven coding assessments with a developer-friendly experience. It is assessment-focused, so you will still need a tool for live interviews, and the quote-only pricing means a sales call before you can properly volume-test it.',
  },

  codesubmit: {
    slug: 'codesubmit',
    name: 'CodeSubmit',
    website: 'https://www.codesubmit.io',
    logo: '/company-logos/codesubmit.png',
    rating: { score: 4.9, source: 'G2', count: 12 },
    bestForTag: 'Real-world take-home assignments candidates enjoy',
    startingPrice: 'Free trial, then $49/mo',
    freeOption: 'Free trial',
    idealTeamSize: 'Startups to mid-market',
    pricingTiers: [
      'Solo: $49/mo, 3 candidates/mo, 1 active assignment',
      'Startup: $199/mo, 15 candidates/mo',
      'Scaleup: $299/mo, 30 candidates/mo, ATS, branding',
      'Business: $499/mo, 60 candidates/mo. Enterprise from $12k/yr',
    ],
    keyFeatures: [
      'Real-world take-home coding assignments',
      'CodePair live interviews and short "Bytes" questions',
      'Large challenge library plus custom and AI-built challenges',
      'Plagiarism checks and ATS integrations (Scaleup and up)',
    ],
    pros: [
      'Simple, transparent, upfront pricing with no sales gate to start',
      'Take-home assignments plus live pairing in one tool',
      'Strong, low-stress candidate experience',
      'Large library of ready-made, real-world challenges',
    ],
    cons: [
      'Per-candidate monthly quotas, with $20 overage per extra candidate',
      'ATS, custom branding, and SSO are gated to higher tiers or add-ons',
      'Can get pricey at higher hiring volume',
      'Assessment-first, lighter on structured live-interview features',
    ],
    bestForParagraph:
      'CodeSubmit is a great fit for teams that want realistic take-home assignments with a friendly candidate experience and clear, published pricing. Watch the per-candidate quotas and the features gated to higher tiers (ATS, branding, SSO) as your hiring volume grows.',
  },
};
