import { Button } from '@coderscreen/ui/button';
import { RiArrowRightLine } from '@remixicon/react';
import { ComparisonData } from '@/lib/comparisonConfig';
import { siteConfig } from '@/lib/siteConfig';

interface ComparePricingProps {
  comparison: ComparisonData;
}

export const ComparePricing = ({ comparison }: ComparePricingProps) => {
  const { pricing, toolA, toolB } = comparison;

  return (
    <section className='py-16 border-b border-border/50'>
      <div className='container mx-auto px-6'>
        <div className='max-w-4xl mx-auto mb-10'>
          <h2 className='text-3xl font-semibold mb-4'>Pricing Comparison</h2>
          <p className='text-muted-foreground'>
            How pricing compares between {toolA.displayName}, {toolB.displayName}, and CoderScreen.
          </p>
        </div>

        <div className='max-w-4xl mx-auto'>
          <div className='grid grid-cols-3 gap-8'>
            <div className='text-center'>
              <p className='text-sm text-muted-foreground mb-2'>{toolA.displayName}</p>
              <p className='text-2xl font-semibold'>{pricing.toolAPrice}</p>
              {pricing.toolANotes && (
                <p className='text-sm text-muted-foreground mt-1'>{pricing.toolANotes}</p>
              )}
            </div>

            <div className='text-center'>
              <p className='text-sm text-muted-foreground mb-2'>{toolB.displayName}</p>
              <p className='text-2xl font-semibold'>{pricing.toolBPrice}</p>
              {pricing.toolBNotes && (
                <p className='text-sm text-muted-foreground mt-1'>{pricing.toolBNotes}</p>
              )}
            </div>

            <div className='text-center'>
              <p className='text-sm text-muted-foreground mb-2'>CoderScreen</p>
              <p className='text-2xl font-semibold'>{pricing.coderScreenPrice}</p>
              {pricing.coderScreenNotes && (
                <p className='text-sm text-muted-foreground mt-1'>{pricing.coderScreenNotes}</p>
              )}
            </div>
          </div>

          <div className='mt-10 text-center'>
            <a href={siteConfig.external.getStarted}>
              <Button icon={RiArrowRightLine} iconPosition='right' variant='primary'>
                Start free trial
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
