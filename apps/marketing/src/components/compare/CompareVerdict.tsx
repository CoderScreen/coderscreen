import { ComparisonData } from '@/lib/comparisonConfig';

interface CompareVerdictProps {
  comparison: ComparisonData;
}

export const CompareVerdict = ({ comparison }: CompareVerdictProps) => {
  return (
    <section className='py-16 px-6 border-b border-border/50'>
      <div className='container mx-auto max-w-4xl'>
        <h2 className='text-3xl font-semibold mb-4'>Quick Summary</h2>
        <p className='text-muted-foreground mb-8'>{comparison.verdict.summary}</p>

        <div className='space-y-6'>
          <div>
            <h3 className='font-medium mb-1'>{comparison.toolA.displayName}</h3>
            <p className='text-sm text-muted-foreground'>{comparison.verdict.toolABestFor}</p>
          </div>

          <div>
            <h3 className='font-medium mb-1'>{comparison.toolB.displayName}</h3>
            <p className='text-sm text-muted-foreground'>{comparison.verdict.toolBBestFor}</p>
          </div>

          <div className='pt-4 border-t border-border/50'>
            <h3 className='font-medium mb-1'>Why consider CoderScreen?</h3>
            <p className='text-sm text-muted-foreground'>
              {comparison.verdict.coderScreenAdvantage}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
