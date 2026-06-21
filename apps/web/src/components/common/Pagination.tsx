import { Button } from '@coderscreen/ui/button';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import { cx } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className='flex items-center justify-center gap-1 pt-4'>
      <Button
        variant='ghost'
        className='p-1.5'
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <RiArrowLeftSLine className='size-4' />
      </Button>

      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis markers have no stable id and never reorder
          <span key={`ellipsis-${i}`} className='px-2 text-sm text-gray-400'>
            ...
          </span>
        ) : (
          <button
            type='button'
            key={p}
            onClick={() => onPageChange(p)}
            className={cx(
              'min-w-[32px] h-8 px-2 text-sm rounded font-medium transition-colors',
              p === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {p}
          </button>
        )
      )}

      <Button
        variant='ghost'
        className='p-1.5'
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <RiArrowRightSLine className='size-4' />
      </Button>
    </div>
  );
};
