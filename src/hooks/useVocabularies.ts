import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { GermanArticle, ReviewStatus, Vocabulary } from '../types';

export interface VocabFilterOptions {
  deckId?: number;
  search?: string;
  article?: GermanArticle | 'all';
  status?: ReviewStatus | 'all';
}

export function useVocabularies(options: VocabFilterOptions = {}) {
  const { deckId, search = '', article = 'all', status = 'all' } = options;

  const vocabularies = useLiveQuery(async () => {
    let query = db.vocabularies.toCollection();

    if (deckId !== undefined) {
      query = db.vocabularies.where('deckId').equals(deckId);
    }

    let items = await query.toArray();

    // Client-side filtering for fast dynamic query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        v =>
          v.word.toLowerCase().includes(q) ||
          v.indonesian.toLowerCase().includes(q) ||
          (v.exampleGerman && v.exampleGerman.toLowerCase().includes(q)) ||
          (v.notes && v.notes.toLowerCase().includes(q))
      );
    }

    if (article !== 'all') {
      items = items.filter(v => v.article === article);
    }

    if (status !== 'all') {
      items = items.filter(v => v.status === status);
    }

    // Default sort: newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deckId, search, article, status]);

  const addVocabulary = async (vocabData: {
    deckId: number;
    word: string;
    article: GermanArticle;
    plural?: string;
    indonesian: string;
    exampleGerman?: string;
    exampleIndonesian?: string;
    notes?: string;
  }) => {
    const now = new Date().toISOString();
    const newVocab: Omit<Vocabulary, 'id'> = {
      ...vocabData,
      status: 'new',
      repetitions: 0,
      interval: 0,
      easeFactor: 2.5,
      dueDate: now,
      lapses: 0,
      correctStreak: 0,
      totalReviews: 0,
      createdAt: now,
      updatedAt: now,
    };

    return await db.vocabularies.add(newVocab as Vocabulary);
  };

  const updateVocabulary = async (id: number, vocabData: Partial<Vocabulary>) => {
    return await db.vocabularies.update(id, {
      ...vocabData,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteVocabulary = async (id: number) => {
    return await db.transaction('rw', [db.vocabularies, db.reviewLogs], async () => {
      await db.vocabularies.delete(id);
      await db.reviewLogs.where('vocabId').equals(id).delete();
    });
  };

  return {
    vocabularies: vocabularies || [],
    isLoading: vocabularies === undefined,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
  };
}

