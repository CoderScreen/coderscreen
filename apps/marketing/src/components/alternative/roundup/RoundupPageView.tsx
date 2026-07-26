import { MarketingCTA } from '@/components/common/MarketingCTA';
import { competitorData } from '@/lib/alternativeConfig';
import type { RoundupPage } from '@/lib/roundupConfig';
import { AlternativeLinks } from '../AlternativeLinks';
import { BuyingGuide } from './BuyingGuide';
import { FeaturesToLookFor } from './FeaturesToLookFor';
import { RoundupBenefits } from './RoundupBenefits';
import { RoundupFAQ } from './RoundupFAQ';
import { RoundupHero } from './RoundupHero';
import { RoundupList } from './RoundupList';
import { RoundupProse } from './RoundupProse';
import { RoundupTable } from './RoundupTable';
import { RoundupWhyUs } from './RoundupWhyUs';

interface RoundupPageViewProps {
  roundup: RoundupPage;
}

export const RoundupPageView = ({ roundup }: RoundupPageViewProps) => {
  // Reuse the existing cross-link section when a matching competitor entry exists.
  const competitor = competitorData[roundup.slug];

  return (
    <div className='min-h-screen max-w-6xl mx-auto border border-y-0'>
      <RoundupHero roundup={roundup} />
      <RoundupProse title={roundup.whatIs.title} paragraphs={roundup.whatIs.paragraphs} />
      <RoundupTable roundup={roundup} />
      <RoundupList roundup={roundup} />
      <FeaturesToLookFor roundup={roundup} />
      <BuyingGuide roundup={roundup} />
      <RoundupBenefits roundup={roundup} />
      <RoundupWhyUs roundup={roundup} />
      <RoundupProse
        title={roundup.methodology.title}
        paragraphs={roundup.methodology.paragraphs}
        muted
      />
      <RoundupFAQ roundup={roundup} />
      {competitor && <AlternativeLinks currentCompetitor={competitor} />}
      <MarketingCTA />
    </div>
  );
};
