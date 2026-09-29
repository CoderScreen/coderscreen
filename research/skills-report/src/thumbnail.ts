// Blog hero image (1920x1080) matching the CoderScreen house style:
// solid brand-blue background, white logo top-left, big bold white title.
// `bun run src/thumbnail.ts` -> charts/thumbnail.svg
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const OUT = new URL("../charts", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const LOGO = readFileSync(new URL("../../../apps/marketing/public/logo.svg", import.meta.url).pathname, "utf8");
const LOGO_WHITE = [...LOGO.matchAll(/<path[^>]*\/>/g)].map((m) => m[0].replace(/class="s0"/g, `fill="#FFFFFF"`)).join("");
const FONT = "Inter, system-ui, -apple-system, Segoe UI, sans-serif";

const W = 1920, H = 1080, M = 128;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2168F7"/>
      <stop offset="1" stop-color="#1450D6"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Y Combinator logo, right side -->
  <rect x="1440" y="360" width="360" height="360" rx="28" fill="#FB651E"/>
  <text x="1620" y="548" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-size="270" font-weight="700" fill="#FFFFFF">Y</text>

  <!-- logo + wordmark, top-left -->
  <g transform="translate(${M},96) scale(0.34)">${LOGO_WHITE}</g>
  <text x="${M + 88}" y="130" dominant-baseline="central" font-family="${FONT}" font-size="42" font-weight="800" fill="#FFFFFF">CoderScreen</text>

  <!-- title -->
  <text x="${M}" y="540" font-family="${FONT}" font-size="150" font-weight="800" fill="#FFFFFF" letter-spacing="-2">Knowing AI</text>
  <text x="${M}" y="700" font-family="${FONT}" font-size="150" font-weight="800" fill="#FFFFFF" letter-spacing="-2">Doesn't Pay</text>

  <!-- scope line -->
  <text x="${M}" y="812" font-family="${FONT}" font-size="44" font-weight="600" fill="#C7D8FF">2,652 engineering jobs at ~1,400 YC startups</text>
</svg>`;

writeFileSync(`${OUT}/thumbnail.svg`, svg);
console.log(`wrote ${OUT}/thumbnail.svg`);
