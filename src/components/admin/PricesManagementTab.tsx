import React, { useState, useEffect } from 'react';
import { Story, PriceHistoryRecord, PlatformSettings } from '../../types';
import { api } from '../../services/api';
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Tag,
  TrendingUp,
  History,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

interface PricesManagementTabProps {
  stories: Story[];
  settings?: PlatformSettings;
  onPriceUpdated?: () => void;
}

export const PricesManagementTab: React.FC<PricesManagementTabProps> = ({
  stories,
  settings,
  onPriceUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');
  const [priceHistory, setPriceHistory] = useState<PriceHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit price modal state
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFreeToggle, setIsFreeToggle] = useState(false);
  const [newPriceNGN, setNewPriceNGN] = useState<number>(2000);
  const [changeReason, setChangeReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  const exchangeRate = settings?.ngnToUsdRate || 1450;

  const loadPriceData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminPrices();
      if (data && data.history) {
        setPriceHistory(data.history);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriceData();
  }, []);

  const handleOpenEditPrice = (story: Story) => {
    setSelectedStory(story);
    setIsFreeToggle(story.isFree);
    setNewPriceNGN(story.isFree ? 2000 : story.priceNGN);
    setChangeReason('');
    setShowConfirmDialog(false);
    setIsModalOpen(true);
  };

  const handleApplyPriceChange = async () => {
    if (!selectedStory) return;

    setUpdating(true);
    setFeedback(null);
    try {
      await api.updateStoryPrice(selectedStory.id, {
        isFree: isFreeToggle,
        newPriceNGN: isFreeToggle ? 0 : Number(newPriceNGN),
        reason: changeReason.trim() || 'Admin price revision via Price Management Portal'
      });

      setFeedback({
        type: 'success',
        message: `Successfully updated pricing for "${selectedStory.title}". Future transactions will use this new price.`
      });

      setIsModalOpen(false);
      setShowConfirmDialog(false);
      setSelectedStory(null);
      await loadPriceData();
      if (onPriceUpdated) onPriceUpdated();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update book price'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Filter stories
  const filteredStories = stories.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());

    const isEffectivelyFree = s.isFree;
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'free' && isEffectivelyFree) ||
      (filterType === 'paid' && !isEffectivelyFree);

    return matchesSearch && matchesFilter;
  });

  const totalCatalogValue = stories.reduce((sum, s) => sum + (s.isFree ? 0 : s.priceNGN), 0);
  const paidBooksCount = stories.filter((s) => !s.isFree).length;
  const freeBooksCount = stories.filter((s) => s.isFree).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-600" />
            <span>Price & Access Management</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure book prices, toggle Free/Paid statuses, and maintain audited price logs. The backend enforces database-verified pricing on all payments.
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <div className="flex-1">
            <span className="font-bold block mb-0.5">
              {feedback.type === 'success' ? 'Pricing Updated' : 'Action Failed'}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Total Catalog Value</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">
            ₦{totalCatalogValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-400">
            ≈ ${(totalCatalogValue / exchangeRate).toFixed(2)} USD
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Paid Books</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">
            {paidBooksCount} Books
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Paystack direct checkout enabled
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Free Books</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">
            {freeBooksCount} Books
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400">
            100% Free for all readers
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>FX Conversion Base</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">
            ₦{exchangeRate.toLocaleString()} / $1
          </p>
          <span className="text-[11px] text-zinc-400">
            Centralized database reference
          </span>
        </div>
      </div>

      {/* Pricing Policy Card */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Novella Monetization & Security Rule:</span>
          <p className="text-zinc-700 dark:text-zinc-300">
            By default, Book #1 and Book #2 in the sequence are Free, and subsequent books are Paid. As an administrator, you have the full authority to override any book's status to <strong>Free</strong> or <strong>Paid</strong>, and adjust prices in Nigerian Naira (₦) with instant automatic USD conversion.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search book title, author, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            All Books ({stories.length})
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'paid'
                ? 'bg-emerald-700 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Paid ({paidBooksCount})
          </button>
          <button
            onClick={() => setFilterType('free')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'free'
                ? 'bg-purple-700 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Free ({freeBooksCount})
          </button>
        </div>
      </div>

      {/* Stories Price Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
              <tr>
                <th className="p-3.5 pl-4">Order</th>
                <th className="p-3.5">Story & Author</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Access Tier</th>
                <th className="p-3.5">Current Price (NGN)</th>
                <th className="p-3.5">USD Equivalent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredStories.map((story) => {
                const isFree = story.isFree;
                return (
                  <tr key={story.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-bold text-zinc-400">
                      #{story.order}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-10 rounded-md bg-zinc-800 text-white flex items-center justify-center font-serif text-xs shrink-0 overflow-hidden shadow-xs">
                          {story.coverImage ? (
                            <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold">{story.title.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                            {story.title}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            by {story.author}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-zinc-600 dark:text-zinc-300">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px]">
                        {story.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {isFree ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Sparkles className="w-3 h-3" />
                          100% Free
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <DollarSign className="w-3 h-3" />
                          Paid Manuscript
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {isFree ? (
                        <span className="text-purple-600 dark:text-purple-400">₦0 (Free)</span>
                      ) : (
                        `₦${story.priceNGN.toLocaleString()}`
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-zinc-500 dark:text-zinc-400">
                      {isFree ? '$0.00' : `$${story.priceUSD ? story.priceUSD.toFixed(2) : (story.priceNGN / exchangeRate).toFixed(2)}`}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          (story.status || 'published') === 'published'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {story.status || 'published'}
                      </span>
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      <button
                        onClick={() => handleOpenEditPrice(story)}
                        className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Change Price
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-500" />
            <span>Price Audit History</span>
          </h3>
          <span className="text-xs text-zinc-400">
            {priceHistory.length} Recorded Adjustments
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          {priceHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No historical price modifications logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                  <tr>
                    <th className="p-3 pl-4">Timestamp</th>
                    <th className="p-3">Story</th>
                    <th className="p-3">Previous Price</th>
                    <th className="p-3">New Price</th>
                    <th className="p-3">Admin</th>
                    <th className="p-3 pr-4">Reason / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                  {priceHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                      <td className="p-3 pl-4 text-zinc-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.storyTitle}
                      </td>
                      <td className="p-3 text-red-600 dark:text-red-400">
                        {item.wasFree ? 'FREE (₦0)' : `₦${item.oldPriceNGN.toLocaleString()}`}
                      </td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {item.isFree ? 'FREE (₦0)' : `₦${item.newPriceNGN.toLocaleString()}`}
                      </td>
                      <td className="p-3 font-sans text-zinc-600 dark:text-zinc-300">
                        {item.changedBy}
                      </td>
                      <td className="p-3 pr-4 font-sans text-zinc-500 dark:text-zinc-400">
                        {item.reason || 'Manual modification'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Price Modal */}
      {isModalOpen && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Update Price for "{selectedStory.title}"
                  </h3>
                  <span className="text-[11px] text-zinc-500">
                    Current: {selectedStory.isFree ? '100% Free' : `₦${selectedStory.priceNGN.toLocaleString()} (~$${selectedStory.priceUSD || (selectedStory.priceNGN / exchangeRate).toFixed(2)})`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!showConfirmDialog ? (
                <>
                  {/* Free vs Paid Toggle */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                          Access Tier
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Set whether this book is available for free or requires a Paystack purchase.
                        </span>
                      </div>
                      <div className="flex p-1 bg-zinc-200 dark:bg-zinc-700 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setIsFreeToggle(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isFreeToggle
                              ? 'bg-purple-700 text-white shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          Free
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFreeToggle(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            !isFreeToggle
                              ? 'bg-amber-700 text-white shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          Paid
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing inputs if Paid */}
                  {!isFreeToggle && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                        New Price (Nigerian Naira - ₦)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
                          ₦
                        </span>
                        <input
                          type="number"
                          min="100"
                          step="50"
                          value={newPriceNGN}
                          onChange={(e) => setNewPriceNGN(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                          placeholder="e.g. 2500"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[1500, 2000, 2500, 3000, 5000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setNewPriceNGN(preset)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              newPriceNGN === preset
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            ₦{preset.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                        <span className="text-zinc-500">USD Auto-Calculated Equivalent:</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ${(newPriceNGN / exchangeRate).toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Audit Reason */}
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Reason for Price Change (Logged to Audit History)
                    </label>
                    <input
                      type="text"
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder="e.g. Special promotional discount, standard catalog adjustment"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                    />
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDialog(true)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <span>Proceed to Confirmation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                /* Confirmation Step */
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <span className="font-bold block text-sm">
                      Confirm Price Adjustment
                    </span>
                    <p>
                      Are you sure you want to update the price for{' '}
                      <strong>"{selectedStory.title}"</strong> from{' '}
                      <span className="font-mono font-bold text-red-600 dark:text-red-400">
                        {selectedStory.isFree ? 'FREE' : `₦${selectedStory.priceNGN.toLocaleString()}`}
                      </span>{' '}
                      to{' '}
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {isFreeToggle ? 'FREE (₦0)' : `₦${Number(newPriceNGN).toLocaleString()}`}
                      </span>
                      ?
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      All future customer checkouts via Paystack will immediately query the server database and charge this new price.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => setShowConfirmDialog(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={handleApplyPriceChange}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {updating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Confirm & Save New Price</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
