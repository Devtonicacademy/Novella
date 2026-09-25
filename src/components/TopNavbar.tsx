import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen,
  Compass,
  Library,
  Sun,
  Moon,
  Laptop,
  Palette,
  Check,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Search,
  Sparkles,
  Bell,
  Download,
  PenTool,
  Flame,
  Activity,
  Award
} from 'lucide-react';

interface TopNavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'admin') => void;
  onOpenSearch: () => void;
  onOpenAIStudio: () => void;
  onOpenNotifications: () => void;
  onOpenOfflineModal: () => void;
  onOpenActivityFeed?: () => void;
  onOpenProfileModal?: () => void;
  unreadNotificationsCount?: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenAuth,
  onOpenSearch,
  onOpenAIStudio,
  onOpenNotifications,
  onOpenOfflineModal,
  onOpenActivityFeed,
  onOpenProfileModal,
  unreadNotificationsCount = 0,
}) => {
  const { user, isAdmin, signOut } = useAuth();
  const { mode, palette, isDark, setMode, setPalette, palettes } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const isAuthor = user?.role === 'author' || user?.role === 'admin';
  const currentStreak = user?.readingStreak?.currentStreak || 0;

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    if (showThemeMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showThemeMenu]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Zone 1: Wordmark & Literary Identity */}
        <div
          id="brand-logo-btn"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-serif font-extrabold text-base sm:text-xl tracking-tight text-zinc-900 dark:text-zinc-50 block leading-none">
              Novella
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 font-medium tracking-wide uppercase">
              Storytelling
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            id="nav-home-btn"
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            Home
          </button>

          <button
            id="nav-catalog-btn"
            onClick={() => onNavigate('explore')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'explore'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>

          <button
            id="nav-library-btn"
            onClick={() => onNavigate('library')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'library'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>My Library</span>
          </button>

          <button
            id="nav-author-studio-btn"
            onClick={() => onNavigate('author-studio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'author-studio'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-500" />
            <span>Author Studio</span>
          </button>

          {isAdmin && (
            <button
              id="nav-admin-btn"
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Action Buttons (Search, AI Studio, Notifications, Offline, Theme, User) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Reading Streak Pill (Desktop) */}
          {user && (
            <button
              id="top-streak-btn"
              onClick={onOpenProfileModal || (() => onNavigate('profile'))}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title={`${currentStreak} Day Reading Streak · Click to view reading goals`}
            >
              <Flame className={`w-3.5 h-3.5 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-400'}`} />
              <span className="tabular-nums font-mono">{currentStreak}</span>
            </button>
          )}

          {/* Activity Feed Button (Desktop) */}
          {onOpenActivityFeed && (
            <button
              id="top-activity-feed-btn"
              onClick={onOpenActivityFeed}
              className="hidden sm:flex p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Community Activity Feed"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}

          {/* Advanced Search Button */}
          <button
            id="top-search-btn"
            onClick={onOpenSearch}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Advanced Search"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* AI Story Studio Action Button */}
          <button
            id="top-ai-studio-btn"
            onClick={onOpenAIStudio}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Generate Story with AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Studio</span>
          </button>

          {/* Notifications Center */}
          <button
            id="top-notifications-btn"
            onClick={onOpenNotifications}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          {/* Offline Library Modal Trigger (Desktop) */}
          <button
            id="top-offline-modal-btn"
            onClick={onOpenOfflineModal}
            className="hidden sm:flex p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Offline Downloads"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Theme & Palette Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Theme and Color Settings"
              aria-label="Theme Settings"
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-600" />
              )}
              <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:inline" />
            </button>

            {/* Dropdown Menu */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 z-50 animate-fadeIn space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                    Appearance Mode
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
                    <button
                      onClick={() => setMode('light')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        mode === 'light'
                          ? 'bg-white text-amber-800 shadow-xs font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                    </button>

                    <button
                      onClick={() => setMode('dark')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        mode === 'dark'
                          ? 'bg-zinc-700 text-amber-300 shadow-xs font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dark</span>
                    </button>

                    <button
                      onClick={() => setMode('system')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        mode === 'system'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                {/* Accent Color Palettes */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Color Theme Palette
                    </span>
                    <Palette className="w-3 h-3 text-zinc-400" />
                  </div>

                  <div className="space-y-1">
                    {palettes.map((p) => {
                      const isSelected = palette === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPalette(p.id)}
                          className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-100 dark:bg-zinc-800 font-bold'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-4 h-4 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                              style={{ backgroundColor: p.accentHex }}
                            />
                            <div className="truncate">
                              <span className="text-xs text-zinc-900 dark:text-zinc-100 block leading-tight">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate block">
                                {p.subtitle}
                              </span>
                            </div>
                          </div>

                          {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                id="top-profile-btn"
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                  {(user.fullName || user.displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate hidden sm:inline">
                  {user.fullName || user.displayName}
                </span>
              </button>

              <button
                onClick={signOut}
                className="hidden sm:flex p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="top-signin-btn"
              onClick={() => onOpenAuth('signin')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
