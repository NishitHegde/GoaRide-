import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/90 dark:bg-[#070e1b]/90 backdrop-blur-xl text-slate-600 dark:text-slate-400 text-xs mt-auto py-8 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="p-1.5 bg-gradient-to-tr from-sky-600 to-blue-700 rounded-lg text-white text-sm">🚗</span>
            <span>Goa<span className="text-sky-600 dark:text-cyan-400">Ride</span></span>
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
