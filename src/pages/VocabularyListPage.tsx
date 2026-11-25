import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Volume2,
  Trash2,
  Edit2,
  CheckCircle2,
  Layers,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DraftVocab, GermanArticle } from '../types';
import { useDraftVocabs } from '../hooks/useDraftVocabs';
import { useDecks } from '../hooks/useDecks';
import { ArticleBadge } from '../components/common/ArticleBadge';
import { GermanSpecialChars } from '../components/common/GermanSpecialChars';
import { Modal } from '../components/common/Modal';
import { speakGerman } from '../utils/speech';

type CategoryTab = 'all' | 'nomen' | 'non-nomen';

export const VocabularyListPage: React.FC<{
  onNavigateToDecks: () => void;
}> = ({ onNavigateToDecks }) => {
  const {
    draftVocabs,
    isLoading,
    addDraftVocab,
    updateDraftVocab,
    deleteDraftVocab,
    moveToDeck,
  } = useDraftVocabs();

  const { decks } = useDecks();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryTab, setCategoryTab] = useState<CategoryTab>('all');
  const [articleFilter, setArticleFilter] = useState<GermanArticle | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<DraftVocab | null>(null);

  // Form input state
  const [formCategory, setFormCategory] = useState<'nomen' | 'non-nomen'>('nomen');
  const [word, setWord] = useState('');
  const [article, setArticle] = useState<GermanArticle>('der');
  const [plural, setPlural] = useState('');
  const [indonesian, setIndonesian] = useState('');
  const [exampleGerman, setExampleGerman] = useState('');
  const [exampleIndonesian, setExampleIndonesian] = useState('');
  const [notes, setNotes] = useState('');

  // Active focused input ref for German character inserter
  const lastActiveInputRef = useRef<'word' | 'plural' | 'notes' | 'indonesian' | 'exampleGerman' | 'exampleIndonesian'>('word');

  const handleInsertChar = (char: string) => {
    switch (lastActiveInputRef.current) {
      case 'word':
        setWord(prev => prev + char);
        break;
      case 'plural':
        setPlural(prev => prev + char);
        break;
      case 'notes':
        setNotes(prev => prev + char);
        break;
      case 'indonesian':
        setIndonesian(prev => prev + char);
        break;
      case 'exampleGerman':
        setExampleGerman(prev => prev + char);
        break;
      case 'exampleIndonesian':
        setExampleIndonesian(prev => prev + char);
        break;
      default:
        setWord(prev => prev + char);
        break;
    }
  };

  // Move to deck modal state
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedDraftForMove, setSelectedDraftForMove] = useState<DraftVocab | null>(null);
  const [targetDeckId, setTargetDeckId] = useState<number | ''>('');

  // Helper check Nomen
  const checkIsNomen = (art?: GermanArticle) => {
    return Boolean(art && (art === 'der' || art === 'die' || art === 'das'));
  };

  // Stats
  const stats = useMemo(() => {
    const total = draftVocabs.length;
    const nomenCount = draftVocabs.filter(v => checkIsNomen(v.article)).length;
    const nonNomenCount = total - nomenCount;
    return { total, nomenCount, nonNomenCount };
  }, [draftVocabs]);

  // Filtering
  const filteredList = useMemo(() => {
    return draftVocabs.filter(v => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchWord = v.word.toLowerCase().includes(q);
        const matchIndo = v.indonesian.toLowerCase().includes(q);
        const matchPlural = v.plural?.toLowerCase().includes(q);
        const matchNotes = v.notes?.toLowerCase().includes(q);
        if (!matchWord && !matchIndo && !matchPlural && !matchNotes) return false;
      }

      // Nomen vs Non-Nomen
      const isNomen = checkIsNomen(v.article);
      if (categoryTab === 'nomen' && !isNomen) return false;
      if (categoryTab === 'non-nomen' && isNomen) return false;

      // Article Filter
      if (articleFilter !== 'all') {
        if (v.article !== articleFilter) return false;
      }

      return true;
    });
  }, [draftVocabs, searchTerm, categoryTab, articleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  // Open Add Modal
  const handleOpenAddModal = (presetCategory: 'nomen' | 'non-nomen' = 'nomen') => {
    setEditingDraft(null);
    setFormCategory(presetCategory);
    setWord('');
    setArticle(presetCategory === 'nomen' ? 'der' : '');
    setPlural('');
    setIndonesian('');
    setExampleGerman('');
    setExampleIndonesian('');
    setNotes('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (draft: DraftVocab) => {
    setEditingDraft(draft);
    const isNomen = checkIsNomen(draft.article);
    setFormCategory(isNomen ? 'nomen' : 'non-nomen');
    setWord(draft.word);
    setArticle(draft.article || (isNomen ? 'der' : ''));
    setPlural(draft.plural || '');
    setIndonesian(draft.indonesian);
    setExampleGerman(draft.exampleGerman || '');
    setExampleIndonesian(draft.exampleIndonesian || '');
    setNotes(draft.notes || '');
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !indonesian.trim()) return;

    const finalArticle: GermanArticle = formCategory === 'nomen' ? article : '';
    const finalPlural = formCategory === 'nomen' ? plural.trim() : undefined;

    if (editingDraft && editingDraft.id) {
      await updateDraftVocab(editingDraft.id, {
        word: word.trim(),
        article: finalArticle,
        plural: finalPlural,
        indonesian: indonesian.trim(),
        exampleGerman: exampleGerman.trim() || undefined,
        exampleIndonesian: exampleIndonesian.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addDraftVocab({
        word: word.trim(),
        article: finalArticle,
        plural: finalPlural,
        indonesian: indonesian.trim(),
        exampleGerman: exampleGerman.trim() || undefined,
        exampleIndonesian: exampleIndonesian.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Handle Move to Deck
  const handleOpenMoveModal = (draft: DraftVocab) => {
    setSelectedDraftForMove(draft);
    if (decks.length > 0 && decks[0].id) {
      setTargetDeckId(decks[0].id);
    } else {
      setTargetDeckId('');
    }
    setIsMoveModalOpen(true);
  };

  const handleConfirmMove = async () => {
    if (!selectedDraftForMove || !selectedDraftForMove.id || !targetDeckId) return;
    await moveToDeck(selectedDraftForMove.id, Number(targetDeckId));
    setIsMoveModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <span>Daftar Kosakata yang Mau Dihafalkan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Halaman khusus untuk <strong>mencatat dan menghafalkan kosakata baru</strong> sebelum dimasukkan ke dalam Deck. Kosakata yang sudah Anda hafal di sini dapat langsung dipindahkan ke Deck target untuk mulai diuji dalam sesi review SRS!
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenAddModal('nomen')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Nomen (Benda)</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal('non-nomen')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Non-Nomen (Verba/Adj)</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-xs text-slate-400 block font-medium">Total Mau Dihafal</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.total}</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
            <span className="text-xs text-blue-600 dark:text-blue-400 block font-medium">Nomen (Ada Artikel & Plural)</span>
            <span className="text-xl font-black text-blue-700 dark:text-blue-300">{stats.nomenCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">Bukan Nomen (Tanpa Artikel)</span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{stats.nonNomenCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kata Jerman, arti Indonesia, atau plural..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category Switcher Tabs: All / Nomen / Non-Nomen */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCategoryTab('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryTab('nomen');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryTab === 'nomen'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Nomen ({stats.nomenCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryTab('non-nomen');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryTab === 'non-nomen'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Bukan Nomen ({stats.nonNomenCount})
            </button>
          </div>
        </div>

        {/* Article filter if Nomen */}
        {categoryTab !== 'non-nomen' && (
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium">Filter Artikel Nomen:</span>
            {(['all', 'der', 'die', 'das'] as const).map(art => (
              <button
                key={art}
                type="button"
                onClick={() => {
                  setArticleFilter(art);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                  articleFilter === art
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {art === 'all' ? 'Semua Artikel' : art.toUpperCase()}
              </button>
            ))}
            <div className="ml-auto text-slate-400 font-medium">
              Ditemukan: <strong className="text-slate-900 dark:text-white font-bold">{filteredList.length}</strong> kata
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Memuat catatan kosakata...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              {draftVocabs.length === 0
                ? 'Belum ada kosakata yang dicatat untuk dihafalkan'
                : 'Tidak ada kosakata yang cocok dengan pencarian / filter'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {draftVocabs.length === 0
                ? 'Gunakan halaman ini untuk mencatat kosakata baru yang ingin Anda hafalkan terlebih dahulu sebelum dimasukkan ke dalam Deck.'
                : 'Coba ubah kata kunci pencarian atau bersihkan filter di atas.'}
            </p>
            {draftVocabs.length === 0 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('nomen')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  + Catat Nomen Pertama
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('non-nomen')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  + Catat Non-Nomen Pertama
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Kosakata Jerman</th>
                  <th className="py-4 px-5">Kategori / Artikel</th>
                  <th className="py-4 px-5">Bentuk Jamak (Plural)</th>
                  <th className="py-4 px-5">Arti Bahasa Indonesia</th>
                  <th className="py-4 px-5 hidden md:table-cell">Contoh Kalimat / Catatan</th>
                  <th className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedList.map(draft => {
                  const isNomen = checkIsNomen(draft.article);

                  return (
                    <tr
                      key={draft.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* German Word */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2">
                          {isNomen && <ArticleBadge article={draft.article} size="sm" />}
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            {draft.word}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              speakGerman(draft.article ? `${draft.article} ${draft.word}` : draft.word)
                            }
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-opacity"
                            title="Dengarkan pelafalan"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Category & Article */}
                      <td className="py-4 px-5">
                        {isNomen ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                              Nomen
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                              ({draft.article})
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                            Bukan Nomen (Tanpa Artikel)
                          </span>
                        )}
                      </td>

                      {/* Plural Form */}
                      <td className="py-4 px-5">
                        {draft.plural && draft.plural.trim() !== '' ? (
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                            {draft.plural}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Indonesian Meaning */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {draft.indonesian}
                        </span>
                      </td>

                      {/* Example & Notes */}
                      <td className="py-4 px-5 hidden md:table-cell max-w-xs">
                        {draft.exampleGerman ? (
                          <div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                              {draft.exampleGerman}
                            </p>
                            {draft.exampleIndonesian && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                                {draft.exampleIndonesian}
                              </p>
                            )}
                          </div>
                        ) : draft.notes ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
                            {draft.notes}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Tombol Sudah Hafal -> Pindahkan ke Deck */}
                          <button
                            type="button"
                            onClick={() => handleOpenMoveModal(draft)}
                            className="px-2.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white dark:bg-brand-950/60 dark:hover:bg-brand-600 dark:text-brand-300 text-xs font-bold transition-all border border-brand-200 dark:border-brand-800 flex items-center gap-1 shadow-sm"
                            title="Sudah hafal? Pindahkan kata ini ke Deck untuk mulai review SRS"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sudah Hafal ➔ Masukkan Deck</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(draft)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit catatan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => draft.id && deleteDraftVocab(draft.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Hapus dari catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredList.length)} dari {filteredList.length} kata
            </span>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Catatan Kosakata */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDraft ? 'Edit Kosakata yang Mau Dihafalkan' : 'Catat Kosakata Baru yang Mau Dihafalkan'}
        description="Catat kosakata di sini untuk dihafalkan terlebih dahulu. Setelah hafal, Anda bisa langsung memindahkannya ke Deck pilihan Anda."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveDraft} className="space-y-4">
          {/* German Characters Toolbar */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <GermanSpecialChars onInsert={handleInsertChar} />
          </div>

          {/* Category Switcher: Nomen (Benda) vs Non-Nomen */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Tipe Kosakata:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormCategory('nomen');
                  if (!article) setArticle('der');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formCategory === 'nomen'
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  Nomen (Kata Benda)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Wajib ada artikel (der, die, das) & bentuk jamak (plural).
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormCategory('non-nomen');
                  setArticle('');
                  setPlural('');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formCategory === 'non-nomen'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Bukan Nomen
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Kata kerja, kata sifat, keterangan, atau frasa salam (tanpa artikel).
                </div>
              </button>
            </div>
          </div>

          {/* Article selector if Nomen */}
          {formCategory === 'nomen' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Pilih Artikel Jerman (der / die / das) *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'der' as GermanArticle, label: 'der (Maskulin)', color: 'text-blue-600 bg-blue-50/70 border-blue-300 dark:bg-blue-950/50 dark:border-blue-800' },
                  { id: 'die' as GermanArticle, label: 'die (Feminin)', color: 'text-pink-600 bg-pink-50/70 border-pink-300 dark:bg-pink-950/50 dark:border-pink-800' },
                  { id: 'das' as GermanArticle, label: 'das (Netral)', color: 'text-emerald-600 bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setArticle(opt.id)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      article === opt.id
                        ? `${opt.color} ring-2 ring-brand-500`
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Word and Plural */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Kata Jerman (Wort) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={word}
                  onFocus={() => { lastActiveInputRef.current = 'word'; }}
                  onChange={e => setWord(e.target.value)}
                  placeholder={formCategory === 'nomen' ? 'misal: Haus, Tisch, Apfel...' : 'misal: lernen, schön, danke...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                />
                {word && (
                  <button
                    type="button"
                    onClick={() => speakGerman(formCategory === 'nomen' && article ? `${article} ${word}` : word)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-brand-600 transition-colors"
                    title="Dengarkan pengucapan"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {formCategory === 'nomen' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Bentuk Jamak (Plural)
                </label>
                <input
                  type="text"
                  value={plural}
                  onFocus={() => { lastActiveInputRef.current = 'plural'; }}
                  onChange={e => setPlural(e.target.value)}
                  placeholder="misal: Häuser, Tische, Äpfel..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Keterangan Tipe (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onFocus={() => { lastActiveInputRef.current = 'notes'; }}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="misal: Verb, Adjektiv, Redewendung..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}
          </div>

          {/* Indonesian Meaning */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Arti Bahasa Indonesia *
            </label>
            <input
              type="text"
              required
              value={indonesian}
              onFocus={() => { lastActiveInputRef.current = 'indonesian'; }}
              onChange={e => setIndonesian(e.target.value)}
              placeholder="misal: rumah, meja, belajar..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          {/* Example Sentence */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Contoh Kalimat (Beispielsatz - Opsional)
            </label>
            <input
              type="text"
              value={exampleGerman}
              onFocus={() => { lastActiveInputRef.current = 'exampleGerman'; }}
              onChange={e => setExampleGerman(e.target.value)}
              placeholder="Jerman: Das Haus ist sehr groß."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              value={exampleIndonesian}
              onFocus={() => { lastActiveInputRef.current = 'exampleIndonesian'; }}
              onChange={e => setExampleIndonesian(e.target.value)}
              placeholder="Terjemahan: Rumah itu sangat besar."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!word.trim() || !indonesian.trim()}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 disabled:opacity-50 transition-all"
            >
              {editingDraft ? 'Simpan Perubahan' : 'Catat Kosakata'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Pindahkan ke Deck */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title="Pindahkan ke Deck (Mulai Uji SRS)"
        description="Pilih deck tujuan untuk memasukkan kata ini ke dalam sesi review berkala."
        maxWidth="md"
      >
        <div className="space-y-4">
          {selectedDraftForMove && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Kata yang akan dipindahkan:
              </span>
              <div className="flex items-center space-x-2">
                {checkIsNomen(selectedDraftForMove.article) && (
                  <ArticleBadge article={selectedDraftForMove.article} size="sm" />
                )}
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedDraftForMove.word}
                </span>
                {selectedDraftForMove.plural && (
                  <span className="text-xs text-slate-400">
                    (Pl: {selectedDraftForMove.plural})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                → {selectedDraftForMove.indonesian}
              </p>
            </div>
          )}

          {decks.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500 dark:text-slate-400">
              <p>Anda belum memiliki Deck.</p>
              <button
                type="button"
                onClick={() => {
                  setIsMoveModalOpen(false);
                  onNavigateToDecks();
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold"
              >
                Buat Deck Baru Terlebih Dahulu
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Pilih Deck Tujuan:
              </label>
              <select
                value={targetDeckId}
                onChange={e => setTargetDeckId(Number(e.target.value))}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {decks.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.totalVocab} kata saat ini)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMoveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmMove}
              disabled={!targetDeckId}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <span>Konfirmasi Masuk Deck</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
