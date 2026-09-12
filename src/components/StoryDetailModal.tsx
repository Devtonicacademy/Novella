import React, { useState, useEffect } from 'react';
import { Story, Review } from '../types';
import { BookCover } from './BookCover';
import { StarRatingDisplay } from './StarRatingDisplay';
import { RateStoryModal } from './RateStoryModal';
import { ShareStoryModal } from './ShareStoryModal';
import { CollectionsModal } from './CollectionsModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, BookOpen, Lock, Sparkles, Star, Check, MessageSquare, ThumbsUp, Plus, Share2, Heart, FolderPlus } from 'lucide-react';

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
  const { isStoryUnlocked, isAuthenticated, openAuthModal, toggleLikeStory, isStoryLiked } = useAuth();
  const [story, setStory] = useState<Story | null>(initialStory);
  const [isRateModalOpen, setIsRateModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCollectionsModalOpen, setIsCollectionsModalOpen] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number | undefined>(undefined);
  const [userReview, setUserReview] = useState<Review | undefined>(undefined);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  useEffect(() => {
    setStory(initialStory);
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

  return (
    <>
      <div
        id="story-detail-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div
          id="story-detail-modal-card"
          className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                {story.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>Volume {story.order}</span>
              <span aria-hidden="true">·</span>
              <span>{story.readTime}</span>
            </div>
            <button
              id="close-story-detail-btn"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
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
                      onClick={() => toggleLikeStory(story.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                        isStoryLiked(story.id)
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900/60'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isStoryLiked(story.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{isStoryLiked(story.id) ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                      type="button"
                      id="story-detail-collect-btn"
                      onClick={() => setIsCollectionsModalOpen(true)}
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
          </div>

          {/* Modal Action Footer */}
          <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex items-center justify-between gap-3">
            <button
              id="story-detail-close-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
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
                className="px-6 py-2.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Story · ₦{story.priceNGN.toLocaleString()}</span>
              </button>
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

