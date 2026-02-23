import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { RiGithubFill } from '@remixicon/react';
import Image from 'next/image';
import { siteConfig } from '@/lib/siteConfig';
import { HeroOverlay } from './HeroOverlay';

export const LandingHero = () => {
  return (
    <div className='relative overflow-hidden bg-primary'>
      {/* === Blue hero section === */}
      <div className='relative overflow-hidden max-w-6xl mx-auto border-x border-white/50'>
        {/* Geometric pattern overlay */}
        <div className='absolute inset-0 pointer-events-none'>
          <HeroOverlay />
        </div>

        {/* Hero content */}
        <section className='max-w-6xl mx-auto relative z-10 pt-16 pb-12 md:pt-20 md:pb-16 text-center px-6'>
          <div className='max-w-4xl mx-auto'>
            <div className='mb-5'>
              <a href={siteConfig.external.githubRepo} target='_blank' rel='noopener noreferrer'>
                <Badge
                  variant='warning'
                  className='py-1.5 px-4 bg-white/15 text-white border-transparent'
                >
                  <RiGithubFill className='h-4 w-4 shrink-0' />
                  <span className='font-medium'>Star us on GitHub</span>
                </Badge>
              </a>
            </div>

            <h1 className='text-5xl md:text-7xl font-bold leading-tighter mb-5 text-white'>
              The Open Source
              <br />
              Interview Platform
            </h1>

            <p className='text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed mb-8'>
              Run live coding interviews and technical screens with a collaborative editor your
              candidates will actually enjoy.
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
        </section>

        {/* Product screenshot — clipped at bottom of blue section */}
        <div className='relative z-10 px-6 md:px-12 overflow-hidden max-h-[280px] md:max-h-[400px]'>
          <div className='max-w-5xl mx-auto'>
            <div className='rounded-t-xl bg-background shadow-2xl overflow-hidden ring-1 ring-white/15'>
              <Image
                src='/features/editor.png'
                alt='CoderScreen coding interview platform'
                width={1920}
                height={1080}
                className='w-full h-auto'
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
