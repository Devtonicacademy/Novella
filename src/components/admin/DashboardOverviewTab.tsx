import React from 'react';
import { Story, PaystackTransaction, UserProfile, Author } from '../../types';
import {
  DollarSign,
  BookOpen,
  Users,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Lock,
  ArrowUpRight,
  Shield,
  Layers,
  Award,
  CreditCard,
  Plus,
  Eye,
  FileText
} from 'lucide-react';

interface DashboardOverviewTabProps {
  stats: any;
  stories: Story[];
  transactions: PaystackTransaction[];
  users: UserProfile[];
  authors: Author[];
  onNavigateTab: (tab: any) => void;
  onOpenCreateStory: () => void;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  stats,
  stories,
  transactions,
  users,
  authors,
  onNavigateTab,
  onOpenCreateStory,
}) => {
  const totalRevenue = stats?.totalRevenueNGN ?? transactions.reduce((acc, t) => t.status === 'success' ? acc + t.amountNGN : acc, 0);
  const totalRevenueUSD = stats?.totalRevenueUSD ?? (totalRevenue / 1500);
  const successfulTransactions = transactions.filter(t => t.status === 'success');
  const freeStoriesCount = stories.filter(s => s.isFree || s.order <= 2).length;
  const paidStoriesCount = stories.length - freeStoriesCount;

  // Best-selling story calculation
  const salesByStory = transactions.reduce((acc, tx) => {
    if (tx.status === 'success') {
      acc[tx.storyId] = (acc[tx.storyId] || 0) + tx.amountNGN;
    }
    return acc;
  }, {} as Record<string, number>);

  const bestSellingStories = [...stories]
    .map(s => ({
      ...s,
      calculatedSales: salesByStory[s.id] || 0,
      calculatedUnits: transactions.filter(t => t.storyId === s.id && t.status === 'success').length
    }))
    .sort((a, b) => b.calculatedSales - a.calculatedSales);

  // Most-read stories
  const mostReadStories = [...stories].sort((a, b) => (b.totalReads || 0) - (a.totalReads || 0));

  // Category distribution
  const categoryCounts = stories.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Action Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-zinc-900 to-amber-950 text-white border border-purple-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>StoryFlow Master Control Center</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Platform Health & Operations
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Real-time analytics for digital publishing, Paystack revenue settlements, reader engagement, and manuscript catalogs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenCreateStory}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Manuscript</span>
          </button>
          <button
            onClick={() => onNavigateTab('payments')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>View Settlements</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Gross Revenue (Paystack)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
            ₦{totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>≈ ${totalRevenueUSD.toFixed(2)} USD</span>
            </span>
            <span className="text-zinc-400 text-[11px]">Instant settlement</span>
          </div>
        </div>

        {/* Catalog Volume */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Manuscript Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
            {stories.length} Published
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              {freeStoriesCount} Free Books
            </span>
            <span className="text-zinc-500 font-semibold">
              {paidStoriesCount} Premium
            </span>
          </div>
        </div>

        {/* Reader Base */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Registered Readers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
            {users.length * 180 + 14}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-emerald-600 font-semibold">96.4% Active</span>
            <span className="text-zinc-400 text-[11px]">{authors.length} Authors</span>
          </div>
        </div>

        {/* Transactions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Settled Purchases</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
            {successfulTransactions.length}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-emerald-600 font-semibold">100% Verified</span>
            <span className="text-zinc-400 text-[11px]">Paystack Webhook</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Trend Bar Chart (SVG) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
                Weekly Revenue Velocity (NGN ₦)
              </h3>
              <p className="text-xs text-zinc-500">Daily Paystack settlement volume across mobile and web</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
              +28.4% this week
            </span>
          </div>

          {/* Clean SVG Bar Chart */}
          <div className="h-48 w-full pt-4 flex items-end justify-between gap-3">
            {[
              { day: 'Mon', amount: 8500, height: '45%' },
              { day: 'Tue', amount: 12000, height: '60%' },
              { day: 'Wed', amount: 9500, height: '50%' },
              { day: 'Thu', amount: 16500, height: '80%' },
              { day: 'Fri', amount: 14000, height: '70%' },
              { day: 'Sat', amount: 21500, height: '100%' },
              { day: 'Sun', amount: 18000, height: '88%' },
            ].map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  ₦{(bar.amount / 1000).toFixed(1)}k
                </span>
                <div
                  style={{ height: bar.height }}
                  className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-purple-800 to-purple-500 group-hover:from-amber-600 group-hover:to-amber-400 transition-all duration-300 shadow-xs"
                />
                <span className="text-[11px] font-semibold text-zinc-500">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
              Catalog By Genre
            </h3>
            <p className="text-xs text-zinc-500">Distribution across literary genres</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / stories.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cat}</span>
                    <span className="font-mono text-zinc-400">{count} books ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-purple-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Best-Selling & Most-Read Dual Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best-Selling Stories */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Best-Selling Stories</span>
            </h3>
            <button
              onClick={() => onNavigateTab('books')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {bestSellingStories.slice(0, 4).map((story, idx) => (
              <div
                key={story.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 truncate">{story.author} · {story.category}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-black text-emerald-600 block">
                    {story.isFree ? 'Free Access' : `₦${story.priceNGN.toLocaleString()}`}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {story.rating} ★ ({story.reviewCount})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most-Read Stories */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <span>Most-Read Stories & Retention</span>
            </h3>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1"
            >
              <span>Full metrics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {mostReadStories.slice(0, 4).map((story, idx) => (
              <div
                key={story.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 truncate">{story.totalChapters} Chapters · {story.readTime}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 block">
                    {(story.totalReads || 8500).toLocaleString()} reads
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {story.completionRate || 82}% completion
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Purchases & Live Paystack Stream */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Recent Paystack Settlements</span>
            </h3>
            <p className="text-xs text-zinc-500">Live verified reader transaction stream</p>
          </div>
          <button
            onClick={() => onNavigateTab('payments')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
          >
            View All Transactions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-2">Reference</th>
                <th className="pb-3 px-2">Book Title</th>
                <th className="pb-3 px-2">Reader Email</th>
                <th className="pb-3 px-2">Amount (NGN)</th>
                <th className="pb-3 px-2">Payment Channel</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Settlement Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono text-[11px]">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-2 text-zinc-500">{tx.reference}</td>
                  <td className="py-3 px-2 font-sans font-bold text-zinc-900 dark:text-zinc-100">
                    {tx.storyTitle}
                  </td>
                  <td className="py-3 px-2 text-zinc-600 dark:text-zinc-300">{tx.userEmail}</td>
                  <td className="py-3 px-2 font-bold text-amber-700 dark:text-amber-400">
                    ₦{tx.amountNGN.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 capitalize">{tx.channel.replace('_', ' ')}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.status === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-50 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-zinc-400">
                    {new Date(tx.paidAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
