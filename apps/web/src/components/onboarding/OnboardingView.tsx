import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { OrgOnboarding } from '@/components/onboarding/OrgOnboarding';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';
import { cx } from '@/lib/utils';

export const OnboardingView = () => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<'user' | 'org'>('user');

  const handleUserComplete = () => {
    setCurrentStep('org');
  };

  const handleOrgComplete = () => {
    router.navigate({ to: '/' });
  };

  return (
    <div className='min-h-screen relative'>
      {/* User Onboarding */}
      <div
        className={cx(
          'absolute inset-0 transition-opacity duration-300 ease-in-out',
          currentStep === 'user' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <UserOnboarding onComplete={handleUserComplete} />
      </div>

      {/* Organization Onboarding */}
      <div
        className={cx(
          'absolute inset-0 transition-opacity duration-300 ease-in-out',
          currentStep === 'org' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <OrgOnboarding onComplete={handleOrgComplete} />
      </div>
    </div>
  );
};
