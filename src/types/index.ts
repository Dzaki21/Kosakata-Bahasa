export type GermanArticle = 'der' | 'die' | 'das' | '';

export type ReviewStatus = 'new' | 'learning' | 'review' | 'mastered';

export type Rating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export type ReviewDirection = 'de-id' | 'id-de' | 'mixed';

export interface Vocabulary {
  id?: number;
  deckId: number;
  word: string; // German word, e.g. "Haus"
  article: GermanArticle; // der / die / das / empty
  plural?: string; // e.g. "Häuser" or "die Häuser"
  indonesian: string; // e.g. "Rumah"
  exampleGerman?: string; // e.g. "Das Haus ist groß."
  exampleIndonesian?: string; // e.g. "Rumah itu besar."
  notes?: string;
  
  // SRS properties
  status: ReviewStatus;
  repetitions: number; // how many consecutive successful reviews
  interval: number; // interval in days
  easeFactor: number; // SM-2 ease factor (starts at 2.5)
  dueDate: string; // ISO string for when it should be reviewed next
  lastReviewedAt?: string; // ISO string
  lapses: number; // number of times forgotten (rated "Again")
  correctStreak: number;
  totalReviews: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id?: number;
  name: string;
  description: string;
  color?: string; // hex color or tailwind accent
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewLog {
  id?: number;
  vocabId: number;
  deckId: number;
  rating: Rating;
  direction: 'de-id' | 'id-de';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  reviewedAt: string; // ISO date string
  durationMs?: number; // time taken to answer in ms
}

export interface StudySession {
  id?: number;
  deckId?: number; // undefined means all decks
  mode: 'review' | 'practice';
  direction: ReviewDirection;
  totalCards: number;
  correctCards: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
}

export interface AppSettings {
  id: string; // 'current_settings'
  theme: 'light' | 'dark' | 'system';
  defaultDirection: ReviewDirection;
  defaultPracticeCount: number; // 10, 20, 50, 100, 0 (all)
  defaultPracticeOrder: 'sequential' | 'random';
  dailyGoal: number; // number of cards to review daily
  autoPlayAudio?: boolean;
  caseSensitiveCheck: boolean;
  showArticleHints: boolean;
  updatedAt: string;
}

