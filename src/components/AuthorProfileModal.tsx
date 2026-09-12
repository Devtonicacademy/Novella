import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Award, 
  Users, 
  Check, 
  UserPlus, 
  Star, 
  Globe, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Author, Story } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookCover } from './BookCover';

interface AuthorProfileModalProps {
  author: Author | null;
  stories: Story[];
  isOpen: boolean;
  onClose: () => void;
  onSelectStory: (story: Story) => void;
  onFollowChange?: () => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  author,
  stories,
  isOpen,
  onClose,
  onSelectStory,
  onFollowChange,
}) => {
  const { user, refreshUser } = useAuth();
  const [following, setFollowing] = useState(
    author && user?.followingAuthorIds?.includes(author.id) || false
  );
  const [followersCount, setFollowersCount] = useState(author?.followersCount || 120);
  const [loadingFollow, setLoadingFollow] = useState(false);

  if (!isOpen || !author) return null;

  const authorStories = stories.filter(
    (s) => s.authorId === author.id || s.author.toLowerCase() === author.name.toLowerCase()
  );

  const handleToggleFollow = async () => {
    if (!user) {
      alert('Please sign in to follow authors');
      return;
    }
    setLoadingFollow(true);
    try {
      const res = await api.toggleFollowAuthor(author.id);
      setFollowing(res.isFollowing);
      setFollowersCount(res.followersCount);
      await refreshUser();
      if (onFollowChange) onFollowChange();
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner */}
        <div className="relative h-44 sm:h-52 bg-gradient-to-r from-amber-900 via-stone-900 to-zinc-950 overflow-hidden">
          {author.bannerImage && (
            <img
              src={author.bannerImage}
              alt={author.name}
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
          )}
          <button
            id="close-author-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Details Header */}
        <div className="px-6 -mt-14 pb-6 border-b border-zinc-200 dark:border-zinc-800 space-y-4 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-900 bg-zinc-800 shadow-xl shrink-0">
                <img
                  src={author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {author.name}
                  </h3>
                  {author.verified && (
                    <span className="p-1 rounded-full bg-amber-500 text-white text-[10px]" title="Verified Author">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <span>{author.nationality || 'African'}</span>
                  <span>•</span>
                  <span>{author.primaryGenre || 'Storyteller'}</span>
                </p>
              </div>
            </div>

            <button
              id="author-follow-toggle-btn"
              onClick={handleToggleFollow}
              disabled={loadingFollow}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                following
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              }`}
            >
              {following ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow Author</span>
                </>
              )}
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-100 dark:border-zinc-800/80 text-center">
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {followersCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Followers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {authorStories.length}
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Works</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{author.averageRating || '4.9'}</span>
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Avg Rating</div>
            </div>
          </div>

          {/* Biography */}
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif">
            {author.bio}
          </p>

          {/* Awards */}
          {author.awards && author.awards.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Honors & Awards</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {author.awards.map((award, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                  >
                    🏆 {award}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Authored Stories Bibliography */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Authored Manuscripts ({authorStories.length})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {authorStories.map((story) => (
              <div
                key={story.id}
                onClick={() => {
                  onClose();
                  onSelectStory(story);
                }}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-white dark:hover:bg-zinc-900 transition-all cursor-pointer flex gap-3 group"
              >
                <div className="w-14 h-20 rounded-xl overflow-hidden shadow shrink-0">
                  <BookCover
                    title={story.title}
                    author={story.author}
                    category={story.category}
                    coverColorTheme={story.coverColorTheme}
                    coverImage={story.coverImage}
                    size="sm"
                  />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-serif font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1">
                    {story.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 line-clamp-2 leading-tight">
                    {story.description}
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[10px]">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {story.isFree ? 'FREE' : `₦${story.priceNGN.toLocaleString()}`}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500">{story.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
