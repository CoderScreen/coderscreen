import type { RoundupPage } from '@/lib/roundupConfig';
import { toolsDatabase } from '@/lib/toolsDatabase';
import { cx } from '@/lib/utils';
import { RoundupSectionHeader } from './RoundupSectionHeader';
import { ToolLogo } from './ToolLogo';

interface RoundupTableProps {
  roundup: RoundupPage;
}

const TH =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const TD = 'px-4 py-4 text-sm text-foreground align-middle';

export const RoundupTable = ({ roundup }: RoundupTableProps) => {
  const tools = roundup.toolSlugs.map((slug) => toolsDatabase[slug]).filter(Boolean);

  return (
    <section>
      <RoundupSectionHeader
        title={`At a glance: the best ${roundup.competitorName} alternatives`}
        subtitle='A quick comparison before the detailed reviews below.'
      />

      <div className='px-6 pb-20'>
        <div className='max-w-5xl mx-auto overflow-x-auto border'>
          <table className='w-full min-w-[720px] border-collapse'>
            <thead>
              <tr className='bg-gray-100 border-b'>
                <th className={TH}>Tool</th>
                <th className={TH}>Best for</th>
                <th className={TH}>Rating</th>
                <th className={TH}>Starting price</th>
                <th className={TH}>Free option</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr
                  key={tool.slug}
                  className={cx('border-t first:border-t-0', tool.isUs && 'bg-gray-50')}
                >
                  <td className={TD}>
                    <div className='flex items-center gap-3'>
                      <ToolLogo tool={tool} className='size-9' />
                      <div className='leading-tight'>
                        <div className='font-semibold text-foreground'>{tool.name}</div>
                        {tool.isUs && (
                          <div className='text-xs font-medium uppercase tracking-wider text-primary'>
                            Our pick
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={cx(TD, 'text-muted-foreground max-w-xs')}>{tool.bestForTag}</td>
                  <td className={TD}>
                    {tool.rating ? (
                      <span className='whitespace-nowrap font-medium'>
                        {tool.rating.score.toFixed(1)}
                        <span className='text-muted-foreground font-normal'> / 5</span>
                      </span>
                    ) : (
                      <span className='text-muted-foreground'>{tool.isUs ? 'New' : '—'}</span>
                    )}
                  </td>
                  <td className={cx(TD, 'whitespace-nowrap font-medium')}>{tool.startingPrice}</td>
                  <td className={cx(TD, 'text-muted-foreground')}>{tool.freeOption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
