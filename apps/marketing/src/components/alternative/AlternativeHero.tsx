import { Button } from '@coderscreen/ui/button';
import { RiArrowRightLine, RiGithubLine } from '@remixicon/react';
import { HeroBg } from '@/components/landing/HeroBg';
import { CompetitorData } from '@/lib/alternativeConfig';
import { siteConfig } from '@/lib/siteConfig';

interface AlternativeHeroProps {
  competitor: CompetitorData;
}

export const AlternativeHero = ({ competitor }: AlternativeHeroProps) => {
  return (
    <div className='relative min-h-[80vh] flex items-center justify-center p-6'>
      <div className='w-full h-full absolute inset-0 rounded-lg overflow-hidden'>
        <HeroBg />
      </div>

      <section className='relative z-10 max-w-4xl mx-auto text-center px-6'>
        <h1 className='text-5xl md:text-7xl font-bold text-center leading-tighter mb-6'>
          {competitor.hero.title}
        </h1>

        <p className='text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed mb-6'>
          {competitor.hero.description}
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
  );
};
