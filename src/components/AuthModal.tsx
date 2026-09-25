import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';
import { X, BookOpen, User, Mail, Lock, Shield, Sparkles, KeyRound, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'admin' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signInWithEmail, signUpWithEmail, adminSignIn, googleSignIn, requestPasswordReset, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin' | 'forgot' | 'reset'>(initialMode);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetFormState = (newMode: typeof mode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await signUpWithEmail(email.trim(), password, fullName.trim(), confirmPassword);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to create account.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signin') {
      if (!email.trim() || !password) {
        setErrorMessage('Please enter your email and password.');
        return;
      }

      setLoading(true);
      try {
        await signInWithEmail(email.trim(), password);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'admin') {
      if (!email.trim() || !password) {
        setErrorMessage('Please provide administrator credentials.');
        return;
      }

      setLoading(true);
      try {
        await adminSignIn(email.trim(), password);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Administrator authentication failed. Unauthorized access.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMessage('Please enter your email address.');
        return;
      }

      setLoading(true);
      try {
        const res = await requestPasswordReset(email.trim());
        setSuccessMessage(res.message || 'If an account exists, a reset code has been issued.');
        if (res.resetToken) {
          setResetToken(res.resetToken);
          setTimeout(() => {
            setMode('reset');
          }, 1500);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to request password reset.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'reset') {
      if (!email.trim() || !resetToken.trim() || !password) {
        setErrorMessage('Please fill in all reset fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await resetPassword(email.trim(), resetToken.trim(), password, confirmPassword);
        setSuccessMessage('Password reset successfully! You can now sign in.');
        setTimeout(() => {
          setMode('signin');
          setPassword('');
          setConfirmPassword('');
        }, 1500);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to reset password.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleClick = () => {
    setErrorMessage(null);
    setIsGoogleChooserOpen(true);
  };

  const handleSelectGoogleAccount = async (account: { email: string; name: string; avatar: string }) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await googleSignIn(account.email, account.name, account.avatar);
      setIsGoogleChooserOpen(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
          {/* Mobile drag handle */}
          <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${
                mode === 'admin' ? 'bg-purple-700' : 'bg-gradient-to-br from-amber-600 to-amber-800'
              }`}>
                {mode === 'admin' ? <Shield className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 block leading-tight">
                  {mode === 'admin' ? 'Novella Staff Portal' : 'Novella Storytelling'}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {mode === 'admin' 
                    ? 'Authorized Admin Verification' 
                    : mode === 'signup' 
                    ? 'Join & Read 2 Books Free' 
                    : mode === 'forgot' || mode === 'reset'
                    ? 'Account Recovery'
                    : 'Welcome Back Reader'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto touch-scroll flex-1">
          {/* Top Mode Selector Tabs */}
          {mode !== 'forgot' && mode !== 'reset' && (
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => resetFormState('signin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => resetFormState('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => resetFormState('admin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                  mode === 'admin'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign In (for Customer Sign In / Sign Up) */}
          {(mode === 'signin' || mode === 'signup') && (
            <>
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                <span className="shrink-0 px-2 text-[10px] text-zinc-400 uppercase tracking-wider">Or with email</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
              </div>
            </>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
            {/* Customer Sign Up Fields */}
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chimamanda Adichie"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                {mode === 'admin' ? 'Admin Staff Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'admin' ? 'admin@novella.app' : 'reader@example.com'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                />
              </div>
            </div>

            {/* Password Reset Token input */}
            {mode === 'reset' && (
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Reset Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30 font-mono tracking-widest uppercase"
                  />
                </div>
              </div>
            )}

            {/* Password input for Sign In, Sign Up, Admin, and Reset */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => resetFormState('forgot')}
                      className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password input for Sign Up & Reset */}
            {(mode === 'signup' || mode === 'reset') && (
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                  />
                </div>
              </div>
            )}

            {/* Demo Credential Assistant */}
            {mode === 'admin' && (
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-[11px] text-purple-900 dark:text-purple-200 space-y-1">
                <span className="font-bold flex items-center gap-1 text-purple-800 dark:text-purple-300">
                  <Shield className="w-3 h-3" /> Default Super Admin:
                </span>
                <p className="font-mono text-[10px]">admin@novella.app / NovellaAdmin2026!</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-h-[46px] ${
                mode === 'admin'
                  ? 'bg-purple-700 hover:bg-purple-800'
                  : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'signup' ? (
                <>
                  <span>Create Customer Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : mode === 'admin' ? (
                <>
                  <span>Verify Administrator Access</span>
                  <Shield className="w-3.5 h-3.5" />
                </>
              ) : mode === 'forgot' ? (
                <span>Request Recovery Code</span>
              ) : mode === 'reset' ? (
                <span>Reset & Set New Password</span>
              ) : (
                <>
                  <span>Sign In to Novella</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer mode toggles */}
          <div className="pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {mode === 'forgot' || mode === 'reset' ? (
              <button
                type="button"
                onClick={() => resetFormState('signin')}
                className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                Back to Sign In
              </button>
            ) : mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => resetFormState('signup')}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Create one for free
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => resetFormState('signin')}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => resetFormState('signin')}
                className="font-semibold text-zinc-600 dark:text-zinc-400 hover:underline"
              >
                Switch to Customer Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Google Account Selector Dialog */}
      <GoogleAccountChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </>
  );
};
