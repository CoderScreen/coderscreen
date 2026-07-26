import { Button } from '@coderscreen/ui/button';
import { RiArrowRightLine, RiDoubleQuotesL } from '@remixicon/react';
import type { RoundupPage } from '@/lib/roundupConfig';
import { siteConfig } from '@/lib/siteConfig';

interface RoundupWhyUsProps {
  roundup: RoundupPage;
}

export const RoundupWhyUs = ({ roundup }: RoundupWhyUsProps) => {
  const { caseStudy } = roundup.whyUs;

  return (
    <section className='border-t px-6 py-20'>
      <div className='max-w-3xl mx-auto'>
        <h2 className='text-3xl font-semibold mb-6'>{roundup.whyUs.title}</h2>

        <div className='space-y-4 mb-8'>
          {roundup.whyUs.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className='text-muted-foreground leading-relaxed'>
              {paragraph}
            </p>
          ))}
        </div>

        {caseStudy && (
          <figure className='border-l-2 border-primary bg-gray-50 p-6 mb-8'>
            <RiDoubleQuotesL className='size-7 text-gray-300 mb-2' aria-hidden='true' />
            <blockquote className='text-foreground leading-relaxed mb-4'>
              {caseStudy.quote}
            </blockquote>
            {caseStudy.metric && (
              <div className='text-2xl font-bold text-foreground mb-2'>{caseStudy.metric}</div>
            )}
            <figcaption className='text-sm text-muted-foreground'>
              {caseStudy.author}, {caseStudy.customer}
            </figcaption>
          </figure>
        )}

        <a href={siteConfig.external.getStarted}>
          <Button icon={RiArrowRightLine} iconPosition='right' variant='primary'>
            Get started with CoderScreen
          </Button>
        </a>
      </div>
    </section>
  );
};
