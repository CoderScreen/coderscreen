import { UseCaseData } from './personaConfig';

export const roleData: Record<string, UseCaseData> = {
  'frontend-developers': {
    slug: 'frontend-developers',
    type: 'role',
    displayName: 'Frontend Developers',
    hero: {
      title: 'Hire Frontend Developers',
      subtitle: 'Assess UI skills with live coding and real browser output',
      description:
        'CoderScreen lets you evaluate frontend candidates with real-time code execution, browser preview, and collaborative editing. See how they build, not just how they talk.',
    },
    seo: {
      title: 'Hire Frontend Developers - CoderScreen',
      description:
        'Assess frontend candidates with live coding interviews, browser preview, and real-time collaboration. Evaluate React, TypeScript, and CSS skills.',
      keywords: [
        'hire frontend developers',
        'frontend developer assessment',
        'frontend coding interview',
        'react developer hiring',
        'frontend technical screen',
        'javascript developer assessment',
      ],
    },
    valueProps: {
      title: 'Why teams use CoderScreen for frontend hiring',
      items: [
        {
          title: 'Real Browser Preview',
          description:
            'Candidates see their UI render live as they code. Evaluate layout, responsiveness, and visual polish in real time.',
        },
        {
          title: 'TypeScript & React Support',
          description:
            'Full TypeScript and JavaScript execution with modern framework support. Test real-world frontend skills, not toy problems.',
        },
        {
          title: 'CSS & Styling Evaluation',
          description:
            'See how candidates approach layout, styling, and responsive design. The browser preview makes visual skills immediately apparent.',
        },
        {
          title: 'Component Architecture',
          description:
            'Use the whiteboard to discuss component design and state management. Evaluate architectural thinking alongside coding ability.',
        },
        {
          title: 'Pair Programming Experience',
          description:
            'Collaborate in real time with multi-cursor editing. See how candidates communicate and respond to feedback while building.',
        },
        {
          title: 'AI-Assisted Development',
          description:
            'Assess how candidates use AI tools productively — an essential skill for modern frontend development workflows.',
        },
      ],
    },
    features: {
      title: 'Features for frontend hiring',
      items: [
        {
          title: 'Live Code Execution',
          description:
            'Candidates write and run JavaScript and TypeScript with instant output. No local setup required.',
        },
        {
          title: 'System Design Whiteboard',
          description:
            'Evaluate component architecture, state management, and data flow with collaborative diagramming.',
        },
        {
          title: 'Interview Recording',
          description:
            'Replay the entire coding session. Share with hiring managers who want to see how candidates approach UI problems.',
        },
        {
          title: 'Pre-Built Question Library',
          description:
            'Frontend-specific coding challenges covering DOM manipulation, async patterns, component design, and more.',
        },
      ],
    },
    faq: [
      {
        question: 'Can candidates build React components during the interview?',
        answer:
          'Yes. Our editor supports TypeScript and JavaScript with real-time execution. Candidates can build components, handle state, and see output immediately.',
      },
      {
        question: 'Does CoderScreen support CSS and styling?',
        answer:
          'Yes. Candidates can write CSS alongside their JavaScript/TypeScript code. The live preview shows rendered output so you can evaluate visual results.',
      },
      {
        question: 'What frontend frameworks are supported?',
        answer:
          'We support JavaScript and TypeScript execution natively. Candidates can demonstrate framework knowledge through coding patterns and the system design whiteboard.',
      },
      {
        question: 'Can I test responsive design skills?',
        answer:
          'Yes. The browser preview and live execution environment let candidates demonstrate responsive layout techniques and CSS skills in real time.',
      },
      {
        question: 'How do I evaluate system design for frontend roles?',
        answer:
          'Use our collaborative whiteboard to discuss component architecture, state management, API design, and performance optimization strategies.',
      },
    ],
  },
  'backend-developers': {
    slug: 'backend-developers',
    type: 'role',
    displayName: 'Backend Developers',
    hero: {
      title: 'Hire Backend Developers',
      subtitle: 'Evaluate server-side skills with real code execution',
      description:
        'CoderScreen supports Python, Go, Java, Rust, and more with real-time execution. Assess backend candidates on algorithms, system design, and API thinking.',
    },
    seo: {
      title: 'Hire Backend Developers - CoderScreen',
      description:
        'Assess backend developers with live coding in Python, Go, Java, Rust, and more. Real-time execution and system design whiteboard.',
      keywords: [
        'hire backend developers',
        'backend developer assessment',
        'backend coding interview',
        'python developer hiring',
        'server-side developer assessment',
        'backend technical screen',
      ],
    },
    valueProps: {
      title: 'Why teams use CoderScreen for backend hiring',
      items: [
        {
          title: '12+ Languages Supported',
          description:
            'Python, Go, Java, Rust, C, C++, Ruby, PHP, and more. Test candidates in the language they will actually use on the job.',
        },
        {
          title: 'Real-Time Code Execution',
          description:
            'Candidates run their code instantly on our servers. No local environment setup, no Docker, no dependency headaches.',
        },
        {
          title: 'System Design Whiteboard',
          description:
            'Evaluate architecture skills with collaborative diagramming. Essential for senior backend roles that shape infrastructure decisions.',
        },
        {
          title: 'Algorithm & Data Structures',
          description:
            'Test problem-solving skills with coding challenges that run against real inputs. See runtime output, not just pseudocode.',
        },
        {
          title: 'API Design Assessment',
          description:
            'Use the whiteboard and editor together to evaluate how candidates think about API contracts, error handling, and data modeling.',
        },
        {
          title: 'Async & Concurrency',
          description:
            'Real execution environments let candidates demonstrate understanding of async patterns, concurrency, and performance tradeoffs.',
        },
      ],
    },
    features: {
      title: 'Features for backend hiring',
      items: [
        {
          title: 'Multi-Language Execution',
          description:
            'Run Python, Go, Java, Rust, C, C++, Ruby, PHP, TypeScript, and Bash with real-time output and error handling.',
        },
        {
          title: 'Collaborative Whiteboard',
          description:
            'Discuss system architecture, database design, and distributed systems visually during the interview.',
        },
        {
          title: 'Interview Recording & Playback',
          description:
            'Review coding sessions later. See how candidates approached problems, debugged issues, and iterated on solutions.',
        },
        {
          title: 'AI Assistant Integration',
          description:
            'Evaluate how backend candidates use AI tools for code generation, debugging, and architecture — a growing job requirement.',
        },
      ],
    },
    faq: [
      {
        question: 'What programming languages can backend candidates use?',
        answer:
          'We support TypeScript, Python, JavaScript, Go, Rust, Java, C, C++, PHP, Ruby, and Bash with real-time code execution.',
      },
      {
        question: 'Can I test database and SQL skills?',
        answer:
          'Candidates can write and discuss database queries, schema designs, and data modeling using the code editor and whiteboard.',
      },
      {
        question: 'How do I evaluate system design for backend roles?',
        answer:
          'Our collaborative whiteboard lets you and the candidate draw architecture diagrams, discuss tradeoffs, and walk through distributed system designs.',
      },
      {
        question: 'Does the code actually execute or is it just an editor?',
        answer:
          'Code runs on real servers with actual output. Candidates can test their solutions, debug errors, and iterate — just like real development.',
      },
      {
        question: 'Can I create custom backend coding challenges?',
        answer:
          'Yes. Create your own challenges or use our pre-built question library. You can define inputs, expected outputs, and evaluation criteria.',
      },
    ],
  },
  'fullstack-developers': {
    slug: 'fullstack-developers',
    type: 'role',
    displayName: 'Fullstack Developers',
    hero: {
      title: 'Hire Fullstack Developers',
      subtitle: 'Assess both frontend and backend skills in one session',
      description:
        'CoderScreen combines a code editor, browser preview, and system design whiteboard so you can evaluate the full range of fullstack engineering skills.',
    },
    seo: {
      title: 'Hire Fullstack Developers - CoderScreen',
      description:
        'Assess fullstack developers with live coding, browser preview, and system design whiteboard. Evaluate frontend and backend skills together.',
      keywords: [
        'hire fullstack developers',
        'fullstack developer assessment',
        'fullstack coding interview',
        'full stack developer hiring',
        'fullstack technical screen',
        'full stack engineer assessment',
      ],
    },
    valueProps: {
      title: 'Why teams use CoderScreen for fullstack hiring',
      items: [
        {
          title: 'Frontend + Backend in One Tool',
          description:
            'Test both client and server skills without switching platforms. Code editor, browser preview, and execution in one environment.',
        },
        {
          title: 'End-to-End Thinking',
          description:
            'Evaluate how candidates connect frontend and backend concerns — API design, data flow, error handling, and user experience.',
        },
        {
          title: 'System Design Whiteboard',
          description:
            'Assess architecture skills for the full stack. Discuss databases, APIs, frontend state, caching, and deployment strategies.',
        },
        {
          title: '12+ Languages',
          description:
            'TypeScript, Python, Go, Java, and more. Let candidates demonstrate skills in whatever stack your team uses.',
        },
        {
          title: 'Real-Time Collaboration',
          description:
            'Pair program across the stack. See how candidates navigate between frontend and backend code with live multi-cursor editing.',
        },
        {
          title: 'Holistic Evaluation',
          description:
            'Coding, architecture, communication, and AI tool usage — CoderScreen captures everything you need to make a confident hire.',
        },
      ],
    },
    features: {
      title: 'Features for fullstack hiring',
      items: [
        {
          title: 'Multi-Language Code Execution',
          description:
            'Run frontend and backend code with real output. Candidates demonstrate skills across the stack without leaving the platform.',
        },
        {
          title: 'Collaborative Whiteboard',
          description:
            'Map out full-stack architecture including APIs, databases, frontend components, and deployment infrastructure.',
        },
        {
          title: 'Interview Recording',
          description:
            'Replay the full session to review both coding and design discussions. Share with team members for calibrated hiring decisions.',
        },
        {
          title: 'Flexible Assessment Formats',
          description:
            'Run live interviews or async take-home projects. Mix coding and design rounds in a single platform.',
        },
      ],
    },
    faq: [
      {
        question: 'Can I test both frontend and backend skills in one interview?',
        answer:
          'Yes. CoderScreen supports multiple languages with real execution and includes a browser preview for frontend work. Switch between frontend and backend seamlessly.',
      },
      {
        question: 'How do I structure a fullstack interview?',
        answer:
          'We recommend combining a coding exercise with a system design discussion. Use the code editor for implementation and the whiteboard for architecture.',
      },
      {
        question: 'What languages are available for fullstack assessments?',
        answer:
          'TypeScript, JavaScript, Python, Go, Java, Rust, Ruby, PHP, C, C++, and Bash. Cover both frontend and backend with native execution.',
      },
      {
        question: 'Can fullstack candidates do take-home projects?',
        answer:
          'Yes. Send async coding projects that candidates complete on their own schedule. Review their code with full playback of their development process.',
      },
      {
        question: 'How does the whiteboard help with fullstack evaluation?',
        answer:
          'The whiteboard lets candidates diagram the full system — frontend components, API layer, database schema, and infrastructure. Essential for senior fullstack roles.',
      },
    ],
  },
  'devops-engineers': {
    slug: 'devops-engineers',
    type: 'role',
    displayName: 'DevOps Engineers',
    hero: {
      title: 'Hire DevOps Engineers',
      subtitle: 'Assess infrastructure and automation skills effectively',
      description:
        'CoderScreen supports Bash, Python, Go, and system design whiteboarding — the tools you need to evaluate DevOps candidates on scripting, architecture, and infrastructure thinking.',
    },
    seo: {
      title: 'Hire DevOps Engineers - CoderScreen',
      description:
        'Assess DevOps candidates with Bash and Python execution, system design whiteboard, and live collaboration. Evaluate infrastructure skills.',
      keywords: [
        'hire devops engineers',
        'devops engineer assessment',
        'devops coding interview',
        'infrastructure engineer hiring',
        'sre hiring platform',
        'devops technical screen',
      ],
    },
    valueProps: {
      title: 'Why teams use CoderScreen for DevOps hiring',
      items: [
        {
          title: 'Bash & Scripting Execution',
          description:
            'Candidates write and run Bash scripts, Python automation, and Go tools with real output. Test practical scripting skills.',
        },
        {
          title: 'Infrastructure Whiteboard',
          description:
            'Evaluate architecture thinking with collaborative diagramming. Discuss CI/CD pipelines, cloud infrastructure, and deployment strategies.',
        },
        {
          title: 'Real Problem Solving',
          description:
            'Go beyond trivia questions. See how candidates debug, automate, and think about reliability with hands-on coding challenges.',
        },
        {
          title: 'Multi-Language Support',
          description:
            'Bash, Python, Go, and more. Let candidates use the languages your infrastructure actually runs on.',
        },
        {
          title: 'Live Collaboration',
          description:
            'Pair on infrastructure problems in real time. See how candidates communicate about systems, tradeoffs, and operational concerns.',
        },
        {
          title: 'Interview Recording',
          description:
            'Review sessions with your team. Especially useful when infrastructure decisions need input from multiple stakeholders.',
        },
      ],
    },
    features: {
      title: 'Features for DevOps hiring',
      items: [
        {
          title: 'Bash & Python Execution',
          description:
            'Run shell scripts and automation code with real output. Test candidates on the tools they will use daily.',
        },
        {
          title: 'System Design Whiteboard',
          description:
            'Discuss CI/CD pipelines, cloud architecture, container orchestration, and monitoring strategies visually.',
        },
        {
          title: 'Async Assessments',
          description:
            'Send take-home infrastructure challenges. Candidates complete them on their own time with full code playback for review.',
        },
        {
          title: 'AI Assistant',
          description:
            'See how candidates leverage AI for scripting, debugging, and infrastructure-as-code — increasingly important for modern DevOps.',
        },
      ],
    },
    faq: [
      {
        question: 'Can DevOps candidates write and run Bash scripts?',
        answer:
          'Yes. We support Bash execution with real terminal output. Candidates can write scripts, pipe commands, and see results immediately.',
      },
      {
        question: 'How do I test infrastructure design skills?',
        answer:
          'Use our collaborative whiteboard to discuss cloud architecture, CI/CD pipelines, container orchestration, and infrastructure-as-code approaches.',
      },
      {
        question: 'What languages are relevant for DevOps interviews?',
        answer:
          'Bash, Python, and Go are the most common. All three are fully supported with real-time execution on CoderScreen.',
      },
      {
        question: 'Can I assess Kubernetes and Docker knowledge?',
        answer:
          'While we do not run containers directly, candidates can write Dockerfiles, Kubernetes manifests, and discuss orchestration using the editor and whiteboard.',
      },
      {
        question: 'Is CoderScreen suitable for SRE interviews too?',
        answer:
          'Yes. SRE interviews often combine coding (Python, Go) with system design. CoderScreen handles both with real execution and collaborative whiteboarding.',
      },
    ],
  },
  'mobile-developers': {
    slug: 'mobile-developers',
    type: 'role',
    displayName: 'Mobile Developers',
    hero: {
      title: 'Hire Mobile Developers',
      subtitle: 'Evaluate mobile engineering skills with live coding',
      description:
        'CoderScreen lets you assess mobile developer candidates on algorithmic thinking, system design, and coding fundamentals with real-time execution and collaboration.',
    },
    seo: {
      title: 'Hire Mobile Developers - CoderScreen',
      description:
        'Assess mobile developers with live coding interviews, system design whiteboard, and real-time collaboration. Evaluate iOS and Android skills.',
      keywords: [
        'hire mobile developers',
        'mobile developer assessment',
        'mobile coding interview',
        'ios developer hiring',
        'android developer hiring',
        'mobile technical screen',
      ],
    },
    valueProps: {
      title: 'Why teams use CoderScreen for mobile hiring',
      items: [
        {
          title: 'Language Support',
          description:
            'TypeScript, Java, C, C++, and more. Test mobile candidates in the languages that power iOS and Android development.',
        },
        {
          title: 'System Design for Mobile',
          description:
            'Evaluate app architecture, state management, networking, and offline-first design with the collaborative whiteboard.',
        },
        {
          title: 'Algorithm & Data Structures',
          description:
            'Test core CS skills that matter for mobile performance — memory management, efficient data structures, and async patterns.',
        },
        {
          title: 'Live Collaboration',
          description:
            'Pair program with candidates in real time. See how they approach problems, communicate, and iterate on solutions.',
        },
        {
          title: 'Interview Recording',
          description:
            'Share coding sessions with your mobile team lead or hiring committee. Everyone sees the same candidate performance.',
        },
        {
          title: 'No Setup Required',
          description:
            'Candidates join from their browser. No Xcode, no Android Studio, no environment configuration needed.',
        },
      ],
    },
    features: {
      title: 'Features for mobile hiring',
      items: [
        {
          title: 'Multi-Language Execution',
          description:
            'Run Java, TypeScript, C, C++, and more with real output. Test algorithmic and logic skills in mobile-relevant languages.',
        },
        {
          title: 'Architecture Whiteboard',
          description:
            'Discuss MVVM, MVC, app lifecycle, state management, and networking patterns with collaborative diagramming.',
        },
        {
          title: 'Async Assessments',
          description:
            'Send take-home projects for candidates to build mobile-focused solutions on their own schedule.',
        },
        {
          title: 'AI-Assisted Coding',
          description:
            'Evaluate how mobile candidates use AI tools for code generation and problem-solving — a growing part of mobile development workflows.',
        },
      ],
    },
    faq: [
      {
        question: 'Can I test Swift or Kotlin directly?',
        answer:
          'We support Java, TypeScript, C, and C++ for code execution. For Swift/Kotlin-specific questions, use the editor for code review and the whiteboard for architecture discussions.',
      },
      {
        question: 'How do I evaluate mobile architecture skills?',
        answer:
          'Use the whiteboard to discuss app architecture patterns (MVVM, MVC), state management, navigation, and data layer design.',
      },
      {
        question: 'Is CoderScreen useful for React Native or Flutter interviews?',
        answer:
          'Yes. TypeScript execution supports React Native logic testing. Use the whiteboard to discuss cross-platform architecture and component design.',
      },
      {
        question: 'Can candidates build UI during the interview?',
        answer:
          'Candidates can write TypeScript/JavaScript with browser preview for web-based UI work. For native UI, use the whiteboard to discuss layouts and design patterns.',
      },
      {
        question: 'How do I assess mobile-specific skills like offline support?',
        answer:
          'Combine coding challenges (data structures, caching logic) with whiteboard discussions of offline-first architecture, sync strategies, and local storage patterns.',
      },
    ],
  },
  'data-engineers': {
    slug: 'data-engineers',
    type: 'role',
    displayName: 'Data Engineers',
    hero: {
      title: 'Hire Data Engineers',
      subtitle: 'Assess data pipeline and processing skills with real code',
      description:
        'CoderScreen supports Python, SQL-style logic, and system design whiteboarding to evaluate data engineers on ETL, pipeline design, and data modeling.',
    },
    seo: {
      title: 'Hire Data Engineers - CoderScreen',
      description:
        'Assess data engineers with Python execution, system design whiteboard, and live collaboration. Evaluate pipeline and data modeling skills.',
      keywords: [
        'hire data engineers',
        'data engineer assessment',
        'data engineering interview',
        'data pipeline hiring',
        'etl developer assessment',
        'data engineer technical screen',
      ],
    },
    valueProps: {
      title: 'Why teams use CoderScreen for data engineering hiring',
      items: [
        {
          title: 'Python Execution',
          description:
            'Candidates write and run Python for data transformation, parsing, and processing. Test real skills with real output.',
        },
        {
          title: 'Pipeline Design Whiteboard',
          description:
            'Evaluate ETL architecture, data modeling, and pipeline design with collaborative diagramming. Critical for senior data roles.',
        },
        {
          title: 'Data Processing Challenges',
          description:
            'Create challenges involving data parsing, transformation, aggregation, and validation. See how candidates handle messy data.',
        },
        {
          title: 'Multi-Language Support',
          description:
            'Python, Java, Go, Bash, and more. Test candidates in the languages your data infrastructure actually uses.',
        },
        {
          title: 'Live Collaboration',
          description:
            'Pair on data problems in real time. See how candidates think about data quality, edge cases, and processing efficiency.',
        },
        {
          title: 'Interview Recording',
          description:
            'Share sessions with data team leads and stakeholders. Review how candidates approach data architecture decisions.',
        },
      ],
    },
    features: {
      title: 'Features for data engineering hiring',
      items: [
        {
          title: 'Python & SQL-Style Logic',
          description:
            'Run Python data processing code with real output. Test ETL logic, data transformation, and pipeline components.',
        },
        {
          title: 'System Design Whiteboard',
          description:
            'Discuss data warehouse architecture, streaming vs batch processing, and data modeling with collaborative diagrams.',
        },
        {
          title: 'Take-Home Projects',
          description:
            'Send async data engineering challenges. Candidates build pipeline components on their own time with full code playback.',
        },
        {
          title: 'AI Assistant',
          description:
            'Assess how candidates use AI tools for data transformation, debugging, and pipeline optimization.',
        },
      ],
    },
    faq: [
      {
        question: 'Can candidates write and run SQL during the interview?',
        answer:
          'Candidates can write SQL in the editor and discuss query optimization. For execution, they can implement equivalent logic in Python with real output.',
      },
      {
        question: 'How do I test data pipeline design skills?',
        answer:
          'Use the whiteboard to discuss ETL architecture, data flow, batch vs streaming, and data modeling. Combine with Python coding for implementation evaluation.',
      },
      {
        question: 'What languages are relevant for data engineering interviews?',
        answer:
          'Python is the most common. We also support Java, Go, and Bash — all commonly used in data infrastructure.',
      },
      {
        question: 'Can I create custom data processing challenges?',
        answer:
          'Yes. Create challenges with custom input data and expected outputs. Test parsing, transformation, aggregation, and data quality handling.',
      },
      {
        question: 'Is CoderScreen suitable for data science interviews too?',
        answer:
          'Yes. Python execution with real output works well for data science tasks. Use the whiteboard for ML system design and the editor for implementation.',
      },
    ],
  },
};
