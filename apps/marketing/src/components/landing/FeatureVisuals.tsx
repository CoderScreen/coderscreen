import { cx } from '@/lib/utils';

// Technical assessment screening with candidate scores
export const AssessmentVisual = () => {
  const candidates = [
    { name: 'Candidate A', score: 75, passed: false, time: '45m', questions: 8, completed: 6 },
    { name: 'Candidate B', score: 95, passed: true, time: '32m', questions: 10, completed: 10 },
  ];

  const renderProgressBar = (score: number) => {
    const filledBlocks = Math.floor(score / 10);
    const emptyBlocks = 10 - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  return (
    <div className='w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 p-2 rounded'>
      <pre className='m-0'>
        {`Senior Fullstack Engineer\nTechnical Assessment Results
─────────────────────────────
        `}
      </pre>
      {candidates.map((candidate, index) => (
        <div key={index} className={cx('text-xs mt-[1rem]', index === 0 ? 'mt-0' : '')}>
          <div className='text-gray-900 font-medium'>{candidate.name}</div>
          <div className='flex items-center gap-2'>
            <span className='text-gray-600'>Score:</span>
            <span className='font-mono text-primary/80'>{renderProgressBar(candidate.score)}</span>
            <span className='font-semibold text-primary/80'>{candidate.score}%</span>
          </div>
          <div className='text-gray-600'>
            Time: {candidate.time} | Questions: {candidate.completed}/{candidate.questions}
          </div>
          <div className={cx('flex items-center gap-1')}>
            Status:{' '}
            <span className={cx('', candidate.passed ? 'text-green-600' : 'text-red-600')}>
              {candidate.passed ? 'PASSED ✓' : 'FAILED ✗'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Git clone and terminal
export const TakeHomeVisual = () => {
  return (
    <div className='w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 p-2 rounded'>
      <div className='font-mono'>
        <div className='text-primary/80'>$ git clone @coderscreen/takehome</div>
        <div className=''>Cloning into 'takehome'...</div>
        <div className=''>$ cd takehome</div>
        <div className=''>$ npm install</div>
        <div className='text-muted-foreground'>Installing packages...</div>
        <div className='text-muted-foreground'>✓ 150 packages installed</div>
        <div className=''>$ npm run test</div>
        <div className='text-muted-foreground'>Running test suite...</div>
        <div className='text-green-600'>✓ 12 tests passed</div>
        <div className=''>$ git add .</div>
        <div className='text-primary/80'>$ git commit -m "Completed project"</div>
        <div className=''>[main abc1234] Completed project</div>
        <div className='text-muted-foreground'> 3 files changed, 45 insertions(+)</div>
      </div>
    </div>
  );
};

// Animated code editor with cursor and terminal
export const LiveInterviewVisual = () => {
  const finalCode = `function fizzBuzz(n) {
  let result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    }
  }
  return result;
}`;

  return (
    <div className='w-full text-xs text-gray-700 bg-gray-50 border p-2 rounded relative'>
      <pre className='m-0'>{finalCode}</pre>

      <div
        className='absolute w-0.5 h-4 bg-primary/50 w-[2rem]'
        style={{
          left: '9rem',
          top: '8.5rem',
        }}
      />

      <div
        className='absolute bg-primary text-white text-xs px-2 py-1 rounded shadow-lg'
        style={{
          left: '11rem',
          top: '7rem',
          whiteSpace: 'nowrap',
        }}
      >
        Candidate
      </div>
    </div>
  );
};
