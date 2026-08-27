import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Car, MapPin, Bot, Calendar, Shield, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#070913]/85 backdrop-blur-xl border-b border-amber-500/20 dark:border-amber-500/20 shadow-sm transition-all">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="logo-wrapper flex items-center gap-2.5 group select-none">
            {/* Animated Icon Box */}
            <div className="logo-icon-box relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-950/90 border border-[#00eaff]/50 overflow-hidden shadow-lg transition-transform">
              {/* Floating Palm & Bike */}
              <div className="flex items-center gap-0.5 text-sm z-10">
                <span className="anim-palm text-xs" role="img" aria-label="palm tree">🌴</span>
                <span className="anim-bike text-sm" role="img" aria-label="bike">🏍️</span>
              </div>
              {/* Animated Road / Wave Line at bottom of icon */}
              <div className="animated-road-line absolute bottom-1 left-0 right-0 h-[2.5px] opacity-90" />
            </div>

            {/* Wordmark + Tagline */}
            <div className="flex flex-col justify-center leading-none">
              <span className="neon-goaride-text text-xl sm:text-2xl tracking-tight">
                GoaRide
              </span>
              <span className="neon-tagline mt-0.5 tracking-wider font-extrabold">
                RIDE • EXPLORE • DISCOVER
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-semibold text-xs text-slate-700 dark:text-slate-300">
            <Link
              to="/vehicles"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/vehicles')
                  ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-extrabold border border-amber-300 dark:border-amber-500/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Fleet</span>
            </Link>

            <Link
              to="/tracking"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/tracking')
                  ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-extrabold border border-amber-300 dark:border-amber-500/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Live Map</span>
            </Link>

            <Link
              to="/ai-assistant"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/ai-assistant')
                  ? 'bg-sky-50 dark:bg-cyan-500/20 text-sky-700 dark:text-cyan-300 font-extrabold border border-sky-200 dark:border-cyan-500/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>AI Trip Bot</span>
            </Link>

            {user && (
              <Link
                to="/bookings"
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive('/bookings')
                    ? 'bg-sky-50 dark:bg-cyan-500/20 text-sky-700 dark:text-cyan-300 font-extrabold border border-sky-200 dark:border-cyan-500/40'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>My Bookings</span>
              </Link>
            )}

            <Link
              to="/admin"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-extrabold border border-amber-300 dark:border-amber-500/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Admin Console</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-purple-600" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/bookings" className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name.split(' ')[0]}</span>
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-sky-600 object-cover"
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 text-white shadow-md shadow-sky-600/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#070e1b]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2">
              <img
                src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-sky-600 object-cover"
              />
              <div className="flex-grow">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-bold block">{user.email}</span>
              </div>
            </div>
          )}

          <Link
            to="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Car className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            <span>Goa Fleet</span>
          </Link>

          <Link
            to="/tracking"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Live Vehicle Tracking</span>
          </Link>

          <Link
            to="/ai-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>AI Trip Concierge</span>
          </Link>

          {user && (
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>My Bookings & Profile</span>
            </Link>
          )}

          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-sm font-bold text-amber-900 dark:text-amber-300 transition-colors"
          >
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Admin Console</span>
          </Link>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({user.name.split(' ')[0]})</span>
              </button>
            ) : (
              <div className="flex gap-2.5 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-3 text-center rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-3 text-center rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 font-bold text-xs text-white shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
