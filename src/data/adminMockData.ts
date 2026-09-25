import {
  Author,
  CategoryInfo,
  UserProfile,
  PaystackTransaction,
  Announcement,
  AuditLog,
  PlatformSettings,
  StoryAnalytics,
  Review,
  Comment,
  AppNotification,
  ContentReport,
  AuthorEarnings
} from '../types';

export const INITIAL_AUTHORS: Author[] = [
  {
    id: 'auth-jephthah-ozero',
    name: 'Jephthah Ozero',
    bio: 'Acclaimed Nigerian poet, satirist, and essayist known for searing political allegories, visceral social critiques, and soulful memoirs of African musical heritage.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&auto=format&fit=crop&q=80',
    nationality: 'Nigerian',
    country: 'Nigeria',
    primaryGenre: 'Political Satire',
    bookIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will',
      'story-4-lets-pray-for-cameroon',
      'story-5-retired-general-bonzai',
      'story-6-the-ugly-owl'
    ],
    totalStories: 6,
    totalReads: 32450,
    totalRevenueNGN: 685000,
    followersCount: 1420,
    averageRating: 4.9,
    awards: ['Pan-African Verse Prize', 'National Satirist Guild Award', 'Writers of the Delta Fellowship'],
    status: 'active',
    joinedDate: '2023-09-01',
    verified: true,
    featured: true,
    socialLinks: {
      twitter: 'https://twitter.com/ozero_verse',
      instagram: 'https://instagram.com/jephthah_novella'
    }
  },
  {
    id: 'auth-amara-nwosu',
    name: 'Amara Nwosu',
    bio: 'Novelist and folklorist celebrating West African magical realism, moral fables, and romantic tales of modern Lagos and ancient kingdoms.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    nationality: 'Nigerian',
    country: 'Nigeria',
    primaryGenre: 'African Stories',
    bookIds: ['story-7-echoes-of-the-savanna', 'story-8-the-secret-of-zuma-rock'],
    totalStories: 2,
    totalReads: 18900,
    totalRevenueNGN: 320000,
    followersCount: 980,
    averageRating: 4.8,
    awards: ['African Voices Fiction Honor', 'Lagos Literary Circle Trophy'],
    status: 'active',
    joinedDate: '2024-01-15',
    verified: true,
    featured: true
  },
  {
    id: 'auth-kwame-boateng',
    name: 'Kwame Boateng',
    bio: 'Fantasy author, high school educator, and interactive narrative designer exploring youth adventure and moral quandaries in contemporary Africa.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    nationality: 'Ghanaian',
    country: 'Ghana',
    primaryGenre: 'School Stories',
    bookIds: ['story-9-trials-of-st-augustines', 'story-10-the-whispering-forest'],
    totalStories: 2,
    totalReads: 14200,
    totalRevenueNGN: 190000,
    followersCount: 750,
    averageRating: 4.7,
    awards: ['Gold Coast Youth Literature Award'],
    status: 'active',
    joinedDate: '2024-02-10',
    verified: true,
    featured: false
  }
];

export const INITIAL_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-african-stories',
    name: 'African Stories',
    slug: 'african-stories',
    description: 'Vibrant narratives rooted in African heritage, modern realities, oral traditions, and folklore.',
    color: '#d97706',
    icon: 'Globe',
    bookCount: 4,
    isFeatured: true,
    order: 1
  },
  {
    id: 'cat-adventure',
    name: 'Adventure',
    slug: 'adventure',
    description: 'High-stakes journeys, uncharted wilderness expeditions, and daring quests.',
    color: '#059669',
    icon: 'Compass',
    bookCount: 3,
    isFeatured: true,
    order: 2
  },
  {
    id: 'cat-moral-stories',
    name: 'Moral Stories',
    slug: 'moral-stories',
    description: 'Insightful parables and fables teaching timeless values of integrity, wisdom, and courage.',
    color: '#8b5cf6',
    icon: 'Sparkles',
    bookCount: 3,
    isFeatured: true,
    order: 3
  },
  {
    id: 'cat-school-stories',
    name: 'School Stories',
    slug: 'school-stories',
    description: 'Rivalries, academic triumphs, secret societies, and friendships in boarding schools and universities.',
    color: '#2563eb',
    icon: 'GraduationCap',
    bookCount: 2,
    isFeatured: true,
    order: 4
  },
  {
    id: 'cat-romance',
    name: 'Romance',
    slug: 'romance',
    description: 'Heartfelt emotional connections, poignant bonds, and contemporary love stories.',
    color: '#ec4899',
    icon: 'Heart',
    bookCount: 2,
    isFeatured: true,
    order: 5
  },
  {
    id: 'cat-mystery',
    name: 'Mystery',
    slug: 'mystery',
    description: 'Enigmatic disappearances, detective investigations, and shocking twists.',
    color: '#6366f1',
    icon: 'Search',
    bookCount: 2,
    isFeatured: true,
    order: 6
  },
  {
    id: 'cat-horror',
    name: 'Horror',
    slug: 'horror',
    description: 'Supernatural chillers, dark ancestral omens, and psychological suspense.',
    color: '#dc2626',
    icon: 'Ghost',
    bookCount: 2,
    isFeatured: true,
    order: 7
  },
  {
    id: 'cat-comedy',
    name: 'Comedy',
    slug: 'comedy',
    description: 'Hilarious misadventures, witty banter, and lively satire.',
    color: '#eab308',
    icon: 'Laugh',
    bookCount: 2,
    isFeatured: true,
    order: 8
  },
  {
    id: 'cat-fantasy',
    name: 'Fantasy',
    slug: 'fantasy',
    description: 'Epic world-building, mythological realms, sorcery, and afrofuturist visions.',
    color: '#9333ea',
    icon: 'Flame',
    bookCount: 2,
    isFeatured: true,
    order: 9
  },
  {
    id: 'cat-political-satire',
    name: 'Political Satire',
    slug: 'political-satire',
    description: 'Biting verses, legislative exposés, and searing dissections of governance.',
    color: '#ef4444',
    icon: 'Flame',
    bookCount: 4,
    isFeatured: true,
    order: 10
  },
  {
    id: 'cat-folklore',
    name: 'Folklore',
    slug: 'folklore',
    description: 'Allegories, fables, and symbolic tales of power and resistance.',
    color: '#d97706',
    icon: 'BookOpen',
    bookCount: 2,
    isFeatured: false,
    order: 11
  },
  {
    id: 'cat-memoir',
    name: 'Memoir',
    slug: 'memoir',
    description: 'Intimate recollections of childhood, family, and timeless musical roots.',
    color: '#f59e0b',
    icon: 'Feather',
    bookCount: 1,
    isFeatured: false,
    order: 12
  },
  {
    id: 'cat-historical',
    name: 'Historical',
    slug: 'historical',
    description: 'Portraits of autocratic eras, military governance, and enduring civic struggles.',
    color: '#0284c7',
    icon: 'Landmark',
    bookCount: 1,
    isFeatured: false,
    order: 13
  }
];

export const INITIAL_ADMIN_USERS: UserProfile[] = [
  {
    id: 'usr-admin-novella',
    email: 'admin@novella.app',
    fullName: 'Novella System Admin',
    displayName: 'Novella Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Platform System Administrator & Managing Editor.',
    role: 'super_admin',
    status: 'active',
    unlockedStoryIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will',
      'story-4-lets-pray-for-cameroon',
      'story-5-retired-general-bonzai',
      'story-6-the-ugly-owl',
      'story-7-echoes-of-the-savanna',
      'story-8-the-secret-of-zuma-rock',
      'story-9-trials-of-st-augustines',
      'story-10-the-whispering-forest'
    ],
    favoriteStoryIds: ['story-1-anatomy-of-the-dead', 'story-2-five-spirits-from-the-east'],
    followingAuthorIds: ['auth-jephthah-ozero', 'auth-amara-nwosu', 'auth-kwame-boateng'],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 2400,
    booksCompletedCount: 10,
    createdAt: '2024-01-01T08:00:00Z',
    lastActiveAt: 'Just now'
  },
  {
    id: 'usr-admin-staff',
    email: 'staff.admin@novella.app',
    fullName: 'Platform Operations Admin',
    displayName: 'Staff Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Platform Operations & Editorial Administrator.',
    role: 'admin',
    status: 'active',
    unlockedStoryIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will',
      'story-4-lets-pray-for-cameroon',
      'story-5-retired-general-bonzai',
      'story-6-the-ugly-owl',
      'story-7-echoes-of-the-savanna',
      'story-8-the-secret-of-zuma-rock',
      'story-9-trials-of-st-augustines',
      'story-10-the-whispering-forest'
    ],
    favoriteStoryIds: [],
    followingAuthorIds: [],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 890,
    booksCompletedCount: 5,
    createdAt: '2024-01-10T08:00:00Z',
    lastActiveAt: '1 hour ago'
  },
  {
    id: 'usr-admin-devtonic',
    email: 'devtonicllc@gmail.com',
    fullName: 'Devtonic Admin',
    displayName: 'Devtonic Admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Platform Administrator & Technical Operations.',
    role: 'super_admin',
    status: 'active',
    unlockedStoryIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will',
      'story-4-lets-pray-for-cameroon',
      'story-5-retired-general-bonzai',
      'story-6-the-ugly-owl',
      'story-7-echoes-of-the-savanna',
      'story-8-the-secret-of-zuma-rock',
      'story-9-trials-of-st-augustines',
      'story-10-the-whispering-forest'
    ],
    favoriteStoryIds: ['story-1-anatomy-of-the-dead', 'story-2-five-spirits-from-the-east', 'story-10-the-whispering-forest'],
    followingAuthorIds: ['auth-jephthah-ozero', 'auth-amara-nwosu', 'auth-kwame-boateng'],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 1200,
    booksCompletedCount: 10,
    createdAt: '2024-01-01T08:00:00Z',
    lastActiveAt: 'Just now'
  },
  {
    id: 'usr-admin-ozero',
    email: 'ozerojephtah0@gmail.com',
    fullName: 'Jephthah Ozero',
    displayName: 'Jephthah Ozero',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Author & Super Administrator of Novella.',
    role: 'super_admin',
    status: 'active',
    unlockedStoryIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will',
      'story-4-lets-pray-for-cameroon',
      'story-5-retired-general-bonzai',
      'story-6-the-ugly-owl',
      'story-7-echoes-of-the-savanna',
      'story-8-the-secret-of-zuma-rock',
      'story-9-trials-of-st-augustines',
      'story-10-the-whispering-forest'
    ],
    favoriteStoryIds: ['story-1-anatomy-of-the-dead', 'story-2-five-spirits-from-the-east', 'story-10-the-whispering-forest'],
    followingAuthorIds: ['auth-jephthah-ozero', 'auth-amara-nwosu', 'auth-kwame-boateng'],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 840,
    booksCompletedCount: 6,
    createdAt: '2024-01-01T08:00:00Z',
    lastActiveAt: 'Just now'
  },
  {
    id: 'usr-author-amara',
    email: 'amara.nwosu@novella.app',
    fullName: 'Amara Nwosu',
    displayName: 'Amara Nwosu (Author)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Contemporary fiction writer exploring African mythology and romance.',
    role: 'author',
    status: 'active',
    unlockedStoryIds: ['story-1-anatomy-of-the-dead', 'story-2-five-spirits-from-the-east', 'story-7-echoes-of-the-savanna'],
    favoriteStoryIds: ['story-2-five-spirits-from-the-east'],
    followingAuthorIds: ['auth-jephthah-ozero'],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 450,
    booksCompletedCount: 3,
    createdAt: '2024-01-15T08:00:00Z',
    lastActiveAt: '2 hours ago'
  },
  {
    id: 'usr-reader-chidi',
    email: 'customer@novella.app',
    fullName: 'Amara Okafor',
    displayName: 'Amara Okafor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Avid reader and lover of African folklore & satire.',
    role: 'customer',
    status: 'active',
    unlockedStoryIds: [
      'story-1-anatomy-of-the-dead',
      'story-2-five-spirits-from-the-east',
      'story-3-gods-will'
    ],
    favoriteStoryIds: ['story-3-gods-will', 'story-2-five-spirits-from-the-east'],
    followingAuthorIds: ['auth-jephthah-ozero'],
    bookmarks: [
      {
        id: 'bm-seed-1',
        storyId: 'story-3-gods-will',
        chapterId: 'ch-3-1',
        chapterOrder: 1,
        chapterTitle: "God's Will",
        paragraphIndex: 1,
        note: 'Profound and rhythmic social verse!',
        createdAt: '2024-03-10T14:30:00Z'
      }
    ],
    readingProgress: {
      'story-1-anatomy-of-the-dead': {
        storyId: 'story-1-anatomy-of-the-dead',
        currentChapterId: 'ch-1-1',
        currentChapterOrder: 1,
        percentage: 100,
        lastReadAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        totalMinutesSpent: 6
      },
      'story-3-gods-will': {
        storyId: 'story-3-gods-will',
        currentChapterId: 'ch-3-1',
        currentChapterOrder: 1,
        percentage: 65,
        lastReadAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        totalMinutesSpent: 4
      },
      'story-10-the-whispering-forest': {
        storyId: 'story-10-the-whispering-forest',
        currentChapterId: 'ch-10-1',
        currentChapterOrder: 1,
        percentage: 45,
        lastReadAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        totalMinutesSpent: 8
      }
    },
    totalReadingMinutes: 125,
    booksCompletedCount: 1,
    createdAt: '2024-02-01T08:00:00Z',
    lastActiveAt: '10 minutes ago'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    storyId: 'story-1-anatomy-of-the-dead',
    userId: 'usr-reader-chidi',
    userEmail: 'customer@novella.app',
    userName: 'Amara Okafor',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'An electrifying poetic masterpiece!',
    content: 'Ozero dissects political hypocrisy with astonishing linguistic precision. The imagery of the "living dead" reverberates with undeniable truth.',
    likes: 24,
    likedBy: ['usr-admin-ozero'],
    createdAt: '2024-03-01T10:00:00Z',
    status: 'approved'
  },
  {
    id: 'rev-2',
    storyId: 'story-2-five-spirits-from-the-east',
    userId: 'usr-reader-chidi',
    userEmail: 'customer@novella.app',
    userName: 'Amara Okafor',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Brought tears to my eyes',
    content: 'The tribute to the Oriental Brothers and the bond between father and son is pure literary gold. A must-read memoir.',
    likes: 38,
    likedBy: ['usr-admin-ozero'],
    createdAt: '2024-03-05T12:00:00Z',
    status: 'approved'
  },
  {
    id: 'rev-3',
    storyId: 'story-10-the-whispering-forest',
    userId: 'usr-reader-chidi',
    userEmail: 'customer@novella.app',
    userName: 'Tunde Bakare',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'The branching choices made me feel like I was there!',
    content: 'Incredible interactive storytelling. Every decision feels weighty and the atmospheric tension is top notch.',
    likes: 19,
    likedBy: [],
    createdAt: '2024-03-08T15:30:00Z',
    status: 'approved'
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    storyId: 'story-1-anatomy-of-the-dead',
    chapterId: 'ch-1-1',
    userId: 'usr-reader-chidi',
    userEmail: 'customer@novella.app',
    userName: 'Amara Okafor',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    userRole: 'customer',
    content: '"Fools who suffered the police to get away with impunity and gratuitous graft..." This stanza gave me chills. So accurate to our reality.',
    likes: 15,
    likedBy: ['usr-admin-ozero'],
    createdAt: '2024-03-02T16:20:00Z',
    status: 'approved',
    replies: [
      {
        id: 'reply-1',
        commentId: 'comm-1',
        userId: 'usr-admin-ozero',
        userEmail: 'ozerojephtah0@gmail.com',
        userName: 'Jephthah Ozero',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        userRole: 'author',
        content: 'Thank you Amara. Literature must remain the mirror and shield of the conscience.',
        likes: 12,
        likedBy: ['usr-reader-chidi'],
        createdAt: '2024-03-02T17:00:00Z',
        isAuthor: true
      }
    ]
  },
  {
    id: 'comm-2',
    storyId: 'story-2-five-spirits-from-the-east',
    chapterId: 'ch-2-1',
    userId: 'usr-reader-chidi',
    userEmail: 'customer@novella.app',
    userName: 'Emeka Obi',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    userRole: 'customer',
    content: 'Listening to Kabaka drum oratory while reading this is an unforgettable experience.',
    likes: 8,
    likedBy: [],
    createdAt: '2024-03-06T09:15:00Z',
    status: 'approved'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New Story Release',
    message: 'Jephthah Ozero just published a new interactive adventure: "The Whispering Forest". Explore branching paths now!',
    type: 'new_story',
    storyId: 'story-10-the-whispering-forest',
    authorId: 'auth-jephthah-ozero',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'notif-2',
    title: 'Author Replied',
    message: 'Jephthah Ozero replied to your comment on "Anatomy of the Dead".',
    type: 'comment',
    storyId: 'story-1-anatomy-of-the-dead',
    chapterId: 'ch-1-1',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'notif-3',
    title: 'AI Story Generator Ready',
    message: 'Create, regenerate, and publish your own original stories with our upgraded AI Story Studio.',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const INITIAL_REPORTS: ContentReport[] = [
  {
    id: 'rep-1',
    reporterId: 'usr-reader-chidi',
    reporterEmail: 'reader.chidi@example.com',
    reporterName: 'Chidi Anozie',
    targetType: 'comment',
    targetId: 'comm-flagged-1',
    targetTitle: 'Spam link in discussion',
    reason: 'spam',
    details: 'User posted duplicate external promotional links in the comments.',
    status: 'pending',
    createdAt: '2024-03-09T11:00:00Z'
  }
];

export const INITIAL_AUTHOR_EARNINGS: AuthorEarnings = {
  authorId: 'auth-jephthah-ozero',
  authorName: 'Jephthah Ozero',
  totalRevenueNGN: 685000,
  authorSplitNGN: 479500, // 70%
  platformCommissionNGN: 205500, // 30%
  pendingPayoutNGN: 145000,
  paidPayoutNGN: 334500,
  totalSalesCount: 342,
  payoutHistory: [
    {
      id: 'pay-1',
      amountNGN: 180000,
      status: 'completed',
      requestedAt: '2024-02-01T10:00:00Z',
      paidAt: '2024-02-02T14:00:00Z',
      bankDetails: 'Access Bank •••• 4129'
    },
    {
      id: 'pay-2',
      amountNGN: 154500,
      status: 'completed',
      requestedAt: '2024-02-28T10:00:00Z',
      paidAt: '2024-03-01T11:30:00Z',
      bankDetails: 'Access Bank •••• 4129'
    },
    {
      id: 'pay-3',
      amountNGN: 145000,
      status: 'pending',
      requestedAt: '2024-03-10T08:00:00Z',
      bankDetails: 'Access Bank •••• 4129'
    }
  ]
};

export const INITIAL_EXTENDED_TRANSACTIONS: PaystackTransaction[] = [
  {
    id: 'tx-seed-1',
    reference: 'PAY_STK_REF_98124',
    storyId: 'story-3-gods-will',
    storyTitle: "God's Will",
    userEmail: 'customer@novella.app',
    customerName: 'Amara Okafor',
    amountNGN: 2000,
    amountUSD: 1.38,
    status: 'success',
    channel: 'card',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'tx-seed-2',
    reference: 'PAY_STK_REF_98125',
    storyId: 'story-6-the-ugly-owl',
    storyTitle: 'The Ugly Owl',
    userEmail: 'zainab.k@example.com',
    customerName: 'Zainab Kano',
    amountNGN: 2500,
    amountUSD: 1.72,
    status: 'success',
    channel: 'bank_transfer',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'tx-seed-3',
    reference: 'PAY_STK_REF_98126',
    storyId: 'story-5-retired-general-bonzai',
    storyTitle: 'Retired General Bonza(i)',
    userEmail: 'tunde.bakare@example.com',
    customerName: 'Tunde Bakare',
    amountNGN: 2500,
    amountUSD: 1.72,
    status: 'success',
    channel: 'card',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '✨ Welcome to the All-New Novella Storytelling Hub',
    message: 'Explore multi-chapter epics, interactive branching choices, instant AI story generation, offline reading, and voice narration!',
    type: 'release',
    targetAudience: 'all',
    status: 'sent',
    isActive: true,
    sentAt: '2024-03-01T08:00:00Z',
    audienceCount: 1420
  },
  {
    id: 'ann-2',
    title: '📚 First Two Stories Remain 100% Free Forever',
    message: 'Enjoy full access to "Anatomy of the Dead" and "Five Spirits From The East" with no credit card required.',
    type: 'promo',
    targetAudience: 'free_users',
    status: 'sent',
    isActive: true,
    sentAt: '2024-02-15T10:00:00Z',
    audienceCount: 890
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    adminEmail: 'ozerojephtah0@gmail.com',
    adminRole: 'super_admin',
    action: 'Platform Upgrade Deployed',
    category: 'settings',
    details: 'Activated multi-category catalog, AI story generation engine, and interactive storytelling.',
    status: 'success',
    ipAddress: '197.210.84.12'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    adminEmail: 'ozerojephtah0@gmail.com',
    adminRole: 'super_admin',
    action: 'Book Pricing Updated',
    category: 'price',
    details: 'Verified Paystack pricing: First 2 books free; premium editions calibrated in NGN and USD.',
    status: 'success',
    ipAddress: '197.210.84.12'
  }
];

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'Novella',
  supportEmail: 'support@novella.app',
  freeStoriesCount: 2,
  freeBooksThreshold: 2,
  defaultCurrency: 'NGN',
  currency: 'NGN',
  defaultPriceNGN: 2000,
  ngnToUsdRate: 1450,
  authorRevenueSharePercentage: 70,
  paystackPublicKey: 'pk_test_sample_novella_paystack_key',
  paystackSecretKeyMasked: 'sk_test_••••••••••••••••••••••••389a',
  isLiveMode: false,
  maintenanceMode: false,
  allowGuestPreview: true,
  requireAuthForFreeBooks: false,
  enableTextSelectionPrevention: false,
  allowReaderReviews: true,
  enableAiStoryGenerator: true,
  enableInteractiveStories: true,
  enableSpeechSynthesis: true
};

export const INITIAL_STORY_ANALYTICS: StoryAnalytics[] = [
  {
    storyId: 'story-1-anatomy-of-the-dead',
    storyTitle: 'Anatomy of the Dead',
    totalViews: 14500,
    totalReads: 12200,
    completionRate: 88,
    averageReadingTimeMinutes: 5.8,
    revenueNGN: 0,
    chapterDropoff: [
      { chapterOrder: 1, chapterTitle: 'Anatomy of the Dead', completionRate: 88, readerCount: 12200 }
    ]
  },
  {
    storyId: 'story-2-five-spirits-from-the-east',
    storyTitle: 'Five Spirits From The East',
    totalViews: 12800,
    totalReads: 10450,
    completionRate: 92,
    averageReadingTimeMinutes: 7.9,
    revenueNGN: 0,
    chapterDropoff: [
      { chapterOrder: 1, chapterTitle: 'Five Spirits From The East', completionRate: 92, readerCount: 10450 }
    ]
  },
  {
    storyId: 'story-3-gods-will',
    storyTitle: "God's Will",
    totalViews: 8900,
    totalReads: 4200,
    completionRate: 85,
    averageReadingTimeMinutes: 4.8,
    revenueNGN: 240000
  },
  {
    storyId: 'story-10-the-whispering-forest',
    storyTitle: 'The Whispering Forest (Interactive)',
    totalViews: 6500,
    totalReads: 4100,
    completionRate: 94,
    averageReadingTimeMinutes: 12.4,
    revenueNGN: 0
  }
];
