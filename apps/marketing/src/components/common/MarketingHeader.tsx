'use client';

import { useState } from 'react';
import { Button } from '@coderscreen/ui/button';
import { RiCloseLine, RiMenuLine, RiGithubLine } from '@remixicon/react';
import { Logo } from '@/components/common/Logo';
import { siteConfig } from '@/lib/siteConfig';
import Link from 'next/link';

export const MarketingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className='bg-white/95 backdrop-blur-sm border-b border-border/50'>
      <div className='max-w-6xl mx-auto px-2'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href={siteConfig.home} className='flex-shrink-0 flex items-center'>
              <Logo className='w-6 h-6 text-primary mr-1' />
              <h1 className='text-xl font-bold text-gray-900'>CoderScreen</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex space-x-8'>
            <button
              onClick={() => scrollToSection('use-cases')}
              className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors cursor-pointer'
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors cursor-pointer'
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors cursor-pointer'
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors cursor-pointer'
            >
              FAQ
            </button>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className='hidden md:flex items-center space-x-4'>
            <a href={siteConfig.external.githubRepo} target='_blank' rel='noopener noreferrer'>
              <Button variant='ghost' className='flex items-center gap-2'>
                <RiGithubLine className='h-4 w-4' />
                GitHub
                {/* <span className='ml-1 flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full'>
                <RiStarLine className='h-3 w-3' />
                {stars.toLocaleString()}
              </span> */}
              </Button>
            </a>

            <a href={siteConfig.external.getStarted}>
              <Button variant='primary'>Get Started</Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <Button variant='ghost' onClick={toggleMenu} className='p-2'>
              {isMenuOpen ? (
                <RiCloseLine className='h-5 w-5' />
              ) : (
                <RiMenuLine className='h-5 w-5' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200'>
              <button
                onClick={() => scrollToSection('features')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
              >
                Solutions
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('workflow')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
              >
                Process
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
              >
                FAQ
              </button>
              <div className='pt-4 pb-3 border-t border-gray-200'>
                <div className='flex flex-col space-y-2'>
                  <Button variant='ghost' className='justify-start flex items-center gap-2'>
                    <RiGithubLine className='h-4 w-4' />
                    GitHub
                    {/* <span className='ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full'>
                      {stars.toLocaleString()}
                    </span> */}
                  </Button>
                  <Button className='justify-start'>Get Started</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
