import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CheckCircle2, XCircle, Clock, ArrowRight, Mail, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'expired'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const executeVerification = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setMessage('No verification token provided in URL.');
        }
        return;
      }

      try {
        const { data } = await API.get(`/auth/verify-email/${token}`);
        if (isMounted) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          showToast('Email verified successfully! You can now log in.', 'success');
        }
      } catch (err) {
        if (isMounted) {
          const apiMsg = err.response?.data?.message || 'Email verification failed.';
          const isExpired = err.response?.data?.isExpired || apiMsg.toLowerCase().includes('expired');
          const emailFromApi = err.response?.data?.email || '';

          if (emailFromApi) setResendEmail(emailFromApi);

          if (isExpired) {
            setStatus('expired');
            setMessage('This verification link has expired (links expire after 30 minutes).');
          } else {
            setStatus('error');
            setMessage(apiMsg);
          }
          showToast(apiMsg, 'error');
        }
      }
    };

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResendSubmit = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendError('Please enter your email address.');
      return;
    }

    try {
      setResendLoading(true);
      setResendError('');
      setResendMessage('');

      const { data } = await API.post('/auth/resend-verification', { email: resendEmail.trim() });
      setResendLoading(false);
      setResendMessage(data.message || 'Verification link sent successfully! Check your inbox.');
      showToast('Verification email resent successfully!', 'success');
    } catch (err) {
      setResendLoading(false);
      const errMsg = err.response?.data?.message || 'Failed to resend verification email.';
      setResendError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-amber-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-2xl relative z-10 text-center">

        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="space-y-6 py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-sky-100 dark:bg-cyan-950/80 border-2 border-sky-500 flex items-center justify-center animate-pulse">
              <RefreshCw className="w-8 h-8 text-sky-600 dark:text-cyan-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verifying Your Email...</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Validating cryptographic verification token with GoaRide backend</p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="space-y-6 py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ACCOUNT ACTIVATED</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Email Verified Successfully!</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {message || 'Your GoaRide account is now fully verified. You can log in to access vehicle rentals, live tracking & trip bot.'}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 hover:from-sky-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* EXPIRED OR ERROR STATE */}
        {(status === 'expired' || status === 'error') && (
          <div className="space-y-6 py-2 text-left">
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center shadow-lg">
                {status === 'expired' ? (
                  <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {status === 'expired' ? 'Verification Link Expired' : 'Verification Failed'}
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold leading-relaxed bg-rose-50 dark:bg-rose-950/50 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                {message}
              </p>
            </div>

            {/* RESEND VERIFICATION FORM */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                  <span>Request New Verification Link</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Enter your registered email address to receive a fresh verification link.</p>
              </div>

              {resendMessage && (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300">
                  {resendMessage}
                </div>
              )}

              {resendError && (
                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-semibold border border-rose-300">
                  {resendError}
                </div>
              )}

              <form onSubmit={handleResendSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
                  required
                />

                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  <span>{resendLoading ? 'Sending Email...' : 'Resend Verification Email'}</span>
                </button>
              </form>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline">
                ← Back to Login
              </Link>
            </div>

          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-2 border-t border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Cryptographically Secured SHA-256 Verification</span>
        </div>

      </div>
    </div>
  );
}
