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
 * Calculates next review parameters using an optimized SM-2 Spaced Repetition Algorithm.
 * 
 * Ratings:
 * 1 = Again: Forgot the card, reset streak, review again soon
 * 2 = Hard: Remembered with significant difficulty, small interval bump
 * 3 = Good: Standard correct recall, interval grows by ease factor
 * 4 = Easy: Effortless recall, bonus interval multiplier and higher ease factor
 */
export function calculateNextReview(vocab: Vocabulary, rating: Rating, now: Date = new Date()): SrsCalculationResult {
  let repetitions = vocab.repetitions ?? 0;
  let interval = vocab.interval ?? 0;
  let easeFactor = vocab.easeFactor ?? 2.5;
  let lapses = vocab.lapses ?? 0;
  let correctStreak = vocab.correctStreak ?? 0;
  let totalReviews = (vocab.totalReviews ?? 0) + 1;

  if (rating === 1) {
    // Again
    repetitions = 0;
    interval = 1; // Due tomorrow
    lapses += 1;
    correctStreak = 0;
    // Lower ease factor, minimum 1.3
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === 2) {
    // Hard
    correctStreak += 1;
    if (repetitions === 0) {
      interval = 1;
      repetitions = 1;
    } else {
      interval = Math.max(1, Math.round(interval * 1.2));
      repetitions += 1;
    }
    // Slight penalty to ease factor
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 3) {
    // Good
    correctStreak += 1;
    if (repetitions === 0) {
      interval = 1;
      repetitions = 1;
    } else if (repetitions === 1) {
      interval = 3;
      repetitions = 2;
    } else {
      interval = Math.max(1, Math.round(interval * easeFactor));
      repetitions += 1;
    }
    // Ease factor remains stable or slightly adjusts
    // SM-2: EF' = EF + (0.1 - (5-4)*(0.08 + (5-4)*0.02)) = EF + 0
  } else if (rating === 4) {
    // Easy
    correctStreak += 1;
    if (repetitions === 0) {
      interval = 4;
      repetitions = 1;
    } else if (repetitions === 1) {
      interval = 7;
      repetitions = 2;
    } else {
      interval = Math.max(1, Math.round(interval * easeFactor * 1.35));
      repetitions += 1;
    }
    // Increase ease factor, capped at 3.0
    easeFactor = Math.min(3.0, easeFactor + 0.15);
  }

  // Calculate new status
  let status: ReviewStatus = 'learning';
  if (interval >= 21 || repetitions >= 5) {
    status = 'mastered';
  } else if (repetitions >= 2) {
    status = 'review';
  } else {
    status = 'learning';
  }

  // Calculate due date (current time + interval days)
  const dueDateObj = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  const dueDate = dueDateObj.toISOString();

  return {
    repetitions,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate,
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
 * Formats due date in a friendly human-readable format (e.g. "Today", "Tomorrow", "In 3 days", "Overdue by 2 days").
 */
export function formatDueTime(dueDateStr: string, now: Date = new Date()): string {
  if (!dueDateStr) return 'Ready';
  const due = new Date(dueDateStr);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return overdue === 1 ? '1 day overdue' : `${overdue} days overdue`;
  }
  if (diffDays === 0) {
    return 'Due today';
  }
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  return `In ${diffDays} days`;
}
