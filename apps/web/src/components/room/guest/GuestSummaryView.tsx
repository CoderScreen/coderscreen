import React from 'react';
import { usePublicRoom } from '@/query/publicRoom.query';
import { Button } from '@/components/ui/button';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { formatDatetime } from '@/lib/dateUtils';
import { formatSlug } from '@/lib/slug';
import { RiArrowLeftLine, RiCheckLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL;

export function GuestSummaryView() {
  const { publicRoom, isLoading, error } = usePublicRoom();

  if (isLoading) {
    return (
      <div className='w-full px-4'>
        <div className='text-center py-8'>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !publicRoom) {
    return (
      <div className='w-full px-4'>
        <div className='text-center py-8'>
          <p className='text-gray-600'>Interview not found</p>

          <Link to='/'>
            <Button variant='secondary' className='mt-4'>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col justify-center px-4'>
      <div className='max-w-2xl mx-auto text-center py-8'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <RiCheckLine className='text-green-600 size-8' />
        </div>

        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          Thanks for participating in: {publicRoom.title}
        </h1>

        <div className='bg-white rounded-lg border p-6 mb-6'>
          <div className='space-y-3 text-left'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-gray-500'>
                Language:
              </span>
              <div className='flex items-center gap-1'>
                <LanguageIcon language={publicRoom.language} />
                <span className='text-gray-900'>
                  {formatSlug(publicRoom.language)}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-gray-500'>
                Completed:
              </span>
              <p className='text-gray-900'>
                {formatDatetime(publicRoom.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <p className='text-sm text-blue-800'>
            The interview session has been completed. Thank you for your
            participation!
          </p>
        </div>

        <a href={MARKETING_URL}>
          <Button variant='secondary' icon={RiArrowLeftLine}>
            Return to Home
          </Button>
        </a>
      </div>
    </div>
  );
}
