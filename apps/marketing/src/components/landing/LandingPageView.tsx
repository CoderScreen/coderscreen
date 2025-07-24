import { LandingHero } from './LandingHero';
import { LandingUseCases } from './LandingUseCases';
import { MarketingCTA } from '@/components/common/MarketingCTA';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingWorkflow } from '@/components/landing/LandingWorkflow';
import { LandingFeatures } from '@/components/landing/LandingFeatures';

export const LandingPageView = () => {
  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-border/50 border-y-0'>
      <LandingHero />
      <LandingUseCases />
      <LandingFeatures />
      <LandingWorkflow />
      <LandingPricing />
      <LandingFAQ />
      <MarketingCTA />
    </div>
  );
};
