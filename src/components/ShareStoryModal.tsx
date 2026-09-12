import React, { useState } from 'react';
import { Story, Chapter } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Send, 
  QrCode,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
  chapter?: Chapter;
}

export const ShareStoryModal: React.FC<ShareStoryModalProps> = ({
  isOpen,
  onClose,
  story,
  chapter,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://novella.app';
  const shareUrl = chapter
    ? `${origin}?story=${story.id}&chapter=${chapter.id}`
    : `${origin}?story=${story.id}`;

  const shareTitle = chapter
    ? `Read "${chapter.title}" from "${story.title}" on Novella`
    : `Read "${story.title}" by ${story.author} on Novella`;

  const shareText = `Discover "${story.title}" by ${story.author} on Novella — African & Contemporary Storytelling.`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // Cancelled
      }
    } else {
      handleCopy();
    }
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                Share {chapter ? 'Chapter' : 'Story'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Send a direct link to fellow readers and book clubs
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

        {/* Story Card Snapshot */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-3">
            <div className="w-12 h-16 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700">
              {story.coverImage ? (
                <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-900 text-amber-200 font-serif font-bold text-xs">
                  {story.title.charAt(0)}
                </div>
              )}
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                {story.category}
              </span>
              <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {story.title}
              </h4>
              {chapter && (
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium truncate">
                  {chapter.title}
                </p>
              )}
              <p className="text-[11px] text-zinc-500 truncate">By {story.author}</p>
            </div>
          </div>

          {/* Share Link Copy Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Shareable Web Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 font-mono truncate focus:outline-hidden"
              />
              <button
                id="share-modal-copy-btn"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Shortcuts */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block">
              Share directly via:
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={shareWhatsApp}
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex flex-col items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={shareTwitter}
                className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 text-sky-700 dark:text-sky-300 font-semibold text-xs flex flex-col items-center gap-1 hover:bg-sky-100 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-sky-600" />
                <span>X / Twitter</span>
              </button>

              <button
                onClick={shareTelegram}
                className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs flex flex-col items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 text-blue-600" />
                <span>Telegram</span>
              </button>
            </div>
          </div>

          {/* Native Web Share API (if supported) */}
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-500" />
            <span>More Sharing Options...</span>
          </button>
        </div>
      </div>
    </div>
  );
};
