import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LargeHeader } from '@/components/ui/heading';
import {
  RiUserLine,
  RiArrowRightLine,
  RiGoogleFill,
  RiMailCheckLine,
  RiGithubFill,
} from '@remixicon/react';
import { Label } from '@/components/ui/label';
import { Divider } from '@/components/ui/divider';
import { useGithubSignIn, useGoogleSignIn, useSignUp } from '@/query/auth.query';
import { Link, useSearch } from '@tanstack/react-router';

export const RegisterView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const searchQuery = useSearch({ from: '/(auth)/register' });
  const { signInWithGoogle, isLoading: isLoadingGoogle } = useGoogleSignIn();
  const { signInWithGithub, isLoading: isLoadingGithub } = useGithubSignIn();
  const { signUp, isLoading: isLoadingEmail } = useSignUp();

  const handleSignUp = async () => {
    await signUp({ email, password, callbackURL: searchQuery.callbackUrl });
    setIsVerificationSent(true);
  };

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle({ callbackURL: searchQuery.callbackUrl });
  };

  const handleSignInWithGithub = async () => {
    await signInWithGithub({ callbackURL: searchQuery.callbackUrl });
  };

  if (isVerificationSent) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-16'>
        <div className='w-full max-w-md'>
          <Card className='shadow-lg border-gray-200'>
            <CardHeader className='text-center pb-4'>
              <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <RiMailCheckLine className='text-white size-6' />
              </div>
              <LargeHeader className='text-gray-900 mb-2'>Check your email</LargeHeader>
              <p className='text-gray-600'>
                We've sent a verification link to <strong>{email}</strong>
              </p>
            </CardHeader>

            <CardContent className='text-center'>
              <p className='text-sm text-gray-500 mb-4'>
                Click the link in your email to verify your account and complete the signup process.
              </p>
              <p className='text-xs text-gray-400'>
                Didn't receive the email? Check your spam folder or contact support.
              </p>
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
            <div className='w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4'>
              <RiUserLine className='text-white size-6' />
            </div>
            <LargeHeader className='text-gray-900 mb-2'>Create account</LargeHeader>
            <p className='text-gray-600'>Sign up to get started with your account</p>
          </CardHeader>

          <CardContent>
            <div className='space-y-2'>
              {/* Google Sign In */}
              <Button
                variant='secondary'
                className='w-full'
                onClick={handleSignInWithGoogle}
                isLoading={isLoadingGoogle}
                icon={RiGoogleFill}
              >
                Sign up with Google
              </Button>

              <Button
                variant='secondary'
                className='w-full'
                onClick={handleSignInWithGithub}
                isLoading={isLoadingGithub}
                icon={RiGithubFill}
              >
                Sign up with Github
              </Button>
            </div>

            <Divider />

            <div className='space-y-4'>
              {/* Email Field */}
              <div className='space-y-2'>
                <Label htmlFor='email'>Email address</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Sign Up Button */}
              <Button
                className='w-full'
                isLoading={isLoadingEmail}
                icon={RiArrowRightLine}
                iconPosition='right'
                onClick={handleSignUp}
              >
                Sign Up
              </Button>

              {/* Sign In Link */}
              <div className='text-center pt-2'>
                <p className='text-sm text-gray-600'>
                  Already have an account?{' '}
                  <Link
                    to='/login'
                    className='text-primary hover:text-primary/80 font-medium transition-colors'
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
