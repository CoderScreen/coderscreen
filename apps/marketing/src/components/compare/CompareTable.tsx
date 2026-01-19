import { RiCheckLine, RiCloseLine } from '@remixicon/react';
import { ComparisonData } from '@/lib/comparisonConfig';

interface CompareTableProps {
  comparison: ComparisonData;
}

const renderFeatureValue = (value: string | boolean) => {
  if (typeof value === 'boolean') {
    return value ? (
      <RiCheckLine className='h-4 w-4 text-foreground' />
    ) : (
      <RiCloseLine className='h-4 w-4 text-muted-foreground/50' />
    );
  }
  return <span className='text-sm'>{value}</span>;
};

export const CompareTable = ({ comparison }: CompareTableProps) => {
  const features = comparison.comparison.features;

  return (
    <section className='py-16 border-b border-border/50'>
      <div className='container mx-auto px-6'>
        <div className='max-w-4xl mx-auto mb-10'>
          <h2 className='text-3xl font-semibold mb-4'>Feature Comparison</h2>
          <p className='text-muted-foreground'>
            How {comparison.toolA.displayName}, {comparison.toolB.displayName}, and CoderScreen
            compare across key features.
          </p>
        </div>

        <div className='max-w-4xl mx-auto overflow-x-auto'>
          <table className='w-full min-w-[600px]'>
            <thead>
              <tr className='border-b border-border/50'>
                <th className='text-left py-4 pr-4 text-sm font-medium text-muted-foreground'>
                  Feature
                </th>
                <th className='text-center py-4 px-4 text-sm font-medium text-muted-foreground'>
                  {comparison.toolA.displayName}
                </th>
                <th className='text-center py-4 px-4 text-sm font-medium text-muted-foreground'>
                  {comparison.toolB.displayName}
                </th>
                <th className='text-center py-4 pl-4 text-sm font-medium'>CoderScreen</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={index !== features.length - 1 ? 'border-b border-border/50' : ''}
                >
                  <td className='py-4 pr-4 text-sm'>{feature.name}</td>
                  <td className='py-4 px-4 text-center'>
                    <div className='flex justify-center'>{renderFeatureValue(feature.toolA)}</div>
                  </td>
                  <td className='py-4 px-4 text-center'>
                    <div className='flex justify-center'>{renderFeatureValue(feature.toolB)}</div>
                  </td>
                  <td className='py-4 pl-4 text-center'>
                    <div className='flex justify-center'>
                      {renderFeatureValue(feature.coderScreen)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
