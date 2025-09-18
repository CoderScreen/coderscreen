'use client';

import { RiGithubLine, RiLinkedinBoxLine, RiTwitterXLine } from '@remixicon/react';
import React from 'react';
import { Logo } from '@/components/common/Logo';
import { siteConfig } from '@/lib/siteConfig';

export const MarketingFooter: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className='bg-white text-gray-700 border-t border-border/50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-8'>
          {/* Company Info */}
          <div className='col-span-1 md:col-span-3'>
            <div className='flex items-center mb-4'>
              <Logo className='w-6 h-6 text-primary mr-1' />
              <h3 className='text-xl font-bold text-gray-900'>CoderScreen</h3>
            </div>
            <p className='text-gray-600 mb-4 max-w-md'>
              The ultimate platform for technical interviews. Conduct real-time coding interviews,
              collaborate with candidates, and make better hiring decisions.
            </p>
            <div className='flex space-x-4'>
              <a
                href={siteConfig.external.x}
                className='text-gray-500 hover:text-gray-700 transition-colors'
              >
                <span className='sr-only'>Twitter</span>
                <RiTwitterXLine />
              </a>
              <a
                href={siteConfig.external.linkedin}
                className='text-gray-500 hover:text-gray-700 transition-colors'
              >
                <span className='sr-only'>LinkedIn</span>
                <RiLinkedinBoxLine />
              </a>
              <a
                href={siteConfig.external.githubRepo}
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-500 hover:text-gray-700 transition-colors'
              >
                <span className='sr-only'>GitHub</span>
                <RiGithubLine />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className='text-lg font-semibold mb-4 text-gray-900'>Product</h4>
            <ul className='space-y-2'>
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className='text-gray-600 hover:text-gray-900 transition-colors text-left w-full'
                  type='button'
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className='text-gray-600 hover:text-gray-900 transition-colors text-left w-full'
                  type='button'
                >
                  Pricing
                </button>
              </li>
              <li>
                <a
                  href={siteConfig.external.getStarted}
                  className='text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'
                >
                  Get Started
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.external.bookDemo}
                  className='text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'
                >
                  Book Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Comparison Links */}
          <div>
            <h4 className='text-lg font-semibold mb-4 text-gray-900'>Alternatives</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='/coderpad-alternative'
                  className='text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'
                >
                  vs CoderPad
                </a>
              </li>
              <li>
                <a
                  href='/hackerrank-alternative'
                  className='text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'
                >
                  vs HackerRank
                </a>
              </li>
              <li>
                <a
                  href='/codesignal-alternative'
                  className='text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'
                >
                  vs CodeSignal
                </a>
              </li>
              <li>
                <a
                  href='/coderbyte-alternative'
                  className='text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'
                >
                  vs Coderbyte
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
