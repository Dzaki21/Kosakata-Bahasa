import React from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RetentionChart } from '../components/dashboard/RetentionChart';

export const StatisticsPage: React.FC = () => {
  const { stats, isLoading } = useStats();

  // Load recent study sessions
  const sessions = useLiveQuery(async () => {
    const all = await db.studySessions.toArray();
    return all.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 10);
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const {
    totalDecks,
    totalVocab,
    wordsMastered,
    wordsLearning,
    wordsNew,
    wordsDue,
    totalReviews,
    totalSessions,
    overallAccuracy,
    dailyActivity,
    statusDistribution,
    ratingDistribution,
    streak,
    todayReviews,
  } = stats;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tingkat Akurasi</span>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {overallAccuracy}%
          </span>
          <span className="text-[11px] block text-slate-400 mt-1">
            Dari {totalReviews} kali pengujian
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Streak Belajar</span>
          </div>
          <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {streak} Hari
          </span>
          <span className="text-[11px] block text-slate-400 mt-1">
            {todayReviews} kata dipelajari hari ini
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
            <RotateCcw className="w-4 h-4 text-brand-500" />
            <span>Total Sesi Belajar</span>
          </div>
          <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
            {totalSessions}
          </span>
          <span className="text-[11px] block text-slate-400 mt-1">
            Review SRS & Latihan
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
            <Award className="w-4 h-4 text-purple-500" />
            <span>Kata Dikuasai</span>
          </div>
          <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {wordsMastered}
          </span>
          <span className="text-[11px] block text-slate-400 mt-1">
            Interval &gt; 21 hari
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ActivityChart data={dailyActivity} />
        </div>
        <div>
          <RetentionChart
            statusDistribution={statusDistribution}
            ratingDistribution={ratingDistribution}
          />
        </div>
      </div>

      {/* Rating Breakdown Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          Distribusi Rating Active Recall
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Frekuensi tingkat ingatan yang Anda pilih saat mengevaluasi kartu
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ratingDistribution.map(item => (
            <div
              key={item.name}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {item.count}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0}% total
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Riwayat 10 Sesi Belajar Terakhir
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log aktivitas sesi belajar yang tersimpan di IndexedDB
          </p>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Waktu Sesi</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Arah</th>
                  <th className="py-3 px-4">Total Kartu</th>
                  <th className="py-3 px-4">Akurasi</th>
                  <th className="py-3 px-4">Durasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sessions.map(s => {
                  const dateObj = new Date(s.completedAt);
                  const dateFormatted = dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const accuracy = s.totalCards > 0 ? Math.round((s.correctCards / s.totalCards) * 100) : 0;
                  const mins = Math.floor(s.durationSeconds / 60);
                  const secs = s.durationSeconds % 60;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {dateFormatted}
                      </td>
                      <td className="py-3 px-4">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.mode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {s.direction}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {s.totalCards} kata
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {mins > 0 ? `${mins}m ` : ''}{secs}d
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada riwayat sesi belajar. Mulai sesi review atau latihan untuk mencatat progres!
          </div>
        )}
      </div>
    </div>
  );
};
