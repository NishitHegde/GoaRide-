import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device is touch screen
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });

      // Check if mouse is hovering over interactive clickable elements
      const target = e.target;
      const isInteractive = !!target.closest(
        'button, a, input, select, textarea, [role="button"], .glass-card, .glass-panel'
      );
      setIsHovered(isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Inner Glowing Cursor Dot */}
      <div
        className="pointer-events-none fixed z-50 rounded-full bg-sky-400 dark:bg-cyan-400 transition-transform duration-75 ease-out shadow-lg shadow-sky-500/50"
        style={{
          width: '8px',
          height: '8px',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 2.5 : 1})`,
        }}
      />

      {/* Outer Smooth Lag Ring */}
      <div
        className="pointer-events-none fixed z-50 rounded-full border border-sky-400/60 dark:border-cyan-400/60 transition-all duration-200 ease-out backdrop-blur-[1px]"
        style={{
          width: '36px',
          height: '36px',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.6 : 1})`,
          backgroundColor: isHovered ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
        }}
      />
    </>
  );
}
