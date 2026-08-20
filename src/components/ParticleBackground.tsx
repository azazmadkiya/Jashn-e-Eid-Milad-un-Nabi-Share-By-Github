import React, { useEffect, useRef } from 'react';
import { PetalParticle } from '../types';

interface ParticleBackgroundProps {
  showerTrigger: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ showerTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<PetalParticle[]>([]);

  // Spawn a wave of rose petals
  const spawnPetals = (count: number = 35) => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const colors = [
      '#ef4444', // Crimson Rose
      '#dc2626', // Rich Red
      '#f43f5e', // Rose Pink
      '#be123c', // Deep Ruby
      '#fbbf24', // Gold Accent Petal
    ];

    for (let i = 0; i < count; i++) {
      petalsRef.current.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.4) - 50,
        size: Math.random() * 12 + 8,
        speedY: Math.random() * 1.8 + 1.2,
        speedX: (Math.random() - 0.5) * 1.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2.5,
        opacity: Math.random() * 0.4 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };

  useEffect(() => {
    if (showerTrigger > 0) {
      spawnPetals(45);
    }
  }, [showerTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial ambient petals
    spawnPetals(20);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render & update rose petals
      for (let i = petalsRef.current.length - 1; i >= 0; i--) {
        const p = petalsRef.current[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.02) * 0.8;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 20) {
          petalsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        // Draw organic rose petal shape
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.bezierCurveTo(p.size / 1.5, -p.size, p.size, p.size / 2, 0, p.size);
        ctx.bezierCurveTo(-p.size, p.size / 2, -p.size / 1.5, -p.size, 0, -p.size / 2);
        ctx.fill();

        // Highlight curve
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      // Top off continuous subtle ambient breeze
      if (petalsRef.current.length < 15 && Math.random() < 0.08) {
        spawnPetals(2);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Starry Night Canvas Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#021810] via-[#04281c] to-[#01120c]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.18) 0%, transparent 60%),
            radial-gradient(circle at 10% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 70%, rgba(5, 150, 105, 0.15) 0%, transparent 50%)
          `
        }}
      />

      {/* Floating Animated Golden Light Orbs */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Twinkling Stars Overlay */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Interactive Rose Petal Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
