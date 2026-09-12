import React from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { AppNotification } from '../types';
import { api } from '../services/api';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onRefreshNotifications: () => void;
  onSelectStoryById: (storyId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefreshNotifications,
  onSelectStoryById,
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.read) {
      try {
        await api.markNotificationRead(notif.id);
        onRefreshNotifications();
      } catch (e) {
        console.error(e);
      }
    }
    if (notif.storyId) {
      onClose();
      onSelectStoryById(notif.storyId);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Notifications
              </h3>
              <p className="text-[11px] text-zinc-500">
                Updates from your followed authors & discussions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        {unreadCount > 0 && (
          <div className="px-6 py-2.5 bg-amber-500/5 border-b border-amber-500/10 flex items-center justify-between text-xs">
            <span className="text-amber-700 dark:text-amber-300 font-medium">
              {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleMarkAllRead}
              className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                  !notif.read
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20'
                    : 'bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  {notif.type === 'new_story' || notif.type === 'new_chapter' ? (
                    <BookOpen className="w-4 h-4" />
                  ) : notif.type === 'comment' || notif.type === 'review' ? (
                    <MessageSquare className="w-4 h-4" />
                  ) : notif.type === 'earnings' || notif.type === 'purchase' ? (
                    <DollarSign className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                    {notif.message}
                  </p>
                  <div className="text-[9px] text-zinc-400 pt-0.5">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
