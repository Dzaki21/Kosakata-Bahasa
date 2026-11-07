import { db } from '../db';
import { AppSettings, Deck, ReviewLog, StudySession, Vocabulary } from '../types';

export interface BackupData {
  version: number;
  appName: string;
  exportedAt: string;
  data: {
    decks: Deck[];
    vocabularies: Vocabulary[];
    reviewLogs: ReviewLog[];
    studySessions: StudySession[];
    settings?: AppSettings;
  };
}

/**
 * Exports all data from IndexedDB into a JSON string and triggers browser download.
 */
export async function exportDatabaseToJson(): Promise<string> {
  const decks = await db.decks.toArray();
  const vocabularies = await db.vocabularies.toArray();
  const reviewLogs = await db.reviewLogs.toArray();
  const studySessions = await db.studySessions.toArray();
  const settings = await db.settings.get('current_settings');

  const backup: BackupData = {
    version: 1,
    appName: 'Kosakta',
    exportedAt: new Date().toISOString(),
    data: {
      decks,
      vocabularies,
      reviewLogs,
      studySessions,
      settings,
    },
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `kosakta-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return jsonString;
}

/**
 * Validates whether the imported JSON object conforms to the Kosakta schema.
 */
export function validateBackupFile(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File is not a valid JSON object' };
  }

  if (!data.data || typeof data.data !== 'object') {
    return { valid: false, error: 'Backup does not contain a "data" object' };
  }

  const { decks, vocabularies } = data.data;

  if (!Array.isArray(decks)) {
    return { valid: false, error: 'Decks data is missing or invalid' };
  }

  for (const deck of decks) {
    if (!deck.name || typeof deck.name !== 'string') {
      return { valid: false, error: 'A deck entry is missing a valid name' };
    }
  }

  if (!Array.isArray(vocabularies)) {
    return { valid: false, error: 'Vocabularies data is missing or invalid' };
  }

  for (const vocab of vocabularies) {
    if (!vocab.word || typeof vocab.word !== 'string') {
      return { valid: false, error: 'A vocabulary entry is missing a German word' };
    }
    if (!vocab.indonesian || typeof vocab.indonesian !== 'string') {
      return { valid: false, error: 'A vocabulary entry is missing an Indonesian translation' };
    }
  }

  return { valid: true };
}

/**
 * Imports backup data into IndexedDB.
 * Supports mode: 'replace' (clears old data) or 'merge' (appends with ID remapping).
 */
export async function importDatabaseFromJson(
  backup: BackupData,
  mode: 'replace' | 'merge' = 'merge'
): Promise<{ decksImported: number; vocabImported: number }> {
  const { decks, vocabularies, reviewLogs, studySessions, settings } = backup.data;

  let decksImported = 0;
  let vocabImported = 0;

  if (mode === 'replace') {
    await db.transaction('rw', [db.decks, db.vocabularies, db.reviewLogs, db.studySessions, db.settings], async () => {
      await db.decks.clear();
      await db.vocabularies.clear();
      await db.reviewLogs.clear();
      await db.studySessions.clear();
      if (settings) {
        await db.settings.put(settings);
      }

      await db.decks.bulkAdd(decks);
      await db.vocabularies.bulkAdd(vocabularies);
      if (reviewLogs && reviewLogs.length > 0) {
        await db.reviewLogs.bulkAdd(reviewLogs);
      }
      if (studySessions && studySessions.length > 0) {
        await db.studySessions.bulkAdd(studySessions);
      }
    });

    decksImported = decks.length;
    vocabImported = vocabularies.length;
  } else {
    // Merge mode: Re-map deck IDs to avoid collision
    await db.transaction('rw', [db.decks, db.vocabularies], async () => {
      const oldToNewDeckIdMap = new Map<number, number>();

      for (const deck of decks) {
        const oldId = deck.id;
        const deckCopy = { ...deck };
        delete deckCopy.id;
        const newId = await db.decks.add(deckCopy);
        if (oldId !== undefined) {
          oldToNewDeckIdMap.set(oldId, newId);
        }
        decksImported++;
      }

      const vocabsToAdd: Vocabulary[] = vocabularies.map(v => {
        const copy = { ...v };
        delete copy.id;
        if (copy.deckId && oldToNewDeckIdMap.has(copy.deckId)) {
          copy.deckId = oldToNewDeckIdMap.get(copy.deckId)!;
        }
        return copy;
      });

      await db.vocabularies.bulkAdd(vocabsToAdd);
      vocabImported = vocabsToAdd.length;
    });
  }

  return { decksImported, vocabImported };
}
