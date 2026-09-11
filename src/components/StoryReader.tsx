import React, { useState, useEffect, useRef } from 'react';
import { Story, Chapter, ReaderSettings, ReaderFontSize, ReaderFontFamily, ReaderTheme } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Settings,
  List,
  Lock,
  Sparkles,
  Share2,
  X,
  Type,
  Maximize2,
  Check,
  Volume2
} from 'lucide-react';

interface StoryReaderProps {
  storyId: string;
  initialChapterId?: string;
  onClose: () => void;
  onUnlockStory: (story: Story) => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  storyId,
  initialChapterId,
  onClose,
  onUnlockStory,
}) => {
  const { user, isStoryUnlocked, saveReadingProgress, addBookmark, removeBookmark } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');

  // Reader Settings State
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('novella_reader_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fontFamily: 'serif',
      fontSize: 'base',
      lineHeight: 'relaxed',
      theme: 'paper',
      maxWidth: 'normal',
    };
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fetch full story
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getStoryForReading(
          storyId,
          user?.email,
          user?.unlockedStoryIds || []
        );
        if (isMounted) {
          setStory(data);
          if (initialChapterId && data.chapters) {
            const idx = data.chapters.findIndex((c) => c.id === initialChapterId);
            if (idx !== -1) setCurrentChapterIndex(idx);
          } else if (user?.readingProgress?.[storyId]) {
            const savedChId = user.readingProgress[storyId].currentChapterId;
            const idx = data.chapters?.findIndex((c) => c.id === savedChId) ?? -1;
            if (idx !== -1) setCurrentChapterIndex(idx);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Could not open manuscript';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [storyId, user?.email, user?.unlockedStoryIds, initialChapterId]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('novella_reader_settings', JSON.stringify(readerSettings));
  }, [readerSettings]);

  // Scroll tracker & Progress sync
  const handleScroll = () => {
    if (!contentRef.current || !story) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight || 1)) * 100));
    setScrollProgress(progress);

    // Save reading progress in background
    const currentChapter = story.chapters[currentChapterIndex];
    if (currentChapter) {
      saveReadingProgress(story.id, currentChapter.id, currentChapter.order, progress);
    }
  };

  const isUnlocked = story ? isStoryUnlocked(story) : false;
  const currentChapter: Chapter | undefined = story?.chapters?.[currentChapterIndex];

  // Font classes
  const fontFamilies: Record<ReaderFontFamily, string> = {
    serif: 'font-reading',
    sans: 'font-sans-ui',
    mono: 'font-mono-code',
  };

  const fontSizes: Record<ReaderFontSize, string> = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
    '2xl': 'text-2xl leading-loose',
  };

  const themeClasses: Record<ReaderTheme, string> = {
    paper: 'theme-paper',
    sepia: 'theme-sepia',
    parchment: 'theme-parchment',
    night: 'theme-night',
    oled: 'theme-oled',
  };

  const maxWidthClasses = {
    narrow: 'max-w-xl',
    normal: 'max-w-2xl',
    wide: 'max-w-4xl',
  };

  const handleNextChapter = () => {
    if (!story) return;
    if (currentChapterIndex < story.chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isCurrentChapterBookmarked = user?.bookmarks?.some(
    (b) => b.storyId === storyId && b.chapterId === currentChapter?.id
  );

  const handleBookmarkToggle = () => {
    if (!story || !currentChapter) return;
    const existing = user?.bookmarks?.find(
      (b) => b.storyId === storyId && b.chapterId === currentChapter.id
    );
    if (existing) {
      removeBookmark(existing.id);
    } else {
      setShowBookmarkModal(true);
    }
  };

  const handleSaveBookmark = () => {
    if (!story || !currentChapter) return;
    addBookmark({
      storyId: story.id,
      chapterId: currentChapter.id,
      chapterOrder: currentChapter.order,
      chapterTitle: currentChapter.title,
      paragraphIndex: 0,
      note: bookmarkNote.trim() || undefined,
    });
    setBookmarkNote('');
    setShowBookmarkModal(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-display text-sm text-zinc-300">Unfurling Manuscript...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
          <Lock className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="font-display text-2xl font-bold">Premium Story</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-reading leading-relaxed">
            {error || 'This complete manuscript is locked. The first 2 books in StoryFlow are completely free.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl"
            >
              Back to Catalog
            </button>
            {story && (
              <button
                onClick={() => {
                  onClose();
                  onUnlockStory(story);
                }}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Book</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${themeClasses[readerSettings.theme]} transition-colors duration-200`}>
      {/* Top Reading Navigation Bar */}
      <header className="h-14 border-b border-black/10 dark:border-white/10 px-4 flex items-center justify-between shrink-0 select-none bg-inherit/90 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Exit Reader"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-display text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-sm">
              {story.title}
            </h1>
            <p className="text-[10px] opacity-70 truncate max-w-[180px]">
              Chapter {currentChapterIndex + 1} of {story.chapters.length}: {currentChapter?.title}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Table of Contents / Drawer */}
          <button
            onClick={() => setShowDrawer(true)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Table of Contents"
          >
            <List className="w-5 h-5" />
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={handleBookmarkToggle}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={isCurrentChapterBookmarked ? 'Bookmarked' : 'Add Bookmark'}
          >
            {isCurrentChapterBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-amber-600 fill-amber-600" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>

          {/* Reader Display Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-colors ${
              showSettings ? 'bg-amber-500/20 text-amber-600' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Display & Typography Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Reading Progress Indicator */}
      <div className="w-full h-1 bg-black/5 dark:bg-white/5">
        <div
          className="h-full bg-amber-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Reading Viewport */}
      <main
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12"
      >
        <div className={`mx-auto ${maxWidthClasses[readerSettings.maxWidth]}`}>
          {currentChapter && (
            <article className="space-y-6">
              {/* Chapter Header */}
              <div className="text-center pb-8 border-b border-black/10 dark:border-white/10 space-y-2">
                <span className="text-[11px] font-mono tracking-widest uppercase opacity-60">
                  Chapter {currentChapter.order < 10 ? `0${currentChapter.order}` : currentChapter.order}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                  {currentChapter.title}
                </h2>
                {currentChapter.subtitle && (
                  <p className="text-xs sm:text-sm italic opacity-75 font-reading">
                    {currentChapter.subtitle}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 text-[11px] opacity-60 pt-1">
                  <span>{currentChapter.readMinutes} min read</span>
                </div>
              </div>

              {/* Chapter Narrative Text */}
              <div
                className={`prose max-w-none ${fontFamilies[readerSettings.fontFamily]} ${
                  fontSizes[readerSettings.fontSize]
                } space-y-6 pt-4 text-justify sm:text-left`}
              >
                {currentChapter.content.split('\n\n').map((paragraph, pIdx) => {
                  const isFirst = pIdx === 0;
                  return (
                    <p
                      key={pIdx}
                      className={`leading-relaxed whitespace-pre-line ${
                        isFirst ? 'first-letter:font-display first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none' : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Bottom Chapter Navigation */}
              <div className="pt-12 pb-16 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4 select-none">
                <button
                  onClick={handlePrevChapter}
                  disabled={currentChapterIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-black/20 dark:border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Chapter</span>
                </button>

                <span className="text-xs font-mono opacity-60">
                  {currentChapterIndex + 1} / {story.chapters.length}
                </span>

                <button
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex === story.chapters.length - 1}
                  className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          )}
        </div>
      </main>

      {/* Reader Settings Modal / Flyout */}
      {showSettings && (
        <div className="fixed top-16 right-4 z-50 w-80 p-5 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Reader Appearance
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Palette */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
              Reading Canvas Theme
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['paper', 'sepia', 'parchment', 'night', 'oled'] as ReaderTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setReaderSettings({ ...readerSettings, theme: thm })}
                  className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                    readerSettings.theme === thm ? 'ring-2 ring-amber-600 scale-105' : ''
                  } ${
                    thm === 'paper'
                      ? 'bg-[#faf9f6] text-zinc-800 border-zinc-300'
                      : thm === 'sepia'
                      ? 'bg-[#f4ecd8] text-[#3e2723] border-[#d7ccc8]'
                      : thm === 'parchment'
                      ? 'bg-[#efe6d5] text-[#2b251f] border-[#d7cbbe]'
                      : thm === 'night'
                      ? 'bg-[#18181b] text-zinc-200 border-zinc-700'
                      : 'bg-black text-zinc-300 border-zinc-800'
                  }`}
                  title={thm}
                >
                  <span className="text-[10px] font-bold uppercase">{thm.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
              Typography Style
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['serif', 'sans', 'mono'] as ReaderFontFamily[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setReaderSettings({ ...readerSettings, fontFamily: f })}
                  className={`py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    readerSettings.fontFamily === f
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-600 text-amber-800 dark:text-amber-300'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
              Font Scale
            </label>
            <div className="grid grid-cols-5 gap-1">
              {(['sm', 'base', 'lg', 'xl', '2xl'] as ReaderFontSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setReaderSettings({ ...readerSettings, fontSize: s })}
                  className={`py-1 rounded-lg border text-xs font-bold uppercase transition-all ${
                    readerSettings.fontSize === s
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowDrawer(false)}
          />
          <div className="relative w-80 max-w-[80vw] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                  Table of Contents
                </span>
                <h3 className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {story.title}
                </h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {story.chapters.map((ch, idx) => {
                const isCurrent = idx === currentChapterIndex;
                return (
                  <button
                    key={ch.id || idx}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setShowDrawer(false);
                      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-bold'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="truncate">{ch.title}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                      {ch.readMinutes}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bookmark Note Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Bookmark Chapter {currentChapter?.order}
            </h3>
            <textarea
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              placeholder="Add a reader note or reflection (optional)..."
              rows={3}
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-600/50"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBookmarkModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBookmark}
                className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Bookmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
