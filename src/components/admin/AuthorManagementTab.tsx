import React, { useState } from 'react';
import { Author, Story } from '../../types';
import {
  UserCheck,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  Globe,
  MapPin,
  Star,
  Search,
  X,
  RefreshCw,
  Award
} from 'lucide-react';

interface AuthorManagementTabProps {
  authors: Author[];
  stories: Story[];
  onSaveAuthor: (author: Partial<Author>) => Promise<void>;
  onDeleteAuthor: (authorId: string) => Promise<void>;
  onFilterStoriesByAuthor: (authorName: string) => void;
}

export const AuthorManagementTab: React.FC<AuthorManagementTabProps> = ({
  authors,
  stories,
  onSaveAuthor,
  onDeleteAuthor,
  onFilterStoriesByAuthor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredAuthors = authors.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.bio && a.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.country && a.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setEditingAuthor({
      name: '',
      bio: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      country: 'Nigeria',
      featured: false,
      socialLinks: {}
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (author: Author) => {
    setEditingAuthor({ ...author });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor?.name) return;
    setSaving(true);
    try {
      await onSaveAuthor(editingAuthor);
      setIsModalOpen(false);
      setEditingAuthor(null);
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
            Author Profiles & Editorial Roster
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage author biographies, literary credits, countries of origin, and featured spotlights
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Author</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search authors by name, country, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-zinc-400 shrink-0 font-mono">
          {filteredAuthors.length} Authors Listed
        </span>
      </div>

      {/* Author Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAuthors.map((author) => {
          const authorStories = stories.filter(s => s.author.toLowerCase() === author.name.toLowerCase());

          return (
            <div
              key={author.id}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Author Avatar & Header */}
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={author.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30"
                    />
                    {author.featured && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs" title="Featured Author">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {author.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{author.country || 'West Africa'}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {author.bio || 'Accomplished contemporary storyteller preserving cultural narratives and epic adventures.'}
                </p>

                {/* Published Stories Count */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>{authorStories.length || author.totalStories || 1} Published Works</span>
                  </span>

                  {author.featured && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                      Editorial Spotlight
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => onFilterStoriesByAuthor(author.name)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  View Manuscripts →
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(author)}
                    className="p-1.5 text-zinc-400 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete author profile "${author.name}"?`)) {
                        onDeleteAuthor(author.id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete Author"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {editingAuthor.id ? 'Edit Author Profile' : 'Add New Author'}
                </h3>
                <p className="text-xs text-zinc-500">Author bio and catalog representation</p>
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
                <label className="font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingAuthor.name || ''}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Country / Heritage</label>
                  <input
                    type="text"
                    value={editingAuthor.country || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, country: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={editingAuthor.avatar || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, avatar: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Biography</label>
                <textarea
                  rows={4}
                  value={editingAuthor.bio || ''}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featuredAuthor"
                  checked={editingAuthor.featured || false}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="featuredAuthor" className="font-semibold cursor-pointer">
                  Feature this author in the Hero Spotlight
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAuthor.id ? 'Save Changes' : 'Create Author'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
