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

    // 60 FPS Smooth Lerp & Trailing Motion Engine
    let animId;

    const render = () => {
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      // Smooth outer ring position lerp delay
      ringPos.current.x += (targetX - ringPos.current.x) * 0.18;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.18;

      // Update inner dot position directly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.8 : 1})`;
      }

      // Update outer ring position with smooth delay
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.75 : 1})`;
      }

      // Update trailing motion history points
      trailHistory.current.unshift({ x: targetX, y: targetY });
      if (trailHistory.current.length > 7) {
        trailHistory.current.pop();
      }

      // Draw subtle glowing cursor trail
      const canvas = trailCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          trailHistory.current.forEach((pt, i) => {
            const ratio = (trailHistory.current.length - i) / trailHistory.current.length;
            const radius = ratio * 3;
            const alpha = ratio * 0.25;

            ctx.fillStyle = `rgba(0, 210, 255, ${alpha})`;
            ctx.shadowColor = '#00d2ff';
            ctx.shadowBlur = 6;
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
      {/* Subtle Trailing Motion Canvas */}
      <canvas
        ref={trailCanvasRef}
        className="pointer-events-none fixed inset-0 z-50"
      />

      {/* Outer Smooth Lag Ring */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full border transition-colors duration-200 ${
          isHovered
            ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_24px_rgba(0,210,255,0.65)] backdrop-blur-[2px]'
            : 'border-sky-400/70 bg-transparent shadow-[0_0_12px_rgba(56,189,248,0.35)]'
        }`}
        style={{
          width: '32px',
          height: '32px',
          willChange: 'transform',
        }}
      />

      {/* Inner Central Bright Cursor Dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full bg-cyan-300 transition-all duration-150 ${
          isHovered
            ? 'shadow-[0_0_14px_#00d2ff] bg-cyan-200'
            : 'shadow-[0_0_8px_#38bdf8]'
        }`}
        style={{
          width: '6px',
          height: '6px',
          willChange: 'transform',
        }}
      />
    </>
  );
}
