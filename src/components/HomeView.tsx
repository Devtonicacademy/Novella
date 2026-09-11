import React from 'react';
import { Story } from '../types';
import { StoryCard } from './StoryCard';
import { BookCover } from './BookCover';
import { Sparkles, BookOpen, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onReadStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
  onNavigate: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stories,
  onSelectStory,
  onReadStory,
  onUnlockStory,
  onNavigate,
}) => {
  const { isStoryUnlocked } = useAuth();

  // First 2 books are guaranteed free
  const freeStories = stories.filter((s) => s.isFree);
  const premiumStories = stories.filter((s) => !s.isFree);
  const featuredStory = stories[0] || null;

  return (
    <div className="space-y-12 pb-16">
      {/* Editorial Storytelling Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-zinc-200/60 dark:border-zinc-800/60 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Modern African Storytelling & Literature</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                Discover amazing stories and unlock your next adventure.
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-reading">
                Immerse yourself in folklore, desert odysseys, musical memoirs, and political allegories. Every reader can read the first <strong>2 story books for free</strong>—unlock premium full-length manuscripts instantly with Paystack.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                {featuredStory && (
                  <button
                    onClick={() => onReadStory(featuredStory)}
                    className="px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read Free Story #1</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('explore')}
                  className="px-5 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-amber-600 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Full Library</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="flex items-center justify-center lg:justify-start gap-5 pt-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>2 Free Books for All</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Paystack Payments</span>
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
                  <BookCover story={featuredStory} size="lg" isUnlocked={true} />
                </div>
                <div className="text-center mt-3">
                  <span className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">
                    Featured Free Release
                  </span>
                  <h3 className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {featuredStory.title}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 1: Free Stories (First 2 Books Guaranteed Free for All) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complimentary Access</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Free Stories for Everyone
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Read these complete books immediately without any payment or locked chapters.
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

      {/* Section 2: Premium & Locked Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Premium Catalog</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Premium Adventures & Chronicles
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Pay once with Paystack and unlock permanent lifetime access to full chapters.
            </p>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All ({stories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {premiumStories.slice(0, 4).map((story) => (
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
      </section>

      {/* Literary Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 sm:p-10 bg-zinc-900 text-white relative overflow-hidden shadow-xl border border-zinc-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-amber-600/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Literary Heritage
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
              "Music is a catholic code that everyone understands..."
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-reading leading-relaxed">
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
