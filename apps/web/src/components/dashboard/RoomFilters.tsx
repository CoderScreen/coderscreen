import React, { useState, useMemo } from 'react';
import { Input } from '../ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import {
  RiSearchLine,
  RiFilter3Line,
  RiCloseLine,
  RiCodeBoxLine,
  RiCalendarLine,
  RiArrowUpDownLine,
} from '@remixicon/react';
import { RoomSchema } from '@coderscreen/api/schema/room';

export interface RoomFilters {
  search: string;
  language: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

interface RoomFiltersProps {
  filters: RoomFilters;
  onFiltersChange: (filters: RoomFilters) => void;
  onClearFilters: () => void;
  totalRooms: number;
  filteredRooms: number;
}

const LANGUAGE_OPTIONS = [
  { value: '*', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export function RoomFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  totalRooms,
  filteredRooms,
}: RoomFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return filters.search || filters.language || filters.dateRange !== 'all';
  }, [filters]);

  const handleFilterChange = (key: keyof RoomFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Button
          variant='secondary'
          onClick={() => setShowFilters(!showFilters)}
        >
          <RiFilter3Line className='mr-1 size-4' />
          Filter
        </Button>
        <Button variant='secondary'>
          <RiArrowUpDownLine className='mr-1 size-4' />
          <span>Sort</span>
        </Button>
        <div className='text-sm text-primary'>{filteredRooms} results</div>
      </div>

      {showFilters && (
        <div className='grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='sm:col-span-2'>
            <Input
              type='search'
              placeholder='Search by room ID...'
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className='w-full'
              autoFocus
            />
          </div>

          <div className='w-full'>
            <Select
              value={filters.language}
              onValueChange={(value) => handleFilterChange('language', value)}
            >
              <SelectTrigger>
                <RiCodeBoxLine className='mr-2 size-4 text-gray-400' />
                <SelectValue placeholder='Language' />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='w-full'>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange('dateRange', value)}
            >
              <SelectTrigger>
                <RiCalendarLine className='mr-2 size-4 text-gray-400' />
                <SelectValue placeholder='Date range' />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className='sm:col-span-2 lg:col-span-4'>
              <Button
                variant='secondary'
                onClick={handleClearFilters}
                className='w-full'
              >
                <RiCloseLine className='-ml-0.5 mr-1.5 size-4' />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Utility function to filter rooms based on the filters
export function filterRooms(
  rooms: RoomSchema[],
  filters: RoomFilters
): RoomSchema[] {
  return rooms.filter((room) => {
    // Search filter
    if (
      filters.search &&
      !room.id.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Language filter
    if (filters.language && room.language !== filters.language) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
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
}
