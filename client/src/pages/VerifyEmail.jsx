import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { CheckCircle2, XCircle, Clock, ArrowRight, Mail, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import OtpVerificationCard from '../components/OtpVerificationCard';

export default function VerifyEmail() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [status, setStatus] = useState(token ? 'loading' : 'otp'); // 'loading' | 'success' | 'error' | 'expired' | 'otp'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(emailParam);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setStatus('otp');
      return;
    }

    const executeVerification = async () => {
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

          if (isExpired) {
            setStatus('expired');
            setMessage('This verification link has expired. Please enter the 6-digit code sent to your email.');
          } else {
            setStatus('error');
            setMessage(apiMsg);
          }
        }
      }
    };

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-amber-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      {status === 'otp' || status === 'expired' || status === 'error' ? (
        <OtpVerificationCard
          email={resendEmail}
          onVerificationSuccess={() => navigate('/bookings')}
          onCancel={() => navigate('/login')}
        />
      ) : status === 'loading' ? (
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-2xl relative z-10 text-center">
          <div className="space-y-6 py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-sky-100 dark:bg-cyan-950/80 border-2 border-sky-500 flex items-center justify-center animate-pulse">
              <RefreshCw className="w-8 h-8 text-sky-600 dark:text-cyan-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verifying Your Email...</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Validating verification token with GoaRide backend</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-2xl relative z-10 text-center">
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
                {message || 'Your GoaRide account is now fully verified. You can log in.'}
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
        </div>
      )}

    </div>
  );
}
