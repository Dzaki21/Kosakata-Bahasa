import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { DeckWithStats } from '../../hooks/useDecks';
import { ReviewDirection } from '../../types';
import { Play, Sparkles, Shuffle, ArrowRightLeft } from 'lucide-react';

interface PracticeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: DeckWithStats[];
  preselectedDeckId?: number;
  onStart: (options: {
    deckId?: number;
    count: number;
    order: 'sequential' | 'random';
    direction: ReviewDirection;
  }) => void;
}

export const PracticeSetupModal: React.FC<PracticeSetupModalProps> = ({
  isOpen,
  onClose,
  decks,
  preselectedDeckId,
  onStart,
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<number | undefined>(preselectedDeckId);
  const [count, setCount] = useState<number>(20);
  const [order, setOrder] = useState<'sequential' | 'random'>('random');
  const [direction, setDirection] = useState<ReviewDirection>('de-id');

  const countOptions = [
    { label: '10 Kata', value: 10 },
    { label: '20 Kata', value: 20 },
    { label: '50 Kata', value: 50 },
    { label: '100 Kata', value: 100 },
    { label: 'Semua Kata', value: 0 },
  ];

  const handleStart = () => {
    onStart({
      deckId: selectedDeckId,
      count,
      order,
      direction,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atur Sesi Latihan Mandiri"
      description="Pilih deck, jumlah kata, urutan, dan arah latihan sesuai kebutuhan Anda."
    >
      <div className="space-y-4">
        {/* Deck Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Pilih Deck
          </label>
          <select
            value={selectedDeckId ?? 'all'}
            onChange={e => setSelectedDeckId(e.target.value === 'all' ? undefined : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Semua Deck Gabungan</option>
            {decks.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.totalVocab} kata)
              </option>
            ))}
          </select>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Arah Uji Recall
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDirection('de-id')}
              className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                direction === 'de-id'
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Jerman → Indo
            </button>
            <button
              type="button"
              onClick={() => setDirection('id-de')}
              className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                direction === 'id-de'
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Indo → Jerman
            </button>
            <button
              type="button"
              onClick={() => setDirection('mixed')}
              className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                direction === 'mixed'
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Campuran (Acak)
            </button>
          </div>
        </div>

        {/* Word Count */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Jumlah Kata Sesi Ini
          </label>
          <div className="grid grid-cols-5 gap-2">
            {countOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCount(opt.value)}
                className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  count === opt.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Order Mode: Sequential or Random */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Metode Urutan Kata
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOrder('random')}
              className={`p-3 rounded-xl border text-left transition-all ${
                order === 'random'
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 ring-2 ring-brand-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-white">
                <Shuffle className="w-3.5 h-3.5 text-brand-500" />
                <span>Mode Acak (Random)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Acak kata tanpa duplikat dalam satu sesi.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setOrder('sequential')}
              className={`p-3 rounded-xl border text-left transition-all ${
                order === 'sequential'
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 ring-2 ring-brand-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-white">
                <Play className="w-3.5 h-3.5 text-brand-500" />
                <span>Mode Berurutan</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Tampilkan kata sesuai urutan penambahan asli.
              </p>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Mulai Latihan</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

