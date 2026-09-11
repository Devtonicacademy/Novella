import React, { useState } from 'react';
import { PlatformSettings } from '../../types';
import {
  Settings,
  Save,
  CreditCard,
  Shield,
  BookOpen,
  Bell,
  CheckCircle2,
  RefreshCw,
  Key,
  Globe,
  AlertTriangle
} from 'lucide-react';

interface SettingsTabProps {
  settings: PlatformSettings;
  onSaveSettings: (settings: PlatformSettings) => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Platform Configuration & Gateway Settings
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure free story thresholds, Paystack merchant keys, reading protection, and platform rules
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : success ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{success ? 'Settings Saved!' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Story Publishing & Free Threshold Policy */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Story Discovery & Paywall Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">
                Universal Free Books Limit
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.freeStoriesCount}
                onChange={(e) => setFormData({ ...formData, freeStoriesCount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Every reader can read the first {formData.freeStoriesCount} story books for free. Additional books require payment.
              </p>
            </div>

            <div>
              <label className="font-semibold block mb-1">
                Default Story Price (NGN ₦)
              </label>
              <input
                type="number"
                value={formData.defaultPriceNGN}
                onChange={(e) => setFormData({ ...formData, defaultPriceNGN: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Default price suggested when publishing new manuscripts.
              </p>
            </div>
          </div>
        </div>

        {/* Paystack Integration */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>Paystack Gateway Configuration</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">
                Paystack Public Key
              </label>
              <input
                type="text"
                value={formData.paystackPublicKey}
                onChange={(e) => setFormData({ ...formData, paystackPublicKey: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">
                Merchant Settlement Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Security & Reader Experience */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <span>Content Protection & App Governance</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  DRM Text Copy Protection
                </span>
                <p className="text-[11px] text-zinc-500">
                  Prevent clipboard extraction of copyrighted literary manuscripts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.enableTextSelectionPrevention ?? true}
                onChange={(e) => setFormData({ ...formData, enableTextSelectionPrevention: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  Reader Comments & Reviews
                </span>
                <p className="text-[11px] text-zinc-500">
                  Allow readers to submit star ratings and literary reviews on book pages.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.allowReaderReviews ?? true}
                onChange={(e) => setFormData({ ...formData, allowReaderReviews: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-red-600 dark:text-red-400">
                  Platform Maintenance Mode
                </span>
                <p className="text-[11px] text-zinc-500">
                  Display a scheduled maintenance banner to all non-admin readers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.maintenanceMode ?? false}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-red-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
