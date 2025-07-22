'use client';

import { useState } from 'react';
import { Button } from '@coderscreen/ui/button';
import { RiCloseLine, RiMenuLine } from '@remixicon/react';
import { Logo } from '@/components/common/Logo';

export const MarketingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className='bg-white/95 backdrop-blur-sm border-b border-border/50'>
      <div className='max-w-6xl mx-auto px-2'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <div className='flex-shrink-0 flex items-center'>
              <Logo className='w-10 h-10 text-black' />
              <h1 className='text-xl font-bold text-gray-900'>CoderScreen</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex space-x-8'>
            <a
              href='#features'
              className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors'
            >
              Features
            </a>
            <a
              href='#pricing'
              className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors'
            >
              Pricing
            </a>
            <a
              href='#about'
              className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors'
            >
              About
            </a>
            <a
              href='#contact'
              className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors'
            >
              Contact
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className='hidden md:flex items-center space-x-4'>
            <Button variant='ghost'>Sign In</Button>
            <Button>Get Started</Button>
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
              <a
                href='#features'
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href='#pricing'
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href='#about'
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href='#contact'
                className='text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <div className='pt-4 pb-3 border-t border-gray-200'>
                <div className='flex flex-col space-y-2'>
                  <Button variant='ghost' className='justify-start'>
                    Sign In
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
