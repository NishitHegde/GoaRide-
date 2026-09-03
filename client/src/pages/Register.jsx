import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name.trim(), email.trim(), phone.trim(), password);
      setLoading(false);
      
      // Navigate to Sign In page so OTP verification happens exclusively on Sign In
      navigate('/login', {
        state: {
          prefillEmail: email.trim(),
          infoMessage: 'Registration successful! Please sign in to verify your email address.',
        },
      });
    } catch (err) {
      setLoading(false);
      console.error('Registration error:', err);
      const errMsg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot connect to backend server. Make sure backend is running.'
          : 'Registration failed. Please check form details.');
      setError(errMsg);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-orange-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* REGISTRATION FORM */}
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-cyan-500/10 text-sky-800 dark:text-cyan-300 text-xs font-extrabold border border-sky-200 dark:border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
            <span>Join GoaRide</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Rent self-drive bikes & cars instantly in Goa</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 dark:from-cyan-500 dark:via-blue-600 dark:to-cyan-500 hover:from-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Create GoaRide Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Encrypted 256-bit Account Setup</span>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-600 dark:text-slate-400 font-medium pt-3 border-t border-slate-200 dark:border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-600 dark:text-cyan-400 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>

    </div>
  );
}
