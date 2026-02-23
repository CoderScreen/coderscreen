import { Button } from '@coderscreen/ui/button';
import { HeroOverlay } from '@/components/landing/HeroOverlay';
import { siteConfig } from '@/lib/siteConfig';

export const MarketingCTA = () => {
  return (
    <section className='relative overflow-hidden bg-primary'>
      <div className='relative max-w-6xl mx-auto border-x border-white/50'>
        {/* Geometric pattern overlay */}
        <div className='absolute inset-0 pointer-events-none'>
          <HeroOverlay />
        </div>

        <div className='relative z-10 py-24 md:py-32 px-6 text-center'>
          <h2 className='max-w-2xl mx-auto text-4xl md:text-5xl font-bold text-white mb-4'>
            Start interviewing the right way
          </h2>
          <p className='text-white/85 text-center max-w-2xl mx-auto text-lg leading-relaxed mb-8'>
            Set up your first coding interview in minutes. No credit card required.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <a href={siteConfig.external.getStarted}>
              <Button
                variant='secondary'
                className='px-6 py-2 text-base text-foreground border-transparent shadow-lg'
              >
                Get started for free
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
