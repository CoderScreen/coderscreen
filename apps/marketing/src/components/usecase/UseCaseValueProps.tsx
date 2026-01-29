import { RiCheckboxCircleLine } from '@remixicon/react';
import { UseCaseData } from '@/lib/personaConfig';

interface UseCaseValuePropsProps {
  data: UseCaseData;
}

export const UseCaseValueProps = ({ data }: UseCaseValuePropsProps) => {
  return (
    <section className='py-16 px-6 bg-gray-50'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>{data.valueProps.title}</h2>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {data.valueProps.items.map((item) => (
            <div key={item.title} className='bg-white rounded-lg p-6 shadow-sm'>
              <div className='flex items-start gap-3 mb-3'>
                <RiCheckboxCircleLine
                  className='h-6 w-6 text-green-500 flex-shrink-0 mt-0.5'
                  aria-hidden='true'
                />
                <h3 className='text-lg font-semibold text-gray-900'>{item.title}</h3>
              </div>
              <p className='text-gray-600 leading-relaxed'>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
