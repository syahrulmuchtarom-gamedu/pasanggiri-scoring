# Aplikasi Pasanggiri - Sistem Penilaian Pencak Silat

Aplikasi web untuk kompetisi pencak silat "Pasanggiri" menggunakan Next.js, Supabase, dan Vercel.

## Fitur Utama

- **User Management**: 5 JURI + 2 SIRKULATOR (PUTRA/PUTRI)
- **Sistem Penilaian**: Form dinamis untuk 5 kategori kompetisi
- **Dashboard**: Interface terpisah untuk JURI dan SIRKULATOR
- **Real-time**: Update langsung saat input nilai
- **Mobile-First**: Responsif untuk smartphone
- **Validasi**: Range nilai sesuai kriteria setiap kategori

## Kategori Kompetisi

1. **PERORANGAN**: Orisinalitas (39-50), Kemantapan (20-25), Stamina (20-25)
2. **BERKELOMPOK**: Orisinalitas (39-50), Kemantapan (20-25), Kekompakan (14-25)
3. **MASAL**: Orisinalitas (14-25), Kemantapan (20-25), Kekompakan (14-25), Kreatifitas (20-25)
4. **ATT**: Orisinalitas (35-50), Kemantapan (20-25), Kekayaan Teknik (20-25)
5. **BERPASANGAN**: Teknik Serang Bela (45-50), Kemantapan (20-25), Penghayatan (20-25)

## Setup Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase
1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan script SQL dari `supabase-schema.sql` di SQL Editor
3. Copy URL dan API keys ke `.env.local`

### 3. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run Development Server
```bash
npm run dev
```

## Akun Default

### JURI (5 akun):
- Username: `juri1`, `juri2`, `juri3`, `juri4`, `juri5`
- Password: `password123`

### SIRKULATOR (2 akun):
- Username: `sirkulator_putra`, `sirkulator_putri`
- Password: `password123`

## Workflow Sistem

1. **SIRKULATOR** login dan membuat sesi pertandingan
2. **SIRKULATOR** mengaktifkan form penilaian untuk kategori tertentu
3. **JURI** login dan melihat pertandingan aktif
4. **JURI** mengisi form penilaian sesuai kriteria
5. **JURI** submit nilai ke database
6. **SIRKULATOR** melihat hasil dan mengelola sesi

## Deployment ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy di Vercel
1. Import project dari GitHub
2. Set environment variables
3. Deploy

### 3. Setup Domain (Opsional)
- Tambahkan custom domain di Vercel dashboard

## Struktur Database

- **users**: Data user dan role
- **competitions**: Sesi pertandingan aktif
- **scores**: Nilai dari setiap JURI
- **results**: Hasil akhir dan ranking

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Authentication**: Custom dengan bcrypt

## Mobile Optimization

- Touch-friendly interface
- Responsive design
- Fast loading
- Offline-capable
- PWA ready

## Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request