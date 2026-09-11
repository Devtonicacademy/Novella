import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, UserBookmark, Story, AdminRole } from '../types';
import { api, setStoredAuthToken } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  adminRole: AdminRole;
  isStoryUnlocked: (story: Story) => boolean;
  unlockStory: (storyId: string) => Promise<void>;
  saveReadingProgress: (storyId: string, chapterId: string, chapterOrder: number, percentage: number) => Promise<void>;
  addBookmark: (bookmark: Omit<UserBookmark, 'id' | 'createdAt'>) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  signInWithEmail: (email: string, password?: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, password: string, fullName: string, confirmPassword?: string) => Promise<UserProfile>;
  adminSignIn: (email: string, password: string) => Promise<UserProfile>;
  googleSignIn: (email?: string, name?: string, avatar?: string) => Promise<UserProfile>;
  requestPasswordReset: (email: string) => Promise<{ resetToken?: string; message: string }>;
  resetPassword: (email: string, resetToken: string, newPassword: string, confirmPassword?: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; fullName?: string; avatar?: string; currentPassword?: string; newPassword?: string }) => Promise<UserProfile>;
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
      if (saved) return JSON.parse(saved);
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
      setUser(data.user);
      setToken(savedToken);
    } catch {
      // Session expired or invalid
      setToken(null);
      setUser(null);
      setStoredAuthToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

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

  const signInWithEmail = async (email: string, password: string = 'NovellaReader2026!'): Promise<UserProfile> => {
    const response = await api.signin(email, password);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const signUpWithEmail = async (
    email: string,
    password: string = 'NovellaReader2026!',
    fullName: string = '',
    confirmPassword?: string
  ): Promise<UserProfile> => {
    const response = await api.signup(fullName || email.split('@')[0], email, password, confirmPassword || password);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const adminSignIn = async (email: string, password: string): Promise<UserProfile> => {
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
    setUser(response.user);
    return response.user;
  };

  const requestPasswordReset = async (email: string) => {
    return await api.forgotPassword(email);
  };

  const resetPassword = async (email: string, resetToken: string, newPassword: string, confirmPassword?: string) => {
    await api.resetPassword({ email, resetToken, newPassword, confirmPassword });
  };

  const updateProfile = async (updates: {
    displayName?: string;
    fullName?: string;
    avatar?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<UserProfile> => {
    const res = await api.updateProfile(updates);
    setUser(res.user);
    return res.user;
  };

  const unlockStory = async (storyId: string) => {
    if (!user) {
      // Temporary guest unlock
      return;
    }

    if (user.unlockedStoryIds?.includes(storyId)) return;

    const newUnlocked = [...(user.unlockedStoryIds || []), storyId];
    const updated = {
      ...user,
      unlockedStoryIds: newUnlocked,
    };
    setUser(updated);

    try {
      await api.syncUserData({ unlockedStoryIds: newUnlocked });
    } catch {
      // Local state is already updated
    }
  };

  const saveReadingProgress = async (
    storyId: string,
    chapterId: string,
    chapterOrder: number,
    percentage: number
  ) => {
    if (!user) return;

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

    try {
      await api.syncUserData({ readingProgress: updatedProgress });
    } catch {
      // Local state is updated
    }
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

    try {
      await api.syncUserData({ bookmarks: newBookmarks });
    } catch {
      // Local state updated
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    if (!user) return;

    const newBookmarks = (user.bookmarks || []).filter((b) => b.id !== bookmarkId);
    const updatedUser = {
      ...user,
      bookmarks: newBookmarks,
    };
    setUser(updatedUser);

    try {
      await api.syncUserData({ bookmarks: newBookmarks });
    } catch {
      // Local state updated
    }
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    } finally {
      setToken(null);
      setUser(null);
      setStoredAuthToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        adminRole,
        isStoryUnlocked,
        unlockStory,
        saveReadingProgress,
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


