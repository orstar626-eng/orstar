'use client';

import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  type: 'particles' | 'waves' | 'stars' | 'bubbles' | 'aurora' | 'rain' | 'snow' | 'fireflies';
  color?: string;
  speed?: number;
}

export function AnimatedBackground({ type, color = '#818cf8', speed = 1 }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const spd = Math.max(0.1, Math.min(3, speed));

    let particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string; phase?: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 129, g: 140, b: 248 };
    };
    const rgb = hexToRgb(color);

    const initParticles = () => {
      particles = [];
      const count = type === 'stars' ? 180 : type === 'rain' ? 250 : type === 'snow' ? 120 : type === 'fireflies' ? 60 : 100;
      for (let i = 0; i < count; i++) {
        const baseVy = type === 'rain' ? Math.random() * 5 + 5
          : type === 'snow' ? Math.random() * 1 + 0.5
          : type === 'bubbles' ? -(Math.random() * 0.8 + 0.2)
          : (Math.random() - 0.5) * 0.5;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (type === 'rain' ? 0.3 : 1),
          vy: baseVy,
          size: type === 'stars' ? Math.random() * 2.5 + 0.5
            : type === 'bubbles' ? Math.random() * 18 + 5
            : type === 'rain' ? Math.random() * 1.5 + 0.5
            : type === 'fireflies' ? Math.random() * 3 + 2
            : Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.random() * 0.5 + 0.3})`,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };
    initParticles();

    let time = 0;

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016 * spd;

      particles.forEach((p, index) => {
        ctx.beginPath();

        if (type === 'stars') {
          const twinkle = Math.sin(time * 3 + (p.phase || 0)) * 0.4 + 0.6;
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity * twinkle})`);
          gradient.addColorStop(0.3, `rgba(200, 220, 255, ${p.opacity * twinkle * 0.5})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'rain') {
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity * 0.6})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 3, p.y + 20 * spd);
          ctx.stroke();
        } else if (type === 'snow') {
          const pf = Math.sin(time * 2 + (p.phase || 0)) * 0.2 + 0.8;
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * pf})`;
          ctx.arc(p.x, p.y, p.size * pf, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'bubbles') {
          const glow = Math.sin(time * 2 + (p.phase || 0)) * 0.2 + 0.8;
          const grad = ctx.createRadialGradient(p.x - p.size * 0.3, p.y - p.size * 0.3, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity * 0.3 * glow})`);
          grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity * 0.5 * glow})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        } else if (type === 'fireflies') {
          const glow = Math.sin(time * 2.5 + (p.phase || 0)) * 0.5 + 0.5;
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          gradient.addColorStop(0, `rgba(255, 230, 80, ${glow * 0.9})`);
          gradient.addColorStop(0.4, `rgba(255, 200, 50, ${glow * 0.4})`);
          gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity})`);
          gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        if (type === 'rain') {
          p.x += p.vx * spd;
          p.y += p.vy * spd * 1.5;
          if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        } else if (type === 'snow') {
          p.x += Math.sin(time * spd + (p.phase || 0)) * 0.8;
          p.y += p.vy * spd;
          if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
        } else if (type === 'bubbles') {
          p.y += p.vy * spd;
          p.x += Math.sin(time * spd + (p.phase || 0)) * 0.5;
          if (p.y < -p.size * 2) { p.y = canvas.height + p.size; p.x = Math.random() * canvas.width; }
        } else if (type === 'fireflies') {
          p.x += Math.sin(time * spd * 0.7 + (p.phase || 0)) * 1.2;
          p.y += Math.cos(time * spd * 0.5 + (p.phase || 0) * 1.3) * 0.8;
          if (p.x < -20) p.x = canvas.width + 20;
          if (p.x > canvas.width + 20) p.x = -20;
          if (p.y < -20) p.y = canvas.height + 20;
          if (p.y > canvas.height + 20) p.y = -20;
        } else if (type === 'stars') {
          p.x += p.vx * spd * 0.1;
          p.y += p.vy * spd * 0.1;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        } else {
          p.x += p.vx * spd;
          p.y += p.vy * spd;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }
      });

      if (type === 'particles') {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(1 - dist / 120) * 0.25})`;
              ctx.lineWidth = 0.8;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(drawParticles);
    };

    const drawWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008 * spd;

      for (let wave = 0; wave < 4; wave++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = canvas.height * 0.55
            + Math.sin(x * 0.008 + time + wave * 0.8) * 35
            + Math.sin(x * 0.015 + time * 1.3 + wave) * 20
            + Math.cos(x * 0.005 + time * 0.7) * 15
            + wave * 35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.35 - wave * 0.07})`);
        gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 - wave * 0.04})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      animationId = requestAnimationFrame(drawWaves);
    };

    const drawAurora = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.0003 * spd;

      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const points: [number, number][] = [];
        for (let x = 0; x <= canvas.width; x += 8) {
          const y = canvas.height * 0.25
            + Math.sin(x * 0.004 + time * 15 + i * 0.7) * 120
            + Math.cos(x * 0.002 + time * 10) * 60
            + Math.sin(x * 0.007 + time * 8 + i) * 40;
          points.push([x, y]);
        }
        if (points.length > 1) {
          ctx.moveTo(points[0][0], points[0][1]);
          for (let p2 = 1; p2 < points.length - 2; p2++) {
            const cpX = (points[p2][0] + points[p2 + 1][0]) / 2;
            const cpY = (points[p2][1] + points[p2 + 1][1]) / 2;
            ctx.quadraticCurveTo(points[p2][0], points[p2][1], cpX, cpY);
          }
        }
        const hue1 = (time * 800 + i * 40) % 360;
        const hue2 = (hue1 + 80) % 360;
        const hue3 = (hue1 + 160) % 360;
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, `hsla(${hue1}, 80%, 65%, 0.25)`);
        grad.addColorStop(0.33, `hsla(${hue2}, 80%, 65%, 0.4)`);
        grad.addColorStop(0.66, `hsla(${hue3}, 80%, 65%, 0.3)`);
        grad.addColorStop(1, `hsla(${hue1}, 80%, 65%, 0.25)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 100;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.filter = `blur(${20 + i * 5}px)`;
        ctx.stroke();
        ctx.filter = 'none';
      }
      animationId = requestAnimationFrame(drawAurora);
    };

    if (type === 'waves') drawWaves();
    else if (type === 'aurora') drawAurora();
    else drawParticles();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [type, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
