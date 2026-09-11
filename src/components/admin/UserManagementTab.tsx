import React, { useState } from 'react';
import { UserProfile, Story, AdminRole } from '../../types';
import {
  Users,
  Search,
  Shield,
  Key,
  Unlock,
  Lock,
  Ban,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  X,
  RefreshCw,
  MoreVertical,
  Award
} from 'lucide-react';

interface UserManagementTabProps {
  users: UserProfile[];
  stories: Story[];
  onUpdateRole: (userId: string, role: AdminRole) => Promise<void>;
  onToggleStatus: (userId: string, status: 'active' | 'suspended') => Promise<void>;
  onGrantStoryAccess: (userId: string, storyId: string) => Promise<void>;
  onRevokeStoryAccess: (userId: string, storyId: string) => Promise<void>;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  stories,
  onUpdateRole,
  onToggleStatus,
  onGrantStoryAccess,
  onRevokeStoryAccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected User for Modal Access Granting
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Super Admin</span>;
      case 'content_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">Content Admin</span>;
      case 'support_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Support Admin</span>;
      case 'finance_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Finance Admin</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Reader</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Reader Accounts & Access Grants
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit registered readers, manage VIP permissions, grant complimentary story unlocks, and assign roles
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reader name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">Reader</option>
            <option value="super_admin">Super Admin</option>
            <option value="content_admin">Content Admin</option>
            <option value="support_admin">Support Admin</option>
            <option value="finance_admin">Finance Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Showing <strong>{filteredUsers.length}</strong> reader accounts</span>
          <span className="text-[11px] font-mono">Complimentary VIP Unlocks Enabled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-2">Reader</th>
                <th className="pb-3 px-2">Role</th>
                <th className="pb-3 px-2">Unlocked Books</th>
                <th className="pb-3 px-2">Reading Time</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredUsers.map((u) => {
                const unlockedCount = u.unlockedStoryIds?.length || 2;
                const isSuspended = u.status === 'suspended';

                return (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    {/* User Info */}
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600/10 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-300/30">
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                            {u.displayName}
                          </span>
                          <span className="text-[11px] text-zinc-400 truncate block font-mono">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(u.role)}
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateRole(u.id, e.target.value as AdminRole)}
                          className="text-[11px] p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        >
                          <option value="user">Reader</option>
                          <option value="content_admin">Content Admin</option>
                          <option value="support_admin">Support Admin</option>
                          <option value="finance_admin">Finance Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                    </td>

                    {/* Unlocked Books */}
                    <td className="py-3.5 px-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsGrantModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                        <span>{unlockedCount} Books Granted</span>
                      </button>
                    </td>

                    {/* Reading Time */}
                    <td className="py-3.5 px-2 font-mono text-zinc-600 dark:text-zinc-300">
                      {u.totalReadingMinutes || 45} mins
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isSuspended
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-2 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsGrantModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
                        title="Manage Book Unlocks"
                      >
                        Grant Books
                      </button>

                      <button
                        onClick={() => onToggleStatus(u.id, isSuspended ? 'active' : 'suspended')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSuspended
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={isSuspended ? 'Reactivate Account' : 'Suspend Reader'}
                      >
                        {isSuspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Access Modal */}
      {isGrantModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Manage Access for {selectedUser.displayName}
                </h3>
                <p className="text-xs text-zinc-500">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px]">
                💡 Books #1 and #2 are universally free. You can grant complimentary lifetime access to any paid stories below.
              </div>

              <div className="space-y-2">
                {stories.map((story) => {
                  const isUnlocked = selectedUser.unlockedStoryIds?.includes(story.id) || story.isFree || story.order <= 2;
                  const isAlwaysFree = story.isFree || story.order <= 2;

                  return (
                    <div
                      key={story.id}
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                          {story.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {isAlwaysFree ? 'Standard Free Book' : `₦${story.priceNGN.toLocaleString()}`}
                        </span>
                      </div>

                      {isAlwaysFree ? (
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Universal Free</span>
                      ) : (
                        <button
                          onClick={async () => {
                            if (isUnlocked) {
                              await onRevokeStoryAccess(selectedUser.id, story.id);
                              setSelectedUser({
                                ...selectedUser,
                                unlockedStoryIds: selectedUser.unlockedStoryIds.filter(id => id !== story.id)
                              });
                            } else {
                              await onGrantStoryAccess(selectedUser.id, story.id);
                              setSelectedUser({
                                ...selectedUser,
                                unlockedStoryIds: [...(selectedUser.unlockedStoryIds || []), story.id]
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isUnlocked
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-purple-700 text-white hover:bg-purple-800'
                          }`}
                        >
                          {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{isUnlocked ? 'Unlocked (Revoke)' : 'Grant Access'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsGrantModalOpen(false)}
                className="px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
