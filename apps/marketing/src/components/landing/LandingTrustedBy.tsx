import Image from 'next/image';

const TRUSTED_COMPANIES: {
  name: string;
  logo: string;
}[] = [
  {
    name: 'Afore Capital',
    logo: '/afore.png',
  },
  {
    name: 'Slash',
    logo: '/slash.png',
  },
  {
    name: 'AWS',
    logo: '/aws-logo.svg', // You'll need to add this logo file
  },
];

// NEED TO COMPLETE THIS
export const LandingTrustedBy = () => {
  return (
    <section className='w-full p-6 flex flex-col justify-center items-center gap-4'>
      <h4 className='text-xl font-semibold text-muted-foreground'>Built by engineers from</h4>

      <div className='w-full grid grid-cols-1 lg:grid-cols-3'>
        {TRUSTED_COMPANIES.map((company) => (
          <div key={company.name} className='flex items-center justify-center'>
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              className='h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity'
            />
          </div>
        ))}
      </div>
    </section>
  );
};
