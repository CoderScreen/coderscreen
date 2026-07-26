import type { RoundupPage } from '@/lib/roundupConfig';
import { RoundupSectionHeader } from './RoundupSectionHeader';

interface BuyingGuideProps {
  roundup: RoundupPage;
}

export const BuyingGuide = ({ roundup }: BuyingGuideProps) => {
  return (
    <section>
      <RoundupSectionHeader
        title={`How to choose the right ${roundup.competitorName} alternative`}
        subtitle='The best fit depends on your team size and how you hire. Here is where each option tends to make sense.'
      />

      <div className='px-6 pb-20'>
        <div className='max-w-5xl mx-auto grid sm:grid-cols-2 border-l border-t'>
          {roundup.buyingGuide.map((segment) => (
            <div key={segment.segment} className='border-r border-b p-8'>
              <h3 className='text-base font-semibold text-foreground mb-2'>{segment.segment}</h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>{segment.advice}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
