'use client';

import { useLocation, Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { cx, focusRing } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MutedText } from '@/components/ui/typography';
import {
  RiSettings3Line,
  RiCodeBoxLine,
  RiFeedbackLine,
  RiQuestionAnswerLine,
  RiMenuLine,
  RiCloseLine,
  RiTerminalWindowFill,
  RiFileCodeLine,
} from '@remixicon/react';
import { siteConfig } from '@/lib/siteConfig';
import { useSession } from '@/query/auth.query';
import { useSidebar } from '@/contexts/SidebarContext';
import { SidebarProfile } from '@/components/common/SidebarProfile';
import { OrgSwitcher } from '@/components/common/OrgSwitcher';

// Navigation configuration
const MAIN_NAVIGATION: {
  titleKey: string;
  href: string;
  icon: ReactNode;
}[] = [
  {
    titleKey: 'Interviews',
    href: siteConfig.routes.dashboard,
    icon: <RiTerminalWindowFill className='h-5 w-5 shrink-0' />,
  },
  {
    titleKey: 'Templates',
    href: siteConfig.routes.rooms,
    icon: <RiFileCodeLine className='h-5 w-5 shrink-0' />,
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
  base: 'group flex items-center gap-x-2 rounded px-2 py-1.5 text-sm transition-all duration-200 hover:bg-muted/5 border border-transparent',
  active:
    'bg-white hover:bg-white text-foreground border border-muted-foreground/20',
  inactive: 'text-muted-foreground hover:text-gray-900',
  icon: 'shrink-0 transition-colors duration-200 p-1 flex items-center justify-center',
  activeIcon: 'text-primary',
  inactiveIcon: 'text-gray-400 group-hover:text-gray-600',
};

const SectionHeaderClassNames =
  'px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2';

export default function Sidebar() {
  const { isCollapsed, isMobileSidebarOpen, closeMobileSidebar } = useSidebar();

  return (
    <>
      <nav
        className={cx(
          'hidden lg:block border-r border-gray-200 bg-white transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarBody />
      </nav>
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      />
    </>
  );
}

const SidebarBody = () => {
  const location = useLocation();

  const { isCollapsed } = useSidebar();

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
            focusRing,
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? item.titleKey : undefined}
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
          {!isCollapsed && <span className='truncate'>{item.titleKey}</span>}
        </Link>
      </li>
    );
  };

  return (
    <div className='flex flex-col h-full bg-muted'>
      <OrgSwitcher />

      {/* Navigation */}
      <nav className='flex-1 px-4 space-y-6 overflow-y-auto'>
        <div>
          <ul className='space-y-1'>{MAIN_NAVIGATION.map(renderNavItem)}</ul>
        </div>

        <div>
          {!isCollapsed && <h2 className={SectionHeaderClassNames}>Account</h2>}
          <ul className='space-y-1'>{ACCOUNT_NAVIGATION.map(renderNavItem)}</ul>
        </div>

        <div className='mt-auto'>
          {!isCollapsed && <h2 className={SectionHeaderClassNames}>Support</h2>}
          <div className='space-y-1'>
            <Button
              className={cx(
                SidebarItemClassNames.base,
                SidebarItemClassNames.inactive,
                'w-full justify-start',
                focusRing,
                isCollapsed && 'justify-center px-2'
              )}
              variant='ghost'
              title={isCollapsed ? 'Feedback' : undefined}
            >
              <RiFeedbackLine
                className={cx(
                  SidebarItemClassNames.icon,
                  SidebarItemClassNames.inactiveIcon
                )}
                aria-hidden='true'
              />
              {!isCollapsed && <span className='truncate'>Feedback</span>}
            </Button>

            <Button
              className={cx(
                SidebarItemClassNames.base,
                SidebarItemClassNames.inactive,
                'w-full justify-start',
                focusRing,
                isCollapsed && 'justify-center px-2'
              )}
              variant='ghost'
              title={isCollapsed ? 'Support' : undefined}
            >
              <RiQuestionAnswerLine
                className={cx(
                  SidebarItemClassNames.icon,
                  SidebarItemClassNames.inactiveIcon
                )}
                aria-hidden='true'
              />
              {!isCollapsed && <span className='truncate'>Support</span>}
            </Button>
          </div>
        </div>
      </nav>

      {/* User Info */}
      <div className='p-2'>
        <SidebarProfile />
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
  const { user, isLoading } = useSession();

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
          <div className='flex items-center justify-between p-4 border-b border-gray-200'>
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

          {/* Organization Switcher */}
          <OrgSwitcher />

          {/* Navigation */}
          <nav className='flex-1 px-4 space-y-6 overflow-y-auto'>
            <div>
              <ul className='space-y-1'>
                {MAIN_NAVIGATION.map(renderNavItem)}
              </ul>
            </div>

            <div>
              <h2 className={SectionHeaderClassNames}>Account</h2>
              <ul className='space-y-1'>
                {ACCOUNT_NAVIGATION.map(renderNavItem)}
              </ul>
            </div>

            <div className='mt-auto'>
              <h2 className={SectionHeaderClassNames}>Support</h2>
              <div className='space-y-1'>
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

          <div className='p-4'>
            <div className='space-y-3'>
              {isLoading ? (
                <div className='flex items-center gap-3'>
                  <Skeleton className='w-8 h-8 rounded-full' />
                  <div className='flex-1 space-y-1'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                </div>
              ) : user ? (
                <div className='flex items-center gap-3'>
                  <Link to='/' onClick={onClose}>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border'>
                      <span className='text-white text-sm font-medium'>
                        {user.email?.charAt(0).toUpperCase() ||
                          user.name?.charAt(0).toUpperCase() ||
                          'U'}
                      </span>
                    </div>
                  </Link>
                  <div className='flex-1 min-w-0'>
                    <Link to='/' onClick={onClose}>
                      <p className='text-sm font-medium text-gray-900 cursor-pointer truncate'>
                        {user.email || user.name || 'User'}
                      </p>
                    </Link>
                    <Link to='/' onClick={onClose}>
                      <MutedText className='text-xs cursor-pointer'>
                        {user.email ? 'Signed in' : 'Guest user'}
                      </MutedText>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-3'>
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border'>
                    <span className='text-gray-500 text-sm font-medium'>?</span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-500 truncate'>
                      Not signed in
                    </p>
                    <MutedText className='text-xs'>
                      Sign in to continue
                    </MutedText>
                  </div>
                </div>
              )}
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
  const { openMobileSidebar } = useSidebar();

  return (
    <>
      <MobileSidebarTitle
        title={title}
        subtitle={subtitle}
        onOpenSidebar={openMobileSidebar}
      />
      {children}
    </>
  );
};
