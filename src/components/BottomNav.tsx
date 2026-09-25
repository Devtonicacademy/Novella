import React from 'react';
import { BookOpen, Compass, Library, User, Shield, PenTool, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAIStudio: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate, onOpenAIStudio }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'explore', label: 'Catalog', icon: Compass },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'author-studio', label: 'Studio', icon: PenTool },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800/80 px-1 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg transition-colors select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[52px] min-h-[44px] transition-all cursor-pointer ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 dark:bg-amber-500/15'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 active:scale-95'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
