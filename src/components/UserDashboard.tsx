import React from 'react';
import { Story, UserBookmark, ReaderTheme } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme, AppThemeMode, AppColorPalette } from '../context/ThemeContext';
import { StoryCard } from './StoryCard';
import { BookCover } from './BookCover';
import {
  Library,
  Bookmark,
  Clock,
  Sparkles,
  Compass,
  Trash2,
  ArrowRight,
  Sun,
  Moon,
  Laptop,
  Palette,
  Check,
  Sliders
} from 'lucide-react';

interface UserDashboardProps {
  stories: Story[];
  onReadStory: (story: Story, chapterId?: string) => void;
  onSelectStory: (story: Story) => void;
  onNavigate: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  stories,
  onReadStory,
  onSelectStory,
  onNavigate,
}) => {
  const { user, isStoryUnlocked, removeBookmark } = useAuth();
  const { mode, palette, isDark, setMode, setPalette, palettes } = useTheme();

  // Books user has access to (Free books #1 and #2 + purchased)
  const accessibleStories = stories.filter((s) => isStoryUnlocked(s));

  const progressStories = stories.filter(
    (s) => user?.readingProgress?.[s.id] && isStoryUnlocked(s)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Profile & Library Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-lg">
          {(user?.fullName || user?.displayName || 'R').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {user?.fullName || user?.displayName || 'Reader'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-[10px] font-bold text-amber-800 dark:text-amber-300">
              {user?.role && user.role !== 'user' ? 'Administrator' : 'Customer Account'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            {user?.email || 'reader@novella.app'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Library className="w-4 h-4 text-amber-600" />
              <span>
                <strong>{accessibleStories.length}</strong> Unlocked Books
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>
                <strong>{user?.bookmarks?.length || 0}</strong> Bookmarks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme & Display Customization Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
                Appearance & Theme Preferences
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Personalize your reading interface, light/dark mode, and color theme accents.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode Setting */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMode('light')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  mode === 'light'
                    ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-semibold">Light Mode</span>
                {mode === 'light' && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>

              <button
                onClick={() => setMode('dark')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  mode === 'dark'
                    ? 'border-amber-500 bg-amber-950/40 text-amber-200 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Moon className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold">Dark Mode</span>
                {mode === 'dark' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                onClick={() => setMode('system')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  mode === 'system'
                    ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Laptop className="w-5 h-5" />
                <span className="text-xs font-semibold">System Auto</span>
                {mode === 'system' && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            </div>
          </div>

          {/* Accent Color Palettes */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Color Palette Accent
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {palettes.map((p) => {
                const isSelected = palette === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPalette(p.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/30 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: p.accentHex }}
                      />
                      <div className="truncate">
                        <span className="text-xs text-zinc-900 dark:text-zinc-100 block truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate block">
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
      </section>

      {/* Section 1: Continue Reading (Active Progress) */}
      {progressStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Clock className="w-4 h-4" />
            <span>Continue Reading</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressStories.map((story) => {
              const prog = user?.readingProgress?.[story.id];
              return (
                <div
                  key={story.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 hover:border-amber-600 transition-all cursor-pointer group"
                  onClick={() => onReadStory(story, prog?.currentChapterId)}
                >
                  <BookCover story={story} size="sm" isUnlocked={true} />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      Chapter {prog?.currentChapterOrder || 1}
                    </p>

                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{ width: `${prog?.percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      {prog?.percentage || 0}% completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 2: All Unlocked Stories in My Library */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">
              My Personal Shelf ({accessibleStories.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Includes complimentary free books and permanently unlocked manuscripts.
            </p>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Explore More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {accessibleStories.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Compass className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="font-display text-base font-bold">No books unlocked yet</p>
            <p className="text-xs text-zinc-500 mt-1">
              Browse the catalog to read free stories or purchase new titles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accessibleStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onSelectStory={onSelectStory}
                onReadStory={onReadStory}
                onUnlockStory={() => {}}
                layout="grid"
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Reader Bookmarks & Notes */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          <Bookmark className="w-4 h-4" />
          <span>My Bookmarks & Quotes</span>
        </div>

        {!user?.bookmarks || user.bookmarks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
            You haven't bookmarked any passages yet. Tap the bookmark icon while reading.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.bookmarks.map((bm) => {
              const matchedStory = stories.find((s) => s.id === bm.storyId);
              return (
                <div
                  key={bm.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        {matchedStory?.title || 'Story'}
                      </span>
                      <button
                        onClick={() => removeBookmark(bm.id)}
                        className="text-zinc-400 hover:text-red-500 p-1"
                        title="Delete Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {bm.chapterTitle}
                    </h4>

                    {bm.note && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg mt-2 font-reading">
                        "{bm.note}"
                      </p>
                    )}
                  </div>

                  {matchedStory && (
                    <button
                      onClick={() => onReadStory(matchedStory, bm.chapterId)}
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 pt-2 cursor-pointer"
                    >
                      <span>Jump to Chapter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
