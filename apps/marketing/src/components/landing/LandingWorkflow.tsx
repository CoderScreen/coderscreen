'use client';

import { Logo } from '@/components/common/Logo';
import { cx } from '@/lib/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@coderscreen/ui/card';
import {
  RiHomeOfficeLine,
  RiListCheck3,
  RiShakeHandsLine,
  RiTerminalBoxLine,
} from '@remixicon/react';
import { ReactNode, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

const WorkflowVisual = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [visualActiveStage, setVisualActiveStage] = useState(-1);
  const progressMotion = useMotionValue(0);

  useEffect(() => {
    if (activeStage >= 3) return; // Stop at the last stage

    const interval = setInterval(() => {
      setActiveStage((prev) => prev + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [activeStage]);

  // Animate progress bar when activeStage changes
  useEffect(() => {
    const targetProgress = Math.min(Math.max(activeStage, 0), 3) / 3;
    const adjustedProgress = 0.1 + targetProgress * 0.9; // Start at 10%, end at 100%
    animate(progressMotion, adjustedProgress, { duration: 0.8, ease: 'easeInOut' });
  }, [activeStage, progressMotion]);

  // Delay visual activation of stages to happen in the middle of progress animation
  useEffect(() => {
    if (activeStage >= 0) {
      const timer = setTimeout(() => {
        setVisualActiveStage(activeStage);
      }, 400); // Half of the progress animation duration (800ms / 2)

      return () => clearTimeout(timer);
    }
  }, [activeStage]);

  const stages = [
    { icon: RiListCheck3, title: 'Assessment', description: 'Automated screening' },
    { icon: RiHomeOfficeLine, title: 'Take-Home', description: 'Project-based evaluation' },
    { icon: RiTerminalBoxLine, title: 'Live Interview', description: 'Real-time collaboration' },
    { icon: RiShakeHandsLine, title: 'Hired', description: 'Successful placement' },
  ];

  const progressPercentage = useTransform(progressMotion, (value) => value * 100);

  return (
    <div className='relative min-h-72 w-full h-full flex items-center justify-center'>
      {/* Workflow Container */}
      <div className='relative w-full flex items-center justify-between'>
        {/* Progress Line */}
        <motion.div
          className='absolute top-1/2 mt-2 lg:mt-0 left-0 right-0 h-0.5 -translate-y-1/2 z-0'
          style={{
            background: useTransform(
              progressPercentage,
              (value) =>
                `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${value}%, hsl(var(--muted)) ${value}%, hsl(var(--muted)) 100%)`
            ),
          }}
        />

        {/* Workflow Steps with Labels */}
        <div className='w-full relative flex items-center justify-between z-10'>
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index <= visualActiveStage;

            return (
              <div key={stage.title} className='flex flex-col items-center'>
                <div className='relative mb-8'>
                  {/* Stage Circle */}
                  <motion.div
                    className='w-16 h-16 rounded-full flex items-center justify-center shadow-lg'
                    animate={{
                      backgroundColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                      scale: isActive ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <motion.div
                      animate={{
                        color: isActive ? 'white' : 'hsl(var(--muted-foreground))',
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <Icon />
                    </motion.div>
                  </motion.div>
                </div>
                <div className='text-center'>
                  <h4 className='font-semibold text-base text-foreground'>{stage.title}</h4>
                  <p className='text-sm text-muted-foreground mt-1'>{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ATS_LOGOS = [
  { name: 'ashby.png' },
  { name: 'bamboohr.png' },
  { name: 'gem.jpeg' },
  { name: 'greenhouse.jpeg' },
  { name: 'lever.png' },
  { name: 'workday.jpeg' },
  { name: 'workable.jpeg' },
  { name: 'pinpoint.png' },
  { name: 'breezyhr.jpeg' },
  { name: 'manatal.jpeg' },
  { name: 'jazzhr.jpeg' },
] as const;

const IntegrationsVisual = () => {
  const duration = 75;
  const iconSize = 32;
  const radius = 75;
  const secondRadius = 150;

  return (
    <div className='relative min-h-72 h-full w-full mx-auto overflow-hidden flex items-center justify-center'>
      {/* Show only top 75% of the circle by clipping the bottom */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          version='1.1'
          className='pointer-events-none absolute inset-0 size-full'
        >
          <circle className='stroke-black/10 stroke-1' cx='50%' cy='50%' r={radius} fill='none' />
        </svg>

        <svg
          xmlns='http://www.w3.org/2000/svg'
          version='1.1'
          className='pointer-events-none absolute inset-0 size-full'
        >
          <circle
            className='stroke-black/10 stroke-1'
            cx='50%'
            cy='50%'
            r={secondRadius}
            fill='none'
          />
        </svg>
      </div>

      {/* Centered logo */}
      <div
        className='absolute h-12 w-12 bg-primary rounded-full shadow-sm flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10'
        style={{
          left: '50%',
          top: '50%',
        }}
      >
        <Logo className='text-white h-6 w-6' />
      </div>

      {ATS_LOGOS.slice(0, 5).map((logo, index) => {
        const angle = (360 / (ATS_LOGOS.length - 6)) * index;
        return (
          <div
            key={logo.name}
            style={
              {
                '--duration': duration,
                '--radius': radius,
                '--angle': angle,
                '--icon-size': `${iconSize}px`,
              } as React.CSSProperties
            }
            className='absolute flex size-[var(--icon-size)] transform-gpu animate-orbit items-center justify-center rounded-full bg-white shadow-sm'
          >
            <img
              src={`/ats-logos/${logo.name}`}
              alt={logo.name}
              className='h-full w-full object-contain rounded-full'
            />
          </div>
        );
      })}

      {ATS_LOGOS.slice(5).map((logo, index) => {
        const angle = (360 / (ATS_LOGOS.length - 5)) * index;
        return (
          <div
            key={logo.name}
            style={
              {
                '--duration': duration,
                '--radius': secondRadius,
                '--angle': angle,
                '--icon-size': `${iconSize}px`,
              } as React.CSSProperties
            }
            className='absolute flex size-[var(--icon-size)] transform-gpu animate-orbit items-center justify-center rounded-full bg-white shadow-sm'
          >
            <img
              src={`/ats-logos/${logo.name}`}
              alt={logo.name}
              className='h-full w-full object-contain rounded-full'
            />
          </div>
        );
      })}
    </div>
  );
};

const SECOND_SECTION_FEATURES: {
  title: string;
  description: string;
  visual: ReactNode;
}[] = [
  {
    title: 'Complete Technical Hiring Flow',
    description:
      'Guide candidates through your entire evaluation process from automated screening to take-home projects to live interviews, all tracked in one platform.',
    visual: <WorkflowVisual />,
  },
  {
    title: 'Integrate With Your Favorite Tools',
    description:
      'Connect with Greenhouse, Lever, Workday, and 20+ other ATS platforms. Candidate data syncs automatically with no manual entry or workflow disruption.',
    visual: <IntegrationsVisual />,
  },
];

export const LandingWorkflow = () => {
  return (
    <section id='workflow' className='w-full pt-10 border-t border-border/50'>
      <div className='w-full px-6 pb-10 border-b border-border/50'>
        <div className='flex flex-col items-center gap-1'>
          <h2 className='text-3xl font-semibold'>End-to-End Technical Hiring</h2>
          <p className='text-muted-foreground w-1/2 text-center'>
            Handle every step of technical evaluation without switching tools or breaking your
            existing process.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2'>
        {SECOND_SECTION_FEATURES.map((feature, index) => (
          <Card
            key={feature.title}
            className={cx(
              'p-6 h-full rounded-none shadow-none border-t-0 border-border/50',
              index === 0 ? 'border-l-0' : 'border-x-0'
            )}
          >
            <div className='flex flex-col items-start justify-between gap-6 h-full'>
              <div className='h-full w-full flex-1'>{feature.visual}</div>
              <div className='w-full mt-auto'>
                <CardHeader className='p-0 space-y-0'>
                  <CardTitle className='text-lg font-semibold'>{feature.title}</CardTitle>
                  <CardDescription className='text-sm'>{feature.description}</CardDescription>
                </CardHeader>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
