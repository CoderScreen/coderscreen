import { MarketingCTA } from '@/components/common/MarketingCTA';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { UseCaseData } from '@/lib/personaConfig';
import { UseCaseFAQ } from './UseCaseFAQ';
import { UseCaseFeatures } from './UseCaseFeatures';
import { UseCaseHero } from './UseCaseHero';
import { UseCaseLinks } from './UseCaseLinks';
import { UseCaseValueProps } from './UseCaseValueProps';

interface UseCasePageViewProps {
  data: UseCaseData;
}

export const UseCasePageView = ({ data }: UseCasePageViewProps) => {
  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-border/50 border-y-0'>
      <UseCaseHero data={data} />
      <UseCaseValueProps data={data} />
      <UseCaseFeatures data={data} />
      <LandingPricing />
      <UseCaseFAQ data={data} />
      <UseCaseLinks currentSlug={data.slug} type={data.type} />
      <MarketingCTA />
    </div>
  );
};
