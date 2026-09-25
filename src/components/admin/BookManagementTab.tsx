import React, { useState } from 'react';
import { Story, StoryCategory, Author, CategoryInfo } from '../../types';
import { INITIAL_CATEGORIES } from '../../data/adminMockData';
import { BookCover } from '../BookCover';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Lock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowUpDown,
  X,
  Palette,
  Upload,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface BookManagementTabProps {
  stories: Story[];
  authors: Author[];
  categories: CategoryInfo[];
  onSaveStory: (story: Partial<Story>) => Promise<void>;
  onDeleteStory: (id: string) => Promise<void>;
  onManageChapters: (story: Story) => void;
  onPreviewStory: (story: Story) => void;
}

export const BookManagementTab: React.FC<BookManagementTabProps> = ({
  stories,
  authors,
  categories,
  onSaveStory,
  onDeleteStory,
  onManageChapters,
  onPreviewStory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccess, setSelectedAccess] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [editingStory, setEditingStory] = useState<Partial<Story> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const availableCategories = categories && categories.length > 0 ? categories : INITIAL_CATEGORIES;

  // Filtered stories
  const filteredStories = stories.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tags && s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesAccess = selectedAccess === 'all' || (selectedAccess === 'free' ? (s.isFree || s.order <= 2) : (!s.isFree && s.order > 2));
    const matchesStatus = selectedStatus === 'all' || (s.status || 'published') === selectedStatus;

    return matchesSearch && matchesCategory && matchesAccess && matchesStatus;
  });

  const handleOpenCreate = () => {
    setFormError(null);
    setEditingStory({
      title: '',
      subtitle: '',
      author: authors[0]?.name || 'Author Name',
      authorBio: authors[0]?.bio || '',
      category: 'Folklore',
      isFree: false,
      priceNGN: 2000,
      priceUSD: 2.80,
      description: '',
      synopsis: '',
      tags: ['African Literature'],
      status: 'published',
      featured: false,
      publishedYear: new Date().getFullYear(),
      coverColorTheme: {
        bgGradient: 'from-amber-950 via-zinc-900 to-black',
        accent: '#d97706',
        text: '#fef3c7',
        border: '#78350f',
      },
      chapters: [
        {
          id: `ch-${Date.now()}-1`,
          order: 1,
          title: 'Chapter 1: The First Step',
          subtitle: 'Opening Passage',
          readMinutes: 6,
          status: 'published',
          content: 'The journey began where the savannah dust kissed the crimson horizon...'
        }
      ]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (story: Story) => {
    setFormError(null);
    setEditingStory({ ...story });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory?.title?.trim()) {
      setFormError('Story title is required.');
      return;
    }
    if (!editingStory?.author?.trim()) {
      setFormError('Author name is required.');
      return;
    }

    setFormError(null);
    setSaving(true);
    try {
      await onSaveStory(editingStory);
      setIsModalOpen(false);
      setEditingStory(null);
    } catch (err: any) {
      console.error('Save story failed:', err);
      setFormError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Manuscripts & Story Books
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your digital library, pricing, publishing status, and manuscript contents
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Book</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Genres ({stories.length})</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Access */}
          <select
            value={selectedAccess}
            onChange={(e) => setSelectedAccess(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Access</option>
            <option value="free">Free Books Only</option>
            <option value="paid">Paid Books Only</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Stories Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Showing <strong>{filteredStories.length}</strong> of <strong>{stories.length}</strong> manuscripts</span>
          <span className="text-[11px]">Rule: Books #1 and #2 remain 100% free for all readers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-2">Book</th>
                <th className="pb-3 px-2">Author & Genre</th>
                <th className="pb-3 px-2">Chapters</th>
                <th className="pb-3 px-2">Pricing (Paystack)</th>
                <th className="pb-3 px-2">Access Type</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredStories.map((story) => {
                const isFreeBook = story.isFree || story.order <= 2;
                return (
                  <tr key={story.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded shadow-xs overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700">
                          {story.coverImage ? (
                            <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${story.coverColorTheme?.bgGradient || 'from-zinc-900 to-black'} flex items-center justify-center text-[9px] text-amber-300 font-bold p-1 text-center leading-tight`}>
                              {story.title.slice(0, 8)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate max-w-[200px]">
                            {story.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">Vol. #{story.order}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{story.author}</span>
                      <span className="text-[11px] text-zinc-500">{story.category}</span>
                    </td>

                    <td className="py-3 px-2">
                      <button
                        onClick={() => onManageChapters(story)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-zinc-700 dark:text-zinc-300 hover:text-purple-700 dark:hover:text-purple-300 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Manage Chapters"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{story.chapters?.length || story.totalChapters} Ch.</span>
                      </button>
                    </td>

                    <td className="py-3 px-2 font-mono">
                      {isFreeBook ? (
                        <span className="text-emerald-600 font-bold">₦0.00 (Free)</span>
                      ) : (
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                          ₦{story.priceNGN.toLocaleString()} <span className="text-zinc-400 font-normal">/ ${story.priceUSD.toFixed(2)}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-2">
                      {isFreeBook ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                          <Sparkles className="w-2.5 h-2.5" />
                          Free Access
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" />
                          Paywall Locked
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        story.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : story.status === 'archived'
                          ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {story.status || 'published'}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-right space-x-1.5">
                      <button
                        onClick={() => onPreviewStory(story)}
                        className="p-1.5 text-zinc-400 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                        title="Live Reader Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(story)}
                        className="p-1.5 text-zinc-400 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit Manuscript"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {story.order > 2 && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove "${story.title}"?`)) {
                              onDeleteStory(story.id);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Manuscript"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Story Modal */}
      {isModalOpen && editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {editingStory.id ? 'Edit Story Manuscript' : 'Publish New Manuscript'}
                </h3>
                <p className="text-xs text-zinc-500">Configure catalog metadata, pricing, and narrative presentation</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Story Title *</label>
                  <input
                    type="text"
                    required
                    value={editingStory.title || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={editingStory.subtitle || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, subtitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Author & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={editingStory.author || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, author: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category / Genre *</label>
                  <select
                    value={editingStory.category || 'Folklore'}
                    onChange={(e) => setEditingStory({ ...editingStory, category: e.target.value as StoryCategory })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              {editingStory.order && editingStory.order <= 2 ? (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    <strong>Rule-Protected Introductory Book (Vol #{editingStory.order}):</strong> Books #1 and #2 are permanently configured as free stories for all readers.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                  <div>
                    <label className="font-semibold block mb-1">Price in NGN (₦)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={editingStory.isFree}
                      value={editingStory.isFree ? 0 : (editingStory.priceNGN ?? 2000)}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setEditingStory({
                          ...editingStory,
                          priceNGN: val,
                          priceUSD: Number((val / 1450).toFixed(2))
                        });
                      }}
                      className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Price in USD ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={editingStory.isFree}
                      value={editingStory.isFree ? 0 : (editingStory.priceUSD ?? 2.80)}
                      onChange={(e) => setEditingStory({ ...editingStory, priceUSD: Math.max(0, Number(e.target.value)) })}
                      className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Publishing Status</label>
                    <select
                      value={editingStory.status || 'published'}
                      onChange={(e) => setEditingStory({ ...editingStory, status: e.target.value as any })}
                      className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Save as Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="font-semibold block mb-1">Description / Blurb</label>
                <textarea
                  rows={3}
                  value={editingStory.description || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, description: e.target.value })}
                  placeholder="A compelling reader hook describing the core conflict..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="font-semibold block mb-1">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editingStory.coverImage || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, coverImage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Free Story Toggle */}
              {(!editingStory.order || editingStory.order > 2) && (
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isFreeStory"
                    checked={editingStory.isFree || false}
                    onChange={(e) => {
                      const isFree = e.target.checked;
                      setEditingStory({
                        ...editingStory,
                        isFree,
                        ...(isFree
                          ? { priceNGN: 0, priceUSD: 0 }
                          : { priceNGN: editingStory.priceNGN || 2000, priceUSD: editingStory.priceUSD || 2.80 })
                      });
                    }}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="isFreeStory" className="font-semibold cursor-pointer">
                    Make this book completely free for all readers (Override paywall)
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingStory.id ? 'Save Changes' : 'Publish Manuscript'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
