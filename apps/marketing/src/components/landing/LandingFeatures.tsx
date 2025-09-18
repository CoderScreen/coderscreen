'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
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
    id: 'code-editor',
    title: 'Multiplayer Code Editor',
    description:
      'Fast, collaborative editor built for live interviews and real-world coding tasks.',
    image: '/features/editor.png',
    imageAlt: 'Real-time code editor with collaborative cursors and syntax highlighting',
  },
  {
    id: 'collaborative-whiteboard',
    title: 'Collaborative Whiteboard',
    description: 'Sketch system designs, flowcharts, and architecture together in real time.',
    image: '/features/whiteboard.png',
    imageAlt: 'Live whiteboard with system design diagrams',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description:
      'Understand their judgment, prompting skills, and ability to work with modern AI assistants.',
    image: '/features/assistant.png',
    imageAlt: 'AI panel with context-aware code suggestions',
  },
  // {
  //   id: 'question-library',
  //   title: 'Reusable Question Library',
  //   description: 'Create your own re-usable questions or select from our curated library.',
  //   image: '/features/question-library.png',
  //   imageAlt: 'Question library with tagged coding challenges',
  // },
];

export const LandingFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState<Feature>(features[0]);

  return (
    <section id='features' className='py-20 bg-white'>
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
          <div className='lg:col-span-2 ml-4 border-l border-border/50 pl-4 bg-white'>
            <Image
              src={selectedFeature.image}
              alt={selectedFeature.imageAlt}
              className='w-full h-full object-contain border border-border/50 rounded-xl'
              height={1000}
              width={1000}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
