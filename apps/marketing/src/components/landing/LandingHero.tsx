import LandingCanvas from '@/components/landing/LandingCanvas';
import { siteConfig } from '@/lib/siteConfig';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { RiGithubLine } from '@remixicon/react';

export const LandingHero = () => {
  return (
    <div className='relative p-6'>
      <div className='w-full rounded-lg overflow-hidden'>
        <LandingCanvas />
      </div>

      <section className='p-10 w-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {/* Text Content */}
        <div className='flex flex-col items-center gap-4 mb-6'>
          <a href={siteConfig.githubUrl} target='_blank' rel='noopener noreferrer'>
            <Badge variant='warning' className='flex flex-row'>
              <RiGithubLine className='h-4 w-4 shrink-0' />
              <span>Star us on GitHub</span>
            </Badge>
          </a>
          <h1 className='text-5xl font-bold text-center'>
            For Developers <br /> Hiring Developers
          </h1>
          <p className='text-muted-foreground text-center'>
            Assess real coding skills, accelerate your hiring, and build stronger teams with
            CoderScreen. Open source technical interviews and coding tests that reflect real
            engineering work.
          </p>
        </div>

        {/* CTA Section */}
        <div className='text-center'>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button variant='primary' className='px-4'>
              Get started for free
            </Button>
            <Button variant='secondary' className='px-4'>
              Book a demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
