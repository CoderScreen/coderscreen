import { useMemo } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  RiSearchLine,
  RiFilter3Line,
  RiCloseLine,
  RiCodeBoxLine,
  RiCalendarLine,
  RiArrowUpDownLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCodeSSlashFill,
  RiArrowDownLine,
} from '@remixicon/react';
import { RoomSchema } from '@coderscreen/api/schema/room';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuTrigger,
  DropdownMenuSubMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown';
import { cx } from '@/lib/utils';

export interface RoomFilters {
  search: string;
  language: string;
  dateRange: '*' | 'today' | 'week' | 'month';
  status: '*' | 'active' | 'completed';
  sortField: 'createdAt' | 'language' | 'status';
  sortDirection: 'asc' | 'desc';
}

interface RoomFiltersProps {
  filters: RoomFilters;
  onFiltersChange: (filters: RoomFilters) => void;
}

const LANGUAGE_OPTIONS = [
  // { value: '*', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
];

const DATE_RANGE_OPTIONS = [
  // { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const STATUS_OPTIONS = [
  // { value: '*', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export function RoomFilters({ filters, onFiltersChange }: RoomFiltersProps) {
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.language !== '*' ||
      filters.dateRange !== '*' ||
      filters.status !== '*'
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.language !== '*') count++;
    if (filters.dateRange !== '*') count++;
    if (filters.status !== '*') count++;
    return count;
  }, [filters]);

  const handleFilterChange = (key: keyof RoomFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleSortChange = (sortField: RoomFilters['sortField']) => {
    const currentSortField = filters.sortField;
    const currentSortDirection = filters.sortDirection;

    if (currentSortField === sortField) {
      onFiltersChange({
        ...filters,
        sortDirection: currentSortDirection === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onFiltersChange({
        ...filters,
        sortField,
        sortDirection: 'asc',
      });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({
      ...filters,
      search: '',
      language: '*',
      dateRange: '*',
      status: '*',
      sortField: 'createdAt',
      sortDirection: 'desc',
    });
  };

  const getLanguageLabel = (value: string) => {
    return (
      LANGUAGE_OPTIONS.find((option) => option.value === value)?.label ||
      'All Languages'
    );
  };

  const getDateRangeLabel = (value: string) => {
    return (
      DATE_RANGE_OPTIONS.find((option) => option.value === value)?.label ||
      'All Time'
    );
  };

  const getStatusLabel = (value: string) => {
    return (
      STATUS_OPTIONS.find((option) => option.value === value)?.label ||
      'All Status'
    );
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        {/* Search Input - Primary */}
        <div>
          <Input
            placeholder='Search rooms by ID...'
            type='search'
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className='flex items-center gap-2'>
          {/* Advanced Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='secondary' className='flex items-center gap-2'>
                <RiFilter3Line className='size-4' />
                Filters
                <Badge
                  variant='neutral'
                  className={cx(
                    'flex justify-center items-center transition-all duration-200',
                    activeFilterCount > 0
                      ? 'w-5 h-5 opacity-100 px-2 py-0.5'
                      : 'w-0 h-5 opacity-0 overflow-hidden p-0'
                  )}
                >
                  {activeFilterCount}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSubMenu>
                <DropdownMenuSubMenuTrigger>
                  <RiCheckboxCircleLine className='mr-2 size-4' />
                  Status
                </DropdownMenuSubMenuTrigger>
                <DropdownMenuSubMenuContent>
                  <DropdownMenuRadioGroup
                    value={filters.status}
                    onValueChange={(value) =>
                      handleFilterChange('status', value)
                    }
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubMenuContent>
              </DropdownMenuSubMenu>

              {/* Language Filter Submenu */}
              <DropdownMenuSubMenu>
                <DropdownMenuSubMenuTrigger>
                  <RiCodeSSlashFill className='mr-2 size-4' />
                  Language
                </DropdownMenuSubMenuTrigger>
                <DropdownMenuSubMenuContent>
                  <DropdownMenuRadioGroup
                    value={filters.language}
                    onValueChange={(value) =>
                      handleFilterChange('language', value)
                    }
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubMenuContent>
              </DropdownMenuSubMenu>

              {/* Date Range Filter Submenu */}
              <DropdownMenuSubMenu>
                <DropdownMenuSubMenuTrigger>
                  <RiTimeLine className='mr-2 size-4' />
                  Created
                </DropdownMenuSubMenuTrigger>
                <DropdownMenuSubMenuContent>
                  <DropdownMenuRadioGroup
                    value={filters.dateRange}
                    onValueChange={(value) =>
                      handleFilterChange('dateRange', value)
                    }
                  >
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubMenuContent>
              </DropdownMenuSubMenu>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='secondary'>
                <RiArrowUpDownLine className='size-4' />
                <span className='text-sm font-medium'>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className='flex items-center justify-between px-3 py-2'
                onClick={() => handleSortChange('createdAt')}
                onSelect={(e) => e.preventDefault()}
              >
                <div className='flex items-center gap-2'>
                  <RiCalendarLine className='size-4' />
                  <span className='text-sm'>Created At</span>
                </div>
                <RiArrowDownLine
                  className={cx(
                    'size-3 text-muted-foreground transition-all duration-200',
                    filters.sortField === 'createdAt'
                      ? filters.sortDirection === 'asc'
                        ? 'transform rotate-180'
                        : ''
                      : 'opacity-0'
                  )}
                />
              </DropdownMenuItem>

              <DropdownMenuItem
                className='flex items-center justify-between px-3 py-2'
                onClick={() => handleSortChange('status')}
                onSelect={(e) => e.preventDefault()}
              >
                <div className='flex items-center gap-2'>
                  <RiCheckboxCircleLine className='size-4' />
                  <span className='text-sm'>Status</span>
                </div>
                <RiArrowDownLine
                  className={cx(
                    'size-3 text-muted-foreground transition-all duration-200',
                    filters.sortField === 'status'
                      ? filters.sortDirection === 'asc'
                        ? 'transform rotate-180'
                        : ''
                      : 'opacity-0'
                  )}
                />
              </DropdownMenuItem>

              <DropdownMenuItem
                className='flex items-center justify-between px-3 py-2'
                onClick={() => handleSortChange('language')}
                onSelect={(e) => e.preventDefault()}
              >
                <div className='flex items-center gap-2'>
                  <RiCodeBoxLine className='size-4' />
                  <span className='text-sm'>Language</span>
                </div>

                <RiArrowDownLine
                  className={cx(
                    'size-3 text-muted-foreground transition-all duration-200',
                    filters.sortField === 'language'
                      ? filters.sortDirection === 'asc'
                        ? 'transform rotate-180'
                        : ''
                      : 'opacity-0'
                  )}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className='flex flex-wrap gap-2'>
            {filters.search && (
              <Button
                variant='secondary'
                icon={RiSearchLine}
                iconClassName='text-primary'
                className='text-primary'
                onClick={() => handleFilterChange('search', '')}
              >
                "{filters.search}"
                <RiCloseLine className='size-3' />
              </Button>
            )}
            {filters.status !== '*' && (
              <Button
                variant='secondary'
                icon={RiCheckboxCircleLine}
                iconClassName='text-primary'
                className='text-primary'
                onClick={() => handleFilterChange('status', '*')}
              >
                {getStatusLabel(filters.status)}
                <RiCloseLine className='size-3' />
              </Button>
            )}
            {filters.language !== '*' && (
              <Button
                variant='secondary'
                icon={RiCodeSSlashFill}
                iconClassName='text-primary'
                className='text-primary'
                onClick={() => handleFilterChange('language', '*')}
              >
                {getLanguageLabel(filters.language)}
                <RiCloseLine className='size-3' />
              </Button>
            )}
            {filters.dateRange !== '*' && (
              <Button
                variant='secondary'
                icon={RiCalendarLine}
                iconClassName='text-primary'
                className='text-primary'
                onClick={() => handleFilterChange('dateRange', '*')}
              >
                {getDateRangeLabel(filters.dateRange)}
                <RiCloseLine className='size-3' />
              </Button>
            )}
            {/* {(filters.sortField !== 'createdAt' ||
              filters.sortDirection !== 'desc') && (
              <Button
                variant='secondary'
                icon={getSortIcon()}
                iconClassName='text-primary'
                className='text-primary'
                onClick={() => {
                  onFiltersChange({
                    ...filters,
                    sortField: 'createdAt',
                    sortDirection: 'desc',
                  });
                }}
              >
                {getSortLabel()}
                <RiCloseLine className='size-3' />
              </Button>
            )} */}
          </div>
        )}

        {/* Clear Filters Button (Alternative) */}
        {hasActiveFilters ? (
          <Button
            variant='ghost'
            onClick={handleClearFilters}
            icon={RiCloseLine}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// Utility function to filter rooms based on the filters
export function filterRooms(
  rooms: RoomSchema[],
  filters: RoomFilters
): RoomSchema[] {
  const filteredRooms = rooms.filter((room) => {
    // Search filter
    if (
      filters.search &&
      !room.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Language filter
    if (
      filters.language &&
      filters.language !== '*' &&
      room.language !== filters.language
    ) {
      return false;
    }

    // Status filter
    if (
      filters.status &&
      filters.status !== '*' &&
      room.status !== filters.status
    ) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== '*') {
      const roomDate = new Date(room.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (filters.dateRange) {
        case 'today':
          if (roomDate < today) return false;
          break;
        case 'week':
          if (roomDate < weekAgo) return false;
          break;
        case 'month':
          if (roomDate < monthAgo) return false;
          break;
      }
    }

    return true;
  });

  // Sort the filtered rooms
  return filteredRooms.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (filters.sortField) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'language':
        aValue = a.language.toLowerCase();
        bValue = b.language.toLowerCase();
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (filters.sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
}
