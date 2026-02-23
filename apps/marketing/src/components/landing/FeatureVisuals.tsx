import { ProgressCircle } from '@coderscreen/ui/progresscircle';
import { RiJavascriptFill } from '@remixicon/react';
import Image from 'next/image';

export const AssessmentVisual = () => {
  const candidates = [
    { name: 'Linus Torvalds', avatar: '/avatars/linus.png', score: 96, passed: true, time: '28m' },
    { name: 'Sam Altman', avatar: '/avatars/sam.webp', score: 71, passed: false, time: '47m' },
    {
      name: 'Andrej Karpathy',
      avatar: '/avatars/andrej.png',
      score: 92,
      passed: true,
      time: '31m',
    },
    {
      name: 'Steve Jobs',
      avatar: '/avatars/steve.webp',
      score: 89,
      passed: true,
      time: '35m',
    },
    { name: 'Elon Musk', avatar: '/avatars/elon.webp', score: 64, passed: false, time: '52m' },
  ];

  return (
    <div className='w-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden'>
      {/* Title bar */}
      <div className='px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between'>
        <span className='text-xs font-semibold text-gray-800'>Junior Backend Developer</span>
        <span className='text-[10px] text-gray-400'>{candidates.length} candidates</span>
      </div>

      {/* Table header */}
      <div className='px-4 py-1.5 border-b border-gray-100 grid grid-cols-[1fr_56px_56px_56px] gap-2 text-[9px] font-medium uppercase tracking-wider text-gray-400'>
        <div>Candidate</div>
        <div>Score</div>
        <div className='text-right'>Time</div>
        <div className='text-center'>Status</div>
      </div>

      {/* Table rows */}
      <div className='divide-y divide-gray-50'>
        {candidates.map((c) => (
          <div
            key={c.name}
            className='px-4 py-2 grid grid-cols-[1fr_56px_56px_56px] gap-2 items-center text-xs'
          >
            <div className='flex items-center gap-2 min-w-0'>
              <Image
                width={24}
                height={24}
                src={c.avatar}
                alt={c.name}
                className='w-6 h-6 rounded-full shrink-0 object-cover border'
              />
              <span className='font-medium text-gray-900 truncate'>{c.name}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <ProgressCircle
                value={c.score}
                radius={8}
                strokeWidth={2}
                variant={c.score >= 80 ? 'success' : c.score >= 60 ? 'warning' : 'error'}
                showAnimation={false}
              />
              <span className='font-medium text-gray-700'>{c.score}</span>
            </div>
            <span className='text-right text-gray-400'>{c.time}</span>
            <div className='flex justify-center'>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  c.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}
              >
                {c.passed ? 'Pass' : 'Fail'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TakeHomeVisual = () => {
  const files = [
    { name: 'src/', indent: 0, isFolder: true },
    { name: 'components/', indent: 1, isFolder: true },
    { name: 'Dashboard.tsx', indent: 2, isFolder: false },
    { name: 'Chart.tsx', indent: 2, isFolder: false },
    { name: 'hooks/', indent: 1, isFolder: true },
    { name: 'useData.ts', indent: 2, isFolder: false },
    { name: 'index.ts', indent: 1, isFolder: false },
    { name: 'utils.ts', indent: 1, isFolder: false },
    { name: 'tests/', indent: 0, isFolder: true },
    { name: 'dashboard.test.ts', indent: 1, isFolder: false },
    { name: 'chart.test.ts', indent: 1, isFolder: false },
    { name: 'README.md', indent: 0, isFolder: false },
    { name: 'package.json', indent: 0, isFolder: false },
  ];

  const tests = [
    { name: 'renders dashboard layout', passed: true },
    { name: 'fetches and displays data', passed: true },
    { name: 'handles loading state', passed: true },
    { name: 'handles error state', passed: true },
    { name: 'chart renders correctly', passed: true },
    { name: 'responsive breakpoints', passed: true },
  ];

  return (
    <div className='w-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden'>
      <div className='grid grid-cols-2 divide-x divide-gray-100'>
        {/* File tree */}
        <div className='p-3 text-xs font-mono'>
          {files.map((f) => (
            <div
              key={`${f.indent}-${f.name}`}
              className='flex items-center gap-1.5 py-0.5'
              style={{ paddingLeft: `${f.indent * 12}px` }}
            >
              <span className={f.isFolder ? 'text-primary' : 'text-gray-400'}>
                {f.isFolder ? '▸' : '·'}
              </span>
              <span className={f.isFolder ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                {f.name}
              </span>
            </div>
          ))}
        </div>

        {/* Test results */}
        <div className='p-3 text-xs'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-emerald-500 font-medium'>
              {tests.length}/{tests.length} passed
            </span>
            <span className='text-[10px] text-gray-400'>2.1s</span>
          </div>
          <div className='space-y-0.5'>
            {tests.map((t) => (
              <div key={t.name} className='flex items-center gap-1.5 py-0.5'>
                <span className='text-emerald-500'>✓</span>
                <span className='text-gray-600'>{t.name}</span>
              </div>
            ))}
          </div>
          <div className='mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400'>
            Test Suites: <span className='text-emerald-500'>2 passed</span>, 2 total
          </div>
        </div>
      </div>
    </div>
  );
};

export const LiveInterviewVisual = () => {
  return (
    <div className='w-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden'>
      {/* Language & status bar */}
      <div className='px-3 py-1.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-[10px]'>
          <span className='px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-medium flex items-center gap-1'>
            <RiJavascriptFill className='w-3 h-3' />
            JavaScript
          </span>
          <span className='text-gray-400'>2 participants</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
          <span className='text-[10px] text-emerald-600'>Live</span>
        </div>
      </div>

      {/* Code content with two cursors */}
      <div className='p-3 font-mono text-xs leading-5'>
        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>1</span>
          <span className='text-gray-400'>{'// Two Sum - find indices that add up to target'}</span>
        </div>

        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>2</span>
          <span>
            <span className='text-blue-600'>function</span>{' '}
            <span className='text-amber-600'>twoSum</span>
            <span className='text-gray-700'>(nums, target) {'{'}</span>
          </span>
        </div>

        <div className='flex items-center bg-blue-50/60'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>3</span>
          <span className='pl-4 border-l-2 border-blue-500'>
            <span className='text-blue-600'>const</span>
            <span className='text-gray-700'> map = </span>
            <span className='text-blue-600'>new</span>
            <span className='text-amber-600'> Map</span>
            <span className='text-gray-700'>();</span>
          </span>
          <span className='ml-2 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-sans leading-none shrink-0'>
            You
          </span>
        </div>

        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>4</span>
          <span className='pl-4'>
            <span className='text-blue-600'>for</span>
            <span className='text-gray-700'> (</span>
            <span className='text-blue-600'>let</span>
            <span className='text-gray-700'>
              {' i = 0; i < nums.length; i++) {'}
              {'{'}
              {'}'}
            </span>
          </span>
        </div>

        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>5</span>
          <span className='pl-8 text-gray-700'>const complement = target - nums[i];</span>
        </div>

        <div className='flex items-center bg-emerald-50/60'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>6</span>
          <span className='pl-8 border-l-2 border-emerald-500'>
            <span className='text-blue-600'>if</span>
            <span className='text-gray-700'> (map.has(complement))</span>
          </span>
          <span className='ml-2 text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-sans leading-none shrink-0'>
            Candidate
          </span>
        </div>

        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>7</span>
          <span className='pl-12'>
            <span className='text-blue-600'>return</span>
            <span className='text-gray-700'> [map.get(complement), i];</span>
          </span>
        </div>

        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>8</span>
          <span className='pl-8 text-gray-700'>map.set(nums[i], i);</span>
        </div>

        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>9</span>
          <span className='pl-4 text-gray-700'>{'}'}</span>
        </div>

        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>10</span>
          <span className='pl-4'>
            <span className='text-blue-600'>return</span>
            <span className='text-gray-700'> [];</span>
          </span>
        </div>

        <div className='flex'>
          <span className='text-gray-400 w-6 shrink-0 select-none text-right pr-3'>11</span>
          <span className='text-gray-700'>{'}'}</span>
        </div>
      </div>
    </div>
  );
};

export const AIAssistantVisual = () => {
  return (
    <div className='w-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden'>
      <div className='p-3 space-y-3'>
        {/* User message */}
        <div className='flex gap-2'>
          <div className='w-5 h-5 rounded-full bg-blue-500 shrink-0 flex items-center justify-center'>
            <span className='text-[8px] text-white font-medium'>You</span>
          </div>
          <div className='bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 leading-relaxed'>
            How do I handle the edge case when the input array is empty?
          </div>
        </div>

        {/* AI response */}
        <div className='flex gap-2'>
          <div className='w-5 h-5 rounded-full bg-violet-500 shrink-0 flex items-center justify-center'>
            <span className='text-[8px] text-white font-medium'>AI</span>
          </div>
          <div className='space-y-1.5 flex-1 min-w-0'>
            <div className='text-xs text-gray-700 leading-relaxed'>
              Add an early return guard at the top of the function:
            </div>
            <div className='bg-gray-900 rounded-md px-2.5 py-2 font-mono text-[10px] leading-4 text-gray-100'>
              <div>
                <span className='text-blue-400'>if</span>
                <span className='text-gray-300'> (!nums || nums.length {'<'} </span>
                <span className='text-amber-300'>2</span>
                <span className='text-gray-300'>) {'{'}</span>
              </div>
              <div>
                <span className='text-blue-400'> return</span>
                <span className='text-gray-300'> [];</span>
              </div>
              <div>
                <span className='text-gray-300'>{'}'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WhiteboardVisual = () => {
  const nodes = [
    { id: 'client', label: 'Client', x: 10, y: 45, primary: false },
    { id: 'api', label: 'API Gateway', x: 130, y: 15, primary: true },
    { id: 'cache', label: 'Cache', x: 130, y: 75, primary: false },
    { id: 'db', label: 'Database', x: 265, y: 45, primary: false },
  ];

  const connections = [
    { from: 'client', to: 'api', fromX: 85, fromY: 55, toX: 130, toY: 30 },
    { from: 'client', to: 'cache', fromX: 85, fromY: 60, toX: 130, toY: 85 },
    { from: 'api', to: 'db', fromX: 215, fromY: 30, toX: 265, toY: 55 },
    { from: 'cache', to: 'db', fromX: 215, fromY: 85, toX: 265, toY: 60 },
  ];

  return (
    <div className='w-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden'>
      <div className='px-3 pt-3 pb-1'>
        <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400'>
          System Design
        </span>
      </div>
      <div className='p-3'>
        <svg
          viewBox='0 0 340 110'
          className='w-full h-auto'
          fill='none'
          aria-label='System Design Diagram'
          aria-hidden='true'
        >
          {/* Connection lines */}
          {connections.map((conn) => (
            <line
              key={`${conn.from}-${conn.to}`}
              x1={conn.fromX}
              y1={conn.fromY}
              x2={conn.toX}
              y2={conn.toY}
              stroke='#d1d5db'
              strokeWidth='1.5'
              strokeDasharray='4 2'
            />
          ))}

          {/* Arrow heads */}
          {connections.map((conn) => {
            const angle = Math.atan2(conn.toY - conn.fromY, conn.toX - conn.fromX);
            const tipX = conn.toX;
            const tipY = conn.toY;
            const arrowLen = 6;
            return (
              <polygon
                key={`arrow-${conn.from}-${conn.to}`}
                points={`${tipX},${tipY} ${tipX - arrowLen * Math.cos(angle - 0.4)},${tipY - arrowLen * Math.sin(angle - 0.4)} ${tipX - arrowLen * Math.cos(angle + 0.4)},${tipY - arrowLen * Math.sin(angle + 0.4)}`}
                fill='#d1d5db'
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width='75'
                height='24'
                rx='6'
                fill={node.primary ? 'hsl(221, 97%, 54%)' : '#f9fafb'}
                stroke={node.primary ? 'hsl(221, 97%, 54%)' : '#e5e7eb'}
                strokeWidth='1'
              />
              <text
                x={node.x + 37.5}
                y={node.y + 15}
                textAnchor='middle'
                fontSize='9'
                fontFamily='system-ui, sans-serif'
                fontWeight='500'
                fill={node.primary ? 'white' : '#374151'}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
