import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LargeHeader } from '@/components/ui/heading';
import { RiMailLine, RiArrowRightLine, RiGoogleFill, RiGithubFill } from '@remixicon/react';
import { Label } from '@/components/ui/label';
import { Divider } from '@/components/ui/divider';
import { useGoogleSignIn, useGithubSignIn, useSignIn } from '@/query/auth.query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { CustomComponent } from '@coderscreen/ui/custom';

export const SignInView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const searchQuery = useSearch({ from: '/(auth)/login' });

  const { signInWithGoogle, isLoading: isLoadingGoogle } = useGoogleSignIn();
  const { signInWithGithub, isLoading: isLoadingGithub } = useGithubSignIn();
  const { signIn, isLoading: isLoadingEmail } = useSignIn();

  const handleSignIn = async () => {
    await signIn({ email, password, callbackURL: searchQuery.callbackUrl });
    navigate({ to: searchQuery.callbackUrl ?? '/' });
  };

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle({ callbackURL: searchQuery.callbackUrl });
  };

  const handleSignInWithGithub = async () => {
    await signInWithGithub({ callbackURL: searchQuery.callbackUrl });
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-16'>
      <div className='w-full max-w-md'>
        <Card className='shadow-lg border-gray-200 relative'>
          <CardHeader className='text-center pb-4'>
            <CustomComponent>12312</CustomComponent>

            <div className='w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4'>
              <RiMailLine className='text-white size-6' />
            </div>
            <LargeHeader className='text-gray-900 mb-2'>Welcome back</LargeHeader>
            <p className='text-gray-600'>Sign in to your account to continue</p>
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
                Sign in with Google
              </Button>

              <Button
                variant='secondary'
                className='w-full'
                onClick={handleSignInWithGithub}
                isLoading={isLoadingGithub}
                icon={RiGithubFill}
              >
                Sign in with Github
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

              {/* Sign In Button */}
              <Button
                className='w-full'
                isLoading={isLoadingEmail}
                icon={RiArrowRightLine}
                iconPosition='right'
                onClick={handleSignIn}
              >
                Sign In
              </Button>

              {/* Sign Up Link */}
              <div className='text-center pt-2'>
                <p className='text-sm text-gray-600'>
                  Don't have an account?{' '}
                  <Link
                    to='/register'
                    search={{ callbackUrl: searchQuery.callbackUrl }}
                    className='text-primary hover:text-primary/80 font-medium transition-colors'
                  >
                    Sign up
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
