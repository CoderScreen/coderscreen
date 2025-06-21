'use client';

import { useLocation, Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  RiDashboardLine,
  RiSettings3Line,
  RiMoneyDollarBoxLine,
} from '@remixicon/react';

const navigation: {
  name: string;
  href: string;
  icon: ReactNode;
  cell?: (key: string) => ReactNode;
}[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <RiDashboardLine className='size-5' />,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: <RiSettings3Line className='size-5' />,
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: <RiMoneyDollarBoxLine className='size-5' />,
  },
];

const SidebarItemClassNames = {
  base: 'w-full flex justify-normal items-center gap-x-2.5 rounded-md px-2 py-2 text-sm font-medium transition hover:bg-muted/70 text-muted-foreground hover:text-primary/70',
  active: 'text-primary/70 bg-muted/70',
};

export default function Sidebar() {
  return (
    <>
      <nav className='bg-gray-100 hidden sm:block sm:relative flex w-64 flex-col overflow-y-auto bg-background border-r transition-transform duration-300'>
        <SidebarBody />
      </nav>
      <MobileSidebar />
    </>
  );
}

const SidebarBody = () => {
  const location = useLocation();

  const isActive = (itemHref: string) => {
    return (
      location.pathname === itemHref || location.pathname.endsWith(itemHref)
    );
  };

  return (
    <aside className='h-full flex flex-col overflow-y-hidden'>
      <div className='p-4 border-b h-20 w-full flex items-center absolute'>
        <div className='font-bold text-lg'>coderscreen</div>
      </div>

      <div className='flex grow flex-col gap-y-2 overflow-y-hidden p-4 mt-20'>
        <nav aria-label='core navigation links'>
          <ul role='list' className='space-y-1'>
            {navigation.map((item) =>
              item.cell ? (
                item.cell(item.name)
              ) : (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      SidebarItemClassNames.base,
                      isActive(item.href) ? SidebarItemClassNames.active : '',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className='mt-auto'>
          <div className='flex items-center gap-x-2.5 px-2 py-2'>
            <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center'>
              <span className='text-sm'>👤</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>User Name</span>
              <span className='text-xs text-muted-foreground'>
                user@example.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const MobileSidebar = () => {
  // Mock sidebar context - replace with actual context
  const isSidebarOpen = false;
  const setIsSidebarOpen = (open: boolean) => {};

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          'fixed sm:hidden inset-0 z-50 bg-black opacity-70 transition-opacity duration-300',
          isSidebarOpen ? '' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeSidebar}
      />
      <nav
        className={cn(
          'fixed sm:hidden inset-y-0 z-50 left-0 w-4/5 bg-background transform transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarBody />
      </nav>
    </>
  );
};
