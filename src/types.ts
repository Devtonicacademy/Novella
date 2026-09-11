export interface Chapter {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  readMinutes: number;
  content: string;
  status?: 'published' | 'draft';
  updatedAt?: string;
}

export type StoryCategory = 
  | 'Political Satire'
  | 'Poetry & Satire'
  | 'Contemporary Verse'
  | 'Folklore' 
  | 'Historical' 
  | 'Sci-Fi & Fantasy' 
  | 'Mystery & Thriller' 
  | 'Romance' 
  | 'Afrofuturism' 
  | 'Memoir'
  | 'Mythology'
  | 'Adventure'
  | string;

export interface Story {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authorId?: string;
  authorBio?: string;
  category: StoryCategory;
  description: string;
  synopsis?: string;
  coverImage?: string;
  coverColorTheme: {
    bgGradient: string;
    accent: string;
    text: string;
    border: string;
  };
  order: number; // 1 and 2 are free
  isFree: boolean;
  priceNGN: number;
  priceUSD: number;
  rating: number;
  reviewCount: number;
  totalChapters: number;
  readTime: string;
  tags: string[];
  publishedYear: number;
  status?: 'published' | 'draft' | 'archived';
  featured?: boolean;
  totalReads?: number;
  totalRevenueNGN?: number;
  completionRate?: number;
  chapters: Chapter[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserBookmark {
  id: string;
  storyId: string;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  paragraphIndex: number;
  note?: string;
  createdAt: string;
}

export interface ReadingProgress {
  storyId: string;
  currentChapterId: string;
  currentChapterOrder: number;
  percentage: number;
  lastReadAt: string;
}

export type UserRole = 'customer' | 'admin' | 'super_admin' | 'content_admin' | 'support_admin' | 'finance_admin' | 'user';
export type AdminRole = UserRole;

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  fullName?: string;
  avatar?: string;
  unlockedStoryIds: string[];
  bookmarks: UserBookmark[];
  readingProgress: Record<string, ReadingProgress>; // keyed by storyId
  role: UserRole;
  status?: 'active' | 'suspended' | 'pending';
  totalReadingMinutes?: number;
  createdAt: string;
  lastActiveAt?: string;
  authProvider?: 'password' | 'google';
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  message?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string; // provided for development/sandbox demo convenience
}

export interface PaystackTransaction {
  id: string;
  reference: string;
  storyId: string;
  storyTitle: string;
  userEmail: string;
  amountNGN: number;
  amountUSD?: number;
  status: 'success' | 'failed' | 'pending';
  channel: 'card' | 'bank_transfer' | 'ussd' | 'qr' | 'apple_pay' | string;
  paidAt: string;
  customerName?: string;
  gatewayResponse?: string;
  refunded?: boolean;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar?: string;
  country?: string;
  nationality?: string;
  primaryGenre?: StoryCategory;
  bookIds?: string[];
  totalStories?: number;
  totalReads?: number;
  totalRevenueNGN?: number;
  featured?: boolean;
  socialLinks?: Record<string, string>;
  awards?: string[];
  status?: 'active' | 'invited' | 'inactive';
  joinedDate?: string;
}

export interface CategoryInfo {
  id: string;
  name: StoryCategory | string;
  slug: string;
  description: string;
  color?: string;
  icon?: string;
  bookCount?: number;
  isFeatured?: boolean;
  order?: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type?: 'release' | 'promo' | 'system' | 'update' | 'banner';
  targetAudience?: 'all' | 'premium' | 'new_users' | 'free_users' | 'paid_users';
  status?: 'sent' | 'scheduled' | 'draft';
  isActive?: boolean;
  sentAt?: string;
  audienceCount?: number;
  linkText?: string;
  linkUrl?: string;
  linkAction?: string;
}

export interface PriceHistoryRecord {
  id: string;
  storyId: string;
  storyTitle: string;
  oldPriceNGN: number;
  newPriceNGN: number;
  oldPriceUSD: number;
  newPriceUSD: number;
  wasFree: boolean;
  isFree: boolean;
  changedBy: string;
  reason?: string;
  timestamp: string;
}

export interface CustomerPurchaseRecord {
  id: string;
  transactionReference: string;
  userEmail: string;
  customerName: string;
  storyId: string;
  storyTitle: string;
  amountNGN: number;
  amountUSD?: number;
  channel: string;
  purchasedAt: string;
  status: 'active' | 'revoked' | 'refunded';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail?: string;
  userEmail?: string;
  adminRole?: AdminRole;
  action: string;
  category?: 'book' | 'chapter' | 'price' | 'user' | 'payment' | 'announcement' | 'settings' | 'security';
  target?: string;
  targetTitle?: string;
  details: string;
  status?: 'success' | 'warning' | 'error';
  ipAddress?: string;
}

export interface PlatformSettings {
  platformName?: string;
  supportEmail?: string;
  freeStoriesCount?: number;
  freeBooksThreshold?: number; // default: 2
  defaultCurrency?: 'NGN' | 'USD' | 'GHS' | 'KES' | string;
  currency?: string;
  defaultPriceNGN?: number;
  ngnToUsdRate?: number;
  paystackPublicKey?: string;
  paystackSecretKeyMasked?: string;
  isLiveMode?: boolean;
  maintenanceMode?: boolean;
  maintenanceNotice?: string;
  allowGuestPreview?: boolean;
  requireAuthForFreeBooks?: boolean;
  enableTextSelectionPrevention?: boolean;
  allowReaderReviews?: boolean;
}

export interface StoryAnalytics {
  storyId: string;
  storyTitle: string;
  totalViews: number;
  totalReads: number;
  completionRate: number;
  averageReadingTimeMinutes: number;
  revenueNGN: number;
  chapterDropoff?: { chapterOrder: number; chapterTitle: string; completionRate: number; readerCount: number }[];
  dropoffByChapter?: { chapterOrder: number; chapterTitle: string; dropoffPercentage: number }[];
}

export type ReaderFontFamily = 'serif' | 'sans' | 'mono';
export type ReaderFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type ReaderTheme = 'paper' | 'sepia' | 'parchment' | 'night' | 'oled';

export interface ReaderSettings {
  fontFamily: ReaderFontFamily;
  fontSize: ReaderFontSize;
  lineHeight: 'normal' | 'relaxed' | 'loose';
  theme: ReaderTheme;
  maxWidth: 'narrow' | 'normal' | 'wide';
}

