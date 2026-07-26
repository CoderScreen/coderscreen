'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@coderscreen/ui/accordion';
import type { RoundupPage } from '@/lib/roundupConfig';

interface RoundupFAQProps {
  roundup: RoundupPage;
}

export const RoundupFAQ = ({ roundup }: RoundupFAQProps) => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: roundup.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className='border-t px-6 py-20'>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className='max-w-3xl mx-auto'>
        <div className='flex flex-col items-center gap-2 text-center mb-10'>
          <h2 className='text-3xl font-semibold'>Frequently asked questions</h2>
          <p className='text-muted-foreground'>
            Common questions about choosing a {roundup.competitorName} alternative
          </p>
        </div>

        <Accordion type='single' collapsible className='w-full'>
          {roundup.faq.map((item, index) => (
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
