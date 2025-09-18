import { RiCheckLine, RiCloseLine } from '@remixicon/react';
import { CompetitorData, FeatureComparison } from '@/lib/alternativeConfig';
import { cx } from '@/lib/utils';

// Reusable class constants for DRY principle
const ROW_CLASSES = 'p-6 border-b border-gray-200 flex items-center';
const LAST_ROW_CLASSES = 'p-6 flex items-center';
const FEATURE_TEXT_CLASSES = 'text-gray-500 font-medium text-sm';
const HEADER_TEXT_CLASSES = 'text-lg font-medium text-gray-500';

interface AlternativeComparisonProps {
  competitor: CompetitorData;
}

// Function to sort features: Open Source first, then core features, then others
const sortFeatures = (features: FeatureComparison[]): FeatureComparison[] => {
  return features.sort((a, b) => {
    // Open Source always first
    if (a.name === 'Open Source') return -1;
    if (b.name === 'Open Source') return 1;

    // Core features next
    if (a.isCoreFeature && !b.isCoreFeature) return -1;
    if (!a.isCoreFeature && b.isCoreFeature) return 1;

    // If both are core features or both are not, maintain original order
    return 0;
  });
};

export const AlternativeComparison = ({ competitor }: AlternativeComparisonProps) => {
  const sortedFeatures = sortFeatures(competitor.comparison.features);

  return (
    <section className='py-12'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Compare CoderScreen to {competitor.displayName}
          </h2>
          <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>
            See how CoderScreen compares to {competitor.displayName} across key features and
            capabilities.
          </p>
        </div>

        <div className='max-w-4xl mx-auto'>
          {/* Header Row */}
          <div className='grid grid-cols-3 gap-0 mb-0 border-b border-gray-200'>
            {/* Features Column Header */}
            <div className='bg-transparent p-6 flex items-center'>
              <h3 className={HEADER_TEXT_CLASSES}>Features</h3>
            </div>

            {/* CoderScreen Column Header - Card Style */}
            <div className='bg-gray-100 p-6 text-center flex items-center justify-center'>
              <h3 className={cx(HEADER_TEXT_CLASSES, 'text-black')}>CoderScreen</h3>
            </div>

            {/* Competitor Column Header */}
            <div className='bg-transparent p-6 text-center flex items-center justify-center'>
              <h3 className={HEADER_TEXT_CLASSES}>{competitor.displayName}</h3>
            </div>
          </div>

          {/* Feature Rows */}
          <div className='grid grid-cols-3 gap-0'>
            {/* Features Column */}
            <div className='bg-transparent'>
              {sortedFeatures.map((feature, index) => {
                const isLast = index === sortedFeatures.length - 1;
                return (
                  <div key={feature.name} className={isLast ? LAST_ROW_CLASSES : ROW_CLASSES}>
                    <span className={FEATURE_TEXT_CLASSES}>{feature.name}</span>
                  </div>
                );
              })}
            </div>

            {/* CoderScreen Column - Card Style */}
            <div className='bg-gray-100'>
              {sortedFeatures.map((feature, index) => {
                const isLast = index === sortedFeatures.length - 1;
                return (
                  <div
                    key={feature.name}
                    className={`${isLast ? LAST_ROW_CLASSES : ROW_CLASSES} justify-center`}
                  >
                    {feature.coderScreenHas ? (
                      <RiCheckLine className='h-5 w-5 text-green-500' />
                    ) : (
                      <RiCloseLine className='h-5 w-5 text-red-300' />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Competitor Column */}
            <div className='bg-transparent'>
              {sortedFeatures.map((feature, index) => {
                const isLast = index === sortedFeatures.length - 1;
                return (
                  <div
                    key={feature.name}
                    className={`${isLast ? LAST_ROW_CLASSES : ROW_CLASSES} justify-center`}
                  >
                    {feature.competitorHas ? (
                      <RiCheckLine className='h-5 w-5 text-green-400' />
                    ) : (
                      <RiCloseLine className='h-5 w-5 text-red-300' />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
