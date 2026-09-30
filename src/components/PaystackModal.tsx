import React, { useState, useEffect } from 'react';
import { Story } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, CheckCircle, ArrowRight, Loader2, Lock, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaystackModalProps {
  story: Story;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  story,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, unlockStory, refreshUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);

  useEffect(() => {
    api.getPaystackPublicKey().then((key) => {
      if (key && !key.includes('sample') && !key.includes('placeholder')) {
        setPublicKey(key);
        setIsLiveMode(true);
      } else if (key) {
        setPublicKey(key);
      }
    });
  }, []);

  if (!isOpen || !user) return null;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Initialize session on backend with metadata & authenticated user
      const payerEmail = user.email.toLowerCase().trim();
      const initRes = await api.initializePayment(payerEmail, story.id, story.priceNGN);
      const reference = initRes?.reference || initRes?.data?.reference || `NOV_${Date.now()}`;
      const accessCode = initRes?.data?.access_code || '';
      const authUrl = initRes?.data?.authorization_url || '';

      const isLivePopReady = Boolean(
        publicKey && 
        accessCode && 
        !accessCode.startsWith('mock_') && 
        authUrl && 
        !authUrl.includes('sandbox_') &&
        typeof (window as any).PaystackPop !== 'undefined'
      );

      // If live Paystack keys are present and PaystackPop is loaded, launch official Paystack Popup
      if (isLivePopReady) {
        const handler = (window as any).PaystackPop.setup({
          key: publicKey,
          email: payerEmail,
          amount: Math.round(story.priceNGN * 100),
          ref: reference,
          metadata: {
            storyId: story.id,
            storyTitle: story.title,
            customerEmail: payerEmail,
            custom_fields: [
              { display_name: 'Project', variable_name: 'project_name', value: 'Novella Stories' },
              { display_name: 'Book Title', variable_name: 'story_title', value: story.title },
              { display_name: 'Reader Email', variable_name: 'reader_email', value: payerEmail },
            ],
          },
          callback: async (response: any) => {
            const verifiedRef = response.reference || reference;
            try {
              const verifyRes = await api.verifyPayment(verifiedRef, payerEmail, story.id);
              if (verifyRes.status) {
                await unlockStory(story.id);
                await refreshUser();
                setSuccess(true);
                try {
                  confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
                } catch {}
                setTimeout(() => onSuccess(), 1800);
              } else {
                setErrorMessage('Payment verification unconfirmed by Paystack. Please contact support.');
              }
            } catch (vErr: any) {
              setErrorMessage(vErr.message || 'Payment verification failed');
            } finally {
              setProcessing(false);
            }
          },
          onClose: () => {
            setProcessing(false);
          },
        });

        handler.openIframe();
        return;
      }

      // Sandbox / Test Mode verification
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const verifyRes = await api.verifyPayment(reference, payerEmail, story.id);

      if (verifyRes.status) {
        await unlockStory(story.id);
        await refreshUser();
        setSuccess(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
        setTimeout(() => {
          onSuccess();
        }, 1800);
      } else {
        setErrorMessage('Payment verification failed. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing payment';
      setErrorMessage(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[92vh] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
        {/* Mobile drag indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-zinc-900 shrink-0">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Paystack Official Header */}
        <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight">
                <span>Paystack Checkout</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isLiveMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isLiveMode ? 'LIVE GATEWAY' : 'TEST SANDBOX'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Novella Official Merchant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto touch-scroll space-y-5 sm:space-y-6 flex-1">
          {success ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Payment Successful!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-sm mx-auto font-reading">
                <strong>{story.title}</strong> has been permanently unlocked and bound to <strong>{user.email}</strong>.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                <span>Opening Story Reader...</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment} className="space-y-5">
              {/* Order Summary Pill */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold block">
                    Paying For
                  </span>
                  <span className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {story.title}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display text-base font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">
                    ₦{story.priceNGN.toLocaleString()} NGN
                  </span>
                  <span className="text-[10px] text-zinc-400 block tabular-nums">
                    ${(story.priceUSD || 2.99).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Reader Account Verification */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>Linked Reader Account:</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{user.email}</span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Payment receipt & lifetime book access will be permanently stored on this account.
                </p>
              </div>

              {/* Gateway Mode Description */}
              {!isLiveMode ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Paystack Test Environment</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    You are in test sandbox mode. In live production with your merchant keys configured in Settings, readers are redirected to the official Paystack gateway to pay with real Cards, USSD, or Bank Transfers.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Paystack Live Popup</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                    Clicking below will securely open the Paystack payment gateway overlay.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-70 min-h-[46px]"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing with Paystack...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {isLiveMode ? `Launch Paystack (₦${story.priceNGN.toLocaleString()})` : `Complete Test Payment (₦${story.priceNGN.toLocaleString()})`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                <span>256-bit SSL encrypted</span>
                <span>·</span>
                <span>PCI-DSS Level 1 Certified</span>
                <span>·</span>
                <span>Paystack Gateway</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
