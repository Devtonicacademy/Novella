export interface StoryChoice {
  id: string;
  choiceText: string;
  nextChapterId: string;
  description?: string;
  badge?: string;
  consequencesPreview?: string;
}

export interface Chapter {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  readMinutes: number;
  content: string;
  status?: 'published' | 'draft' | 'scheduled';
  scheduledPublishDate?: string;
  isPremium?: boolean;
  choices?: StoryChoice[];
  updatedAt?: string;
}

export type StoryCategory = 
  | 'Adventure'
  | 'Romance'
  | 'Mystery'
  | 'Horror'
  | 'Comedy'
  | 'Fantasy'
  | 'African Stories'
  | 'Moral Stories'
  | 'School Stories'
  | 'Political Satire'
  | 'Poetry & Satire'
  | 'Contemporary Verse'
  | 'Folklore' 
  | 'Historical' 
  | 'Sci-Fi & Fantasy' 
  | 'Mystery & Thriller' 
  | 'Afrofuturism' 
  | 'Memoir'
  | 'Mythology'
  | string;

export interface Story {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authorId?: string;
  authorBio?: string;
  authorAvatar?: string;
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
  ratingsCount?: number;
  reviewCount: number;
  ratingBreakdown?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalChapters: number;
  readTime: string;
  tags: string[];
  publishedYear: number;
  status?: 'published' | 'draft' | 'scheduled' | 'archived';
  scheduledPublishDate?: string;
  featured?: boolean;
  isInteractive?: boolean; // Branching story choices
  favoritesCount?: number;
  likesCount?: number;
  viewsCount?: number;
  weeklyEngagementScore?: number;
  isFavorite?: boolean;
  isLiked?: boolean;
  isOfflineAvailable?: boolean;
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
  totalMinutesSpent?: number;
  choiceHistory?: { chapterId: string; choiceId: string }[];
}

export type UserRole = 'customer' | 'author' | 'admin' | 'super_admin' | 'content_admin' | 'support_admin' | 'finance_admin' | 'user';
export type AdminRole = UserRole;

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakHistory: string[]; // list of dates
}

export interface ReadingGoals {
  storiesMonthlyTarget: number;
  storiesReadThisMonth: number;
  chaptersWeeklyTarget: number;
  chaptersReadThisWeek: number;
  minutesDailyTarget: number;
  minutesReadToday: number;
  lastResetDate?: string;
}

export interface StoryCollection {
  id: string;
  name: string;
  description?: string;
  storyIds: string[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReaderAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'reading' | 'streak' | 'social' | 'explorer';
  targetCount: number;
  currentCount: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ActivityFeedItem {
  id: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  actorName?: string;
  actorAvatar?: string;
  type: 'new_story' | 'new_chapter' | 'announcement' | 'milestone' | 'chapter_release' | 'streak_milestone' | 'story_review' | 'author_announcement' | string;
  title?: string;
  storyTitle?: string;
  description?: string;
  content?: string;
  storyId?: string;
  chapterId?: string;
  createdAt?: string;
  timestamp?: string;
  likes?: number;
  likesCount?: number;
  isLiked?: boolean;
  likedBy?: string[];
}

export interface AICharacterProfile {
  name: string;
  alias?: string;
  archetype: string;
  role: string;
  personality?: string[];
  background?: string;
  backstory?: string;
  motivation?: string;
  flaw?: string;
  secret?: string;
  internalConflict?: string;
  catchphrase?: string;
  goals?: {
    internal: string;
    external: string;
  };
  strengths?: string[];
  weaknesses?: string[];
  voiceAndDialogue?: string;
  keyRelationships?: string;
}

export interface AIStoryIdea {
  title: string;
  logline?: string;
  premise: string;
  theme?: string;
  genre?: string;
  setting?: string;
  protagonist?: string;
  antagonist?: string;
  keyConflicts?: string[];
  keyCharacters?: string[];
  majorPlotPoints?: string[];
  plotTwist?: string;
  twist?: string;
  chapterOutline?: string[];
}

export interface AITitleSuggestion {
  title: string;
  subtitle?: string;
  tagline?: string;
  hook?: string;
  tone?: string;
  category?: string;
  genre?: string;
}

export interface StoryTranslation {
  languageCode: string;
  languageName: string;
  translatedTitle: string;
  translatedSubtitle?: string;
  translatedDescription: string;
  translatedChapters: {
    chapterId: string;
    title: string;
    content: string;
  }[];
}

export interface RecentlyViewedItem {
  storyId: string;
  viewedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  unlockedStoryIds: string[];
  favoriteStoryIds?: string[];
  likedStoryIds?: string[];
  followingAuthorIds?: string[];
  followersCount?: number;
  followingUserIds?: string[];
  collections?: StoryCollection[];
  readingStreak?: ReadingStreak;
  readingGoals?: ReadingGoals;
  achievements?: ReaderAchievement[];
  recentlyViewed?: RecentlyViewedItem[];
  recentlyViewedStoryIds?: string[];
  readerPreferences?: ReaderSettings;
  bookmarks: UserBookmark[];
  readingProgress: Record<string, ReadingProgress>; // keyed by storyId
  role: UserRole;
  status?: 'active' | 'suspended' | 'pending';
  suspendedReason?: string;
  suspendedUntil?: string;
  totalReadingMinutes?: number;
  booksCompletedCount?: number;
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
  resetToken?: string;
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
  bannerImage?: string;
  country?: string;
  nationality?: string;
  primaryGenre?: StoryCategory;
  bookIds?: string[];
  totalStories?: number;
  totalReads?: number;
  totalRevenueNGN?: number;
  followersCount?: number;
  averageRating?: number;
  featured?: boolean;
  socialLinks?: Record<string, string>;
  awards?: string[];
  status?: 'active' | 'invited' | 'inactive';
  joinedDate?: string;
  verified?: boolean;
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

export interface Review {
  id: string;
  storyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  title: string;
  content: string;
  hasSpoilers?: boolean;
  likes: number;
  likedBy?: string[];
  createdAt: string;
  updatedAt?: string;
  status?: 'approved' | 'pending' | 'flagged';
}

export interface UserStoryRating {
  id: string;
  storyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  rating: number; // 1 to 5
  title?: string;
  content?: string;
  hasSpoilers?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryRatingSummary {
  storyId: string;
  averageRating: number;
  ratingsCount: number;
  reviewCount: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  userRating?: number;
  userReview?: Review;
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  content: string;
  likes: number;
  likedBy?: string[];
  createdAt: string;
  isAuthor?: boolean;
}

export interface Comment {
  id: string;
  storyId: string;
  chapterId?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  content: string;
  likes: number;
  likedBy?: string[];
  replies?: CommentReply[];
  createdAt: string;
  isAuthor?: boolean;
  isPinned?: boolean;
  status?: 'approved' | 'flagged' | 'hidden';
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'new_chapter' | 'new_story' | 'comment' | 'review' | 'author_update' | 'system' | 'purchase' | 'earnings';
  storyId?: string;
  chapterId?: string;
  authorId?: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
  avatar?: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterEmail: string;
  reporterName: string;
  targetType: 'story' | 'chapter' | 'comment' | 'author' | 'review';
  targetId: string;
  targetTitle?: string;
  reason: 'inappropriate' | 'copyright' | 'spam' | 'harassment' | 'offensive' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  resolutionNotes?: string;
  resolvedBy?: string;
}

export interface PayoutRecord {
  id: string;
  amountNGN: number;
  status: 'completed' | 'pending' | 'processing';
  requestedAt: string;
  paidAt?: string;
  bankDetails?: string;
}

export interface AuthorEarnings {
  authorId: string;
  authorName: string;
  totalRevenueNGN: number;
  authorSplitNGN: number; // e.g. 70%
  platformCommissionNGN: number; // e.g. 30%
  pendingPayoutNGN: number;
  paidPayoutNGN: number;
  totalSalesCount: number;
  payoutHistory: PayoutRecord[];
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
  category?: 'book' | 'chapter' | 'price' | 'user' | 'payment' | 'announcement' | 'settings' | 'security' | 'moderation' | 'ai';
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
  authorRevenueSharePercentage?: number; // default: 70
  paystackPublicKey?: string;
  paystackSecretKeyMasked?: string;
  isLiveMode?: boolean;
  maintenanceMode?: boolean;
  maintenanceNotice?: string;
  allowGuestPreview?: boolean;
  requireAuthForFreeBooks?: boolean;
  enableTextSelectionPrevention?: boolean;
  allowReaderReviews?: boolean;
  enableAiStoryGenerator?: boolean;
  enableInteractiveStories?: boolean;
  enableSpeechSynthesis?: boolean;
  blockedWords?: string[];
  autoFilterProfanity?: boolean;
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

export type ReaderFontFamily = 'serif' | 'sans' | 'mono' | 'dyslexic';
export type ReaderFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type ReaderTheme = 'paper' | 'sepia' | 'parchment' | 'night' | 'oled';

export interface ReaderSettings {
  fontFamily: ReaderFontFamily;
  fontSize: ReaderFontSize;
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
  theme: ReaderTheme;
  maxWidth: 'narrow' | 'normal' | 'wide' | 'full';
}

export interface AIGenerateStoryRequest {
  prompt: string;
  genre: StoryCategory;
  characters?: string;
  setting?: string;
  theme?: string;
  length?: 'short' | 'medium' | 'epic';
  chaptersCount?: number;
  interactive?: boolean;
  tone?: string;
}
