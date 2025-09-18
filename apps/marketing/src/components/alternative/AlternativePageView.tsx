import { MarketingCTA } from '@/components/common/MarketingCTA';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingUseCases } from '@/components/landing/LandingUseCases';
import { CompetitorData } from '@/lib/alternativeConfig';
import { AlternativeComparison } from './AlternativeComparison';
import { AlternativeHero } from './AlternativeHero';
import { AlternativePricing } from './AlternativePricing';

interface AlternativePageViewProps {
  competitor: CompetitorData;
}

export const AlternativePageView = ({ competitor }: AlternativePageViewProps) => {
  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-border/50 border-y-0'>
      <AlternativeHero competitor={competitor} />
      <LandingUseCases />
      <AlternativeComparison competitor={competitor} />
      <AlternativePricing competitor={competitor} />
      <LandingFeatures />
      <MarketingCTA />
    </div>
  );
};
