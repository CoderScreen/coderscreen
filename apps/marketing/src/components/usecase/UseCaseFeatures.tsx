import { UseCaseData } from '@/lib/personaConfig';

interface UseCaseFeaturesProps {
  data: UseCaseData;
}

export const UseCaseFeatures = ({ data }: UseCaseFeaturesProps) => {
  return (
    <section className='py-16 px-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>{data.features.title}</h2>
        </div>

        <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
          {data.features.items.map((item) => (
            <div key={item.title} className='p-6 border border-gray-200 rounded-lg'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>{item.title}</h3>
              <p className='text-gray-600 leading-relaxed'>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
