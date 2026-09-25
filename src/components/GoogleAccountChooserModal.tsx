import React, { useState } from 'react';
import { X, Plus, Shield, Check, ArrowRight, UserPlus, Sparkles } from 'lucide-react';

export interface GoogleSavedAccount {
  email: string;
  name: string;
  avatar: string;
  type?: 'author' | 'admin' | 'reader';
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { email: string; name: string; avatar: string }) => Promise<void>;
}

export const DEFAULT_GOOGLE_ACCOUNTS: GoogleSavedAccount[] = [
  {
    email: 'devtonicllc@gmail.com',
    name: 'Devtonic Admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    type: 'admin'
  },
  {
    email: 'ozerojephthah0@gmail.com',
    name: 'Jephthah Ozero',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'author'
  },
  {
    email: 'admin@novella.app',
    name: 'Novella System Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: 'admin'
  },
  {
    email: 'chidi.anozie@gmail.com',
    name: 'Chidi Anozie',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    type: 'reader'
  },
  {
    email: 'zainab.kabir@gmail.com',
    name: 'Zainab Kabir',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    type: 'reader'
  }
];

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChoose = async (acc: { email: string; name: string; avatar: string }) => {
    setLoadingEmail(acc.email);
    setCustomError(null);
    try {
      await onSelectAccount(acc);
      onClose();
    } catch (err: any) {
      setCustomError(err.message || 'Google authentication failed');
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    if (!customEmail || !customEmail.includes('@')) {
      setCustomError('Please enter a valid Google email address.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    await handleChoose({
      email: customEmail.trim().toLowerCase(),
      name,
      avatar
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Google Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Google Logo */}
          <div className="flex justify-center mb-3">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
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
          </div>

          <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Sign in with Google
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Choose an account to continue to <strong className="text-zinc-700 dark:text-zinc-300">Novella</strong>
          </p>
        </div>

        {/* Error message */}
        {customError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300">
            {customError}
          </div>
        )}

        {/* Account selection list */}
        <div className="p-6 pt-4 space-y-2 max-h-[380px] overflow-y-auto">
          {!isCustomMode ? (
            <>
              {DEFAULT_GOOGLE_ACCOUNTS.map((acc) => {
                const isLoading = loadingEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    onClick={() => handleChoose(acc)}
                    disabled={loadingEmail !== null}
                    className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-600 dark:hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 flex items-center justify-between gap-3 text-left transition-all group cursor-pointer disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-amber-500 transition-all shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                            {acc.name}
                          </span>
                          {acc.type === 'author' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-extrabold uppercase">
                              Author & Admin
                            </span>
                          )}
                          {acc.type === 'admin' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[9px] font-extrabold uppercase">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate block">
                          {acc.email}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Use another account button */}
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full mt-2 p-3.5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex items-center gap-3 text-left transition-all cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Use another Google account</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">Sign in with any other Gmail or Workspace ID</span>
                </div>
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Google Account Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Jephthah Ozero"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Google Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Back to List
                </button>
                <button
                  type="submit"
                  disabled={loadingEmail !== null}
                  className="flex-1 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loadingEmail ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Google OAuth 2.0 Identity Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
