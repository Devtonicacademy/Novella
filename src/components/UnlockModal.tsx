import React, { useState } from 'react';
import { Story } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookCover } from './BookCover';
import { PaystackModal } from './PaystackModal';
import { X, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface UnlockModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (story: Story) => void;
  onOpenAuth: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  story,
  isOpen,
  onClose,
  onUnlocked,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [showPaystackCheckout, setShowPaystackCheckout] = useState(false);

  if (!isOpen || !story) return null;

  const handlePaystackSuccess = () => {
    setShowPaystackCheckout(false);
    onUnlocked(story);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Premium Manuscript</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 text-center space-y-5">
            {/* Book Display */}
            <div className="flex justify-center">
              <BookCover story={story} size="sm" isUnlocked={false} />
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {story.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                By {story.author} · {story.totalChapters} Chapters ({story.readTime})
              </p>
            </div>

            {/* Price Card */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center">
              <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Lifetime Reader Pass
              </div>
              <div className="flex items-baseline justify-center gap-2 mt-1">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tabular-nums">
                  ₦{story.priceNGN.toLocaleString()} NGN
                </span>
                <span className="text-xs text-zinc-500 tabular-nums">
                  (${(story.priceUSD || 2.99).toFixed(2)} USD)
                </span>
              </div>
            </div>

            {/* Inclusions */}
            <div className="space-y-2 text-left text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Immediate full access to all {story.totalChapters} chapters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bookmark synching & personal reading notes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Custom typography & dark mode reader themes</span>
              </div>
            </div>

            {/* Paystack Action Button */}
            <button
              onClick={() => setShowPaystackCheckout(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Pay ₦{story.priceNGN.toLocaleString()} with Paystack</span>
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Paystack Payment Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* Paystack Interactive Payment Modal */}
      {showPaystackCheckout && (
        <PaystackModal
          story={story}
          isOpen={showPaystackCheckout}
          onClose={() => setShowPaystackCheckout(false)}
          onSuccess={handlePaystackSuccess}
        />
      )}
    </>
  );
};
