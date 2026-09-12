import React, { useState, useMemo } from 'react';
import { Search, X, Filter, BookOpen, Star, Sparkles, GitBranch } from 'lucide-react';
import { Story, StoryCategory } from '../types';
import { BookCover } from './BookCover';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  onSelectStory: (story: Story) => void;
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

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  stories,
  onSelectStory,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [interactiveOnly, setInteractiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'chapters' | 'title'>('rating');

  const filteredStories = useMemo(() => {
    return stories
      .filter((story) => {
        // Query match
        const q = query.toLowerCase().trim();
        const matchesQuery =
          !q ||
          story.title.toLowerCase().includes(q) ||
          story.author.toLowerCase().includes(q) ||
          story.description.toLowerCase().includes(q) ||
          story.synopsis?.toLowerCase().includes(q) ||
          story.tags?.some((t) => t.toLowerCase().includes(q));

        // Category filter
        const matchesCategory =
          selectedCategory === 'All' ||
          story.category.toLowerCase() === selectedCategory.toLowerCase();

        // Free filter
        const matchesFree = !freeOnly || story.isFree || story.order <= 2;

        // Interactive filter
        const matchesInteractive = !interactiveOnly || story.isInteractive;

        return matchesQuery && matchesCategory && matchesFree && matchesInteractive;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        if (sortBy === 'chapters') return (b.chapters?.length || 0) - (a.chapters?.length || 0);
        return a.title.localeCompare(b.title);
      });
  }, [stories, query, selectedCategory, freeOnly, interactiveOnly, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Search Bar Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-500" />
              <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Advanced Story Finder
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, themes, or keywords..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            />
            <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-3.5" />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Free Stories</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={interactiveOnly}
                  onChange={(e) => setInteractiveOnly(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-purple-500" />
                  <span>Interactive Branches</span>
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-xs py-1 px-2 text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-amber-500"
              >
                <option value="rating">Top Rated</option>
                <option value="chapters">Most Chapters</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-1">
            {filteredStories.length} Storie{filteredStories.length === 1 ? 'y' : 's'} found
          </div>

          {filteredStories.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs">No manuscripts match your search filters.</p>
            </div>
          ) : (
            filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => {
                  onClose();
                  onSelectStory(story);
                }}
                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-white dark:hover:bg-zinc-900 transition-all cursor-pointer flex gap-4 group"
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1">
                      {story.title}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      {story.isFree || story.order <= 2 ? 'FREE' : `₦${story.priceNGN.toLocaleString()}`}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {story.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {story.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{story.rating || 5.0}</span>
                    </span>
                    <span>•</span>
                    <span>{story.category}</span>
                    {story.isInteractive && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-[9px]">
                        CHOICES
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
