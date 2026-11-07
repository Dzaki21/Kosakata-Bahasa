import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Deck, Vocabulary } from '../types';
import { isVocabDue } from '../services/srs';

export interface DeckWithStats extends Deck {
  totalVocab: number;
  dueCount: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
  progressPercentage: number;
}

export function useDecks() {
  const decks = useLiveQuery(async () => {
    const allDecks = await db.decks.toArray();
    const allVocab = await db.vocabularies.toArray();
    const now = new Date();

    const decksWithStats: DeckWithStats[] = allDecks.map(deck => {
      const deckVocab = allVocab.filter(v => v.deckId === deck.id);
      const total = deckVocab.length;
      const due = deckVocab.filter(v => isVocabDue(v, now)).length;
      const mastered = deckVocab.filter(v => v.status === 'mastered').length;
      const learning = deckVocab.filter(v => v.status === 'learning' || v.status === 'review').length;
      const newCount = deckVocab.filter(v => v.status === 'new').length;
      const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;

      return {
        ...deck,
        totalVocab: total,
        dueCount: due,
        masteredCount: mastered,
        learningCount: learning,
        newCount,
        progressPercentage: progress,
      };
    });

    return decksWithStats;
  }, []);

  const createDeck = async (data: { name: string; description: string; color?: string; icon?: string }) => {
    const now = new Date().toISOString();
    return await db.decks.add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateDeck = async (id: number, data: Partial<Deck>) => {
    return await db.decks.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteDeck = async (id: number) => {
    return await db.transaction('rw', [db.decks, db.vocabularies, db.reviewLogs], async () => {
      await db.decks.delete(id);
      await db.vocabularies.where('deckId').equals(id).delete();
      await db.reviewLogs.where('deckId').equals(id).delete();
    });
  };

  return {
    decks: decks || [],
    isLoading: decks === undefined,
    createDeck,
    updateDeck,
    deleteDeck,
  };
}
