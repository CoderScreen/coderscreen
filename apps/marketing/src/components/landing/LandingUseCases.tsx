import { RiCheckboxCircleLine } from '@remixicon/react';
import { ReactNode } from 'react';
import { AssessmentVisual, LiveInterviewVisual } from '@/components/landing/FeatureVisuals';
import { HeroOverlay } from '@/components/landing/HeroOverlay';
import { cx } from '@/lib/utils';

interface UseCase {
  tag: string;
  title: string;
  description: string;
  bullets: { label: string; detail: string }[];
  visual: ReactNode;
}

const USE_CASES: UseCase[] = [
  {
    tag: 'Screening',
    title: 'Screen Smarter, Not Harder',
    description:
      'Stop wasting weeks on phone screens. Send candidates a real coding challenge, get back scored results, and know exactly who to move forward with.',
    bullets: [
      {
        label: 'Automated scoring',
        detail: 'Get instant, structured results for every submission',
      },
      { label: 'Real-world tasks', detail: 'Test practical skills instead of whiteboard trivia' },
      { label: 'Candidate-friendly', detail: 'A clean experience that respects their time' },
      { label: 'Anti-cheating', detail: 'Built-in activity monitoring and integrity checks' },
    ],
    visual: <AssessmentVisual />,
  },
  {
    tag: 'Live Interview',
    title: 'Interview Like You Pair Program',
    description:
      'Forget awkward screen-shares and clunky setups. Run live coding sessions where you and the candidate collaborate in the same editor, run code together, and actually see how they think.',
    bullets: [
      { label: 'Multiplayer editor', detail: 'Write code together with shared cursors' },
      { label: '20+ languages', detail: 'TypeScript, Python, Rust, Go, and more' },
      { label: 'Live output', detail: 'Run code and see results in real time' },
      { label: 'Session recording', detail: 'Replay any interview and share it with your team' },
    ],
    visual: <LiveInterviewVisual />,
  },
];

export const LandingUseCases = () => {
  return (
    <section className='w-full' id='use-cases'>
      <div className='w-full px-6 pt-20 pb-10 border-t '>
        <div className='flex flex-col items-center gap-1'>
          <h2 className='text-3xl font-semibold'>Assess Candidates the Way They Actually Work</h2>
          <p className='text-muted-foreground w-full md:w-1/2 text-center'>
            From automated screening to live pair programming, evaluate real skills instead of
            interview performance.
          </p>
        </div>
      </div>

      <div className='w-full'>
        {USE_CASES.map((useCase, index) => {
          const isReversed = index % 2 === 1;

          return (
            <div
              key={useCase.title}
              className={cx(
                'grid grid-cols-1 lg:grid-cols-2 border-t ',
                index === USE_CASES.length - 1 && 'border-b-0'
              )}
            >
              {/* Text side */}
              <div
                className={cx(
                  'flex flex-col justify-center px-8 py-14',
                  isReversed ? 'lg:order-last' : 'lg:order-first',
                  isReversed ? 'lg:border-l ' : 'lg:border-r '
                )}
              >
                <span className='text-xs font-semibold uppercase tracking-wider text-primary mb-3'>
                  {useCase.tag}
                </span>
                <h3 className='text-2xl font-bold mb-3'>{useCase.title}</h3>
                <p className='text-muted-foreground leading-relaxed mb-6'>{useCase.description}</p>
                <ul className='space-y-3'>
                  {useCase.bullets.map((bullet) => (
                    <li key={bullet.label} className='flex items-start gap-2.5'>
                      <RiCheckboxCircleLine className='size-4 text-primary shrink-0 mt-0.5' />
                      <div className='flex flex-col gap-1'>
                        <span className='text-sm font-medium text-foreground'>{bullet.label}</span>
                        <span className='text-sm text-muted-foreground'>{bullet.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual side */}
              <div
                className={cx(
                  'relative flex items-center justify-center px-8 py-14 bg-gray-100 overflow-hidden',
                  isReversed ? 'lg:order-first' : 'lg:order-last'
                )}
              >
                <div className='absolute inset-0 pointer-events-none'>
                  <HeroOverlay />
                </div>
                <div className='relative z-10 w-full max-w-lg'>{useCase.visual}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
