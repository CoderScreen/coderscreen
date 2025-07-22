import LandingCanvas from '@/components/landing/LandingCanvas';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { RiGithubLine } from '@remixicon/react';

export const LandingHero = () => {
  return (
    <div className='relative p-6'>
      <div className='w-full h-full rounded-lg overflow-hidden'>
        <LandingCanvas />
      </div>

      <section
        className='p-10 w-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.95) 60%,  rgba(255,255,255,0) 100%)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {/* Text Content */}
        <div className='flex flex-col items-center gap-4 mb-6'>
          <Badge variant='warning' className='flex flex-row'>
            <RiGithubLine className='h-4 w-4 shrink-0' />
            <span>Check out our GitHub</span>
          </Badge>
          <h1 className='text-5xl font-bold text-center'>
            For Developers <br /> Hiring Developers
          </h1>
          <p className='text-muted-foreground text-center'>
            CoderScreen is open source and built for technical interviews. Enjoy real-time
            collaborative coding and a seamless, intuitive experience—free for everyone.
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
