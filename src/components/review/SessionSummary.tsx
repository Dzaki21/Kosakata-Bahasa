import React, { useEffect } from 'react';
import {
  Trophy,
  CheckCircle2,
  Clock,
  RotateCcw,
  LayoutDashboard,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { fireCelebrationConfetti } from '../../utils/confetti';

interface SessionSummaryProps {
  mode: 'review' | 'practice';
  totalCards: number;
  correctCount: number;
  durationSeconds: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  onRestart: () => void;
  onGoDashboard: () => void;
  onGoStats: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  mode,
  totalCards,
  correctCount,
  durationSeconds,
  againCount,
  hardCount,
  goodCount,
  easyCount,
  onRestart,
  onGoDashboard,
  onGoStats,
}) => {
  useEffect(() => {
    fireCelebrationConfetti();
  }, []);

  const accuracy = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}d`;

  return (
    <div className="max-w-lg mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-8 text-center">
        {/* Celebration Trophy Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-500 shadow-md shadow-amber-500/10">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Sesi Selesai! Gut gemacht!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          {mode === 'review'
            ? 'Jadwal pengulangan kartu Anda telah diperbarui secara otomatis menggunakan algoritma SRS.'
            : 'Sesi latihan mandiri selesai. Konsistensi belajar adalah kunci penguasaan bahasa Jerman!'}
        </p>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {totalCards}
            </span>
            <span className="text-[11px] block font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Kartu Diuji
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {accuracy}%
            </span>
            <span className="text-[11px] block font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Akurasi
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {timeFormatted}
            </span>
            <span className="text-[11px] block font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Waktu
            </span>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-700/50 text-left">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2.5">
            Rincian Penilaian Ingatan:
          </span>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{againCount}</span>
              <span className="text-[10px] block text-red-500">Again</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{hardCount}</span>
              <span className="text-[10px] block text-amber-500">Hard</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{goodCount}</span>
              <span className="text-[10px] block text-blue-500">Good</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{easyCount}</span>
              <span className="text-[10px] block text-emerald-500">Easy</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onGoDashboard}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRestart}
              className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi Sesi Ini</span>
            </button>

            <button
              onClick={onGoStats}
              className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Lihat Statistik Lengkap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
