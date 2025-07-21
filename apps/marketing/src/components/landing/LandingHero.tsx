import { Button } from '@coderscreen/ui/button';
import { Badge } from '@coderscreen/ui/badge';
import { LargeHeader } from '@coderscreen/ui/heading';
import { BodyText } from '@coderscreen/ui/typography';
import { RiCodeBoxLine } from '@remixicon/react';

export const LandingHero = () => {
  return (
    <section className='w-full flex flex-col items-center justify-center py-20 px-4 bg-gradient-to-b from-white to-gray-50'>
      <div className='max-w-2xl w-full flex flex-col items-center text-center gap-6'>
        <Badge className='mb-2' variant='neutral'>
          <span className='flex items-center gap-1'>
            <RiCodeBoxLine className='inline-block size-4 mr-1 text-primary' />
            Developer Tool
          </span>
        </Badge>
        <LargeHeader className='text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900'>
          CoderScreen: The Modern Platform for Technical Interviews
        </LargeHeader>
        <BodyText className='text-lg md:text-xl text-gray-600 max-w-xl mx-auto'>
          Effortlessly run live coding interviews, collaborate in real-time, and evaluate candidates
          with powerful tools built for developers by developers.
        </BodyText>
        <div className='mt-6 flex flex-col sm:flex-row gap-3 justify-center'>
          <Button variant='primary' className='text-lg font-semibold shadow-md'>
            Get Started
          </Button>
          <Button variant='secondary' className='text-lg font-semibold' asChild>
            <a href='#features'>Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  );
};
