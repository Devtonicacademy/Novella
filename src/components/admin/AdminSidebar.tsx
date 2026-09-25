import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminRole } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Image as ImageIcon,
  UserCheck,
  FolderTree,
  DollarSign,
  Users,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Bell,
  ShieldAlert,
  FileText,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard'
  | 'books'
  | 'chapters'
  | 'covers'
  | 'authors'
  | 'categories'
  | 'prices'
  | 'users'
  | 'purchases'
  | 'payments'
  | 'analytics'
  | 'announcements'
  | 'roles'
  | 'audit'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  allowedRoles?: AdminRole[];
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onLogout
}) => {
  const { adminRole, switchRole, user, signOut } = useAuth();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut();
    }
  };

  const navGroups: NavGroup[] = [
    {
      groupName: 'Platform Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      groupName: 'Story Manuscripts & Content',
      items: [
        { id: 'books', label: 'Books', icon: BookOpen },
        { id: 'chapters', label: 'Chapters', icon: Layers },
        { id: 'covers', label: 'Covers & Art', icon: ImageIcon, badge: 'Design' },
        { id: 'authors', label: 'Authors', icon: UserCheck },
        { id: 'categories', label: 'Categories', icon: FolderTree },
      ]
    },
    {
      groupName: 'Pricing & Monetization',
      items: [
        { id: 'prices', label: 'Prices', icon: DollarSign, badge: 'NGN/USD' },
        { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
        { id: 'payments', label: 'Payments', icon: CreditCard, badge: 'Paystack' },
      ]
    },
    {
      groupName: 'Audience & Intelligence',
      items: [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'announcements', label: 'Announcements', icon: Bell },
      ]
    },
    {
      groupName: 'Governance & Security',
      items: [
        { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck },
        { id: 'audit', label: 'Audit Logs', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin (Full Access)';
      case 'admin': return 'Administrator (Full Access)';
      case 'content_admin': return 'Content Admin (Editorial)';
      case 'support_admin': return 'Support Admin (Users & Access)';
      case 'finance_admin': return 'Finance Admin (Settlements)';
      default: return 'Administrator';
    }
  };

  const getRoleColor = (role: AdminRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'admin': return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'content_admin': return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'support_admin': return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'finance_admin': return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:sticky top-14 sm:top-16 z-40 h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-4rem)] w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
        flex flex-col transition-all duration-300 overflow-y-auto touch-scroll shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:pb-0
        ${isOpenMobile ? 'left-0' : '-left-72 lg:left-0'}
      `}>
        {/* Role & Access Switcher Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Role Switcher</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-600/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              RBAC v2.4
            </span>
          </div>

          <select
            value={adminRole}
            onChange={(e) => switchRole(e.target.value as AdminRole)}
            className="w-full text-base sm:text-xs font-semibold py-2 px-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
          >
            <option value="super_admin">👑 Super Admin (Full Control)</option>
            <option value="admin">🛡️ Admin (General Administrator)</option>
            <option value="content_admin">✍️ Content Admin (Books & Chapters)</option>
            <option value="support_admin">🎧 Support Admin (Readers & Grants)</option>
            <option value="finance_admin">💳 Finance Admin (Paystack & Revenue)</option>
          </select>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="truncate">Active: <strong className="text-zinc-800 dark:text-zinc-200">{user?.displayName || 'Admin'}</strong></span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getRoleColor(adminRole)}`}>
              {adminRole.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-6 flex-1">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                {group.groupName}
              </div>

              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group
                        ${isActive
                          ? 'bg-purple-700 text-white shadow-sm font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-white' : 'text-zinc-400'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Action & Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Admin Logout</span>
            </div>
            <span className="text-[10px] uppercase font-mono text-red-400">Exit</span>
          </button>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Online</span>
            </span>
            <span className="font-mono text-[10px]">v1.4.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
