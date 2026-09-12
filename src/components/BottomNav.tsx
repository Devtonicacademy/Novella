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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-2 flex items-center justify-around safe-area-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
