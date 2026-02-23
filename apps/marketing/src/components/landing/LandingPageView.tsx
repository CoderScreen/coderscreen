import { MarketingCTA } from '@/components/common/MarketingCTA';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
// import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingPlatformFeatures } from '@/components/landing/LandingPlatformFeatures';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingUseCases } from '@/components/landing/LandingUseCases';
import { LandingWorkflow } from '@/components/landing/LandingWorkflow';
import { LandingHero } from './LandingHero';

export const LandingPageView = () => {
  return (
    <div className='min-h-screen'>
      <LandingHero />
      <div className='max-w-6xl mx-auto border border-y-0'>
        <LandingUseCases />
        {/* <LandingFeatures /> */}
        <LandingPlatformFeatures />
        <LandingWorkflow />
        <LandingPricing />
        <LandingFAQ />
        <MarketingCTA />
      </div>
    </div>
  );
};
