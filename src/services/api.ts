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
  PriceHistoryRecord,
  CustomerPurchaseRecord
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
  INITIAL_STORY_ANALYTICS 
} from '../data/adminMockData';

const API_BASE = '/api';

// Current active session token
let currentAuthToken: string | null = null;

export const setStoredAuthToken = (token: string | null) => {
  currentAuthToken = token;
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

// Fallback in-memory storage for offline/pure client resilience
let localStories: Story[] = [...INITIAL_STORIES];
let localAuthors: Author[] = [...INITIAL_AUTHORS];
let localCategories: CategoryInfo[] = [...INITIAL_CATEGORIES];
let localUsers: UserProfile[] = [...INITIAL_ADMIN_USERS];
let localTransactions: PaystackTransaction[] = [...INITIAL_EXTENDED_TRANSACTIONS];
let localAnnouncements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
let localAuditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let localSettings: PlatformSettings = { ...INITIAL_PLATFORM_SETTINGS };
let localAnalytics: StoryAnalytics[] = [...INITIAL_STORY_ANALYTICS];

export const api = {
  // -------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------
  async signup(fullName: string, email: string, password: string, confirmPassword?: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, confirmPassword: confirmPassword || password }),
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
    const res = await fetch(`${API_BASE}/auth/admin-signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Administrator authentication failed');
    }

    setStoredAuthToken(data.token);
    return data;
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
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setStoredAuthToken(null);
    }
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Password reset request failed');
    }
    return data;
  },

  async resetPassword(payload: { email: string; resetToken: string; newPassword: string; confirmPassword?: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }
    return data;
  },

  async updateProfile(updates: { displayName?: string; fullName?: string; avatar?: string; currentPassword?: string; newPassword?: string }): Promise<{ message: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }
    return data;
  },

  async syncUserData(payload: { bookmarks?: any[]; readingProgress?: any; unlockedStoryIds?: string[]; totalReadingMinutes?: number }): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch {
      // Fallback
    }
    return localUsers[0];
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
    } catch {
      // Fallback
    }
    return localStories;
  },

  async getStory(id: string): Promise<Story> {
    try {
      const res = await fetch(`${API_BASE}/stories/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const found = localStories.find((s) => s.id === id);
    if (!found) throw new Error('Story not found');
    return found;
  },

  async getStoryForReading(id: string, userEmail?: string, unlockedStoryIds: string[] = []): Promise<Story> {
    try {
      const headers = getAuthHeaders();
      headers['x-user-email'] = userEmail || '';
      headers['x-unlocked-ids'] = unlockedStoryIds.join(',');

      const res = await fetch(`${API_BASE}/stories/${id}/read`, {
        headers,
      });

      if (res.ok) {
        return await res.json();
      }

      if (res.status === 403) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Story is locked');
      }
    } catch (e: any) {
      if (e.message && e.message.includes('locked')) {
        throw e;
      }
    }

    // Fallback: check access locally
    const found = localStories.find((s) => s.id === id);
    if (!found) throw new Error('Story not found');
    if (found.isFree || unlockedStoryIds.includes(found.id)) {
      return found;
    }
    throw new Error('This story requires purchase. First 2 books are 100% free.');
  },

  async createStory(storyData: Partial<Story>): Promise<Story> {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      order: localStories.length + 1,
      title: storyData.title || 'Untitled Manuscript',
      subtitle: storyData.subtitle || '',
      author: storyData.author || 'Anonymous Author',
      authorId: storyData.authorId,
      authorBio: storyData.authorBio || '',
      category: storyData.category || 'Folklore',
      isFree: storyData.isFree ?? (localStories.length < (localSettings.freeBooksThreshold || 2)),
      priceNGN: storyData.isFree ? 0 : (storyData.priceNGN || 2000),
      priceUSD: storyData.isFree ? 0 : (storyData.priceUSD || 2.80),
      rating: 5.0,
      reviewCount: 1,
      totalChapters: storyData.chapters?.length || 1,
      readTime: `${(storyData.chapters?.length || 1) * 6} min`,
      tags: storyData.tags || ['African Literature'],
      publishedYear: new Date().getFullYear(),
      status: storyData.status || 'published',
      featured: storyData.featured ?? false,
      totalReads: 0,
      totalRevenueNGN: 0,
      completionRate: 85,
      description: storyData.description || 'A newly composed manuscript in Novella.',
      synopsis: storyData.synopsis || storyData.description || '',
      coverImage: storyData.coverImage,
      coverColorTheme: storyData.coverColorTheme || {
        bgGradient: 'from-amber-950 via-zinc-900 to-black',
        accent: '#d97706',
        text: '#fef3c7',
        border: '#78350f',
      },
      chapters: storyData.chapters && storyData.chapters.length > 0 ? storyData.chapters : [
        {
          id: `ch-${Date.now()}-1`,
          order: 1,
          title: 'Chapter 1: The Opening Passage',
          subtitle: 'The journey begins',
          readMinutes: 5,
          status: 'published',
          content: 'Write the opening paragraph of your new masterpiece here.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE}/stories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newStory),
      });
      if (res.ok) {
        const created = await res.json();
        localStories.push(created);
        api.addAuditLog('Story Created', 'book', newStory.title, `Added new story by ${newStory.author}`);
        return created;
      }
    } catch {
      // Fallback
    }

    localStories.push(newStory);
    api.addAuditLog('Story Created', 'book', newStory.title, `Added new story by ${newStory.author}`);
    return newStory;
  },

  async updateStory(id: string, updates: Partial<Story>): Promise<Story> {
    try {
      const res = await fetch(`${API_BASE}/stories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = localStories.findIndex(s => s.id === id);
        if (idx !== -1) localStories[idx] = updated;
        api.addAuditLog('Story Updated', 'book', updated.title, `Modified fields: ${Object.keys(updates).join(', ')}`);
        return updated;
      }
    } catch {
      // Fallback
    }

    const index = localStories.findIndex((s) => s.id === id);
    if (index !== -1) {
      localStories[index] = { 
        ...localStories[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      api.addAuditLog('Story Updated', 'book', localStories[index].title, `Modified fields: ${Object.keys(updates).join(', ')}`);
      return localStories[index];
    }
    throw new Error('Story not found');
  },

  async deleteStory(id: string): Promise<void> {
    const target = localStories.find(s => s.id === id);
    try {
      await fetch(`${API_BASE}/stories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      // Fallback
    }
    localStories = localStories.filter((s) => s.id !== id);
    if (target) {
      api.addAuditLog('Story Deleted', 'book', target.title, `Deleted story ID: ${id}`);
    }
  },

  // -------------------------------------------------------------
  // BOOK COVERS
  // -------------------------------------------------------------
  async updateCover(storyId: string, coverData: { coverImage?: string; coverColorTheme?: any }): Promise<Story> {
    const story = localStories.find(s => s.id === storyId);
    if (!story) throw new Error('Story not found');
    const updated = await api.updateStory(storyId, coverData);
    api.addAuditLog('Cover Art Updated', 'book', story.title, `Updated cover visual & palette`);
    return updated;
  },

  // -------------------------------------------------------------
  // CHAPTERS
  // -------------------------------------------------------------
  async updateChapters(storyId: string, chapters: Chapter[]): Promise<Story> {
    const story = localStories.find(s => s.id === storyId);
    if (!story) throw new Error('Story not found');

    const updatedStory: Story = {
      ...story,
      chapters,
      totalChapters: chapters.length,
      readTime: `${chapters.reduce((sum, ch) => sum + (ch.readMinutes || 5), 0)} min`,
      updatedAt: new Date().toISOString()
    };

    return await api.updateStory(storyId, updatedStory);
  },

  // -------------------------------------------------------------
  // PUBLISHING & STATUS
  // -------------------------------------------------------------
  async updateStoryPublishStatus(storyId: string, status: 'published' | 'draft' | 'archived'): Promise<Story> {
    try {
      const res = await fetch(`${API_BASE}/stories/${storyId}/publish-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = localStories.findIndex(s => s.id === storyId);
        if (idx !== -1) localStories[idx] = updated;
        api.addAuditLog('Publish Status Changed', 'book', updated.title, `Status changed to ${status}`);
        return updated;
      }
    } catch {
      // Fallback
    }
    return await api.updateStory(storyId, { status });
  },

  // -------------------------------------------------------------
  // PRICE MANAGEMENT
  // -------------------------------------------------------------
  async getAdminPrices(): Promise<{ stories: any[]; history: PriceHistoryRecord[]; defaultCurrency: string; ngnToUsdRate: number }> {
    try {
      const res = await fetch(`${API_BASE}/admin/prices`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const rate = localSettings.ngnToUsdRate || 1450;
    const stories = localStories.map(s => ({
      id: s.id,
      order: s.order,
      title: s.title,
      author: s.author,
      category: s.category,
      isFree: s.isFree,
      priceNGN: s.priceNGN,
      priceUSD: s.priceUSD,
      status: s.status || 'published',
      totalRevenueNGN: localTransactions.filter(t => t.storyId === s.id && t.status === 'success').reduce((sum, t) => sum + t.amountNGN, 0),
      salesCount: localTransactions.filter(t => t.storyId === s.id && t.status === 'success').length
    }));

    return {
      stories,
      history: [],
      defaultCurrency: localSettings.defaultCurrency || 'NGN',
      ngnToUsdRate: rate
    };
  },

  async updateStoryPrice(storyId: string, payload: { newPriceNGN?: number; isFree?: boolean; reason?: string }): Promise<{ story: Story; historyRecord?: PriceHistoryRecord }> {
    try {
      const res = await fetch(`${API_BASE}/admin/prices/${storyId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const idx = localStories.findIndex(s => s.id === storyId);
        if (idx !== -1) localStories[idx] = data.story;
        return data;
      }
    } catch {
      // Fallback
    }

    const story = localStories.find(s => s.id === storyId);
    if (!story) throw new Error('Story not found');
    const rate = localSettings.ngnToUsdRate || 1450;
    const isFree = payload.isFree ?? story.isFree;
    const priceNGN = isFree ? 0 : (payload.newPriceNGN ?? story.priceNGN);
    const priceUSD = isFree ? 0 : Number((priceNGN / rate).toFixed(2));

    const updated = await api.updateStory(storyId, { isFree, priceNGN, priceUSD });
    api.addAuditLog('Price Updated', 'price', updated.title, `Price updated to ₦${priceNGN} (Free: ${isFree})`);
    return { story: updated };
  },

  // -------------------------------------------------------------
  // PURCHASES MANAGEMENT
  // -------------------------------------------------------------
  async getAdminPurchases(): Promise<CustomerPurchaseRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/purchases`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return localTransactions.map(t => ({
      id: `pur-${t.id}`,
      transactionReference: t.reference,
      userEmail: t.userEmail,
      customerName: t.customerName || t.userEmail.split('@')[0],
      storyId: t.storyId,
      storyTitle: t.storyTitle,
      amountNGN: t.amountNGN,
      amountUSD: t.amountUSD || Number((t.amountNGN / (localSettings.ngnToUsdRate || 1450)).toFixed(2)),
      channel: t.channel,
      purchasedAt: t.paidAt,
      status: t.status === 'success' ? 'active' : 'revoked'
    }));
  },

  // -------------------------------------------------------------
  // PAYSTACK PAYMENTS & TRANSACTIONS
  // -------------------------------------------------------------
  async initializePaystack(storyId: string, email: string, amountNGN: number) {
    try {
      const res = await fetch(`${API_BASE}/paystack/initialize`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ storyId, email, amountNGN }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback simulated session
    }
    return {
      status: true,
      data: {
        reference: `PSTK_LOCAL_${Date.now()}`,
        amount: amountNGN * 100,
        currency: 'NGN',
      },
    };
  },

  async verifyPaystack(reference: string, storyId: string, email: string, channel = 'card') {
    try {
      const res = await fetch(`${API_BASE}/paystack/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reference, storyId, email, channel }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const story = localStories.find(s => s.id === storyId);
    const newTx: PaystackTransaction = {
      id: `tx-${Date.now()}`,
      reference,
      storyId,
      storyTitle: story?.title || 'Story Book',
      userEmail: email,
      amountNGN: story?.priceNGN || 2000,
      amountUSD: story?.priceUSD || 2.80,
      status: 'success',
      channel,
      paidAt: new Date().toISOString(),
      gatewayResponse: 'Successful Card/Bank Verification'
    };

    localTransactions.unshift(newTx);
    api.addAuditLog('Payment Verified', 'payment', reference, `Verified ₦${newTx.amountNGN.toLocaleString()} for ${newTx.storyTitle}`);

    return {
      status: true,
      data: {
        status: 'success',
        reference,
        amount: newTx.amountNGN,
        paid_at: newTx.paidAt,
      },
    };
  },

  async getTransactions(): Promise<PaystackTransaction[]> {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const txs = await res.json();
        localTransactions = txs;
        return txs;
      }
    } catch {
      // Fallback
    }
    return localTransactions;
  },

  async refundTransaction(txId: string): Promise<PaystackTransaction> {
    const tx = localTransactions.find(t => t.id === txId);
    if (!tx) throw new Error('Transaction not found');
    tx.refunded = true;
    tx.status = 'failed';
    api.addAuditLog('Transaction Refunded', 'payment', tx.reference, `Issued refund for ₦${tx.amountNGN.toLocaleString()} to ${tx.userEmail}`);
    return tx;
  },

  // -------------------------------------------------------------
  // STATS & ANALYTICS
  // -------------------------------------------------------------
  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const totalRevenueNGN = localTransactions
      .filter((t) => t.status === 'success' && !t.refunded)
      .reduce((sum, t) => sum + t.amountNGN, 0);

    const totalRevenueUSD = totalRevenueNGN / (localSettings.ngnToUsdRate || 1500);

    return {
      totalStories: localStories.length,
      freeStories: localStories.filter((s) => s.isFree).length,
      premiumStories: localStories.filter((s) => !s.isFree).length,
      totalUsers: localUsers.length,
      totalAuthors: localAuthors.length,
      totalTransactions: localTransactions.length,
      totalRevenueNGN,
      totalRevenueUSD: Number(totalRevenueUSD.toFixed(2)),
      activeReaders: localUsers.filter(u => u.status === 'active').length,
    };
  },

  async getAnalytics(): Promise<StoryAnalytics[]> {
    return localAnalytics;
  },

  // -------------------------------------------------------------
  // AUTHORS
  // -------------------------------------------------------------
  async getAuthors(): Promise<Author[]> {
    return localAuthors;
  },

  async createAuthor(authorData: Partial<Author>): Promise<Author> {
    const newAuthor: Author = {
      id: `auth-${Date.now()}`,
      name: authorData.name || 'New Author',
      bio: authorData.bio || 'Author biography and background.',
      avatar: authorData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      nationality: authorData.nationality || 'African',
      primaryGenre: authorData.primaryGenre || 'Folklore',
      bookIds: authorData.bookIds || [],
      totalReads: 0,
      totalRevenueNGN: 0,
      awards: authorData.awards || [],
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    localAuthors.unshift(newAuthor);
    api.addAuditLog('Author Added', 'book', newAuthor.name, `Added author profile with genre ${newAuthor.primaryGenre}`);
    return newAuthor;
  },

  async updateAuthor(id: string, updates: Partial<Author>): Promise<Author> {
    const idx = localAuthors.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Author not found');
    localAuthors[idx] = { ...localAuthors[idx], ...updates };
    api.addAuditLog('Author Profile Updated', 'book', localAuthors[idx].name, `Updated author profile`);
    return localAuthors[idx];
  },

  async deleteAuthor(id: string): Promise<void> {
    const author = localAuthors.find(a => a.id === id);
    localAuthors = localAuthors.filter(a => a.id !== id);
    if (author) {
      api.addAuditLog('Author Deleted', 'book', author.name, `Deleted author ID: ${id}`);
    }
  },

  // -------------------------------------------------------------
  // CATEGORIES & GENRES
  // -------------------------------------------------------------
  async getCategories(): Promise<CategoryInfo[]> {
    return localCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async createCategory(data: Partial<CategoryInfo>): Promise<CategoryInfo> {
    const newCat: CategoryInfo = {
      id: `cat-${Date.now()}`,
      name: data.name || 'Adventure',
      slug: (data.name || 'adventure').toLowerCase().replace(/\s+/g, '-'),
      description: data.description || 'Exciting narratives across expansive worlds.',
      color: data.color || '#3b82f6',
      bookCount: 0,
      isFeatured: data.isFeatured ?? true,
      order: localCategories.length + 1,
    };
    localCategories.push(newCat);
    api.addAuditLog('Category Created', 'book', newCat.name, `Created category with color ${newCat.color}`);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<CategoryInfo>): Promise<CategoryInfo> {
    const idx = localCategories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    localCategories[idx] = { ...localCategories[idx], ...updates };
    api.addAuditLog('Category Updated', 'book', localCategories[idx].name, `Updated category details`);
    return localCategories[idx];
  },

  async deleteCategory(id: string): Promise<void> {
    const cat = localCategories.find(c => c.id === id);
    localCategories = localCategories.filter(c => c.id !== id);
    if (cat) {
      api.addAuditLog('Category Deleted', 'book', cat.name, `Deleted category ID: ${id}`);
    }
  },

  // -------------------------------------------------------------
  // USERS MANAGEMENT
  // -------------------------------------------------------------
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        localUsers = data;
        return data;
      }
    } catch {
      // Fallback
    }
    return localUsers;
  },

  async toggleUserStatus(userId: string): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Fallback
    }
    const user = localUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.status = user.status === 'active' ? 'suspended' : 'active';
    api.addAuditLog(`User Account ${user.status === 'active' ? 'Reactivated' : 'Suspended'}`, 'user', user.email, `Status changed to ${user.status}`);
    return user;
  },

  async grantBookAccess(userId: string, storyId: string): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/grant-access`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ storyId }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const user = localUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    if (!user.unlockedStoryIds.includes(storyId)) {
      user.unlockedStoryIds.push(storyId);
    }
    const story = localStories.find(s => s.id === storyId);
    api.addAuditLog('Manual Book Access Granted', 'user', user.email, `Granted access to ${story?.title || storyId}`);
    return user;
  },

  async grantStoryAccess(userId: string, storyId: string): Promise<UserProfile> {
    return this.grantBookAccess(userId, storyId);
  },

  async revokeBookAccess(userId: string, storyId: string): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/revoke-access`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ storyId }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const user = localUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.unlockedStoryIds = user.unlockedStoryIds.filter(id => id !== storyId);
    const story = localStories.find(s => s.id === storyId);
    api.addAuditLog('Book Access Revoked', 'user', user.email, `Revoked access to ${story?.title || storyId}`);
    return user;
  },

  async revokeStoryAccess(userId: string, storyId: string): Promise<UserProfile> {
    return this.revokeBookAccess(userId, storyId);
  },

  async updateUserRole(userId: string, newRole: UserProfile['role']): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const user = localUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.role = newRole;
    api.addAuditLog('User Role Changed', 'security', user.email, `Assigned role ${newRole}`);
    return user;
  },

  // -------------------------------------------------------------
  // ANNOUNCEMENTS & NOTIFICATIONS
  // -------------------------------------------------------------
  async getAnnouncements(): Promise<Announcement[]> {
    return localAnnouncements;
  },

  async createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement> {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: announcement.title || 'Platform Announcement',
      message: announcement.message || '',
      type: announcement.type || 'release',
      targetAudience: announcement.targetAudience || 'all',
      status: announcement.status || 'sent',
      sentAt: new Date().toISOString(),
      audienceCount: localUsers.length * 150,
      linkAction: announcement.linkAction,
    };
    localAnnouncements.unshift(newAnn);
    api.addAuditLog('Broadcast Announcement Sent', 'announcement', newAnn.title, `Target: ${newAnn.targetAudience}, Type: ${newAnn.type}`);
    return newAnn;
  },

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement> {
    const idx = localAnnouncements.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Announcement not found');
    localAnnouncements[idx] = { ...localAnnouncements[idx], ...updates };
    api.addAuditLog('Announcement Updated', 'announcement', localAnnouncements[idx].title, `Updated announcement details`);
    return localAnnouncements[idx];
  },

  async deleteAnnouncement(id: string): Promise<void> {
    localAnnouncements = localAnnouncements.filter(a => a.id !== id);
  },

  // -------------------------------------------------------------
  // AUDIT LOGS
  // -------------------------------------------------------------
  async getAuditLogs(): Promise<AuditLog[]> {
    return localAuditLogs;
  },

  addAuditLog(
    action: string, 
    category: AuditLog['category'], 
    target: string, 
    details: string,
    status: AuditLog['status'] = 'success'
  ): void {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      adminEmail: 'admin@novella.app',
      adminRole: 'super_admin',
      action,
      category,
      target,
      details,
      status,
      ipAddress: '102.89.44.12'
    };
    localAuditLogs.unshift(newLog);
  },

  // -------------------------------------------------------------
  // PLATFORM SETTINGS
  // -------------------------------------------------------------
  async getSettings(): Promise<PlatformSettings> {
    return localSettings;
  },

  async updateSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    localSettings = { ...localSettings, ...updates };
    api.addAuditLog('Platform Settings Updated', 'settings', 'Global Configurations', `Updated keys: ${Object.keys(updates).join(', ')}`);
    return localSettings;
  }
};


