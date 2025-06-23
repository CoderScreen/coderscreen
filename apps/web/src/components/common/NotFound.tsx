import React from 'react';
import { RiHome4Line, RiArrowLeftLine } from '@remixicon/react';
import { cx } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LargeHeader } from '@/components/ui/heading';
import { useRouter } from '@tanstack/react-router';

interface NotFoundProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  className?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  title = 'Page Not Found',
  description = "Sorry, we couldn't find the page you're looking for.",
  showBackButton = true,
  showHomeButton = true,
  className,
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    router.navigate({ to: '/' });
  };

  return (
    <div
      className={cx(
        'min-h-screen h-full w-full flex flex-col items-center justify-center px-4 py-16 text-center',
        className
      )}
    >
      {/* 404 Number */}
      <div className='mb-8'>
        <h1 className='text-8xl font-bold text-gray-300 md:text-9xl'>404</h1>
      </div>

      {/* Content */}
      <div className='mb-8 max-w-md'>
        <LargeHeader className='mb-4 text-gray-900'>{title}</LargeHeader>
        <p className='text-base text-gray-600'>{description}</p>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
        {showBackButton && (
          <Button
            variant='secondary'
            icon={RiArrowLeftLine}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
        )}
        {showHomeButton && (
          <Button variant='primary' icon={RiHome4Line} onClick={handleGoHome}>
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotFound;
