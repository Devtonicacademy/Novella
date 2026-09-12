import React from 'react';
import { Star, ChevronDown, ChevronUp, Users, MessageSquare, Sparkles } from 'lucide-react';

export interface StarRatingDisplayProps {
  rating: number; // e.g. 4.7
  ratingsCount?: number; // e.g. 14076 or 1245
  reviewCount?: number; // e.g. 328
  breakdown?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  variant?: 'card' | 'detailed' | 'reader' | 'inline' | 'hero' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCountText?: boolean; // e.g. "1,245 people rated this story"
  showReviewsText?: boolean; // e.g. "328 reviews"
  showRateButton?: boolean;
  userRating?: number; // Previous rating by current user
  onRateClick?: () => void;
  onReviewsClick?: () => void;
  className?: string;
  id?: string;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  rating = 4.7,
  ratingsCount = 1245,
  reviewCount = 328,
  breakdown,
  variant = 'detailed',
  size = 'md',
  showCountText = true,
  showReviewsText = true,
  showRateButton = false,
  userRating,
  onRateClick,
  onReviewsClick,
  className = '',
  id,
}) => {
  const [showBreakdown, setShowBreakdown] = React.useState(false);

  // Normalize rating to 1 decimal place
  const normalizedRating = Math.min(Math.max(Number(rating) || 0, 0), 5);
  const formattedScore = normalizedRating.toFixed(1);

  // Calculate percentage star fills
  const stars = [1, 2, 3, 4, 5].map((index) => {
    const fillAmount = Math.max(0, Math.min(1, normalizedRating - (index - 1)));
    return {
      index,
      fillPercentage: Math.round(fillAmount * 100),
    };
  });

  // Calculate breakdown percentages
  const totalCount = ratingsCount || 1;
  const computedBreakdown = breakdown || {
    5: Math.round(totalCount * 0.78),
    4: Math.round(totalCount * 0.14),
    3: Math.round(totalCount * 0.05),
    2: Math.round(totalCount * 0.02),
    1: Math.round(totalCount * 0.01),
  };

  // Star size mapping
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  };

  const scoreSizes = {
    xs: 'text-xs font-bold',
    sm: 'text-sm font-bold',
    md: 'text-base sm:text-lg font-extrabold',
    lg: 'text-xl sm:text-2xl font-extrabold',
  };

  // Render individual star with fractional fill
  const renderStar = (index: number, fillPercentage: number, keyPrefix = 'star') => {
    const gradId = `star-grad-${keyPrefix}-${index}-${fillPercentage}-${Math.random().toString(36).substr(2, 5)}`;
    const isFull = fillPercentage >= 100;
    const isEmpty = fillPercentage <= 0;

    return (
      <span key={index} className="relative inline-flex items-center justify-center">
        {isFull ? (
          <svg
            viewBox="0 0 24 24"
            className={`${starSizes[size]} text-amber-500 fill-amber-500 drop-shadow-xs transition-transform duration-200`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            />
          </svg>
        ) : isEmpty ? (
          <svg
            viewBox="0 0 24 24"
            className={`${starSizes[size]} text-amber-500/30 dark:text-zinc-700 fill-none stroke-current stroke-[1.75]`}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className={`${starSizes[size]} drop-shadow-xs`}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={`${fillPercentage}%`} stopColor="#f59e0b" />
                <stop offset={`${fillPercentage}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Background empty star stroke */}
            <path
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
            {/* Partial Fill Overlay */}
            <path
              fill={`url(#${gradId})`}
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            />
          </svg>
        )}
      </span>
    );
  };

  // Compact card variant: 4.7 ★★★★★ (14,076)
  if (variant === 'card' || variant === 'inline') {
    return (
      <div
        id={id}
        className={`inline-flex items-center gap-1.5 font-sans ${className}`}
      >
        <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
          {formattedScore}
        </span>
        <div className="flex items-center gap-0.5">
          {stars.map((s) => renderStar(s.index, s.fillPercentage, 'card'))}
        </div>
        {ratingsCount !== undefined && (
          <span className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-semibold tabular-nums hover:underline cursor-pointer" onClick={onReviewsClick || onRateClick}>
            ({ratingsCount.toLocaleString()})
          </span>
        )}
      </div>
    );
  }

  // Reader Top / Inline Bar variant
  if (variant === 'reader') {
    return (
      <div
        id={id}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-xs ${className}`}
      >
        <span className="font-extrabold text-amber-900 dark:text-amber-200 tabular-nums">
          {formattedScore}
        </span>
        <div className="flex items-center gap-0.5">
          {stars.map((s) => renderStar(s.index, s.fillPercentage, 'reader'))}
        </div>
        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold tabular-nums">
          {ratingsCount.toLocaleString()} ratings
        </span>
      </div>
    );
  }

  // Detailed Full-Scale Variant (Matches reference image visual + details)
  return (
    <div
      id={id}
      className={`rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 space-y-3.5 transition-all ${className}`}
    >
      {/* Visual Reference Header: 4.7 ★★★★★ 14,076 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Average Score (e.g. 4.7) */}
          <span className={`${scoreSizes[size]} text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tight`}>
            {formattedScore}
          </span>

          {/* 5-Star Row */}
          <div className="flex items-center gap-1">
            {stars.map((s) => renderStar(s.index, s.fillPercentage, 'detailed'))}
          </div>

          {/* Total Count in Blue Link Style: 14,076 */}
          {ratingsCount !== undefined && (
            <button
              type="button"
              onClick={onReviewsClick || onRateClick}
              className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer tabular-nums"
              title="View all ratings and reviews"
            >
              {ratingsCount.toLocaleString()}
            </button>
          )}
        </div>

        {/* Action button: Rate this story */}
        {showRateButton && onRateClick && (
          <button
            type="button"
            onClick={onRateClick}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer active:scale-98"
          >
            <Star className="w-3.5 h-3.5 fill-white text-white" />
            <span>{userRating ? `Your Rating: ${userRating}★ (Update)` : 'Rate this story'}</span>
          </button>
        )}
      </div>

      {/* Subtitle Information: Total people rated & review count */}
      {(showCountText || showReviewsText) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
          {showCountText && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                  {ratingsCount.toLocaleString()}
                </strong>{' '}
                people rated this story
              </span>
            </div>
          )}

          {showCountText && showReviewsText && (
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">
              ·
            </span>
          )}

          {showReviewsText && (
            <button
              type="button"
              onClick={onReviewsClick}
              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>
                <strong className="font-semibold">{reviewCount.toLocaleString()}</strong> reviews
              </span>
            </button>
          )}

          {/* Toggle breakdown button */}
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="ml-auto text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{showBreakdown ? 'Hide Rating Breakdown' : 'Rating Breakdown'}</span>
            {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* Expandable Star Breakdown Bar Chart */}
      {showBreakdown && (
        <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-2 text-xs animate-fadeIn">
          {[5, 4, 3, 2, 1].map((starLevel) => {
            const count = computedBreakdown[starLevel as keyof typeof computedBreakdown] || 0;
            const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={starLevel} className="flex items-center gap-2.5">
                <span className="w-9 font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-0.5 justify-end">
                  {starLevel} <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] font-mono text-zinc-500 tabular-nums">
                  {pct}%
                </span>
                <span className="w-16 text-right text-[11px] text-zinc-400 tabular-nums truncate">
                  ({count.toLocaleString()})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
