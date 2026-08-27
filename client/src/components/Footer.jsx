import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-amber-500/20 dark:border-amber-500/20 bg-slate-100/90 dark:bg-[#070913]/95 backdrop-blur-xl text-slate-600 dark:text-slate-400 text-xs mt-auto py-8 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link to="/" className="logo-wrapper flex items-center gap-2 group select-none">
            <div className="logo-icon-box relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/80 border border-amber-500/40 overflow-hidden shadow-md">
              <div className="flex items-center gap-0.5 text-xs z-10">
                <span className="anim-palm text-[10px]" role="img" aria-label="palm tree">🌴</span>
                <span className="anim-bike text-xs" role="img" aria-label="bike">🏍️</span>
              </div>
              <div className="animated-road-line absolute bottom-0.5 left-0 right-0 h-[2px] opacity-90" />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="neon-goaride-text text-lg tracking-tight">
                GoaRide
              </span>
              <span className="neon-tagline text-[6.5px] mt-0.5 tracking-wider font-extrabold">
                RIDE • EXPLORE • DISCOVER
              </span>
            </div>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Goa's AI Vehicle Rental Fleet</span>
        </div>

        {/* Limited Concise Nav Links */}
        <div className="flex items-center gap-6 font-bold text-slate-700 dark:text-slate-300 text-[12px]">
          <Link to="/vehicles" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">Fleet</Link>
          <Link to="/tracking" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">Live Map</Link>
          <Link to="/ai-assistant" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">AI Trip Bot</Link>
          <Link to="/bookings" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">Bookings</Link>
        </div>

        {/* 24/7 Helpline Badge & Copyright */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <a
            href="tel:+917588459115"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold hover:scale-105 transition-transform"
          >
            <PhoneCall className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>24/7 Support: +91 75884 59115</span>
          </a>
          <span className="font-semibold">© 2026 GoaRide</span>
        </div>

      </div>
    </footer>
  );
}
