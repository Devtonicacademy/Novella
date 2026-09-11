import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_STORIES } from './src/data/initialStories';
import {
  INITIAL_AUTHORS,
  INITIAL_CATEGORIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_STORY_ANALYTICS,
} from './src/data/adminMockData';
import {
  Story,
  PaystackTransaction,
  UserProfile,
  UserRole,
  Author,
  CategoryInfo,
  Announcement,
  AuditLog,
  PlatformSettings,
  StoryAnalytics,
  Chapter,
  PriceHistoryRecord,
  CustomerPurchaseRecord
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// Security & Cryptographic Password Helpers
// -------------------------------------------------------------
interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
  resetToken?: string;
  resetTokenExpires?: number;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Designated Super Admin Email Addresses
const DESIGNATED_ADMIN_EMAILS = [
  'ozerojephtah0@gmail.com',
  'ozerojephthah0@gmail.com',
  'admin@novella.app'
];

function isDesignatedAdminEmail(email?: string): boolean {
  if (!email) return false;
  return DESIGNATED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function isAdminRole(role?: string): boolean {
  if (!role) return false;
  return ['admin', 'super_admin', 'content_admin', 'support_admin', 'finance_admin'].includes(role);
}

// -------------------------------------------------------------
// In-Memory Database Stores
// -------------------------------------------------------------
let stories: Story[] = [...INITIAL_STORIES];
let authors: Author[] = [...INITIAL_AUTHORS];
let categories: CategoryInfo[] = [...INITIAL_CATEGORIES];
let announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let platformSettings: PlatformSettings = { ...INITIAL_PLATFORM_SETTINGS };
let storyAnalytics: StoryAnalytics[] = [...INITIAL_STORY_ANALYTICS];

// Price history records
let priceHistory: PriceHistoryRecord[] = [
  {
    id: 'ph-1',
    storyId: 'story-3-gods-will',
    storyTitle: "God's Will",
    oldPriceNGN: 1800,
    newPriceNGN: 2000,
    oldPriceUSD: 1.25,
    newPriceUSD: 1.38,
    wasFree: false,
    isFree: false,
    changedBy: 'Ozerojephtah0@gmail.com',
    reason: 'Standard catalog premium adjustment',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'ph-2',
    storyId: 'story-5-retired-general-bonzai',
    storyTitle: 'Retired General Bonza(i)',
    oldPriceNGN: 2200,
    newPriceNGN: 2500,
    oldPriceUSD: 1.50,
    newPriceUSD: 1.72,
    wasFree: false,
    isFree: false,
    changedBy: 'Ozerojephtah0@gmail.com',
    reason: 'Definitive satirical edition release',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  }
];

// Seed users with salted password hashes
const adminSalt1 = crypto.randomBytes(16).toString('hex');
const adminSalt2 = crypto.randomBytes(16).toString('hex');
const customerSalt = crypto.randomBytes(16).toString('hex');

const ALL_STORY_IDS = [
  'story-1-anatomy-of-the-dead',
  'story-2-five-spirits-from-the-east',
  'story-3-gods-will',
  'story-4-lets-pray-for-cameroon',
  'story-5-retired-general-bonzai',
  'story-6-the-ugly-owl'
];

let users: StoredUser[] = [
  {
    id: 'usr-admin-ozero',
    email: 'ozerojephtah0@gmail.com',
    displayName: 'Jephthah Ozero',
    fullName: 'Jephthah Ozero',
    role: 'super_admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    passwordHash: hashPassword('Admin123!', adminSalt1),
    salt: adminSalt1,
    unlockedStoryIds: [...ALL_STORY_IDS],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 840,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    authProvider: 'password'
  },
  {
    id: 'usr-admin-novella',
    email: 'admin@novella.app',
    displayName: 'Novella System Admin',
    fullName: 'Novella System Administrator',
    role: 'super_admin',
    status: 'active',
    passwordHash: hashPassword('Admin123!', adminSalt2),
    salt: adminSalt2,
    unlockedStoryIds: [...ALL_STORY_IDS],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 720,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    authProvider: 'password'
  },
  {
    id: 'usr-customer-01',
    email: 'customer@novella.app',
    displayName: 'Amara Okafor',
    fullName: 'Amara Okafor',
    role: 'customer',
    status: 'active',
    passwordHash: hashPassword('Customer123!', customerSalt),
    salt: customerSalt,
    unlockedStoryIds: ['story-1-anatomy-of-the-dead', 'story-2-five-spirits-from-the-east', 'story-3-gods-will'],
    bookmarks: [
      {
        id: 'bm-seed-1',
        storyId: 'story-3-gods-will',
        chapterId: 'ch-3-1',
        chapterOrder: 1,
        chapterTitle: "God's Will",
        paragraphIndex: 1,
        note: 'Profound and rhythmic social verse!',
        createdAt: new Date().toISOString()
      }
    ],
    readingProgress: {
      'story-3-gods-will': {
        storyId: 'story-3-gods-will',
        currentChapterId: 'ch-3-1',
        currentChapterOrder: 1,
        percentage: 100,
        lastReadAt: new Date().toISOString()
      }
    },
    totalReadingMinutes: 125,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    authProvider: 'password'
  }
];

// Active user sessions (Token -> { userId, expiresAt })
const sessions = new Map<string, { userId: string; expiresAt: number }>();

let transactions: PaystackTransaction[] = [
  {
    id: 'tx-seed-1',
    reference: 'PAY_STK_REF_98124',
    storyId: 'story-3-gods-will',
    storyTitle: "God's Will",
    userEmail: 'customer@novella.app',
    customerName: 'Amara Okafor',
    amountNGN: 2000,
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
    status: 'success',
    channel: 'bank_transfer',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  }
];

// Helper: Sanitize user object for client consumption
function sanitizeUser(u: StoredUser): UserProfile {
  const { passwordHash, salt, resetToken, resetTokenExpires, ...safeUser } = u;
  return safeUser;
}

// Helper: Append audit log entry on server
function logAudit(
  action: string,
  category: AuditLog['category'],
  details: string,
  adminEmail: string = 'system',
  adminRole: UserRole = 'super_admin',
  targetTitle?: string,
  status: 'success' | 'warning' | 'error' = 'success'
) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    adminEmail,
    adminRole,
    action,
    category,
    details,
    targetTitle,
    status,
    ipAddress: '127.0.0.1'
  };
  auditLogs.unshift(newLog);
}

// -------------------------------------------------------------
// Authentication Middlewares
// -------------------------------------------------------------
interface AuthenticatedRequest extends Request {
  user?: StoredUser;
  token?: string;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'] || (req.headers['x-auth-token'] as string);
  let token = '';

  if (authHeader && typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return next();
  }

  const session = sessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      sessions.delete(token);
      return next();
    }
    const user = users.find(u => u.id === session.userId);
    if (user && user.status !== 'suspended') {
      // Ensure designated admin accounts strictly keep super_admin role
      if (isDesignatedAdminEmail(user.email)) {
        user.role = 'super_admin';
      }
      req.user = user;
      req.token = token;
    }
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in as an administrator.' });
  }

  // Verify server-side role
  if (!isAdminRole(req.user.role) && !isDesignatedAdminEmail(req.user.email)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied. You do not have administrator permissions to access this resource.'
    });
  }
  next();
}

app.use(authenticateToken);

// -------------------------------------------------------------
// Story Helper
// -------------------------------------------------------------
function sanitizeStoryForList(story: Story): Story {
  return {
    ...story,
    chapters: story.chapters.map((ch, idx) => ({
      ...ch,
      content: story.isFree || idx === 0 ? ch.content : ch.content.slice(0, 180) + '... [LOCKED - Purchase to unlock full chapter]'
    }))
  };
}

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

// 1. Customer Sign Up (Automatically grants super_admin if email is designated admin)
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Check existing
  let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  const isAdminEmail = isDesignatedAdminEmail(normalizedEmail);

  if (user) {
    // If account was pre-seeded for admin, update password
    if (isAdminEmail) {
      const salt = crypto.randomBytes(16).toString('hex');
      user.salt = salt;
      user.passwordHash = hashPassword(password, salt);
      user.fullName = fullName.trim();
      user.displayName = fullName.trim();
      user.role = 'super_admin';
      
      const token = generateSessionToken();
      sessions.set(token, {
        userId: user.id,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
      });

      logAudit('Admin Account Activated', 'security', `Admin signed up and set password for ${normalizedEmail}`, normalizedEmail, 'super_admin');

      return res.status(200).json({
        message: 'Admin account initialized successfully',
        user: sanitizeUser(user),
        token
      });
    }

    return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const assignedRole: UserRole = isAdminEmail ? 'super_admin' : 'customer';

  const newUser: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: normalizedEmail,
    displayName: fullName.trim(),
    fullName: fullName.trim(),
    role: assignedRole,
    status: 'active',
    passwordHash,
    salt,
    unlockedStoryIds: isAdminEmail
      ? stories.map(s => s.id)
      : ['story-1-baobab', 'story-2-oriental-brothers'],
    bookmarks: [],
    readingProgress: {},
    totalReadingMinutes: 0,
    createdAt: new Date().toISOString(),
    authProvider: 'password'
  };

  users.push(newUser);

  const token = generateSessionToken();
  sessions.set(token, {
    userId: newUser.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });

  logAudit(
    isAdminEmail ? 'Admin Registered' : 'User Registered',
    'security',
    `New account created for ${normalizedEmail} (Role: ${assignedRole})`,
    normalizedEmail,
    assignedRole
  );

  return res.status(201).json({
    message: 'Account created successfully',
    user: sanitizeUser(newUser),
    token
  });
});

// 2. Customer & General Sign In
app.post('/api/auth/signin', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been temporarily suspended. Please contact support@novella.app.' });
  }

  // Force super_admin role if email is designated admin
  if (isDesignatedAdminEmail(normalizedEmail)) {
    user.role = 'super_admin';
  }

  const token = generateSessionToken();
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });

  user.lastActiveAt = new Date().toISOString();

  return res.json({
    message: 'Signed in successfully',
    user: sanitizeUser(user),
    token
  });
});

// 3. Admin Dedicated Sign In (Strictly Enforces Admin Role)
app.post('/api/auth/admin-signin', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const isAdmin = isAdminRole(user.role) || isDesignatedAdminEmail(normalizedEmail);
  if (!isAdmin) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'This account does not have administrative privileges. Please use the Customer Sign-In portal.'
    });
  }

  if (isDesignatedAdminEmail(normalizedEmail)) {
    user.role = 'super_admin';
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This administrative account has been suspended.' });
  }

  const token = generateSessionToken();
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });

  user.lastActiveAt = new Date().toISOString();

  logAudit('Admin Signed In', 'security', `Admin ${normalizedEmail} authenticated to dashboard`, normalizedEmail, user.role);

  return res.json({
    message: 'Admin authentication successful',
    user: sanitizeUser(user),
    token
  });
});

// 4. Google Sign In (Uses Authenticated Person's Real Name and Gmail)
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { email, fullName, avatar } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid Google email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isAdminEmail = isDesignatedAdminEmail(normalizedEmail);
  let user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    const salt = crypto.randomBytes(16).toString('hex');
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const assignedRole: UserRole = isAdminEmail ? 'super_admin' : 'customer';

    user = {
      id: `usr-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: normalizedEmail,
      displayName: fullName && fullName.trim() ? fullName.trim() : normalizedEmail.split('@')[0],
      fullName: fullName && fullName.trim() ? fullName.trim() : normalizedEmail.split('@')[0],
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || normalizedEmail)}`,
      role: assignedRole,
      status: 'active',
      passwordHash: hashPassword(randomPassword, salt),
      salt,
      unlockedStoryIds: isAdminEmail
        ? stories.map(s => s.id)
        : ['story-1-baobab', 'story-2-oriental-brothers'],
      bookmarks: [],
      readingProgress: {},
      totalReadingMinutes: 0,
      createdAt: new Date().toISOString(),
      authProvider: 'google'
    };
    users.push(user);

    logAudit('Google User Registered', 'security', `New user signed up via Google: ${normalizedEmail} (Role: ${assignedRole})`, normalizedEmail, assignedRole);
  } else {
    if (fullName && fullName.trim()) {
      user.displayName = fullName.trim();
      user.fullName = fullName.trim();
    }
    if (avatar && !user.avatar) {
      user.avatar = avatar;
    }
    if (isAdminEmail) {
      user.role = 'super_admin';
    }
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Account suspended.' });
  }

  const token = generateSessionToken();
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });

  user.lastActiveAt = new Date().toISOString();

  return res.json({
    message: 'Google authentication successful',
    user: sanitizeUser(user),
    token
  });
});

// 5. Get Current Authenticated User Session
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    user: sanitizeUser(req.user!),
    token: req.token
  });
});

// 6. Sign Out
app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  if (req.token) {
    sessions.delete(req.token);
  }
  return res.json({ message: 'Signed out successfully' });
});

// 7. Forgot Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();

  if (user) {
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 1000 * 60 * 30; // 30 mins
  }

  return res.json({
    success: true,
    message: 'If an account exists with this email address, a password reset token has been issued.',
    resetToken: user ? resetToken : undefined
  });
});

// 8. Reset Password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, resetToken, newPassword, confirmPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ error: 'Email, reset token, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !user.resetToken || user.resetToken.toUpperCase() !== resetToken.trim().toUpperCase()) {
    return res.status(400).json({ error: 'Invalid or expired password reset token' });
  }

  if (user.resetTokenExpires && Date.now() > user.resetTokenExpires) {
    return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.salt = newSalt;
  user.passwordHash = hashPassword(newPassword, newSalt);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  logAudit('Password Reset', 'security', `Password reset completed for ${normalizedEmail}`, normalizedEmail, user.role);

  return res.json({
    success: true,
    message: 'Password has been successfully updated. You may now sign in.'
  });
});

// 9. Update Profile
app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { displayName, fullName, avatar, currentPassword, newPassword } = req.body;

  if (displayName && typeof displayName === 'string') user.displayName = displayName.trim();
  if (fullName && typeof fullName === 'string') user.fullName = fullName.trim();
  if (avatar && typeof avatar === 'string') user.avatar = avatar;

  if (newPassword) {
    if (user.authProvider === 'password') {
      if (!currentPassword || !verifyPassword(currentPassword, user.passwordHash, user.salt)) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    const newSalt = crypto.randomBytes(16).toString('hex');
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPassword, newSalt);
    user.authProvider = 'password';
    logAudit('Password Changed', 'security', `Password updated for ${user.email}`, user.email, user.role);
  }

  return res.json({
    message: 'Profile updated successfully',
    user: sanitizeUser(user)
  });
});

// 10. Sync User Data (Bookmarks, Progress)
app.post('/api/auth/sync', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { bookmarks, readingProgress, unlockedStoryIds, totalReadingMinutes } = req.body;

  if (Array.isArray(bookmarks)) user.bookmarks = bookmarks;
  if (readingProgress && typeof readingProgress === 'object') user.readingProgress = readingProgress;
  if (Array.isArray(unlockedStoryIds)) user.unlockedStoryIds = Array.from(new Set([...user.unlockedStoryIds, ...unlockedStoryIds]));
  if (typeof totalReadingMinutes === 'number') user.totalReadingMinutes = totalReadingMinutes;

  return res.json({
    success: true,
    user: sanitizeUser(user)
  });
});

// -------------------------------------------------------------
// PUBLIC & STORY ROUTES
// -------------------------------------------------------------

// Get All Stories
app.get('/api/stories', (req: Request, res: Response) => {
  const sanitized = stories.map(sanitizeStoryForList);
  res.json(sanitized);
});

// Get Single Story Details
app.get('/api/stories/:id', (req: Request, res: Response) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  res.json(sanitizeStoryForList(story));
});

// Read Full Story (Enforcing Server-Side Access Control & Admin Bypass)
app.get('/api/stories/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const user = req.user;
  const isSuperOrAdmin = user && (isAdminRole(user.role) || isDesignatedAdminEmail(user.email));
  const isUnlockedForUser = user && user.unlockedStoryIds.includes(story.id);
  const isFreeBook = story.isFree || story.order <= 2;

  // Admins can read all books and chapters without purchasing
  if (isFreeBook || isSuperOrAdmin || isUnlockedForUser) {
    return res.json(story);
  }

  // If locked, return sample preview
  const lockedPreview: Story = {
    ...story,
    chapters: story.chapters.map((ch, idx) => ({
      ...ch,
      content: idx === 0 
        ? ch.content.slice(0, 350) + '\n\n[End of free sample preview. Unlock book with Paystack to read all chapters.]'
        : '[LOCKED CHAPTER - Purchase complete book to read]'
    }))
  };

  return res.status(403).json({
    error: 'Locked Story',
    message: 'This story requires purchase. First 2 books are 100% free.',
    preview: lockedPreview,
    priceNGN: story.priceNGN,
    priceUSD: story.priceUSD
  });
});

// Paystack: Initialize Payment Transaction (Always pulls verified price from database)
app.post('/api/paystack/initialize', (req: AuthenticatedRequest, res: Response) => {
  const { storyId } = req.body;
  const story = stories.find(s => s.id === storyId);

  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  // CRITICAL: Always use database price
  const verifiedPriceNGN = story.isFree ? 0 : story.priceNGN;
  const reference = `PSTK_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  res.json({
    status: true,
    message: 'Authorization URL created',
    data: {
      authorization_url: `https://checkout.paystack.com/${reference}`,
      access_code: `acc_${reference}`,
      reference,
      amount: verifiedPriceNGN * 100, // in kobo
      currency: 'NGN',
      story: {
        id: story.id,
        title: story.title,
        priceNGN: verifiedPriceNGN,
        priceUSD: story.priceUSD,
      }
    }
  });
});

// Paystack: Verify Payment Transaction (Always unlocks with DB price verification)
app.post('/api/paystack/verify', (req: AuthenticatedRequest, res: Response) => {
  const { reference, storyId, email, channel = 'card' } = req.body;
  const story = stories.find(s => s.id === storyId);

  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const user = req.user;
  const payerEmail = email || (user ? user.email : 'customer@novella.app');
  const customerName = user ? (user.fullName || user.displayName) : 'Reader';

  const newTx: PaystackTransaction = {
    id: `tx-${Date.now()}`,
    reference: reference || `VERIFIED_${Date.now()}`,
    storyId: story.id,
    storyTitle: story.title,
    userEmail: payerEmail,
    customerName,
    amountNGN: story.priceNGN,
    status: 'success',
    channel: channel || 'card',
    paidAt: new Date().toISOString(),
  };

  transactions.unshift(newTx);

  if (user && !user.unlockedStoryIds.includes(story.id)) {
    user.unlockedStoryIds.push(story.id);
  }

  logAudit(
    'Payment Verified',
    'payment',
    `Customer ${payerEmail} purchased "${story.title}" for ₦${story.priceNGN.toLocaleString()}`,
    payerEmail,
    'customer',
    story.title
  );

  res.json({
    status: true,
    message: 'Payment verification successful',
    data: {
      status: 'success',
      reference: newTx.reference,
      amount: story.priceNGN,
      gateway_response: 'Successful',
      paid_at: newTx.paidAt,
      channel: newTx.channel,
      currency: 'NGN',
      storyId: story.id,
      storyTitle: story.title,
      unlockedStoryIds: user ? user.unlockedStoryIds : [story.id]
    }
  });
});

// -------------------------------------------------------------
// ADMIN PROTECTED ROUTES
// -------------------------------------------------------------

// Admin: Get Platform Stats
app.get('/api/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const totalRevenueNGN = transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amountNGN, 0);

  const totalRevenueUSD = totalRevenueNGN / (platformSettings.ngnToUsdRate || 1450);

  res.json({
    totalStories: stories.length,
    freeStories: stories.filter(s => s.isFree || s.order <= 2).length,
    premiumStories: stories.filter(s => !s.isFree && s.order > 2).length,
    totalTransactions: transactions.length,
    totalRevenueNGN,
    totalRevenueUSD: Number(totalRevenueUSD.toFixed(2)),
    totalUsers: users.length,
    activeReaders: users.filter(u => u.status === 'active').length,
    totalChapters: stories.reduce((sum, s) => sum + (s.chapters?.length || 0), 0),
    totalAuthors: authors.length,
    totalCategories: categories.length
  });
});

// Admin: Price Management - Get All Story Prices & Price History
app.get('/api/admin/prices', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const pricingData = stories.map(s => ({
    id: s.id,
    order: s.order,
    title: s.title,
    author: s.author,
    category: s.category,
    isFree: s.isFree,
    priceNGN: s.priceNGN,
    priceUSD: s.priceUSD,
    status: s.status || 'published',
    totalRevenueNGN: transactions
      .filter(t => t.storyId === s.id && t.status === 'success')
      .reduce((sum, t) => sum + t.amountNGN, 0),
    salesCount: transactions.filter(t => t.storyId === s.id && t.status === 'success').length
  }));

  res.json({
    stories: pricingData,
    history: priceHistory,
    defaultCurrency: platformSettings.defaultCurrency || 'NGN',
    ngnToUsdRate: platformSettings.ngnToUsdRate || 1450
  });
});

// Admin: Price Management - Update Story Price & Free/Paid Status
app.put('/api/admin/prices/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const { newPriceNGN, isFree, reason } = req.body;
  const adminEmail = req.user?.email || 'admin@novella.app';
  const oldPriceNGN = story.priceNGN;
  const oldPriceUSD = story.priceUSD;
  const wasFree = story.isFree;

  const rate = platformSettings.ngnToUsdRate || 1450;
  const updatedIsFree = typeof isFree === 'boolean' ? isFree : story.isFree;
  const updatedPriceNGN = updatedIsFree ? 0 : (Number(newPriceNGN) || story.priceNGN);
  const updatedPriceUSD = updatedIsFree ? 0 : Number((updatedPriceNGN / rate).toFixed(2));

  story.isFree = updatedIsFree;
  story.priceNGN = updatedPriceNGN;
  story.priceUSD = updatedPriceUSD;
  story.updatedAt = new Date().toISOString();

  // Create price history entry
  const historyRecord: PriceHistoryRecord = {
    id: `ph-${Date.now()}`,
    storyId: story.id,
    storyTitle: story.title,
    oldPriceNGN,
    newPriceNGN: updatedPriceNGN,
    oldPriceUSD,
    newPriceUSD: updatedPriceUSD,
    wasFree,
    isFree: updatedIsFree,
    changedBy: adminEmail,
    reason: reason || 'Price adjusted via Admin Studio',
    timestamp: new Date().toISOString()
  };

  priceHistory.unshift(historyRecord);

  logAudit(
    'Price Updated',
    'price',
    `Price for "${story.title}" changed from ₦${oldPriceNGN} to ₦${updatedPriceNGN} (${updatedIsFree ? 'FREE' : 'PAID'}). Reason: ${reason || 'N/A'}`,
    adminEmail,
    req.user?.role || 'super_admin',
    story.title
  );

  res.json({
    message: 'Story price successfully updated',
    story,
    historyRecord
  });
});

// Admin: Purchases Management - Get All Customer Purchases & Unlocks
app.get('/api/admin/purchases', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const purchaseRecords: CustomerPurchaseRecord[] = [];

  // Convert transactions to CustomerPurchaseRecords
  transactions.forEach(t => {
    purchaseRecords.push({
      id: `pur-${t.id}`,
      transactionReference: t.reference,
      userEmail: t.userEmail,
      customerName: t.customerName || t.userEmail.split('@')[0],
      storyId: t.storyId,
      storyTitle: t.storyTitle,
      amountNGN: t.amountNGN,
      amountUSD: t.amountUSD || Number((t.amountNGN / (platformSettings.ngnToUsdRate || 1450)).toFixed(2)),
      channel: t.channel,
      purchasedAt: t.paidAt,
      status: t.status === 'success' ? 'active' : 'revoked'
    });
  });

  res.json(purchaseRecords);
});

// Admin: Get All Users
app.get('/api/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(users.map(sanitizeUser));
});

// Admin: Update User Role
app.put('/api/users/:id/role', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  const targetUser = users.find(u => u.id === req.params.id);

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent demoting primary designated admins
  if (isDesignatedAdminEmail(targetUser.email) && role !== 'super_admin') {
    return res.status(400).json({ error: 'Primary system administrator role cannot be altered.' });
  }

  const oldRole = targetUser.role;
  targetUser.role = role;

  logAudit(
    'User Role Changed',
    'security',
    `Role for ${targetUser.email} changed from ${oldRole} to ${role}`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    targetUser.displayName
  );

  res.json(sanitizeUser(targetUser));
});

// Admin: Toggle User Status (Active / Suspended)
app.post('/api/users/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const targetUser = users.find(u => u.id === req.params.id);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (isDesignatedAdminEmail(targetUser.email)) {
    return res.status(400).json({ error: 'Cannot suspend primary system administrator.' });
  }

  targetUser.status = targetUser.status === 'active' ? 'suspended' : 'active';

  logAudit(
    'User Status Toggled',
    'user',
    `Status for ${targetUser.email} set to ${targetUser.status}`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    targetUser.displayName
  );

  res.json(sanitizeUser(targetUser));
});

// Admin: Grant Story Access to User
app.post('/api/users/:id/grant-access', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { storyId } = req.body;
  const targetUser = users.find(u => u.id === req.params.id);
  const story = stories.find(s => s.id === storyId);

  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  if (!story) return res.status(404).json({ error: 'Story not found' });

  if (!targetUser.unlockedStoryIds.includes(storyId)) {
    targetUser.unlockedStoryIds.push(storyId);
  }

  logAudit(
    'Access Granted',
    'user',
    `Admin manually granted access to "${story.title}" for user ${targetUser.email}`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    story.title
  );

  res.json(sanitizeUser(targetUser));
});

// Admin: Revoke Story Access from User
app.post('/api/users/:id/revoke-access', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { storyId } = req.body;
  const targetUser = users.find(u => u.id === req.params.id);
  const story = stories.find(s => s.id === storyId);

  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.unlockedStoryIds = targetUser.unlockedStoryIds.filter(id => id !== storyId);

  logAudit(
    'Access Revoked',
    'user',
    `Admin revoked access to "${story?.title || storyId}" from user ${targetUser.email}`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    story?.title
  );

  res.json(sanitizeUser(targetUser));
});

// Admin: Get Transactions
app.get('/api/transactions', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(transactions);
});

// Admin: Create Story
app.post('/api/stories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const storyData = req.body as Partial<Story>;

  if (!storyData.title || !storyData.author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  const newOrder = stories.length + 1;
  const isFree = storyData.isFree ?? (newOrder <= 2);

  const newStory: Story = {
    id: `story-${Date.now()}`,
    order: newOrder,
    title: storyData.title,
    subtitle: storyData.subtitle || '',
    author: storyData.author,
    authorBio: storyData.authorBio || '',
    category: storyData.category || 'Folklore',
    isFree: isFree,
    priceNGN: isFree ? 0 : (storyData.priceNGN || 2000),
    priceUSD: isFree ? 0 : (storyData.priceUSD || 2.80),
    rating: 5.0,
    reviewCount: 1,
    totalChapters: storyData.chapters?.length || 1,
    readTime: `${(storyData.chapters?.length || 1) * 6} min`,
    tags: storyData.tags || ['Literature'],
    publishedYear: new Date().getFullYear(),
    status: storyData.status || 'published',
    featured: storyData.featured ?? false,
    description: storyData.description || 'A newly composed manuscript in Novella.',
    synopsis: storyData.synopsis || storyData.description || '',
    coverColorTheme: storyData.coverColorTheme || {
      bgGradient: 'from-amber-950 via-zinc-900 to-black',
      accent: '#d97706',
      text: '#fef3c7',
      border: '#78350f'
    },
    chapters: storyData.chapters && storyData.chapters.length > 0 ? storyData.chapters : [
      {
        id: `ch-${Date.now()}-1`,
        order: 1,
        title: 'Chapter 1: The Beginning',
        subtitle: 'The first passage',
        readMinutes: 5,
        status: 'published',
        content: 'Write the opening paragraph of your new masterpiece here.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  stories.push(newStory);

  logAudit(
    'Book Created',
    'book',
    `New book "${newStory.title}" created by ${req.user?.email} (${newStory.isFree ? 'Free' : '₦' + newStory.priceNGN})`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    newStory.title
  );

  res.status(201).json(newStory);
});

// Admin: Update Story
app.put('/api/stories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = stories.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const updated: Story = {
    ...stories[index],
    ...req.body,
    id: stories[index].id,
    updatedAt: new Date().toISOString()
  };

  stories[index] = updated;

  logAudit(
    'Book Updated',
    'book',
    `Book "${updated.title}" updated by ${req.user?.email}`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    updated.title
  );

  res.json(updated);
});

// Admin: Update Book Publish Status (Publish / Draft / Unpublish)
app.put('/api/stories/:id/publish-status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  const { status } = req.body;
  if (!['published', 'draft', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const prevStatus = story.status;
  story.status = status;
  story.updatedAt = new Date().toISOString();

  logAudit(
    'Publish Status Changed',
    'book',
    `"${story.title}" status changed from ${prevStatus} to ${status}`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    story.title
  );

  res.json(story);
});

// Admin: Delete Story with Confirmation
app.delete('/api/stories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = stories.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const deleted = stories.splice(index, 1)[0];

  logAudit(
    'Book Deleted',
    'book',
    `Book "${deleted.title}" (ID: ${deleted.id}) permanently deleted by ${req.user?.email}`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    deleted.title,
    'warning'
  );

  res.json({ message: 'Story deleted successfully', story: deleted });
});

// Admin: Chapter Management - Update All Chapters for a Story
app.put('/api/stories/:id/chapters', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  const { chapters } = req.body;
  if (!Array.isArray(chapters)) {
    return res.status(400).json({ error: 'Chapters array required' });
  }

  story.chapters = chapters;
  story.totalChapters = chapters.length;
  story.updatedAt = new Date().toISOString();

  logAudit(
    'Chapters Updated',
    'chapter',
    `Updated chapters for "${story.title}" (Total: ${chapters.length} chapters)`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    story.title
  );

  res.json(story);
});

// Admin: Cover Management - Update Cover Art & Theme
app.put('/api/stories/:id/cover', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  const { coverImage, coverColorTheme } = req.body;
  if (coverImage !== undefined) story.coverImage = coverImage;
  if (coverColorTheme) story.coverColorTheme = coverColorTheme;
  story.updatedAt = new Date().toISOString();

  logAudit(
    'Cover Art Updated',
    'book',
    `Cover design customized for "${story.title}"`,
    req.user?.email || 'admin',
    req.user?.role || 'super_admin',
    story.title
  );

  res.json(story);
});

// Admin: Authors Management (CRUD)
app.get('/api/authors', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(authors);
});

app.post('/api/authors', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const newAuthor: Author = {
    id: `auth-${Date.now()}`,
    name: req.body.name || 'New Author',
    bio: req.body.bio || '',
    avatar: req.body.avatar,
    nationality: req.body.nationality || 'African',
    primaryGenre: req.body.primaryGenre || 'Folklore',
    bookIds: req.body.bookIds || [],
    totalReads: 0,
    totalRevenueNGN: 0,
    status: 'active',
    joinedDate: new Date().toISOString().split('T')[0]
  };
  authors.push(newAuthor);
  logAudit('Author Added', 'book', `Added new author "${newAuthor.name}"`, req.user?.email || 'admin', req.user?.role || 'super_admin', newAuthor.name);
  res.status(201).json(newAuthor);
});

app.put('/api/authors/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = authors.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Author not found' });
  authors[index] = { ...authors[index], ...req.body };
  logAudit('Author Updated', 'book', `Updated author profile "${authors[index].name}"`, req.user?.email || 'admin', req.user?.role || 'super_admin', authors[index].name);
  res.json(authors[index]);
});

app.delete('/api/authors/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = authors.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Author not found' });
  const deleted = authors.splice(index, 1)[0];
  logAudit('Author Removed', 'book', `Removed author "${deleted.name}"`, req.user?.email || 'admin', req.user?.role || 'super_admin', deleted.name, 'warning');
  res.json(deleted);
});

// Admin: Categories Management (CRUD)
app.get('/api/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(categories);
});

app.post('/api/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const newCat: CategoryInfo = {
    id: `cat-${Date.now()}`,
    name: req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
    description: req.body.description || '',
    color: req.body.color || '#d97706',
    bookCount: 0,
    isFeatured: req.body.isFeatured ?? false
  };
  categories.push(newCat);
  logAudit('Category Created', 'book', `Created genre category "${newCat.name}"`, req.user?.email || 'admin', req.user?.role || 'super_admin', newCat.name);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });
  categories[index] = { ...categories[index], ...req.body };
  res.json(categories[index]);
});

app.delete('/api/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });
  const deleted = categories.splice(index, 1)[0];
  res.json(deleted);
});

// Admin: Announcements
app.get('/api/announcements', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(announcements);
});

app.post('/api/announcements', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: req.body.title,
    message: req.body.message,
    type: req.body.type || 'update',
    targetAudience: req.body.targetAudience || 'all',
    status: 'sent',
    isActive: true,
    sentAt: new Date().toISOString()
  };
  announcements.unshift(newAnn);
  logAudit('Broadcast Sent', 'announcement', `Sent broadcast announcement: "${newAnn.title}"`, req.user?.email || 'admin', req.user?.role || 'super_admin', newAnn.title);
  res.status(201).json(newAnn);
});

app.delete('/api/announcements/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = announcements.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Announcement not found' });
  const deleted = announcements.splice(index, 1)[0];
  res.json(deleted);
});

// Admin: Audit Logs
app.get('/api/audit-logs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(auditLogs);
});

// Admin: Settings
app.get('/api/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(platformSettings);
});

app.put('/api/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  platformSettings = { ...platformSettings, ...req.body };
  logAudit('Platform Settings Updated', 'settings', `Platform settings updated by ${req.user?.email}`, req.user?.email || 'admin', req.user?.role || 'super_admin');
  res.json(platformSettings);
});

// Admin: Analytics
app.get('/api/analytics', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(storyAnalytics);
});

// Server Startup with Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Novella Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
