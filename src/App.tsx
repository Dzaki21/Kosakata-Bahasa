import React, { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { NavItem } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { DecksPage } from './pages/DecksPage';
import { ReviewPage } from './pages/ReviewPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { initializeDatabase } from './db';
import { useSettingsStore } from './store/useSettingsStore';
import { useReviewStore } from './store/useReviewStore';
import { ReviewDirection } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  const { loadSettings } = useSettingsStore();
  const { startReviewSession, startPracticeSession } = useReviewStore();

  useEffect(() => {
    async function boot() {
      try {
        await initializeDatabase();
        await loadSettings();
      } catch (err) {
        console.error('Failed to initialize Kosakta:', err);
      } finally {
        setIsDbReady(true);
      }
    }
    boot();
  }, [loadSettings]);

  const handleStartReview = async (deckId?: number) => {
    const res = await startReviewSession(deckId);
    setCurrentTab('review');
  };

  const handleStartPractice = async (options: {
    deckId?: number;
    count: number;
    order: 'sequential' | 'random';
    direction: ReviewDirection;
  }) => {
    await startPracticeSession(options);
    setCurrentTab('review');
  };

  const handleNavigateToDeckDetail = (deckId: number) => {
    setSelectedDeckId(deckId);
    setCurrentTab('decks');
  };

  if (!isDbReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-400">
          Memuat Kosakta & IndexedDB...
        </p>
      </div>
    );
  }

  return (
    <AppLayout
      currentTab={currentTab}
      onSelectTab={tab => {
        // If navigating directly to decks from sidebar, keep or reset selected deck
        if (tab !== 'decks') {
          setSelectedDeckId(null);
        }
        setCurrentTab(tab);
      }}
      onStartReview={handleStartReview}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          onNavigateToDecks={() => {
            setSelectedDeckId(null);
            setCurrentTab('decks');
          }}
          onNavigateToDeckDetail={handleNavigateToDeckDetail}
          onStartReview={handleStartReview}
          onStartPractice={handleStartPractice}
        />
      )}

      {currentTab === 'decks' && (
        <DecksPage
          selectedDeckId={selectedDeckId}
          onSelectDeck={setSelectedDeckId}
          onStartReview={handleStartReview}
          onStartPractice={handleStartPractice}
        />
      )}

      {currentTab === 'review' && (
        <ReviewPage
          onGoDashboard={() => setCurrentTab('dashboard')}
          onGoStats={() => setCurrentTab('statistics')}
        />
      )}

      {currentTab === 'statistics' && <StatisticsPage />}

      {currentTab === 'settings' && <SettingsPage />}
    </AppLayout>
  );
};

export default App;

