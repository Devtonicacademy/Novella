import React, { useState, useEffect } from 'react';
import { ActivityFeedItem, Story } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Sparkles, 
  Heart, 
  BookOpen, 
  Flame, 
  Award, 
  Clock, 
  MessageSquare,
  Share2
} from 'lucide-react';

interface ActivityFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStory?: (story: Story) => void;
  allStories?: Story[];
}

export const ActivityFeedModal: React.FC<ActivityFeedModalProps> = ({
  isOpen,
  onClose,
  onOpenStory,
  allStories = [],
}) => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFeed = async () => {
      setIsLoading(true);
      try {
        const items = await api.getActivityFeed();
        setFeedItems(items);
      } catch {
        // Fallback demo data
        setFeedItems([
          {
            id: 'feed-1',
            type: 'chapter_release',
            actorName: 'Jephthah Ozero',
            actorAvatar: '',
            storyId: 'story-1',
            storyTitle: 'Echoes of the Niger',
            content: 'Published a new thrilling chapter: "Chapter 3: The Gathering of River Spirits"!',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            likesCount: 19,
          },
          {
            id: 'feed-2',
            type: 'streak_milestone',
            actorName: 'Amara Okafor',
            actorAvatar: '',
            content: 'Achieved a 7-day uninterrupted reading streak!',
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            likesCount: 34,
          },
          {
            id: 'feed-3',
            type: 'story_review',
            actorName: 'Tunde Bakare',
            actorAvatar: '',
            storyId: 'story-2',
            storyTitle: 'Shadows of Zuma Rock',
            content: 'Rated 5 stars: "An extraordinary atmospheric thriller that kept me up until 3 AM."',
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            likesCount: 12,
          },
          {
            id: 'feed-4',
            type: 'author_announcement',
            actorName: 'Dr. Ifeoma Adeleke',
            actorAvatar: '',
            content: 'Pre-production for the audio edition of "Whispers of the Savannah" has officially started with native voice actors!',
            timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
            likesCount: 58,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLike = async (itemId: string) => {
    try {
      const res = await api.likeActivityFeed(itemId);
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, likesCount: res.likes, isLiked: true } : item
        )
      );
    } catch {
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, likesCount: item.likesCount + 1, isLiked: true } : item
        )
      );
    }
  };

  const getFeedIcon = (type: string) => {
    switch (type) {
      case 'chapter_release':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'streak_milestone':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'story_review':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'author_announcement':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-zinc-500" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.round(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                Community Activity Feed
              </h3>
              <p className="text-[11px] text-zinc-500">
                Latest updates from authors you follow and reader milestones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feed List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching latest literary pulses...</span>
            </div>
          ) : feedItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No activity records found right now.
            </div>
          ) : (
            feedItems.map((item) => {
              const matchedStory = item.storyId ? allStories.find((s) => s.id === item.storyId) : undefined;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800/80 space-y-2.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-800">
                        {item.actorName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                          {item.actorName}
                        </span>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-2xs">
                      {getFeedIcon(item.type)}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-10">
                    {item.content}
                  </p>

                  {matchedStory && (
                    <div
                      onClick={() => {
                        if (onOpenStory) {
                          onClose();
                          onOpenStory(matchedStory);
                        }
                      }}
                      className="ml-10 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-colors"
                    >
                      <div className="w-8 h-11 rounded-sm bg-zinc-700 overflow-hidden shrink-0">
                        {matchedStory.coverImage ? (
                          <img src={matchedStory.coverImage} alt={matchedStory.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-300 text-[9px] font-bold bg-amber-950">
                            {matchedStory.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {matchedStory.title}
                        </h5>
                        <p className="text-[10px] text-zinc-500">Read now on Novella</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 pl-10">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        item.isLiked ? 'text-rose-500' : 'text-zinc-500 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-rose-500' : ''}`} />
                      <span>{item.likesCount || 0}</span>
                    </button>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
