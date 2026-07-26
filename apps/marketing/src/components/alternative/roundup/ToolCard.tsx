import { Button } from '@coderscreen/ui/button';
import {
  RiArrowRightLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiStarFill,
  RiSubtractLine,
} from '@remixicon/react';
import { siteConfig } from '@/lib/siteConfig';
import type { ToolProfile } from '@/lib/toolsDatabase';
import { cx } from '@/lib/utils';
import { ToolLogo } from './ToolLogo';

interface ToolCardProps {
  tool: ToolProfile;
  rank: number;
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className='text-xs uppercase tracking-wider text-muted-foreground mb-1'>{label}</div>
    <div className='text-sm font-medium text-foreground'>{value}</div>
  </div>
);

export const ToolCard = ({ tool, rank }: ToolCardProps) => {
  return (
    <div className={cx('border p-6 md:p-8', tool.isUs ? 'border-primary' : 'border-gray-200')}>
      {/* Header */}
      <div className='flex items-start justify-between gap-4 mb-6'>
        <div className='flex items-start gap-4'>
          <ToolLogo tool={tool} className='size-12' />
          <div>
            <div className='flex items-center gap-2 mb-0.5'>
              <span className='text-sm font-medium text-muted-foreground'>#{rank}</span>
              <h3 className='text-xl font-bold text-foreground'>{tool.name}</h3>
              {tool.isUs && (
                <span className='inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary'>
                  <RiStarFill className='size-3' />
                  Our pick
                </span>
              )}
            </div>
            <p className='text-sm text-muted-foreground'>{tool.bestForTag}</p>
          </div>
        </div>
        {tool.rating && (
          <div className='text-right shrink-0'>
            <div className='text-xl font-bold text-foreground'>{tool.rating.score.toFixed(1)}</div>
            <div className='text-xs text-muted-foreground'>
              {tool.rating.source}
              {tool.rating.count ? ` · ${tool.rating.count}+` : ''}
            </div>
          </div>
        )}
      </div>

      {/* Stat row */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y'>
        <Stat label='Starting price' value={tool.startingPrice} />
        <Stat label='Free option' value={tool.freeOption} />
        <Stat label='Ideal for' value={tool.idealTeamSize} />
      </div>

      {/* Key features */}
      <div className='py-6 border-b'>
        <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
          Key features
        </h4>
        <ul className='grid sm:grid-cols-2 gap-x-6 gap-y-2'>
          {tool.keyFeatures.map((feature) => (
            <li key={feature} className='flex items-start gap-2 text-sm text-foreground'>
              <RiCheckLine className='size-4 text-emerald-600 shrink-0 mt-0.5' />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pros / cons */}
      <div className='grid sm:grid-cols-2 gap-x-8 gap-y-6 py-6'>
        <div>
          <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
            Pros
          </h4>
          <ul className='space-y-2'>
            {tool.pros.map((pro) => (
              <li key={pro} className='flex items-start gap-2 text-sm text-foreground'>
                <RiCheckLine className='size-4 text-emerald-600 shrink-0 mt-0.5' />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
            Cons
          </h4>
          <ul className='space-y-2'>
            {tool.cons.map((con) => (
              <li key={con} className='flex items-start gap-2 text-sm text-muted-foreground'>
                <RiSubtractLine className='size-4 text-gray-400 shrink-0 mt-0.5' />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best for + CTA */}
      <div className='pt-6 border-t'>
        <p className='text-sm text-muted-foreground leading-relaxed mb-4'>
          <span className='font-semibold text-foreground'>Best for: </span>
          {tool.bestForParagraph}
        </p>
        {tool.isUs ? (
          <a href={siteConfig.external.getStarted}>
            <Button icon={RiArrowRightLine} iconPosition='right' variant='primary'>
              Get started for free
            </Button>
          </a>
        ) : (
          tool.website && (
            <a href={tool.website} target='_blank' rel='noopener noreferrer nofollow'>
              <Button icon={RiExternalLinkLine} iconPosition='right' variant='secondary'>
                Visit {tool.name}
              </Button>
            </a>
          )
        )}
      </div>
    </div>
  );
};
