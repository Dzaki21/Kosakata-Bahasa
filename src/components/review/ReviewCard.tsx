import React, { useEffect, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  CornerDownLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { ActiveCard } from '../../store/useReviewStore';
import { Rating } from '../../types';
import { ArticleBadge } from '../common/ArticleBadge';
import { GermanSpecialChars } from '../common/GermanSpecialChars';
import { RatingButtons } from './RatingButtons';
import { speakGerman } from '../../utils/speech';
import { ValidationResult } from '../../services/validator';

interface ReviewCardProps {
  card: ActiveCard;
  currentIndex: number;
  totalCards: number;
  userInput: string;
  isSubmitted: boolean;
  validationResult: ValidationResult | null;
  onInputChange: (val: string) => void;
  onInsertChar: (char: string) => void;
  onSubmitAnswer: () => void;
  onRateCard: (rating: Rating) => void;
  onQuit: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  card,
  currentIndex,
  totalCards,
  userInput,
  isSubmitted,
  validationResult,
  onInputChange,
  onInsertChar,
  onSubmitAnswer,
  onRateCard,
  onQuit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { vocab, direction } = card;

  // Auto-focus input on card change or submit
  useEffect(() => {
    if (!isSubmitted) {
      inputRef.current?.focus();
    }
  }, [currentIndex, isSubmitted]);

  // Keyboard navigation: Enter to submit, 1-4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modifier keys are pressed
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (!isSubmitted) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSubmitAnswer();
        }
      } else {
        // Submitted state: rating shortcuts
        if (e.key === '1') {
          e.preventDefault();
          onRateCard(1);
        } else if (e.key === '2') {
          e.preventDefault();
          onRateCard(2);
        } else if (e.key === '3') {
          e.preventDefault();
          onRateCard(3);
        } else if (e.key === '4') {
          e.preventDefault();
          onRateCard(4);
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          speakGerman(vocab.article ? `${vocab.article} ${vocab.word}` : vocab.word);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, onSubmitAnswer, onRateCard, vocab]);

  // Play audio on submit if direction is id-de
  useEffect(() => {
    if (isSubmitted) {
      speakGerman(vocab.article ? `${vocab.article} ${vocab.word}` : vocab.word);
    }
  }, [isSubmitted, vocab]);

  const progressPercent = Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Top Session Progress Bar & Controls */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Kartu {currentIndex + 1} dari {totalCards}
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {direction === 'de-id' ? 'Jerman → Indonesia' : 'Indonesia → Jerman'}
          </span>
        </div>

        <button
          onClick={onQuit}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Flashcard Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
        {/* Card Prompt Area */}
        <div className="p-8 text-center border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-800/20 dark:to-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
            {direction === 'de-id' ? 'Terjemahkan ke Bahasa Indonesia' : 'Terjemahkan ke Bahasa Jerman'}
          </span>

          {direction === 'de-id' ? (
            /* Mode A: German -> Indonesian */
            <div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <ArticleBadge article={vocab.article} size="lg" />
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {vocab.word}
                </h2>
                <button
                  type="button"
                  onClick={() => speakGerman(vocab.article ? `${vocab.article} ${vocab.word}` : vocab.word)}
                  className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-full hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
                  title="Dengarkan pengucapan (shortcut: S)"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {vocab.plural && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Plural: <span className="font-semibold text-slate-700 dark:text-slate-300">{vocab.plural}</span>
                </p>
              )}
            </div>
          ) : (
            /* Mode B: Indonesian -> German */
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                {vocab.indonesian}
              </h2>
              {vocab.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Petunjuk: {vocab.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Card Interaction Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {!isSubmitted ? (
            /* Active Typing Mode */
            <div className="space-y-4">
              {/* German Characters helper (especially useful in id-de mode) */}
              <div className="flex justify-center">
                <GermanSpecialChars onInsert={onInsertChar} />
              </div>

              {/* Text Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={e => onInputChange(e.target.value)}
                  placeholder={
                    direction === 'de-id'
                      ? 'Ketik arti dalam bahasa Indonesia...'
                      : 'Ketik kosakata Jerman (contoh: das Haus / Haus)...'
                  }
                  className="w-full text-center text-lg sm:text-xl font-bold py-3.5 px-4 rounded-2xl border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-white text-slate-950 dark:text-slate-950 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal shadow-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onSubmitAnswer}
                  disabled={!userInput.trim()}
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-40 disabled:hover:bg-brand-600 transition-all"
                >
                  <span>Cek Jawaban</span>
                  <CornerDownLeft className="w-4 h-4 opacity-75" />
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">Enter</kbd> untuk memeriksa jawaban
              </p>
            </div>
          ) : (
            /* Submitted / Answer Revealed Mode */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Validation Result Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                  validationResult?.isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                }`}
              >
                {validationResult?.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {validationResult?.message}
                  </div>
                  {userInput && (
                    <div className="text-xs opacity-80 mt-0.5">
                      Jawaban Anda: <span className="font-semibold underline">{userInput}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Correct Answer Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Jawaban Lengkap:
                </span>

                <div className="flex items-center space-x-2">
                  <ArticleBadge article={vocab.article} size="md" />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {vocab.word}
                  </span>
                  {vocab.plural && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      (Pl: {vocab.plural})
                    </span>
                  )}
                  <button
                    onClick={() => speakGerman(vocab.article ? `${vocab.article} ${vocab.word}` : vocab.word)}
                    className="p-1 text-slate-400 hover:text-brand-600"
                    title="Dengarkan pengucapan (S)"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Arti: {vocab.indonesian}
                </div>

                {vocab.exampleGerman && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      🇩🇪 {vocab.exampleGerman}
                    </p>
                    {vocab.exampleIndonesian && (
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        🇮🇩 {vocab.exampleIndonesian}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Rating Buttons (Again, Hard, Good, Easy) */}
              <RatingButtons vocab={vocab} onRate={onRateCard} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

