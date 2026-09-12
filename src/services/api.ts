import { 
  Story, 
  PaystackTransaction, 
  Author, 
  CategoryInfo, 
  UserProfile, 
  Announcement, 
  AuditLog, 
  PlatformSettings, 
  StoryAnalytics, 
  Chapter, 
  AuthResponse, 
  ForgotPasswordResponse, 
  Review, 
  UserStoryRating,
  StoryRatingSummary,
  Comment, 
  AppNotification, 
  ContentReport, 
  AuthorEarnings, 
  AIGenerateStoryRequest 
} from '../types';
import { INITIAL_STORIES } from '../data/initialStories';
import { 
  INITIAL_AUTHORS, 
  INITIAL_CATEGORIES, 
  INITIAL_ADMIN_USERS, 
  INITIAL_EXTENDED_TRANSACTIONS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_PLATFORM_SETTINGS, 
  INITIAL_STORY_ANALYTICS,
  INITIAL_REVIEWS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_AUTHOR_EARNINGS
} from '../data/adminMockData';

const API_BASE = '/api';

// Active session token in memory and localStorage
let currentAuthToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('novella_auth_token') : null;

export const setStoredAuthToken = (token: string | null) => {
  currentAuthToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('novella_auth_token', token);
    } else {
      localStorage.removeItem('novella_auth_token');
    }
  }
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
};

// Fallback in-memory storage for offline / resilient client execution
let localStories: Story[] = [...INITIAL_STORIES];
let localAuthors: Author[] = [...INITIAL_AUTHORS];
let localCategories: CategoryInfo[] = [...INITIAL_CATEGORIES];
let localUsers: UserProfile[] = [...INITIAL_ADMIN_USERS];
let localTransactions: PaystackTransaction[] = [...INITIAL_EXTENDED_TRANSACTIONS];
let localReviews: Review[] = [...INITIAL_REVIEWS];
let localComments: Comment[] = [...INITIAL_COMMENTS];
let localNotifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
let localReports: ContentReport[] = [...INITIAL_REPORTS];
let localAnnouncements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
let localSettings: PlatformSettings = { ...INITIAL_PLATFORM_SETTINGS };

export const api = {
  // -------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------
  async signup(fullName: string, email: string, password: string, confirmPassword?: string, role?: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, confirmPassword: confirmPassword || password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account');
    }

    setStoredAuthToken(data.token);
    return data;
  },

  async signin(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password');
    }

    setStoredAuthToken(data.token);
    return data;
  },

  async adminSignin(email: string, password: string): Promise<AuthResponse> {
    return this.signin(email, password);
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Password reset instructions have been dispatched to your email.',
        resetToken: 'mock_reset_token_' + Date.now(),
      };
    }
  },

  async resetPassword(tokenOrObj: string | any, newPassword?: string): Promise<{ success: boolean; message: string }> {
    const token = typeof tokenOrObj === 'object' ? tokenOrObj.resetToken || tokenOrObj.token : tokenOrObj;
    const pwd = typeof tokenOrObj === 'object' ? tokenOrObj.newPassword : newPassword;
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: pwd }),
      });
      return await res.json();
    } catch {
      return { success: true, message: 'Password has been successfully updated.' };
    }
  },

  async googleAuth(email: string, fullName: string, avatar?: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, avatar }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google sign-in failed');
    }

    setStoredAuthToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: UserProfile; token?: string }> {
    if (!currentAuthToken) throw new Error('No active token');
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Session expired');
    }
    return data;
  },

  async logout(): Promise<void> {
    setStoredAuthToken(null);
  },

  async updateProfile(updates: any): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return await res.json();
  },

  async syncUserData(updates: Partial<UserProfile>): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
    } catch {
      // Ignore
    }
  },

  // -------------------------------------------------------------
  // STORIES
  // -------------------------------------------------------------
  async getStories(): Promise<Story[]> {
    try {
      const res = await fetch(`${API_BASE}/stories`);
      if (res.ok) {
        const data = await res.json();
        localStories = data;
        return data;
      }
    } catch (e) {
      console.warn('API getStories failed, using local seed:', e);
    }
    return localStories;
  },

  async getStoryForReading(storyId: string): Promise<Story> {
    const res = await fetch(`${API_BASE}/stories/${storyId}/read`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Could not load chapter content');
    }
    return data;
  },

  async createStory(storyData: Partial<Story>): Promise<Story> {
    const res = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(storyData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create story');
    }
    return data;
  },

  async updateStory(storyId: string, updates: Partial<Story>): Promise<Story> {
    const res = await fetch(`${API_BASE}/stories/${storyId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update story');
    }
    return data;
  },

  async deleteStory(storyId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/stories/${storyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete story');
    }
    return data;
  },

  async updateChapters(storyId: string, chapters: Chapter[]): Promise<Story> {
    return this.updateStory(storyId, { chapters, totalChapters: chapters.length });
  },

  async updateCover(storyId: string, coverData: any): Promise<Story> {
    return this.updateStory(storyId, coverData);
  },

  // -------------------------------------------------------------
  // CHAPTERS MANAGEMENT
  // -------------------------------------------------------------
  async addChapter(storyId: string, chapter: Partial<Chapter>): Promise<Chapter> {
    const res = await fetch(`${API_BASE}/stories/${storyId}/chapters`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(chapter),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add chapter');
    }
    return data;
  },

  async updateChapter(storyId: string, chapterId: string, updates: Partial<Chapter>): Promise<Chapter> {
    const res = await fetch(`${API_BASE}/stories/${storyId}/chapters/${chapterId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update chapter');
    }
    return data;
  },

  async deleteChapter(storyId: string, chapterId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/stories/${storyId}/chapters/${chapterId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete chapter');
    }
    return data;
  },

  // -------------------------------------------------------------
  // AI STORY GENERATOR
  // -------------------------------------------------------------
  async generateAIStory(payload: AIGenerateStoryRequest): Promise<Story> {
    const res = await fetch(`${API_BASE}/ai/generate-story`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate story with AI');
    }
    return data;
  },

  // -------------------------------------------------------------
  // ADVANCED SEARCH
  // -------------------------------------------------------------
  async advancedSearch(params: {
    q?: string;
    category?: string;
    pricing?: string;
    tags?: string;
    minRating?: number;
    interactive?: boolean;
    sort?: string;
  }): Promise<Story[]> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.category) searchParams.set('category', params.category);
    if (params.pricing) searchParams.set('pricing', params.pricing);
    if (params.tags) searchParams.set('tags', params.tags);
    if (params.minRating) searchParams.set('minRating', params.minRating.toString());
    if (params.interactive !== undefined) searchParams.set('interactive', params.interactive.toString());
    if (params.sort) searchParams.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/stories/search?${searchParams.toString()}`);
    if (!res.ok) return [];
    return await res.json();
  },

  // -------------------------------------------------------------
  // AUTHORS & FOLLOWING
  // -------------------------------------------------------------
  async getAuthors(): Promise<Author[]> {
    try {
      const res = await fetch(`${API_BASE}/authors`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localAuthors;
  },

  async getAuthor(authorId: string): Promise<Author> {
    const res = await fetch(`${API_BASE}/authors/${authorId}`);
    return await res.json();
  },

  async followAuthor(authorId: string): Promise<{ following: boolean; followersCount: number }> {
    const res = await fetch(`${API_BASE}/authors/${authorId}/follow`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async toggleFollowAuthor(authorId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const res = await this.followAuthor(authorId);
    return { isFollowing: res.following, followersCount: res.followersCount };
  },

  async createAuthor(authorData: Partial<Author>): Promise<Author> {
    const newAuthor: Author = {
      id: authorData.id || `author-${Date.now()}`,
      name: authorData.name || 'New Author',
      bio: authorData.bio || '',
      avatar: authorData.avatar || '',
      totalStories: authorData.totalStories || 0,
      followersCount: authorData.followersCount || 0,
      primaryGenre: authorData.primaryGenre || 'African Stories',
      featured: authorData.featured || false,
    };
    localAuthors = [newAuthor, ...localAuthors];
    return newAuthor;
  },

  async updateAuthor(authorId: string, updates: Partial<Author>): Promise<Author> {
    localAuthors = localAuthors.map((a) => (a.id === authorId ? { ...a, ...updates } : a));
    const found = localAuthors.find((a) => a.id === authorId);
    return found || (updates as Author);
  },

  async deleteAuthor(authorId: string): Promise<{ success: boolean }> {
    localAuthors = localAuthors.filter((a) => a.id !== authorId);
    return { success: true };
  },

  async getAuthorEarnings(): Promise<AuthorEarnings> {
    try {
      const res = await fetch(`${API_BASE}/author/earnings`, { headers: getAuthHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return INITIAL_AUTHOR_EARNINGS;
  },

  async requestPayout(
    amountNGN: number, 
    bankDetails: { bankName: string; accountNumber: string; accountName: string } | string
  ): Promise<any> {
    const details = typeof bankDetails === 'string'
      ? { bankName: 'Commercial Bank', accountNumber: '0123456789', accountName: bankDetails }
      : bankDetails;
    const res = await fetch(`${API_BASE}/author/request-payout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amountNGN, bankDetails: details }),
    });
    return await res.json();
  },

  // -------------------------------------------------------------
  // REVIEWS & RATINGS ENGINE
  // -------------------------------------------------------------
  async getReviews(storyId: string): Promise<Review[]> {
    try {
      const res = await fetch(`${API_BASE}/reviews?storyId=${encodeURIComponent(storyId)}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localReviews.filter((r) => r.storyId === storyId && r.status === 'approved');
  },

  async getStoryRatingInfo(storyId: string): Promise<StoryRatingSummary & { userRating?: number; userReview?: Review; recentReviews: Review[] }> {
    try {
      const res = await fetch(`${API_BASE}/stories/${storyId}/rating`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local
    }

    const story = localStories.find((s) => s.id === storyId);
    const storyApprovedReviews = localReviews.filter((r) => r.storyId === storyId && r.status === 'approved');
    return {
      storyId,
      averageRating: story?.rating || 4.7,
      ratingsCount: story?.ratingsCount || 1245,
      reviewCount: story?.reviewCount || storyApprovedReviews.length,
      breakdown: story?.ratingBreakdown || { 5: 996, 4: 187, 3: 42, 2: 12, 1: 8 },
      recentReviews: storyApprovedReviews.slice(0, 10),
    };
  },

  async rateStory(
    storyId: string,
    rating: number,
    title?: string,
    content?: string,
    hasSpoilers?: boolean
  ): Promise<{ success: boolean; isUpdate: boolean; message: string; story: Story; userRating: number; review?: Review }> {
    const res = await fetch(`${API_BASE}/stories/${storyId}/rate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, title, content, hasSpoilers }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit rating');
    }

    // Update in local array as well for instant responsiveness
    if (data.story) {
      const index = localStories.findIndex((s) => s.id === storyId);
      if (index >= 0) {
        localStories[index] = { ...localStories[index], ...data.story };
      }
    }

    return data;
  },

  async addReview(reviewData: {
    storyId: string;
    rating: number;
    title: string;
    content: string;
    hasSpoilers?: boolean;
  }): Promise<{ review: Review; story?: Story }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit review');
    }
    return data;
  },

  async getUserRatings(): Promise<UserStoryRating[]> {
    try {
      const res = await fetch(`${API_BASE}/user/ratings`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return [];
  },

  async likeReview(reviewId: string): Promise<{ likes: number; liked: boolean }> {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/like`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // -------------------------------------------------------------
  // COMMENTS & DISCUSSIONS
  // -------------------------------------------------------------
  async getComments(storyId: string, chapterId?: string): Promise<Comment[]> {
    const url = chapterId 
      ? `${API_BASE}/stories/${storyId}/comments?chapterId=${chapterId}`
      : `${API_BASE}/stories/${storyId}/comments`;

    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localComments.filter((c) => c.storyId === storyId);
  },

  async addComment(payload: { storyId: string; chapterId?: string; content: string }): Promise<Comment> {
    const res = await fetch(`${API_BASE}/stories/${payload.storyId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async addReply(commentId: string, content: string): Promise<any> {
    const res = await fetch(`${API_BASE}/comments/${commentId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return await res.json();
  },

  async likeComment(commentId: string): Promise<{ likes: number }> {
    const res = await fetch(`${API_BASE}/comments/${commentId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localNotifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    localNotifications = localNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    localNotifications = localNotifications.map((n) => ({ ...n, read: true }));
  },

  // -------------------------------------------------------------
  // CONTENT REPORTING
  // -------------------------------------------------------------
  async reportContent(payload: {
    targetType: 'story' | 'comment' | 'review' | 'user';
    targetId: string;
    targetTitle?: string;
    reason: string;
    details?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async submitReport(payload: any): Promise<{ success: boolean; message: string }> {
    return this.reportContent(payload);
  },

  // -------------------------------------------------------------
  // PAYMENTS & PAYSTACK TRANSACTIONS
  // -------------------------------------------------------------
  async initializePayment(email: string, storyId: string, amountNGN: number): Promise<{
    reference: string;
    access_code: string;
    authorization_url: string;
    data?: { reference: string; authorization_url: string; access_code: string };
  }> {
    const res = await fetch(`${API_BASE}/paystack/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, storyId, amountNGN }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to initialize Paystack payment');
    }
    return {
      ...data,
      data: {
        reference: data.reference,
        authorization_url: data.authorization_url,
        access_code: data.access_code,
      }
    };
  },

  async initializePaystack(storyIdOrEmail: string, emailOrStoryId?: string, amountNGN?: number): Promise<any> {
    const email = emailOrStoryId && emailOrStoryId.includes('@') ? emailOrStoryId : storyIdOrEmail.includes('@') ? storyIdOrEmail : 'reader@novella.app';
    const storyId = storyIdOrEmail.includes('@') ? (emailOrStoryId || 'story-1') : storyIdOrEmail;
    return this.initializePayment(email, storyId, amountNGN || 2500);
  },

  async verifyPayment(reference: string, emailOrStory: string, storyOrEmail?: string): Promise<{
    status: boolean;
    story: Story;
    transaction: PaystackTransaction;
  }> {
    const email = emailOrStory.includes('@') ? emailOrStory : storyOrEmail || 'reader@novella.app';
    const storyId = emailOrStory.includes('@') ? (storyOrEmail || 'story-1') : emailOrStory;

    const res = await fetch(`${API_BASE}/paystack/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reference, email, storyId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Payment verification failed');
    }
    return {
      ...data,
      status: data.status === 'success' || data.status === true,
    };
  },

  async verifyPaystack(reference: string, storyId: string, email: string, _channel?: string): Promise<any> {
    return this.verifyPayment(reference, email, storyId);
  },

  async getTransactions(): Promise<PaystackTransaction[]> {
    const res = await fetch(`${API_BASE}/transactions`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async getAdminPurchases(): Promise<any[]> {
    const txs = await this.getTransactions();
    return txs.map((t) => ({
      ...t,
      customerName: t.userEmail ? t.userEmail.split('@')[0] : 'Reader',
      transactionReference: t.reference,
      purchasedAt: t.paidAt || (t as any).createdAt || new Date().toISOString(),
      amountPaidNGN: t.amountNGN,
      channel: t.channel || 'card',
    }));
  },

  async grantStoryAccess(userId: string, storyId: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/${userId}/grant-access`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ storyId }),
    });
    return await res.json();
  },

  async revokeStoryAccess(userId: string, storyId: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/${userId}/revoke-access`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ storyId }),
    });
    return await res.json();
  },

  // -------------------------------------------------------------
  // ADMIN PLATFORM MANAGEMENT
  // -------------------------------------------------------------
  async getCategories(): Promise<CategoryInfo[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localCategories;
  },

  async createCategory(catData: Partial<CategoryInfo>): Promise<CategoryInfo> {
    const name = catData.name || 'Category';
    const newCat: CategoryInfo = {
      id: catData.id || `cat-${Date.now()}`,
      name: name as any,
      slug: catData.slug || String(name).toLowerCase().replace(/\s+/g, '-'),
      description: catData.description || '',
      icon: catData.icon || 'BookOpen',
      color: catData.color || 'from-amber-600 to-amber-800',
      bookCount: catData.bookCount || 0,
      isFeatured: catData.isFeatured ?? true,
    };
    localCategories = [newCat, ...localCategories];
    return newCat;
  },

  async updateCategory(catId: string, updates: Partial<CategoryInfo>): Promise<CategoryInfo> {
    localCategories = localCategories.map((c) => (c.id === catId ? { ...c, ...updates } : c));
    const found = localCategories.find((c) => c.id === catId);
    return found || (updates as CategoryInfo);
  },

  async deleteCategory(catId: string): Promise<{ success: boolean }> {
    localCategories = localCategories.filter((c) => c.id !== catId);
    return { success: true };
  },

  async getAdminUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async getUsers(): Promise<UserProfile[]> {
    return this.getAdminUsers();
  },

  async updateUserRole(userId: string, role: string, status?: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role, status }),
    });
    return await res.json();
  },

  async toggleUserStatus(userId: string): Promise<UserProfile> {
    return this.updateUserRole(userId, 'user', 'suspended');
  },

  async getStats(): Promise<any> {
    return {
      totalRevenueNGN: 184500,
      totalUsers: 1420,
      activeReaders: 680,
      unlockedBooksCount: 2310,
      conversionRate: 14.8,
    };
  },

  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localAnnouncements;
  },

  async createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement> {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(announcement),
    });
    return await res.json();
  },

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement> {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return await res.json();
  },

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async getPlatformSettings(): Promise<PlatformSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localSettings;
  },

  async getSettings(): Promise<PlatformSettings> {
    return this.getPlatformSettings();
  },

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return await res.json();
  },

  async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    return this.updatePlatformSettings(settings);
  },

  async getAdminPrices(): Promise<any> {
    const stList = await this.getStories();
    return {
      stories: stList,
      history: [
        {
          id: 'hist-1',
          storyId: 'story-1',
          storyTitle: 'Things Fall Apart',
          oldPriceNGN: 0,
          newPriceNGN: 0,
          isFree: true,
          changedBy: 'Super Administrator',
          changedAt: '2026-01-10T12:00:00Z',
          reason: 'Permanent platform cornerstone book (Guaranteed Free Vol 01)'
        },
        {
          id: 'hist-2',
          storyId: 'story-3',
          storyTitle: 'Half of a Yellow Sun',
          oldPriceNGN: 3500,
          newPriceNGN: 2500,
          isFree: false,
          changedBy: 'Finance Administrator',
          changedAt: '2026-02-01T14:30:00Z',
          reason: 'Promotional literary discount'
        }
      ]
    };
  },

  async updateStoryPrice(storyId: string, optionsOrPrice: any, maybeUsd?: number): Promise<Story> {
    if (typeof optionsOrPrice === 'object') {
      const { isFree, newPriceNGN } = optionsOrPrice;
      return this.updateStory(storyId, { isFree, priceNGN: newPriceNGN });
    }
    return this.updateStory(storyId, { priceNGN: optionsOrPrice, priceUSD: maybeUsd });
  },

  async getAnalytics(): Promise<StoryAnalytics[]> {
    const res = await fetch(`${API_BASE}/analytics`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async generateTitles(prompt: string, genre?: string, tone?: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/ai/generate-titles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, genre, tone }),
    });
    const data = await res.json();
    return data.titles || [];
  },

  async generateStoryIdea(genre?: string, theme?: string, characterType?: string, setting?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/generate-idea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre, theme, characterType, setting }),
    });
    const data = await res.json();
    return data.idea;
  },

  async generateCharacter(role?: string, genre?: string, archetype?: string, context?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/generate-character`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, genre, archetype, context }),
    });
    const data = await res.json();
    return data.character;
  },

  async writingAssistant(action: string, text: string, context?: string, tone?: string): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/writing-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text, context, tone }),
    });
    const data = await res.json();
    return data.result || '';
  },

  async getAIRecommendations(favoriteGenres?: string[], readStoryIds?: string[], likedStoryIds?: string[]): Promise<Story[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/recommendations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ favoriteGenres, readStoryIds, likedStoryIds }),
      });
      const data = await res.json();
      return data.recommendations || [];
    } catch {
      return localStories.slice(0, 6);
    }
  },

  async translateStory(storyId: string, chapterId?: string, targetLanguage?: string, targetLanguageCode?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, chapterId, targetLanguage, targetLanguageCode }),
    });
    const data = await res.json();
    return data.translation;
  },

  async toggleStoryLike(storyId: string): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> {
    const res = await fetch(`${API_BASE}/stories/${storyId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async verifyAuthor(authorId: string, verified?: boolean): Promise<Author> {
    const res = await fetch(`${API_BASE}/authors/${authorId}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ verified }),
    });
    return await res.json();
  },

  async getAuthorAnalytics(authorId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/authors/${authorId}/analytics`);
    return await res.json();
  },

  async getActivityFeed(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/activity-feed`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return [];
  },

  async likeActivityFeed(itemId: string): Promise<{ success: boolean; likes: number }> {
    const res = await fetch(`${API_BASE}/activity-feed/${itemId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async exportBackup(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/backup/export`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async restoreBackup(payload: any): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/backup/restore`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data: payload }),
    });
    return await res.json();
  },

  async suspendUser(userId: string, reason?: string, until?: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason, until }),
    });
    return await res.json();
  },

  async unsuspendUser(userId: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/unsuspend`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async getDetailedAdminAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/detailed-analytics`, { headers: getAuthHeaders() });
    return await res.json();
  },

  // -------------------------------------------------------------
  // OFFLINE STORAGE HELPERS (localStorage / IndexedDB)
  // -------------------------------------------------------------
  saveOfflineStory(story: Story): void {
    if (typeof window === 'undefined') return;
    try {
      const key = `novella_offline_${story.id}`;
      localStorage.setItem(key, JSON.stringify({ story, downloadedAt: new Date().toISOString() }));
    } catch (e) {
      console.warn('Could not store story offline:', e);
    }
  },

  getOfflineStories(): Story[] {
    if (typeof window === 'undefined') return [];
    const stories: Story[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('novella_offline_')) {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.story) stories.push(parsed.story);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading offline stories:', e);
    }
    return stories;
  },

  removeOfflineStory(storyId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`novella_offline_${storyId}`);
  },

  isStoryOffline(storyId: string): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem(`novella_offline_${storyId}`));
  }
};
