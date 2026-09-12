import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  BookOpen, 
  Check, 
  Feather, 
  Compass, 
  Layers, 
  GitBranch, 
  Sliders, 
  Send,
  AlertCircle
} from 'lucide-react';
import { Story, StoryCategory, AIGenerateStoryRequest } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AIStoryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryPublished?: (story: Story) => void;
  onStoryCreated?: (story: Story) => void;
  onReadNow?: (story: Story) => void;
}

const CATEGORIES: StoryCategory[] = [
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

export const AIStoryGeneratorModal: React.FC<AIStoryGeneratorModalProps> = ({
  isOpen,
  onClose,
  onStoryPublished,
  onStoryCreated,
  onReadNow,
}) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<StoryCategory>('African Stories');
  const [characters, setCharacters] = useState('');
  const [setting, setSetting] = useState('');
  const [theme, setTheme] = useState('');
  const [chaptersCount, setChaptersCount] = useState(2);
  const [interactive, setInteractive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generated story preview state
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'preview'>('create');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a story idea or prompt');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const request: AIGenerateStoryRequest = {
        prompt: prompt.trim(),
        genre,
        characters: characters.trim() || undefined,
        setting: setting.trim() || undefined,
        theme: theme.trim() || undefined,
        chaptersCount,
        interactive,
      };

      const story = await api.generateAIStory(request);
      setGeneratedStory(story);
      setEditingTitle(story.title);
      setEditingDescription(story.description);
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedStory) return;
    setPublishing(true);
    setError(null);

    try {
      const storyToPublish: Partial<Story> = {
        ...generatedStory,
        title: editingTitle || generatedStory.title,
        description: editingDescription || generatedStory.description,
        author: user?.displayName || user?.fullName || 'Novella Creator & AI',
        authorId: user?.id,
        authorBio: user?.bio || 'Storyteller on Novella',
        category: genre,
        isFree: true,
        isInteractive: interactive,
      };

      const published = await api.createStory(storyToPublish);
      setPublishSuccess(true);
      if (onStoryPublished) onStoryPublished(published);
      if (onStoryCreated) onStoryCreated(published);
      setTimeout(() => {
        setPublishSuccess(false);
        onClose();
        if (onReadNow) onReadNow(published);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Could not publish story');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">
                AI Story Studio
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Generate original prose, multi-chapter epics, and branching adventures
              </p>
            </div>
          </div>
          <button
            id="close-ai-generator-modal"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Switch */}
        {generatedStory && (
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/50 p-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'create'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Configure Idea & Prompt
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Generated Manuscript Preview
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <div className="space-y-5">
              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Story Idea or Prompt *
                </label>
                <textarea
                  id="ai-prompt-input"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A young blacksmith in ancient Kano discovers an enchanted meteorite that can forge weapons that command lightning..."
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Genre / Category Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Category & Genre
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGenre(cat)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all ${
                        genre === cat
                          ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Story Elements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Protagonist / Characters
                  </label>
                  <input
                    type="text"
                    value={characters}
                    onChange={(e) => setCharacters(e.target.value)}
                    placeholder="e.g. Amina & Musa"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Setting / Location
                  </label>
                  <input
                    type="text"
                    value={setting}
                    onChange={(e) => setSetting(e.target.value)}
                    placeholder="e.g. Lagos, 1970s"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Core Theme / Moral
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g. Integrity & Courage"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Story Structure & Interactive Branching Mode */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Chapters Length</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setChaptersCount(num)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          chaptersCount === num
                            ? 'bg-amber-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Interactive Choices (Choose-Your-Own-Adventure)
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Generates branching choices at the end of each chapter
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={interactive}
                      onChange={(e) => setInteractive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            // Preview / Edit generated story
            generatedStory && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Story Title
                    </label>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Description & Synopsis
                    </label>
                    <textarea
                      rows={2}
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      className="w-full text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                      {generatedStory.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {generatedStory.chapters.length} Chapters
                    </span>
                    {generatedStory.isInteractive && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> Branching Paths
                      </span>
                    )}
                  </div>
                </div>

                {/* Chapters Preview */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Manuscript Chapters
                  </h4>
                  {generatedStory.chapters.map((ch, idx) => (
                    <div
                      key={ch.id || idx}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {ch.title}
                        </div>
                        <span className="text-[11px] text-zinc-500">{ch.readMinutes} min read</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed font-serif">
                        {ch.content}
                      </p>
                      {ch.choices && ch.choices.length > 0 && (
                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
                          {ch.choices.map((choice) => (
                            <span
                              key={choice.id}
                              className="text-[10px] px-2 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 font-medium"
                            >
                              👉 {choice.choiceText}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          {activeTab === 'create' ? (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                id="generate-story-button"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing Original Manuscript...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Story</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (generatedStory) {
                      onClose();
                      if (onReadNow) onReadNow(generatedStory);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Preview Read
                </button>
                <button
                  id="publish-ai-story-button"
                  onClick={handlePublish}
                  disabled={publishing || publishSuccess}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {publishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing to Catalog...</span>
                    </>
                  ) : publishSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Published!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Save & Publish to Catalog</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
