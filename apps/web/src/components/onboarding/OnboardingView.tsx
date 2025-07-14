import { useState } from 'react';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';
import { OrgOnboarding } from '@/components/onboarding/OrgOnboarding';
import { useRouter } from '@tanstack/react-router';

export const OnboardingView = () => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<'user' | 'org'>('user');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showUser, setShowUser] = useState(true);
  const [showOrg, setShowOrg] = useState(false);

  const handleUserComplete = () => {
    setIsTransitioning(true);
    setShowUser(false);

    // Wait for fade out animation to complete
    setTimeout(() => {
      setCurrentStep('org');
      setShowOrg(true);
      setIsTransitioning(false);
    }, 300); // Match the CSS transition duration
  };

  const handleOrgComplete = () => {
    router.navigate({ to: '/' });
  };

  return (
    <div className='min-h-screen relative'>
      {/* User Onboarding */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          showUser && currentStep === 'user' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <UserOnboarding onComplete={handleUserComplete} />
      </div>

      {/* Organization Onboarding */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          showOrg && currentStep === 'org' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <OrgOnboarding onComplete={handleOrgComplete} />
      </div>
    </div>
  );
};
