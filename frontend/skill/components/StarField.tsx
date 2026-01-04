
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

const StarField: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000, radius: 180 });
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const init = () => {
      particles.current = [];
      const gap = 35; // Space between dots
      
      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          particles.current.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            size: 1.2,
            opacity: Math.random() * 0.4 + 0.1
          });
        }
      }
    };

    init();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Light mode: Dark grey | Dark mode: White
      const pColor = theme === 'light' ? '31, 31, 31' : '255, 255, 255';

      particles.current.forEach(p => {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.current.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.current.radius - distance) / mouse.current.radius;
          p.vx -= forceDirectionX * force * 5;
          p.vy -= forceDirectionY * force * 5;
        }

        const dxBase = p.x - p.baseX;
        const dyBase = p.y - p.baseY;
        p.vx -= dxBase * 0.05;
        p.vy -= dyBase * 0.05;

        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pColor}, ${p.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none" 
      style={{ zIndex: -1 }} // ليكون خلف كل شيء دائماً
    />
  );
};

export default StarField;
