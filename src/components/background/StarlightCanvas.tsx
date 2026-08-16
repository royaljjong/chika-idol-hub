'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  vx: number;
  vy: number;
  color: string;
}

export function StarlightCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    const STAR_COUNT = Math.min(140, Math.floor((width * height) / 12000));
    let stars: Star[] = [];

    const STAR_COLORS = ['#FFFFFF', '#F0F4FF', '#FFEBF2', '#E2F3FF', '#FFF8DB'];

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        const baseAlpha = Math.random() * 0.7 + 0.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.4,
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)] || '#FFFFFF',
        });
      }
    }

    initStars();

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Subtle ambient background gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8,
      );
      bgGrad.addColorStop(0, 'rgba(16, 22, 38, 0.4)');
      bgGrad.addColorStop(0.5, 'rgba(10, 14, 24, 0.6)');
      bgGrad.addColorStop(1, 'rgba(7, 9, 15, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw constellation lines between nearby stars
      for (let i = 0; i < stars.length; i++) {
        const s1 = stars[i]!;
        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j]!;
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const lineAlpha = (1 - dist / 90) * 0.12 * Math.min(s1.alpha, s2.alpha);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(220, 235, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }

        // Connect to mouse pointer
        const mdx = s1.x - mouseX;
        const mdy = s1.y - mouseY;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          const mAlpha = (1 - mdist / 140) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 200, 230, ${mAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }

      // Draw and update stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]!;
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around boundaries
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.15) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // Draw star with soft glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
        ctx.shadowColor = star.color;
        ctx.shadowBlur = star.radius > 1 ? 6 : 2;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
