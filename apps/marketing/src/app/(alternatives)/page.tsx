import { Button } from '@coderscreen/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@coderscreen/ui/card';
import { RiArrowRightLine } from '@remixicon/react';
import Link from 'next/link';
import { competitorData } from '@/lib/AlternativeConfig';

export default function AlternativePage() {
  const competitors = Object.values(competitorData);

  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-border/50 border-y-0'>
      <div className='py-20 px-6'>
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold mb-6'>CoderScreen vs Competitors</h1>
          <p className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto'>
            See how CoderScreen compares to other technical interview platforms. Get more features,
            better experience, and competitive pricing.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto'>
          {competitors.map((competitor) => (
            <Card key={competitor.name} className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <CardTitle className='text-xl'>{competitor.displayName}</CardTitle>
                <CardDescription className='text-sm'>{competitor.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/Alternative/${competitor.name}`}>
                  <Button className='w-full'>
                    Compare with CoderScreen
                    <RiArrowRightLine className='ml-2 h-4 w-4' />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='text-center mt-16'>
          <div className='bg-primary/5 border border-primary/20 rounded-xl p-8 max-w-2xl mx-auto'>
            <h2 className='text-2xl font-bold mb-4'>Ready to see the difference?</h2>
            <p className='text-muted-foreground mb-6'>
              Try CoderScreen free for 14 days and experience the future of technical interviews.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='https://app.coderscreen.com/register'>
                <Button size='lg' className='px-8'>
                  Start free trial
                </Button>
              </Link>
              <Link href='https://cal.com/rogutkuba/coderscreen-demo'>
                <Button variant='outline' size='lg' className='px-8'>
                  Book a demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
