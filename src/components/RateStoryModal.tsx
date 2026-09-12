import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { Story, Review, UserStoryRating } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface RateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
  onRatingSuccess?: (updatedStory: Story, userRating: number, review?: Review) => void;
  existingRating?: number;
  existingReview?: Review;
}

const RATING_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: 'Poor', desc: 'Needs substantial improvement' },
  2: { label: 'Fair', desc: 'Could be much better' },
  3: { label: 'Good', desc: 'An enjoyable read' },
  4: { label: 'Very Good', desc: 'Highly engaging and well-written' },
  5: { label: 'Masterpiece', desc: 'Exceptional storytelling, highly recommended!' },
};

export const RateStoryModal: React.FC<RateStoryModalProps> = ({
  isOpen,
  onClose,
  story,
  onRatingSuccess,
  existingRating,
  existingReview,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedRating, setSelectedRating] = useState<number>(existingRating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>(existingReview?.title || '');
  const [content, setContent] = useState<string>(existingReview?.content || '');
  const [hasSpoilers, setHasSpoilers] = useState<boolean>(existingReview?.hasSpoilers || false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (existingRating) {
      setSelectedRating(existingRating);
    }
    if (existingReview) {
      setTitle(existingReview.title || '');
      setContent(existingReview.content || '');
      setHasSpoilers(existingReview.hasSpoilers || false);
    }
  }, [existingRating, existingReview, isOpen]);

  if (!isOpen) return null;

  const activeStar = hoverRating || selectedRating;
  const isUpdating = Boolean(existingRating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Please sign in to rate this story.');
      return;
    }

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.rateStory(
        story.id,
        selectedRating,
        title.trim() || undefined,
        content.trim() || undefined,
        hasSpoilers
      );

      setSuccessMessage(response.message || 'Rating submitted successfully!');
      if (onRatingSuccess) {
        onRatingSuccess(response.story, selectedRating, response.review);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit rating. Please try again.');
    }
  };

  return (
    <div
      id="rate-story-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="rate-story-modal-content"
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              {isUpdating ? 'Update Your Rating' : 'Rate this Story'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-md">
              {story.title} by {story.author}
            </p>
          </div>
          <button
            type="button"
            id="close-rate-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {isUpdating && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You previously rated this story <strong>{existingRating} stars</strong>. Submitting a new rating will update your score automatically.
              </span>
            </div>
          )}

          {/* Star Selection Area */}
          <div className="text-center py-2 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Tap stars to rate
            </span>

            {/* 5 Big Star Buttons */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
              {[1, 2, 3, 4, 5].map((starNum) => {
                const isFilled = activeStar >= starNum;
                return (
                  <button
                    key={starNum}
                    type="button"
                    id={`rate-star-btn-${starNum}`}
                    onClick={() => setSelectedRating(starNum)}
                    onMouseEnter={() => setHoverRating(starNum)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 sm:p-2 rounded-xl transition-all transform hover:scale-120 active:scale-95 focus:outline-hidden"
                    title={`${starNum} Star${starNum > 1 ? 's' : ''} - ${RATING_LABELS[starNum].label}`}
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-150 ${
                        isFilled
                          ? 'text-amber-500 fill-amber-500 drop-shadow-sm'
                          : 'text-zinc-300 dark:text-zinc-700 fill-none'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Rating Descriptor */}
            <div className="h-10 flex flex-col items-center justify-center">
              {activeStar > 0 && (
                <div className="animate-fadeIn text-center">
                  <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    {activeStar} of 5 Stars — {RATING_LABELS[activeStar]?.label}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {RATING_LABELS[activeStar]?.desc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Optional Review Details */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                <span>Written Review (Optional)</span>
              </label>
              <span className="text-[11px] text-zinc-400">Help fellow readers</span>
            </div>

            <div>
              <input
                type="text"
                id="rate-modal-review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Review headline (e.g. Masterful pacing & rich characters!)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <textarea
                id="rate-modal-review-content"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts about this story's themes, characters, or writing style..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                id="rate-modal-spoilers-checkbox"
                checked={hasSpoilers}
                onChange={(e) => setHasSpoilers(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 border-zinc-300 dark:border-zinc-700"
              />
              <span>This review contains plot spoilers</span>
            </label>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              id="cancel-rate-btn"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-rate-btn"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>{isUpdating ? 'Update Rating' : 'Submit Rating'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
