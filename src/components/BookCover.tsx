import React from 'react';
import { Story } from '../types';
import { BookOpen, Lock, Sparkles } from 'lucide-react';

export interface BookCoverProps {
  story?: Story;
  title?: string;
  author?: string;
  category?: string;
  coverColorTheme?: {
    bgGradient: string;
    accent: string;
    text: string;
    border: string;
  };
  coverImage?: string;
  order?: number;
  isFree?: boolean;
  priceNGN?: number;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  isUnlocked?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({
  story,
  title,
  author,
  category,
  coverColorTheme,
  coverImage,
  order,
  isFree,
  priceNGN,
  subtitle,
  size = 'md',
  isUnlocked = true,
}) => {
  const finalTitle = story?.title || title || 'Untitled Story';
  const finalAuthor = story?.author || author || 'Novella Author';
  const finalSubtitle = story?.subtitle || subtitle;
  const finalCoverImage = story?.coverImage || coverImage;
  const finalOrder = story?.order ?? order ?? 1;
  const finalIsFree = story?.isFree ?? isFree ?? false;
  const finalPriceNGN = story?.priceNGN ?? priceNGN ?? 2500;

  const theme = story?.coverColorTheme || coverColorTheme || {
    bgGradient: 'from-amber-950 via-zinc-900 to-black',
    accent: '#d97706',
    text: '#fef3c7',
    border: '#78350f',
  };

  const sizeClasses = {
    sm: 'w-24 h-36 p-2 text-xs',
    md: 'w-40 h-56 p-3.5 text-xs',
    lg: 'w-56 h-80 p-5 text-sm',
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-xl flex flex-col justify-between select-none transition-all duration-300 bg-gradient-to-b ${theme.bgGradient} ${sizeClasses[size]} border border-zinc-800`}
      style={{
        boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.45), inset 3px 0 6px -2px rgba(255,255,255,0.15)',
      }}
    >
      {/* Background Cover Image if available */}
      {finalCoverImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={finalCoverImage}
            alt={finalTitle}
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.bgGradient} opacity-85`} />
        </div>
      )}

      {/* Spine highlight on left */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none z-10" />

      {/* Header ribbon / badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="text-[9px] font-mono tracking-widest uppercase font-semibold px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-xs"
          style={{ color: theme.text }}
        >
          Vol. {finalOrder < 10 ? `0${finalOrder}` : finalOrder}
        </span>

        {finalIsFree ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 backdrop-blur-xs">
            <Sparkles className="w-2.5 h-2.5" />
            FREE
          </span>
        ) : !isUnlocked ? (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/70 text-zinc-300 border border-zinc-700/50 backdrop-blur-xs">
            <Lock className="w-2.5 h-2.5 text-amber-400" />
            ₦{finalPriceNGN}
          </span>
        ) : null}
      </div>

      {/* Title & Central Motif */}
      <div className="relative z-10 my-auto text-center space-y-1.5 px-1">
        <div className="w-6 h-0.5 mx-auto rounded-full" style={{ backgroundColor: theme.accent }} />
        <h4
          className="font-display font-bold leading-tight drop-shadow-md line-clamp-3"
          style={{ color: theme.text }}
        >
          {finalTitle}
        </h4>
        {finalSubtitle && size !== 'sm' && (
          <p className="text-[10px] text-zinc-300 font-reading italic line-clamp-1 drop-shadow-xs">
            {finalSubtitle}
          </p>
        )}
      </div>

      {/* Footer Author Stamp */}
      <div className="relative z-10 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-zinc-400">
        <span className="truncate max-w-[80%]" style={{ color: theme.text }}>
          {finalAuthor}
        </span>
        <BookOpen className="w-3 h-3 opacity-60 shrink-0" style={{ color: theme.text }} />
      </div>
    </div>
  );
};
