'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const features: Feature[] = [
  {
    id: 'code-playback',
    title: 'Code Playback',
    description: 'Replay coding sessions to review how candidates approach, debug, and iterate.',
    image: '/features/code-playback.webp',
    imageAlt: 'Interface showing code playback with edit timeline',
  },
  {
    id: 'collaborative-whiteboard',
    title: 'Collaborative Whiteboard',
    description: 'Sketch system designs, flowcharts, and architecture together in real time.',
    image: '/features/whiteboard.webp',
    imageAlt: 'Live whiteboard with system design diagrams',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description:
      'Understand their judgment, prompting skills, and ability to work with modern AI assistants.',
    image: '/features/ai-assistant.png',
    imageAlt: 'AI panel with context-aware code suggestions',
  },
  {
    id: 'question-library',
    title: 'Reusable Question Library',
    description: 'Create your own re-usable questions or select from our curated library.',
    image: '/features/question-library.png',
    imageAlt: 'Question library with tagged coding challenges',
  },
];

const FeatureImage = ({ feature }: { feature: Feature }) => {
  return (
    <div className='w-full h-80 rounded-xl shadow-lg relative overflow-hidden'>
      {/* Content overlay */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='text-center text-white'>
          <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto'>
            <svg className='w-8 h-8' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <h3 className='text-2xl font-bold mb-2'>{feature.title}</h3>
          <p className='text-sm opacity-90 max-w-xs mx-auto'>
            Interactive dashboard with real-time data visualization
          </p>
        </div>
      </div>
    </div>
  );
};

export const LandingFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState<Feature>(features[0]);

  return (
    <section className='py-20 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center gap-1 mb-10'>
          <h2 className='text-3xl font-semibold'>Smarter Interviews, Better Signals</h2>
          <p className='text-muted-foreground w-1/2 text-center'>
            Built for speed, trust, and great candidate experience.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-0'>
          {/* Left Side - Feature List */}
          <div className='lg:col-span-1'>
            <div className=''>
              {features.map((feature) => (
                <motion.button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className={cn(
                    'w-full text-left p-4 transition-all duration-200 rounded-xl',
                    'cursor-pointer border ',
                    selectedFeature.id === feature.id
                      ? ' bg-muted text-gray-900'
                      : 'border-transparent text-muted-foreground hover:text-gray-900'
                  )}
                >
                  <h3 className='font-semibold mb-2'>{feature.title}</h3>
                  <p className='text-sm leading-relaxed'>{feature.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Side - Feature Content */}
          <div className='lg:col-span-2 ml-4 border-l border-border/50 pl-4'>
            <img
              src={selectedFeature.image}
              alt={selectedFeature.imageAlt}
              className='w-full h-full object-cover border border-border/50 rounded-xl'
            />
          </div>
        </div>
      </div>
    </section>
  );
};
