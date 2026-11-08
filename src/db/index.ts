import Dexie, { type Table } from 'dexie';
import { AppSettings, Deck, ReviewLog, StudySession, Vocabulary } from '../types';
import { INITIAL_DECKS, INITIAL_VOCABULARY } from './seedData';

export class KosaktaDatabase extends Dexie {
  decks!: Table<Deck, number>;
  vocabularies!: Table<Vocabulary, number>;
  reviewLogs!: Table<ReviewLog, number>;
  studySessions!: Table<StudySession, number>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('KosaktaGermanDB');

    // Schema definition with indexes
    this.version(1).stores({
      decks: '++id, name, createdAt, updatedAt',
      vocabularies: '++id, deckId, word, article, indonesian, status, dueDate, repetitions, interval, easeFactor, createdAt, updatedAt',
      reviewLogs: '++id, vocabId, deckId, rating, isCorrect, reviewedAt',
      studySessions: '++id, deckId, mode, startedAt, completedAt',
      settings: 'id',
    });
  }
}

export const db = new KosaktaDatabase();

/**
 * Initializes the database.
 * If data clearing is requested or tables are empty, keeps them clean.
 */
export async function initializeDatabase(): Promise<void> {
  // Check if browser IndexedDB needs a clean reset to honor user request
  const CLEAN_FLAG_KEY = 'kosakta_empty_state_v1';
  const hasEmptied = typeof window !== 'undefined' ? localStorage.getItem(CLEAN_FLAG_KEY) : null;

  if (!hasEmptied) {
    // Clear all existing data from previous runs to provide 100% clean state
    await db.transaction('rw', [db.decks, db.vocabularies, db.reviewLogs, db.studySessions], async () => {
      await db.decks.clear();
      await db.vocabularies.clear();
      await db.reviewLogs.clear();
      await db.studySessions.clear();
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLEAN_FLAG_KEY, 'true');
    }
  }

  // If INITIAL_DECKS has items in the future, it can populate; currently it's empty
  const deckCount = await db.decks.count();
  if (deckCount === 0 && INITIAL_DECKS.length > 0) {
    const deckIds: number[] = [];
    for (const deck of INITIAL_DECKS) {
      const id = await db.decks.add(deck as Deck);
      deckIds.push(id);
    }

    if (INITIAL_VOCABULARY.length > 0) {
      const vocabsToInsert = INITIAL_VOCABULARY.map(v => {
        const actualDeckId = deckIds[v.deckId - 1] ?? deckIds[0];
        return {
          ...v,
          deckId: actualDeckId,
        };
      });
      await db.vocabularies.bulkAdd(vocabsToInsert as Vocabulary[]);
    }
  }

  // Normalisasi interval lama jika ada kosakata dengan interval yang terlalu panjang
  try {
    const allVocab = await db.vocabularies.toArray();
    for (const v of allVocab) {
      if (v.id && v.interval > 7) {
        await db.vocabularies.update(v.id, {
          interval: Math.min(v.interval, 7),
          repetitions: Math.min(v.repetitions || 1, 4),
        });
      }
    }
  } catch (e) {
    console.error('Failed to normalize vocabulary intervals:', e);
  }

  // Ensure default settings exist
  const existingSettings = await db.settings.get('current_settings');
  if (!existingSettings) {
    await db.settings.put({
      id: 'current_settings',
      theme: 'system',
      defaultDirection: 'de-id',
      defaultPracticeCount: 20,
      defaultPracticeOrder: 'random',
      dailyGoal: 15,
      autoPlayAudio: false,
      caseSensitiveCheck: false,
      showArticleHints: true,
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Resets the entire database to a completely clean/empty state.
 */
export async function resetDatabase(): Promise<void> {
  await db.transaction('rw', [db.decks, db.vocabularies, db.reviewLogs, db.studySessions], async () => {
    await db.decks.clear();
    await db.vocabularies.clear();
    await db.reviewLogs.clear();
    await db.studySessions.clear();
  });
}
