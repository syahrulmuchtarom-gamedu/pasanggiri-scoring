# Aplikasi Pasanggiri - Sistem Penilaian Pencak Silat

Aplikasi web untuk kompetisi pencak silat "Pasanggiri" menggunakan Next.js, Supabase, dan Vercel.

## Fitur Utama

- **User Management**: 8 Role berbeda dengan akses sesuai fungsi
- **Sistem Penilaian Baru**: Buang nilai tertinggi & terendah, ambil 3 nilai tengah
- **Detail Penilaian**: Visual feedback nilai yang dipakai vs dibuang
- **Dashboard**: Interface terpisah untuk setiap role
- **Real-time**: Update langsung saat input nilai
- **Mobile-First**: Responsif untuk smartphone
- **Validasi**: Range nilai bulat (integer) sesuai kriteria
- **Activity Logging**: Track semua aktivitas user
- **Master Control**: SuperAdmin dengan kontrol penuh sistem
- **UI/UX Feedback**: Toast notifications & button state changes

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

## Role & Akun Default

### SUPER_ADMIN (Master Control):
- Username: `superadmin` | Password: `password123`
- Fitur: User management, system control, override semua fungsi

### ADMIN (Operational Management):
- Username: `admin` | Password: `password123`
- Fitur: Monitor sistem, kelola user operasional

### KOORDINATOR (Class Supervision):
- Username: `koordinator_putra`, `koordinator_putri` | Password: `password123`
- Fitur: Supervisi per kelas, override sesi pertandingan

### SIRKULATOR (Competition Management):
- Username: `sirkulator_putra`, `sirkulator_putri` | Password: `password123`
- Fitur: Buat/kelola sesi pertandingan per kelas

### JURI (Scoring - Terpisah per Kelas):
- **PUTRA**: `juri1-5` | Password: `password123`
- **PUTRI**: `juri_putri1-5` | Password: `password123`
- Fitur: Penilaian sesuai kelas masing-masing

### VIEWER (Read-Only Access):
- Username: `viewer` | Password: `password123`
- Fitur: Lihat hasil pertandingan (read-only)

## Sistem Penilaian Baru

### Logika Perhitungan:
1. **5 Juri memberikan nilai** → [19, 20, 30, 40, 50]
2. **Urutkan dari kecil ke besar** → [19, 20, 30, 40, 50]
3. **Buang nilai terendah dan tertinggi** → ~~19~~, 20, 30, 40, ~~50~~
4. **Ambil 3 nilai tengah** → [20, 30, 40]
5. **Jumlahkan 3 nilai tengah** → 20 + 30 + 40 = **90**
6. **Nilai 90 = Nilai Final**

### Keuntungan:
- **Eliminasi bias ekstrem** (juri terlalu pelit/royal)
- **Lebih objektif** dengan nilai moderat
- **Standar internasional** untuk kompetisi olahraga
- **Detail transparan** - user bisa lihat nilai mana yang dipakai/dibuang

### Akses Detail Penilaian:
- **SuperAdmin**: Tab "Detail Penilaian" → Lihat PUTRA & PUTRI
- **Admin**: Tab "Detail Penilaian" → Lihat PUTRA & PUTRI
- **Koordinator**: Tab "Detail Penilaian" → Lihat sesuai kelas

## Workflow Sistem

### Operasional Terpisah per Kelas:
**GELANGGANG PUTRA:**
1. **SIRKULATOR_PUTRA** buat sesi pertandingan PUTRA
2. **JURI_PUTRA** (juri1-5) lihat dan nilai sesi PUTRA saja
3. **KOORDINATOR_PUTRA** supervisi dan override jika perlu

**GELANGGANG PUTRI:**
1. **SIRKULATOR_PUTRI** buat sesi pertandingan PUTRI
2. **JURI_PUTRI** (juri_putri1-5) lihat dan nilai sesi PUTRI saja
3. **KOORDINATOR_PUTRI** supervisi dan override jika perlu

### Master Control:
- **SUPER_ADMIN**: Kontrol penuh kedua kelas + manajemen sistem
- **ADMIN**: Monitor operasional + kelola user
- **VIEWER**: Akses read-only hasil pertandingan

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

- **users**: Data user, role, dan status aktif
- **competitions**: Sesi pertandingan dengan filter per kelas
- **scores**: Nilai dari juri sesuai kelas masing-masing
- **results**: Hasil akhir dan ranking per kelas
- **activity_logs**: Log aktivitas semua user untuk audit

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Authentication**: Custom (plain text untuk kemudahan)
- **State Management**: React Hooks
- **API**: Next.js API Routes

## Fitur Sistem

### User Management (SuperAdmin):
- ✅ CRUD user lengkap
- ✅ Edit username, role, password
- ✅ Reset password individual/batch
- ✅ Aktifkan/nonaktifkan user
- ✅ Activity logging

### Competition Control:
- ✅ **UI/UX Feedback**: Toast notifications & button states
- ✅ **Prevent Duplicate**: Tidak bisa buat sesi yang sama 2x
- ✅ **Visual Status**: Button berubah dari clickable → creating → created
- ✅ Buat sesi per kelas (PUTRA/PUTRI)
- ✅ Override control untuk admin
- ✅ Filter otomatis berdasarkan role
- ✅ Real-time status update

### Scoring System:
- ✅ **Sistem Penilaian Baru**: Eliminasi nilai tertinggi & terendah
- ✅ **Detail Penilaian**: Tampilkan nilai yang dipakai/dibuang
- ✅ **Input Integer Only**: Nilai bulat tanpa desimal
- ✅ Form dinamis per kategori
- ✅ Validasi range nilai
- ✅ Juri terpisah per kelas
- ✅ Hasil real-time

### Mobile Optimization:
- ✅ Touch-friendly interface
- ✅ Responsive design
- ✅ Fast loading
- ✅ PWA ready

## Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request