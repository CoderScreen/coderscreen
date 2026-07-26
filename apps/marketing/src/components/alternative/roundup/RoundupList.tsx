import type { RoundupPage } from '@/lib/roundupConfig';
import { toolsDatabase } from '@/lib/toolsDatabase';
import { RoundupSectionHeader } from './RoundupSectionHeader';
import { ToolCard } from './ToolCard';

interface RoundupListProps {
  roundup: RoundupPage;
}

export const RoundupList = ({ roundup }: RoundupListProps) => {
  const tools = roundup.toolSlugs.map((slug) => toolsDatabase[slug]).filter(Boolean);

  return (
    <section>
      <RoundupSectionHeader
        title={`The ${tools.length} best ${roundup.competitorName} alternatives in 2026`}
        subtitle='Ranked and reviewed, with honest pros and cons for each.'
      />

      <div className='px-6 pb-20'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {tools.map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} rank={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
};
