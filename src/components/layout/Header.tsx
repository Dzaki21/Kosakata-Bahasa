import React from 'react';
import { Menu, Sparkles, Moon, Sun } from 'lucide-react';
import { NavItem } from './Sidebar';
import { useSettingsStore } from '../../store/useSettingsStore';

interface HeaderProps {
  currentTab: NavItem;
  onOpenMobileMenu?: () => void;
  onStartReview?: () => void;
  dueCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onStartReview,
  dueCount = 0,
}) => {
  const { settings, setTheme } = useSettingsStore();

  const titleMap: Record<NavItem, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Pembelajaran',
      subtitle: 'Pantau kemajuan kosakata dan jadwal pengulangan berjarak (SRS)',
    },
    decks: {
      title: 'My Decks (Koleksi Deck)',
      subtitle: 'Kelola deck kosakata Jerman, tingkat kesulitan, dan kategori topik',
    },
    review: {
      title: 'Review Sesi & Latihan',
      subtitle: 'Tingkatkan daya ingat melalui Active Recall dan algoritma SM-2',
    },
    statistics: {
      title: 'Statistik & Analisis',
      subtitle: 'Evaluasi akurasi, retensi ingatan, dan aktivitas harian belajar',
    },
    settings: {
      title: 'Pengaturan Aplikasi',
      subtitle: 'Kustomisasi tampilan, arah review, ekspor & impor cadangan data',
    },
  };

  const isDarkMode =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {titleMap[currentTab]?.title || 'Kosakta'}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            {titleMap[currentTab]?.subtitle}
          </p>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center space-x-3">
        {onStartReview && dueCount > 0 && (
          <button
            onClick={onStartReview}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all shadow-brand-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Review Sekarang ({dueCount})</span>
          </button>
        )}

        {/* Quick theme button for mobile header */}
        <button
          onClick={toggleTheme}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
