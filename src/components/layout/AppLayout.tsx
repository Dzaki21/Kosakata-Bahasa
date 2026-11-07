import React, { useState } from 'react';
import { Sidebar, NavItem } from './Sidebar';
import { Header } from './Header';
import { useStats } from '../../hooks/useStats';
import { X } from 'lucide-react';

interface AppLayoutProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  onStartReview: (deckId?: number) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  onStartReview,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stats } = useStats();

  const dueCount = stats?.wordsDue || 0;
  const streak = stats?.streak || 0;

  const handleSelectTab = (tab: NavItem) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          dueCount={dueCount}
          streak={streak}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              currentTab={currentTab}
              onSelectTab={handleSelectTab}
              dueCount={dueCount}
              streak={streak}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onStartReview={() => onStartReview()}
          dueCount={dueCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

