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
import { useSettingsStore } from '../store/useSettingsStore';
import { Target, ChevronRight, Volume2, Plus } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ArticleBadge } from '../components/common/ArticleBadge';
import { useVocabularies } from '../hooks/useVocabularies';
import { speakGerman } from '../utils/speech';

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
  const { vocabularies } = useVocabularies();
  const { settings, updateSettings } = useSettingsStore();
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    todayAddedVocab,
  } = stats;

  // Filter kosakata yang ditambahkan hari ini
  const todayKey = new Date().toISOString().split('T')[0];
  const todayVocabs = vocabularies.filter(v => v.createdAt && v.createdAt.startsWith(todayKey));

  // Buat mapping deck id ke deck
  const deckMap = new Map(decks.map(d => [d.id, d]));

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

      {/* Target Tambah Kosakata Harian Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div
            onClick={() => setIsDetailModalOpen(true)}
            className="flex items-center space-x-3 cursor-pointer group flex-1"
            title="Klik untuk melihat daftar kosakata yang ditambahkan hari ini"
          >
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Target Tambah Kosakata Harian
                {todayAddedVocab >= settings.dailyGoal && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Tercapai! 🎉
                  </span>
                )}
                <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold inline-flex items-center gap-0.5 group-hover:underline">
                  (Lihat Kata <ChevronRight className="w-3.5 h-3.5" />)
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ditambahkan hari ini: <strong className="text-slate-900 dark:text-white font-semibold">{todayAddedVocab}</strong> dari target <strong className="text-brand-600 dark:text-brand-400 font-semibold">{settings.dailyGoal} kosakata baru</strong> ({Math.min(100, Math.round((todayAddedVocab / (settings.dailyGoal || 1)) * 100))}%)
              </p>
            </div>
          </div>

          {/* Quick Target Selector Pills */}
          <div className="flex items-center flex-wrap gap-1.5 shrink-0">
            <span className="text-xs text-slate-400 mr-1 font-medium">Target harian:</span>
            {[5, 10, 15, 20, 25, 30].map(target => (
              <button
                key={target}
                type="button"
                onClick={() => updateSettings({ dailyGoal: target })}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                  settings.dailyGoal === target
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                +{target} Kata
              </button>
            ))}
          </div>
        </div>

        {/* Target Progress Bar */}
        <div
          onClick={() => setIsDetailModalOpen(true)}
          className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer"
          title="Klik untuk melihat detail"
        >
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              todayAddedVocab >= settings.dailyGoal ? 'bg-emerald-500' : 'bg-brand-500'
            }`}
            style={{ width: `${Math.min(100, (todayAddedVocab / (settings.dailyGoal || 1)) * 100)}%` }}
          />
        </div>
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

      {/* Modal Detail Kosakata yang Ditambahkan Hari Ini */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Kosakata Baru Ditambahkan Hari Ini"
        description={`Daftar ${todayAddedVocab} kosakata yang Anda tambahkan hari ini beserta deck lokasinya.`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          {todayVocabs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">Belum ada kosakata yang ditambahkan hari ini.</p>
              <p className="text-xs mt-1">Buka menu <strong>My Decks</strong> dan pilih deck untuk mulai menambahkan kosakata baru!</p>
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  onNavigateToDecks();
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-sm"
              >
                Ke Halaman Decks
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto pr-1">
              {todayVocabs.map((vocab, index) => {
                const deck = deckMap.get(vocab.deckId);
                const timeAdded = vocab.createdAt
                  ? new Date(vocab.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={vocab.id || index}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <ArticleBadge article={vocab.article} size="sm" />
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {vocab.word}
                        </span>
                        {vocab.plural && (
                          <span className="text-xs text-slate-400">
                            (Pl: {vocab.plural})
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => speakGerman(vocab.article ? `${vocab.article} ${vocab.word}` : vocab.word)}
                          className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                          title="Dengar pelafalan"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {vocab.indonesian}
                      </p>

                      {vocab.exampleGerman && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                          "{vocab.exampleGerman}"
                        </p>
                      )}
                    </div>

                    {/* Deck info badge & link */}
                    <div className="flex flex-col items-end shrink-0 space-y-1">
                      {deck ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDetailModalOpen(false);
                            if (deck.id) onNavigateToDeckDetail(deck.id);
                          }}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all bg-white dark:bg-slate-800 shadow-sm"
                          style={{ borderColor: deck.color ? `${deck.color}40` : undefined }}
                          title={`Buka deck ${deck.name}`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: deck.color || '#3b82f6' }}
                          />
                          <span className="truncate max-w-[120px]">{deck.name}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Deck #{vocab.deckId}</span>
                      )}

                      {timeAdded && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Pukul {timeAdded}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Total hari ini: <strong>{todayVocabs.length} kata</strong></span>
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

