import React, { useState, useEffect, useCallback } from 'react';
import { Story, Author, CategoryInfo, AppNotification } from './types';
import { api } from './services/api';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopNavbar } from './components/TopNavbar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthorStudioView } from './components/AuthorStudioView';
import { StoryReader } from './components/StoryReader';
import { UnlockModal } from './components/UnlockModal';
import { StoryDetailModal } from './components/StoryDetailModal';
import { AuthModal } from './components/AuthModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AIStoryGeneratorModal } from './components/AIStoryGeneratorModal';
import { AdvancedSearchModal } from './components/AdvancedSearchModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { OfflineLibraryModal } from './components/OfflineLibraryModal';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { ActivityFeedModal } from './components/ActivityFeedModal';
import { ReaderProfileModal } from './components/ReaderProfileModal';
import { AIWritingSuiteModal } from './components/AIWritingSuiteModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AlertCircle, ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, isAdmin, googleSignIn } = useAuth();

  // Navigation & Data State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [stories, setStories] = useState<Story[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingStories, setLoadingStories] = useState<boolean>(true);
  const [storyError, setStoryError] = useState<string | null>(null);

  // Active Reader & Overlays
  const [readingStoryId, setReadingStoryId] = useState<string | null>(null);
  const [readingChapterId, setReadingChapterId] = useState<string | undefined>(undefined);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [unlockingStory, setUnlockingStory] = useState<Story | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  // Modals & Panels
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'admin' | 'forgot'>('signin');
  const [isAIStudioOpen, setIsAIStudioOpen] = useState<boolean>(false);
  const [isAIWritingSuiteOpen, setIsAIWritingSuiteOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState<boolean>(false);
  const [isReaderProfileOpen, setIsReaderProfileOpen] = useState<boolean>(false);

  // Load app data
  const fetchData = useCallback(async () => {
    setLoadingStories(true);
    setStoryError(null);
    try {
      const [storyList, authorList, catList, notifList] = await Promise.all([
        api.getStories(),
        api.getAuthors(),
        api.getCategories(),
        api.getNotifications(),
      ]);
      setStories(storyList);
      setAuthors(authorList);
      setCategories(catList);
      setNotifications(notifList);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load stories';
      setStoryError(message);
    } finally {
      setLoadingStories(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handlers
  const handleOpenAuth = (mode: 'signin' | 'signup' | 'admin' | 'forgot' = 'signin') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (tab: string, category?: string) => {
    if (tab === 'admin' && !isAdmin) {
      handleOpenAuth('admin');
      return;
    }
    if (category) {
      setSelectedCategoryFilter(category);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadStory = (story: Story, chapterId?: string) => {
    setSelectedStory(null);
    setReadingChapterId(chapterId);
    setReadingStoryId(story.id);
  };

  const handleUnlockStory = (story: Story) => {
    setSelectedStory(null);
    setUnlockingStory(story);
  };

  const handleStoryUnlocked = (story: Story) => {
    setUnlockingStory(null);
    handleReadStory(story);
  };

  const handleAuthorClick = (authorName: string) => {
    const found = authors.find((a) => a.name.toLowerCase() === authorName.toLowerCase());
    if (found) {
      setSelectedAuthor(found);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200 antialiased selection:bg-amber-600/30">
      {/* Top Navbar */}
      <TopNavbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'signin')}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAIStudio={() => setIsAIStudioOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onOpenActivityFeed={() => setIsActivityFeedOpen(true)}
        onOpenProfileModal={() => setIsReaderProfileOpen(true)}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8">
        {loadingStories && stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-serif text-base font-semibold text-zinc-700 dark:text-zinc-300">
              Loading the Library of Stories...
            </p>
          </div>
        ) : storyError ? (
          <div className="max-w-md mx-auto my-12 p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="font-serif text-base font-bold text-red-900 dark:text-red-200">
              Could Not Load Library
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300">{storyError}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {currentTab === 'welcome' && (
              <WelcomeScreen
                onSignIn={() => handleOpenAuth('signin')}
                onSignUp={() => handleOpenAuth('signup')}
                onAdminSignIn={() => handleOpenAuth('admin')}
                onGoogleSignIn={() => googleSignIn()}
                onExploreAsGuest={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'home' && (
              <HomeView
                stories={stories}
                authors={authors}
                categories={categories}
                onSelectStory={(story) => setSelectedStory(story)}
                onReadStory={(story) => handleReadStory(story)}
                onUnlockStory={(story) => handleUnlockStory(story)}
                onNavigate={handleNavigate}
                onOpenAIStudio={() => setIsAIStudioOpen(true)}
                onSelectAuthor={(author) => setSelectedAuthor(author)}
              />
            )}

            {currentTab === 'explore' && (
              <ExploreView
                stories={stories}
                initialCategory={selectedCategoryFilter}
                onSelectStory={(story) => setSelectedStory(story)}
                onReadStory={(story) => handleReadStory(story)}
                onUnlockStory={(story) => handleUnlockStory(story)}
              />
            )}

            {(currentTab === 'library' || currentTab === 'bookmarks' || currentTab === 'profile') && (
              <UserDashboard
                stories={stories}
                onReadStory={(story, chId) => handleReadStory(story, chId)}
                onSelectStory={(story) => setSelectedStory(story)}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'author-studio' && (
              <AuthorStudioView
                stories={stories}
                onSelectStory={(story) => setSelectedStory(story)}
                onOpenAIStudio={() => setIsAIStudioOpen(true)}
                onRefreshStories={fetchData}
              />
            )}

            {currentTab === 'admin' && (
              isAdmin ? (
                <AdminDashboard
                  stories={stories}
                  onRefreshStories={fetchData}
                  onPreviewStory={(story) => setSelectedStory(story)}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h2 className="font-serif font-bold text-xl text-zinc-900 dark:text-zinc-100">
                    Administrator Access Required
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    The Novella Management Studio is restricted to authorized platform administrators. Please sign in with staff credentials.
                  </p>
                  <button
                    onClick={() => handleOpenAuth('admin')}
                    className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                  >
                    Open Admin Sign In
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500 dark:text-zinc-400 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Novella
            </span>
            <span>·</span>
            <span>First 2 Books Guaranteed Free For All Readers</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>AI Story Generation Engine</span>
            <span>·</span>
            <span>Read-Aloud Narration</span>
            <span>·</span>
            <span>Paystack Secure Payments</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAIStudio={() => setIsAIStudioOpen(true)}
      />

      {/* Story Detail Preview Modal */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          isOpen={Boolean(selectedStory)}
          onClose={() => setSelectedStory(null)}
          onReadStory={(story) => handleReadStory(story)}
          onUnlockStory={(story) => handleUnlockStory(story)}
          onStoryUpdated={(updatedStory) => {
            setSelectedStory(updatedStory);
            setStories((prev) => prev.map((s) => (s.id === updatedStory.id ? updatedStory : s)));
          }}
        />
      )}

      {/* Locked Story Unlock & Paystack Modal */}
      {unlockingStory && (
        <UnlockModal
          story={unlockingStory}
          isOpen={Boolean(unlockingStory)}
          onClose={() => setUnlockingStory(null)}
          onUnlocked={handleStoryUnlocked}
          onOpenAuth={() => handleOpenAuth('signin')}
        />
      )}

      {/* Full Story Reader Screen */}
      {readingStoryId && (
        <StoryReader
          storyId={readingStoryId}
          initialChapterId={readingChapterId}
          onClose={() => {
            setReadingStoryId(null);
            setReadingChapterId(undefined);
          }}
          onUnlockStory={(story) => handleUnlockStory(story)}
          onAuthorClick={handleAuthorClick}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authInitialMode}
        />
      )}

      {/* AI Story Generator Modal */}
      {isAIStudioOpen && (
        <AIStoryGeneratorModal
          isOpen={isAIStudioOpen}
          onClose={() => setIsAIStudioOpen(false)}
          onStoryCreated={(newStory: Story) => {
            fetchData();
            handleReadStory(newStory);
          }}
        />
      )}

      {/* Advanced Search Modal */}
      {isSearchModalOpen && (
        <AdvancedSearchModal
          isOpen={isSearchModalOpen}
          stories={stories}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectStory={(story: Story) => {
            setIsSearchModalOpen(false);
            setSelectedStory(story);
          }}
        />
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <NotificationCenterModal
          isOpen={isNotificationsOpen}
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onRefreshNotifications={fetchData}
          onSelectStoryById={(storyId: string) => {
            setIsNotificationsOpen(false);
            const f = stories.find((s) => s.id === storyId);
            if (f) handleReadStory(f);
          }}
        />
      )}

      {/* Offline Library Modal */}
      {isOfflineModalOpen && (
        <OfflineLibraryModal
          isOpen={isOfflineModalOpen}
          onClose={() => setIsOfflineModalOpen(false)}
          onSelectStory={(story: Story) => {
            setIsOfflineModalOpen(false);
            handleReadStory(story);
          }}
        />
      )}

      {/* Author Profile Modal */}
      {selectedAuthor && (
        <AuthorProfileModal
          isOpen={Boolean(selectedAuthor)}
          author={selectedAuthor}
          stories={stories}
          onClose={() => setSelectedAuthor(null)}
          onSelectStory={(story: Story) => {
            setSelectedAuthor(null);
            handleReadStory(story);
          }}
        />
      )}

      {/* Activity Feed Modal */}
      {isActivityFeedOpen && (
        <ActivityFeedModal
          isOpen={isActivityFeedOpen}
          onClose={() => setIsActivityFeedOpen(false)}
          onOpenStory={(story) => {
            setIsActivityFeedOpen(false);
            setSelectedStory(story);
          }}
          allStories={stories}
        />
      )}

      {/* Reader Profile, Streaks & Goals Modal */}
      {isReaderProfileOpen && (
        <ReaderProfileModal
          isOpen={isReaderProfileOpen}
          onClose={() => setIsReaderProfileOpen(false)}
          onOpenStory={(story) => {
            setIsReaderProfileOpen(false);
            setSelectedStory(story);
          }}
          allStories={stories}
        />
      )}

      {/* AI Writing Suite Modal for Authors */}
      {isAIWritingSuiteOpen && (
        <AIWritingSuiteModal
          isOpen={isAIWritingSuiteOpen}
          onClose={() => setIsAIWritingSuiteOpen(false)}
          onApplyTitle={(_title) => {
            setIsAIWritingSuiteOpen(false);
            handleNavigate('author-studio');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
