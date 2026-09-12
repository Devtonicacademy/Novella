import React, { useState, useEffect } from 'react';
import { Download, X, Trash2, BookOpen, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { Story } from '../types';
import { api } from '../services/api';
import { BookCover } from './BookCover';

interface OfflineLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStory: (story: Story) => void;
}

export const OfflineLibraryModal: React.FC<OfflineLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectStory,
}) => {
  const [offlineStories, setOfflineStories] = useState<Story[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadOfflineStories();
    }
  }, [isOpen]);

  const loadOfflineStories = () => {
    const list = api.getOfflineStories();
    setOfflineStories(list);
  };

  const handleRemove = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    api.removeOfflineStory(storyId);
    loadOfflineStories();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Offline Bookshelf
              </h3>
              <p className="text-[11px] text-zinc-500">
                Downloaded manuscripts available without an internet connection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {offlineStories.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-3">
              <Download className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs">No manuscripts currently saved for offline reading.</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                Open any story in the reader and click the "Save Offline" icon to read anytime, anywhere.
              </p>
            </div>
          ) : (
            offlineStories.map((story) => (
              <div
                key={story.id}
                onClick={() => {
                  onClose();
                  onSelectStory(story);
                }}
                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between gap-3 cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-16 rounded-xl overflow-hidden shadow shrink-0">
                    <BookCover
                      title={story.title}
                      author={story.author}
                      category={story.category}
                      coverColorTheme={story.coverColorTheme}
                      coverImage={story.coverImage}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-serif font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1">
                      {story.title}
                    </div>
                    <div className="text-[11px] text-zinc-500">{story.author}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <WifiOff className="w-3 h-3" />
                      <span>Ready offline ({story.chapters.length} ch)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemove(e, story.id)}
                  title="Remove from offline storage"
                  className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
