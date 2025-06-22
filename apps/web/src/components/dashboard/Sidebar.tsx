'use client';

import { useLocation, Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { cn, cx, focusRing } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MutedText } from '@/components/ui/typography';
import {
  RiDashboardLine,
  RiSettings3Line,
  RiMoneyDollarBoxLine,
  RiCodeBoxLine,
  RiQuestionLine,
  RiLogoutBoxRLine,
  RiBuildingLine,
  RiFeedbackLine,
  RiQuestionAnswerLine,
  RiMenuLine,
  RiCloseLine,
  RiHome3Line,
  RiPlayListLine,
  RiMusic2Line,
  RiTerminalWindowFill,
  RiMenuFoldLine,
} from '@remixicon/react';
import { siteConfig } from '@/lib/siteConfig';

// Navigation configuration
const MAIN_NAVIGATION: {
  titleKey: string;
  href: string;
  icon: ReactNode;
}[] = [
  {
    titleKey: 'Dashboard',
    href: siteConfig.routes.dashboard,
    icon: <RiHome3Line className='h-5 w-5 shrink-0' />,
  },
  {
    titleKey: 'Rooms',
    href: siteConfig.routes.rooms,
    icon: <RiBuildingLine className='h-5 w-5 shrink-0' />,
  },
];

const ACCOUNT_NAVIGATION: {
  titleKey: string;
  href: string;
  icon: ReactNode;
}[] = [
  {
    titleKey: 'Settings',
    href: siteConfig.routes.settings,
    icon: <RiSettings3Line className='h-5 w-5 shrink-0' />,
  },
];

// Styling constants
const SidebarItemClassNames = {
  base: 'group flex items-center gap-x-2 rounded px-2 py-1.5 text-sm transition-all duration-200 hover:bg-muted/5',
  active: 'bg-white text-foreground border border-muted-foreground/20',
  inactive: 'text-muted-foreground hover:text-gray-900',
  icon: 'shrink-0 transition-colors duration-200 p-1 flex items-center justify-center',
  activeIcon: 'text-primary',
  inactiveIcon: 'text-gray-400 group-hover:text-gray-600',
};

const SectionHeaderClassNames =
  'px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2';

// Mock user data - replace with actual user data
const mockUser = {
  email: 'user@example.com',
  balance: 1000,
};

export default function Sidebar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <>
      <nav className='hidden lg:block w-64 border-r border-gray-200 bg-white'>
        <SidebarBody />
      </nav>
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
    </>
  );
}

const SidebarBody = () => {
  const location = useLocation();

  const isActive = (itemHref: string) => {
    if (itemHref === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(itemHref);
  };

  const renderNavItem = (item: {
    titleKey: string;
    href: string;
    icon: ReactNode;
  }) => {
    const active = isActive(item.href);

    return (
      <li key={item.href}>
        <Link
          to={item.href}
          className={cx(
            SidebarItemClassNames.base,
            active
              ? SidebarItemClassNames.active
              : SidebarItemClassNames.inactive,
            focusRing
          )}
        >
          <div
            className={cx(
              SidebarItemClassNames.icon,
              active
                ? SidebarItemClassNames.activeIcon
                : SidebarItemClassNames.inactiveIcon
            )}
            aria-hidden='true'
          >
            {item.icon}
          </div>
          <span className='truncate'>{item.titleKey}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className='flex flex-col h-full bg-muted'>
      {/* Header */}
      <div className='flex items-center justify-between p-4'>
        <Link to='/' className='flex items-center flex-shrink-0'>
          <div className='w-6 h-6 bg-primary rounded flex items-center justify-center mr-1'>
            <RiCodeBoxLine className='text-white size-4' />
          </div>
        </Link>

        <div>
          <Button variant='icon'>
            <RiMenuFoldLine className='size-4 text-muted-foreground' />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-4 space-y-8 overflow-y-auto'>
        <div>
          <ul className='mt-2 space-y-1'>
            {MAIN_NAVIGATION.map(renderNavItem)}
          </ul>
        </div>

        <div>
          <h2 className={SectionHeaderClassNames}>Account</h2>
          <ul className='mt-2 space-y-1'>
            {ACCOUNT_NAVIGATION.map(renderNavItem)}
          </ul>
        </div>

        <div className='mt-auto'>
          <h2 className={SectionHeaderClassNames}>Support</h2>
          <div className='mt-2 space-y-1'>
            <Button
              className={cx(
                SidebarItemClassNames.base,
                SidebarItemClassNames.inactive,
                'w-full justify-start',
                focusRing
              )}
              variant='ghost'
            >
              <RiFeedbackLine
                className={cx(
                  SidebarItemClassNames.icon,
                  SidebarItemClassNames.inactiveIcon
                )}
                aria-hidden='true'
              />
              <span className='truncate'>Feedback</span>
            </Button>

            <Button
              className={cx(
                SidebarItemClassNames.base,
                SidebarItemClassNames.inactive,
                'w-full justify-start',
                focusRing
              )}
              variant='ghost'
            >
              <RiQuestionAnswerLine
                className={cx(
                  SidebarItemClassNames.icon,
                  SidebarItemClassNames.inactiveIcon
                )}
                aria-hidden='true'
              />
              <span className='truncate'>Support</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* User Info */}
      <div className='px-4 pt-4'>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Link to='/'>
              <div className='flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border'>
                <span className='text-white text-sm font-medium'>
                  {mockUser.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </Link>
            <div className='flex-1 min-w-0'>
              <Link to='/'>
                <p className='text-sm font-medium text-gray-900 cursor-pointer truncate'>
                  {mockUser.email}
                </p>
              </Link>
              <Link to='/'>
                <MutedText className='text-xs cursor-pointer'>
                  {mockUser.balance} credits
                </MutedText>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MobileSidebarTitleProps {
  title: string;
  subtitle: string;
  onOpenSidebar: () => void;
}

export const MobileSidebarTitle = ({
  title,
  subtitle,
  onOpenSidebar,
}: MobileSidebarTitleProps) => {
  return (
    <div className='flex items-center justify-between pb-4 bg-white lg:hidden'>
      <div className='flex-1'>
        <h1 className='text-lg font-semibold text-gray-900'>{title}</h1>
        <p className='text-sm text-gray-500'>{subtitle}</p>
      </div>
      <Button
        variant='ghost'
        onClick={onOpenSidebar}
        className={cx('p-2 hover:bg-gray-100', focusRing)}
      >
        <RiMenuLine className='h-5 w-5' />
        <span className='sr-only'>Open sidebar</span>
      </Button>
    </div>
  );
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const location = useLocation();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isActive = (itemHref: string) => {
    if (itemHref === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(itemHref);
  };

  const renderNavItem = (item: {
    titleKey: string;
    href: string;
    icon: ReactNode;
  }) => {
    const active = isActive(item.href);

    return (
      <li key={item.href}>
        <Link
          to={item.href}
          className={cx(
            SidebarItemClassNames.base,
            active
              ? SidebarItemClassNames.active
              : SidebarItemClassNames.inactive,
            focusRing
          )}
          onClick={onClose}
        >
          <div
            className={cx(
              SidebarItemClassNames.icon,
              active
                ? SidebarItemClassNames.activeIcon
                : SidebarItemClassNames.inactiveIcon
            )}
            aria-hidden='true'
          >
            {item.icon}
          </div>
          <span className='truncate'>{item.titleKey}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className='lg:hidden'>
      {/* Overlay */}
      <div
        className={cx(
          'fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-in-out',
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cx(
          'fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4'>
            <Link to='/' className='flex items-center flex-shrink-0'>
              <div className='w-8 h-8 bg-primary rounded flex items-center justify-center mr-2'>
                <RiCodeBoxLine className='text-white size-5' />
              </div>
              <h1 className='text-xl font-semibold text-gray-900'>
                CoderScreen
              </h1>
            </Link>
            <Button
              variant='ghost'
              onClick={onClose}
              className={cx('p-2 hover:bg-gray-100', focusRing)}
            >
              <RiCloseLine className='h-5 w-5' />
              <span className='sr-only'>Close sidebar</span>
            </Button>
          </div>

          {/* Navigation */}
          <nav className='flex-1 px-4 space-y-8 overflow-y-auto'>
            <div>
              <ul className='mt-2 space-y-1'>
                {MAIN_NAVIGATION.map(renderNavItem)}
              </ul>
            </div>

            <div>
              <h2 className={SectionHeaderClassNames}>Account</h2>
              <ul className='mt-2 space-y-1'>
                {ACCOUNT_NAVIGATION.map(renderNavItem)}
              </ul>
            </div>

            <div className='mt-auto'>
              <h2 className={SectionHeaderClassNames}>Support</h2>
              <div className='mt-2 space-y-1'>
                <Button
                  className={cx(
                    SidebarItemClassNames.base,
                    SidebarItemClassNames.inactive,
                    'w-full justify-start',
                    focusRing
                  )}
                  variant='ghost'
                >
                  <RiFeedbackLine
                    className={cx(
                      SidebarItemClassNames.icon,
                      SidebarItemClassNames.inactiveIcon
                    )}
                    aria-hidden='true'
                  />
                  <span className='truncate'>Feedback</span>
                </Button>

                <Button
                  className={cx(
                    SidebarItemClassNames.base,
                    SidebarItemClassNames.inactive,
                    'w-full justify-start',
                    focusRing
                  )}
                  variant='ghost'
                >
                  <RiQuestionAnswerLine
                    className={cx(
                      SidebarItemClassNames.icon,
                      SidebarItemClassNames.inactiveIcon
                    )}
                    aria-hidden='true'
                  />
                  <span className='truncate'>Support</span>
                </Button>
              </div>
            </div>
          </nav>

          {/* User Info */}
          <div className='px-4 py-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <Link to='/' onClick={onClose}>
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border'>
                    <span className='text-white text-sm font-medium'>
                      {mockUser.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
                <div className='flex-1 min-w-0'>
                  <Link to='/' onClick={onClose}>
                    <p className='text-sm font-medium text-gray-900 cursor-pointer truncate'>
                      {mockUser.email}
                    </p>
                  </Link>
                  <Link to='/' onClick={onClose}>
                    <MutedText className='text-xs cursor-pointer'>
                      {mockUser.balance} credits
                    </MutedText>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PageWithMobileSidebarProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const PageWithMobileSidebar = ({
  title,
  subtitle,
  children,
}: PageWithMobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = () => {
    setIsOpen(true);
  };
  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <MobileSidebarTitle
        title={title}
        subtitle={subtitle}
        onOpenSidebar={openSidebar}
      />
      <MobileSidebar isOpen={isOpen} onClose={closeSidebar} />
      {children}
    </>
  );
};
