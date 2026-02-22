import Link from 'next/link';
import { personaData } from '@/lib/personaConfig';
import { roleData } from '@/lib/roleConfig';

interface UseCaseLinksProps {
  currentSlug: string;
  type: 'persona' | 'role';
}

export const UseCaseLinks = ({ currentSlug, type }: UseCaseLinksProps) => {
  const otherPersonas = Object.values(personaData).filter((p) => p.slug !== currentSlug);
  const otherRoles = Object.values(roleData).filter((r) => r.slug !== currentSlug);

  return (
    <section className='py-12 px-6 border-t border-gray-200'>
      <div className='max-w-4xl mx-auto'>
        {type === 'persona' ? (
          <>
            <h2 className='text-2xl font-bold text-center mb-8'>Explore by role</h2>
            <div className='grid sm:grid-cols-3 gap-4'>
              {Object.values(roleData).map((role) => (
                <Link
                  key={role.slug}
                  href={`/hire/${role.slug}`}
                  className='block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
                >
                  <span className='font-medium text-gray-900'>Hire {role.displayName}</span>
                </Link>
              ))}
            </div>

            {otherPersonas.length > 0 && (
              <>
                <h3 className='text-xl font-bold text-center mt-10 mb-6'>Other use cases</h3>
                <div className='grid sm:grid-cols-3 gap-4'>
                  {otherPersonas.map((persona) => (
                    <Link
                      key={persona.slug}
                      href={`/for/${persona.slug}`}
                      className='block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
                    >
                      <span className='font-medium text-gray-900'>
                        CoderScreen for {persona.displayName}
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h2 className='text-2xl font-bold text-center mb-8'>Explore by team type</h2>
            <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-4'>
              {Object.values(personaData).map((persona) => (
                <Link
                  key={persona.slug}
                  href={`/for/${persona.slug}`}
                  className='block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
                >
                  <span className='font-medium text-gray-900'>
                    CoderScreen for {persona.displayName}
                  </span>
                </Link>
              ))}
            </div>

            {otherRoles.length > 0 && (
              <>
                <h3 className='text-xl font-bold text-center mt-10 mb-6'>Hire other roles</h3>
                <div className='grid sm:grid-cols-3 gap-4'>
                  {otherRoles.map((role) => (
                    <Link
                      key={role.slug}
                      href={`/hire/${role.slug}`}
                      className='block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
                    >
                      <span className='font-medium text-gray-900'>Hire {role.displayName}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className='text-center mt-8'>
          <Link href='/blog' className='text-blue-600 hover:text-blue-800 font-medium'>
            Read our blog for more technical hiring insights →
          </Link>
        </div>
      </div>
    </section>
  );
};
