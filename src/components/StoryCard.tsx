import React from 'react';
import { Story } from '../types';
import { BookCover } from './BookCover';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Star, Clock, BookOpen, ArrowRight } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onSelectStory: (story: Story) => void;
  onReadStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
  layout?: 'grid' | 'horizontal';
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onSelectStory,
  onReadStory,
  onUnlockStory,
  layout = 'grid',
}) => {
  const { isStoryUnlocked, user } = useAuth();
  const isUnlocked = isStoryUnlocked(story);
  const progress = user?.readingProgress?.[story.id];

  if (layout === 'horizontal') {
    return (
      <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 shadow-xs hover:shadow-lg transition-all duration-300 hover:border-amber-600/40">
        <div
          onClick={() => onSelectStory(story)}
          className="shrink-0 flex justify-center cursor-pointer transition-transform duration-300 group-hover:-translate-y-1"
        >
          <BookCover story={story} size="sm" isUnlocked={isUnlocked} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                {story.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>{story.readTime}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-0.5 text-zinc-600 dark:text-zinc-300">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {story.rating}
              </span>
            </div>

            <h3
              onClick={() => onSelectStory(story)}
              className="font-display text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
            >
              {story.title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 mt-1 font-reading">
              {story.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              {story.isFree ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/50">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Free Book
                </span>
              ) : isUnlocked ? (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Unlocked in Library
                </span>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    ₦{story.priceNGN.toLocaleString()} NGN
                  </span>
                  <span className="text-[10px] text-zinc-400 tabular-nums">
                    (${story.priceUSD.toFixed(2)})
                  </span>
                </div>
              )}
            </div>

            {isUnlocked ? (
              <button
                onClick={() => onReadStory(story)}
                className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{progress ? 'Continue' : 'Read'}</span>
              </button>
            ) : (
              <button
                onClick={() => onUnlockStory(story)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <div className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 hover:border-amber-600/40">
      <div>
        <div
          onClick={() => onSelectStory(story)}
          className="flex justify-center mb-4 cursor-pointer transition-transform duration-300 group-hover:-translate-y-1.5"
        >
          <BookCover story={story} size="md" isUnlocked={isUnlocked} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
          <span className="font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px]">
            {story.category}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {story.rating}
          </span>
        </div>

        <h3
          onClick={() => onSelectStory(story)}
          className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
        >
          {story.title}
        </h3>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          By {story.author}
        </p>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 mt-2 font-reading">
          {story.description}
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
          {story.isFree ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Free
            </span>
          ) : isUnlocked ? (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Unlocked
            </span>
          ) : (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                ₦{story.priceNGN.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 tabular-nums">
                (${story.priceUSD.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {isUnlocked ? (
          <button
            onClick={() => onReadStory(story)}
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read</span>
          </button>
        ) : (
          <button
            onClick={() => onUnlockStory(story)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock</span>
          </button>
        )}
      </div>
    </div>
  );
};
