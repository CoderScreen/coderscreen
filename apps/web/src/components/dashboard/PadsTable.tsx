import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../ui/table';
import { Badge } from '../ui/badge';
import {
  RiMore2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiTimeLine,
  RiUserLine,
  RiCodeBoxLine,
} from '@remixicon/react';

const pads = [
  {
    id: 1,
    title: 'Frontend Interview - React Components',
    status: 'Active',
    creator: 'Alice Smith',
    created: '2024-06-01',
    language: 'TypeScript',
    participants: 3,
    lastActivity: '2 hours ago',
  },
  {
    id: 2,
    title: 'Backend API Development',
    status: 'Draft',
    creator: 'Bob Lee',
    created: '2024-05-28',
    language: 'Node.js',
    participants: 1,
    lastActivity: '1 day ago',
  },
  {
    id: 3,
    title: 'Vue.js Live Coding Session',
    status: 'Completed',
    creator: 'Carol White',
    created: '2024-05-20',
    language: 'Vue.js',
    participants: 2,
    lastActivity: '3 days ago',
  },
  {
    id: 4,
    title: 'Angular Component Architecture',
    status: 'Active',
    creator: 'David Chen',
    created: '2024-05-15',
    language: 'Angular',
    participants: 4,
    lastActivity: '30 minutes ago',
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'draft':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'completed':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'archived':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getLanguageColor = (language: string) => {
  switch (language.toLowerCase()) {
    case 'typescript':
      return 'bg-blue-50 text-blue-600';
    case 'javascript':
      return 'bg-yellow-50 text-yellow-600';
    case 'react':
      return 'bg-cyan-50 text-cyan-600';
    case 'node.js':
      return 'bg-green-50 text-green-600';
    case 'vue.js':
      return 'bg-emerald-50 text-emerald-600';
    case 'angular':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

export default function PadsTable() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>Recent Pads</h2>
          <p className='text-gray-600 text-sm mt-1'>
            Your latest coding pads and interviews
          </p>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <span>
            Showing {pads.length} of {pads.length} pads
          </span>
        </div>
      </div>

      <div className='bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden'>
        <Table>
          <TableHead>
            <TableRow className='bg-gray-50/50'>
              <TableHeaderCell className='font-semibold text-gray-900'>
                Pad
              </TableHeaderCell>
              <TableHeaderCell className='font-semibold text-gray-900'>
                Status
              </TableHeaderCell>
              <TableHeaderCell className='font-semibold text-gray-900'>
                Language
              </TableHeaderCell>
              <TableHeaderCell className='font-semibold text-gray-900'>
                Creator
              </TableHeaderCell>
              <TableHeaderCell className='font-semibold text-gray-900'>
                Created
              </TableHeaderCell>
              <TableHeaderCell className='font-semibold text-gray-900'>
                Activity
              </TableHeaderCell>
              <TableHeaderCell className='font-semibold text-gray-900 w-12'></TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-12'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center'>
                      <RiCodeBoxLine className='size-6 text-gray-400' />
                    </div>
                    <div>
                      <p className='text-gray-900 font-medium'>No pads found</p>
                      <p className='text-gray-500 text-sm'>
                        Create your first coding pad to get started
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pads.map((pad) => (
                <TableRow
                  key={pad.id}
                  className='hover:bg-gray-50/50 transition-colors'
                >
                  <TableCell>
                    <div className='flex flex-col'>
                      <div className='font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors'>
                        {pad.title}
                      </div>
                      <div className='flex items-center gap-4 text-xs text-gray-500 mt-1'>
                        <span className='flex items-center gap-1'>
                          <RiUserLine className='size-3' />
                          {pad.participants} participants
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(pad.status)} text-xs font-medium`}
                    >
                      {pad.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getLanguageColor(pad.language)} text-xs font-medium`}
                    >
                      {pad.language}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold'>
                        {pad.creator
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span className='text-sm text-gray-700'>
                        {pad.creator}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm text-gray-600'>{pad.created}</div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1 text-xs text-gray-500'>
                      <RiTimeLine className='size-3' />
                      {pad.lastActivity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <button
                        className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
                        title='Edit'
                      >
                        <RiEditLine className='size-4 text-gray-500' />
                      </button>
                      <button
                        className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
                        title='Open'
                      >
                        <RiExternalLinkLine className='size-4 text-gray-500' />
                      </button>
                      <button
                        className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
                        title='More'
                      >
                        <RiMore2Line className='size-4 text-gray-500' />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
