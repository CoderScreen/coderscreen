import { MarketingCTA } from '@/components/common/MarketingCTA';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingUseCases } from '@/components/landing/LandingUseCases';
import { CompetitorData } from '@/lib/alternativeConfig';
import { AlternativeComparison } from './AlternativeComparison';
import { AlternativeFAQ } from './AlternativeFAQ';
import { AlternativeHero } from './AlternativeHero';
import { AlternativeLinks } from './AlternativeLinks';
import { AlternativePricing } from './AlternativePricing';
import { AlternativeWhySwitch } from './AlternativeWhySwitch';

interface AlternativePageViewProps {
  competitor: CompetitorData;
}

export const AlternativePageView = ({ competitor }: AlternativePageViewProps) => {
  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-border/50 border-y-0'>
      <AlternativeHero competitor={competitor} />
      <AlternativeWhySwitch competitor={competitor} />
      <LandingUseCases />
      <AlternativeComparison competitor={competitor} />
      <AlternativePricing competitor={competitor} />
      <LandingFeatures />
      <AlternativeFAQ competitor={competitor} />
      <AlternativeLinks currentCompetitor={competitor} />
      <MarketingCTA />
    </div>
  );
};
