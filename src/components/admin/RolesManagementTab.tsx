import React, { useState } from 'react';
import { AdminRole, UserProfile } from '../../types';
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
  Sparkles
} from 'lucide-react';

interface RolesManagementTabProps {
  users: UserProfile[];
  onUpdateRole: (userId: string, role: AdminRole) => Promise<void>;
}

interface RoleCapability {
  module: string;
  superAdmin: boolean;
  contentAdmin: boolean;
  supportAdmin: boolean;
  financeAdmin: boolean;
}

const CAPABILITY_MATRIX: RoleCapability[] = [
  { module: 'Overview Dashboard & Health', superAdmin: true, contentAdmin: true, supportAdmin: true, financeAdmin: true },
  { module: 'Publish & Delete Books', superAdmin: true, contentAdmin: true, supportAdmin: false, financeAdmin: false },
  { module: 'Chapter Authoring & Reorder', superAdmin: true, contentAdmin: true, supportAdmin: false, financeAdmin: false },
  { module: 'Cover Art & AI Studio', superAdmin: true, contentAdmin: true, supportAdmin: false, financeAdmin: false },
  { module: 'Author & Genre Management', superAdmin: true, contentAdmin: true, supportAdmin: false, financeAdmin: false },
  { module: 'Reader VIP Access Grants', superAdmin: true, contentAdmin: false, supportAdmin: true, financeAdmin: false },
  { module: 'Reader Account Moderation / Bans', superAdmin: true, contentAdmin: false, supportAdmin: true, financeAdmin: false },
  { module: 'Paystack Settlement Ledger', superAdmin: true, contentAdmin: false, supportAdmin: false, financeAdmin: true },
  { module: 'Transaction CSV Exports', superAdmin: true, contentAdmin: false, supportAdmin: false, financeAdmin: true },
  { module: 'Broadcast Announcements', superAdmin: true, contentAdmin: true, supportAdmin: true, financeAdmin: false },
  { module: 'Platform Security & Secret Keys', superAdmin: true, contentAdmin: false, supportAdmin: false, financeAdmin: false },
  { module: 'Role Assignments (RBAC)', superAdmin: true, contentAdmin: false, supportAdmin: false, financeAdmin: false },
];

export const RolesManagementTab: React.FC<RolesManagementTabProps> = ({
  users,
  onUpdateRole,
}) => {
  const { adminRole, switchRole } = useAuth();
  const adminStaff = users.filter(u => u.role && u.role !== 'user');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Role-Based Access Control (RBAC Matrix)
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Enforce least-privilege security boundaries across editorial, financial, and support teams
          </p>
        </div>
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
          {(['super_admin', 'content_admin', 'support_admin', 'finance_admin'] as AdminRole[]).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminRole === r
                  ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-400'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {r.replace('_', ' ').toUpperCase()}
            </button>
          ))}
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

      {/* Staff Roster */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          <span>Assigned Staff Accounts ({adminStaff.length})</span>
        </h3>

        <div className="space-y-3">
          {adminStaff.map((staff) => (
            <div
              key={staff.id}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-700 font-bold flex items-center justify-center shrink-0">
                  {staff.displayName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {staff.displayName}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">{staff.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={staff.role}
                  onChange={(e) => onUpdateRole(staff.id, e.target.value as AdminRole)}
                  className="text-xs py-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold cursor-pointer"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="content_admin">Content Admin</option>
                  <option value="support_admin">Support Admin</option>
                  <option value="finance_admin">Finance Admin</option>
                  <option value="user">Demote to Reader</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
