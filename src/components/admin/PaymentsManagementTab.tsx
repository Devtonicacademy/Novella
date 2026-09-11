import React, { useState } from 'react';
import { PaystackTransaction } from '../../types';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Filter,
  Eye,
  RefreshCw,
  X,
  Building,
  DollarSign,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface PaymentsManagementTabProps {
  transactions: PaystackTransaction[];
  onRefreshTransactions: () => Promise<void>;
}

export const PaymentsManagementTab: React.FC<PaymentsManagementTabProps> = ({
  transactions,
  onRefreshTransactions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<PaystackTransaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalVolumeNGN = transactions.reduce((acc, t) => t.status === 'success' ? acc + t.amountNGN : acc, 0);
  const successfulCount = transactions.filter(t => t.status === 'success').length;
  const avgOrderValue = successfulCount > 0 ? Math.round(totalVolumeNGN / successfulCount) : 0;

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.storyTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || t.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshTransactions();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Reference', 'Book Title', 'Reader Email', 'Amount NGN', 'Channel', 'Status', 'Date'];
    const rows = filteredTransactions.map(t => [
      t.reference,
      `"${t.storyTitle.replace(/"/g, '""')}"`,
      t.userEmail,
      t.amountNGN,
      t.channel,
      t.status,
      new Date(t.paidAt).toISOString()
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `paystack_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Paystack Transactions & Settlements
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time ledger of reader payments, merchant settlements, payment channels, and audit receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Revenue KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Settled Gross Volume</span>
          <div className="font-display text-2xl font-black text-emerald-600 tabular-nums">
            ₦{totalVolumeNGN.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">Total verified transactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Completed Purchases</span>
          <div className="font-display text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
            {successfulCount}
          </div>
          <span className="text-[11px] text-zinc-400">100% Verified by Webhook</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Average Order Value</span>
          <div className="font-display text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
            ₦{avgOrderValue.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">Per reader unlocked book</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Paystack reference, reader email, or book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="card">Debit / Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="ussd">USSD</option>
            <option value="mobile_money">Mobile Money</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Showing <strong>{filteredTransactions.length}</strong> transactions</span>
          <span className="text-[11px] font-mono">Currency: NGN (₦) / Subaccount Auto-Split</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold font-sans">
                <th className="pb-3 px-2">Paystack Reference</th>
                <th className="pb-3 px-2">Book Title</th>
                <th className="pb-3 px-2">Reader Email</th>
                <th className="pb-3 px-2">Channel</th>
                <th className="pb-3 px-2">Amount (NGN)</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Settlement Date</th>
                <th className="pb-3 px-2 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-[11px]">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-3.5 px-2 text-zinc-600 dark:text-zinc-300 font-bold">
                    {tx.reference}
                  </td>
                  <td className="py-3.5 px-2 font-sans font-bold text-zinc-900 dark:text-zinc-100">
                    {tx.storyTitle}
                  </td>
                  <td className="py-3.5 px-2 text-zinc-600 dark:text-zinc-400">{tx.userEmail}</td>
                  <td className="py-3.5 px-2 capitalize font-sans">{tx.channel.replace('_', ' ')}</td>
                  <td className="py-3.5 px-2 font-bold text-amber-700 dark:text-amber-400">
                    ₦{tx.amountNGN.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : tx.status === 'failed'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-zinc-400">
                    {new Date(tx.paidAt).toLocaleDateString()} {new Date(tx.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-1.5 text-zinc-400 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
                      title="Inspect Transaction"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Paystack Transaction Receipt
                </h3>
                <p className="text-xs text-zinc-500 font-mono">{selectedTx.reference}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Book Purchased</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedTx.storyTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount Paid</span>
                  <span className="font-mono font-bold text-emerald-600">₦{selectedTx.amountNGN.toLocaleString()} NGN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reader Account</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">{selectedTx.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Channel</span>
                  <span className="capitalize font-semibold">{selectedTx.channel.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Settlement Status</span>
                  <span className="font-bold text-emerald-600 uppercase">{selectedTx.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Timestamp</span>
                  <span className="font-mono">{new Date(selectedTx.paidAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified with Paystack API. Story is permanently unlocked for this reader.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
