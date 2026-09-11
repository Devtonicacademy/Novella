import React, { useState, useEffect, useCallback } from 'react';
import { Story } from './types';
import { api } from './services/api';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopNavbar } from './components/TopNavbar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StoryReader } from './components/StoryReader';
import { UnlockModal } from './components/UnlockModal';
import { StoryDetailModal } from './components/StoryDetailModal';
import { AuthModal } from './components/AuthModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AlertCircle, ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, isAdmin, googleSignIn } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState<boolean>(true);
  const [storyError, setStoryError] = useState<string | null>(null);

  // Active Modals & Readers
  const [readingStoryId, setReadingStoryId] = useState<string | null>(null);
  const [readingChapterId, setReadingChapterId] = useState<string | undefined>(undefined);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [unlockingStory, setUnlockingStory] = useState<Story | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'admin' | 'forgot'>('signin');

  // Load story library
  const fetchStories = useCallback(async () => {
    setLoadingStories(true);
    setStoryError(null);
    try {
      const data = await api.getStories();
      setStories(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load stories';
      setStoryError(message);
    } finally {
      setLoadingStories(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Handlers
  const handleOpenAuth = (mode: 'signin' | 'signup' | 'admin' | 'forgot' = 'signin') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (tab: string) => {
    if (tab === 'admin' && !isAdmin) {
      handleOpenAuth('admin');
      return;
    }
    setCurrentTab(tab);
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200 antialiased selection:bg-amber-600/30">
      {/* Top Bar (Wordmark, Nav Links, Actions) */}
      <TopNavbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'signin')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8">
        {loadingStories && stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-display text-base font-semibold text-zinc-700 dark:text-zinc-300">
              Loading the Library of Stories...
            </p>
          </div>
        ) : storyError ? (
          <div className="max-w-md mx-auto my-12 p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="font-display text-base font-bold text-red-900 dark:text-red-200">
              Could Not Load Library
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300">{storyError}</p>
            <button
              onClick={fetchStories}
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
                onSelectStory={(story) => setSelectedStory(story)}
                onReadStory={(story) => handleReadStory(story)}
                onUnlockStory={(story) => handleUnlockStory(story)}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'explore' && (
              <ExploreView
                stories={stories}
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

            {currentTab === 'admin' && (
              isAdmin ? (
                <AdminDashboard
                  stories={stories}
                  onRefreshStories={fetchStories}
                  onPreviewStory={(story) => setSelectedStory(story)}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
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
            <span className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Novella
            </span>
            <span>·</span>
            <span>First 2 Books Free for Every Reader</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Secured by Paystack Payments</span>
            <span>·</span>
            <span>Role-Based Secure Architecture</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={handleNavigate}
      />

      {/* Story Detail Preview Modal */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          isOpen={Boolean(selectedStory)}
          onClose={() => setSelectedStory(null)}
          onReadStory={(story) => handleReadStory(story)}
          onUnlockStory={(story) => handleUnlockStory(story)}
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

      {/* Story Reader Screen */}
      {readingStoryId && (
        <StoryReader
          storyId={readingStoryId}
          initialChapterId={readingChapterId}
          onClose={() => {
            setReadingStoryId(null);
            setReadingChapterId(undefined);
          }}
          onUnlockStory={(story) => handleUnlockStory(story)}
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
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

