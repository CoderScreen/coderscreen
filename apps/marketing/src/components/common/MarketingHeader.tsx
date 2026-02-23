'use client';

import { Button } from '@coderscreen/ui/button';
import { RiCloseLine, RiGithubLine, RiMenuLine } from '@remixicon/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/common/Logo';
import { siteConfig } from '@/lib/siteConfig';

export const MarketingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className={
        isHome
          ? 'bg-primary border-b border-white/50'
          : 'bg-white/95 backdrop-blur-sm border-b border-border/50'
      }
    >
      <div className='max-w-6xl mx-auto px-2'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href={siteConfig.home} className='flex-shrink-0 flex items-center'>
              <Logo className={`w-6 h-6 mr-1 ${isHome ? 'text-white' : 'text-primary'}`} />
              <span className={`text-xl font-bold ${isHome ? 'text-white' : 'text-gray-900'}`}>
                CoderScreen
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex space-x-8'>
            <button
              onClick={() => scrollToSection('use-cases')}
              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                isHome ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              type='button'
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                isHome ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              type='button'
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                isHome ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              type='button'
            >
              Pricing
            </button>
            <Link
              href='/blog'
              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                isHome ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Blog
            </Link>
            <button
              onClick={() => scrollToSection('faq')}
              className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                isHome ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              type='button'
            >
              FAQ
            </button>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className='hidden md:flex items-center space-x-4'>
            <a href={siteConfig.external.githubRepo} target='_blank' rel='noopener noreferrer'>
              <Button
                variant='ghost'
                className={`flex items-center gap-2 ${isHome ? 'text-white/80 hover:text-white hover:bg-white/10' : ''}`}
              >
                <RiGithubLine className='h-4 w-4' aria-hidden='true' />
                GitHub
              </Button>
            </a>

            <a href={siteConfig.external.getStarted}>
              <Button
                variant={isHome ? 'secondary' : 'primary'}
                className={isHome ? 'border-transparent' : ''}
              >
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <Button
              variant='ghost'
              onClick={toggleMenu}
              className={`p-2 ${isHome ? 'text-white hover:bg-white/10' : ''}`}
              aria-expanded={isMenuOpen}
              aria-controls='mobile-menu'
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? (
                <RiCloseLine className='h-5 w-5' aria-hidden='true' />
              ) : (
                <RiMenuLine className='h-5 w-5' aria-hidden='true' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav id='mobile-menu' className='md:hidden' aria-label='Mobile navigation'>
            <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 rounded-b-lg'>
              <button
                onClick={() => scrollToSection('features')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
                type='button'
              >
                Solutions
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
                type='button'
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('workflow')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
                type='button'
              >
                Process
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
                type='button'
              >
                Pricing
              </button>
              <Link
                href='/blog'
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
              >
                Blog
              </Link>
              <button
                onClick={() => scrollToSection('faq')}
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left'
                type='button'
              >
                FAQ
              </button>
              <div className='pt-4 pb-3 border-t border-gray-200'>
                <div className='flex flex-col space-y-2'>
                  <Button variant='ghost' className='justify-start flex items-center gap-2'>
                    <RiGithubLine className='h-4 w-4' aria-hidden='true' />
                    GitHub
                  </Button>
                  <Button className='justify-start'>Get Started</Button>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
