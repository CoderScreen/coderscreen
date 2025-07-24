import { HeroBg } from '@/components/landing/HeroBg';
import { siteConfig } from '@/lib/siteConfig';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { RiGithubLine } from '@remixicon/react';

export const LandingHero = () => {
  return (
    <div className='relative min-h-[80vh] flex items-center justify-center p-6'>
      <div className='w-full h-full absolute inset-0 rounded-lg overflow-hidden'>
        <HeroBg />
      </div>

      <section className='relative z-10 max-w-4xl mx-auto text-center px-6'>
        {/* GitHub Badge */}
        <div className='mb-2'>
          <a href={siteConfig.githubUrl} target='_blank' rel='noopener noreferrer'>
            <Badge variant='warning' className='py-2.5 px-4'>
              <RiGithubLine className='h-4 w-4 shrink-0' />
              <span className='font-medium'>Star us on GitHub</span>
            </Badge>
          </a>
        </div>

        {/* Main Heading */}
        <h1 className='text-5xl md:text-7xl font-bold text-center leading-tighter mb-6'>
          For Developers
          <br />
          <span className='text-primary'>Hiring Developers</span>
        </h1>

        {/* Description */}
        <p className='text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed mb-6'>
          Assess real coding skills, accelerate your hiring, and build stronger teams with
          CoderScreen. Open source technical interviews and coding tests that reflect real
          engineering work.
        </p>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <Button variant='primary' className='px-6 py-2 text-base font-semibold'>
            Get started for free
          </Button>
          <Button variant='secondary' className='px-6 py-2 text-base font-semibold'>
            Book a demo
          </Button>
        </div>
      </section>
    </div>
  );
};
