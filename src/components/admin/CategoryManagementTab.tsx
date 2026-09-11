import React, { useState } from 'react';
import { CategoryInfo, Story } from '../../types';
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  X,
  RefreshCw,
  Palette,
  Sparkles,
  Compass
} from 'lucide-react';

interface CategoryManagementTabProps {
  categories: CategoryInfo[];
  stories: Story[];
  onSaveCategory: (cat: Partial<CategoryInfo>) => Promise<void>;
  onDeleteCategory: (catId: string) => Promise<void>;
  onFilterStoriesByCategory: (catName: string) => void;
}

export const CategoryManagementTab: React.FC<CategoryManagementTabProps> = ({
  categories,
  stories,
  onSaveCategory,
  onDeleteCategory,
  onFilterStoriesByCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryInfo> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      icon: 'BookOpen',
      color: 'from-purple-900 to-indigo-900'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryInfo) => {
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    setSaving(true);
    try {
      const slug = editingCategory.slug || editingCategory.name.toLowerCase().replace(/\s+/g, '-');
      await onSaveCategory({ ...editingCategory, slug });
      setIsModalOpen(false);
      setEditingCategory(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Genre & Category Taxonomy
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Classify manuscripts by literary genre, cultural folklore, mythology, and themes
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Genre Category</span>
        </button>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const count = stories.filter(s => s.category.toLowerCase() === cat.name.toLowerCase()).length;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cat.color || 'from-amber-700 to-zinc-900'} text-white flex items-center justify-center shadow-xs`}>
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-400">
                    {count} {count === 1 ? 'Book' : 'Books'}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {cat.name}
                  </h3>
                  <span className="font-mono text-[10px] text-zinc-400">/{cat.slug}</span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {cat.description || 'Captivating literary works exploring deep narrative themes and cultural richness.'}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => onFilterStoriesByCategory(cat.name)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Explore Books ({count}) →
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-zinc-400 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete genre category "${cat.name}"?`)) {
                        onDeleteCategory(cat.id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Category Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {editingCategory.id ? 'Edit Genre' : 'Create Genre Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Genre Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Afrofuturism"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Slug URL Identifier</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="e.g. afrofuturism"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Genre thematic focus and audience blurb..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory.id ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
