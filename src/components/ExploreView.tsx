import React, { useState } from 'react';
import { Story } from '../types';
import { StoryCard } from './StoryCard';
import { Search, Filter, Sparkles, Lock } from 'lucide-react';

interface ExploreViewProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onReadStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  stories,
  onSelectStory,
  onReadStory,
  onUnlockStory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'premium'>('all');

  const categories = ['All', 'Folklore', 'Historical', 'Afrofuturism', 'Mystery & Thriller', 'Romance', 'Sci-Fi & Fantasy', 'Memoir'];

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || story.category === selectedCategory;

    const matchesPricing =
      pricingFilter === 'all' ||
      (pricingFilter === 'free' && story.isFree) ||
      (pricingFilter === 'premium' && !story.isFree);

    return matchesSearch && matchesCategory && matchesPricing;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          The Story Catalog & Library
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-reading">
          Explore all manuscripts, folklore epics, Afrofuturistic odysseys, and memoirs.
        </p>
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
              placeholder="Search by title, author, themes, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-600/50"
            />
          </div>

          {/* Pricing Quick Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setPricingFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pricingFilter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPricingFilter('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                pricingFilter === 'free'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Free Books</span>
            </button>
            <button
              onClick={() => setPricingFilter('premium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                pricingFilter === 'premium'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Premium</span>
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
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
        <div className="text-center py-16 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
          <p className="font-display text-base font-bold text-zinc-700 dark:text-zinc-300">
            No stories match your criteria
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your search query or removing category filters.
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
