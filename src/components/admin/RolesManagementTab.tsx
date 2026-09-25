import React, { useState } from 'react';
import { AdminRole, UserProfile, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  CheckCircle2,
  XCircle,
  Key,
  ShieldAlert,
  Users,
  Award,
  BookOpen,
  CreditCard,
  Settings,
  Sparkles,
  X,
  Mail,
  User,
  Shield,
  AlertCircle,
  Search,
  Filter,
  Check
} from 'lucide-react';

interface RolesManagementTabProps {
  users: UserProfile[];
  onUpdateRole: (userId: string, role: AdminRole) => Promise<void>;
  onAddAdmin?: (adminData: {
    email: string;
    fullName?: string;
    displayName?: string;
    role?: AdminRole;
    password?: string;
    bio?: string;
  }) => Promise<void>;
}

interface RoleCapability {
  module: string;
  superAdmin: boolean;
  admin: boolean;
  contentAdmin: boolean;
  supportAdmin: boolean;
  financeAdmin: boolean;
}

const CAPABILITY_MATRIX: RoleCapability[] = [
  { module: 'Overview Dashboard & Health', superAdmin: true, admin: true, contentAdmin: true, supportAdmin: true, financeAdmin: true },
  { module: 'Publish, Edit & Delete Books', superAdmin: true, admin: true, contentAdmin: true, supportAdmin: false, financeAdmin: false },
  { module: 'Chapter Authoring & Reorder', superAdmin: true, admin: true, contentAdmin: true, supportAdmin: false, financeAdmin: false },
  { module: 'Cover Art & AI Studio', superAdmin: true, admin: true, contentAdmin: true, supportAdmin: false, financeAdmin: false },
  { module: 'Author & Genre Management', superAdmin: true, admin: true, contentAdmin: true, supportAdmin: false, financeAdmin: false },
  { module: 'Reader VIP Access Grants', superAdmin: true, admin: true, contentAdmin: false, supportAdmin: true, financeAdmin: false },
  { module: 'Reader Account Moderation / Bans', superAdmin: true, admin: true, contentAdmin: false, supportAdmin: true, financeAdmin: false },
  { module: 'Paystack Settlement Ledger', superAdmin: true, admin: false, contentAdmin: false, supportAdmin: false, financeAdmin: true },
  { module: 'Transaction CSV Exports', superAdmin: true, admin: true, contentAdmin: false, supportAdmin: false, financeAdmin: true },
  { module: 'Broadcast Announcements', superAdmin: true, admin: true, contentAdmin: true, supportAdmin: true, financeAdmin: false },
  { module: 'Platform Security & Secret Keys', superAdmin: true, admin: false, contentAdmin: false, supportAdmin: false, financeAdmin: false },
  { module: 'Role Assignments (RBAC Matrix)', superAdmin: true, admin: true, contentAdmin: false, supportAdmin: false, financeAdmin: false },
];

const ADMIN_ROLES: AdminRole[] = ['super_admin', 'admin', 'content_admin', 'support_admin', 'finance_admin'];

export const RolesManagementTab: React.FC<RolesManagementTabProps> = ({
  users,
  onUpdateRole,
  onAddAdmin,
}) => {
  const { user: currentUser, adminRole, switchRole } = useAuth();

  // View state: 'all' to see all users in the app, 'staff' for admin staff only
  const [viewMode, setViewMode] = useState<'all' | 'staff'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Filter admin staff
  const adminStaff = users.filter((u) => u.role && ADMIN_ROLES.includes(u.role as AdminRole));

  // Determine active list based on view mode and filters
  const baseList = viewMode === 'staff' ? adminStaff : users;
  const filteredUsers = baseList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);

    const matchesRole =
      roleFilter === 'all' ||
      u.role === roleFilter ||
      (roleFilter === 'customer' && (u.role === 'customer' || u.role === 'user'));

    return matchesSearch && matchesRole;
  });

  // Add / Assign Role Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('admin');
  const [adminPassword, setAdminPassword] = useState('Novella@2024!');
  const [adminBio, setAdminBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenAddModal = (defaultEmail = '', defaultRole: AdminRole = 'admin') => {
    setAdminEmail(defaultEmail);
    setSelectedRole(defaultRole);
    setAdminName(defaultEmail ? defaultEmail.split('@')[0] : '');
    setAdminPassword('Novella@2024!');
    setAdminBio('');
    setFeedback(null);
    setIsAddModalOpen(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const emailTrimmed = adminEmail.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    if (!onAddAdmin) {
      setFeedback({ type: 'error', message: 'Admin addition handler is not available.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddAdmin({
        email: emailTrimmed,
        fullName: adminName.trim() || emailTrimmed.split('@')[0],
        displayName: adminName.trim() || emailTrimmed.split('@')[0],
        role: selectedRole,
        password: adminPassword || 'Novella@2024!',
        bio: adminBio.trim() || `${selectedRole.replace('_', ' ')} of Novella Platform`,
      });

      setFeedback({
        type: 'success',
        message: `Successfully configured ${emailTrimmed} with role ${selectedRole.replace('_', ' ').toUpperCase()}!`,
      });

      setTimeout(() => {
        setIsAddModalOpen(false);
        setAdminEmail('');
        setAdminName('');
        setAdminBio('');
        setFeedback(null);
      }, 1400);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to add user/role. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AdminRole) => {
    try {
      setUpdatingUserId(userId);
      await onUpdateRole(userId, newRole);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeClasses = (role: AdminRole | string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'admin':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'content_admin':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'support_admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'finance_admin':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'author':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'customer':
      case 'user':
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
    }
  };

  const getRoleLabel = (role: AdminRole | string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'content_admin':
        return 'Content Admin';
      case 'support_admin':
        return 'Support Admin';
      case 'finance_admin':
        return 'Finance Admin';
      case 'author':
        return 'Author';
      case 'customer':
      case 'user':
      default:
        return 'Reader';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Add Admin Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Role-Based Access Control & User Roles
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit all users in the app, promote accounts, and assign administrative or author roles
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal('', 'admin')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User / Assign Role</span>
        </button>
      </div>

      {/* Admin Highlight Banner for devtonicllc@gmail.com */}
      <div className="p-4 rounded-3xl bg-linear-to-r from-purple-500/10 via-indigo-500/10 to-amber-500/10 border border-purple-200 dark:border-purple-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                Primary Platform Administrators Active
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
              <strong className="text-purple-700 dark:text-purple-300">devtonicllc@gmail.com</strong>, <strong className="text-zinc-700 dark:text-zinc-300">admin@novella.app</strong>, and <strong className="text-zinc-700 dark:text-zinc-300">ozerojephtah0@gmail.com</strong> have full Super Administrator privileges.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenAddModal('', 'admin')}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer whitespace-nowrap self-end md:self-auto"
        >
          + Add or Assign Role
        </button>
      </div>

      {/* Role Switcher Sandbox Banner */}
      <div className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-purple-950 dark:text-purple-200">
              Interactive RBAC Role Simulator
            </h3>
          </div>
          <p className="text-xs text-purple-800 dark:text-purple-300">
            Switch your active role instantly to preview platform permissions and restricted UI features.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['super_admin', 'admin', 'content_admin', 'support_admin', 'finance_admin'] as AdminRole[]).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminRole === r
                  ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-400'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {r.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Staff & All Users Management Roster */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        {/* Controls: View Tabs + Search & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 self-start">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All App Users ({users.length})</span>
            </button>

            <button
              onClick={() => setViewMode('staff')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'staff'
                  ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Staff Only ({adminStaff.length})</span>
            </button>
          </div>

          {/* Search & Role Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 max-w-md justify-end">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto text-xs py-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="content_admin">Content Admin</option>
              <option value="support_admin">Support Admin</option>
              <option value="finance_admin">Finance Admin</option>
              <option value="author">Author</option>
              <option value="customer">Reader</option>
            </select>
          </div>
        </div>

        {/* User Roster List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              No users found matching your filters.
            </div>
          ) : (
            filteredUsers.map((staff) => {
              const isCurrent = currentUser?.email.toLowerCase() === staff.email.toLowerCase();
              const badgeClasses = getRoleBadgeClasses(staff.role as AdminRole);
              const isUpdating = updatingUserId === staff.id;

              return (
                <div
                  key={staff.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-200 dark:hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 border border-purple-500/20">
                      {staff.avatar ? (
                        <img src={staff.avatar} alt={staff.displayName} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        staff.displayName?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {staff.displayName}
                        </h4>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            You
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeClasses}`}>
                          {getRoleLabel(staff.role as AdminRole)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">{staff.email}</p>
                      {staff.bio && (
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{staff.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <div className="relative">
                      <select
                        disabled={isUpdating}
                        value={staff.role}
                        onChange={(e) => handleRoleChange(staff.id, e.target.value as AdminRole)}
                        className="text-xs py-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold cursor-pointer focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="super_admin">👑 Super Admin (Full Privileges)</option>
                        <option value="admin">🛡️ Admin (General Administrator)</option>
                        <option value="content_admin">✍️ Content Admin (Books & Covers)</option>
                        <option value="support_admin">🎧 Support Admin (VIP & Bans)</option>
                        <option value="finance_admin">💳 Finance Admin (Paystack)</option>
                        <option value="author">✒️ Author (Publish & Stories)</option>
                        <option value="customer">📖 Reader (Standard User)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <span>Platform Capabilities by Role</span>
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">Strict Enforcement</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-2">Module / Capability</th>
                <th className="pb-3 px-2 text-center">Super Admin</th>
                <th className="pb-3 px-2 text-center">Admin</th>
                <th className="pb-3 px-2 text-center">Content Admin</th>
                <th className="pb-3 px-2 text-center">Support Admin</th>
                <th className="pb-3 px-2 text-center">Finance Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {CAPABILITY_MATRIX.map((row) => (
                <tr key={row.module} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-2 font-semibold text-zinc-800 dark:text-zinc-200">
                    {row.module}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.superAdmin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.contentAdmin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.supportAdmin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.financeAdmin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Administrator / User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Add User or Assign Role
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Assign administrator privileges, configure authors, or add new accounts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveAdmin} className="p-6 space-y-4">
              {feedback && (
                <div
                  className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. staff.admin@novella.app"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-400">
                  If an account already exists with this email, its role will be updated instantly.
                </p>
              </div>

              {/* Full Name / Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>User Full Name / Title</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amina Bello / Operations Lead"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Account Role</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                >
                  <option value="super_admin">👑 Super Administrator (Full platform & financial privileges)</option>
                  <option value="admin">🛡️ Administrator (General management, book editing, RBAC)</option>
                  <option value="content_admin">✍️ Content Administrator (Publishing, books, covers, chapters)</option>
                  <option value="support_admin">🎧 Support Administrator (Reader bans & VIP access grants)</option>
                  <option value="finance_admin">💳 Finance Administrator (Paystack transactions & settlements)</option>
                  <option value="author">✒️ Author (Content creator, publishing rights)</option>
                  <option value="customer">📖 Reader (Standard consumer account)</option>
                </select>
              </div>

              {/* Role description banner */}
              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-[11px] text-purple-900 dark:text-purple-300">
                {selectedRole === 'super_admin' && (
                  <span>⚡ <strong>Super Admin</strong>: Root privileges across all books, pricing, roles, database backups, and settings.</span>
                )}
                {selectedRole === 'admin' && (
                  <span>🛡️ <strong>Admin</strong>: Full administrative privileges to edit books, manage chapters, moderate users, and configure roles.</span>
                )}
                {selectedRole === 'content_admin' && (
                  <span>📚 <strong>Content Admin</strong>: Can author chapters, publish/edit books, design covers, and curate authors.</span>
                )}
                {selectedRole === 'support_admin' && (
                  <span>🎧 <strong>Support Admin</strong>: Can grant reader VIP access, unsuspend accounts, and broadcast community alerts.</span>
                )}
                {selectedRole === 'finance_admin' && (
                  <span>💳 <strong>Finance Admin</strong>: Can review Paystack transactions, settlement schedules, and revenue ledgers.</span>
                )}
                {selectedRole === 'author' && (
                  <span>✒️ <strong>Author</strong>: Can publish and manage own stories, write chapters, and monitor readership.</span>
                )}
                {(selectedRole === 'customer' || selectedRole === 'user') && (
                  <span>📖 <strong>Reader</strong>: Standard account for discovering, reading, bookmarking, and purchasing stories.</span>
                )}
              </div>

              {/* Temporary Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Initial Password</span>
                </label>
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-400">
                  Default: <code className="text-purple-600 font-semibold">Novella@2024!</code>. Can be changed by the user anytime.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>Save Account & Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
