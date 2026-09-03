import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, RefreshCw, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OtpVerificationCard({ email, maskedEmail, onVerificationSuccess, onCancel }) {
  const { setUser } = useAuth();
  const { showToast } = useToast();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 60-second Countdown Timer state
  const [timerSecs, setTimerSecs] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef([]);

  // Auto-start countdown timer
  useEffect(() => {
    if (timerSecs <= 0) return;
    const interval = setInterval(() => {
      setTimerSecs((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSecs]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle single digit input change
  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste if multiple digits pasted into a single box
      handlePasteData(value);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value.replace(/\D/g, ''); // Numeric only
    setOtpDigits(newDigits);
    setError('');

    // Advance focus to next input if digit entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle full 6-digit paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePasteData(pastedData);
  };

  const handlePasteData = (data) => {
    const digits = data.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 0) return;

    const newDigits = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      newDigits[i] = d;
    });
    setOtpDigits(newDigits);
    setError('');

    // Focus last filled input or next empty input
    const nextIndex = Math.min(digits.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  // Submit OTP Verification
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const { data } = await API.post('/auth/verify-otp', {
        email,
        otp: fullOtp,
      });

      setLoading(false);
      setSuccessMsg('Email verified successfully! Logging you in...');
      showToast('Email verified successfully!', 'success');

      if (data.token) {
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
      }

      setTimeout(() => {
        if (onVerificationSuccess) {
          onVerificationSuccess(data);
        }
      }, 1000);

    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Invalid verification code. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (timerSecs > 0 || resendLoading) return;

    try {
      setResendLoading(true);
      setError('');
      setSuccessMsg('');

      const { data } = await API.post('/auth/resend-otp', { email });
      setResendLoading(false);
      setTimerSecs(60);
      setOtpDigits(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();

      showToast(data.message || 'A new verification code has been sent to your email.', 'info');
    } catch (err) {
      setResendLoading(false);
      const msg = err.response?.data?.message || 'Failed to resend verification code.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-2xl relative z-10 text-center">
      
      {/* Icon Badge */}
      <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-100 dark:bg-cyan-950/80 border-2 border-sky-500 flex items-center justify-center shadow-lg">
        <Mail className="w-8 h-8 text-sky-600 dark:text-cyan-400" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-cyan-500/10 text-sky-800 dark:text-cyan-300 text-xs font-extrabold border border-sky-200 dark:border-cyan-500/30">
          <KeyRound className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
          <span>EMAIL VERIFICATION</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Enter Verification Code</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          We've sent a 6-digit verification code to:
        </p>
        <div className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-sky-600 dark:text-cyan-300 font-bold text-xs border border-slate-200 dark:border-slate-800 font-mono">
          {maskedEmail || email}
        </div>
        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
          💡 Check your Spam / Junk or Promotions folder if it doesn't appear in Inbox.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 text-left">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 6-Digit OTP Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-sky-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all shadow-sm"
              disabled={loading || !!successMsg}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || otpDigits.join('').length !== 6 || !!successMsg}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 dark:from-cyan-500 dark:via-blue-600 dark:to-cyan-500 hover:from-sky-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify Code</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend OTP & Countdown */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={timerSecs > 0 || resendLoading}
            className="font-bold text-sky-600 dark:text-cyan-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${resendLoading ? 'animate-spin' : ''}`} />
            <span>
              {timerSecs > 0 ? `Resend OTP in ${timerSecs}s` : 'Resend OTP'}
            </span>
          </button>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold transition-all"
          >
            ← Use a different email address
          </button>
        )}
      </div>

      {/* Security Footer Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Cryptographically Secured SHA-256 6-Digit OTP</span>
      </div>

    </div>
  );
}
