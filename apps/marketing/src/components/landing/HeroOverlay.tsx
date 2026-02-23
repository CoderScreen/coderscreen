export const HeroOverlay = () => {
  const s = 'white';

  return (
    <svg
      className='w-full h-full'
      viewBox='0 0 1200 800'
      preserveAspectRatio='xMidYMid slice'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
    >
      <title>Decorative geometric pattern</title>

      <style>
        {`
          @keyframes ho-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @keyframes ho-flow {
            to { stroke-dashoffset: -40; }
          }
          @keyframes ho-draw {
            from { stroke-dashoffset: 600; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes ho-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .ho-pulse-slow { animation: ho-pulse 6s ease-in-out infinite; }
          .ho-pulse-med  { animation: ho-pulse 4s ease-in-out infinite; }
          .ho-pulse-fast { animation: ho-pulse 3s ease-in-out infinite; }
          .ho-flow       { animation: ho-flow 3s linear infinite; }
          .ho-flow-slow  { animation: ho-flow 5s linear infinite; }
          .ho-draw       { animation: ho-draw 3s ease-out forwards; }
          .ho-draw-d1    { animation: ho-draw 2.5s ease-out 0.3s both; }
          .ho-draw-d2    { animation: ho-draw 2.5s ease-out 0.6s both; }
          .ho-draw-d3    { animation: ho-draw 2.5s ease-out 0.9s both; }
          .ho-fade-1     { animation: ho-fade-in 1.5s ease-out 0.2s both; }
          .ho-fade-2     { animation: ho-fade-in 1.5s ease-out 0.5s both; }
          .ho-fade-3     { animation: ho-fade-in 1.5s ease-out 0.8s both; }
          .ho-fade-4     { animation: ho-fade-in 1.5s ease-out 1.1s both; }
        `}
      </style>

      <defs>
        <filter id='ho-dither' x='0%' y='0%' width='100%' height='100%'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.65'
            numOctaves='3'
            stitchTiles='stitch'
            result='noise'
          />
          <feColorMatrix type='saturate' values='0' in='noise' result='gray-noise' />
          <feComponentTransfer in='gray-noise' result='threshold-noise'>
            <feFuncA type='discrete' tableValues='0 1' />
          </feComponentTransfer>
          <feComposite operator='in' in='SourceGraphic' in2='threshold-noise' />
        </filter>

        <filter id='ho-dither-soft' x='0%' y='0%' width='100%' height='100%'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.4'
            numOctaves='2'
            stitchTiles='stitch'
            result='noise'
          />
          <feColorMatrix type='saturate' values='0' in='noise' result='gray-noise' />
          <feComponentTransfer in='gray-noise' result='threshold-noise'>
            <feFuncA type='discrete' tableValues='0 0.3 1' />
          </feComponentTransfer>
          <feComposite operator='in' in='SourceGraphic' in2='threshold-noise' />
        </filter>
      </defs>

      {/* ============================================= */}
      {/* LEFT EDGE (x < 240)                           */}
      {/* ============================================= */}

      {/* Large squares — draw-in */}
      <rect
        x='30'
        y='30'
        width='140'
        height='140'
        stroke={s}
        strokeOpacity='0.15'
        strokeWidth='1'
        strokeDasharray='560'
        className='ho-draw-d1'
      />
      <rect
        x='50'
        y='200'
        width='100'
        height='100'
        stroke={s}
        strokeOpacity='0.12'
        strokeWidth='1'
        strokeDasharray='400'
        className='ho-draw-d2'
      />

      {/* Medium squares — fade-in */}
      <g className='ho-fade-1'>
        <rect
          x='20'
          y='350'
          width='80'
          height='80'
          stroke={s}
          strokeOpacity='0.12'
          strokeWidth='1'
        />
        <rect
          x='130'
          y='380'
          width='50'
          height='50'
          stroke={s}
          strokeOpacity='0.09'
          strokeWidth='1'
        />
      </g>
      <g className='ho-fade-2'>
        <rect
          x='60'
          y='480'
          width='70'
          height='70'
          stroke={s}
          strokeOpacity='0.1'
          strokeWidth='1'
        />
        <rect
          x='160'
          y='250'
          width='60'
          height='60'
          stroke={s}
          strokeOpacity='0.1'
          strokeWidth='1'
        />
      </g>

      {/* Small dithered squares */}
      <g filter='url(#ho-dither)' className='ho-fade-3'>
        <rect
          x='80'
          y='160'
          width='25'
          height='25'
          stroke={s}
          strokeOpacity='0.25'
          strokeWidth='1.5'
        />
        <rect
          x='190'
          y='120'
          width='20'
          height='20'
          stroke={s}
          strokeOpacity='0.22'
          strokeWidth='1.5'
        />
        <rect
          x='30'
          y='450'
          width='22'
          height='22'
          stroke={s}
          strokeOpacity='0.25'
          strokeWidth='1.5'
        />
        <rect
          x='170'
          y='500'
          width='18'
          height='18'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
        />
      </g>

      {/* Crosses — pulsing */}
      <g className='ho-pulse-slow'>
        <line x1='105' y1='290' x2='135' y2='290' stroke={s} strokeOpacity='0.2' strokeWidth='1' />
        <line x1='120' y1='275' x2='120' y2='305' stroke={s} strokeOpacity='0.2' strokeWidth='1' />
      </g>
      <g className='ho-pulse-fast'>
        <line x1='185' y1='440' x2='215' y2='440' stroke={s} strokeOpacity='0.18' strokeWidth='1' />
        <line x1='200' y1='425' x2='200' y2='455' stroke={s} strokeOpacity='0.18' strokeWidth='1' />
      </g>

      {/* Dots */}
      <g filter='url(#ho-dither)'>
        <circle cx='50' cy='250' r='3' fill={s} fillOpacity='0.3' className='ho-pulse-slow' />
        <circle cx='180' cy='180' r='3' fill={s} fillOpacity='0.25' className='ho-pulse-med' />
        <circle cx='100' cy='530' r='3' fill={s} fillOpacity='0.25' className='ho-pulse-fast' />
        <circle cx='220' cy='350' r='3' fill={s} fillOpacity='0.2' className='ho-pulse-slow' />
      </g>

      {/* Horizontal lines — flowing dashes */}
      <line
        x1='0'
        y1='170'
        x2='240'
        y2='170'
        stroke={s}
        strokeOpacity='0.1'
        strokeWidth='1'
        strokeDasharray='8 12'
        className='ho-flow'
      />
      <line
        x1='0'
        y1='330'
        x2='220'
        y2='330'
        stroke={s}
        strokeOpacity='0.08'
        strokeWidth='1'
        strokeDasharray='6 14'
        className='ho-flow-slow'
      />
      <line
        x1='0'
        y1='560'
        x2='200'
        y2='560'
        stroke={s}
        strokeOpacity='0.08'
        strokeWidth='1'
        strokeDasharray='6 14'
        className='ho-flow'
      />

      {/* Vertical lines */}
      <line
        x1='120'
        y1='0'
        x2='120'
        y2='200'
        stroke={s}
        strokeOpacity='0.08'
        strokeWidth='1'
        strokeDasharray='6 14'
        className='ho-flow'
      />
      <line
        x1='200'
        y1='300'
        x2='200'
        y2='600'
        stroke={s}
        strokeOpacity='0.06'
        strokeWidth='1'
        strokeDasharray='4 16'
        className='ho-flow-slow'
      />

      {/* Diagonal */}
      <g filter='url(#ho-dither-soft)'>
        <line x1='0' y1='600' x2='200' y2='400' stroke={s} strokeOpacity='0.15' strokeWidth='1.5' />
      </g>

      {/* ============================================= */}
      {/* RIGHT EDGE (x > 960)                          */}
      {/* ============================================= */}

      {/* Large squares — draw-in */}
      <rect
        x='980'
        y='20'
        width='130'
        height='130'
        stroke={s}
        strokeOpacity='0.14'
        strokeWidth='1'
        strokeDasharray='520'
        className='ho-draw-d1'
      />
      <rect
        x='1050'
        y='180'
        width='100'
        height='100'
        stroke={s}
        strokeOpacity='0.12'
        strokeWidth='1'
        strokeDasharray='400'
        className='ho-draw-d2'
      />

      {/* Medium squares — fade-in */}
      <g className='ho-fade-1'>
        <rect
          x='1090'
          y='320'
          width='80'
          height='80'
          stroke={s}
          strokeOpacity='0.12'
          strokeWidth='1'
        />
        <rect
          x='1020'
          y='360'
          width='50'
          height='50'
          stroke={s}
          strokeOpacity='0.09'
          strokeWidth='1'
        />
      </g>
      <g className='ho-fade-3'>
        <rect
          x='1070'
          y='470'
          width='70'
          height='70'
          stroke={s}
          strokeOpacity='0.1'
          strokeWidth='1'
        />
        <rect
          x='980'
          y='230'
          width='60'
          height='60'
          stroke={s}
          strokeOpacity='0.1'
          strokeWidth='1'
        />
      </g>

      {/* Small dithered squares */}
      <g filter='url(#ho-dither)' className='ho-fade-3'>
        <rect
          x='1100'
          y='150'
          width='25'
          height='25'
          stroke={s}
          strokeOpacity='0.25'
          strokeWidth='1.5'
        />
        <rect
          x='990'
          y='130'
          width='20'
          height='20'
          stroke={s}
          strokeOpacity='0.22'
          strokeWidth='1.5'
        />
        <rect
          x='1140'
          y='430'
          width='22'
          height='22'
          stroke={s}
          strokeOpacity='0.25'
          strokeWidth='1.5'
        />
        <rect
          x='1010'
          y='500'
          width='18'
          height='18'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
        />
      </g>

      {/* Crosses — pulsing */}
      <g className='ho-pulse-med'>
        <line
          x1='1065'
          y1='290'
          x2='1095'
          y2='290'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1'
        />
        <line
          x1='1080'
          y1='275'
          x2='1080'
          y2='305'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1'
        />
      </g>
      <g className='ho-pulse-slow'>
        <line
          x1='985'
          y1='440'
          x2='1015'
          y2='440'
          stroke={s}
          strokeOpacity='0.18'
          strokeWidth='1'
        />
        <line
          x1='1000'
          y1='425'
          x2='1000'
          y2='455'
          stroke={s}
          strokeOpacity='0.18'
          strokeWidth='1'
        />
      </g>

      {/* Dots */}
      <g filter='url(#ho-dither)'>
        <circle cx='1150' cy='250' r='3' fill={s} fillOpacity='0.3' className='ho-pulse-slow' />
        <circle cx='1020' cy='180' r='3' fill={s} fillOpacity='0.25' className='ho-pulse-med' />
        <circle cx='1100' cy='530' r='3' fill={s} fillOpacity='0.25' className='ho-pulse-fast' />
        <circle cx='980' cy='350' r='3' fill={s} fillOpacity='0.2' className='ho-pulse-slow' />
      </g>

      {/* Horizontal lines — flowing dashes */}
      <line
        x1='960'
        y1='170'
        x2='1200'
        y2='170'
        stroke={s}
        strokeOpacity='0.1'
        strokeWidth='1'
        strokeDasharray='8 12'
        className='ho-flow'
      />
      <line
        x1='980'
        y1='330'
        x2='1200'
        y2='330'
        stroke={s}
        strokeOpacity='0.08'
        strokeWidth='1'
        strokeDasharray='6 14'
        className='ho-flow-slow'
      />
      <line
        x1='1000'
        y1='560'
        x2='1200'
        y2='560'
        stroke={s}
        strokeOpacity='0.08'
        strokeWidth='1'
        strokeDasharray='6 14'
        className='ho-flow'
      />

      {/* Vertical lines */}
      <line
        x1='1080'
        y1='0'
        x2='1080'
        y2='200'
        stroke={s}
        strokeOpacity='0.08'
        strokeWidth='1'
        strokeDasharray='6 14'
        className='ho-flow'
      />
      <line
        x1='1000'
        y1='300'
        x2='1000'
        y2='600'
        stroke={s}
        strokeOpacity='0.06'
        strokeWidth='1'
        strokeDasharray='4 16'
        className='ho-flow-slow'
      />

      {/* Diagonal */}
      <g filter='url(#ho-dither-soft)'>
        <line
          x1='1000'
          y1='400'
          x2='1200'
          y2='600'
          stroke={s}
          strokeOpacity='0.15'
          strokeWidth='1.5'
        />
      </g>

      {/* ============================================= */}
      {/* TOP EDGE (y < 160, center strip x 240–960)    */}
      {/* ============================================= */}

      {/* Horizontal flowing line across top */}
      <line
        x1='240'
        y1='40'
        x2='960'
        y2='40'
        stroke={s}
        strokeOpacity='0.06'
        strokeWidth='1'
        strokeDasharray='4 16'
        className='ho-flow-slow'
      />
      <line
        x1='300'
        y1='100'
        x2='900'
        y2='100'
        stroke={s}
        strokeOpacity='0.05'
        strokeWidth='1'
        strokeDasharray='3 17'
        className='ho-flow'
      />

      {/* Small squares along top */}
      <g filter='url(#ho-dither)' className='ho-fade-2'>
        <rect
          x='320'
          y='20'
          width='18'
          height='18'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
        />
        <rect
          x='560'
          y='15'
          width='15'
          height='15'
          stroke={s}
          strokeOpacity='0.18'
          strokeWidth='1.5'
        />
        <rect
          x='850'
          y='25'
          width='16'
          height='16'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
        />
      </g>

      {/* Top crosses */}
      <g className='ho-pulse-med'>
        <line x1='435' y1='60' x2='465' y2='60' stroke={s} strokeOpacity='0.15' strokeWidth='1' />
        <line x1='450' y1='45' x2='450' y2='75' stroke={s} strokeOpacity='0.15' strokeWidth='1' />
      </g>
      <g className='ho-pulse-fast'>
        <line x1='735' y1='55' x2='765' y2='55' stroke={s} strokeOpacity='0.15' strokeWidth='1' />
        <line x1='750' y1='40' x2='750' y2='70' stroke={s} strokeOpacity='0.15' strokeWidth='1' />
      </g>

      {/* Top dots */}
      <circle cx='400' cy='120' r='2' fill={s} fillOpacity='0.2' className='ho-pulse-slow' />
      <circle cx='600' cy='130' r='2' fill={s} fillOpacity='0.18' className='ho-pulse-med' />
      <circle cx='800' cy='115' r='2' fill={s} fillOpacity='0.2' className='ho-pulse-fast' />

      {/* ============================================= */}
      {/* BOTTOM EDGE (y > 640, center strip x 240–960) */}
      {/* ============================================= */}

      {/* Bottom rectangles — soft dither */}
      <g filter='url(#ho-dither-soft)' className='ho-fade-4'>
        <rect
          x='300'
          y='660'
          width='120'
          height='80'
          stroke={s}
          strokeOpacity='0.1'
          strokeWidth='1'
        />
        <rect
          x='780'
          y='660'
          width='120'
          height='80'
          stroke={s}
          strokeOpacity='0.1'
          strokeWidth='1'
        />
      </g>

      {/* Nested squares — center bottom, pulsing */}
      <g className='ho-pulse-slow'>
        <rect
          x='520'
          y='660'
          width='160'
          height='120'
          stroke={s}
          strokeOpacity='0.07'
          strokeWidth='1'
        />
        <rect
          x='545'
          y='680'
          width='110'
          height='80'
          stroke={s}
          strokeOpacity='0.05'
          strokeWidth='1'
        />
      </g>

      {/* Bottom flowing line */}
      <line
        x1='240'
        y1='700'
        x2='960'
        y2='700'
        stroke={s}
        strokeOpacity='0.06'
        strokeWidth='1'
        strokeDasharray='4 16'
        className='ho-flow'
      />

      {/* Bottom dots */}
      <circle cx='350' cy='720' r='2' fill={s} fillOpacity='0.18' className='ho-pulse-med' />
      <circle cx='600' cy='750' r='2' fill={s} fillOpacity='0.15' className='ho-pulse-slow' />
      <circle cx='850' cy='720' r='2' fill={s} fillOpacity='0.18' className='ho-pulse-fast' />

      {/* ============================================= */}
      {/* CORNER BRACKETS — draw-in                     */}
      {/* ============================================= */}
      <g className='ho-draw'>
        <path
          d='M20 20 L20 70'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
          strokeDasharray='50'
        />
        <path
          d='M20 20 L70 20'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
          strokeDasharray='50'
        />

        <path
          d='M1180 20 L1180 70'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
          strokeDasharray='50'
        />
        <path
          d='M1180 20 L1130 20'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
          strokeDasharray='50'
        />

        <path
          d='M20 780 L20 730'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
          strokeDasharray='50'
        />
        <path
          d='M20 780 L70 780'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
          strokeDasharray='50'
        />

        <path
          d='M1180 780 L1180 730'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
          strokeDasharray='50'
        />
        <path
          d='M1180 780 L1130 780'
          stroke={s}
          strokeOpacity='0.2'
          strokeWidth='1.5'
          strokeDasharray='50'
        />
      </g>

      {/* ============================================= */}
      {/* LARGE EDGE RECTANGLES — left & right bottom   */}
      {/* ============================================= */}
      <g filter='url(#ho-dither-soft)' className='ho-fade-4'>
        <rect
          x='20'
          y='580'
          width='200'
          height='140'
          stroke={s}
          strokeOpacity='0.1'
          strokeWidth='1'
        />
        <rect
          x='980'
          y='580'
          width='200'
          height='140'
          stroke={s}
          strokeOpacity='0.1'
          strokeWidth='1'
        />
      </g>
    </svg>
  );
};
