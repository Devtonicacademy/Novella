import React, { useState } from 'react';
import { Story } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, CreditCard, Building, Smartphone, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
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
  const { user, unlockStory } = useAuth();
  const [email, setEmail] = useState(user?.email || 'reader@storyflow.app');
  const [paymentChannel, setPaymentChannel] = useState<'card' | 'bank' | 'ussd'>('card');
  const [cardNumber, setCardNumber] = useState('4084 0840 8408 4084');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('381');
  const [bankSelected, setBankSelected] = useState('Guaranty Trust Bank (GTBank)');
  const [ussdCode, setUssdCode] = useState('*737*1*2500#');

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');

  React.useEffect(() => {
    api.getPaystackPublicKey().then((key) => {
      if (key) setPublicKey(key);
    });
  }, []);

  if (!isOpen) return null;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Initialize session on backend with metadata & project prefix
      const initRes = await api.initializePayment(email, story.id, story.priceNGN);
      const reference = initRes?.reference || initRes?.data?.reference || `NOV_${Date.now()}`;
      const accessCode = initRes?.data?.access_code || '';
      const authUrl = initRes?.data?.authorization_url || '';

      const isLiveCheckout = Boolean(
        publicKey && 
        accessCode && 
        !accessCode.startsWith('mock_') && 
        authUrl && 
        !authUrl.includes('sandbox_')
      );

      // If live Paystack keys are present and PaystackPop is loaded, launch official Paystack Popup
      if (isLiveCheckout && typeof (window as any).PaystackPop !== 'undefined') {
        const handler = (window as any).PaystackPop.setup({
          key: publicKey,
          email: email.trim(),
          amount: Math.round(story.priceNGN * 100),
          ref: reference,
          metadata: {
            storyId: story.id,
            storyTitle: story.title,
            custom_fields: [
              { display_name: 'Project', variable_name: 'project_name', value: 'Novella Stories' },
              { display_name: 'Book Title', variable_name: 'story_title', value: story.title },
            ],
          },
          callback: async (response: any) => {
            const verifiedRef = response.reference || reference;
            try {
              const verifyRes = await api.verifyPayment(verifiedRef, email, story.id);
              if (verifyRes.status) {
                unlockStory(story.id);
                setSuccess(true);
                try {
                  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                } catch {}
                setTimeout(() => onSuccess(), 1800);
              } else {
                setErrorMessage('Payment verification unconfirmed. Please contact support.');
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

      // High-craft sandbox execution (when testing without live keys or offline)
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const verifyRes = await api.verifyPayment(reference, email, story.id);

      if (verifyRes.status) {
        unlockStory(story.id);
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
        setErrorMessage('Payment failed. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing payment';
      setErrorMessage(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Paystack Official Header */}
        <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight">
                <span>Paystack Checkout</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  SECURE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">StoryFlow Official Merchant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {success ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Payment Successful!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-sm mx-auto font-reading">
                <strong>{story.title}</strong> has been permanently unlocked and added to your personal library.
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
                    ${story.priceUSD.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Payment Channel Tabs */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('card')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentChannel === 'card'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('bank')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentChannel === 'bank'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('ussd')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentChannel === 'ussd'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>USSD</span>
                  </button>
                </div>
              </div>

              {/* Reader Email */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Reader Email Receipt
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
                />
              </div>

              {/* Dynamic Channel Fields */}
              {paymentChannel === 'card' && (
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4084 0840 8408 4084"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase block mb-1">
                        Expires
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase block mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentChannel === 'bank' && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase block mb-1">
                      Choose Your Bank
                    </label>
                    <select
                      value={bankSelected}
                      onChange={(e) => setBankSelected(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                    >
                      <option>Guaranty Trust Bank (GTBank)</option>
                      <option>Access Bank Plc</option>
                      <option>Zenith Bank Plc</option>
                      <option>First Bank of Nigeria</option>
                      <option>United Bank for Africa (UBA)</option>
                      <option>Kuda Microfinance Bank</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    A secure virtual account number will be generated for your instant bank transfer.
                  </p>
                </div>
              )}

              {paymentChannel === 'ussd' && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Dial this code on your mobile phone:
                  </p>
                  <div className="p-3 bg-zinc-900 text-amber-400 font-mono text-center rounded-xl text-sm font-bold tracking-widest">
                    {ussdCode}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Follow the prompt on your phone and press the Confirm button below.
                  </p>
                </div>
              )}

              {errorMessage && (
                <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-70"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing with Paystack...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₦{story.priceNGN.toLocaleString()} Now</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                <span>256-bit SSL encrypted</span>
                <span>·</span>
                <span>PCI-DSS Level 1 Certified</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
