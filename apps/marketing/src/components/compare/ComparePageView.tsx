import { MarketingCTA } from '@/components/common/MarketingCTA';
import { ComparisonData } from '@/lib/comparisonConfig';
import { CompareFAQ } from './CompareFAQ';
import { CompareHero } from './CompareHero';
import { CompareLinks } from './CompareLinks';
import { ComparePricing } from './ComparePricing';
import { CompareTable } from './CompareTable';
import { CompareVerdict } from './CompareVerdict';

interface ComparePageViewProps {
  comparison: ComparisonData;
}

export const ComparePageView = ({ comparison }: ComparePageViewProps) => {
  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-border/50 border-y-0'>
      <CompareHero comparison={comparison} />
      <CompareVerdict comparison={comparison} />
      <CompareTable comparison={comparison} />
      <ComparePricing comparison={comparison} />
      <CompareFAQ comparison={comparison} />
      <CompareLinks currentComparison={comparison} />
      <MarketingCTA />
    </div>
  );
};
