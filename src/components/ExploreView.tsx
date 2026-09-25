import React, { useState } from 'react';
import { Story, StoryCategory } from '../types';
import { StoryCard } from './StoryCard';
import { Search, Filter, Sparkles, Lock, GitBranch, ArrowUpDown } from 'lucide-react';

interface ExploreViewProps {
  stories: Story[];
  initialCategory?: string;
  onSelectStory: (story: Story) => void;
  onReadStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
}

const ALL_CATEGORIES: (StoryCategory | 'All')[] = [
  'All',
  'African Stories',
  'Adventure',
  'Moral Stories',
  'School Stories',
  'Romance',
  'Mystery',
  'Horror',
  'Comedy',
  'Fantasy',
  'Political Satire',
  'Folklore'
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  stories,
  initialCategory = 'All',
  onSelectStory,
  onReadStory,
  onUnlockStory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [interactiveOnly, setInteractiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'chapters'>('rating');

  const filteredStories = stories
    .filter((story) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        story.title.toLowerCase().includes(q) ||
        story.author.toLowerCase().includes(q) ||
        story.tags.some((t) => t.toLowerCase().includes(q)) ||
        story.description.toLowerCase().includes(q) ||
        story.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All' || story.category.toLowerCase() === selectedCategory.toLowerCase();

      const isFree = story.isFree || story.order <= 2;
      const matchesPricing =
        pricingFilter === 'all' ||
        (pricingFilter === 'free' && isFree) ||
        (pricingFilter === 'premium' && !isFree);

      const matchesInteractive = !interactiveOnly || story.isInteractive;

      return matchesSearch && matchesCategory && matchesPricing && matchesInteractive;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'chapters') return (b.chapters?.length || 0) - (a.chapters?.length || 0);
      return (b.order || 0) - (a.order || 0);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Manuscript Library & Catalog
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-serif">
            Explore African folklore, school adventures, branching interactive sagas, and contemporary epics.
          </p>
        </div>

        <div className="text-xs text-zinc-500">
          Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredStories.length}</span> of {stories.length} titles
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, keyword, or character..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
          </div>

          {/* Pricing Quick Filter & Interactive Toggle Container */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 touch-scroll scrollbar-none">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0">
              <button
                onClick={() => setPricingFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                  pricingFilter === 'all'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPricingFilter('free')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[36px] ${
                  pricingFilter === 'free'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Free Books</span>
              </button>
              <button
                onClick={() => setPricingFilter('premium')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[36px] ${
                  pricingFilter === 'premium'
                    ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Premium</span>
              </button>
            </div>

            {/* Interactive Toggle */}
            <button
              onClick={() => setInteractiveOnly(!interactiveOnly)}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
                interactiveOnly
                  ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 bg-white dark:bg-zinc-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Interactive</span>
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-scroll">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-2">
          <p className="font-serif text-base font-bold text-zinc-700 dark:text-zinc-300">
            No stories match your search filters
          </p>
          <p className="text-xs text-zinc-500">
            Try adjusting your keywords or clearing the category selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onSelectStory={onSelectStory}
              onReadStory={onReadStory}
              onUnlockStory={onUnlockStory}
              layout="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
};
