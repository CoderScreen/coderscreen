'use client';

import { Button } from '@coderscreen/ui/button';
import { RiArrowLeftLine, RiHomeLine, RiSearchLine } from '@remixicon/react';
import Link from 'next/link';
import { HeroBg } from '@/components/landing/HeroBg';
import { siteConfig } from '@/lib/siteConfig';

export default function NotFound() {
  return (
    <div className='relative min-h-[80vh] flex items-center justify-center p-6'>
      <div className='w-full h-full absolute inset-0 rounded-lg overflow-hidden'>
        <HeroBg />
      </div>

      <section className='relative z-10 max-w-4xl mx-auto text-center px-6'>
        {/* 404 Error Code */}
        <div className='mb-8'>
          <h1 className='text-8xl md:text-9xl font-bold text-primary/20 leading-none'>404</h1>
        </div>

        {/* Error Message */}
        <div className='mb-8'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Page Not Found</h2>
          <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            Oops! The page you're looking for seems to have vanished into the digital void. Don't
            worry, even the best developers encounter 404 errors from time to time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'>
          <Link href={siteConfig.home}>
            <Button
              variant='primary'
              className='px-6 py-2 text-base font-semibold flex items-center gap-2'
            >
              <RiHomeLine className='h-4 w-4' />
              Go Home
            </Button>
          </Link>
          <Link href={siteConfig.external.getStarted}>
            <Button
              variant='secondary'
              className='px-6 py-2 text-base font-semibold flex items-center gap-2'
            >
              <RiSearchLine className='h-4 w-4' />
              Get Started
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className='border-t border-border/50 pt-8'>
          <p className='text-sm text-muted-foreground mb-4'>
            Maybe you were looking for one of these?
          </p>
          <div className='flex flex-wrap justify-center gap-4 text-sm'>
            <Link href='#features' className='text-primary hover:text-primary/80 transition-colors'>
              Features
            </Link>
            <Link href='#pricing' className='text-primary hover:text-primary/80 transition-colors'>
              Pricing
            </Link>
            <Link href='#faq' className='text-primary hover:text-primary/80 transition-colors'>
              FAQ
            </Link>
            <a
              href={siteConfig.external.githubRepo}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:text-primary/80 transition-colors'
            >
              GitHub
            </a>
            <a
              href={siteConfig.external.bookDemo}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:text-primary/80 transition-colors'
            >
              Book Demo
            </a>
          </div>
        </div>

        {/* Back Button */}
        <div className='mt-8'>
          <button
            type='button'
            onClick={() => window.history.back()}
            className='text-sm text-muted-foreground hover:text-gray-900 transition-colors flex items-center gap-1 mx-auto'
          >
            <RiArrowLeftLine className='h-4 w-4' />
            Go back
          </button>
        </div>
      </section>
    </div>
  );
}
