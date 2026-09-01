import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { User, Mail, Phone, Lock, ArrowRight, Upload, Sparkles, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import OtpVerificationCard from '../components/OtpVerificationCard';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Verification View State
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
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
      const res = await register(name.trim(), email.trim(), phone.trim(), password);
      setLoading(false);
      setRegisteredEmail(email.trim());
      setMaskedEmail(res?.maskedEmail || email.trim());
      setIsSubmitted(true);
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

      {isSubmitted ? (
        /* GOOGLE-STYLE 6-DIGIT OTP VERIFICATION CARD */
        <OtpVerificationCard
          email={registeredEmail}
          maskedEmail={maskedEmail}
          onVerificationSuccess={() => navigate('/bookings')}
          onCancel={() => setIsSubmitted(false)}
        />
      ) : (
        /* REGISTRATION FORM */
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-2xl relative z-10">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-cyan-500/10 text-sky-800 dark:text-cyan-300 text-xs font-extrabold border border-sky-200 dark:border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              <span>Join GoaRide</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Join thousands of happy Goa travelers</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Avatar Upload Preview Box */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
              <img
                src={profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                alt="Avatar Preview"
                className="w-14 h-14 rounded-full object-cover border-2 border-sky-600 dark:border-cyan-500 shadow-md"
              />
              <div>
                <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-sky-100 dark:bg-cyan-500/20 text-sky-800 dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/40 text-xs font-bold hover:bg-sky-200 dark:hover:bg-cyan-500/30 transition-all flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Avatar</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Optional profile photo</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> Email Address
              </label>
              <input
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Password (min. 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-cyan-500 font-medium shadow-sm transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 dark:from-cyan-500 dark:via-blue-600 dark:to-cyan-500 hover:from-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Sending Code...' : 'Register'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Encrypted 256-bit Secure Registration</span>
          </div>

          {/* Footer Link */}
          <div className="text-center text-xs text-slate-600 dark:text-slate-400 font-medium pt-3 border-t border-slate-200 dark:border-slate-800">
            Already have a GoaRide account?{' '}
            <Link to="/login" className="text-sky-600 dark:text-cyan-400 font-bold hover:underline">
              Login Here
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
