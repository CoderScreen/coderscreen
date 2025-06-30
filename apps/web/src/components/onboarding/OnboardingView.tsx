import { useState } from 'react';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';
import { OrgOnboarding } from '@/components/onboarding/OrgOnboarding';
import { useRouter } from '@tanstack/react-router';

export const OnboardingView = () => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<'user' | 'org'>('user');

  const handleUserComplete = () => {
    setCurrentStep('org');
  };

  const handleOrgComplete = () => {
    router.navigate({ to: '/' });
  };

  if (currentStep === 'user') {
    return <UserOnboarding onComplete={handleUserComplete} />;
  }

  return <OrgOnboarding onComplete={handleOrgComplete} />;
};
