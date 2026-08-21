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

    // Color palette from GoaRide UI theme (Neon Cyan, Electric Blue, Soft Indigo, Orange Accent)
    const neonColors = [
      { r: 0, g: 210, b: 255, hex: '#00d2ff' },
      { r: 56, g: 189, b: 248, hex: '#38bdf8' },
      { r: 99, g: 102, b: 241, hex: '#6366f1' },
      { r: 249, g: 115, b: 22, hex: '#f97316' },
    ];

    // Responsive particle count (reduced on mobile for high performance)
    const totalParticles = isTouch
      ? Math.min(Math.floor((width * height) / 18000), 45)
      : Math.min(Math.floor((width * height) / 7500), 140);

    const particles = Array.from({ length: totalParticles }, () => {
      const color = neonColors[Math.floor(Math.random() * neonColors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.0,
        alpha: Math.random() * 0.55 + 0.25,
        color,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2,
      };
    });

    const render = () => {
      // Smooth mouse position lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render Floating Neon Particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseAngle += p.pulseSpeed;

        // Wrap around screen edges smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Mouse displacement effect
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let dynamicRadius = p.radius + Math.sin(p.pulseAngle) * 0.6;

        if (dist < 140 && !isTouch) {
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 1.2;
          p.y -= (dy / dist) * force * 1.2;
          dynamicRadius += force * 1.5;
        }

        const currentAlpha = Math.min(1, Math.max(0.1, p.alpha + Math.sin(p.pulseAngle) * 0.15));

        // Draw Soft Glowing Neon Particle Body
        ctx.shadowColor = p.color.hex;
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, dynamicRadius), 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow for performance
        ctx.shadowBlur = 0;

        // Draw connections between nearby neon particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 90) {
            const lineAlpha = (1 - pdist / 90) * 0.12;
            ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
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
      className="pointer-events-none fixed inset-0 z-0 opacity-75 dark:opacity-65"
    />
  );
}
