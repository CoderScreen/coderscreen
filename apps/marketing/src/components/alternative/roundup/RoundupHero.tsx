import { Button } from '@coderscreen/ui/button';
import { RiArrowRightLine, RiGithubLine, RiStarFill } from '@remixicon/react';
import { HeroBg } from '@/components/landing/HeroBg';
import type { RoundupPage } from '@/lib/roundupConfig';
import { siteConfig } from '@/lib/siteConfig';
import { toolsDatabase } from '@/lib/toolsDatabase';
import { cx } from '@/lib/utils';
import { ToolLogo } from './ToolLogo';

interface RoundupHeroProps {
  roundup: RoundupPage;
}

const LeaderboardCard = ({ roundup }: RoundupHeroProps) => {
  const tools = roundup.toolSlugs.map((slug) => toolsDatabase[slug]).filter(Boolean);

  return (
    <div className='border bg-background shadow-sm'>
      <div className='flex items-center justify-between px-5 py-3 border-b bg-gray-50'>
        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          Our 2026 ranking
        </span>
        <span className='text-xs text-muted-foreground'>{tools.length} compared</span>
      </div>

      <ul>
        {tools.map((tool, index) => (
          <li
            key={tool.slug}
            className={cx(
              'flex items-center gap-3 px-5 py-3 border-b last:border-b-0',
              tool.isUs && 'bg-gray-50'
            )}
          >
            <span className='w-4 text-sm font-semibold text-muted-foreground tabular-nums'>
              {index + 1}
            </span>
            <ToolLogo tool={tool} className='size-8' />
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-foreground truncate'>{tool.name}</span>
                {tool.isUs && (
                  <span className='inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary'>
                    <RiStarFill className='size-2.5' />
                    Our pick
                  </span>
                )}
              </div>
            </div>
            <span className='text-sm font-medium text-foreground shrink-0'>
              {tool.rating ? (
                <>
                  {tool.rating.score.toFixed(1)}
                  <span className='text-muted-foreground font-normal'> / 5</span>
                </>
              ) : (
                <span className='text-muted-foreground font-normal'>{tool.isUs ? 'New' : '—'}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const RoundupHero = ({ roundup }: RoundupHeroProps) => {
  return (
    <div className='relative overflow-hidden border-b'>
      <div className='absolute inset-0 pointer-events-none'>
        <HeroBg />
      </div>

      <section className='relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
          {/* Left: copy */}
          <div>
            <h1 className='text-4xl md:text-5xl font-bold leading-tight mb-5'>
              {roundup.hero.title}
            </h1>
            <p className='text-lg text-muted-foreground leading-relaxed mb-8'>
              {roundup.hero.intro}
            </p>
            <div className='flex flex-col sm:flex-row gap-4'>
              <a href={siteConfig.external.getStarted}>
                <Button
                  icon={RiArrowRightLine}
                  iconPosition='right'
                  variant='primary'
                  className='px-6 py-2 text-base font-semibold'
                >
                  Try CoderScreen for free
                </Button>
              </a>
              <a href={siteConfig.external.githubRepo}>
                <Button
                  icon={RiGithubLine}
                  variant='secondary'
                  className='px-6 py-2 text-base font-semibold'
                >
                  Star us on GitHub
                </Button>
              </a>
            </div>
          </div>

          {/* Right: ranked shortlist */}
          <div className='lg:pl-4'>
            <LeaderboardCard roundup={roundup} />
          </div>
        </div>
      </section>
    </div>
  );
};
