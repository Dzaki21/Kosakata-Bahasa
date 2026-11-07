import { create } from 'zustand';
import { db } from '../db';
import { AppSettings, ReviewDirection } from '../types';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
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
};

function applyThemeToDocument(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    try {
      const stored = await db.settings.get('current_settings');
      if (stored) {
        set({ settings: stored, isLoading: false });
        applyThemeToDocument(stored.theme);
      } else {
        await db.settings.put(DEFAULT_SETTINGS);
        set({ settings: DEFAULT_SETTINGS, isLoading: false });
        applyThemeToDocument(DEFAULT_SETTINGS.theme);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
      set({ isLoading: false });
    }
  },

  updateSettings: async (partial: Partial<AppSettings>) => {
    const current = get().settings;
    const updated: AppSettings = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    set({ settings: updated });
    await db.settings.put(updated);

    if (partial.theme) {
      applyThemeToDocument(partial.theme);
    }
  },

  setTheme: async (theme: 'light' | 'dark' | 'system') => {
    await get().updateSettings({ theme });
  },
}));

