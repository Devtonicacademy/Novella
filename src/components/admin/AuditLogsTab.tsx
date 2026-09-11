import React, { useState } from 'react';
import { AuditLog } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Activity,
  Calendar
} from 'lucide-react';

interface AuditLogsTabProps {
  logs: AuditLog[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const userEmailStr = (log.userEmail || log.adminEmail || '').toLowerCase();
    const actionStr = (log.action || '').toLowerCase();
    const targetTitleStr = (log.targetTitle || log.target || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = userEmailStr.includes(query) ||
      actionStr.includes(query) ||
      targetTitleStr.includes(query);
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created') || action.includes('grant')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (action.includes('deleted') || action.includes('ban') || action.includes('suspend')) {
      return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800';
    }
    return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Platform Audit Trail & Security Logs
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Immutable system logs documenting administrative modifications, pricing changes, and role assignments
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by actor, action, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
        >
          <option value="all">All Action Types</option>
          <option value="story_created">Story Created</option>
          <option value="story_updated">Story Updated</option>
          <option value="chapters_reordered">Chapters Reordered</option>
          <option value="cover_updated">Cover Updated</option>
          <option value="user_access_granted">Access Granted</option>
          <option value="role_updated">Role Changed</option>
          <option value="settings_updated">Settings Updated</option>
        </select>
      </div>

      {/* Log Feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold font-sans">
                <th className="pb-3 px-2">Timestamp</th>
                <th className="pb-3 px-2">Administrator</th>
                <th className="pb-3 px-2">Action</th>
                <th className="pb-3 px-2">Target Entity</th>
                <th className="pb-3 px-2">Details / Change Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-[11px] font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-2 text-zinc-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">
                    {log.userEmail || log.adminEmail || 'admin@storyflow.app'}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActionBadgeColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-sans font-semibold text-zinc-900 dark:text-zinc-100">
                    {log.targetTitle || log.target || 'Platform'}
                  </td>
                  <td className="py-3 px-2 font-sans text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                    {log.details}
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
