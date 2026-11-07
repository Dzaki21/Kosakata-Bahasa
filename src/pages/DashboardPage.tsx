import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Sparkles,
  Award,
  Play,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RetentionChart } from '../components/dashboard/RetentionChart';
import { useStats } from '../hooks/useStats';
import { useDecks } from '../hooks/useDecks';
import { PracticeSetupModal } from '../components/review/PracticeSetupModal';
import { ReviewDirection } from '../types';

interface DashboardPageProps {
  onNavigateToDecks: () => void;
  onNavigateToDeckDetail: (deckId: number) => void;
  onStartReview: (deckId?: number) => void;
  onStartPractice: (options: {
    deckId?: number;
    count: number;
    order: 'sequential' | 'random';
    direction: ReviewDirection;
  }) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToDecks,
  onNavigateToDeckDetail,
  onStartReview,
  onStartPractice,
}) => {
  const { stats, isLoading: isStatsLoading } = useStats();
  const { decks } = useDecks();
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);

  if (isStatsLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const {
    totalDecks,
    totalVocab,
    wordsMastered,
    wordsLearning,
    wordsDue,
    totalSessions,
    overallAccuracy,
    dailyActivity,
    statusDistribution,
    ratingDistribution,
    streak,
    todayReviews,
  } = stats;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome / Daily Reminder Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-sky-700 text-white p-6 sm:p-8 shadow-lg shadow-brand-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Spaced Repetition System Aktif</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {wordsDue > 0
                ? `Ada ${wordsDue} kata yang siap di-review!`
                : 'Hebat! Semua kosakata Anda up-to-date.'}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl">
              Metode Active Recall memperkuat jalur ingatan otak Anda. Luangkan 5-10 menit setiap hari untuk retensi maksimal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {wordsDue > 0 ? (
              <button
                onClick={() => onStartReview()}
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-brand-700 hover:bg-slate-50 font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Mulai Review SRS ({wordsDue})</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPracticeModalOpen(true)}
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-brand-700 hover:bg-slate-50 font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 text-brand-600 fill-brand-600" />
                <span>Latihan Mandiri Bebas</span>
              </button>
            )}

            <button
              onClick={() => setIsPracticeModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-brand-800/60 hover:bg-brand-800 border border-white/20 text-white font-semibold text-xs transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Kustom Latihan</span>
            </button>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Decks"
          value={totalDecks}
          subtitle="Koleksi kategori deck"
          icon={Layers}
          color="brand"
          onClick={onNavigateToDecks}
        />
        <StatCard
          title="Total Kosakata"
          value={totalVocab}
          subtitle="Kata tersimpan di IndexedDB"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Perlu Review"
          value={wordsDue}
          subtitle="Jadwal pengulangan SRS"
          icon={Sparkles}
          color="amber"
          onClick={() => wordsDue > 0 && onStartReview()}
        />
        <StatCard
          title="Dikuasai"
          value={wordsMastered}
          subtitle={`${totalVocab > 0 ? Math.round((wordsMastered / totalVocab) * 100) : 0}% dari seluruh kosakata`}
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ActivityChart data={dailyActivity} />
        </div>
        <div>
          <RetentionChart
            statusDistribution={statusDistribution}
            ratingDistribution={ratingDistribution}
          />
        </div>
      </div>

      {/* Decks Quick Glance List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Deck Kosakata Anda
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Progres penguasaan per deck pembelajaran
            </p>
          </div>
          <button
            onClick={onNavigateToDecks}
            className="flex items-center space-x-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
          >
            <span>Lihat Semua Deck ({decks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {decks.slice(0, 4).map(deck => (
            <div
              key={deck.id}
              onClick={() => deck.id && onNavigateToDeckDetail(deck.id)}
              className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-xs"
                  style={{ backgroundColor: deck.color || '#3b82f6' }}
                >
                  {deck.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {deck.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {deck.totalVocab} kata • {deck.dueCount > 0 ? `${deck.dueCount} perlu review` : 'Up-to-date'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {deck.progressPercentage}%
                </span>
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${deck.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Setup Modal */}
      <PracticeSetupModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        decks={decks}
        onStart={onStartPractice}
      />
    </div>
  );
};

