import { Rating, ReviewStatus, Vocabulary } from '../types';

export interface SrsCalculationResult {
  repetitions: number;
  interval: number; // in days
  easeFactor: number;
  dueDate: string; // ISO date string
  status: ReviewStatus;
  lapses: number;
  correctStreak: number;
  totalReviews: number;
}

/**
 * Calculates next review parameters with human-friendly, responsive intervals:
 * 
 * 1 (Again) -> Ditampilkan lagi saat itu juga (re-queue di sesi ini), interval = 0, due sekarang.
 * 2 (Hard)  -> Ditampilkan langsung setelah sesi ini selesai (due sekarang / < 1 hari).
 * 3 (Good)  -> 1 hari (besok).
 * 4 (Easy)  -> 2 hari (lusa).
 */
export function calculateNextReview(vocab: Vocabulary, rating: Rating, now: Date = new Date()): SrsCalculationResult {
  let repetitions = vocab.repetitions ?? 0;
  let lapses = vocab.lapses ?? 0;
  let correctStreak = vocab.correctStreak ?? 0;
  let totalReviews = (vocab.totalReviews ?? 0) + 1;
  let easeFactor = vocab.easeFactor ?? 2.5;

  let interval = 0; // in days
  let dueDateObj: Date;

  if (rating === 1) {
    // Again: Muncul lagi saat itu juga (sesi ini)
    repetitions = 0;
    interval = 0;
    lapses += 1;
    correctStreak = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    // Jatuh tempo detik ini juga
    dueDateObj = new Date(now.getTime());
  } else if (rating === 2) {
    // Hard: Muncul langsung setelah sesi latihan ini selesai
    repetitions = 0; // tetap dalam mode pembelajaran intensif
    interval = 0;
    lapses += 1;
    correctStreak = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.1);
    // Jatuh tempo langsung sekarang (siap saat sesi ini selesai)
    dueDateObj = new Date(now.getTime());
  } else if (rating === 3) {
    // Good: 1 hari untuk review awal, lalu meningkat bertahap teratur
    correctStreak += 1;
    repetitions += 1;

    if (repetitions <= 1) {
      interval = 1; // 1 hari persis sesuai permintaan
    } else if (repetitions === 2) {
      interval = 3;
    } else if (repetitions === 3) {
      interval = 5;
    } else if (repetitions === 4) {
      interval = 7;
    } else {
      interval = Math.min(21, 7 + (repetitions - 4) * 3);
    }

    dueDateObj = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  } else if (rating === 4) {
    // Easy: 2 hari untuk review awal, lalu meningkat bertahap teratur
    correctStreak += 1;
    repetitions += 1;

    if (repetitions <= 1) {
      interval = 2; // 2 hari persis sesuai permintaan
    } else if (repetitions === 2) {
      interval = 4;
    } else if (repetitions === 3) {
      interval = 7;
    } else {
      interval = Math.min(28, 7 + (repetitions - 3) * 5);
    }

    dueDateObj = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  } else {
    dueDateObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  // Status perhitungan
  let status: ReviewStatus = 'learning';
  if (interval >= 14 || repetitions >= 4) {
    status = 'mastered';
  } else if (repetitions >= 2 && interval >= 1) {
    status = 'review';
  } else {
    status = 'learning';
  }

  return {
    repetitions,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate: dueDateObj.toISOString(),
    status,
    lapses,
    correctStreak,
    totalReviews,
  };
}

/**
 * Checks if a vocabulary card is currently due for review.
 */
export function isVocabDue(vocab: Vocabulary, now: Date = new Date()): boolean {
  if (vocab.status === 'new') return true;
  if (!vocab.dueDate) return true;
  return new Date(vocab.dueDate) <= now;
}

/**
 * Formats due date in friendly Indonesian human-readable format.
 */
export function formatDueTime(dueDateStr: string, now: Date = new Date()): string {
  if (!dueDateStr) return 'Siap review';
  const due = new Date(dueDateStr);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) {
    return 'Jatuh tempo sekarang';
  }
  if (diffHours < 24) {
    return diffHours <= 1 ? 'Dalam 1 jam' : `Dalam ${diffHours} jam`;
  }
  if (diffDays === 1) {
    return 'Besok (1 hari)';
  }
  if (diffDays === 2) {
    return 'Lusa (2 hari)';
  }
  return `Dalam ${diffDays} hari`;
}
