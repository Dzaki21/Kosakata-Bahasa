import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRightLeft,
  Target,
  FileJson,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { exportDatabaseToJson, validateBackupFile, importDatabaseFromJson } from '../services/backup';
import { resetDatabase } from '../db';
import { ReviewDirection } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, setTheme } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Export handler
  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportDatabaseToJson();
      setImportStatus({
        type: 'success',
        message: 'Cadangan data berhasil diunduh dalam format JSON.',
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: 'Gagal mengekspor data: ' + (err.message || 'Error tidak dikenal'),
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportStatus({ type: null, message: '' });

      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        throw new Error('File bukan merupakan file JSON yang valid.');
      }

      const validation = validateBackupFile(parsed);
      if (!validation.valid) {
        throw new Error(validation.error || 'Struktur data cadangan tidak sesuai standar Kosakta.');
      }

      const result = await importDatabaseFromJson(parsed, 'merge');
      setImportStatus({
        type: 'success',
        message: `Berhasil mengimpor ${result.decksImported} deck dan ${result.vocabImported} kosakata!`,
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: 'Gagal mengimpor file cadangan: ' + err.message,
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Reset database handler
  const handleResetData = async () => {
    const confirmed = window.confirm(
      'PERINGATAN: Apakah Anda yakin ingin mengembalikan aplikasi ke kondisi awal? Semua deck, riwayat belajar, dan kosakata kustom akan dihapus dan di-reset ke starter data awal.'
    );

    if (confirmed) {
      try {
        setIsResetting(true);
        await resetDatabase();
        setImportStatus({
          type: 'success',
          message: 'Data aplikasi berhasil di-reset ke data bawaan.',
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: 'Gagal me-reset database: ' + err.message,
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Status Notice */}
      {importStatus.type && (
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs font-semibold ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Section 1: Appearance & Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Tampilan & Tema (Erscheinungsbild)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sesuaikan palet tampilan antarmuka aplikasi dengan preferensi Anda.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center space-y-2 transition-all ${
              settings.theme === 'light'
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">Mode Terang (Light)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center space-y-2 transition-all ${
              settings.theme === 'dark'
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">Mode Gelap (Dark)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center space-y-2 transition-all ${
              settings.theme === 'system'
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-bold">Otomatis Sistem</span>
          </button>
        </div>
      </div>

      {/* Section 2: Study Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Preferensi Pembelajaran (Lerneinstellungen)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atur arah uji recall default, kuantitas latihan, dan target harian.
          </p>
        </div>

        {/* Default Direction */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Arah Review Default
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'de-id', label: 'Jerman → Indonesia' },
              { id: 'id-de', label: 'Indonesia → Jerman' },
              { id: 'mixed', label: 'Campuran (Acak)' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSettings({ defaultDirection: item.id as ReviewDirection })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  settings.defaultDirection === item.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Practice Count & Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Jumlah Kata Latihan Default
            </label>
            <select
              value={settings.defaultPracticeCount}
              onChange={e => updateSettings({ defaultPracticeCount: Number(e.target.value) })}
              className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value={10}>10 Kata per Sesi</option>
              <option value={20}>20 Kata per Sesi</option>
              <option value={50}>50 Kata per Sesi</option>
              <option value={100}>100 Kata per Sesi</option>
              <option value={0}>Semua Kata Tersedia</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Urutan Kosakata Latihan Default
            </label>
            <select
              value={settings.defaultPracticeOrder}
              onChange={e =>
                updateSettings({
                  defaultPracticeOrder: e.target.value as 'sequential' | 'random',
                })
              }
              className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="random">Acak (Random, Tanpa Duplikat)</option>
              <option value="sequential">Berurutan (Sesuai Urutan Deck)</option>
            </select>
          </div>
        </div>

        {/* Daily Goal */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Target Review Harian (Kartu per Hari)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={settings.dailyGoal}
              onChange={e => updateSettings({ dailyGoal: Number(e.target.value) })}
              className="flex-1 accent-brand-600"
            />
            <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[70px]">
              {settings.dailyGoal} kata
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Cadangan & Pemulihan Data (Backup & Restore)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seluruh data Kosakta tersimpan di IndexedDB browser Anda. Unduh cadangan JSON secara berkala agar data Anda tetap aman.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-brand-600" />
            <span>{isExporting ? 'Mengekspor...' : 'Ekspor Cadangan (Download JSON)'}</span>
          </button>

          {/* Import Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>{isImporting ? 'Mengimpor...' : 'Impor File Cadangan JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Danger Zone / Reset */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200/80 dark:border-red-950 p-6 shadow-sm space-y-3">
        <div>
          <h3 className="font-bold text-base text-red-600 dark:text-red-400">
            Zona Bahaya (Danger Zone)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reset database IndexedDB dan muat ulang starter deck standar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetData}
          disabled={isResetting}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-red-500" />
          <span>{isResetting ? 'Me-reset Data...' : 'Reset Semua Data Aplikasi'}</span>
        </button>
      </div>
    </div>
  );
};

