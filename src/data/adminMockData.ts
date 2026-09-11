import { Author, CategoryInfo, UserProfile, PaystackTransaction, Announcement, AuditLog, PlatformSettings, StoryAnalytics } from '../types';

export const INITIAL_AUTHORS: Author[] = [
  {
    id: 'auth-jephthah-ozero',
    name: 'Jephthah Ozero',
    bio: 'Acclaimed Nigerian poet, satirist, and essayist known for searing political allegories, visceral social critiques, and soulful memoirs of African musical heritage.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    nationality: 'Nigerian',
    primaryGenre: 'Political Satire',
    bookIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will',
      'story-4-lets-pray-for-cameroon',
      'story-5-retired-general-bonzai',
      'story-6-the-ugly-owl'
    ],
    totalReads: 32450,
    totalRevenueNGN: 685000,
    awards: ['Pan-African Verse Prize', 'National Satirist Guild Award', 'Writers of the Delta Fellowship'],
    status: 'active',
    joinedDate: '2023-09-01',
  }
];

export const INITIAL_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-political-satire',
    name: 'Political Satire',
    slug: 'political-satire',
    description: 'Biting verses, legislative exposés, and searing dissections of governance.',
    color: '#ef4444',
    bookCount: 3,
    isFeatured: true,
    order: 1,
  },
  {
    id: 'cat-memoir',
    name: 'Memoir',
    slug: 'memoir',
    description: 'Intimate recollections of childhood, family, and timeless musical roots.',
    color: '#f59e0b',
    bookCount: 1,
    isFeatured: true,
    order: 2,
  },
  {
    id: 'cat-historical',
    name: 'Historical',
    slug: 'historical',
    description: 'Portraits of autocratic eras, military governance, and enduring civic struggles.',
    color: '#0284c7',
    bookCount: 1,
    isFeatured: true,
    order: 3,
  },
  {
    id: 'cat-folklore',
    name: 'Folklore',
    slug: 'folklore',
    description: 'Allegories, fables, and symbolic tales of power and resistance.',
    color: '#d97706',
    bookCount: 1,
    isFeatured: true,
    order: 4,
  }
];

export const INITIAL_ADMIN_USERS: UserProfile[] = [
  {
    id: 'usr-admin-ozero',
    email: 'Ozerojephtah0@gmail.com',
    fullName: 'Jephthah Ozero',
    displayName: 'Jephthah Ozero (Super Admin)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'super_admin',
    status: 'active',
    unlockedStoryIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will',
      'story-4-lets-pray-for-cameroon',
      'story-5-retired-general-bonzai',
      'story-6-the-ugly-owl'
    ],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 840,
    createdAt: '2024-01-01T08:00:00Z',
    lastActiveAt: 'Just now',
  },
  {
    id: 'usr-admin-1',
    email: 'admin@novella.app',
    fullName: 'Novella System Administrator',
    displayName: 'Super Admin - Novella HQ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'super_admin',
    status: 'active',
    unlockedStoryIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will',
      'story-4-lets-pray-for-cameroon',
      'story-5-retired-general-bonzai',
      'story-6-the-ugly-owl'
    ],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 480,
    createdAt: '2024-01-01T08:00:00Z',
    lastActiveAt: 'Just now',
  },
  {
    id: 'usr-reader-1',
    email: 'reader.chidi@example.com',
    displayName: 'Chidi Anozie',
    role: 'user',
    status: 'active',
    unlockedStoryIds: ['story-1-anatomy-of-the-dead', 'story-2-five-spirits-from-the-east', 'story-3-gods-will'],
    bookmarks: [{
      id: 'bm-101',
      storyId: 'story-3-gods-will',
      chapterId: 'ch-3-1',
      chapterOrder: 1,
      chapterTitle: "God's Will",
      paragraphIndex: 2,
      note: 'Sharp social commentary on political greed.',
      createdAt: '2024-03-01T12:00:00Z'
    }],
    readingProgress: {
      'story-3-gods-will': {
        storyId: 'story-3-gods-will',
        currentChapterId: 'ch-3-1',
        currentChapterOrder: 1,
        percentage: 100,
        lastReadAt: '2024-03-10T19:40:00Z'
      }
    },
    totalReadingMinutes: 245,
    createdAt: '2024-02-10T09:15:00Z',
    lastActiveAt: '3 hours ago',
  },
  {
    id: 'usr-reader-2',
    email: 'zainab.k@example.com',
    displayName: 'Zainab Kabir',
    role: 'user',
    status: 'active',
    unlockedStoryIds: ['story-1-anatomy-of-the-dead', 'story-2-five-spirits-from-the-east', 'story-6-the-ugly-owl'],
    bookmarks: [],
    readingProgress: {
      'story-6-the-ugly-owl': {
        storyId: 'story-6-the-ugly-owl',
        currentChapterId: 'ch-6-1',
        currentChapterOrder: 1,
        percentage: 80,
        lastReadAt: '2024-03-11T08:20:00Z'
      }
    },
    totalReadingMinutes: 190,
    createdAt: '2024-02-14T11:45:00Z',
    lastActiveAt: 'Yesterday',
  }
];

export const INITIAL_EXTENDED_TRANSACTIONS: PaystackTransaction[] = [
  {
    id: 'tx-1001',
    reference: 'PSTK_LIVE_98124',
    storyId: 'story-3-gods-will',
    storyTitle: "God's Will",
    userEmail: 'reader.chidi@example.com',
    customerName: 'Chidi Anozie',
    amountNGN: 2000,
    amountUSD: 1.38,
    status: 'success',
    channel: 'card',
    gatewayResponse: 'Approved by Issuing Bank',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    refunded: false,
  },
  {
    id: 'tx-1002',
    reference: 'PSTK_LIVE_98125',
    storyId: 'story-6-the-ugly-owl',
    storyTitle: 'The Ugly Owl',
    userEmail: 'zainab.k@example.com',
    customerName: 'Zainab Kabir',
    amountNGN: 2500,
    amountUSD: 1.72,
    status: 'success',
    channel: 'bank_transfer',
    gatewayResponse: 'Direct Bank Settlement Received',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    refunded: false,
  },
  {
    id: 'tx-1003',
    reference: 'PSTK_LIVE_98126',
    storyId: 'story-4-lets-pray-for-cameroon',
    storyTitle: "Let's Pray for Cameroon",
    userEmail: 'kwame.owusu@example.gh',
    customerName: 'Kwame Owusu',
    amountNGN: 2200,
    amountUSD: 1.52,
    status: 'success',
    channel: 'apple_pay',
    gatewayResponse: 'Biometric Card Authorization Success',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    refunded: false,
  },
  {
    id: 'tx-1004',
    reference: 'PSTK_LIVE_98127',
    storyId: 'story-5-retired-general-bonzai',
    storyTitle: 'Retired General Bonza(i)',
    userEmail: 'olumide.ade@test.ng',
    customerName: 'Olumide Ade',
    amountNGN: 2500,
    amountUSD: 1.72,
    status: 'pending',
    channel: 'ussd',
    gatewayResponse: 'Awaiting Bank USSD OTP Completion',
    paidAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    refunded: false,
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'New Poetry Release: "Anatomy of the Dead" by Jephthah Ozero',
    message: 'Read the groundbreaking political and social critique now available in the library! Volumes 1 & 2 are free for all readers.',
    type: 'release',
    targetAudience: 'all',
    status: 'sent',
    sentAt: '2024-03-08T10:00:00Z',
    audienceCount: 1420,
    linkAction: 'story-1-anatomy-of-the-dead'
  },
  {
    id: 'ann-2',
    title: 'New Memoir: "Five Spirits From The East"',
    message: 'Journey into the immortal rhythms and nostalgic highlife memories of the Oriental Brothers International.',
    type: 'release',
    targetAudience: 'all',
    status: 'sent',
    sentAt: '2024-03-10T14:30:00Z',
    audienceCount: 1560,
    linkAction: 'story-2-five-spirits-from-the-east'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    adminEmail: 'Ozerojephtah0@gmail.com',
    adminRole: 'super_admin',
    action: 'Story Catalog Initialized',
    category: 'book',
    target: 'Jephthah Ozero Story Collection',
    details: 'Published 6 complete story books with custom designed covers.',
    status: 'success',
    ipAddress: '102.89.44.12'
  }
];

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'Novella',
  supportEmail: 'support@novella.app',
  freeBooksThreshold: 2,
  defaultCurrency: 'NGN',
  ngnToUsdRate: 1450,
  paystackPublicKey: 'pk_live_891f7a0c8b67123490abcde8910',
  paystackSecretKeyMasked: 'sk_live_••••••••••••••••••••94f2',
  isLiveMode: true,
  maintenanceMode: false,
  maintenanceNotice: 'Novella is currently performing routine upgrades. Please check back shortly.',
  allowGuestPreview: true,
  requireAuthForFreeBooks: false,
};

export const INITIAL_STORY_ANALYTICS: StoryAnalytics[] = [
  {
    storyId: 'story-1-anatomy-of-the-dead',
    storyTitle: 'Anatomy of the Dead',
    totalViews: 14200,
    totalReads: 11820,
    completionRate: 92,
    averageReadingTimeMinutes: 6,
    revenueNGN: 0,
    dropoffByChapter: [
      { chapterOrder: 1, chapterTitle: 'Anatomy of the Dead', dropoffPercentage: 4 }
    ]
  },
  {
    storyId: 'story-2-five-spirits-from-the-east',
    storyTitle: 'Five Spirits From The East',
    totalViews: 12100,
    totalReads: 9850,
    completionRate: 94,
    averageReadingTimeMinutes: 8,
    revenueNGN: 0,
    dropoffByChapter: [
      { chapterOrder: 1, chapterTitle: 'Five Spirits From The East', dropoffPercentage: 3 }
    ]
  },
  {
    storyId: 'story-3-gods-will',
    storyTitle: "God's Will",
    totalViews: 8500,
    totalReads: 6420,
    completionRate: 89,
    averageReadingTimeMinutes: 5,
    revenueNGN: 280000,
    dropoffByChapter: [
      { chapterOrder: 1, chapterTitle: "God's Will", dropoffPercentage: 5 }
    ]
  },
  {
    storyId: 'story-4-lets-pray-for-cameroon',
    storyTitle: "Let's Pray for Cameroon",
    totalViews: 7200,
    totalReads: 5190,
    completionRate: 86,
    averageReadingTimeMinutes: 6,
    revenueNGN: 210000,
    dropoffByChapter: [
      { chapterOrder: 1, chapterTitle: "Let's Pray for Cameroon", dropoffPercentage: 6 }
    ]
  },
  {
    storyId: 'story-5-retired-general-bonzai',
    storyTitle: 'Retired General Bonza(i)',
    totalViews: 6800,
    totalReads: 4940,
    completionRate: 85,
    averageReadingTimeMinutes: 5,
    revenueNGN: 195000,
    dropoffByChapter: [
      { chapterOrder: 1, chapterTitle: 'Retired General Bonza(i)', dropoffPercentage: 7 }
    ]
  },
  {
    storyId: 'story-6-the-ugly-owl',
    storyTitle: 'The Ugly Owl',
    totalViews: 9800,
    totalReads: 7340,
    completionRate: 91,
    averageReadingTimeMinutes: 7,
    revenueNGN: 265000,
    dropoffByChapter: [
      { chapterOrder: 1, chapterTitle: 'The Ugly Owl', dropoffPercentage: 4 }
    ]
  }
];
