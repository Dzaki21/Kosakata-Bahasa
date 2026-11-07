import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { GermanArticle, Vocabulary } from '../../types';
import { GermanSpecialChars } from '../common/GermanSpecialChars';
import { ArticleBadge } from '../common/ArticleBadge';
import { Volume2 } from 'lucide-react';
import { speakGerman } from '../../utils/speech';

interface VocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    deckId: number;
    word: string;
    article: GermanArticle;
    plural?: string;
    indonesian: string;
    exampleGerman?: string;
    exampleIndonesian?: string;
    notes?: string;
  }) => Promise<void>;
  deckId: number;
  initialData?: Vocabulary | null;
}

export const VocabModal: React.FC<VocabModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  deckId,
  initialData,
}) => {
  const [word, setWord] = useState('');
  const [article, setArticle] = useState<GermanArticle>('');
  const [plural, setPlural] = useState('');
  const [indonesian, setIndonesian] = useState('');
  const [exampleGerman, setExampleGerman] = useState('');
  const [exampleIndonesian, setExampleIndonesian] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active focused input ref for German character inserter
  const lastActiveInputRef = useRef<'word' | 'plural' | 'exampleGerman' | 'indonesian'>('word');

  useEffect(() => {
    if (initialData) {
      setWord(initialData.word);
      setArticle(initialData.article || '');
      setPlural(initialData.plural || '');
      setIndonesian(initialData.indonesian);
      setExampleGerman(initialData.exampleGerman || '');
      setExampleIndonesian(initialData.exampleIndonesian || '');
      setNotes(initialData.notes || '');
    } else {
      setWord('');
      setArticle('');
      setPlural('');
      setIndonesian('');
      setExampleGerman('');
      setExampleIndonesian('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  const handleInsertChar = (char: string) => {
    if (lastActiveInputRef.current === 'word') {
      setWord(prev => prev + char);
    } else if (lastActiveInputRef.current === 'plural') {
      setPlural(prev => prev + char);
    } else if (lastActiveInputRef.current === 'exampleGerman') {
      setExampleGerman(prev => prev + char);
    } else {
      setWord(prev => prev + char);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !indonesian.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        deckId,
        word: word.trim(),
        article,
        plural: plural.trim() || undefined,
        indonesian: indonesian.trim(),
        exampleGerman: exampleGerman.trim() || undefined,
        exampleIndonesian: exampleIndonesian.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save vocabulary:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const articleOptions: { value: GermanArticle; label: string; color: string }[] = [
    { value: '', label: 'Tanpa Artikel (Verb / Adj)', color: 'border-slate-300 dark:border-slate-700' },
    { value: 'der', label: 'der (Maskulin)', color: 'text-blue-600 border-blue-400 bg-blue-50/50 dark:bg-blue-950/40' },
    { value: 'die', label: 'die (Feminin)', color: 'text-pink-600 border-pink-400 bg-pink-50/50 dark:bg-pink-950/40' },
    { value: 'das', label: 'das (Netral)', color: 'text-emerald-600 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Kosakata' : 'Tambah Kosakata Baru'}
      description="Lengkapi detail kata dalam bahasa Jerman beserta artinya dalam bahasa Indonesia."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* German Character Inserter Helper */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <GermanSpecialChars onInsert={handleInsertChar} />
        </div>

        {/* Article Selector Pills */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Artikel Jerman (Artikelwahl)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {articleOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setArticle(opt.value)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  article === opt.value
                    ? 'ring-2 ring-brand-500 font-bold ' + opt.color
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Word and Plural Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Kata Jerman (Wort) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={word}
                onFocus={() => { lastActiveInputRef.current = 'word'; }}
                onChange={e => setWord(e.target.value)}
                placeholder="misal: Haus, Tisch, lernen..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {word && (
                <button
                  type="button"
                  onClick={() => speakGerman(article ? `${article} ${word}` : word)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-brand-600 transition-colors"
                  title="Dengarkan pengucapan Jerman"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Bentuk Jamak (Plural)
            </label>
            <input
              type="text"
              value={plural}
              onFocus={() => { lastActiveInputRef.current = 'plural'; }}
              onChange={e => setPlural(e.target.value)}
              placeholder="misal: Häuser, Tische..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Indonesian Meaning */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Arti Bahasa Indonesia *
          </label>
          <input
            type="text"
            required
            value={indonesian}
            onFocus={() => { lastActiveInputRef.current = 'indonesian'; }}
            onChange={e => setIndonesian(e.target.value)}
            placeholder="misal: rumah, meja, belajar (pisahkan koma untuk variasi)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Example Sentence (German & Indonesian) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Contoh Kalimat (Beispielsatz)
          </label>
          <input
            type="text"
            value={exampleGerman}
            onFocus={() => { lastActiveInputRef.current = 'exampleGerman'; }}
            onChange={e => setExampleGerman(e.target.value)}
            placeholder="Jerman: Das Haus ist groß und schön."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={exampleIndonesian}
            onChange={e => setExampleIndonesian(e.target.value)}
            placeholder="Terjemahan: Rumah itu besar dan indah."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="misal: bentuk Akkusativ, irregular verb, tip gramatikal..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Live Preview Card */}
        {word && indonesian && (
          <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
              Pratinjau Kartu:
            </span>
            <div className="flex items-baseline space-x-2">
              <ArticleBadge article={article} />
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {word}
              </span>
              {plural && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Pl: {plural})
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
              → {indonesian}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !word.trim() || !indonesian.trim()}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Tambah Kosakata'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

