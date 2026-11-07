import { create } from 'zustand';
import { db } from '../db';
import { Rating, ReviewDirection, StudySession, Vocabulary } from '../types';
import { calculateNextReview, isVocabDue } from '../services/srs';
import { validateDeToId, validateIdToDe, ValidationResult } from '../services/validator';

export interface ActiveCard {
  vocab: Vocabulary;
  direction: 'de-id' | 'id-de';
}

interface ReviewState {
  // Session Configuration
  mode: 'review' | 'practice';
  deckId?: number;
  directionPreference: ReviewDirection;
  
  // Active Session State
  isActive: boolean;
  isFinished: boolean;
  cards: ActiveCard[];
  currentIndex: number;
  userInput: string;
  isSubmitted: boolean;
  validationResult: ValidationResult | null;
  cardStartTime: number;
  
  // Results summary
  sessionStartTime: number;
  totalDurationSeconds: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;

  // Actions
  startReviewSession: (deckId?: number) => Promise<{ success: boolean; count: number }>;
  startPracticeSession: (options: {
    deckId?: number;
    count: number;
    order: 'sequential' | 'random';
    direction: ReviewDirection;
  }) => Promise<{ success: boolean; count: number }>;
  setUserInput: (input: string) => void;
  appendCharacter: (char: string) => void;
  submitAnswer: () => void;
  rateCard: (rating: Rating) => Promise<void>;
  quitSession: () => void;
  restartSession: () => void;
}

// Fisher-Yates array shuffle without duplicates
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resolveCardDirection(preference: ReviewDirection): 'de-id' | 'id-de' {
  if (preference === 'mixed') {
    return Math.random() > 0.5 ? 'de-id' : 'id-de';
  }
  return preference;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  mode: 'review',
  deckId: undefined,
  directionPreference: 'de-id',
  
  isActive: false,
  isFinished: false,
  cards: [],
  currentIndex: 0,
  userInput: '',
  isSubmitted: false,
  validationResult: null,
  cardStartTime: Date.now(),
  
  sessionStartTime: Date.now(),
  totalDurationSeconds: 0,
  againCount: 0,
  hardCount: 0,
  goodCount: 0,
  easyCount: 0,
  correctAnswersCount: 0,
  incorrectAnswersCount: 0,

  startReviewSession: async (deckId?: number) => {
    let allVocab: Vocabulary[];
    if (deckId !== undefined) {
      allVocab = await db.vocabularies.where('deckId').equals(deckId).toArray();
    } else {
      allVocab = await db.vocabularies.toArray();
    }

    const now = new Date();
    // Filter due cards or cards with 'new' status
    const dueVocab = allVocab.filter(v => isVocabDue(v, now));

    if (dueVocab.length === 0) {
      return { success: false, count: 0 };
    }

    // Sort by priority: 'new' first, then overdue
    dueVocab.sort((a, b) => {
      if (a.status === 'new' && b.status !== 'new') return -1;
      if (b.status === 'new' && a.status !== 'new') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const settings = await db.settings.get('current_settings');
    const directionPref = settings?.defaultDirection || 'de-id';

    const cards: ActiveCard[] = dueVocab.map(v => ({
      vocab: v,
      direction: resolveCardDirection(directionPref),
    }));

    set({
      mode: 'review',
      deckId,
      directionPreference: directionPref,
      isActive: true,
      isFinished: false,
      cards,
      currentIndex: 0,
      userInput: '',
      isSubmitted: false,
      validationResult: null,
      cardStartTime: Date.now(),
      sessionStartTime: Date.now(),
      totalDurationSeconds: 0,
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
      easyCount: 0,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
    });

    return { success: true, count: cards.length };
  },

  startPracticeSession: async ({ deckId, count, order, direction }) => {
    let allVocab: Vocabulary[];
    if (deckId !== undefined) {
      allVocab = await db.vocabularies.where('deckId').equals(deckId).toArray();
    } else {
      allVocab = await db.vocabularies.toArray();
    }

    if (allVocab.length === 0) {
      return { success: false, count: 0 };
    }

    let selectedVocab = [...allVocab];
    if (order === 'random') {
      selectedVocab = shuffleArray(selectedVocab);
    }

    // count: 0 means all words
    if (count > 0 && selectedVocab.length > count) {
      selectedVocab = selectedVocab.slice(0, count);
    }

    const cards: ActiveCard[] = selectedVocab.map(v => ({
      vocab: v,
      direction: resolveCardDirection(direction),
    }));

    set({
      mode: 'practice',
      deckId,
      directionPreference: direction,
      isActive: true,
      isFinished: false,
      cards,
      currentIndex: 0,
      userInput: '',
      isSubmitted: false,
      validationResult: null,
      cardStartTime: Date.now(),
      sessionStartTime: Date.now(),
      totalDurationSeconds: 0,
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
      easyCount: 0,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
    });

    return { success: true, count: cards.length };
  },

  setUserInput: (input: string) => {
    set({ userInput: input });
  },

  appendCharacter: (char: string) => {
    const current = get().userInput;
    set({ userInput: current + char });
  },

  submitAnswer: () => {
    const state = get();
    if (state.isSubmitted || state.currentIndex >= state.cards.length) return;

    const currentCard = state.cards[state.currentIndex];
    let result: ValidationResult;

    if (currentCard.direction === 'de-id') {
      result = validateDeToId(state.userInput, currentCard.vocab);
    } else {
      result = validateIdToDe(state.userInput, currentCard.vocab);
    }

    set({
      isSubmitted: true,
      validationResult: result,
      correctAnswersCount: state.correctAnswersCount + (result.isCorrect ? 1 : 0),
      incorrectAnswersCount: state.incorrectAnswersCount + (result.isCorrect ? 0 : 1),
    });
  },

  rateCard: async (rating: Rating) => {
    const state = get();
    if (state.currentIndex >= state.cards.length) return;

    const currentCard = state.cards[state.currentIndex];
    const vocab = currentCard.vocab;
    const now = new Date();
    const durationMs = Date.now() - state.cardStartTime;

    // Log the review
    if (vocab.id) {
      await db.reviewLogs.add({
        vocabId: vocab.id,
        deckId: vocab.deckId,
        rating,
        direction: currentCard.direction,
        userAnswer: state.userInput,
        correctAnswer: state.validationResult?.expectedAnswer || vocab.indonesian,
        isCorrect: state.validationResult?.isCorrect ?? false,
        reviewedAt: now.toISOString(),
        durationMs,
      });

      // In review mode (or practice mode), update SRS schedule
      const srsUpdate = calculateNextReview(vocab, rating, now);
      await db.vocabularies.update(vocab.id, {
        ...srsUpdate,
        lastReviewedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }

    // Counters
    let againCount = state.againCount;
    let hardCount = state.hardCount;
    let goodCount = state.goodCount;
    let easyCount = state.easyCount;

    if (rating === 1) againCount++;
    else if (rating === 2) hardCount++;
    else if (rating === 3) goodCount++;
    else if (rating === 4) easyCount++;

    const nextIndex = state.currentIndex + 1;

    // Check if session finished
    if (nextIndex >= state.cards.length) {
      const durationSeconds = Math.round((Date.now() - state.sessionStartTime) / 1000);

      // Save completed study session
      const completedSession: StudySession = {
        deckId: state.deckId,
        mode: state.mode,
        direction: state.directionPreference,
        totalCards: state.cards.length,
        correctCards: state.correctAnswersCount,
        againCount,
        hardCount,
        goodCount,
        easyCount,
        durationSeconds,
        startedAt: new Date(state.sessionStartTime).toISOString(),
        completedAt: now.toISOString(),
      };
      await db.studySessions.add(completedSession);

      set({
        isFinished: true,
        isActive: false,
        currentIndex: nextIndex,
        totalDurationSeconds: durationSeconds,
        againCount,
        hardCount,
        goodCount,
        easyCount,
      });
    } else {
      set({
        currentIndex: nextIndex,
        userInput: '',
        isSubmitted: false,
        validationResult: null,
        cardStartTime: Date.now(),
        againCount,
        hardCount,
        goodCount,
        easyCount,
      });
    }
  },

  quitSession: () => {
    set({
      isActive: false,
      isFinished: false,
      cards: [],
      currentIndex: 0,
      userInput: '',
      isSubmitted: false,
      validationResult: null,
    });
  },

  restartSession: () => {
    const state = get();
    const resetCards = state.cards.map(c => ({
      ...c,
      direction: resolveCardDirection(state.directionPreference),
    }));

    set({
      isActive: true,
      isFinished: false,
      cards: resetCards,
      currentIndex: 0,
      userInput: '',
      isSubmitted: false,
      validationResult: null,
      cardStartTime: Date.now(),
      sessionStartTime: Date.now(),
      totalDurationSeconds: 0,
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
      easyCount: 0,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
    });
  },
}));
