import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Layers,
  ArrowLeft,
  Sparkles,
  Play,
  Filter,
} from 'lucide-react';
import { useDecks, DeckWithStats } from '../hooks/useDecks';
import { useVocabularies } from '../hooks/useVocabularies';
import { DeckCard } from '../components/decks/DeckCard';
import { DeckModal } from '../components/decks/DeckModal';
import { VocabTable } from '../components/vocabulary/VocabTable';
import { VocabModal } from '../components/vocabulary/VocabModal';
import { PracticeSetupModal } from '../components/review/PracticeSetupModal';
import { Deck, GermanArticle, ReviewDirection, Vocabulary } from '../types';

interface DecksPageProps {
  selectedDeckId: number | null;
  onSelectDeck: (deckId: number | null) => void;
  onStartReview: (deckId?: number) => void;
  onStartPractice: (options: {
    deckId?: number;
    count: number;
    order: 'sequential' | 'random';
    direction: ReviewDirection;
  }) => void;
}

export const DecksPage: React.FC<DecksPageProps> = ({
  selectedDeckId,
  onSelectDeck,
  onStartReview,
  onStartPractice,
}) => {
  const { decks, createDeck, updateDeck, deleteDeck } = useDecks();
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);

  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [practiceDeckId, setPracticeDeckId] = useState<number | undefined>(undefined);

  // Active deck if inside detail view
  const activeDeck = useMemo(() => {
    if (!selectedDeckId) return null;
    return decks.find(d => d.id === selectedDeckId) || null;
  }, [decks, selectedDeckId]);

  // Vocabularies of the selected deck
  const {
    vocabularies,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
  } = useVocabularies(selectedDeckId ? { deckId: selectedDeckId } : {});

  // Search filter for deck list
  const filteredDecks = useMemo(() => {
    if (!searchTerm.trim()) return decks;
    const q = searchTerm.toLowerCase();
    return decks.filter(
      d => d.name.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q))
    );
  }, [decks, searchTerm]);

  // Handlers for Deck CRUD
  const handleOpenCreateDeck = () => {
    setEditingDeck(null);
    setIsDeckModalOpen(true);
  };

  const handleOpenEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setIsDeckModalOpen(true);
  };

  const handleDeckFormSubmit = async (data: { name: string; description: string; color?: string }) => {
    if (editingDeck && editingDeck.id) {
      await updateDeck(editingDeck.id, data);
    } else {
      await createDeck(data);
    }
  };

  const handleDeleteDeck = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus deck ini beserta seluruh kosakata di dalamnya? Tindakan ini tidak dapat dibatalkan.')) {
      await deleteDeck(id);
      if (selectedDeckId === id) {
        onSelectDeck(null);
      }
    }
  };

  // Handlers for Vocabulary CRUD
  const handleOpenAddVocab = () => {
    setEditingVocab(null);
    setIsVocabModalOpen(true);
  };

  const handleOpenEditVocab = (vocab: Vocabulary) => {
    setEditingVocab(vocab);
    setIsVocabModalOpen(true);
  };

  const handleVocabFormSubmit = async (data: {
    deckId: number;
    word: string;
    article: GermanArticle;
    plural?: string;
    indonesian: string;
    exampleGerman?: string;
    exampleIndonesian?: string;
    notes?: string;
  }) => {
    if (editingVocab && editingVocab.id) {
      await updateVocabulary(editingVocab.id, data);
    } else {
      await addVocabulary(data);
    }
  };

  const handleDeleteVocab = async (id: number) => {
    if (window.confirm('Hapus kosakata ini?')) {
      await deleteVocabulary(id);
    }
  };

  // -------------------------------------------------------------
  // DETAIL VIEW: Deck selected
  // -------------------------------------------------------------
  if (selectedDeckId && activeDeck) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Detail Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="space-y-1">
            <button
              onClick={() => onSelectDeck(null)}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 mb-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Semua Deck</span>
            </button>

            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: activeDeck.color || '#3b82f6' }}
              />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeDeck.name}
              </h2>
            </div>

            {activeDeck.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                {activeDeck.description}
              </p>
            )}

            <div className="flex items-center space-x-4 pt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span>{activeDeck.totalVocab} Kata</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {activeDeck.dueCount} Perlu Review (SRS)
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {activeDeck.masteredCount} Dikuasai ({activeDeck.progressPercentage}%)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setPracticeDeckId(activeDeck.id);
                setIsPracticeModalOpen(true);
              }}
              disabled={activeDeck.totalVocab === 0}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span>Latihan Deck Ini</span>
            </button>

            <button
              onClick={() => onStartReview(activeDeck.id)}
              disabled={activeDeck.dueCount === 0}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 disabled:opacity-40 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review SRS ({activeDeck.dueCount})</span>
            </button>
          </div>
        </div>

        {/* Vocabulary Table & Management */}
        <VocabTable
          vocabularies={vocabularies}
          onEdit={handleOpenEditVocab}
          onDelete={handleDeleteVocab}
          onAddNew={handleOpenAddVocab}
        />

        {/* Vocab Create/Edit Modal */}
        <VocabModal
          isOpen={isVocabModalOpen}
          onClose={() => setIsVocabModalOpen(false)}
          onSubmit={handleVocabFormSubmit}
          deckId={selectedDeckId}
          initialData={editingVocab}
        />

        {/* Practice Setup Modal */}
        <PracticeSetupModal
          isOpen={isPracticeModalOpen}
          onClose={() => setIsPracticeModalOpen(false)}
          decks={decks}
          preselectedDeckId={practiceDeckId}
          onStart={onStartPractice}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // LIST VIEW: All Decks
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari deck berdasarkan nama atau topik..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Create Deck Button */}
        <button
          onClick={handleOpenCreateDeck}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Deck Baru</span>
        </button>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak ada deck ditemukan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {decks.length === 0
              ? 'Mulai perjalanan belajar Anda dengan membuat deck pertama!'
              : 'Tidak ada deck yang sesuai dengan pencarian Anda.'}
          </p>
          <button
            onClick={handleOpenCreateDeck}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            + Buat Deck Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecks.map(deck => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onOpen={() => deck.id && onSelectDeck(deck.id)}
              onPractice={() => {
                setPracticeDeckId(deck.id);
                setIsPracticeModalOpen(true);
              }}
              onReview={() => onStartReview(deck.id)}
              onEdit={() => handleOpenEditDeck(deck)}
              onDelete={() => deck.id && handleDeleteDeck(deck.id)}
            />
          ))}
        </div>
      )}

      {/* Deck Create/Edit Modal */}
      <DeckModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        onSubmit={handleDeckFormSubmit}
        initialData={editingDeck}
      />

      {/* Practice Setup Modal */}
      <PracticeSetupModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        decks={decks}
        preselectedDeckId={practiceDeckId}
        onStart={onStartPractice}
      />
    </div>
  );
};
