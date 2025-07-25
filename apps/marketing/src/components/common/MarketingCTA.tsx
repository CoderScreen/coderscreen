import { Button } from '@coderscreen/ui/button';
import { siteConfig } from '@/lib/siteConfig';

export const MarketingCTA = () => {
  return (
    <section className='relative p-6 py-40'>
      {/* Text Content */}
      <div className='flex flex-col items-center gap-4 mb-6'>
        <h2 className='max-w-2xl text-5xl font-bold text-center'>
          Ready to Transform Your Hiring Process?
        </h2>
        <p className='text-muted-foreground text-center max-w-2xl'>
          Experience the future of technical interviews with CoderScreen. Start building better
          teams with our collaborative coding platform.
        </p>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <a href={siteConfig.external.getStarted}>
          <Button variant='primary' className='px-4'>
            Get Started
          </Button>
        </a>
        <a href={siteConfig.external.bookDemo}>
          <Button variant='secondary' className='px-4'>
            Schedule a Demo
          </Button>
        </a>
      </div>
    </section>
  );
};
