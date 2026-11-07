import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  BarChart3,
  Settings,
  Languages,
  Moon,
  Sun,
  Flame,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

export type NavItem = 'dashboard' | 'decks' | 'review' | 'statistics' | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  dueCount?: number;
  streak?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  dueCount = 0,
  streak = 0,
}) => {
  const { settings, setTheme } = useSettingsStore();

  const navItems = [
    {
      id: 'dashboard' as NavItem,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'decks' as NavItem,
      label: 'My Decks',
      icon: Layers,
    },
    {
      id: 'review' as NavItem,
      label: 'Review (SRS)',
      icon: Sparkles,
      badge: dueCount > 0 ? dueCount : undefined,
    },
    {
      id: 'statistics' as NavItem,
      label: 'Statistik',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavItem,
      label: 'Pengaturan',
      icon: Settings,
    },
  ];

  const isDarkMode =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Kosakta
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800">
                SRS
              </span>
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
              German Vocab Memorizer
            </p>
          </div>
        </div>
      </div>

      {/* Streak bar if > 0 */}
      {streak > 0 && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>Streak Belajar</span>
          </div>
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
            {streak} Hari
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-sm shadow-brand-500/5'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-500 text-white shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2">
          v1.0 • Offline Ready
        </div>
        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </aside>
  );
};

