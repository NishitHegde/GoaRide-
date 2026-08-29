import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

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
      const isInteractive = !!(
        target &&
        typeof target.closest === 'function' &&
        target.closest('button, a, input, select, textarea, [role="button"], .glass-card, .glass-panel')
      );
      setIsHovered(isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 60 FPS Precision Lerp Engine
    let animId;

    const render = () => {
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      // Fast precision lerp for outer ring
      ringPos.current.x += (targetX - ringPos.current.x) * 0.25;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.25;

      // Update sharp micro-dot position
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.4 : 1})`;
      }

      // Update precision ring position
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Outer Precision Ring */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full transition-colors duration-150 ${
          isHovered
            ? 'border-1.5 border-cyan-400 bg-cyan-400/10 shadow-[0_0_12px_rgba(0,210,255,0.4)]'
            : 'border-1.5 border-sky-400/60 bg-transparent shadow-[0_0_6px_rgba(56,189,248,0.2)]'
        }`}
        style={{
          width: '20px',
          height: '20px',
          borderWidth: '1.5px',
          willChange: 'transform',
        }}
      />

      {/* Inner Central Sharp Micro-Dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full bg-cyan-400 transition-all duration-100 ${
          isHovered
            ? 'shadow-[0_0_8px_#00d2ff] bg-cyan-300'
            : 'shadow-[0_0_4px_#38bdf8]'
        }`}
        style={{
          width: '4px',
          height: '4px',
          willChange: 'transform',
        }}
      />
    </>
  );
}
