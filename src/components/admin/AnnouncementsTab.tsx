import React, { useState } from 'react';
import { Announcement } from '../../types';
import {
  Bell,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Megaphone,
  X,
  RefreshCw,
  Eye
} from 'lucide-react';

interface AnnouncementsTabProps {
  announcements: Announcement[];
  onSaveAnnouncement: (announcement: Partial<Announcement>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcements,
  onSaveAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [editingItem, setEditingItem] = useState<Partial<Announcement> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingItem({
      title: '',
      message: '',
      type: 'banner',
      isActive: true,
      targetAudience: 'all',
      linkUrl: '',
      linkText: 'Explore Now',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.message) return;
    setSaving(true);
    try {
      await onSaveAnnouncement(editingItem);
      setIsModalOpen(false);
      setEditingItem(null);
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
            Broadcast Announcements & Alerts
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Deliver notifications, release updates, and promo banners to readers
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              item.isActive
                ? 'border-purple-300 dark:border-purple-800 ring-1 ring-purple-500/10'
                : 'border-zinc-200 dark:border-zinc-800 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {item.isActive ? 'Active Broadcast' : 'Draft / Paused'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                    Audience: {item.targetAudience}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.message}
                </p>

                {item.linkText && (
                  <span className="text-xs font-bold text-amber-600 block pt-1">
                    Action: {item.linkText} {item.linkUrl && `(${item.linkUrl})`}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-2 text-zinc-400 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete announcement "${item.title}"?`)) {
                    onDeleteAnnouncement(item.id);
                  }
                }}
                className="p-2 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {editingItem.id ? 'Edit Broadcast' : 'Create Broadcast Notice'}
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
                <label className="font-semibold block mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. New Folklore Collection Released!"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Broadcast Message *</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.message}
                  onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })}
                  placeholder="The text that will appear in reader inboxes or top notification banners..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Target Readers</label>
                  <select
                    value={editingItem.targetAudience || 'all'}
                    onChange={(e) => setEditingItem({ ...editingItem, targetAudience: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  >
                    <option value="all">All Readers</option>
                    <option value="free_users">Free Tier Readers</option>
                    <option value="paid_users">Paying Supporters</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Button Action Text</label>
                  <input
                    type="text"
                    value={editingItem.linkText || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, linkText: e.target.value })}
                    placeholder="e.g. Read Now"
                    className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveNotice"
                  checked={editingItem.isActive ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActiveNotice" className="font-semibold cursor-pointer">
                  Activate & display to readers immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
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
                  <span>{editingItem.id ? 'Save Changes' : 'Broadcast Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
