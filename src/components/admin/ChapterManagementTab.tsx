import React, { useState } from 'react';
import { Story, Chapter } from '../../types';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  FileText,
  Save,
  CheckCircle2,
  Eye,
  AlertCircle,
  X,
  BookOpen
} from 'lucide-react';

interface ChapterManagementTabProps {
  stories: Story[];
  selectedStoryId?: string;
  onUpdateChapters: (storyId: string, chapters: Chapter[]) => Promise<void>;
}

export const ChapterManagementTab: React.FC<ChapterManagementTabProps> = ({
  stories,
  selectedStoryId,
  onUpdateChapters,
}) => {
  const [activeStoryId, setActiveStoryId] = useState<string>(
    selectedStoryId || (stories[0]?.id ?? '')
  );

  const currentStory = stories.find((s) => s.id === activeStoryId) || stories[0];
  const [chapters, setChapters] = useState<Chapter[]>(currentStory?.chapters || []);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync chapters when story changes
  const handleSelectStory = (id: string) => {
    setActiveStoryId(id);
    const story = stories.find(s => s.id === id);
    if (story) {
      setChapters(story.chapters || []);
      setIsDirty(false);
    }
  };

  // Reordering
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...chapters];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    
    // Update order values
    const updated = reordered.map((ch, idx) => ({ ...ch, order: idx + 1 }));
    setChapters(updated);
    setIsDirty(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === chapters.length - 1) return;
    const reordered = [...chapters];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    const updated = reordered.map((ch, idx) => ({ ...ch, order: idx + 1 }));
    setChapters(updated);
    setIsDirty(true);
  };

  const handleDeleteChapter = (chId: string) => {
    if (confirm('Delete this chapter from manuscript?')) {
      const remaining = chapters.filter(c => c.id !== chId).map((ch, idx) => ({ ...ch, order: idx + 1 }));
      setChapters(remaining);
      setIsDirty(true);
    }
  };

  const handleOpenAdd = () => {
    const nextOrder = chapters.length + 1;
    setEditingChapter({
      id: `ch-${Date.now()}-${nextOrder}`,
      order: nextOrder,
      title: `Chapter ${nextOrder}: `,
      subtitle: '',
      readMinutes: 5,
      content: '',
      status: 'published'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (chapter: Chapter) => {
    setEditingChapter({ ...chapter });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;

    // Auto-calculate reading time: approx 200 words per minute
    const wordCount = editingChapter.content.trim().split(/\s+/).filter(Boolean).length;
    const calculatedMinutes = Math.max(1, Math.round(wordCount / 200));

    const updatedChapter: Chapter = {
      ...editingChapter,
      readMinutes: calculatedMinutes,
      updatedAt: new Date().toISOString()
    };

    const exists = chapters.some(c => c.id === updatedChapter.id);
    let updatedList: Chapter[];

    if (exists) {
      updatedList = chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c);
    } else {
      updatedList = [...chapters, updatedChapter];
    }

    setChapters(updatedList);
    setIsDirty(true);
    setIsModalOpen(false);
    setEditingChapter(null);
  };

  const handleCommitAll = async () => {
    if (!currentStory) return;
    setSaving(true);
    try {
      await onUpdateChapters(currentStory.id, chapters);
      setIsDirty(false);
    } finally {
      setSaving(false);
    }
  };

  if (!currentStory) {
    return <div className="p-8 text-center text-zinc-500">No stories available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Story Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Chapter Studio & Structure
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize chapters, edit narrative text, and adjust sequential reading orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              onClick={handleCommitAll}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer animate-pulse"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Order & Changes'}</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Story Selector Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-purple-600 shrink-0" />
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Active Manuscript
            </label>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {currentStory.title} ({chapters.length} Chapters)
            </span>
          </div>
        </div>

        <select
          value={activeStoryId}
          onChange={(e) => handleSelectStory(e.target.value)}
          className="w-full sm:w-auto text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold cursor-pointer"
        >
          {stories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.chapters?.length || 0} chapters)
            </option>
          ))}
        </select>
      </div>

      {/* Chapters Ordered List */}
      <div className="space-y-3">
        {chapters.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 space-y-3">
            <Layers className="w-8 h-8 mx-auto text-zinc-300" />
            <p className="text-xs">No chapters added yet for this story.</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
            >
              Add First Chapter
            </button>
          </div>
        ) : (
          chapters.map((chapter, index) => {
            const wordCount = chapter.content.trim().split(/\s+/).filter(Boolean).length;

            return (
              <div
                key={chapter.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
              >
                {/* Chapter Metadata */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-900">
                    {index + 1}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {chapter.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        chapter.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {chapter.status || 'published'}
                      </span>
                    </div>

                    {chapter.subtitle && (
                      <p className="text-xs text-zinc-500 truncate">{chapter.subtitle}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>~{chapter.readMinutes || 5} min read</span>
                      </span>
                      <span>·</span>
                      <span className="font-mono">{wordCount.toLocaleString()} words</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Reordering Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Reorder Up */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === chapters.length - 1}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(chapter)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Content</span>
                  </button>

                  {/* Delete */}
                  {chapters.length > 1 && (
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chapter Edit / Add Modal */}
      {isModalOpen && editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Chapter Editor (Vol. #{editingChapter.order})
                </h3>
                <p className="text-xs text-zinc-500">Author manuscript content and narrative prose</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Chapter Title *</label>
                  <input
                    type="text"
                    required
                    value={editingChapter.title}
                    onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Chapter Subtitle</label>
                  <input
                    type="text"
                    value={editingChapter.subtitle || ''}
                    onChange={(e) => setEditingChapter({ ...editingChapter, subtitle: e.target.value })}
                    placeholder="e.g. The River of Memories"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">Manuscript Content *</label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {editingChapter.content.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={14}
                  required
                  value={editingChapter.content}
                  onChange={(e) => setEditingChapter({ ...editingChapter, content: e.target.value })}
                  placeholder="Paste or write the chapter narrative prose here..."
                  className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-serif leading-relaxed text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-zinc-500">Status:</label>
                  <select
                    value={editingChapter.status || 'published'}
                    onChange={(e) => setEditingChapter({ ...editingChapter, status: e.target.value as any })}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    Update Chapter
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
