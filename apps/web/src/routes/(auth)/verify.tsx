import { useEffect, useState } from 'react';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LargeHeader } from '@/components/ui/heading';
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiArrowRightLine,
} from '@remixicon/react';
import { useVerifyEmail } from '@/query/auth.query';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/verify')({
  component: RouteComponent,
});

function RouteComponent() {
  const search = useSearch({ from: '/(auth)/verify' });
  const token = (search as any).token;

  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const { verifyEmail, isLoading } = useVerifyEmail();

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('No verification token provided');
      return;
    }

    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setVerificationStatus('success');
      } catch (error) {
        setVerificationStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to verify email'
        );
      }
    };

    handleVerification();
  }, [token, verifyEmail]);

  if (verificationStatus === 'loading' || isLoading) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-16'>
        <div className='w-full max-w-md'>
          <Card className='shadow-lg border-gray-200'>
            <CardHeader className='text-center pb-4'>
              <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse'>
                <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              </div>
              <LargeHeader className='text-gray-900 mb-2'>
                Verifying your email
              </LargeHeader>
              <p className='text-gray-600'>
                Please wait while we verify your email address...
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-16'>
        <div className='w-full max-w-md'>
          <Card className='shadow-lg border-gray-200'>
            <CardHeader className='text-center pb-4'>
              <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <RiCheckLine className='text-white size-6' />
              </div>
              <LargeHeader className='text-gray-900 mb-2'>
                Email verified!
              </LargeHeader>
              <p className='text-gray-600'>
                Your email has been successfully verified
              </p>
            </CardHeader>

            <CardContent className='text-center'>
              <p className='text-sm text-gray-500 mb-6'>
                You can now sign in to your account and start using the
                platform.
              </p>
              <Button
                asChild
                className='w-full'
                icon={RiArrowRightLine}
                iconPosition='right'
              >
                <Link to='/login'>Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-16'>
      <div className='w-full max-w-md'>
        <Card className='shadow-lg border-gray-200'>
          <CardHeader className='text-center pb-4'>
            <div className='w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <RiErrorWarningLine className='text-white size-6' />
            </div>
            <LargeHeader className='text-gray-900 mb-2'>
              Verification failed
            </LargeHeader>
            <p className='text-gray-600'>
              We couldn't verify your email address
            </p>
          </CardHeader>

          <CardContent className='text-center'>
            <p className='text-sm text-gray-500 mb-4'>
              {errorMessage ||
                'The verification link may be invalid or expired.'}
            </p>
            <p className='text-xs text-gray-400 mb-6'>
              Please try signing up again or contact support if the problem
              persists.
            </p>
            <Button asChild variant='secondary' className='w-full'>
              <Link to='/register'>Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
