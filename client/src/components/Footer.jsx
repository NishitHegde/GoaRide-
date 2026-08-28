import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-amber-500/20 dark:border-amber-500/20 bg-slate-100/90 dark:bg-[#070913]/95 backdrop-blur-xl text-slate-600 dark:text-slate-400 text-xs mt-auto py-8 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link to="/" className="goaride-boxed-logo group select-none flex items-center gap-2 px-3 py-1.5 rounded-xl">
            <div className="relative flex items-center justify-center p-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/30 dark:border-[#00eaff]/40 shadow-inner">
              <svg className="w-4 h-4 anim-car text-cyan-600 dark:text-[#00eaff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-3.4-2.2-4.2C13.1 5.2 12 5 11 5H7C5.8 5 4.8 5.8 4.3 7L2.4 11.2C2.1 11.8 2 12.4 2 13v3c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" className="stroke-emerald-600 dark:stroke-[#00ff9d]" />
                <circle cx="17" cy="17" r="2" className="stroke-emerald-600 dark:stroke-[#00ff9d]" />
                <path d="M5 11h14" className="stroke-cyan-500/60 dark:stroke-[#00eaff]/60" />
                <path d="M9 5v5" />
                <path d="M13 3.5c1 0 2 .5 2.5 1.5M13 3.5c-.8.8-1.5 2-1.5 3M13 3.5c.5-.8 1.8-1.2 2.8-.8" className="stroke-emerald-500 dark:stroke-[#00ff9d] stroke-[1.2]" />
              </svg>
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="goaride-wordmark text-base font-black tracking-tight">
                GoaRide
              </span>
              <span className="goaride-boxed-tagline text-[6px] mt-0.5 tracking-wider font-extrabold">
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
