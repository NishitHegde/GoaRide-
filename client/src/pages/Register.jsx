import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { User, Mail, Phone, Lock, ArrowRight, Upload, Sparkles, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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

  // Post-Registration Email Verification Success Screen State
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [directVerifyUrl, setDirectVerifyUrl] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

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
      if (res?.verificationUrl) {
        setDirectVerifyUrl(res.verificationUrl);
      }
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

  const handleResendClick = async () => {
    if (!registeredEmail) return;
    try {
      setResendLoading(true);
      setResendStatus('');
      const { data } = await API.post('/auth/resend-verification', { email: registeredEmail });
      setResendLoading(false);
      setResendStatus(data.message || 'Verification email resent successfully!');
      showToast('Verification email resent successfully!', 'success');
    } catch (err) {
      setResendLoading(false);
      const msg = err.response?.data?.message || 'Failed to resend verification email.';
      setResendStatus(`Error: ${msg}`);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-orange-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-2xl relative z-10">
        
        {/* POST-REGISTRATION SUCCESS CHECK YOUR INBOX SCREEN */}
        {isSubmitted ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-sky-100 dark:bg-cyan-950/80 border-2 border-sky-500 flex items-center justify-center shadow-lg animate-bounce">
              <Mail className="w-10 h-10 text-sky-600 dark:text-cyan-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>REGISTRATION SUCCESSFUL</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Check Your Email</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                We've sent an official verification link to:
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-sky-700 dark:text-cyan-300 font-bold text-sm border border-slate-200 dark:border-slate-800 break-all">
                {registeredEmail}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                Please open your inbox and click the <strong>"Verify Email"</strong> button to activate your account before logging in.
              </p>
            </div>

            {directVerifyUrl && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-semibold space-y-2">
                <p>⚡ Direct Verification Link (Dev / Test Mode):</p>
                <a
                  href={directVerifyUrl}
                  className="block w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-center text-xs shadow-md transition-all"
                >
                  Verify Account Now ➔
                </a>
              </div>
            )}

            {resendStatus && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-sky-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-800">
                {resendStatus}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleResendClick}
                disabled={resendLoading}
                className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                <span>{resendLoading ? 'Resending Email...' : 'Resend Verification Email'}</span>
              </button>

              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Go to Login Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <>
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
                <span>{loading ? 'Creating Account...' : 'Register'}</span>
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
          </>
        )}

      </div>
    </div>
  );
}
