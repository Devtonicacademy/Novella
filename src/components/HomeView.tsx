import React from 'react';
import { Story, Author, CategoryInfo } from '../types';
import { StoryCard } from './StoryCard';
import { BookCover } from './BookCover';
import { 
  Sparkles, 
  BookOpen, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  GitBranch, 
  Users, 
  Play, 
  Check, 
  Star,
  Flame,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  stories: Story[];
  authors: Author[];
  categories: CategoryInfo[];
  onSelectStory: (story: Story) => void;
  onReadStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
  onNavigate: (tab: string, category?: string) => void;
  onOpenAIStudio: () => void;
  onSelectAuthor: (author: Author) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stories,
  authors,
  categories,
  onSelectStory,
  onReadStory,
  onUnlockStory,
  onNavigate,
  onOpenAIStudio,
  onSelectAuthor,
}) => {
  const { user, isStoryUnlocked } = useAuth();

  // Filter Continue Reading Stories
  const continueReadingStories = (Object.entries(user?.readingProgress || {})
    .map(([storyId, progress]) => {
      const found = stories.find((s) => s.id === storyId);
      if (!found) return null;
      return { story: found, progress };
    })
    .filter(Boolean) as { story: Story; progress: any }[]);

  const freeStories = stories.filter((s) => s.isFree || s.order <= 2);
  const premiumStories = stories.filter((s) => !s.isFree && s.order > 2);
  const interactiveStories = stories.filter((s) => s.isInteractive);
  const featuredStory = stories[0] || null;

  return (
    <div className="space-y-12 pb-20 animate-fadeIn">
      {/* Editorial Storytelling Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-zinc-200/60 dark:border-zinc-800/60 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
            <div className="flex-1 text-center lg:text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>African & Contemporary Literature Platform</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                Immerse in captivating stories, audiobooks, and interactive sagas.
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-serif">
                Discover moral folktales, school adventures, mystery epics, and music memoirs. Read the first <strong>2 books 100% free</strong>, listen with natural Read-Aloud audio, or create your own with AI Story Studio.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                {featuredStory && (
                  <button
                    id="hero-read-first-free-story-btn"
                    onClick={() => onReadStory(featuredStory)}
                    className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Start Reading Free Story #1</span>
                  </button>
                )}

                <button
                  id="hero-open-ai-studio-btn"
                  onClick={onOpenAIStudio}
                  className="px-5 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-amber-500 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Story Studio</span>
                </button>

                <button
                  onClick={() => onNavigate('explore')}
                  className="px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore All Genres</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>2 Free Guaranteed Books</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Paystack Instant Unlocks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                  <span>Branching Choice Stories</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Anchor: Book Showcase */}
            {featuredStory && (
              <div
                onClick={() => onSelectStory(featuredStory)}
                className="lg:w-80 shrink-0 cursor-pointer group flex flex-col items-center"
              >
                <div className="transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-1">
                  <BookCover
                    title={featuredStory.title}
                    author={featuredStory.author}
                    category={featuredStory.category}
                    coverColorTheme={featuredStory.coverColorTheme}
                    coverImage={featuredStory.coverImage}
                    size="lg"
                    isUnlocked={true}
                  />
                </div>
                <div className="text-center mt-3">
                  <span className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                    Featured Free Release
                  </span>
                  <h3 className="font-serif text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                    {featuredStory.title}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Continue Reading Shelf (If user has progress) */}
      {continueReadingStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Continue Reading
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueReadingStories.slice(0, 3).map(({ story, progress }) => (
              <div
                key={story.id}
                onClick={() => onReadStory(story)}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 shadow-sm flex items-center gap-4 cursor-pointer group transition-all"
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
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="font-serif font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 line-clamp-1">
                    {story.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 line-clamp-1">
                    {story.author}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Progress</span>
                      <span className="font-bold text-amber-600">{progress.scrollPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${progress.scrollPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Story Categories Showcase Horizontal Carousel & Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Explore Genres
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Story Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('explore', cat.name)}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:shadow-md transition-all text-left space-y-1 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                {cat.name.charAt(0)}
              </div>
              <div className="font-serif font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 truncate">
                {cat.name}
              </div>
              <div className="text-[10px] text-zinc-400">
                {stories.filter((s) => s.category === cat.name).length} stories
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Section: Guaranteed Free Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complimentary Access</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Free Stories for Everyone
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Read these complete manuscripts immediately with full chapters and audio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {freeStories.slice(0, 2).map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onSelectStory={onSelectStory}
              onReadStory={onReadStory}
              onUnlockStory={onUnlockStory}
              layout="horizontal"
            />
          ))}
        </div>
      </section>

      {/* Section: Interactive Choose-Your-Own-Adventure Stories */}
      {interactiveStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-zinc-900 to-stone-950 border border-purple-500/20 text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <GitBranch className="w-4 h-4" />
                  <span>Interactive Storytelling</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                  Choose Your Own Adventure
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                  Decide the fate of your characters. Every choice branches into new perils, hidden alliances, and alternate endings.
                </p>
              </div>

              <button
                onClick={onOpenAIStudio}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-purple-600/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Interactive Story</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interactiveStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => onSelectStory(story)}
                  className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 hover:border-purple-400 backdrop-blur-sm flex items-center gap-4 cursor-pointer group transition-all"
                >
                  <div className="w-16 h-24 rounded-xl overflow-hidden shadow shrink-0">
                    <BookCover
                      title={story.title}
                      author={story.author}
                      category={story.category}
                      coverColorTheme={story.coverColorTheme}
                      coverImage={story.coverImage}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40">
                      BRANCHING PATHS
                    </span>
                    <h3 className="font-serif font-bold text-sm text-white group-hover:text-purple-300 line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-2">
                      {story.description}
                    </p>
                    <div className="text-[10px] text-zinc-400">
                      {story.chapters.length} Chapters • Multiple Endings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section: Trending & Highly Rated */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Reader Favorites</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Trending Top Stories
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              The highest-rated manuscripts loved by the Novella community.
            </p>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({stories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.slice(0, 4).map((story, index) => (
            <div key={story.id} className="relative">
              <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-xl bg-black/80 text-white font-serif font-bold text-xs flex items-center justify-center shadow-md border border-white/20">
                #{index + 1}
              </div>
              <StoryCard
                story={story}
                onSelectStory={onSelectStory}
                onReadStory={onReadStory}
                onUnlockStory={onUnlockStory}
                layout="grid"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Authors Shelf */}
      {authors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Literary Voices</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Featured Authors & Creators
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {authors.slice(0, 3).map((author) => (
              <div
                key={author.id}
                onClick={() => onSelectAuthor(author)}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 shadow-sm space-y-3 cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                    <img
                      src={author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 truncate flex items-center gap-1.5">
                      <span>{author.name}</span>
                      {author.verified && <Check className="w-3 h-3 text-amber-500" />}
                    </div>
                    <div className="text-[11px] text-zinc-500">{author.primaryGenre || 'Novelist'}</div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{author.averageRating || '4.9'} rating</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-serif">
                  {author.bio}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
                  <span>{(author.followersCount || 100).toLocaleString()} followers</span>
                  <span className="text-amber-600 font-bold group-hover:underline">View Profile →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Literary Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 sm:p-10 bg-zinc-900 text-white relative overflow-hidden shadow-xl border border-zinc-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-amber-600/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Literary Heritage
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              "Music is a catholic code that everyone understands..."
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
              Read the nostalgic chronicle <em>Five Spirits from the East</em>, celebrating Kabaka, Dan Satch, and Warrior of Oriental Brothers International, risen from the ashes of war.
            </p>
            {stories[1] && (
              <button
                onClick={() => onReadStory(stories[1])}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Story #2 for Free</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
