import { ReactNode } from 'react';
import {
  AIAssistantVisual,
  LiveInterviewVisual,
  WhiteboardVisual,
} from '@/components/landing/FeatureVisuals';
import { HeroOverlay } from '@/components/landing/HeroOverlay';
import { cx } from '@/lib/utils';

interface BentoFeature {
  title: string;
  description: string;
  visual: ReactNode;
  colSpan: string;
}

const BENTO_FEATURES: BentoFeature[] = [
  {
    title: 'Real-Time Collaborative Editor',
    description:
      'Code together with multiplayer cursors, live execution, and 20+ language support.',
    visual: <LiveInterviewVisual />,
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Built-in AI Assistant',
    description: 'Evaluate how candidates prompt, iterate, and integrate AI into real workflows.',
    visual: <AIAssistantVisual />,
    colSpan: 'lg:col-span-1',
  },
  {
    title: 'System Design Canvas',
    description:
      'Sketch architecture diagrams, data flows, and system components together in real time.',
    visual: <WhiteboardVisual />,
    colSpan: 'lg:col-span-3',
  },
];

export const LandingFeatures = () => {
  return (
    <section id='features' className='w-full'>
      <div className='w-full px-6 pt-20 pb-10 border-t '>
        <div className='flex flex-col items-center gap-1'>
          <h2 className='text-3xl font-semibold'>Built for Technical Depth</h2>
          <p className='text-muted-foreground w-full md:w-1/2 text-center'>
            Every tool your team needs to run rigorous, candidate-friendly technical interviews.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3'>
        {BENTO_FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className={cx(
              'flex flex-col border ',
              feature.colSpan,
              index === 0 && 'border-l-0 border-t',
              index === 1 && 'border-r-0 border-t lg:border-l',
              index === 2 && 'border-x-0 border-t border-b-0'
            )}
          >
            {/* Visual with gray bg + overlay */}
            <div className='relative flex items-center justify-center px-8 py-10 bg-gray-100 overflow-hidden'>
              <div className='absolute inset-0 pointer-events-none'>
                <HeroOverlay />
              </div>
              <div className='relative z-10 w-full max-w-lg'>{feature.visual}</div>
            </div>

            {/* Text */}
            <div className='px-6 py-5'>
              <h3 className='text-lg font-semibold'>{feature.title}</h3>
              <p className='text-sm text-muted-foreground mt-1'>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
