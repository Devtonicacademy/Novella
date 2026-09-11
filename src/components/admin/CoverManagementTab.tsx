import React, { useState } from 'react';
import { Story } from '../../types';
import { BookCover } from '../BookCover';
import {
  Palette,
  Sparkles,
  Upload,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Save,
  BookOpen,
  Wand2,
  Sliders,
  Layers
} from 'lucide-react';

interface CoverManagementTabProps {
  stories: Story[];
  onSaveCover: (storyId: string, coverData: { coverImage?: string; coverColorTheme?: any }) => Promise<void>;
}

const PRESET_THEMES = [
  {
    name: 'Midnight Gold (Luxury African Folklore)',
    bgGradient: 'from-amber-950 via-zinc-900 to-black',
    accent: '#d97706',
    text: '#fef3c7',
    border: '#78350f',
  },
  {
    name: 'Royal Purple & Amethyst (High Fantasy)',
    bgGradient: 'from-purple-950 via-zinc-900 to-black',
    accent: '#9333ea',
    text: '#f3e8ff',
    border: '#581c87',
  },
  {
    name: 'Emerald Rainforest & Moss (Mythology)',
    bgGradient: 'from-emerald-950 via-zinc-900 to-black',
    accent: '#059669',
    text: '#d1fae5',
    border: '#064e3b',
  },
  {
    name: 'Crimson Savannah (Adventure & War)',
    bgGradient: 'from-red-950 via-zinc-900 to-black',
    accent: '#dc2626',
    text: '#fee2e2',
    border: '#7f1d1d',
  },
  {
    name: 'Sapphire Horizon (Mystery & Historical)',
    bgGradient: 'from-blue-950 via-zinc-900 to-black',
    accent: '#2563eb',
    text: '#dbeafe',
    border: '#1e3a8a',
  },
  {
    name: 'Solar Ochre & Bronze (Afrofuturism)',
    bgGradient: 'from-yellow-950 via-amber-900 to-zinc-950',
    accent: '#eab308',
    text: '#fef9c3',
    border: '#713f12',
  },
];

const CURATED_IMAGE_PRESETS = [
  {
    title: 'Ancient Baobab Dusk',
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Vintage Highlife Band',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Brass Kingdom Sun',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'River Goddess Waters',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Sahara Caravan Starlight',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Warrior Spear & Shields',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
  }
];

export const CoverManagementTab: React.FC<CoverManagementTabProps> = ({
  stories,
  onSaveCover,
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string>(stories[0]?.id || '');
  const currentStory = stories.find(s => s.id === selectedStoryId) || stories[0];

  const [coverImage, setCoverImage] = useState<string>(currentStory?.coverImage || '');
  const [theme, setTheme] = useState(currentStory?.coverColorTheme || PRESET_THEMES[0]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when selected story changes
  const handleSelectStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    const story = stories.find(s => s.id === storyId);
    if (story) {
      setCoverImage(story.coverImage || '');
      setTheme(story.coverColorTheme || PRESET_THEMES[0]);
      setSavedSuccess(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setTheme(preset);
  };

  const handleSelectImagePreset = (url: string) => {
    setCoverImage(url);
  };

  const handleClearImage = () => {
    setCoverImage('');
  };

  const handleGenerateDesign = () => {
    // Generate intelligent color palette based on story category
    if (currentStory.category === 'Sci-Fi & Fantasy' || currentStory.category === 'Afrofuturism') {
      setTheme(PRESET_THEMES[1]); // Purple
    } else if (currentStory.category === 'Folklore' || currentStory.category === 'Mythology') {
      setTheme(PRESET_THEMES[0]); // Gold
    } else if (currentStory.category === 'Historical') {
      setTheme(PRESET_THEMES[4]); // Sapphire
    } else {
      setTheme(PRESET_THEMES[3]); // Crimson
    }
  };

  const handleSave = async () => {
    if (!currentStory) return;
    setSaving(true);
    try {
      await onSaveCover(currentStory.id, {
        coverImage: coverImage.trim() || undefined,
        coverColorTheme: theme,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!currentStory) {
    return <div className="p-8 text-center text-zinc-500">No stories found.</div>;
  }

  // Construct preview story object
  const previewStory: Story = {
    ...currentStory,
    coverImage: coverImage || undefined,
    coverColorTheme: theme,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Book Cover Art & Theme Studio
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Design typographic covers, customize gradients, and upload high-res photography
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Cover Updated!' : 'Apply Cover to Story'}</span>
        </button>
      </div>

      {/* Story Selection Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Editing Cover For
            </label>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {currentStory.title} by {currentStory.author}
            </span>
          </div>
        </div>

        <select
          value={selectedStoryId}
          onChange={(e) => handleSelectStory(e.target.value)}
          className="w-full sm:w-auto text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold cursor-pointer"
        >
          {stories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.category})
            </option>
          ))}
        </select>
      </div>

      {/* Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live 3D Cover Preview */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col items-center justify-center space-y-4 sticky top-24">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Real-Time Reader Perspective
            </span>
            <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
              {currentStory.title}
            </h3>
          </div>

          <div className="w-56 sm:w-64">
            <BookCover story={previewStory} size="lg" isUnlocked={true} />
          </div>

          <p className="text-[11px] text-zinc-400 text-center max-w-xs">
            Rendered with dual-layer spine shading, embossed gold leaf titling, and category badge.
          </p>
        </div>

        {/* Right Column: Design Controls & Palettes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Smart Theme Generator */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-zinc-900/10 dark:from-purple-950/40 dark:to-zinc-900 border border-purple-200 dark:border-purple-900 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Smart Genre-Matched Color Engine</span>
              </h4>
              <p className="text-[11px] text-zinc-500">Auto-align chromatic accents with genre archetypes</p>
            </div>
            <button
              onClick={handleGenerateDesign}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            >
              Auto-Align
            </button>
          </div>

          {/* Color Presets */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-500" />
                <span>African Literary Palette Presets</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    theme.bgGradient === preset.bgGradient
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-600/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-8 h-10 rounded-lg bg-gradient-to-br ${preset.bgGradient} border border-white/20 shrink-0 shadow-xs`}
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block truncate">
                      {preset.name.split(' (')[0]}
                    </span>
                    <span className="text-[10px] text-zinc-400 block truncate">
                      {preset.name.split(' (')[1]?.replace(')', '') || 'Classic'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Image & Photo Backgrounds */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                <span>Artwork & Photographic Backdrop</span>
              </h4>
              {coverImage && (
                <button
                  onClick={handleClearImage}
                  className="text-xs text-red-600 hover:underline cursor-pointer font-semibold"
                >
                  Clear Photo Backdrop
                </button>
              )}
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="text-xs font-semibold block mb-1 text-zinc-700 dark:text-zinc-300">
                Custom Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            {/* Curated Presets Grid */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-2">
                Curated High-Resolution Presets
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CURATED_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => handleSelectImagePreset(preset.url)}
                    className={`aspect-3/4 rounded-xl overflow-hidden border transition-all cursor-pointer relative group ${
                      coverImage === preset.url
                        ? 'border-purple-600 ring-2 ring-purple-600 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 hover:opacity-80'
                    }`}
                  >
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-end p-1 transition-opacity">
                      <span className="text-[9px] text-white font-semibold truncate leading-tight">
                        {preset.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
