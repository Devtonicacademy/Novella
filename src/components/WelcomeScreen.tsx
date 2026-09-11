import React from 'react';
import { BookOpen, Sparkles, ShieldCheck, ChevronRight, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onAdminSignIn?: () => void;
  onGoogleSignIn: () => void;
  onExploreAsGuest: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSignIn,
  onSignUp,
  onAdminSignIn,
  onGoogleSignIn,
  onExploreAsGuest,
}) => {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Subtle literary background motif */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-amber-600/30 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center space-y-6 p-8 sm:p-10 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-2xl">
        {/* Brand Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-lg ring-8 ring-amber-600/10">
          <BookOpen className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Title and Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Novella</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
            Discover amazing stories and unlock your next adventure.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-reading leading-relaxed max-w-sm mx-auto pt-1">
            Immerse yourself in rich contemporary storytelling, folklore, and thrilling epics. Enjoy <strong>2 complete story books for free</strong> right now.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Google Sign In */}
          <button
            onClick={onGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
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

          {/* Email Sign In / Sign Up Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onSignUp}
              className="w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Sign Up
            </button>
            <button
              onClick={onSignIn}
              className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onExploreAsGuest}
              className="py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>Explore as Guest</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {onAdminSignIn && (
              <button
                onClick={onAdminSignIn}
                className="py-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium flex items-center gap-1 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* Trust banner */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center gap-6 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>2 Free Books Forever</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Paystack Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

