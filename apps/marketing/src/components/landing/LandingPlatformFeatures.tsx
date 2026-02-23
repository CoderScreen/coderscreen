import {
  RiBarChartBoxLine,
  RiCodeSSlashLine,
  RiFolderOpenLine,
  RiLinkM,
  RiPaintBrushLine,
  RiPlayCircleLine,
  RiTerminalBoxLine,
  RiWindowLine,
} from '@remixicon/react';
import { type ReactNode } from 'react';
import { cx } from '@/lib/utils';

interface PlatformFeature {
  icon: ReactNode;
  title: string;
  description: string;
}

const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    icon: <RiPlayCircleLine className='size-5' />,
    title: 'Code Playback',
    description:
      'Replay every keystroke so you can see exactly how a candidate approached the problem.',
  },
  {
    icon: <RiFolderOpenLine className='size-5' />,
    title: 'Multi-file Projects',
    description:
      'Go beyond single files. Let candidates work with real project structures and imports.',
  },
  {
    icon: <RiCodeSSlashLine className='size-5' />,
    title: '20+ Languages',
    description:
      'TypeScript, Python, Go, Rust, Java, C++, and more, all with live execution built in.',
  },
  {
    icon: <RiWindowLine className='size-5' />,
    title: 'Live Browser Preview',
    description:
      'See React, Vue, and Svelte projects render in real time right inside the browser.',
  },
  {
    icon: <RiLinkM className='size-5' />,
    title: 'Zero Setup',
    description: 'Candidates join with a link. No downloads, no installs, no friction.',
  },
  {
    icon: <RiPaintBrushLine className='size-5' />,
    title: 'Custom Branding',
    description: "Put your company's logo and colors on the interview experience.",
  },
  {
    icon: <RiBarChartBoxLine className='size-5' />,
    title: 'Analytics & Insights',
    description:
      'Track hiring metrics, spot bottlenecks, and help your interviewers improve over time.',
  },
  {
    icon: <RiTerminalBoxLine className='size-5' />,
    title: 'Real-time Execution',
    description: 'Run code instantly and get stdout, stderr, and exit codes right in the browser.',
  },
];

export const LandingPlatformFeatures = () => {
  return (
    <section className='w-full'>
      <div className='w-full px-6 py-10 border-t'>
        <div className='flex flex-col items-center gap-1'>
          <h2 className='text-3xl font-semibold'>Everything You Need</h2>
          <p className='text-muted-foreground w-full md:w-1/2 text-center'>
            A complete platform for technical hiring, from screening to offer.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t'>
        {PLATFORM_FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className={cx(
              'px-6 py-8 border-b',
              index % 4 !== 3 && 'lg:border-r',
              index % 2 !== 1 && 'md:border-r lg:border-r-0',
              index % 4 !== 3 && 'lg:border-r'
            )}
          >
            <div className='flex flex-col gap-3'>
              <div className='text-primary'>{feature.icon}</div>
              <div>
                <h3 className='font-semibold text-sm mb-1'>{feature.title}</h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
