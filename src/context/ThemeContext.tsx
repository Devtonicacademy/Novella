import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type AppThemeMode = 'light' | 'dark' | 'system';
export type AppColorPalette = 'amber' | 'emerald' | 'violet' | 'crimson' | 'slate';

export interface PaletteOption {
  id: AppColorPalette;
  name: string;
  subtitle: string;
  accentHex: string;
  bgHex: string;
  badgeClass: string;
}

export const PALETTES: PaletteOption[] = [
  {
    id: 'amber',
    name: 'Sahara Gold',
    subtitle: 'Warm Ochre & Golden Sands',
    accentHex: '#b45309',
    bgHex: '#fffbeb',
    badgeClass: 'bg-amber-500',
  },
  {
    id: 'emerald',
    name: 'Nile Emerald',
    subtitle: 'Lush Moss & Rainforest',
    accentHex: '#047857',
    bgHex: '#ecfdf5',
    badgeClass: 'bg-emerald-600',
  },
  {
    id: 'violet',
    name: 'Imperial Violet',
    subtitle: 'Royal Purple & Amethyst',
    accentHex: '#6d28d9',
    bgHex: '#f5f3ff',
    badgeClass: 'bg-purple-600',
  },
  {
    id: 'crimson',
    name: 'Kalahari Crimson',
    subtitle: 'Rich Ruby & Sunset Coral',
    accentHex: '#be123c',
    bgHex: '#fff1f2',
    badgeClass: 'bg-rose-600',
  },
  {
    id: 'slate',
    name: 'Modern Slate',
    subtitle: 'Minimalist Zinc & Steel',
    accentHex: '#334155',
    bgHex: '#f8fafc',
    badgeClass: 'bg-slate-700',
  },
];

interface ThemeContextType {
  mode: AppThemeMode;
  palette: AppColorPalette;
  isDark: boolean;
  setMode: (mode: AppThemeMode) => void;
  setPalette: (palette: AppColorPalette) => void;
  toggleTheme: () => void;
  palettes: PaletteOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppThemeMode>(() => {
    try {
      const saved = localStorage.getItem('novella_theme_mode') as AppThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {}
    return 'system';
  });

  const [palette, setPaletteState] = useState<AppColorPalette>(() => {
    try {
      const saved = localStorage.getItem('novella_color_palette') as AppColorPalette;
      if (['amber', 'emerald', 'violet', 'crimson', 'slate'].includes(saved)) return saved;
    } catch {}
    return 'amber';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('novella_theme_mode') as AppThemeMode;
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Calculate and apply dark mode
  const applyThemeMode = useCallback((selectedMode: AppThemeMode) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    let dark = false;

    if (selectedMode === 'dark') {
      dark = true;
    } else if (selectedMode === 'light') {
      dark = false;
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(dark);

    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    root.setAttribute('data-theme-mode', selectedMode);
  }, []);

  // Update mode
  const setMode = useCallback((newMode: AppThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('novella_theme_mode', newMode);
    } catch {}
    applyThemeMode(newMode);
  }, [applyThemeMode]);

  // Update palette
  const setPalette = useCallback((newPalette: AppColorPalette) => {
    setPaletteState(newPalette);
    try {
      localStorage.setItem('novella_color_palette', newPalette);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-palette', newPalette);
    }
  }, []);

  // Toggle quick switch between light and dark
  const toggleTheme = useCallback(() => {
    setMode(isDark ? 'light' : 'dark');
  }, [isDark, setMode]);

  // Handle system preference changes when mode is 'system'
  useEffect(() => {
    applyThemeMode(mode);

    if (mode === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyThemeMode('system');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode, applyThemeMode]);

  // Apply initial palette
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-palette', palette);
    }
  }, [palette]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        palette,
        isDark,
        setMode,
        setPalette,
        toggleTheme,
        palettes: PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
