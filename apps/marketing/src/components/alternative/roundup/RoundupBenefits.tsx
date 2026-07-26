import { RiCheckboxCircleLine } from '@remixicon/react';
import type { RoundupPage } from '@/lib/roundupConfig';
import { RoundupSectionHeader } from './RoundupSectionHeader';

interface RoundupBenefitsProps {
  roundup: RoundupPage;
}

export const RoundupBenefits = ({ roundup }: RoundupBenefitsProps) => {
  return (
    <section>
      <RoundupSectionHeader title={roundup.benefits.title} />

      <div className='px-6 pb-20'>
        <div className='max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 border-l border-t'>
          {roundup.benefits.items.map((item) => (
            <div key={item.title} className='border-r border-b p-6'>
              <RiCheckboxCircleLine className='size-5 text-primary mb-3' aria-hidden='true' />
              <h3 className='text-base font-semibold text-foreground mb-1.5'>{item.title}</h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
