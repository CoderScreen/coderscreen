export const HeroBg = () => {
  return (
    <div className='h-full w-full relative'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 100 100'
        className='absolute inset-0 w-full h-full'
        preserveAspectRatio='none'
      >
        <title>Hero Background</title>
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
