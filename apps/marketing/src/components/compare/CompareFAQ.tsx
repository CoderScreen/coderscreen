'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@coderscreen/ui/accordion';
import { ComparisonData } from '@/lib/comparisonConfig';

interface CompareFAQProps {
  comparison: ComparisonData;
}

export const CompareFAQ = ({ comparison }: CompareFAQProps) => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: comparison.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className='py-16 border-b border-border/50'>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className='container mx-auto px-6'>
        <div className='max-w-4xl mx-auto mb-10'>
          <h2 className='text-3xl font-semibold mb-4'>Frequently Asked Questions</h2>
          <p className='text-muted-foreground'>
            Common questions about {comparison.toolA.displayName} vs {comparison.toolB.displayName}.
          </p>
        </div>

        <div className='max-w-3xl mx-auto'>
          <Accordion type='single' collapsible className='w-full'>
            {comparison.faq.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`}>
                <AccordionTrigger className='text-left'>{item.question}</AccordionTrigger>
                <AccordionContent className='text-muted-foreground'>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
