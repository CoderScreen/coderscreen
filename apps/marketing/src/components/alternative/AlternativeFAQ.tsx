'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@coderscreen/ui/accordion';
import { CompetitorData } from '@/lib/alternativeConfig';

interface AlternativeFAQProps {
  competitor: CompetitorData;
}

export const AlternativeFAQ = ({ competitor }: AlternativeFAQProps) => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: competitor.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className='py-16 px-6'>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className='max-w-3xl mx-auto'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Frequently asked questions about {competitor.displayName}
          </h2>
          <p className='text-lg text-muted-foreground'>
            Common questions when comparing CoderScreen to {competitor.displayName}
          </p>
        </div>

        <Accordion type='single' collapsible className='w-full'>
          {competitor.faq.map((item, index) => (
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
