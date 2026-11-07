import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  Clock,
  BookOpen,
  Shuffle,
  RotateCcw,
} from 'lucide-react';
import { useReviewStore } from '../store/useReviewStore';
import { useDecks } from '../hooks/useDecks';
import { ReviewCard } from '../components/review/ReviewCard';
import { SessionSummary } from '../components/review/SessionSummary';
import { PracticeSetupModal } from '../components/review/PracticeSetupModal';
import { ReviewDirection } from '../types';

interface ReviewPageProps {
  onGoDashboard: () => void;
  onGoStats: () => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({
  onGoDashboard,
  onGoStats,
}) => {
  const { decks } = useDecks();
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [selectedDeckForReview, setSelectedDeckForReview] = useState<number | undefined>(undefined);

  const {
    mode,
    isActive,
    isFinished,
    cards,
    currentIndex,
    userInput,
    isSubmitted,
    validationResult,
    totalDurationSeconds,
    correctAnswersCount,
    againCount,
    hardCount,
    goodCount,
    easyCount,
    startReviewSession,
    startPracticeSession,
    setUserInput,
    appendCharacter,
    submitAnswer,
    rateCard,
    quitSession,
    restartSession,
  } = useReviewStore();

  // Total cards due across all or selected deck
  const totalDue = decks.reduce((acc, d) => {
    if (selectedDeckForReview === undefined || d.id === selectedDeckForReview) {
      return acc + d.dueCount;
    }
    return acc;
  }, 0);

  // If a session is finished, render summary
  if (isFinished) {
    return (
      <div className="py-8">
        <SessionSummary
          mode={mode}
          totalCards={cards.length}
          correctCount={correctAnswersCount}
          durationSeconds={totalDurationSeconds}
          againCount={againCount}
          hardCount={hardCount}
          goodCount={goodCount}
          easyCount={easyCount}
          onRestart={restartSession}
          onGoDashboard={onGoDashboard}
          onGoStats={onGoStats}
        />
      </div>
    );
  }

  // If a session is actively running, render active flashcard
  if (isActive && cards.length > 0 && currentIndex < cards.length) {
    const currentCard = cards[currentIndex];

    return (
      <div className="py-4">
        <ReviewCard
          card={currentCard}
          currentIndex={currentIndex}
          totalCards={cards.length}
          userInput={userInput}
          isSubmitted={isSubmitted}
          validationResult={validationResult}
          onInputChange={setUserInput}
          onInsertChar={appendCharacter}
          onSubmitAnswer={submitAnswer}
          onRateCard={rateCard}
          onQuit={quitSession}
        />
      </div>
    );
  }

  // Otherwise, render Session Launcher Screen
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Modes Header */}
      <div className="text-center max-w-lg mx-auto py-4">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Pusat Belajar & Pengujian Kosakata
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pilih Mode Review Berjadwal (SRS) untuk memori jangka panjang, atau Mode Latihan Mandiri untuk melatih kata pilihan Anda.
        </p>
      </div>

      {/* Two Main Cards: Review Mode (SRS) vs Practice Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Review Mode (SRS) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-500/30 dark:border-brand-500/20 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                Direkomendasikan
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Review Mode (SRS Berjadwal)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sistem memilih kartu yang jatuh tempo secara otomatis berdasarkan kurva lupa dan riwayat ingatan Anda.
              </p>
            </div>

            {/* Deck filter for review */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Filter Deck Review:
              </label>
              <select
                value={selectedDeckForReview ?? 'all'}
                onChange={e =>
                  setSelectedDeckForReview(e.target.value === 'all' ? undefined : Number(e.target.value))
                }
                className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">Semua Deck Gabungan</option>
                {decks.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.dueCount} jatuh tempo)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-900 dark:text-brand-200">
                Total kartu siap diulang:
              </span>
              <span className="text-lg font-extrabold text-brand-700 dark:text-brand-300">
                {totalDue} Kartu
              </span>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => startReviewSession(selectedDeckForReview)}
              disabled={totalDue === 0}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-40 disabled:hover:bg-brand-600 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {totalDue > 0 ? `Mulai Review (${totalDue} Kartu)` : 'Belum Ada Kartu Jatuh Tempo'}
              </span>
            </button>
          </div>
        </div>

        {/* Card 2: Practice Mode (Custom) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center">
              <Play className="w-5 h-5 fill-amber-500" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Practice Mode (Latihan Bebas)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Latihan fleksibel tanpa terikat jadwal SRS. Bebas pilih jumlah kata (10, 20, 50, 100), urutan acak atau berurutan, dan arah terjemahan.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <Shuffle className="w-3.5 h-3.5 text-slate-400" />
                <span>Pengacakan tanpa duplikat dalam satu sesi</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Dapat memilih deck tertentu atau semua deck</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Mendukung arah Jerman→Indo & Indo→Jerman</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => setIsPracticeModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm shadow-sm active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Atur & Mulai Latihan Bebas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Practice Setup Modal */}
      <PracticeSetupModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        decks={decks}
        onStart={startPracticeSession}
      />
    </div>
  );
};
