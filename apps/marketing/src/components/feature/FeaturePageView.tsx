import { Button } from '@coderscreen/ui/button';
import { RiArrowRightLine, RiCheckLine, RiGithubLine } from '@remixicon/react';
import type { ReactNode } from 'react';
import { MarketingCTA } from '@/components/common/MarketingCTA';
import { HeroBg } from '@/components/landing/HeroBg';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { siteConfig } from '@/lib/siteConfig';
import { type FaqItem, FeatureFAQ } from './FeatureFAQ';

export interface FeatureSection {
  title: string;
  description: string;
  bullets?: string[];
  visual: ReactNode;
}

export interface FeatureContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  valueProps: {
    title: string;
    items: Array<{ title: string; description: string }>;
  };
  features: {
    title: string;
    items: FeatureSection[];
  };
  faq: FaqItem[];
}

export const FeaturePageView = ({ content }: { content: FeatureContent }) => {
  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-y-0'>
      {/* Hero */}
      <div className='relative min-h-[70vh] flex items-center justify-center p-6'>
        <div className='w-full h-full absolute inset-0 overflow-hidden'>
          <HeroBg />
        </div>
        <section className='relative z-10 max-w-4xl mx-auto text-center px-6'>
          <h1 className='text-5xl md:text-7xl font-bold leading-tighter mb-4'>
            {content.hero.title}
          </h1>
          <p className='text-xl md:text-2xl font-medium mb-4'>{content.hero.subtitle}</p>
          <p className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6'>
            {content.hero.description}
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <a href={siteConfig.external.getStarted}>
              <Button
                icon={RiArrowRightLine}
                iconPosition='right'
                variant='primary'
                className='px-6 py-2 text-base font-semibold'
              >
                Get started for free
              </Button>
            </a>
            <a href={siteConfig.external.githubRepo}>
              <Button
                icon={RiGithubLine}
                variant='secondary'
                className='px-6 py-2 text-base font-semibold'
              >
                Star us on GitHub
              </Button>
            </a>
          </div>
        </section>
      </div>

      {/* Value props */}
      <section className='py-16 px-6 border-t'>
        <div className='max-w-5xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12'>
            {content.valueProps.title}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {content.valueProps.items.map((item) => (
              <div key={item.title}>
                <h3 className='text-lg font-semibold mb-2'>{item.title}</h3>
                <p className='text-muted-foreground leading-relaxed'>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternating feature sections */}
      <section className='py-8 px-6 border-t'>
        <div className='max-w-5xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-16'>
            {content.features.title}
          </h2>
          <div className='space-y-20'>
            {content.features.items.map((feature, index) => (
              <div
                key={feature.title}
                className='grid grid-cols-1 lg:grid-cols-2 gap-10 items-center'
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <h3 className='text-2xl font-bold mb-3'>{feature.title}</h3>
                  <p className='text-muted-foreground leading-relaxed mb-4'>
                    {feature.description}
                  </p>
                  {feature.bullets && (
                    <ul className='space-y-2'>
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className='flex items-start gap-2'>
                          <RiCheckLine className='size-5 text-primary shrink-0 mt-0.5' />
                          <span className='text-sm text-gray-700'>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>{feature.visual}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className='border-t'>
        <LandingPricing />
      </div>

      <div className='border-t'>
        <FeatureFAQ items={content.faq} />
      </div>

      <MarketingCTA />
    </div>
  );
};
