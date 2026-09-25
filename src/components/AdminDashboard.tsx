import React, { useState, useEffect } from 'react';
import {
  Story,
  PaystackTransaction,
  Author,
  CategoryInfo,
  UserProfile,
  Announcement,
  AuditLog,
  PlatformSettings,
  StoryAnalytics,
  AdminRole,
  Chapter
} from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar, AdminTab } from './admin/AdminSidebar';
import { DashboardOverviewTab } from './admin/DashboardOverviewTab';
import { BookManagementTab } from './admin/BookManagementTab';
import { ChapterManagementTab } from './admin/ChapterManagementTab';
import { CoverManagementTab } from './admin/CoverManagementTab';
import { AuthorManagementTab } from './admin/AuthorManagementTab';
import { CategoryManagementTab } from './admin/CategoryManagementTab';
import { PricesManagementTab } from './admin/PricesManagementTab';
import { PurchasesManagementTab } from './admin/PurchasesManagementTab';
import { UserManagementTab } from './admin/UserManagementTab';
import { PaymentsManagementTab } from './admin/PaymentsManagementTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { AnnouncementsTab } from './admin/AnnouncementsTab';
import { RolesManagementTab } from './admin/RolesManagementTab';
import { AuditLogsTab } from './admin/AuditLogsTab';
import { SettingsTab } from './admin/SettingsTab';
import {
  Menu,
  ShieldAlert,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Eye,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface AdminDashboardProps {
  stories: Story[];
  onRefreshStories: () => void;
  onPreviewStory?: (story: Story) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stories,
  onRefreshStories,
  onPreviewStory,
  onLogout
}) => {
  const { user, adminRole, switchRole, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for all Admin Data Layers
  const [transactions, setTransactions] = useState<PaystackTransaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [analytics, setAnalytics] = useState<StoryAnalytics[]>([]);

  // Selected story for specific cross-tab jumps (e.g. from Books tab to Chapters tab)
  const [activeStoryForChapters, setActiveStoryForChapters] = useState<Story | null>(null);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        txList,
        statData,
        authorList,
        catList,
        userList,
        annList,
        logsList,
        settingData,
        analyticsList,
      ] = await Promise.all([
        api.getTransactions(),
        api.getStats(),
        api.getAuthors(),
        api.getCategories(),
        api.getUsers(),
        api.getAnnouncements(),
        api.getAuditLogs(),
        api.getSettings(),
        api.getAnalytics(),
      ]);

      setTransactions(txList);
      setStats(statData);
      setAuthors(authorList);
      setCategories(catList);
      setUsers(userList);
      setAnnouncements(annList);
      setAuditLogs(logsList);
      setSettings(settingData);
      setAnalytics(analyticsList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Handlers for Books
  const handleSaveStory = async (storyData: Partial<Story>) => {
    if (storyData.id) {
      await api.updateStory(storyData.id, storyData);
    } else {
      await api.createStory(storyData);
    }
    onRefreshStories();
    fetchAllAdminData();
  };

  const handleDeleteStory = async (storyId: string) => {
    await api.deleteStory(storyId);
    onRefreshStories();
    fetchAllAdminData();
  };

  const handleManageChapters = (story: Story) => {
    setActiveStoryForChapters(story);
    setCurrentTab('chapters');
  };

  // Handlers for Chapters
  const handleUpdateChapters = async (storyId: string, chapters: Chapter[]) => {
    await api.updateChapters(storyId, chapters);
    onRefreshStories();
    fetchAllAdminData();
  };

  // Handlers for Book Covers
  const handleSaveCover = async (
    storyId: string,
    coverData: { coverImage?: string; coverColorTheme?: any }
  ) => {
    await api.updateCover(storyId, coverData);
    onRefreshStories();
    fetchAllAdminData();
  };

  // Handlers for Authors
  const handleSaveAuthor = async (authorData: Partial<Author>) => {
    if (authorData.id) {
      await api.updateAuthor(authorData.id, authorData);
    } else {
      await api.createAuthor(authorData);
    }
    fetchAllAdminData();
  };

  const handleDeleteAuthor = async (authorId: string) => {
    await api.deleteAuthor(authorId);
    fetchAllAdminData();
  };

  // Handlers for Categories
  const handleSaveCategory = async (catData: Partial<CategoryInfo>) => {
    if (catData.id) {
      await api.updateCategory(catData.id, catData);
    } else {
      await api.createCategory(catData);
    }
    fetchAllAdminData();
  };

  const handleDeleteCategory = async (catId: string) => {
    await api.deleteCategory(catId);
    fetchAllAdminData();
  };

  // Handlers for Users & Roles
  const handleUpdateUserRole = async (userId: string, role: AdminRole) => {
    await api.updateUserRole(userId, role);
    fetchAllAdminData();
  };

  const handleAddAdmin = async (adminData: {
    email: string;
    fullName?: string;
    displayName?: string;
    role?: AdminRole;
    password?: string;
    bio?: string;
  }) => {
    await api.addAdmin(adminData);
    fetchAllAdminData();
  };

  const handleToggleUserStatus = async (userId: string, _status: 'active' | 'suspended') => {
    await api.toggleUserStatus(userId);
    fetchAllAdminData();
  };

  const handleGrantStoryAccess = async (userId: string, storyId: string) => {
    await api.grantStoryAccess(userId, storyId);
    fetchAllAdminData();
  };

  const handleRevokeStoryAccess = async (userId: string, storyId: string) => {
    await api.revokeStoryAccess(userId, storyId);
    fetchAllAdminData();
  };

  // Handlers for Announcements
  const handleSaveAnnouncement = async (announcementData: Partial<Announcement>) => {
    if (announcementData.id) {
      await api.updateAnnouncement(announcementData.id, announcementData);
    } else {
      await api.createAnnouncement(announcementData);
    }
    fetchAllAdminData();
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    await api.deleteAnnouncement(annId);
    fetchAllAdminData();
  };

  // Handlers for Platform Settings
  const handleSaveSettings = async (newSettings: PlatformSettings) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
    fetchAllAdminData();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Admin Control Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center font-black text-sm shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  Novella Admin Hub
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Secured RBAC
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Publishing, Pricing & Paystack Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllAdminData}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Admin Body with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={onLogout || signOut}
        />

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardOverviewTab
              stats={stats}
              stories={stories}
              transactions={transactions}
              users={users}
              authors={authors}
              onNavigateTab={setCurrentTab}
              onOpenCreateStory={() => setCurrentTab('books')}
            />
          )}

          {currentTab === 'books' && (
            <BookManagementTab
              stories={stories}
              authors={authors}
              categories={categories}
              onSaveStory={handleSaveStory}
              onDeleteStory={handleDeleteStory}
              onManageChapters={handleManageChapters}
              onPreviewStory={(story) => {
                if (onPreviewStory) onPreviewStory(story);
              }}
            />
          )}

          {currentTab === 'chapters' && (
            <ChapterManagementTab
              stories={stories}
              selectedStoryId={activeStoryForChapters?.id}
              onUpdateChapters={handleUpdateChapters}
            />
          )}

          {currentTab === 'covers' && (
            <CoverManagementTab
              stories={stories}
              onSaveCover={handleSaveCover}
            />
          )}

          {currentTab === 'authors' && (
            <AuthorManagementTab
              authors={authors}
              stories={stories}
              onSaveAuthor={handleSaveAuthor}
              onDeleteAuthor={handleDeleteAuthor}
              onFilterStoriesByAuthor={() => setCurrentTab('books')}
            />
          )}

          {currentTab === 'categories' && (
            <CategoryManagementTab
              categories={categories}
              stories={stories}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
              onFilterStoriesByCategory={() => setCurrentTab('books')}
            />
          )}

          {currentTab === 'prices' && (
            <PricesManagementTab
              stories={stories}
              settings={settings || undefined}
              onPriceUpdated={() => {
                onRefreshStories();
                fetchAllAdminData();
              }}
            />
          )}

          {currentTab === 'purchases' && (
            <PurchasesManagementTab
              settings={settings || undefined}
            />
          )}

          {currentTab === 'users' && (
            <UserManagementTab
              users={users}
              stories={stories}
              onUpdateRole={handleUpdateUserRole}
              onToggleStatus={handleToggleUserStatus}
              onGrantStoryAccess={handleGrantStoryAccess}
              onRevokeStoryAccess={handleRevokeStoryAccess}
              onAddUser={handleAddAdmin}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsManagementTab
              transactions={transactions}
              onRefreshTransactions={fetchAllAdminData}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsTab
              stories={stories}
              analyticsData={analytics}
            />
          )}

          {currentTab === 'announcements' && (
            <AnnouncementsTab
              announcements={announcements}
              onSaveAnnouncement={handleSaveAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {currentTab === 'roles' && (
            <RolesManagementTab
              users={users}
              onUpdateRole={handleUpdateUserRole}
              onAddAdmin={handleAddAdmin}
            />
          )}

          {currentTab === 'audit' && (
            <AuditLogsTab
              logs={auditLogs}
            />
          )}

          {currentTab === 'settings' && settings && (
            <SettingsTab
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
};
