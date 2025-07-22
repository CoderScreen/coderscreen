import { Card, CardHeader, CardTitle, CardDescription } from '@coderscreen/ui/card';
import { RiCheckLine } from '@remixicon/react';

const FEATURES = [
  {
    title: 'Real-time Collaboration',
    description: 'Work together with candidates in a live coding environment.',
  },
  {
    title: 'Intuitive Design',
    description: 'Minimal, distraction-free interface for focused interviews.',
  },
  {
    title: 'Multi-language Support',
    description: 'Run code in Python, JavaScript, C++, Java, Go, and more.',
  },
  {
    title: 'Seamless Assessment',
    description: 'Built-in tools for interviewers to evaluate and take notes.',
  },
];

export const LandingFeatures = () => {
  return (
    <section className='w-full py-10 px-4 border-y border-border/50'>
      <h2 className='text-3xl font-bold text-center mb-8'>Features</h2>
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-6'>
        {FEATURES.map((feature) => (
          <Card key={feature.title} className='flex flex-row items-start gap-4 p-6 w-full'>
            <span className='mt-1 text-primary'>
              <RiCheckLine className='size-6' aria-hidden='true' />
            </span>
            <div>
              <CardHeader className='p-0 mb-1'>
                <CardTitle className='text-lg font-semibold'>{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription className='text-muted-foreground'>
                {feature.description}
              </CardDescription>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default LandingFeatures;
