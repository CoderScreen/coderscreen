import type { RoundupPage } from '@/lib/roundupConfig';
import { RoundupSectionHeader } from './RoundupSectionHeader';

interface FeaturesToLookForProps {
  roundup: RoundupPage;
}

const TH =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const TD = 'px-4 py-4 text-sm align-top';

export const FeaturesToLookFor = ({ roundup }: FeaturesToLookForProps) => {
  return (
    <section>
      <RoundupSectionHeader
        title='Features to look for when comparing providers'
        subtitle='Not every team needs every feature. Here is what each one does and why it might matter.'
      />

      <div className='px-6 pb-20'>
        <div className='max-w-5xl mx-auto overflow-x-auto border'>
          <table className='w-full min-w-[640px] border-collapse'>
            <thead>
              <tr className='bg-gray-100 border-b'>
                <th className={TH}>Feature</th>
                <th className={TH}>What it does</th>
                <th className={TH}>Why it matters</th>
              </tr>
            </thead>
            <tbody>
              {roundup.featuresToLookFor.map((row) => (
                <tr key={row.feature} className='border-t first:border-t-0'>
                  <td className={`${TD} font-medium text-foreground whitespace-nowrap`}>
                    {row.feature}
                  </td>
                  <td className={`${TD} text-foreground`}>{row.whatItDoes}</td>
                  <td className={`${TD} text-muted-foreground`}>{row.whyItMatters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
