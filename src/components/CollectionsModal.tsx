import React, { useState } from 'react';
import { Story, StoryCollection } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Plus, 
  Check, 
  FolderPlus, 
  Bookmark, 
  Heart, 
  Clock, 
  Sparkles,
  Folder
} from 'lucide-react';

interface CollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
}

export const CollectionsModal: React.FC<CollectionsModalProps> = ({
  isOpen,
  onClose,
  story,
}) => {
  const { user, createCollection, addStoryToCollection, removeStoryFromCollection } = useAuth();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const collections: StoryCollection[] = user?.collections || [];

  const handleToggleStory = (collection: StoryCollection) => {
    const isIn = collection.storyIds.includes(story.id);
    if (isIn) {
      removeStoryFromCollection(collection.id, story.id);
      setSuccessMessage(`Removed from "${collection.name}"`);
    } else {
      addStoryToCollection(collection.id, story.id);
      setSuccessMessage(`Added to "${collection.name}"`);
    }
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    createCollection(newCollectionName.trim(), newCollectionDesc.trim());
    setNewCollectionName('');
    setNewCollectionDesc('');
    setIsCreatingNew(false);
    setSuccessMessage(`Created list "${newCollectionName.trim()}"`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const getCollectionIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('favorite')) return <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />;
    if (lower.includes('later')) return <Clock className="w-4 h-4 text-amber-500" />;
    if (lower.includes('romance')) return <Sparkles className="w-4 h-4 text-pink-500" />;
    return <Folder className="w-4 h-4 text-zinc-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                Save to Collection
              </h3>
              <p className="text-[11px] text-zinc-500 truncate max-w-[220px]">
                Organize "{story.title}" into reading lists
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {successMessage && (
          <div className="mx-5 mt-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Collections List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {collections.map((col) => {
            const isSaved = col.storyIds.includes(story.id);
            return (
              <div
                key={col.id}
                onClick={() => handleToggleStory(col)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSaved
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 shadow-xs'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                    {getCollectionIcon(col.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {col.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      {col.storyIds.length} {col.storyIds.length === 1 ? 'story' : 'stories'}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isSaved
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'border-2 border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isSaved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}

          {/* Create New Collection Inline Section */}
          {isCreatingNew ? (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 space-y-3 mt-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">New Collection</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                required
                placeholder="Collection name (e.g. Favorite African Epics)"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-500"
              />

              <input
                type="text"
                placeholder="Optional description"
                value={newCollectionDesc}
                onChange={(e) => setNewCollectionDesc(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-500"
              />

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Create and Select
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New Collection</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
