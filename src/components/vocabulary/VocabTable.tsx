import React, { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { GermanArticle, ReviewStatus, Vocabulary } from '../../types';
import { ArticleBadge } from '../common/ArticleBadge';
import { StatusBadge } from '../common/Badge';
import { speakGerman } from '../../utils/speech';
import { formatDueTime } from '../../services/srs';

interface VocabTableProps {
  vocabularies: Vocabulary[];
  onEdit: (vocab: Vocabulary) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
}

const ITEMS_PER_PAGE = 12;

export const VocabTable: React.FC<VocabTableProps> = ({
  vocabularies,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articleFilter, setArticleFilter] = useState<GermanArticle | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered list
  const filteredList = useMemo(() => {
    return vocabularies.filter(v => {
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesWord = v.word.toLowerCase().includes(q);
        const matchesIndo = v.indonesian.toLowerCase().includes(q);
        const matchesPlural = v.plural?.toLowerCase().includes(q);
        const matchesExample = v.exampleGerman?.toLowerCase().includes(q);
        if (!matchesWord && !matchesIndo && !matchesPlural && !matchesExample) {
          return false;
        }
      }

      // Article filter
      if (articleFilter !== 'all') {
        if (v.article !== articleFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (v.status !== statusFilter) return false;
      }

      return true;
    });
  }, [vocabularies, searchTerm, articleFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari kata Jerman, arti Indonesia, atau contoh kalimat..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Article filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400 font-medium">Artikel:</span>
            <select
              value={articleFilter}
              onChange={e => {
                setArticleFilter(e.target.value as GermanArticle | 'all');
                setCurrentPage(1);
              }}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Semua Artikel</option>
              <option value="der">der (Maskulin)</option>
              <option value="die">die (Feminin)</option>
              <option value="das">das (Netral)</option>
              <option value="">Tanpa Artikel</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as ReviewStatus | 'all');
                setCurrentPage(1);
              }}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="new">Baru</option>
              <option value="learning">Belajar</option>
              <option value="review">Review</option>
              <option value="mastered">Dikuasai</option>
            </select>
          </div>

          {/* Add button */}
          <button
            onClick={onAddNew}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all shadow-brand-500/20 active:scale-95"
          >
            + Tambah Kosakata
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Tidak ada kosakata ditemukan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {vocabularies.length === 0
                ? 'Deck ini belum memiliki kosakata. Klik tombol "Tambah Kosakata" untuk mulai menambahkan kata.'
                : 'Coba ubah kata kunci pencarian atau bersihkan filter di atas.'}
            </p>
            {vocabularies.length === 0 && (
              <button
                onClick={onAddNew}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
              >
                + Tambah Kosakata Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Kosakata Jerman</th>
                  <th className="py-3.5 px-4">Arti Indonesia</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Contoh Kalimat</th>
                  <th className="py-3.5 px-4">Status & SRS</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedList.map(vocab => (
                  <tr
                    key={vocab.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* German Word */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <ArticleBadge article={vocab.article} size="sm" />
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {vocab.word}
                        </span>
                        <button
                          onClick={() =>
                            speakGerman(vocab.article ? `${vocab.article} ${vocab.word}` : vocab.word)
                          }
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-opacity"
                          title="Dengarkan pengucapan"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {vocab.plural && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Plural: <span className="font-medium text-slate-700 dark:text-slate-300">{vocab.plural}</span>
                        </div>
                      )}
                    </td>

                    {/* Indonesian */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {vocab.indonesian}
                      </span>
                      {vocab.notes && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 line-clamp-1">
                          {vocab.notes}
                        </p>
                      )}
                    </td>

                    {/* Example */}
                    <td className="py-3.5 px-4 hidden md:table-cell max-w-xs">
                      {vocab.exampleGerman ? (
                        <div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {vocab.exampleGerman}
                          </p>
                          {vocab.exampleIndonesian && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {vocab.exampleIndonesian}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </td>

                    {/* Status & SRS */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={vocab.status} />
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDueTime(vocab.dueDate)}</span>
                          {vocab.interval > 0 && <span>• {vocab.interval}h</span>}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEdit(vocab)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit kosakata"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => vocab.id && onDelete(vocab.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Hapus kosakata"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length)} dari {filteredList.length} kata
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

