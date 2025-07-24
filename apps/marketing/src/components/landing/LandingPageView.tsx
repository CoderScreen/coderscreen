import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { MarketingCTA } from '@/components/common/MarketingCTA';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingWorkflow } from '@/components/landing/LandingWorkflow';

export const LandingPageView = () => {
  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-border/50 border-y-0'>
      <LandingHero />
      <LandingFeatures />
      <LandingWorkflow />
      <LandingPricing />
      <LandingFAQ />
      <MarketingCTA />
    </div>
  );
};
