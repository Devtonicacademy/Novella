import React, { useState, useEffect } from 'react';
import { CustomerPurchaseRecord, PlatformSettings } from '../../types';
import { api } from '../../services/api';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  CreditCard,
  User,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Download,
  DollarSign
} from 'lucide-react';

interface PurchasesManagementTabProps {
  settings?: PlatformSettings;
}

export const PurchasesManagementTab: React.FC<PurchasesManagementTabProps> = ({ settings }) => {
  const [purchases, setPurchases] = useState<CustomerPurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminPurchases();
      setPurchases(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.storyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionReference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel = channelFilter === 'all' || p.channel === channelFilter;

    return matchesSearch && matchesChannel;
  });

  const totalGrossRevenue = purchases.reduce((sum, p) => sum + p.amountNGN, 0);
  const uniqueCustomers = new Set(purchases.map((p) => p.userEmail)).size;
  const avgOrderValue = purchases.length > 0 ? totalGrossRevenue / purchases.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
            <span>Customer Purchases & Story Unlocks</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time record of all digital manuscript unlocks, reader customer accounts, and Paystack receipts.
          </p>
        </div>

        <button
          onClick={loadPurchases}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Total Purchases</span>
            <ShoppingBag className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">
            {purchases.length} Unlocks
          </p>
          <span className="text-[11px] text-zinc-400">
            Lifetime fulfilled transactions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            ₦{totalGrossRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-400">
            Settled in Nigerian Naira
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Paying Readers</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">
            {uniqueCustomers} Unique Readers
          </p>
          <span className="text-[11px] text-zinc-400">
            Active customer accounts
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Avg Order Value</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">
            ₦{Math.round(avgOrderValue).toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-400">
            Per digital book purchase
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, email, title, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channelFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setChannelFilter('card')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channelFilter === 'card'
                ? 'bg-purple-700 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Card
          </button>
          <button
            onClick={() => setChannelFilter('bank_transfer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channelFilter === 'bank_transfer'
                ? 'bg-purple-700 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Bank Transfer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No customer purchases matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                <tr>
                  <th className="p-3.5 pl-4">Transaction Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Story Unlocked</th>
                  <th className="p-3.5">Amount Paid</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5 pr-4 text-right">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5 pl-4 font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                      {pur.transactionReference}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">
                          {pur.customerName.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 block leading-tight">
                            {pur.customerName}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {pur.userEmail}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>{pur.storyTitle}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₦{pur.amountNGN.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono capitalize">
                        {pur.channel}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-500 font-mono text-[11px]">
                      {new Date(pur.purchasedAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Active Library
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
