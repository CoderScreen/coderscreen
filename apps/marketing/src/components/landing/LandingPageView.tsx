import { MarketingCTA } from '@/components/common/MarketingCTA';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingWorkflow } from '@/components/landing/LandingWorkflow';
import { LandingHero } from './LandingHero';
import { LandingUseCases } from './LandingUseCases';

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
