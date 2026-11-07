# Kosakta - German Vocabulary Learning & SRS Application

**Kosakta** adalah aplikasi pembelajaran dan penghafalan kosakata bahasa Jerman modern yang terinspirasi dari Anki, dirancang khusus dengan teknik **Active Recall** dan **Spaced Repetition System (SRS)**.

Dibangun dengan arsitektur **Frontend-Only** menggunakan React, TypeScript, Tailwind CSS, dan **IndexedDB (Dexie.js)** sehingga aplikasi dapat berjalan 100% offline tanpa server, database eksternal, atau akun login. Seluruh data pembelajaran Anda tersimpan aman secara lokal di peramban.

---

## 🌟 Fitur Utama

### 1. Spaced Repetition System (SRS) & Active Recall
- **Algoritma SM-2 Teroptimasi**: Menghitung interval peninjauan berikutnya secara otomatis berdasarkan tingkat kesulitan dan performa ingatan.
- **4 Tingkat Penilaian Daya Ingat**:
  - `1 - Again` (Ulangi segera, kurangi interval dan ulangi hari berikutnya)
  - `2 - Hard` (Sulit, pengulangan dengan sedikit kenaikan interval)
  - `3 - Good` (Bagus, pengulangan optimal berbasis faktor kemudahan)
  - `4 - Easy` (Mudah, interval diperpanjang secara eksponensial)
- **Pelacakan Siklus Memori**: Status otomatis (`new`, `learning`, `review`, `mastered`).

### 2. Dua Arah Pengujian (Review Directions)
- **Mode A: Jerman → Indonesia**: Menampilkan kata Jerman lengkap dengan artikel (`der`, `die`, `das`) dan bentuk jamak (`Plural`); pengguna mengetik arti bahasa Indonesia.
- **Mode B: Indonesia → Jerman**: Menampilkan arti bahasa Indonesia; pengguna mengetik kata Jerman beserta artikelnya.
- **Pemeriksaan Jawaban Cerdas (`validator.ts`)**:
  - Menoleransi huruf kapital / kecil dengan bijak.
  - Mendukung penulisan karakter khusus Jerman seperti `ä`, `ö`, `ü`, dan `ß` melalui bilah bantu cepat (*virtual helper*).
  - Normalisasi spasi dan tanda kurung.
  - Mendeteksi jika kata Jerman benar namun artikel tertinggal (`article_missed`).
  - Mendukung variasi arti jamak yang dipisahkan koma atau garis miring (contoh: `"rumah, tempat tinggal"`).
- **Pengucapan Suara Jerman Asli**: Didukung oleh browser Web Speech API (suara penutur Jerman asli).

### 3. Mode Latihan Mandiri Bebas (Practice Mode)
- Pilihan kuantitas kartu: 10, 20, 50, 100 kata, atau seluruh kata yang tersedia.
- Urutan: **Mode Acak (Random)** (dijamin tanpa duplikat dalam satu sesi) atau **Mode Berurutan (Sequential)**.
- Pilihan arah pengujian: Jerman → Indonesia, Indonesia → Jerman, atau Campuran.
- Rangkuman sesi lengkap dengan grafik metrik, durasi, dan selebrasi konfeti.

### 4. Manajemen Deck & Kosakata
- Koleksi deck siap pakai: *German A1 - Grundwortschatz*, *Alltag & Begrüßung*, *Wichtige Verben*, *Essen & Trinken*.
- Buat, edit, dan hapus deck dengan warna kustom.
- Kelola kosakata dengan formulir intuitif: kata Jerman, artikel pilihan pill, bentuk jamak, arti bahasa Indonesia, contoh kalimat Jerman & Indonesia, serta catatan tata bahasa.
- Filter dan pencarian dinamis (berdasarkan artikel, status SRS, atau kata kunci pencarian).
- Paginasi tabel rapi dan responsif.

### 5. Dashboard & Analitik Pembelajaran
- Ringkasan kartu metrik: Total Decks, Total Kosakata, Kartu Perlu Review (Due), dan Kata Dikuasai.
- **Grafik Batang Recharts**: Aktivitas belajar 14 hari terakhir.
- **Grafik Donat Recharts**: Distribusi penguasaan memori (*Mastered*, *Learning*, *New*).
- Penghitung Streak harian dan akurasi rata-rata.
- Riwayat log sesi belajar tersimpan di IndexedDB.

### 6. Cadangan & Pemulihan Data (Backup & Restore)
- **Ekspor JSON**: Unduh seluruh database (deck, kosakata, log review, preferensi) ke dalam 1 file JSON.
- **Impor JSON**: Unggah file cadangan sebelumnya dengan validasi skema otomatis dan pencegahan tabrakan ID.
- **Reset Data**: Kembalikan data ke starter pack bawaan dengan konfirmasi keamanan.

### 7. Desain & UX Modern
- Terinspirasi estetika **Linear** dan **Notion**: minimalis, elegan, fokus, dan tidak mengalihkan perhatian.
- **Mode Gelap (Dark Mode) & Mode Terang (Light Mode)** yang persisten.
- Navigasi sidebar desktop yang ramping dan drawer responsif untuk perangkat bergerak (smartphone/tablet).
- Kemampuan PWA (*Progressive Web App*) untuk instalasi di perangkat.

---

## 🛠️ Tumpukan Teknologi

- **Framework**: React 18 & TypeScript
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Penyimpanan Lokal**: Dexie.js (Wrapper IndexedDB dengan reaktivitas hooks `dexie-react-hooks`)
- **State Management**: Zustand
- **Ikon**: Lucide React
- **Visualisasi & Grafik**: Recharts
- **Audio & Selebrasi**: Web Speech API & Canvas Confetti

---

## 📂 Struktur Direktori Proyek

```
Kosakta/
├── public/
│   ├── icon.svg
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ArticleBadge.tsx       # Badge warna artikel der/die/das
│   │   │   ├── Badge.tsx              # Badge status SRS
│   │   │   ├── GermanSpecialChars.tsx # Bilah tombol karakter ä, ö, ü, ß
│   │   │   └── Modal.tsx              # Komponen modal dialog
│   │   ├── dashboard/
│   │   │   ├── ActivityChart.tsx      # Grafik aktivitas Recharts
│   │   │   ├── RetentionChart.tsx     # Donut chart status kosakata
│   │   │   └── StatCard.tsx           # Kartu metrik ringkasan
│   │   ├── decks/
│   │   │   ├── DeckCard.tsx           # Kartu deck dengan progress bar
│   │   │   └── DeckModal.tsx          # Modal buat / edit deck
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Shell layout utama
│   │   │   ├── Header.tsx             # Bilah navigasi atas
│   │   │   └── Sidebar.tsx            # Navigasi sidebar Linear-style
│   │   ├── review/
│   │   │   ├── PracticeSetupModal.tsx # Modal kustomisasi latihan bebas
│   │   │   ├── RatingButtons.tsx      # Tombol penilaian Again/Hard/Good/Easy
│   │   │   ├── ReviewCard.tsx         # Kartu uji recall aktif
│   │   │   └── SessionSummary.tsx     # Rangkuman sesi & konfeti
│   │   └── vocabulary/
│   │       ├── VocabModal.tsx         # Formulir tambah / edit kosakata
│   │       └── VocabTable.tsx         # Tabel daftar kosakata & filter
│   ├── db/
│   │   ├── index.ts                   # Konfigurasi Dexie & skema IndexedDB
│   │   └── seedData.ts                # Starter deck A1, Verben, Alltag
│   ├── hooks/
│   │   ├── useDecks.ts                # Live query data deck & progres
│   │   ├── useStats.ts                # Kalkulasi analitik & streak
│   │   └── useVocabularies.ts         # Query & CRUD kosakata
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── DecksPage.tsx
│   │   ├── ReviewPage.tsx
│   │   ├── StatisticsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   ├── backup.ts                  # Ekspor / impor JSON & validasi
│   │   ├── srs.ts                     # Algoritma Spaced Repetition (SM-2)
│   │   └── validator.ts               # Logika validasi jawaban bahasa
│   ├── store/
│   │   ├── useReviewStore.ts          # State sesi review/latihan aktif
│   │   └── useSettingsStore.ts        # State preferensi & tema
│   ├── types/
│   │   └── index.ts                   # Definisi tipe TypeScript
│   ├── utils/
│   │   ├── confetti.ts                # Efek selebrasi konfeti
│   │   └── speech.ts                  # Integrasi Web Speech API Jerman
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Menjalankan Server Pengembangan (Dev Mode)
```bash
npm run dev
```
Buka browser pada alamat yang tertera (biasanya `http://localhost:5173`).

### 2. Melakukan Kompilasi Produksi (Production Build)
```bash
npm run build
```
Perintah ini akan menjalankan pemeriksaan tipe TypeScript (`tsc`) dan melakukan *bundling* teroptimasi dengan Vite ke direktori `dist/`.

### 3. Menjalankan Pratinjau Produksi (Preview)
```bash
npm run preview
```
Buka browser pada alamat `http://localhost:4173`.
