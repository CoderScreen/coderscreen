import Link from 'next/link';
import { ComparisonData, comparisonData } from '@/lib/comparisonConfig';

interface CompareLinksProps {
  currentComparison: ComparisonData;
}

export const CompareLinks = ({ currentComparison }: CompareLinksProps) => {
  const otherComparisons = Object.values(comparisonData).filter(
    (c) => c.slug !== currentComparison.slug
  );

  if (otherComparisons.length === 0) {
    return null;
  }

  return (
    <section className='py-12 px-6'>
      <div className='container mx-auto max-w-4xl'>
        <h2 className='text-xl font-semibold mb-4'>More Comparisons</h2>
        <div className='flex flex-wrap gap-3'>
          {otherComparisons.map((comparison) => (
            <Link
              key={comparison.slug}
              href={`/compare/${comparison.slug}`}
              className='px-4 py-2 border border-border/50 rounded-md hover:bg-muted/50 transition-colors text-sm'
            >
              {comparison.toolA.displayName} vs {comparison.toolB.displayName}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
