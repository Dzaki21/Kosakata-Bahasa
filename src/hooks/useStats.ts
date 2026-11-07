import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { isVocabDue } from '../services/srs';

export interface DailyActivityPoint {
  date: string; // e.g. "05 Nov"
  fullDate: string; // YYYY-MM-DD
  count: number;
  correct: number;
}

export interface RatingDistribution {
  name: string;
  count: number;
  color: string;
}

export function useStats() {
  const stats = useLiveQuery(async () => {
    const decks = await db.decks.toArray();
    const vocabularies = await db.vocabularies.toArray();
    const reviewLogs = await db.reviewLogs.toArray();
    const studySessions = await db.studySessions.toArray();

    const now = new Date();

    const totalDecks = decks.length;
    const totalVocab = vocabularies.length;
    const wordsMastered = vocabularies.filter(v => v.status === 'mastered').length;
    const wordsLearning = vocabularies.filter(v => v.status === 'learning' || v.status === 'review').length;
    const wordsNew = vocabularies.filter(v => v.status === 'new').length;
    const wordsDue = vocabularies.filter(v => isVocabDue(v, now)).length;

    const totalReviews = reviewLogs.length;
    const totalSessions = studySessions.length;

    // Accuracy
    const correctReviews = reviewLogs.filter(r => r.isCorrect).length;
    const overallAccuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

    // Rating breakdown
    const againCount = reviewLogs.filter(r => r.rating === 1).length;
    const hardCount = reviewLogs.filter(r => r.rating === 2).length;
    const goodCount = reviewLogs.filter(r => r.rating === 3).length;
    const easyCount = reviewLogs.filter(r => r.rating === 4).length;

    const ratingDistribution: RatingDistribution[] = [
      { name: 'Again (Ulangi)', count: againCount, color: '#ef4444' },
      { name: 'Hard (Sulit)', count: hardCount, color: '#f59e0b' },
      { name: 'Good (Bagus)', count: goodCount, color: '#3b82f6' },
      { name: 'Easy (Mudah)', count: easyCount, color: '#10b981' },
    ];

    // Status breakdown for Pie Chart
    const statusDistribution = [
      { name: 'Mastered', value: wordsMastered, color: '#10b981' },
      { name: 'Learning', value: wordsLearning, color: '#3b82f6' },
      { name: 'New Words', value: wordsNew, color: '#94a3b8' },
    ];

    // Daily activity for the past 14 days
    const dailyMap = new Map<string, { count: number; correct: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap.set(dateKey, { count: 0, correct: 0 });
    }

    reviewLogs.forEach(log => {
      if (log.reviewedAt) {
        const dateKey = log.reviewedAt.split('T')[0];
        if (dailyMap.has(dateKey)) {
          const curr = dailyMap.get(dateKey)!;
          dailyMap.set(dateKey, {
            count: curr.count + 1,
            correct: curr.correct + (log.isCorrect ? 1 : 0),
          });
        }
      }
    });

    const dailyActivity: DailyActivityPoint[] = Array.from(dailyMap.entries()).map(([fullDate, val]) => {
      const parts = fullDate.split('-');
      const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const formatted = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      return {
        date: formatted,
        fullDate,
        count: val.count,
        correct: val.correct,
      };
    });

    // Today's reviews
    const todayKey = now.toISOString().split('T')[0];
    const todayReviews = dailyMap.get(todayKey)?.count || 0;

    // Calculate learning streak
    let streak = 0;
    const checkDate = new Date();
    // If user hasn't studied today, check if they studied yesterday
    const studiedToday = (dailyMap.get(todayKey)?.count || 0) > 0;
    if (!studiedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 30; i++) {
      const key = checkDate.toISOString().split('T')[0];
      const count = reviewLogs.filter(r => r.reviewedAt?.startsWith(key)).length;
      if (count > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalDecks,
      totalVocab,
      wordsMastered,
      wordsLearning,
      wordsNew,
      wordsDue,
      totalReviews,
      totalSessions,
      overallAccuracy,
      ratingDistribution,
      statusDistribution,
      dailyActivity,
      todayReviews,
      streak,
    };
  }, []);

  return {
    stats,
    isLoading: stats === undefined,
  };
}

