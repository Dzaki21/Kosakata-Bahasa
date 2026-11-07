import React from 'react';
import { MoreVertical, BookOpen, Sparkles, Play, Edit3, Trash2 } from 'lucide-react';
import { DeckWithStats } from '../../hooks/useDecks';

interface DeckCardProps {
  deck: DeckWithStats;
  onOpen: () => void;
  onPractice: () => void;
  onReview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onOpen,
  onPractice,
  onReview,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden">
      {/* Top Color Accent */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: deck.color || '#3b82f6' }}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header & Title */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="cursor-pointer flex-1" onClick={onOpen}>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
              {deck.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
              {deck.description || 'Tidak ada deskripsi.'}
            </p>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Deck</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Hapus Deck</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-2 mt-2 mb-4 text-xs font-medium">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{deck.totalVocab} Kata</span>
          </span>

          {deck.dueCount > 0 ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{deck.dueCount} Perlu Review</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-[11px]">
              Semua Up to Date
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Dikuasai</span>
            <span>{deck.progressPercentage}% ({deck.masteredCount}/{deck.totalVocab})</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${deck.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Study Actions */}
      <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={onOpen}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
        >
          Lihat Kata
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPractice}
            disabled={deck.totalVocab === 0}
            className="flex items-center space-x-1 text-xs font-medium text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
          >
            <Play className="w-3 h-3 text-slate-400" />
            <span>Latihan</span>
          </button>

          <button
            onClick={onReview}
            disabled={deck.dueCount === 0}
            className="flex items-center space-x-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 disabled:opacity-40 disabled:hover:bg-brand-600 transition-all"
          >
            <Sparkles className="w-3 h-3" />
            <span>Review ({deck.dueCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
