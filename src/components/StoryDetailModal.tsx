import React, { useState, useEffect } from 'react';
import { Story, Review, StoryCategory } from '../types';
import { INITIAL_CATEGORIES } from '../data/adminMockData';
import { BookCover } from './BookCover';
import { StarRatingDisplay } from './StarRatingDisplay';
import { RateStoryModal } from './RateStoryModal';
import { ShareStoryModal } from './ShareStoryModal';
import { CollectionsModal } from './CollectionsModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, BookOpen, Lock, Sparkles, Star, Check, MessageSquare, ThumbsUp, Plus, Share2, Heart, FolderPlus, Edit3, RefreshCw, AlertCircle } from 'lucide-react';

interface StoryDetailModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onReadStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
  onStoryUpdated?: (updatedStory: Story) => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story: initialStory,
  isOpen,
  onClose,
  onReadStory,
  onUnlockStory,
  onStoryUpdated,
}) => {
  const { isStoryUnlocked, isAuthenticated, openAuthModal, toggleLikeStory, isStoryLiked, isAdmin, user } = useAuth();
  const [story, setStory] = useState<Story | null>(initialStory);
  const [isRateModalOpen, setIsRateModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCollectionsModalOpen, setIsCollectionsModalOpen] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number | undefined>(undefined);
  const [userReview, setUserReview] = useState<Review | undefined>(undefined);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Admin / Author Book Edit State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Partial<Story>>({});
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  const canEdit = Boolean(isAdmin || (user && story && (user.id === story.authorId || user.email === story.authorEmail)));

  const handleStartEdit = () => {
    if (!story) return;
    setEditForm({
      title: story.title,
      subtitle: story.subtitle || '',
      author: story.author,
      category: story.category,
      priceNGN: story.priceNGN,
      priceUSD: story.priceUSD,
      isFree: story.isFree,
      description: story.description,
      synopsis: story.synopsis || story.description,
      status: story.status || 'published',
      coverImage: story.coverImage || '',
    });
    setEditError(null);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!story) return;
    if (!editForm.title?.trim()) {
      setEditError('Story title is required.');
      return;
    }
    if (!editForm.author?.trim()) {
      setEditError('Author name is required.');
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);
    try {
      const updated = await api.updateStory(story.id, editForm);
      setStory(updated);
      if (onStoryUpdated) {
        onStoryUpdated(updated);
      }
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update story:', err);
      setEditError(err.message || 'Failed to update book details.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
    if (story) {
      setEditForm({
        title: story.title,
        subtitle: story.subtitle || '',
        author: story.author,
        category: story.category,
        priceNGN: story.priceNGN,
        priceUSD: story.priceUSD,
        isFree: story.isFree,
        description: story.description,
        synopsis: story.synopsis || story.description,
        status: story.status || 'published',
        coverImage: story.coverImage || '',
      });
    }
  };

  useEffect(() => {
    setStory(initialStory);
    setIsEditing(false);
    setEditError(null);
    if (initialStory && isOpen) {
      // Fetch detailed rating info and reviews
      api.getStoryRatingInfo(initialStory.id).then((info) => {
        if (info.userRating) setUserRating(info.userRating);
        if (info.userReview) setUserReview(info.userReview);
        if (info.recentReviews) setReviewsList(info.recentReviews);
      }).catch(console.warn);

      api.getReviews(initialStory.id).then((revs) => {
        if (revs && revs.length > 0) setReviewsList(revs);
      }).catch(console.warn);
    }
  }, [initialStory, isOpen]);

  if (!isOpen || !story) return null;

  const isUnlocked = isStoryUnlocked(story);

  const handleOpenRate = () => {
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal('signin');
      return;
    }
    setIsRateModalOpen(true);
  };

  const handleRatingSuccess = (updatedStory: Story, rating: number, review?: Review) => {
    setStory(updatedStory);
    setUserRating(rating);
    if (review) {
      setUserReview(review);
      setReviewsList((prev) => [review, ...prev.filter((r) => r.id !== review.id)]);
    }
    if (onStoryUpdated) {
      onStoryUpdated(updatedStory);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal('signin');
      return;
    }
    try {
      const res = await api.likeReview(reviewId);
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, likes: res.likes, likedBy: res.liked ? [...(r.likedBy || []), 'me'] : (r.likedBy || []).filter((u) => u !== 'me') }
            : r
        )
      );
    } catch (e) {
      console.warn('Like review failed:', e);
    }
  };

  const isLiked = Boolean(isStoryLiked?.(story.id));

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal('signin');
      return;
    }
    if (toggleLikeStory) {
      await toggleLikeStory(story.id);
    }
  };

  const handleOpenCollections = () => {
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal('signin');
      return;
    }
    setIsCollectionsModalOpen(true);
  };

  return (
    <>
      <div
        id="story-detail-modal-backdrop"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div
          id="story-detail-modal-card"
          className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden" />

          {/* Header */}
          <div className="px-5 py-3 sm:py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                {story.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>Volume {story.order}</span>
              <span aria-hidden="true">·</span>
              <span>{story.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <button
                  type="button"
                  id="story-detail-edit-header-btn"
                  onClick={handleStartEdit}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Edit Book Details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Book</span>
                </button>
              )}
              <button
                id="close-story-detail-btn"
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-purple-600" />
                      <span>Edit Book Details</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">Update story title, blurb, pricing, and catalog presentation</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {isAdmin ? 'Admin Edit' : 'Author Edit'}
                  </span>
                </div>

                {editError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span className="font-medium">{editError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Story Title *</label>
                    <input
                      type="text"
                      required
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={editForm.subtitle || ''}
                      onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Author Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.author || ''}
                      onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Category / Genre *</label>
                    <select
                      value={editForm.category || 'Folklore'}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as StoryCategory })}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                    >
                      {INITIAL_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing section */}
                {story.order <= 2 ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs text-amber-800 dark:text-amber-300">
                      <strong>Vol #{story.order} Protected Rule:</strong> Introductory books are permanently configured as free stories.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="font-semibold block mb-1">Price in NGN (₦)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={editForm.isFree}
                        value={editForm.isFree ? 0 : (editForm.priceNGN ?? 2000)}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setEditForm({
                            ...editForm,
                            priceNGN: val,
                            priceUSD: Number((val / 1450).toFixed(2))
                          });
                        }}
                        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Price in USD ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={editForm.isFree}
                        value={editForm.isFree ? 0 : (editForm.priceUSD ?? 2.80)}
                        onChange={(e) => setEditForm({ ...editForm, priceUSD: Math.max(0, Number(e.target.value)) })}
                        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Status</label>
                      <select
                        value={editForm.status || 'published'}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-semibold block mb-1">Description / Blurb</label>
                  <textarea
                    rows={3}
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Synopsis / Story Themes</label>
                  <textarea
                    rows={2}
                    value={editForm.synopsis || ''}
                    onChange={(e) => setEditForm({ ...editForm, synopsis: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Cover Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={editForm.coverImage || ''}
                    onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {story.order > 2 && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="editIsFree"
                      checked={editForm.isFree || false}
                      onChange={(e) => {
                        const isFree = e.target.checked;
                        setEditForm({
                          ...editForm,
                          isFree,
                          ...(isFree
                            ? { priceNGN: 0, priceUSD: 0 }
                            : { priceNGN: editForm.priceNGN || 2000, priceUSD: editForm.priceUSD || 2.80 })
                        });
                      }}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <label htmlFor="editIsFree" className="font-medium cursor-pointer">
                      Make this book completely free for all readers (Override paywall)
                    </label>
                  </div>
                )}

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    {isSavingEdit ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Story Hero Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <BookCover story={story} size="md" isUnlocked={isUnlocked} />

              <div className="flex-1 min-w-0 space-y-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {story.title}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Written by <strong className="text-zinc-800 dark:text-zinc-200">{story.author}</strong>
                </p>

                {/* Status & Price Pill / Badge */}
                <div className="pt-1">
                  {story.isFree ? (
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Free Book · Complete Access</span>
                    </div>
                  ) : isUnlocked ? (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unlocked in Your Library</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-baseline gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        ₦{story.priceNGN.toLocaleString()} NGN
                      </span>
                      <span className="text-xs text-zinc-500 tabular-nums">
                        (${(story.priceUSD || 2.99).toFixed(2)} USD)
                      </span>
                    </div>
                  )}
                  {/* Quick Action Badges */}
                  <div className="flex items-center gap-2 pt-2 flex-wrap justify-center sm:justify-start">
                    <button
                      type="button"
                      id="story-detail-like-btn"
                      onClick={handleToggleLike}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                        isLiked
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900/60'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{isLiked ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                      type="button"
                      id="story-detail-collect-btn"
                      onClick={handleOpenCollections}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
                      <span>Add to Collection</span>
                    </button>

                    <button
                      type="button"
                      id="story-detail-share-btn"
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* UPGRADED STAR RATING SECTION - Exactly matching reference */}
            <div id="story-rating-summary-section">
              <StarRatingDisplay
                id="story-detail-rating-display"
                rating={story.rating}
                ratingsCount={story.ratingsCount}
                reviewCount={story.reviewCount || reviewsList.length}
                breakdown={story.ratingBreakdown}
                variant="detailed"
                size="lg"
                showCountText={true}
                showReviewsText={true}
                showRateButton={true}
                userRating={userRating}
                onRateClick={handleOpenRate}
                onReviewsClick={() => setActiveTab('reviews')}
              />
            </div>

            {/* Navigation Tabs (Overview & Chapters / Reviews) */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold">
              <button
                type="button"
                id="tab-overview-btn"
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 px-4 transition-colors relative cursor-pointer ${
                  activeTab === 'details'
                    ? 'text-amber-700 dark:text-amber-400 border-b-2 border-amber-600'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Story Details & Chapters
              </button>
              <button
                type="button"
                id="tab-reviews-btn"
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 px-4 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'text-amber-700 dark:text-amber-400 border-b-2 border-amber-600'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Reviews ({story.reviewCount || reviewsList.length})</span>
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Synopsis */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Synopsis & Themes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-reading">
                    {story.synopsis || story.description}
                  </p>
                </div>

                {/* Chapter Outline */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-2">
                    Chapters ({story.totalChapters})
                  </h3>
                  <div className="space-y-1.5">
                    {(story.chapters || []).map((ch, idx) => (
                      <div
                        key={ch.id || idx}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-400 font-semibold text-[11px]">
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.
                          </span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
                            {ch.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                          {ch.readMinutes} min read
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Author Bio */}
                {story.authorBio && (
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5">
                      About the Author
                    </span>
                    {story.authorBio}
                  </div>
                )}
              </div>
            ) : (
              /* Reviews Tab */
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Reader Reviews & Testimonials
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenRate}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{userRating ? 'Update Review' : 'Write a Review'}</span>
                  </button>
                </div>

                {reviewsList.length === 0 ? (
                  <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      No written reviews yet. Be the first to share your review!
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenRate}
                      className="mt-3 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Rate & Review Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                              {rev.userName ? rev.userName[0].toUpperCase() : 'R'}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                                {rev.userName}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Review Stars */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= rev.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {rev.title && (
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {rev.title}
                          </h4>
                        )}

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-reading">
                          {rev.content}
                        </p>

                        <div className="pt-2 flex items-center justify-between border-t border-zinc-200/40 dark:border-zinc-700/40 text-[11px] text-zinc-400">
                          {rev.hasSpoilers && (
                            <span className="text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                              Contains Spoilers
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleLikeReview(rev.id)}
                            className="ml-auto flex items-center gap-1 text-zinc-500 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({rev.likes || 0})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

          {/* Modal Action Footer */}
          <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/95 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
            {isEditing ? (
              <>
                <button
                  type="button"
                  id="story-detail-cancel-edit-btn"
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="story-detail-save-edit-btn"
                  onClick={() => handleSaveEdit()}
                  disabled={isSavingEdit}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer min-h-[46px]"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  id="story-detail-close-btn"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer min-h-[44px]"
                >
                  Close
                </button>

                {isUnlocked ? (
                  <button
                    id="story-detail-read-btn"
                    onClick={() => {
                      onClose();
                      onReadStory(story);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer min-h-[46px]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read Story</span>
                  </button>
                ) : (
                  <button
                    id="story-detail-unlock-btn"
                    onClick={() => {
                      onClose();
                      onUnlockStory(story);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer min-h-[46px]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Unlock Story · ₦{story.priceNGN.toLocaleString()}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Rate Story Modal */}
      {isRateModalOpen && (
        <RateStoryModal
          isOpen={isRateModalOpen}
          onClose={() => setIsRateModalOpen(false)}
          story={story}
          existingRating={userRating}
          existingReview={userReview}
          onRatingSuccess={handleRatingSuccess}
        />
      )}

      {/* Share Story Modal */}
      {isShareModalOpen && (
        <ShareStoryModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          story={story}
        />
      )}

      {/* Collections Modal */}
      {isCollectionsModalOpen && (
        <CollectionsModal
          isOpen={isCollectionsModalOpen}
          onClose={() => setIsCollectionsModalOpen(false)}
          story={story}
        />
      )}
    </>
  );
};

