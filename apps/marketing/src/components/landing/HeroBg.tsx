export const HeroBg2 = () => {
  const radius = 500;

  const colorVal = 150;
  const color = `rgba(${colorVal},${colorVal},${colorVal},0.12)`;
  const color2 = `rgba(${colorVal},${colorVal},${colorVal},0.08)`;

  return (
    <div className='h-[60vh] w-full relative'>
      {/* <svg
        xmlns='http://www.w3.org/2000/svg'
        version='1.1'
        className='pointer-events-none absolute inset-0 size-full'
      >
        <circle className='stroke-black/10 stroke-1' cx='50%' cy='50%' r={radius} fill='none' />
        <circle
          className='stroke-black/10 stroke-1'
          cx='50%'
          cy='50%'
          r={radius / 1.25}
          fill='none'
        />
        <circle className='stroke-black/10 stroke-1' cx='50%' cy='50%' r={radius / 2} fill='none' />
      </svg> */}

      <div
        className='h-[500px] w-[500px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        style={{
          boxShadow: `inset 0 0 20px 0 ${color}, inset 0 0 0 1px ${color2}`,
        }}
      />

      <div
        className='h-[750px] w-[750px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        style={{
          boxShadow: `inset 0 0 20px 0 ${color}, inset 0 0 0 1px ${color2}`,
        }}
      />

      <div
        className='h-[1000px] w-[1000px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        style={{
          boxShadow: `inset 0 0 20px 0 ${color}, inset 0 0 0 1px ${color2}`,
        }}
      />
    </div>
  );
};

export const HeroBg = () => {
  return (
    <div className='h-full w-full relative'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 100 100'
        className='absolute inset-0 w-full h-full'
        preserveAspectRatio='none'
      >
        {/* Grid pattern definition */}
        <defs>
          <pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'>
            <path d='M 10 0 L 0 0 0 10' fill='none' stroke='rgba(0,0,0,0.05)' strokeWidth='0.2' />
          </pattern>
        </defs>

        {/* Grid background with padding from edges */}
        <rect x='0.1' y='0.1' width='99.8' height='99.8' fill='url(#grid)' />

        {/* Optional: Add a subtle radial gradient overlay for depth */}
        <radialGradient id='overlay' cx='50%' cy='50%' r='50%'>
          <stop offset='50%' stopColor='rgba(255,255,255,1)' />
          <stop offset='100%' stopColor='rgba(255,255,255,0)' />
        </radialGradient>
        <rect width='100' height='100' fill='url(#overlay)' />
      </svg>
    </div>
  );
};
