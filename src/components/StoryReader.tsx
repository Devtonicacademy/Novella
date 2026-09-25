import React, { useState, useEffect, useRef } from 'react';
import { 
  Story, 
  Chapter, 
  ReaderSettings, 
  ReaderFontSize, 
  ReaderFontFamily, 
  ReaderTheme,
  StoryChoice,
  Comment,
  Review
} from '../types';
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
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Star,
  Download,
  Check,
  Flag,
  GitBranch,
  Send,
  Heart,
  CornerDownRight,
  WifiOff,
  MoreVertical
} from 'lucide-react';
import { ReportContentModal } from './ReportContentModal';
import { StarRatingDisplay } from './StarRatingDisplay';
import { RateStoryModal } from './RateStoryModal';
import { ShareStoryModal } from './ShareStoryModal';
import { CollectionsModal } from './CollectionsModal';

interface StoryReaderProps {
  storyId: string;
  initialChapterId?: string;
  onClose: () => void;
  onUnlockStory: (story: Story) => void;
  onAuthorClick?: (authorName: string) => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  storyId,
  initialChapterId,
  onClose,
  onUnlockStory,
  onAuthorClick,
}) => {
  const { user, isStoryUnlocked, saveReadingProgress, trackReadingActivity, addBookmark, removeBookmark } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  
  // Feature Modals & Drawers
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [isSavedOffline, setIsSavedOffline] = useState(false);

  // Discussion / Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Read Aloud / TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [showTTSBar, setShowTTSBar] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Fetch story data
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getStoryForReading(storyId);
        if (isMounted) {
          setStory(data);
          setIsSavedOffline(api.isStoryOffline(storyId));

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
      stopSpeech();
    };
  }, [storyId, initialChapterId]);

  // Load comments & reviews
  useEffect(() => {
    if (story) {
      loadComments();
      loadReviews();
    }
  }, [story, currentChapterIndex]);

  const loadComments = async () => {
    if (!story) return;
    try {
      const currentChapter = story.chapters[currentChapterIndex];
      const data = await api.getComments(story.id, currentChapter?.id);
      setComments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadReviews = async () => {
    if (!story) return;
    try {
      const data = await api.getReviews(story.id);
      setReviews(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Save display settings to local storage
  useEffect(() => {
    localStorage.setItem('novella_reader_settings', JSON.stringify(readerSettings));
  }, [readerSettings]);

  // Read Aloud (TTS) Engine
  const startSpeech = () => {
    if (!window.speechSynthesis || !currentChapter) return;
    window.speechSynthesis.cancel();

    const textToSpeak = `${currentChapter.title}. ${currentChapter.subtitle || ''}. ${currentChapter.content}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setShowTTSBar(true);
  };

  const pauseSpeech = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeech = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      startSpeech();
    }
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    if (isSpeaking) {
      stopSpeech();
      setTimeout(startSpeech, 100);
    }
  };

  // Scroll tracker & Progress sync
  const handleScroll = () => {
    if (!contentRef.current || !story) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight || 1)) * 100));
    setScrollProgress(progress);

    const currentChapter = story.chapters[currentChapterIndex];
    if (currentChapter) {
      saveReadingProgress(story.id, currentChapter.id, currentChapter.order, progress);
    }
  };

  const currentChapter: Chapter | undefined = story?.chapters?.[currentChapterIndex];

  // Font classes
  const fontFamilies: Record<ReaderFontFamily, string> = {
    serif: 'font-reading',
    sans: 'font-sans-ui',
    mono: 'font-mono-code',
    dyslexic: 'font-reading tracking-wide',
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

  const maxWidthClasses: Record<string, string> = {
    narrow: 'max-w-xl',
    normal: 'max-w-2xl',
    wide: 'max-w-4xl',
    full: 'max-w-full',
  };

  const handleNextChapter = () => {
    if (!story) return;
    stopSpeech();
    if (currentChapterIndex < story.chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (!story) return;
    stopSpeech();
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectChoice = (choice: StoryChoice) => {
    if (!story) return;
    stopSpeech();
    const targetIdx = story.chapters.findIndex((c) => c.id === choice.nextChapterId);
    if (targetIdx !== -1) {
      setCurrentChapterIndex(targetIdx);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNextChapter();
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

  const handleToggleOffline = () => {
    if (!story) return;
    if (isSavedOffline) {
      api.removeOfflineStory(story.id);
      setIsSavedOffline(false);
    } else {
      api.saveOfflineStory(story);
      setIsSavedOffline(true);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.addComment({
        storyId: story.id,
        chapterId: currentChapter?.id,
        content: newCommentText.trim(),
      });
      setNewCommentText('');
      await loadComments();
    } catch (e: any) {
      alert(e.message || 'Could not post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    try {
      await api.addReply(commentId, replyText.trim());
      setReplyingToCommentId(null);
      setReplyText('');
      await loadComments();
    } catch (e: any) {
      alert(e.message || 'Could not reply');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await api.likeComment(commentId);
      await loadComments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !reviewContent.trim()) return;

    setSubmittingReview(true);
    try {
      await api.addReview({
        storyId: story.id,
        rating: userRating,
        title: reviewTitle.trim() || 'Reader Review',
        content: reviewContent.trim(),
      });
      setShowReviewModal(false);
      setReviewContent('');
      setReviewTitle('');
      await loadReviews();
    } catch (e: any) {
      alert(e.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
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
            {error || 'This complete manuscript is locked. Unlock it to read all chapters.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Back to Catalog
            </button>
            {story && (
              <button
                onClick={() => {
                  onClose();
                  onUnlockStory(story);
                }}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-600/20"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Book (₦{story.priceNGN.toLocaleString()})</span>
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
      <header className="h-14 border-b border-black/10 dark:border-white/10 px-3 sm:px-4 flex items-center justify-between shrink-0 select-none bg-inherit/90 backdrop-blur-xs pt-safe">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 mr-2">
          <button
            id="reader-exit-btn"
            onClick={onClose}
            className="p-1.5 sm:p-2 -ml-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Exit Reader"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xs sm:text-sm font-bold truncate">
              {story.title}
            </h1>
            <p className="text-[10px] opacity-70 truncate">
              Ch. {currentChapterIndex + 1}: {currentChapter?.title}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Read Aloud Trigger */}
          <button
            id="read-aloud-toggle-btn"
            onClick={() => {
              if (isSpeaking) {
                stopSpeech();
                setShowTTSBar(false);
              } else {
                startSpeech();
              }
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
              isSpeaking ? 'bg-amber-500/20 text-amber-600 animate-pulse' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Read Aloud"
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Desktop-only Direct Buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {/* Table of Contents */}
            <button
              id="reader-toc-btn"
              onClick={() => setShowDrawer(true)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Table of Contents"
            >
              <List className="w-5 h-5" />
            </button>

            {/* Discussion / Comments */}
            <button
              id="reader-comments-btn"
              onClick={() => setShowCommentsDrawer(true)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative cursor-pointer"
              title="Reader Discussion"
            >
              <MessageSquare className="w-5 h-5" />
              {comments.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* Share Story/Chapter */}
            <button
              id="reader-share-btn"
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Share Chapter"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Save to Collection */}
            <button
              id="reader-collection-btn"
              onClick={() => setShowCollectionsModal(true)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Save to Collection"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
            </button>

            {/* Offline Save Toggle */}
            <button
              id="reader-offline-toggle-btn"
              onClick={handleToggleOffline}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSavedOffline ? 'text-emerald-600' : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70'
              }`}
              title={isSavedOffline ? 'Saved Offline' : 'Download for Offline Reading'}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Bookmark Toggle (Mobile & Desktop) */}
          <button
            id="reader-bookmark-btn"
            onClick={handleBookmarkToggle}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isCurrentChapterBookmarked ? 'Bookmarked' : 'Add Bookmark'}
          >
            {isCurrentChapterBookmarked ? (
              <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 fill-amber-600" />
            ) : (
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Reader Display Settings */}
          <button
            id="reader-settings-btn"
            onClick={() => {
              setShowMobileMoreMenu(false);
              setShowSettings(!showSettings);
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
              showSettings ? 'bg-amber-500/20 text-amber-600' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Typography & Appearance"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Mobile More Options Button */}
          <button
            id="reader-mobile-more-btn"
            onClick={() => {
              setShowSettings(false);
              setShowMobileMoreMenu(!showMobileMoreMenu);
            }}
            className={`sm:hidden p-1.5 rounded-xl transition-colors relative cursor-pointer ${
              showMobileMoreMenu ? 'bg-amber-500/20 text-amber-600' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Reader Options"
          >
            <MoreVertical className="w-4 h-4" />
            {comments.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>
        </div>
      </header>

      {/* Floating Read Aloud (TTS) Control Bar */}
      {showTTSBar && (
        <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between gap-4 text-xs select-none animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Read Aloud</span>
            </div>

            <div className="flex items-center gap-1.5">
              {isSpeaking && !isPaused ? (
                <button
                  onClick={pauseSpeech}
                  className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                  title="Pause"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={resumeSpeech}
                  className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                  title="Play"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={stopSpeech}
                className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20"
                title="Stop"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] opacity-70">Speed:</span>
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  speechRate === rate
                    ? 'bg-amber-500 text-white'
                    : 'bg-black/5 dark:bg-white/5 opacity-80'
                }`}
              >
                {rate}x
              </button>
            ))}
            <button
              onClick={() => {
                stopSpeech();
                setShowTTSBar(false);
              }}
              className="ml-2 text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 py-6 sm:py-12 max-w-full overflow-x-hidden touch-scroll"
      >
        <div className={`mx-auto ${maxWidthClasses[readerSettings.maxWidth]}`}>
          {currentChapter && (
            <article className="space-y-6">
              {/* Chapter Header */}
              <div className="text-center pb-6 sm:pb-8 border-b border-black/10 dark:border-white/10 space-y-2">
                <span className="text-[11px] font-mono tracking-widest uppercase opacity-60">
                  Chapter {currentChapter.order < 10 ? `0${currentChapter.order}` : currentChapter.order}
                </span>
                <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold leading-tight break-words">
                  {currentChapter.title}
                </h2>
                {currentChapter.subtitle && (
                  <p className="text-xs sm:text-sm italic opacity-75 font-reading">
                    {currentChapter.subtitle}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 text-[11px] opacity-60 pt-1">
                  <span>{currentChapter.readMinutes} min read</span>
                  <span>•</span>
                  <span
                    onClick={() => onAuthorClick && onAuthorClick(story.author)}
                    className="hover:underline cursor-pointer font-medium"
                  >
                    by {story.author}
                  </span>
                </div>
              </div>

              {/* Chapter Narrative Text */}
              <div
                className={`prose max-w-none ${fontFamilies[readerSettings.fontFamily]} ${
                  fontSizes[readerSettings.fontSize]
                } space-y-5 sm:space-y-6 pt-4 text-left sm:text-justify leading-relaxed break-words`}
              >
                {currentChapter.content.split('\n\n').map((paragraph, pIdx) => {
                  const isFirst = pIdx === 0;
                  return (
                    <p
                      key={pIdx}
                      className={`leading-relaxed whitespace-pre-line break-words ${
                        isFirst ? 'first-letter:font-display first-letter:text-3xl sm:first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none' : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Interactive Story Choice Branches (If Any) */}
              {currentChapter.choices && currentChapter.choices.length > 0 && (
                <div className="my-10 p-6 rounded-3xl bg-amber-500/5 dark:bg-amber-500/10 border-2 border-amber-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <GitBranch className="w-5 h-5" />
                    <h3 className="font-serif font-bold text-base">
                      Your Path, Your Choice
                    </h3>
                  </div>
                  <p className="text-xs opacity-75">
                    Select your next action to shape the outcome of this narrative:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentChapter.choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleSelectChoice(choice)}
                        className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/30 hover:border-amber-500 hover:shadow-lg transition-all text-left space-y-1.5 group cursor-pointer"
                      >
                        {choice.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            {choice.badge}
                          </span>
                        )}
                        <div className="font-serif font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {choice.choiceText}
                        </div>
                        {choice.description && (
                          <div className="text-[11px] opacity-65 leading-tight">
                            {choice.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Completion / Interaction Footer: Ratings, Reviews, Discussion */}
              <div className="pt-8 pb-4 space-y-6 border-t border-black/10 dark:border-white/10">
                {/* Book Rating & Review Bar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <StarRatingDisplay
                    id="reader-story-rating"
                    rating={story.rating}
                    ratingsCount={story.ratingsCount}
                    reviewCount={story.reviewCount}
                    breakdown={story.ratingBreakdown}
                    variant="compact"
                    showCountText={true}
                    showReviewsText={true}
                    showRateButton={true}
                    onRateClick={() => setShowReviewModal(true)}
                  />
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      id="reader-open-discussions-btn"
                      onClick={() => setShowCommentsDrawer(true)}
                      className="px-3 py-1.5 rounded-lg border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{comments.length} Discussion{comments.length === 1 ? '' : 's'}</span>
                    </button>

                    <button
                      id="reader-report-story-btn"
                      onClick={() => setShowReportModal(true)}
                      className="text-red-500/80 hover:text-red-600 cursor-pointer text-xs font-medium flex items-center gap-1"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Chapter Navigation */}
              <div className="pt-6 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] sm:pb-16 flex items-center justify-between gap-3 select-none">
                <button
                  id="reader-prev-chapter-btn"
                  onClick={handlePrevChapter}
                  disabled={currentChapterIndex === 0}
                  className="py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl border border-black/20 dark:border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Previous Chapter</span>
                  <span className="sm:hidden">Prev Ch.</span>
                </button>

                <span className="text-xs font-mono opacity-60">
                  {currentChapterIndex + 1} / {story.chapters.length}
                </span>

                <button
                  id="reader-next-chapter-btn"
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex === story.chapters.length - 1}
                  className="py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed min-h-[44px]"
                >
                  <span className="hidden sm:inline">Next Chapter</span>
                  <span className="sm:hidden">Next Ch.</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </article>
          )}
        </div>
      </main>

      {/* Reader Settings Modal / Mobile Bottom Sheet */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:hidden"
            onClick={() => setShowSettings(false)}
          />
          <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:top-16 sm:right-4 sm:bottom-auto z-50 w-full sm:w-80 p-5 rounded-t-3xl sm:rounded-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-5 bg-white dark:bg-zinc-900 shadow-2xl border-t sm:border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 space-y-5 animate-fadeIn">
            {/* Mobile Sheet Drag Handle */}
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

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
                    className={`h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
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
                    className={`py-2 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      readerSettings.fontFamily === f
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-600 text-amber-800 dark:text-amber-300 font-bold'
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
                    className={`py-2 rounded-lg border text-xs font-bold uppercase transition-all cursor-pointer ${
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
        </>
      )}

      {/* Mobile Reader Quick Action Sheet */}
      {showMobileMoreMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:hidden"
            onClick={() => setShowMobileMoreMenu(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 w-full p-5 rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-white dark:bg-zinc-900 shadow-2xl border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 space-y-4 animate-fadeIn sm:hidden">
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto -mt-1 mb-2" />
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Reader Options
              </span>
              <button
                onClick={() => setShowMobileMoreMenu(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setShowMobileMoreMenu(false);
                  setShowDrawer(true);
                }}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5 font-semibold text-zinc-800 dark:text-zinc-200 active:scale-98"
              >
                <List className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">Chapters ({story.chapters.length})</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileMoreMenu(false);
                  setShowCommentsDrawer(true);
                }}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5 font-semibold text-zinc-800 dark:text-zinc-200 active:scale-98"
              >
                <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">Discussion ({comments.length})</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileMoreMenu(false);
                  setShowShareModal(true);
                }}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5 font-semibold text-zinc-800 dark:text-zinc-200 active:scale-98"
              >
                <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">Share Story</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileMoreMenu(false);
                  setShowCollectionsModal(true);
                }}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5 font-semibold text-zinc-800 dark:text-zinc-200 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Add Collection</span>
              </button>

              <button
                onClick={() => {
                  handleToggleOffline();
                  setShowMobileMoreMenu(false);
                }}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5 font-semibold text-zinc-800 dark:text-zinc-200 active:scale-98"
              >
                <Download className={`w-4 h-4 shrink-0 ${isSavedOffline ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <span className="truncate">{isSavedOffline ? 'Downloaded' : 'Save Offline'}</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileMoreMenu(false);
                  setShowReportModal(true);
                }}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5 font-semibold text-red-600 dark:text-red-400 active:scale-98"
              >
                <Flag className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate">Report Story</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Table of Contents Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowDrawer(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full z-10 shadow-2xl pt-safe pb-safe animate-fadeIn">
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
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 touch-scroll">
              {story.chapters.map((ch, idx) => {
                const isCurrent = idx === currentChapterIndex;
                return (
                  <button
                    key={ch.id || idx}
                    onClick={() => {
                      stopSpeech();
                      setCurrentChapterIndex(idx);
                      setShowDrawer(false);
                      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer min-h-[44px] ${
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

      {/* Discussion & Comments Drawer */}
      {showCommentsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowCommentsDrawer(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full z-10 shadow-2xl pt-safe pb-safe animate-fadeIn">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Reader Discussion ({comments.length})
                </h3>
              </div>
              <button
                onClick={() => setShowCommentsDrawer(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Share your thoughts on this chapter..."
                rows={2}
                className="w-full px-3 py-2 text-base sm:text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newCommentText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Post</span>
                </button>
              </div>
            </form>

            {/* Comment Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  No comments yet. Be the first to start the discussion!
                </div>
              ) : (
                comments.map((comm) => (
                  <div key={comm.id} className="space-y-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-700 text-white text-[10px] font-bold flex items-center justify-center">
                          {comm.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {comm.userName}
                        </span>
                        {comm.isAuthor && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                            AUTHOR
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif">
                      {comm.content}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                      <button
                        onClick={() => handleLikeComment(comm.id)}
                        className="flex items-center gap-1 hover:text-red-500 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{comm.likes || 0}</span>
                      </button>

                      <button
                        onClick={() => setReplyingToCommentId(replyingToCommentId === comm.id ? null : comm.id)}
                        className="hover:underline cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comm.replies && comm.replies.length > 0 && (
                      <div className="pl-4 space-y-2 pt-2 border-l-2 border-zinc-200 dark:border-zinc-800">
                        {comm.replies.map((rep) => (
                          <div key={rep.id} className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                              <CornerDownRight className="w-3 h-3 text-zinc-400" />
                              <span>{rep.userName}</span>
                              {rep.isAuthor && (
                                <span className="px-1 rounded text-[8px] bg-amber-500 text-white">AUTHOR</span>
                              )}
                            </div>
                            <p className="pl-4 text-zinc-600 dark:text-zinc-400 text-[11px]">
                              {rep.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingToCommentId === comm.id && (
                      <div className="pt-2 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                        />
                        <button
                          onClick={() => handlePostReply(comm.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgraded Review & Rating Modal */}
      {showReviewModal && story && (
        <RateStoryModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          story={story}
          onRatingSuccess={(updatedStory) => {
            setStory(updatedStory);
            loadReviews();
          }}
        />
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

      {/* Report Modal */}
      {showReportModal && story && (
        <ReportContentModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="story"
          targetId={story.id}
          targetTitle={story.title}
        />
      )}

      {/* Share Modal */}
      {showShareModal && story && (
        <ShareStoryModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          story={story}
          chapter={currentChapter}
        />
      )}

      {/* Collections Modal */}
      {showCollectionsModal && story && (
        <CollectionsModal
          isOpen={showCollectionsModal}
          onClose={() => setShowCollectionsModal(false)}
          story={story}
        />
      )}
    </div>
  );
};
