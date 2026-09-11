import React from 'react';
import { Story } from '../types';
import { BookCover } from './BookCover';
import { useAuth } from '../context/AuthContext';
import { X, BookOpen, Lock, Sparkles, Star, Check } from 'lucide-react';

interface StoryDetailModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onReadStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  isOpen,
  onClose,
  onReadStory,
  onUnlockStory,
}) => {
  const { isStoryUnlocked } = useAuth();

  if (!isOpen || !story) return null;

  const isUnlocked = isStoryUnlocked(story);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
              {story.category}
            </span>
            <span aria-hidden="true">·</span>
            <span>Volume {story.order}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <BookCover story={story} size="md" isUnlocked={isUnlocked} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <span>{story.readTime}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5 tabular-nums">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {story.rating} ({story.reviewCount} reviews)
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {story.title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Written by {story.author}
              </p>

              {/* Status & Price Pill / Badge */}
              <div className="mt-3">
                {story.isFree ? (
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Free Book · Complete Access</span>
                  </div>
                ) : isUnlocked ? (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unlocked in Your Library</span>
                  </div>
                ) : (
                  <div className="inline-flex items-baseline gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      ₦{story.priceNGN.toLocaleString()} NGN
                    </span>
                    <span className="text-xs text-zinc-500 tabular-nums">
                      (${(story.priceUSD || 2.99).toFixed(2)} USD)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1.5">
              Synopsis & Themes
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-reading">
              {story.synopsis || story.description}
            </p>
          </div>

          {/* Chapter Outline */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-2">
              Chapters ({story.totalChapters})
            </h3>
            <div className="space-y-1.5">
              {(story.chapters || []).map((ch, idx) => (
                <div
                  key={ch.id || idx}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 font-semibold text-[11px]">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.
                    </span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
                      {ch.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                    {ch.readMinutes} min read
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          {story.authorBio && (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5">
                About the Author
              </span>
              {story.authorBio}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>

          {isUnlocked ? (
            <button
              onClick={() => {
                onClose();
                onReadStory(story);
              }}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Story</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onUnlockStory(story);
              }}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Story · ₦{story.priceNGN.toLocaleString()}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
