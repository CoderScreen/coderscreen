'use client';

import React, { useEffect, useRef } from 'react';

const ConwayBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Game of Life parameters
    const cellSize = 8;
    const cols = Math.ceil(canvas.width / window.devicePixelRatio / cellSize);
    const rows = Math.ceil(canvas.height / window.devicePixelRatio / cellSize);

    // Initialize grid
    let grid: boolean[][] = [];
    let nextGrid: boolean[][] = [];

    const initializeGrid = () => {
      grid = [];
      nextGrid = [];
      for (let i = 0; i < rows; i++) {
        grid[i] = [];
        nextGrid[i] = [];
        for (let j = 0; j < cols; j++) {
          // Random initial state with lower density for subtlety
          grid[i][j] = Math.random() < 0.15;
          nextGrid[i][j] = false;
        }
      }
    };

    const countNeighbors = (row: number, col: number): number => {
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const newRow = (row + i + rows) % rows;
          const newCol = (col + j + cols) % cols;
          if (grid[newRow][newCol]) count++;
        }
      }
      return count;
    };

    const updateGrid = () => {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const neighbors = countNeighbors(i, j);
          if (grid[i][j]) {
            // Live cell
            nextGrid[i][j] = neighbors === 2 || neighbors === 3;
          } else {
            // Dead cell
            nextGrid[i][j] = neighbors === 3;
          }
        }
      }

      // Swap grids
      [grid, nextGrid] = [nextGrid, grid];
    };

    const drawGrid = () => {
      // Clear canvas with subtle background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(
        0,
        0,
        canvas.width / window.devicePixelRatio,
        canvas.height / window.devicePixelRatio
      );

      // Draw live cells with gradient colors
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (grid[i][j]) {
            const x = j * cellSize;
            const y = i * cellSize;

            // Create gradient based on position for visual interest
            const gradient = ctx.createRadialGradient(
              x + cellSize / 2,
              y + cellSize / 2,
              0,
              x + cellSize / 2,
              y + cellSize / 2,
              cellSize / 2
            );

            // Alternate between two colors for variety
            const isEven = (i + j) % 2 === 0;
            if (isEven) {
              gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Indigo
              gradient.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
            } else {
              gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)'); // Purple
              gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
          }
        }
      }
    };

    // Initialize and start animation
    initializeGrid();
    let animationId: number;

    const animate = () => {
      updateGrid();
      drawGrid();
      // Slow down animation by using setTimeout instead of immediate requestAnimationFrame
      setTimeout(() => {
        animationId = requestAnimationFrame(animate);
      }, 200); // 100ms delay = 10x slower (roughly 10 FPS instead of 60 FPS)
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className='h-[60vh] relative w-full overflow-hidden'>
      {/* Clean white background */}
      <div className='absolute inset-0 bg-white' />

      {/* Conway's Game of Life Canvas */}
      <canvas
        ref={canvasRef}
        className='absolute inset-0 w-full h-full opacity-[0.4]'
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Subtle dot pattern for texture */}
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Clean accent lines */}
      <div className='absolute inset-0'>
        {/* Top accent line */}
        <div
          className='absolute top-16 left-1/2 w-24 h-px opacity-15'
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #6366f1 50%, transparent 100%)',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Bottom accent line */}
        <div
          className='absolute bottom-16 right-1/2 w-24 h-px opacity-15'
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #8b5cf6 50%, transparent 100%)',
            transform: 'translateX(50%)',
          }}
        />
      </div>

      {/* Subtle noise texture */}
      <div
        className='absolute inset-0 opacity-[0.01]'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
