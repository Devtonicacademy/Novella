import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, UserBookmark, Story, AdminRole, ReadingStreak, ReadingGoals, StoryCollection, ReaderAchievement, RecentlyViewedItem } from '../types';
import { api, setStoredAuthToken } from '../services/api';
import { firebaseSignIn, firebaseSignUp, firebaseSignOutUser, firebaseSendPasswordReset } from '../services/firebase';

const DEFAULT_ACHIEVEMENTS: ReaderAchievement[] = [
  {
    id: 'ach-1',
    title: 'First Voyage',
    description: 'Began your reading journey on Novella',
    icon: 'Compass',
    category: 'reading',
    targetCount: 1,
    currentCount: 1,
    unlocked: true,
    unlockedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'ach-2',
    title: 'Avid Bookworm',
    description: 'Read 5 complete stories or chapters',
    icon: 'BookOpen',
    category: 'reading',
    targetCount: 5,
    currentCount: 3,
    unlocked: false,
  },
  {
    id: 'ach-3',
    title: 'Habit Builder',
    description: 'Maintain a 3-day consecutive reading streak',
    icon: 'Flame',
    category: 'streak',
    targetCount: 3,
    currentCount: 3,
    unlocked: true,
    unlockedAt: '2026-03-01T12:00:00Z',
  },
  {
    id: 'ach-4',
    title: 'Literary Scholar',
    description: 'Maintain a 7-day reading streak',
    icon: 'Award',
    category: 'streak',
    targetCount: 7,
    currentCount: 4,
    unlocked: false,
  },
  {
    id: 'ach-5',
    title: 'Culture Explorer',
    description: 'Explore stories across 3 different genres',
    icon: 'Sparkles',
    category: 'explorer',
    targetCount: 3,
    currentCount: 2,
    unlocked: false,
  },
  {
    id: 'ach-6',
    title: 'Community Voice',
    description: 'Post a story rating and review',
    icon: 'Star',
    category: 'social',
    targetCount: 1,
    currentCount: 1,
    unlocked: true,
    unlockedAt: '2026-02-20T10:00:00Z',
  },
];

const DEFAULT_COLLECTIONS: StoryCollection[] = [
  {
    id: 'col-fav',
    name: 'Favorites',
    description: 'Stories closest to my heart',
    storyIds: ['story-1', 'story-2'],
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'col-later',
    name: 'Read Later',
    description: 'Queued manuscripts to read next weekend',
    storyIds: ['story-3', 'story-4'],
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'col-romance',
    name: 'Romance & Drama',
    description: 'Emotional sagas and passionate narratives',
    storyIds: ['story-3'],
    isDefault: false,
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'col-best',
    name: 'My Best Stories',
    description: 'Top-tier literary masterpieces',
    storyIds: ['story-1'],
    isDefault: false,
    createdAt: '2026-02-15T00:00:00Z',
  },
];

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminRole: AdminRole;
  openAuthModal?: (mode?: 'signin' | 'signup' | 'admin' | 'forgot') => void;
  refreshUser: () => Promise<void>;
  isStoryUnlocked: (story: Story) => boolean;
  unlockStory: (storyId: string) => Promise<void>;
  saveReadingProgress: (storyId: string, chapterId: string, chapterOrder: number, percentage: number) => Promise<void>;
  trackReadingActivity: (minutes?: number, chaptersCount?: number, storyId?: string) => void;
  updateReadingGoals: (goals: Partial<ReadingGoals>) => void;
  createCollection: (name: string, description?: string) => void;
  deleteCollection: (collectionId: string) => void;
  addStoryToCollection: (collectionId: string, storyId: string) => void;
  removeStoryFromCollection: (collectionId: string, storyId: string) => void;
  toggleLikeStory: (storyId: string) => Promise<void>;
  isStoryLiked: (storyId: string) => boolean;
  toggleFollowAuthor: (authorId: string) => Promise<void>;
  isAuthorFollowed: (authorId: string) => boolean;
  recordRecentlyViewed: (storyId: string) => void;
  addBookmark: (bookmark: Omit<UserBookmark, 'id' | 'createdAt'>) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  signInWithEmail: (email: string, password?: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, password: string, fullName: string, confirmPassword?: string) => Promise<UserProfile>;
  adminSignIn: (email: string, password: string) => Promise<UserProfile>;
  googleSignIn: (email?: string, name?: string, avatar?: string) => Promise<UserProfile>;
  requestPasswordReset: (email: string) => Promise<{ resetToken?: string; message: string }>;
  resetPassword: (email: string, resetToken: string, newPassword: string, confirmPassword?: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; fullName?: string; avatar?: string; bio?: string; currentPassword?: string; newPassword?: string }) => Promise<UserProfile>;
  switchRole: (role: AdminRole) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'novella_auth_token';
const USER_KEY = 'novella_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          collections: parsed.collections || DEFAULT_COLLECTIONS,
          achievements: parsed.achievements || DEFAULT_ACHIEVEMENTS,
          readingStreak: parsed.readingStreak || {
            currentStreak: 4,
            longestStreak: 12,
            lastActiveDate: new Date().toISOString().split('T')[0],
            streakHistory: [
              new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
              new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
              new Date(Date.now() - 86400000).toISOString().split('T')[0],
              new Date().toISOString().split('T')[0],
            ],
          },
          readingGoals: parsed.readingGoals || {
            storiesMonthlyTarget: 5,
            storiesReadThisMonth: 3,
            chaptersWeeklyTarget: 20,
            chaptersReadThisWeek: 14,
            minutesDailyTarget: 30,
            minutesReadToday: 22,
          },
          recentlyViewed: parsed.recentlyViewed || [
            { storyId: 'story-1', viewedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
            { storyId: 'story-2', viewedAt: new Date(Date.now() - 3600000 * 6).toISOString() },
            { storyId: 'story-3', viewedAt: new Date(Date.now() - 3600000 * 24).toISOString() },
          ],
          likedStoryIds: parsed.likedStoryIds || ['story-1', 'story-2'],
          followingAuthorIds: parsed.followingAuthorIds || ['auth-1', 'auth-2'],
        };
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync token to API client
  useEffect(() => {
    setStoredAuthToken(token);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // Validate session on app initialization
  const loadActiveSession = useCallback(async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      setStoredAuthToken(savedToken);
      const data = await api.getMe();
      if (data?.user) {
        setUser((prev) => ({
          ...data.user,
          collections: data.user.collections || prev?.collections || DEFAULT_COLLECTIONS,
          achievements: data.user.achievements || prev?.achievements || DEFAULT_ACHIEVEMENTS,
          readingStreak: data.user.readingStreak || prev?.readingStreak || {
            currentStreak: 4,
            longestStreak: 12,
            lastActiveDate: new Date().toISOString().split('T')[0],
            streakHistory: [new Date().toISOString().split('T')[0]],
          },
          readingGoals: data.user.readingGoals || prev?.readingGoals || {
            storiesMonthlyTarget: 5,
            storiesReadThisMonth: 3,
            chaptersWeeklyTarget: 20,
            chaptersReadThisWeek: 14,
            minutesDailyTarget: 30,
            minutesReadToday: 22,
          },
          recentlyViewed: data.user.recentlyViewed || prev?.recentlyViewed || [],
          likedStoryIds: data.user.likedStoryIds || prev?.likedStoryIds || ['story-1', 'story-2'],
          followingAuthorIds: data.user.followingAuthorIds || prev?.followingAuthorIds || ['auth-1'],
        }));
      }
      setToken(savedToken);
    } catch {
      // Keep local profile if available or fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser((prev) => ({
          ...data.user,
          collections: data.user.collections || prev?.collections || DEFAULT_COLLECTIONS,
          achievements: data.user.achievements || prev?.achievements || DEFAULT_ACHIEVEMENTS,
          readingStreak: data.user.readingStreak || prev?.readingStreak,
          readingGoals: data.user.readingGoals || prev?.readingGoals,
          recentlyViewed: data.user.recentlyViewed || prev?.recentlyViewed || [],
        }));
      }
    } catch {
      // Ignore
    }
  };

  const isAdminRole = (role?: AdminRole): boolean => {
    if (!role) return false;
    return ['super_admin', 'content_admin', 'support_admin', 'finance_admin'].includes(role);
  };

  const isAdmin = Boolean(user && isAdminRole(user.role));
  const adminRole: AdminRole = (user?.role && isAdminRole(user.role)) ? user.role : 'user';

  // Rule: Books #1 and #2 (story.order <= 2 or story.isFree) are ALWAYS unlocked for everyone
  const isStoryUnlocked = (story: Story): boolean => {
    if (story.isFree || story.order <= 2) return true;
    if (!user) return false;
    if (isAdmin) return true;
    return user.unlockedStoryIds?.includes(story.id) ?? false;
  };

  const switchRole = (role: AdminRole) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, role };
    });
  };

  // Reading streak & activity tracker
  const trackReadingActivity = (minutes = 2, chaptersCount = 1, storyId?: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const today = new Date().toISOString().split('T')[0];
      const streak = prev.readingStreak || {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        streakHistory: [today],
      };

      let newCurrent = streak.currentStreak;
      let newLongest = streak.longestStreak;
      const history = [...(streak.streakHistory || [])];

      if (streak.lastActiveDate !== today) {
        const lastDate = new Date(streak.lastActiveDate);
        const currentDate = new Date(today);
        const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          newCurrent += 1;
        } else if (diffDays > 1) {
          newCurrent = 1;
        }

        if (newCurrent > newLongest) {
          newLongest = newCurrent;
        }

        if (!history.includes(today)) {
          history.push(today);
        }
      }

      // Update goals
      const currentGoals = prev.readingGoals || {
        storiesMonthlyTarget: 5,
        storiesReadThisMonth: 1,
        chaptersWeeklyTarget: 20,
        chaptersReadThisWeek: 5,
        minutesDailyTarget: 30,
        minutesReadToday: 10,
      };

      const updatedGoals: ReadingGoals = {
        ...currentGoals,
        minutesReadToday: currentGoals.minutesReadToday + minutes,
        chaptersReadThisWeek: currentGoals.chaptersReadThisWeek + chaptersCount,
      };

      return {
        ...prev,
        totalReadingMinutes: (prev.totalReadingMinutes || 0) + minutes,
        readingStreak: {
          currentStreak: newCurrent,
          longestStreak: newLongest,
          lastActiveDate: today,
          streakHistory: history,
        },
        readingGoals: updatedGoals,
      };
    });
  };

  const updateReadingGoals = (goals: Partial<ReadingGoals>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        readingGoals: {
          ...(prev.readingGoals || {
            storiesMonthlyTarget: 5,
            storiesReadThisMonth: 0,
            chaptersWeeklyTarget: 20,
            chaptersReadThisWeek: 0,
            minutesDailyTarget: 30,
            minutesReadToday: 0,
          }),
          ...goals,
        },
      };
    });
  };

  // Collections handlers
  const createCollection = (name: string, description?: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newCol: StoryCollection = {
        id: `col-${Date.now()}`,
        name,
        description: description || '',
        storyIds: [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        collections: [...(prev.collections || DEFAULT_COLLECTIONS), newCol],
      };
    });
  };

  const deleteCollection = (collectionId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        collections: (prev.collections || []).filter((c) => c.id !== collectionId),
      };
    });
  };

  const addStoryToCollection = (collectionId: string, storyId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        collections: (prev.collections || []).map((c) => {
          if (c.id === collectionId) {
            if (c.storyIds.includes(storyId)) return c;
            return { ...c, storyIds: [...c.storyIds, storyId], updatedAt: new Date().toISOString() };
          }
          return c;
        }),
      };
    });
  };

  const removeStoryFromCollection = (collectionId: string, storyId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        collections: (prev.collections || []).map((c) => {
          if (c.id === collectionId) {
            return { ...c, storyIds: c.storyIds.filter((id) => id !== storyId), updatedAt: new Date().toISOString() };
          }
          return c;
        }),
      };
    });
  };

  const toggleLikeStory = async (storyId: string) => {
    try {
      await api.toggleStoryLike(storyId);
    } catch {
      // Offline toggle
    }
    setUser((prev) => {
      if (!prev) return prev;
      const liked = prev.likedStoryIds || [];
      const isLiked = liked.includes(storyId);
      return {
        ...prev,
        likedStoryIds: isLiked ? liked.filter((id) => id !== storyId) : [...liked, storyId],
      };
    });
  };

  const toggleFollowAuthor = async (authorId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const following = prev.followingAuthorIds || [];
      const isFollowing = following.includes(authorId);
      return {
        ...prev,
        followingAuthorIds: isFollowing ? following.filter((id) => id !== authorId) : [...following, authorId],
      };
    });
  };

  const isStoryLiked = (storyId: string): boolean => {
    if (!user) return false;
    return Boolean(user.likedStoryIds?.includes(storyId));
  };

  const isAuthorFollowed = (authorId: string): boolean => {
    if (!user) return false;
    return Boolean(user.followingAuthorIds?.includes(authorId));
  };

  const recordRecentlyViewed = (storyId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const current = (prev.recentlyViewed || []).filter((item) => item.storyId !== storyId);
      const updated: RecentlyViewedItem[] = [
        { storyId, viewedAt: new Date().toISOString() },
        ...current.slice(0, 11),
      ];
      return {
        ...prev,
        recentlyViewed: updated,
      };
    });
  };

  const signInWithEmail = async (email: string, password: string = 'NovellaReader2026!'): Promise<UserProfile> => {
    try {
      await firebaseSignIn(email, password);
    } catch (fbErr) {
      console.warn('Firebase Auth signin notice (proceeding with session):', fbErr);
    }
    const response = await api.signin(email, password);
    setToken(response.token);
    setUser({
      ...response.user,
      collections: response.user.collections || DEFAULT_COLLECTIONS,
      achievements: response.user.achievements || DEFAULT_ACHIEVEMENTS,
    });
    return response.user;
  };

  const signUpWithEmail = async (
    email: string,
    password: string = 'NovellaReader2026!',
    fullName: string = '',
    confirmPassword?: string
  ): Promise<UserProfile> => {
    try {
      await firebaseSignUp(email, password);
    } catch (fbErr) {
      console.warn('Firebase Auth signup notice (proceeding with session):', fbErr);
    }
    const response = await api.signup(fullName || email.split('@')[0], email, password, confirmPassword || password);
    setToken(response.token);
    setUser({
      ...response.user,
      collections: DEFAULT_COLLECTIONS,
      achievements: DEFAULT_ACHIEVEMENTS,
      readingStreak: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        streakHistory: [new Date().toISOString().split('T')[0]],
      },
      readingGoals: {
        storiesMonthlyTarget: 5,
        storiesReadThisMonth: 0,
        chaptersWeeklyTarget: 20,
        chaptersReadThisWeek: 0,
        minutesDailyTarget: 30,
        minutesReadToday: 0,
      },
    });
    return response.user;
  };

  const adminSignIn = async (email: string, password: string): Promise<UserProfile> => {
    try {
      await firebaseSignIn(email, password);
    } catch (fbErr) {
      console.warn('Firebase Auth admin signin notice (proceeding with session):', fbErr);
    }
    const response = await api.adminSignin(email, password);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const googleSignIn = async (
    email: string = 'reader@novella.app',
    name: string = 'Novella Reader',
    avatar?: string
  ): Promise<UserProfile> => {
    const response = await api.googleAuth(email, name, avatar);
    setToken(response.token);
    setUser({
      ...response.user,
      collections: response.user.collections || DEFAULT_COLLECTIONS,
      achievements: response.user.achievements || DEFAULT_ACHIEVEMENTS,
    });
    return response.user;
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await firebaseSendPasswordReset(email);
    } catch (fbErr) {
      console.warn('Firebase Auth reset notice (proceeding with server):', fbErr);
    }
    return await api.forgotPassword(email);
  };

  const resetPassword = async (email: string, resetToken: string, newPassword: string, confirmPassword?: string) => {
    await api.resetPassword(resetToken, newPassword);
  };

  const updateProfile = async (updates: {
    displayName?: string;
    fullName?: string;
    avatar?: string;
    bio?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<UserProfile> => {
    if (!user) throw new Error('Not logged in');
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    return updatedUser;
  };

  const unlockStory = async (storyId: string) => {
    if (!user) return;
    if (user.unlockedStoryIds?.includes(storyId)) return;

    const newUnlocked = [...(user.unlockedStoryIds || []), storyId];
    const updated = {
      ...user,
      unlockedStoryIds: newUnlocked,
    };
    setUser(updated);
  };

  const saveReadingProgress = async (
    storyId: string,
    chapterId: string,
    chapterOrder: number,
    percentage: number
  ) => {
    if (!user) return;

    trackReadingActivity(2, 1, storyId);

    const updatedProgress = {
      ...(user.readingProgress || {}),
      [storyId]: {
        storyId,
        currentChapterId: chapterId,
        currentChapterOrder: chapterOrder,
        percentage,
        lastReadAt: new Date().toISOString(),
      },
    };

    const updatedUser = {
      ...user,
      readingProgress: updatedProgress,
    };
    setUser(updatedUser);
  };

  const addBookmark = async (bookmarkData: Omit<UserBookmark, 'id' | 'createdAt'>) => {
    if (!user) return;

    const newBm: UserBookmark = {
      ...bookmarkData,
      id: `bm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const newBookmarks = [newBm, ...(user.bookmarks || [])];
    const updatedUser = {
      ...user,
      bookmarks: newBookmarks,
    };
    setUser(updatedUser);
  };

  const removeBookmark = async (bookmarkId: string) => {
    if (!user) return;

    const newBookmarks = (user.bookmarks || []).filter((b) => b.id !== bookmarkId);
    const updatedUser = {
      ...user,
      bookmarks: newBookmarks,
    };
    setUser(updatedUser);
  };

  const signOut = async () => {
    try {
      await firebaseSignOutUser();
    } catch {
      // Ignore
    }
    setToken(null);
    setUser(null);
    setStoredAuthToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin,
        adminRole,
        refreshUser,
        isStoryUnlocked,
        unlockStory,
        saveReadingProgress,
        trackReadingActivity,
        updateReadingGoals,
        createCollection,
        deleteCollection,
        addStoryToCollection,
        removeStoryFromCollection,
        toggleLikeStory,
        isStoryLiked,
        toggleFollowAuthor,
        isAuthorFollowed,
        recordRecentlyViewed,
        addBookmark,
        removeBookmark,
        signInWithEmail,
        signUpWithEmail,
        adminSignIn,
        googleSignIn,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        switchRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
