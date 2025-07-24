'use client';

import React, { useRef, useEffect } from 'react';

const BG_COLOR = '#fff';
const CHAR_SET = [' ', '.', '-', '~', '*', '=', '%', '#', '@'];
const FONT_SIZE = 16;
const LINE_HEIGHT = 18;
const COL_WIDTH = 10;
const NUM_RIBBONS = 4;
const DOT_CHAR = '.';

function getAsciiChar(intensity: number) {
  const idx = Math.floor(intensity * (CHAR_SET.length - 1));
  return CHAR_SET[idx];
}

// Function to check if a point is inside a rounded rectangle
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

    let time = 0;

    function draw() {
      if (!ctx) return;
      const { width, height } = sizeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);

      // Set font
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textBaseline = 'top';

      // Define the oval parameters
      const centerX = width / 2;
      const centerY = height / 2;
      const ovalWidth = width * 0.75;
      const ovalHeight = height * 0.6;

      // Calculate grid size
      const cols = Math.floor(width / COL_WIDTH);
      const rows = Math.floor(height / LINE_HEIGHT);

      // Create moving ribbons that travel across the screen
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Map cell to canvas coordinates
          const px = x * COL_WIDTH + COL_WIDTH / 2;
          const py = y * LINE_HEIGHT + LINE_HEIGHT / 2;

          // Skip if inside the oval
          if (isInsideOval(px, py, centerX, centerY, ovalWidth, ovalHeight)) {
            continue;
          }

          // Calculate intensity from moving ribbons
          let intensity = 0;

          // Create 4 ribbons that move horizontally across the screen
          for (let i = 0; i < NUM_RIBBONS; i++) {
            const ribbonY = (height / (NUM_RIBBONS + 1)) * (i + 1);
            const ribbonSpeed = 0.5 + i * 0.3; // Different speeds for each ribbon
            const ribbonWidth = 300 + i * 50; // Different widths

            // Calculate the ribbon's current position (moves from left to right)
            const ribbonX = ((time * ribbonSpeed * 50) % (width + ribbonWidth)) - ribbonWidth / 2;

            // Calculate distance from current pixel to the ribbon
            const distX = Math.abs(px - ribbonX);
            const distY = Math.abs(py - ribbonY);

            // Create a soft ribbon effect
            const ribbonInfluence =
              Math.max(0, 1 - distX / (ribbonWidth / 2)) * Math.max(0, 1 - distY / 30);

            intensity += ribbonInfluence * 0.8;
          }

          // Add some vertical wave motion
          const waveIntensity = Math.sin(time * 0.5 + px * 0.02) * 0.3 + 0.3;
          intensity += waveIntensity;

          // Normalize and enhance intensity
          intensity = Math.min(1, Math.max(0, intensity));
          intensity = Math.pow(intensity, 0.8);

          // Map intensity to color
          const shade = Math.floor(250 - 150 * intensity);
          ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
          ctx.fillText(DOT_CHAR, px - COL_WIDTH / 2, py - LINE_HEIGHT / 2);
        }
      }

      // Update time for animation
      time += 0.05;
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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
