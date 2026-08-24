import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailCanvasRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const trailHistory = useRef([]);

  useEffect(() => {
    // Check if device is touch screen
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Check hover over interactive clickable elements
      const target = e.target;
      const isInteractive = !!target.closest(
        'button, a, input, select, textarea, [role="button"], .glass-card, .glass-panel'
      );
      setIsHovered(isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 60 FPS Smooth Lerp & Neon Trailing Motion Engine
    let animId;
    let pulseAngle = 0;

    const render = () => {
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      // Smooth outer ring position lerp delay
      ringPos.current.x += (targetX - ringPos.current.x) * 0.16;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.16;

      pulseAngle += 0.05;
      const pulseScale = 1 + Math.sin(pulseAngle) * 0.15;

      // Update inner dot position directly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%) scale(${
          isHovered ? 2.2 : pulseScale
        })`;
      }

      // Update outer ring position with smooth delay
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${
          isHovered ? 1.85 : 1
        })`;
      }

      // Update trailing motion history points
      trailHistory.current.unshift({ x: targetX, y: targetY });
      if (trailHistory.current.length > 10) {
        trailHistory.current.pop();
      }

      // Draw glowing neon cursor particle trail
      const canvas = trailCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          trailHistory.current.forEach((pt, i) => {
            const ratio = (trailHistory.current.length - i) / trailHistory.current.length;
            const radius = ratio * 3.5;
            const alpha = ratio * 0.35;

            ctx.fillStyle = i % 2 === 0 ? `rgba(0, 210, 255, ${alpha})` : `rgba(99, 102, 241, ${alpha})`;
            ctx.shadowColor = i % 2 === 0 ? '#00d2ff' : '#6366f1';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }
      }

      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      const canvas = trailCanvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [isHovered]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Trailing Motion Particle Canvas */}
      <canvas
        ref={trailCanvasRef}
        className="pointer-events-none fixed inset-0 z-50"
      />

      {/* Outer Smooth Lag Neon Ring */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full border-2 transition-all duration-200 ${
          isHovered
            ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_30px_rgba(0,210,255,0.85)] backdrop-blur-[2px]'
            : 'border-cyan-400/80 bg-transparent shadow-[0_0_16px_rgba(0,210,255,0.45)]'
        }`}
        style={{
          width: '38px',
          height: '38px',
          willChange: 'transform',
        }}
      />

      {/* Inner Central Glowing Pulse Dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full transition-all duration-150 ${
          isHovered
            ? 'bg-cyan-200 shadow-[0_0_20px_#00d2ff]'
            : 'bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_14px_#00d2ff]'
        }`}
        style={{
          width: '8px',
          height: '8px',
          willChange: 'transform',
        }}
      />
    </>
  );
}
