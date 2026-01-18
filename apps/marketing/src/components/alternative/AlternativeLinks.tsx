import Link from 'next/link';
import { competitorData, CompetitorData } from '@/lib/alternativeConfig';

interface AlternativeLinksProps {
  currentCompetitor: CompetitorData;
}

export const AlternativeLinks = ({ currentCompetitor }: AlternativeLinksProps) => {
  const otherCompetitors = Object.values(competitorData).filter(
    (c) => c.slug !== currentCompetitor.slug
  );

  return (
    <section className='py-12 px-6 border-t border-gray-200'>
      <div className='max-w-4xl mx-auto'>
        <h2 className='text-2xl font-bold text-center mb-8'>Compare other alternatives</h2>
        <div className='grid sm:grid-cols-3 gap-4'>
          {otherCompetitors.map((competitor) => (
            <Link
              key={competitor.slug}
              href={`/${competitor.slug}`}
              className='block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
            >
              <span className='font-medium text-gray-900'>
                {competitor.displayName} Alternative
              </span>
              <span className='block text-sm text-gray-500 mt-1'>
                Compare CoderScreen vs {competitor.displayName}
              </span>
            </Link>
          ))}
        </div>
        <div className='text-center mt-8'>
          <Link href='/blog' className='text-blue-600 hover:text-blue-800 font-medium'>
            Read our blog for more technical hiring insights →
          </Link>
        </div>
      </div>
    </section>
  );
};
