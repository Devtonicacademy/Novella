import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Story } from '../types';
import { 
  X, 
  Flame, 
  Award, 
  Target, 
  BookOpen, 
  Calendar, 
  Heart, 
  Users, 
  Bookmark, 
  Edit3, 
  Check, 
  Compass, 
  Sparkles, 
  Clock,
  ChevronRight
} from 'lucide-react';

interface ReaderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStory?: (story: Story) => void;
  allStories?: Story[];
}

export const ReaderProfileModal: React.FC<ReaderProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenStory,
  allStories = [],
}) => {
  const { user, updateProfile, updateReadingGoals } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'achievements' | 'collections'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || 'Passionate African fiction and contemporary literature enthusiast.');
  const [isSaving, setIsSaving] = useState(false);

  // Goals editing state
  const [editingGoals, setEditingGoals] = useState(false);
  const [monthlyTarget, setMonthlyTarget] = useState(user?.readingGoals?.storiesMonthlyTarget || 5);
  const [weeklyTarget, setWeeklyTarget] = useState(user?.readingGoals?.chaptersWeeklyTarget || 20);
  const [dailyTarget, setDailyTarget] = useState(user?.readingGoals?.minutesDailyTarget || 30);

  if (!isOpen || !user) return null;

  const streak = user.readingStreak || {
    currentStreak: 4,
    longestStreak: 12,
    lastActiveDate: new Date().toISOString().split('T')[0],
    streakHistory: [],
  };

  const goals = user.readingGoals || {
    storiesMonthlyTarget: 5,
    storiesReadThisMonth: 3,
    chaptersWeeklyTarget: 20,
    chaptersReadThisWeek: 14,
    minutesDailyTarget: 30,
    minutesReadToday: 22,
  };

  const achievements = user.achievements || [];
  const collections = user.collections || [];
  const likedStories = allStories.filter((s) => user.likedStoryIds?.includes(s.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ displayName, bio });
      setIsEditingProfile(false);
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateReadingGoals({
      storiesMonthlyTarget: Number(monthlyTarget),
      chaptersWeeklyTarget: Number(weeklyTarget),
      minutesDailyTarget: Number(dailyTarget),
    });
    setEditingGoals(false);
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'Award': return <Award className="w-5 h-5 text-amber-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'Compass': return <Compass className="w-5 h-5 text-blue-500" />;
      default: return <Award className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-amber-200 border-2 border-white/40 overflow-hidden shadow-lg flex items-center justify-center text-amber-950 font-serif font-bold text-2xl">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 border border-white">
                <Flame className="w-3 h-3 fill-amber-950 text-amber-950" />
                <span>{streak.currentStreak}d</span>
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-serif font-bold text-xl text-white truncate">
                  {user.displayName || user.fullName || user.email.split('@')[0]}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  {user.role === 'user' ? 'Reader' : user.role.replace('_', ' ')}
                </span>
              </div>

              <p className="text-amber-100/90 text-xs mt-1 line-clamp-2 max-w-lg">
                {user.bio || 'Passionate reader on Novella.'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-amber-200/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span><strong>{streak.currentStreak}</strong> day streak (Best: {streak.longestStreak}d)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span><strong>{user.totalReadingMinutes || 68}</strong> mins read</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span><strong>{achievements.filter((a) => a.unlocked).length}</strong> / {achievements.length} badges</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Overview & Activity
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'goals'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Reading Goals
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Badges ({achievements.filter((a) => a.unlocked).length})
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'collections'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Collections ({collections.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Streaks Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <Flame className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {streak.currentStreak} Day Reading Streak!
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Read every day to keep the flame alive. Your personal best is {streak.longestStreak} days.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Today</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Active
                  </span>
                </div>
              </div>

              {/* Quick Goals Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span>Active Reading Goals</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('goals')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Daily minutes */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Daily Reading</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{goals.minutesReadToday} / {goals.minutesDailyTarget}m</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round((goals.minutesReadToday / goals.minutesDailyTarget) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  {/* Weekly chapters */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Weekly Chapters</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{goals.chaptersReadThisWeek} / {goals.chaptersWeeklyTarget}</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round((goals.chaptersReadThisWeek / goals.chaptersWeeklyTarget) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  {/* Monthly stories */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Monthly Stories</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{goals.storiesReadThisMonth} / {goals.storiesMonthlyTarget}</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round((goals.storiesReadThisMonth / goals.storiesMonthlyTarget) * 100))}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Liked Stories */}
              {likedStories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    <span>Liked Stories ({likedStories.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {likedStories.map((story) => (
                      <div
                        key={story.id}
                        onClick={() => {
                          if (onOpenStory) {
                            onClose();
                            onOpenStory(story);
                          }
                        }}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer flex items-center gap-3"
                      >
                        <div className="w-10 h-14 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                          {story.coverImage ? (
                            <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xs bg-amber-950">
                              {story.title.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                            {story.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 truncate">By {story.author}</p>
                          <span className="text-[10px] text-amber-600 font-medium">{story.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Edit Option */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEditingProfile ? 'Cancel Editing' : 'Edit Reader Bio'}</span>
                </button>
              </div>

              {isEditingProfile && (
                <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-3 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Reader Bio
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: READING GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Set & Track Reading Targets
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Challenge yourself to read consistently and build a lifelong reading habit.
                  </p>
                </div>
                <button
                  onClick={() => setEditingGoals(!editingGoals)}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold transition-colors cursor-pointer"
                >
                  {editingGoals ? 'Cancel' : 'Adjust Targets'}
                </button>
              </div>

              {editingGoals ? (
                <form onSubmit={handleSaveGoals} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600">Customize Goals</h4>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Monthly Stories Goal
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={monthlyTarget}
                      onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Weekly Chapters Goal
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={weeklyTarget}
                      onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Daily Reading Time (Minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={dailyTarget}
                      onChange={(e) => setDailyTarget(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save Targets
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Detailed Target Cards */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Daily Reading Time</h4>
                      </div>
                      <span className="text-xs font-bold text-amber-600">{goals.minutesReadToday} / {goals.minutesDailyTarget} mins</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.round((goals.minutesReadToday / goals.minutesDailyTarget) * 100))}%` }} 
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      {goals.minutesReadToday >= goals.minutesDailyTarget
                        ? '🎉 Daily reading target reached for today!'
                        : `${goals.minutesDailyTarget - goals.minutesReadToday} minutes left to meet your daily target.`}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-emerald-500" />
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Weekly Chapters</h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{goals.chaptersReadThisWeek} / {goals.chaptersWeeklyTarget} chapters</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.round((goals.chaptersReadThisWeek / goals.chaptersWeeklyTarget) * 100))}%` }} 
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Progress updates automatically as you complete reading chapters.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-purple-500" />
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Monthly Completed Stories</h4>
                      </div>
                      <span className="text-xs font-bold text-purple-600">{goals.storiesReadThisMonth} / {goals.storiesMonthlyTarget} stories</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-purple-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.round((goals.storiesReadThisMonth / goals.storiesMonthlyTarget) * 100))}%` }} 
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Complete manuscripts to earn the Monthly Bookworm honor.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACHIEVEMENTS & BADGES */}
          {activeTab === 'achievements' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Reader Achievements & Badges
                </h3>
                <p className="text-xs text-zinc-500">
                  Earn milestone honors as you read, discover genres, and review stories.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      ach.unlocked
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
                        : 'bg-zinc-50/40 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        ach.unlocked
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {getAchievementIcon(ach.icon)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {ach.title}
                        </h4>
                        {ach.unlocked && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-100/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">{ach.description}</p>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden mt-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${ach.unlocked ? 'bg-amber-500' : 'bg-zinc-400'}`}
                          style={{ width: `${Math.min(100, Math.round((ach.currentCount / ach.targetCount) * 100))}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COLLECTIONS */}
          {activeTab === 'collections' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Personal Story Collections
                </h3>
                <p className="text-xs text-zinc-500">
                  Your curated lists of favorites, read later queues, and personal selections.
                </p>
              </div>

              <div className="space-y-3">
                {collections.map((col) => {
                  const storiesInCol = allStories.filter((s) => col.storyIds.includes(s.id));
                  return (
                    <div
                      key={col.id}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {col.name}
                          </h4>
                        </div>
                        <span className="text-xs font-semibold text-zinc-500">
                          {col.storyIds.length} {col.storyIds.length === 1 ? 'story' : 'stories'}
                        </span>
                      </div>

                      {col.description && (
                        <p className="text-xs text-zinc-500">{col.description}</p>
                      )}

                      {storiesInCol.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                          {storiesInCol.map((story) => (
                            <div
                              key={story.id}
                              onClick={() => {
                                if (onOpenStory) {
                                  onClose();
                                  onOpenStory(story);
                                }
                              }}
                              className="group p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 transition-all cursor-pointer space-y-1.5"
                            >
                              <div className="aspect-3/4 rounded-lg bg-zinc-800 overflow-hidden">
                                {story.coverImage ? (
                                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xs bg-amber-950">
                                    {story.title.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <h5 className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100 truncate">
                                {story.title}
                              </h5>
                              <p className="text-[10px] text-zinc-500 truncate">{story.author}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 italic py-2">
                          No stories added to this collection yet. Browse stories and tap "Save to Collection".
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
