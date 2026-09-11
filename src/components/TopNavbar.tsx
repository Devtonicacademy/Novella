import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, AppThemeMode, AppColorPalette } from '../context/ThemeContext';
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
  ChevronDown
} from 'lucide-react';

interface TopNavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'admin') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, isAdmin, signOut } = useAuth();
  const { mode, palette, isDark, setMode, setPalette, toggleTheme, palettes } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark & Literary Identity */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-zinc-50 block leading-none">
              Novella
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium tracking-wide uppercase">
              Stories & Books
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('explore')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'explore'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>

          <button
            onClick={() => onNavigate('library')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'library'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>My Library</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Studio</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Theme Customizer & Account) */}
        <div className="flex items-center gap-2">
          {/* Theme & Palette Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              title="Theme and Color Settings"
              aria-label="Theme Settings"
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-[11px] font-semibold hidden lg:inline capitalize">
                {mode === 'system' ? 'System' : isDark ? 'Dark' : 'Light'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-72 p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                {/* Mode Selector */}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {(user.fullName || user.displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate hidden sm:inline">
                  {user.fullName || user.displayName}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[9px] uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </button>

              <button
                onClick={signOut}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
