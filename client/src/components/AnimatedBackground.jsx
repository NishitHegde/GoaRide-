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

    // Generate 45 floating ambient particle nodes
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1.2,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Floating Glowing Orbs Data
    const orbs = [
      { x: width * 0.2, y: height * 0.2, vx: 0.15, vy: 0.1, radius: 280, color: 'rgba(2, 132, 199, 0.15)' },
      { x: width * 0.8, y: height * 0.5, vx: -0.1, vy: 0.12, radius: 320, color: 'rgba(6, 182, 212, 0.12)' },
      { x: width * 0.4, y: height * 0.85, vx: 0.12, vy: -0.15, radius: 300, color: 'rgba(99, 102, 241, 0.12)' },
    ];

    const render = () => {
      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render Floating Glowing Orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;

        // Subtle mouse displacement
        const dx = (mouse.x - width / 2) * 0.03;
        const dy = (mouse.y - height / 2) * 0.03;

        const gradient = ctx.createRadialGradient(
          orb.x + dx,
          orb.y + dy,
          0,
          orb.x + dx,
          orb.y + dy,
          orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x + dx, orb.y + dy, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update & Render Particles and Constellation Lines
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse proximity reaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let currentRadius = p.radius + Math.sin(p.pulse) * 0.5;

        if (dist < 120 && !isTouch) {
          p.x -= (dx / dist) * 0.6;
          p.y -= (dy / dist) * 0.6;
          currentRadius += 0.8;
        }

        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fill();

        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 110) {
            const lineAlpha = (1 - pdist / 110) * 0.15;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
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
      className="pointer-events-none fixed inset-0 z-0 opacity-60 dark:opacity-40"
    />
  );
}
