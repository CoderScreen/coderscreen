'use client';

import React, { useRef, useEffect } from 'react';

const BG_COLOR = '#fff';
const FG_COLOR = '#222'; // much darker dots
const CHAR_SET = [' ', '.', '-', '~', '*', '=', '%', '#', '@']; // from dimmest to brightest
const FONT_SIZE = 16; // px
const LINE_HEIGHT = 18; // px
const COL_WIDTH = 10; // px
const NUM_RIBBONS = 4;
const RIBBON_AMPLITUDE = [32, 44, 56, 68]; // increase amplitude for more visible waves
const RIBBON_SPEED = [0.18, 0.13, 0.09, 0.07];
const DOT_CHAR = '.'; // Always use dot

function getAsciiChar(intensity: number) {
  // intensity: 0 (dark) to 1 (bright)
  const idx = Math.floor(intensity * (CHAR_SET.length - 1));
  return CHAR_SET[idx];
}

function getDotAlpha(intensity: number) {
  // intensity: 0 (light) to 1 (dark)
  // Map to alpha: 0.1 (light) to 1 (dark)
  return 0.1 + 0.9 * intensity;
}

// Function to check if a point is inside a rounded rectangle (less round than oval)
function isInsideOval(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  width: number,
  height: number
): boolean {
  const normalizedX = (x - centerX) / (width / 2);
  const normalizedY = (y - centerY) / (height / 2);

  // Use a higher power to make it more rectangular/blocky
  // Power of 4 instead of 2 makes it more square-like
  return Math.pow(Math.abs(normalizedX), 4) + Math.pow(Math.abs(normalizedY), 4) <= 1;
}

const LandingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 800, height: 400 });

  // Responsive resize
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      let width = canvas.parentElement?.clientWidth || 800;
      let height = canvas.parentElement?.clientHeight || 400;
      canvas.width = width;
      canvas.height = height;
      sizeRef.current = { width, height };
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = `${FONT_SIZE}px monospace`;
    ctx.textBaseline = 'top';
    let t = 0;
    function draw() {
      if (!ctx) return;
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textBaseline = 'top';

      // Define the oval parameters (horizontal oval in center)
      const centerX = width / 2;
      const centerY = height / 2;
      const ovalWidth = width * 0.75; // 75% of canvas width - extended edges
      const ovalHeight = height * 0.6; // 75% of canvas height - extended edges

      // Calculate grid size
      const cols = Math.floor(width / COL_WIDTH);
      const rows = Math.floor(height / LINE_HEIGHT);

      // For each cell, determine intensity based on ribbons
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Map cell to canvas coordinates
          const px = x * COL_WIDTH + COL_WIDTH / 2;
          const py = y * LINE_HEIGHT + LINE_HEIGHT / 2;

          // Check if this position is inside the oval - if so, skip drawing
          if (isInsideOval(px, py, centerX, centerY, ovalWidth, ovalHeight)) {
            continue;
          }

          // Calculate intensity from all ribbons
          let intensity = 0;
          for (let i = 0; i < NUM_RIBBONS; i++) {
            const baseY = (sizeRef.current.height / (NUM_RIBBONS + 1)) * (i + 1);
            const amp = RIBBON_AMPLITUDE[i];
            const speed = RIBBON_SPEED[i];
            // Sine wave for ribbon
            const phase = t * speed + x * 0.18 + i * 1.2;
            const ribbonY = baseY + Math.sin(phase) * amp;
            // If this cell is close to the ribbon, add to intensity
            const dist = Math.abs(py - ribbonY);
            const contrib = Math.max(0, 1 - dist / (amp * 1.2));
            intensity += contrib;
          }
          // Exaggerate intensity for more visible waves
          intensity = Math.pow(Math.min(1, Math.max(0, intensity / NUM_RIBBONS)), 2.5); // more contrast
          // Map intensity to color (darker = higher intensity)
          const shade = Math.floor(220 - 180 * intensity); // 220 (light) to 40 (dark)
          ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
          ctx.globalAlpha = 0.7 + 0.3 * intensity;
          ctx.fillText(DOT_CHAR, px - COL_WIDTH / 2, py - LINE_HEIGHT / 2);
        }
      }
      ctx.globalAlpha = 1;
      t += 0.04;
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', background: BG_COLOR }}
      aria-label='Animated ASCII Aurora Borealis Canvas'
    />
  );
};

export default LandingCanvas;
