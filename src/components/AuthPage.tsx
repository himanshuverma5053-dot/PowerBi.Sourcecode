import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ADMIN_CONFIG, checkIsAdmin } from '../utils/admin';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight, ShieldCheck, Disc, MailCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onSuccess: (targetTab?: string) => void;
  showToast: (msg: string) => void;
  setCurrentUser?: (user: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  onSuccess,
  showToast,
  setCurrentUser,
}) => {
  const [mode, setMode] = useState<'signin'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email verification state
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [isUnconfirmedError, setIsUnconfirmedError] = useState(false);

  const handleResendEmail = async (targetEmail: string) => {
    if (!targetEmail) return;
    setResendLoading(true);
    setResendSuccess(null);
    setError(null);
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (resendErr) {
        setError(resendErr.message);
      } else {
        setResendSuccess(`A new verification email was sent to ${targetEmail}. Please check your inbox.`);
        showToast('Verification email resent successfully.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(null);
    setIsUnconfirmedError(false);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          // Check if session is null or email_confirmed_at is falsy -> implies Email Verification Required
          if (!data.session || !data.user?.confirmed_at) {
            setVerificationSent(true);
            setVerificationEmail(email);
            showToast('Verification email sent! Please check your inbox.');
          } else {
            const loggedInEmail = data.user?.email || email;
            const isUserAdmin = checkIsAdmin(undefined, loggedInEmail);
            const userDisp = isUserAdmin ? ADMIN_CONFIG.username : (loggedInEmail.split('@')[0] || 'User');
            if (setCurrentUser) {
              setCurrentUser(userDisp);
            }
            if (isUserAdmin) {
              showToast(`Administrator sign up verified. Welcome, ${ADMIN_CONFIG.username}!`);
            } else {
              showToast('Sign up successful! Welcome to Magadh Tyres.');
            }
            if (window.history.pushState) {
              window.history.pushState({}, '', '/');
            }
            onSuccess(isUserAdmin ? 'admin' : 'account');
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          const errMsg = signInError.message || '';
          setError(errMsg);
          if (errMsg.toLowerCase().includes('confirm') || errMsg.toLowerCase().includes('not confirmed') || errMsg.toLowerCase().includes('unconfirmed')) {
            setIsUnconfirmedError(true);
          }
        } else {
          const loggedInEmail = data.user?.email || email;
          const isUserAdmin = checkIsAdmin(undefined, loggedInEmail);
          const userDisp = isUserAdmin ? ADMIN_CONFIG.username : (loggedInEmail.split('@')[0] || 'User');

          if (setCurrentUser) {
            setCurrentUser(userDisp);
          }

          if (isUserAdmin) {
            showToast(`Welcome Administrator, ${ADMIN_CONFIG.username}! Redirecting to Admin Console...`);
          } else {
            showToast('Signed in successfully! Redirecting to Customer Dashboard...');
          }

          if (window.history.pushState) {
            window.history.pushState({}, '', '/');
          }
          onSuccess(isUserAdmin ? 'admin' : 'account');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xs relative overflow-hidden text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-2xs">
            <MailCheck className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 font-display">Check Your Email</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We sent a verification link to <strong className="text-slate-900 font-bold">{verificationEmail}</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Please click the link in your email to verify your account before signing in.
            </p>
          </div>

          {resendSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resendSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="button"
              disabled={resendLoading}
              onClick={() => handleResendEmail(verificationEmail)}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-700" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationSent(false);
                setMode('signin');
                setError(null);
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-300" />
              <span>I've Verified — Proceed to Sign In</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Secured by Supabase Authentication</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xs relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-2xs mb-4">
            <Disc className="w-8 h-8 animate-spin-slow text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Sign In to Magadh Tyres
          </h2>
          <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto">
            Enter your credentials to access your customer dashboard or admin console.
          </p>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Success Banner */}
          {resendSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{resendSuccess}</div>
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2 animate-fade-in">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
              {isUnconfirmedError && email && (
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={resendLoading}
                    onClick={() => handleResendEmail(email)}
                    className="w-full py-2 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                    <span>Resend Verification Email to {email}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Disc className="w-4 h-4 animate-spin text-slate-300" />
                <span>Processing...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Sign In Now</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Secured by Supabase Authentication</span>
        </div>
      </div>
    </div>
  );
};
