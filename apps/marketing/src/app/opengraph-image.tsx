import { ImageResponse } from 'next/og';

export const alt = 'CoderScreen - The Open Source Interview Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Geometric overlay elements matching HeroOverlay.tsx
// Y coordinates scaled from 800→630 (×0.7875)
const rects = [
  // Left edge
  { x: 30, y: 24, w: 140, h: 110, o: 0.15 },
  { x: 50, y: 158, w: 100, h: 79, o: 0.12 },
  { x: 20, y: 276, w: 80, h: 63, o: 0.12 },
  { x: 130, y: 299, w: 50, h: 39, o: 0.09 },
  { x: 60, y: 378, w: 70, h: 55, o: 0.1 },
  { x: 160, y: 197, w: 60, h: 47, o: 0.1 },
  { x: 20, y: 457, w: 200, h: 110, o: 0.1 },
  // Right edge
  { x: 980, y: 16, w: 130, h: 102, o: 0.14 },
  { x: 1050, y: 142, w: 100, h: 79, o: 0.12 },
  { x: 1090, y: 252, w: 80, h: 63, o: 0.12 },
  { x: 1020, y: 284, w: 50, h: 39, o: 0.09 },
  { x: 1070, y: 370, w: 70, h: 55, o: 0.1 },
  { x: 980, y: 181, w: 60, h: 47, o: 0.1 },
  { x: 980, y: 457, w: 200, h: 110, o: 0.1 },
];

const dots = [
  // Left
  { x: 50, y: 197, r: 3, o: 0.3 },
  { x: 180, y: 142, r: 3, o: 0.25 },
  { x: 100, y: 418, r: 3, o: 0.25 },
  { x: 220, y: 276, r: 3, o: 0.2 },
  // Right
  { x: 1150, y: 197, r: 3, o: 0.3 },
  { x: 1020, y: 142, r: 3, o: 0.25 },
  { x: 1100, y: 418, r: 3, o: 0.25 },
  { x: 980, y: 276, r: 3, o: 0.2 },
  // Top
  { x: 400, y: 95, r: 2, o: 0.2 },
  { x: 600, y: 102, r: 2, o: 0.18 },
  { x: 800, y: 91, r: 2, o: 0.2 },
];

const crosses = [
  { x: 120, y: 229, o: 0.2 },
  { x: 200, y: 347, o: 0.18 },
  { x: 1080, y: 229, o: 0.2 },
  { x: 1000, y: 347, o: 0.18 },
  { x: 450, y: 47, o: 0.15 },
  { x: 750, y: 43, o: 0.15 },
];

const smallRects = [
  { x: 320, y: 16, w: 18, h: 14, o: 0.2 },
  { x: 560, y: 12, w: 15, h: 12, o: 0.18 },
  { x: 850, y: 20, w: 16, h: 13, o: 0.2 },
  // Small dithered squares - left
  { x: 80, y: 126, w: 25, h: 20, o: 0.2 },
  { x: 190, y: 95, w: 20, h: 16, o: 0.18 },
  { x: 30, y: 354, w: 22, h: 17, o: 0.2 },
  // Small dithered squares - right
  { x: 1100, y: 118, w: 25, h: 20, o: 0.2 },
  { x: 990, y: 102, w: 20, h: 16, o: 0.18 },
  { x: 1140, y: 339, w: 22, h: 17, o: 0.2 },
];

export default async function Image() {
  const fontCss = await fetch('https://fonts.googleapis.com/css2?family=Geist:wght@400;700').then(
    (res) => res.text()
  );

  const fontUrls = [...fontCss.matchAll(/src:\s*url\(([^)]+)\)/g)].map((m) => m[1]);

  const [boldFontData, regularFontData] = await Promise.all([
    fetch(fontUrls[fontUrls.length - 1] ?? fontUrls[0]).then((r) => r.arrayBuffer()),
    fetch(fontUrls[0]).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1860fb',
        position: 'relative',
        fontFamily: 'Geist',
        overflow: 'hidden',
      }}
    >
      {/* Geometric overlay - rectangles */}
      {rects.map((r) => (
        <div
          key={`r-${r.x}-${r.y}`}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            border: `1px solid rgba(255,255,255,${r.o})`,
          }}
        />
      ))}

      {/* Small rectangles */}
      {smallRects.map((r) => (
        <div
          key={`sr-${r.x}-${r.y}`}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            border: `1.5px solid rgba(255,255,255,${r.o})`,
          }}
        />
      ))}

      {/* Dots */}
      {dots.map((d) => (
        <div
          key={`d-${d.x}-${d.y}`}
          style={{
            position: 'absolute',
            left: d.x - d.r,
            top: d.y - d.r,
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: '50%',
            backgroundColor: `rgba(255,255,255,${d.o})`,
          }}
        />
      ))}

      {/* Crosses */}
      {crosses.map((c) => (
        <div key={`c-${c.x}-${c.y}`} style={{ display: 'flex' }}>
          <div
            style={{
              position: 'absolute',
              left: c.x - 15,
              top: c.y,
              width: 30,
              height: 1,
              backgroundColor: `rgba(255,255,255,${c.o})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y - 15,
              width: 1,
              height: 30,
              backgroundColor: `rgba(255,255,255,${c.o})`,
            }}
          />
        </div>
      ))}

      {/* Corner brackets */}
      {/* Top-left */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 16,
          width: 40,
          height: 40,
          borderTop: '1.5px solid rgba(255,255,255,0.2)',
          borderLeft: '1.5px solid rgba(255,255,255,0.2)',
        }}
      />
      {/* Top-right */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: 16,
          width: 40,
          height: 40,
          borderTop: '1.5px solid rgba(255,255,255,0.2)',
          borderRight: '1.5px solid rgba(255,255,255,0.2)',
        }}
      />
      {/* Bottom-left */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          bottom: 16,
          width: 40,
          height: 40,
          borderBottom: '1.5px solid rgba(255,255,255,0.2)',
          borderLeft: '1.5px solid rgba(255,255,255,0.2)',
        }}
      />
      {/* Bottom-right */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          bottom: 16,
          width: 40,
          height: 40,
          borderBottom: '1.5px solid rgba(255,255,255,0.2)',
          borderRight: '1.5px solid rgba(255,255,255,0.2)',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
          padding: '0 80px',
        }}
      >
        {/* Logo */}
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: OG image, not rendered in DOM */}
        <svg viewBox='0 0 200 200' width='56' height='56' style={{ marginBottom: 24 }}>
          <path d='m118.8 111.3l47.7 28.7-83.4 50-50.1-28.6z' fill='white' />
          <path d='m33 60.6l51.8 28.7v100.7l-51.8-28.7z' fill='white' />
          <path d='m118.8 11.2l47.7 28.8v100.9l-47.7-28.8z' fill='white' />
          <path d='m118 11.5l47.2 28.6-82.6 50.1-49.6-28.6z' fill='white' />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>The Open Source</span>
          <span>Interview Platform</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Run live coding interviews and technical screens with a collaborative editor your
          candidates will actually enjoy.
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 32,
          }}
        >
          coderscreen.com
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Geist', data: boldFontData, weight: 700, style: 'normal' },
        {
          name: 'Geist',
          data: regularFontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );
}
