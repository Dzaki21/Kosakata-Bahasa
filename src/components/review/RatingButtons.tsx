import React from 'react';
import { Rating, Vocabulary } from '../../types';
import { calculateNextReview, formatDueTime } from '../../services/srs';

interface RatingButtonsProps {
  vocab: Vocabulary;
  onRate: (rating: Rating) => void;
  disabled?: boolean;
}

export const RatingButtons: React.FC<RatingButtonsProps> = ({
  vocab,
  onRate,
  disabled = false,
}) => {
  // Pre-calculate estimated intervals for preview
  const againEstimate = calculateNextReview(vocab, 1);
  const hardEstimate = calculateNextReview(vocab, 2);
  const goodEstimate = calculateNextReview(vocab, 3);
  const easyEstimate = calculateNextReview(vocab, 4);

  const formatInterval = (days: number) => {
    if (days <= 1) return '< 1 hari';
    return `${days} hari`;
  };

  return (
    <div className="space-y-2">
      <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        Seberapa baik Anda mengingat kata ini?
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Again Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRate(1)}
          className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 transition-all active:scale-95 shadow-sm"
        >
          <span className="text-sm font-bold flex items-center gap-1.5">
            Again
            <span className="text-[10px] font-mono opacity-60 px-1 py-0.5 rounded bg-red-200/60 dark:bg-red-900/60">
              1
            </span>
          </span>
          <span className="text-[11px] opacity-75 mt-0.5">Ulangi</span>
          <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 mt-1">
            {formatInterval(againEstimate.interval)}
          </span>
        </button>

        {/* Hard Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRate(2)}
          className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 transition-all active:scale-95 shadow-sm"
        >
          <span className="text-sm font-bold flex items-center gap-1.5">
            Hard
            <span className="text-[10px] font-mono opacity-60 px-1 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60">
              2
            </span>
          </span>
          <span className="text-[11px] opacity-75 mt-0.5">Sulit</span>
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
            {formatInterval(hardEstimate.interval)}
          </span>
        </button>

        {/* Good Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRate(3)}
          className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 transition-all active:scale-95 shadow-sm"
        >
          <span className="text-sm font-bold flex items-center gap-1.5">
            Good
            <span className="text-[10px] font-mono opacity-60 px-1 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900/60">
              3
            </span>
          </span>
          <span className="text-[11px] opacity-75 mt-0.5">Bagus</span>
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {formatInterval(goodEstimate.interval)}
          </span>
        </button>

        {/* Easy Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRate(4)}
          className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 transition-all active:scale-95 shadow-sm"
        >
          <span className="text-sm font-bold flex items-center gap-1.5">
            Easy
            <span className="text-[10px] font-mono opacity-60 px-1 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60">
              4
            </span>
          </span>
          <span className="text-[11px] opacity-75 mt-0.5">Mudah</span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatInterval(easyEstimate.interval)}
          </span>
        </button>
      </div>
    </div>
  );
};
