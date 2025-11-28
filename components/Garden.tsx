import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FlowerTheme, Point } from '../types';

interface FlowerEntity {
  id: number;
  x: number;
  y: number;
  size: number;
  maxSize: number;
  color: string;
  centerColor: string;
  petalCount: number;
  rotation: number;
  rotationSpeed: number;
  growSpeed: number;
  shape: string;
  opacity: number;
  decay: boolean;
  createdAt: number;
}

interface GardenProps {
  theme: FlowerTheme;
  isAutoPlay: boolean;
}

const Garden: React.FC<GardenProps> = ({ theme, isAutoPlay }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const flowersRef = useRef<FlowerEntity[]>([]);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const idCounterRef = useRef<number>(0);
  
  // Audio Context for subtle generative sounds (optional, keeping it visual mostly)
  
  const createFlower = (x: number, y: number, currentTheme: FlowerTheme): FlowerEntity => {
    idCounterRef.current++;
    const randomColor = currentTheme.palette[Math.floor(Math.random() * currentTheme.palette.length)];
    const sizeBase = Math.random() * 30 + 10;
    
    return {
      id: idCounterRef.current,
      x,
      y,
      size: 0,
      maxSize: sizeBase,
      color: randomColor,
      centerColor: currentTheme.centerColor,
      petalCount: Math.floor(Math.random() * 5) + 5, // 5 to 9 petals
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      growSpeed: Math.random() * 0.5 + 0.2,
      shape: currentTheme.petalShape,
      opacity: 1,
      decay: false,
      createdAt: Date.now(),
    };
  };

  const drawFlower = (ctx: CanvasRenderingContext2D, flower: FlowerEntity) => {
    ctx.save();
    ctx.translate(flower.x, flower.y);
    ctx.rotate(flower.rotation);
    ctx.globalAlpha = flower.opacity;

    ctx.fillStyle = flower.color;

    for (let i = 0; i < flower.petalCount; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / flower.petalCount);
      ctx.beginPath();
      
      // Draw different shapes based on theme
      if (flower.shape === 'pointed') {
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(flower.size / 2, -flower.size / 2, flower.size, 0);
        ctx.quadraticCurveTo(flower.size / 2, flower.size / 2, 0, 0);
      } else if (flower.shape === 'heart') {
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(flower.size / 2, -flower.size / 2, flower.size, -flower.size / 4, 0, flower.size);
        ctx.bezierCurveTo(-flower.size, -flower.size / 4, -flower.size / 2, -flower.size / 2, 0, 0);
      } else if (flower.shape === 'jagged') {
         ctx.moveTo(0,0);
         ctx.lineTo(flower.size, -flower.size/4);
         ctx.lineTo(flower.size * 0.8, 0);
         ctx.lineTo(flower.size, flower.size/4);
         ctx.lineTo(0,0);
      } else {
        // Round default
        ctx.ellipse(flower.size / 2, 0, flower.size / 2, flower.size / 4, 0, 0, Math.PI * 2);
      }
      
      ctx.fill();
      ctx.restore();
    }

    // Center
    ctx.beginPath();
    ctx.fillStyle = flower.centerColor;
    ctx.arc(0, 0, flower.size / 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with a slight trail effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Dark blue slate with transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and Draw Flowers
    flowersRef.current.forEach(flower => {
      // Growth
      if (flower.size < flower.maxSize && !flower.decay) {
        flower.size += flower.growSpeed;
      }
      
      // Rotation
      flower.rotation += flower.rotationSpeed;

      // Life cycle - start decaying if too many flowers or old
      const age = Date.now() - flower.createdAt;
      if (flowersRef.current.length > 300 && age > 5000) {
          flower.decay = true;
      }
      if (age > 20000) flower.decay = true;

      if (flower.decay) {
        flower.opacity -= 0.01;
        flower.size *= 0.99;
      }

      drawFlower(ctx, flower);
    });

    // Clean up dead flowers
    flowersRef.current = flowersRef.current.filter(f => f.opacity > 0);

    // Auto spawn if enabled
    if (isAutoPlay && Math.random() < 0.1) {
       const x = Math.random() * canvas.width;
       const y = Math.random() * canvas.height;
       flowersRef.current.push(createFlower(x, y, theme));
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [theme, isAutoPlay]); // Theme is a dependency for NEW flowers, but current ones persist

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    mouseRef.current = { x: e.clientX, y: e.clientY };
    flowersRef.current.push(createFlower(e.clientX, e.clientY, theme));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const dist = Math.hypot(e.clientX - mouseRef.current.x, e.clientY - mouseRef.current.y);
      // Only spawn if moved enough distance to prevent clumping
      if (dist > 15) {
        flowersRef.current.push(createFlower(e.clientX, e.clientY, theme));
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="absolute inset-0 cursor-crosshair touch-none"
    />
  );
};

export default Garden;
