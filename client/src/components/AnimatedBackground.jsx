import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      if (isTouch) return;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // GoaRide Sunset Gold & Midnight Luxury Color Palette
    const starColors = [
      { r: 245, g: 158, b: 11, hex: '#f59e0b' },  // Sunset Gold
      { r: 251, g: 191, b: 36, hex: '#fbbf24' },  // Amber Gold
      { r: 6, g: 182, b: 212, hex: '#06b6d4' },   // Coastal Cyan
      { r: 56, g: 189, b: 248, hex: '#38bdf8' },  // Sky Blue
      { r: 255, g: 255, b: 255, hex: '#ffffff' }, // Pure Diamond White
    ];

    // Responsive Star Count (50 on mobile, 130 on desktop for 60 FPS performance)
    const starCount = isTouch
      ? Math.min(Math.floor((width * height) / 16000), 50)
      : Math.min(Math.floor((width * height) / 7000), 130);

    const stars = Array.from({ length: starCount }, () => {
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.6, // Fast-moving dynamic speed
        vy: (Math.random() - 0.5) * 1.6,
        radius: Math.random() < 0.25 ? Math.random() * 1.8 + 2.0 : Math.random() * 1.2 + 0.8, // Tiny & larger glowing stars
        baseAlpha: Math.random() * 0.45 + 0.5,
        color,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinkleAngle: Math.random() * Math.PI * 2,
      };
    });

    // Shooting Star / Streak Manager
    let shootingStars = [];

    const createShootingStar = () => {
      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.5);
      const length = Math.random() * 80 + 60;
      const speed = Math.random() * 8 + 6;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // 45 degree tilt
      const color = starColors[Math.floor(Math.random() * (starColors.length - 1))];

      shootingStars.push({
        x: startX,
        y: startY,
        length,
        speed,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.015,
      });
    };

    let shootingStarTimer = 0;

    const render = () => {
      // Smooth mouse position lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Periodically spawn shooting stars
      shootingStarTimer++;
      if (shootingStarTimer % 180 === 0 && Math.random() > 0.3) {
        createShootingStar();
      }

      // Render Fast-Moving Bright Neon Starfield
      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.twinkleAngle += star.twinkleSpeed;

        // Wrap around screen edges smoothly
        if (star.x < -15) star.x = width + 15;
        if (star.x > width + 15) star.x = -15;
        if (star.y < -15) star.y = height + 15;
        if (star.y > height + 15) star.y = -15;

        // Mouse displacement effect
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let dynamicRadius = star.radius;

        if (dist < 130 && !isTouch) {
          const force = (130 - dist) / 130;
          star.x -= (dx / dist) * force * 1.5;
          star.y -= (dy / dist) * force * 1.5;
          dynamicRadius += force * 1.2;
        }

        // Star Twinkle & Flickering Calculation
        const currentAlpha = Math.min(
          1,
          Math.max(0.2, star.baseAlpha + Math.sin(star.twinkleAngle) * 0.35)
        );

        // Draw Bright Neon Star Core & Glow
        ctx.shadowColor = star.color.hex;
        ctx.shadowBlur = dynamicRadius > 2.5 ? 16 : 10;
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${currentAlpha})`;

        ctx.beginPath();
        ctx.arc(star.x, star.y, Math.max(0.6, dynamicRadius), 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      });

      // Render Shooting Stars / Streaks
      shootingStars.forEach((s, idx) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(idx, 1);
          return;
        }

        const headX = s.x;
        const headY = s.y;
        const tailX = s.x - s.vx * (s.length / s.speed);
        const tailY = s.y - s.vy * (s.length / s.speed);

        const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.7, `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.life * 0.6})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${s.life * 0.95})`);

        ctx.shadowColor = s.color.hex;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-85 dark:opacity-75"
    />
  );
}
