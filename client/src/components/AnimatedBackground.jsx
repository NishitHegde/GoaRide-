import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40 dark:opacity-30">
      {/* Floating Ambient Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-sky-500/25 to-blue-600/10 blur-[120px] animate-pulse duration-10000" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-500/20 to-teal-500/10 blur-[140px] animate-pulse duration-7000" />
      <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-indigo-500/20 to-purple-600/10 blur-[130px] animate-pulse duration-12000" />

      {/* Floating Micro Particles Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
    </div>
  );
}
