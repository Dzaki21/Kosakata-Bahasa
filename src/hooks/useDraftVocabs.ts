import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { DraftVocab, GermanArticle } from '../types';

export function useDraftVocabs() {
  const draftVocabs = useLiveQuery(async () => {
    return await db.draftVocabs.orderBy('createdAt').reverse().toArray();
  }, []);

  const addDraftVocab = async (data: {
    word: string;
    article: GermanArticle;
    plural?: string;
    indonesian: string;
    exampleGerman?: string;
    exampleIndonesian?: string;
    notes?: string;
  }) => {
    const now = new Date().toISOString();
    return await db.draftVocabs.add({
      ...data,
      isMemorized: false,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateDraftVocab = async (id: number, data: Partial<DraftVocab>) => {
    return await db.draftVocabs.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteDraftVocab = async (id: number) => {
    return await db.draftVocabs.delete(id);
  };

  const moveToDeck = async (draftId: number, targetDeckId: number) => {
    const draft = await db.draftVocabs.get(draftId);
    if (!draft) return;

    const now = new Date().toISOString();

    await db.transaction('rw', [db.draftVocabs, db.vocabularies], async () => {
      // Masukkan ke deck
      await db.vocabularies.add({
        deckId: targetDeckId,
        word: draft.word,
        article: draft.article,
        plural: draft.plural,
        indonesian: draft.indonesian,
        exampleGerman: draft.exampleGerman,
        exampleIndonesian: draft.exampleIndonesian,
        notes: draft.notes,
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
      });

      // Hapus dari draft
      await db.draftVocabs.delete(draftId);
    });
  };

  return {
    draftVocabs: draftVocabs || [],
    isLoading: draftVocabs === undefined,
    addDraftVocab,
    updateDraftVocab,
    deleteDraftVocab,
    moveToDeck,
  };
}
