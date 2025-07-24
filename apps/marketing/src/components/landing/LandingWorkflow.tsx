import { Logo } from '@/components/common/Logo';
import { cx } from '@/lib/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@coderscreen/ui/card';
import { ReactNode } from 'react';

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
    <div className='relative min-h-50 h-full w-full mx-auto overflow-hidden flex items-center justify-center'>
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
        <Logo className='text-white' />
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
    visual: null,
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
    <section className='w-full py-10  '>
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
