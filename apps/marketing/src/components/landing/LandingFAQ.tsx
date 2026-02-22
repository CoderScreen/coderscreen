'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@coderscreen/ui/accordion';

const FAQ_ITEMS = [
  {
    question: 'Do you offer a free plan or trial?',
    answer:
      'Yes. Our Basic tier includes the core features and allows up to three interviews per month. No credit card is required and you can upgrade to the Starter or Scale plan at any time.',
  },
  {
    question: 'Can I upgrade, downgrade, or cancel anytime?',
    answer:
      'Yes. You can upgrade to access more features or usage, downgrade if your needs change, or cancel anytime. Any unused time is prorated and credited where applicable.',
  },
  {
    question: 'What languages and frameworks are supported?',
    answer:
      'We support TypeScript, Python, JavaScript, Go, Rust, Java, C, C++, PHP, Ruby, Bash, and are constantly adding more. Our platform supports multi-file projects, whiteboard sessions, and automated grading via test cases.',
  },
  {
    question: 'Can I organize and reuse interview questions?',
    answer:
      'Yes. The Question Library lets you tag, categorize, and template prompts with markdown, visuals, and starter code to reuse across interviews.',
  },
  {
    question: 'Can I track how candidates solved the problem?',
    answer:
      'Yes. Code Playback records their keystrokes, edits, and pauses so you can follow their thought process step by step.',
  },
  {
    question: 'Does the platform integrate with ATS or HR tools?',
    answer:
      'Yes. The Scale and Enterprise plans include direct ATS integrations. All plans include API access so you can export data or build custom workflows.',
  },
  {
    question: 'Are there discounts for startups, nonprofits, or education?',
    answer:
      'Yes. We offer discounted plans for startup teams, educational institutions, and nonprofits. Please contact us to confirm eligibility and pricing.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export const LandingFAQ = () => {
  return (
    <section id='faq' className='w-full p-6'>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className='flex flex-col gap-4 text-center mb-12'>
        <h2 className='text-3xl font-semibold'>Frequently asked questions</h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          Everything you need to know about CoderScreen. Can't find the answer you're looking for?
          Please chat to our friendly team.
        </p>
      </div>

      <div className='max-w-3xl mx-auto'>
        <Accordion type='single' collapsible className='w-full'>
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger className='text-left'>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
