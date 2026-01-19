import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { RiGithubLine } from '@remixicon/react';
import { HeroBg } from '@/components/landing/HeroBg';
import { ComparisonData } from '@/lib/comparisonConfig';
import { siteConfig } from '@/lib/siteConfig';

interface CompareHeroProps {
  comparison: ComparisonData;
}

export const CompareHero = ({ comparison }: CompareHeroProps) => {
  return (
    <div className='relative min-h-[70vh] flex items-center justify-center p-6'>
      <div className='w-full h-full absolute inset-0 rounded-lg overflow-hidden'>
        <HeroBg />
      </div>

      <section className='relative z-10 max-w-4xl mx-auto text-center px-6'>
        <div className='mb-4'>
          <Badge variant='neutral' className='py-1.5 px-4'>
            <span className='font-medium'>Platform Comparison</span>
          </Badge>
        </div>

        <h1 className='text-5xl md:text-7xl font-bold text-center leading-tighter mb-6'>
          {comparison.toolA.displayName}
          <span className='text-muted-foreground'> vs </span>
          {comparison.toolB.displayName}
        </h1>

        <p className='text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed mb-6'>
          {comparison.hero.description}
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <a href={siteConfig.external.getStarted}>
            <Button variant='primary' className='px-6 py-2 text-base font-semibold'>
              Try CoderScreen free
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
  );
};
