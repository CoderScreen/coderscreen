import { Button } from '@coderscreen/ui/button';

export const MarketingCTA = () => {
  return (
    <section className='relative p-6 py-24'>
      {/* Text Content */}
      <div className='flex flex-col items-center gap-4 mb-6'>
        <h2 className='text-3xl font-bold text-center'>Ready to Transform Your Hiring Process?</h2>
        <p className='text-muted-foreground text-center max-w-2xl'>
          Join thousands of companies that trust CoderScreen for their technical interviews. Start
          building better teams with our collaborative coding platform.
        </p>
      </div>

      {/* CTA Section */}
      <div className='text-center'>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button variant='primary' className='px-4'>
            Start Free Trial
          </Button>
          <Button variant='secondary' className='px-4'>
            Schedule Demo
          </Button>
        </div>
        <p className='text-sm text-muted-foreground mt-4'>
          No credit card required • 14-day free trial
        </p>
      </div>
    </section>
  );
};
