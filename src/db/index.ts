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
 * Initializes the database with seed data if it's currently empty.
 */
export async function initializeDatabase(): Promise<void> {
  const deckCount = await db.decks.count();
  if (deckCount === 0) {
    console.log('Seeding initial German decks and vocabulary...');
    
    // Add decks and keep track of generated IDs
    const deckIds: number[] = [];
    for (const deck of INITIAL_DECKS) {
      const id = await db.decks.add(deck as Deck);
      deckIds.push(id);
    }

    // Add initial vocabularies with corresponding deck IDs
    const vocabsToInsert = INITIAL_VOCABULARY.map(v => {
      // Map initial 1-based deckId to the actual inserted deck id
      const actualDeckId = deckIds[v.deckId - 1] ?? deckIds[0];
      return {
        ...v,
        deckId: actualDeckId,
      };
    });

    await db.vocabularies.bulkAdd(vocabsToInsert as Vocabulary[]);
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
 * Resets the entire database and re-seeds starter data.
 */
export async function resetDatabase(): Promise<void> {
  await db.transaction('rw', [db.decks, db.vocabularies, db.reviewLogs, db.studySessions, db.settings], async () => {
    await db.decks.clear();
    await db.vocabularies.clear();
    await db.reviewLogs.clear();
    await db.studySessions.clear();
    await db.settings.clear();
  });
  await initializeDatabase();
}
