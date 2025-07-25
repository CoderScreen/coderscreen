'use client';
import {
  AssessmentVisual,
  LiveInterviewVisual,
  TakeHomeVisual,
} from '@/components/landing/FeatureVisuals';
import { cx } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@coderscreen/ui/card';
import { ReactNode } from 'react';

interface Feature {
  title: string;
  description: string;
  visual: ReactNode;
}

const TOP_FEATURES: Feature[] = [
  {
    title: 'Technical Assessment Screening',
    description:
      'Filter candidates at scale with intelligent assessments that evaluate code quality, problem-solving, and technical depth.',
    visual: <AssessmentVisual />,
  },
  {
    title: 'Real World Take-Home Projects',
    description:
      'Move beyond algorithmic puzzles with projects that mirror your actual work. Evaluate coding style, architecture, and documentation skills.',
    visual: <TakeHomeVisual />,
  },
  {
    title: 'Collaborative Coding Interviews',
    description:
      'Conduct seamless live interviews with real-time code collaboration, instant execution, and built-in communication tools.',
    visual: <LiveInterviewVisual />,
  },
];

export const LandingUseCases = () => {
  return (
    <section className='w-full' id='use-cases'>
      <div className='w-full grid grid-cols-1 lg:grid-cols-3'>
        {TOP_FEATURES.map((feature, index) => (
          <Card
            key={feature.title}
            className={cx(
              'px-6 py-12 h-full rounded-none shadow-none border-y border-border/50',
              index === 1 ? 'border-solid border-l border-r border-border/50' : 'border-x-0'
            )}
          >
            <CardHeader className='p-0 mb-4'>
              <CardTitle className='text-xl font-bold mb-2'>{feature.title}</CardTitle>
              <CardDescription className='text-muted-foreground'>
                {feature.description}
              </CardDescription>
            </CardHeader>

            <div className='flex items-center overflow-hidden'>{feature.visual}</div>
          </Card>
        ))}
      </div>
    </section>
  );
};
