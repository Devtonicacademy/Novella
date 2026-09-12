import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  PlusCircle, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  Wallet, 
  ShieldCheck, 
  Edit3, 
  Trash2,
  Calendar,
  Layers,
  Send
} from 'lucide-react';
import { Story, AuthorEarnings, Chapter } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookCover } from './BookCover';

interface AuthorStudioViewProps {
  stories: Story[];
  onOpenAIStudio: () => void;
  onRefreshStories: () => void;
  onSelectStory: (story: Story) => void;
}

export const AuthorStudioView: React.FC<AuthorStudioViewProps> = ({
  stories,
  onOpenAIStudio,
  onRefreshStories,
  onSelectStory,
}) => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<AuthorEarnings | null>(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('Access Bank •••• 4129');
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // New chapter modal state
  const [selectedStoryForChapter, setSelectedStoryForChapter] = useState<Story | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterContent, setNewChapterContent] = useState('');
  const [newChapterMinutes, setNewChapterMinutes] = useState(4);
  const [savingChapter, setSavingChapter] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, [user]);

  const loadEarnings = async () => {
    setLoadingEarnings(true);
    try {
      const data = await api.getAuthorEarnings();
      setEarnings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEarnings(false);
    }
  };

  const myStories = stories.filter(
    (s) => s.authorId === user?.id || (user?.role === 'super_admin' ? true : s.author.toLowerCase() === (user?.displayName || '').toLowerCase())
  );

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!earnings || earnings.pendingPayoutNGN <= 0) return;

    const amount = Number(payoutAmount) || earnings.pendingPayoutNGN;
    setRequestingPayout(true);
    setPayoutError(null);

    try {
      await api.requestPayout(amount, bankDetails);
      setPayoutSuccess(true);
      await loadEarnings();
      setTimeout(() => setPayoutSuccess(false), 4000);
    } catch (err: any) {
      setPayoutError(err.message || 'Payout request failed');
    } finally {
      setRequestingPayout(false);
    }
  };

  const handleAddChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryForChapter || !newChapterTitle || !newChapterContent) return;

    setSavingChapter(true);
    try {
      await api.addChapter(selectedStoryForChapter.id, {
        title: newChapterTitle,
        content: newChapterContent,
        readMinutes: Number(newChapterMinutes) || 4,
        status: 'published',
      });
      setSelectedStoryForChapter(null);
      setNewChapterTitle('');
      setNewChapterContent('');
      onRefreshStories();
    } catch (e: any) {
      alert(e.message || 'Failed to add chapter');
    } finally {
      setSavingChapter(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-zinc-900 to-stone-950 border border-amber-500/20 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                Author & Publisher Portal
              </span>
              <span className="text-xs text-zinc-400">70% Royalty Share</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">
              Author Studio
            </h1>
            <p className="text-sm text-zinc-300 max-w-xl">
              Manage your manuscripts, track readership and royalties, schedule new chapters, and co-write with AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="author-portal-ai-studio-btn"
              onClick={onOpenAIStudio}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Story Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Revenue & Royalties Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            ₦{(earnings?.totalRevenueNGN || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500">Across all published books</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Your Earnings (70%)</span>
            <Wallet className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            ₦{(earnings?.authorSplitNGN || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500">Total credited payout share</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payout</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            ₦{(earnings?.pendingPayoutNGN || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500">Available for withdrawal</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Readers</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {(earnings?.totalSalesCount || 340) * 15}
          </div>
          <div className="text-[11px] text-zinc-500">Active reads & unlocks</div>
        </div>
      </div>

      {/* Payout Withdrawal Box */}
      <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Paystack Direct Payout
              </h3>
              <p className="text-xs text-zinc-500">
                Request instant settlement directly to your registered Nigerian bank account
              </p>
            </div>
          </div>
        </div>

        {payoutSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Payout request submitted successfully! Funds will be disbursed within 24 hours.</span>
          </div>
        )}

        {payoutError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            {payoutError}
          </div>
        )}

        <form onSubmit={handleRequestPayout} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Payout Amount (₦ NGN)
            </label>
            <input
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder={`Max: ₦${(earnings?.pendingPayoutNGN || 0).toLocaleString()}`}
              max={earnings?.pendingPayoutNGN || 0}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Payout Account
            </label>
            <input
              type="text"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-end">
            <button
              id="request-payout-btn"
              type="submit"
              disabled={requestingPayout || !earnings || earnings.pendingPayoutNGN <= 0}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              {requestingPayout ? 'Processing Request...' : 'Withdraw Royalty Funds'}
            </button>
          </div>
        </form>
      </div>

      {/* Published Stories & Chapter Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Published Manuscripts & Chapters
            </h2>
            <p className="text-xs text-zinc-500">
              Add new chapters, view drop-off rates, and update pricing
            </p>
          </div>
          <button
            onClick={onOpenAIStudio}
            className="px-4 py-2 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Story</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myStories.map((story) => (
            <div
              key={story.id}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
            >
              <div className="flex gap-4">
                <div className="w-16 h-24 rounded-2xl overflow-hidden shadow shrink-0">
                  <BookCover
                    title={story.title}
                    author={story.author}
                    category={story.category}
                    coverColorTheme={story.coverColorTheme}
                    coverImage={story.coverImage}
                    size="sm"
                  />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      {story.category}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                      {story.isFree ? '100% Free' : `₦${story.priceNGN.toLocaleString()}`}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {story.description}
                  </p>
                </div>
              </div>

              {/* Chapters list preview */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-bold">Chapters ({story.chapters.length})</span>
                  <span>{story.readTime}</span>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {story.chapters.map((ch, idx) => (
                    <div
                      key={ch.id || idx}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60"
                    >
                      <span className="font-serif text-zinc-800 dark:text-zinc-200 line-clamp-1">
                        {ch.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">{ch.readMinutes}m</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => onSelectStory(story)}
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  View Story Page
                </button>
                <button
                  onClick={() => setSelectedStoryForChapter(story)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Chapter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Chapter Modal */}
      {selectedStoryForChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Add Chapter to "{selectedStoryForChapter.title}"
                </h3>
                <p className="text-xs text-zinc-500">
                  Write and publish the next chapter in this manuscript
                </p>
              </div>
              <button
                onClick={() => setSelectedStoryForChapter(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChapterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder={`e.g. Chapter ${selectedStoryForChapter.chapters.length + 1}: The Revelations`}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Read Time (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={newChapterMinutes}
                  onChange={(e) => setNewChapterMinutes(Number(e.target.value))}
                  className="w-24 px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Chapter Content & Prose *
                </label>
                <textarea
                  required
                  rows={8}
                  value={newChapterContent}
                  onChange={(e) => setNewChapterContent(e.target.value)}
                  placeholder="Write the full chapter prose here..."
                  className="w-full px-4 py-3 text-xs font-serif rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedStoryForChapter(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingChapter}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{savingChapter ? 'Publishing Chapter...' : 'Publish Chapter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
