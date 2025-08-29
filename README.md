# Aplikasi Pasanggiri - Sistem Penilaian Pencak Silat

Aplikasi web untuk kompetisi pencak silat "Pasanggiri" menggunakan Next.js 14, Supabase, dan Vercel dengan fitur lengkap dan modern.

## Fitur Utama

- **User Management**: 9 Role berbeda dengan akses sesuai fungsi
- **Sistem Penilaian Baru**: Buang nilai tertinggi & terendah, ambil 3 nilai tengah
- **Detail Penilaian**: Visual feedback nilai yang dipakai vs dibuang
- **Dashboard**: Interface terpisah untuk setiap role dengan dark mode
- **Real-time**: Update langsung saat input nilai
- **Mobile-First**: Responsif untuk smartphone dengan PWA support
- **Validasi**: Range nilai bulat (integer) sesuai kriteria
- **Activity Logging**: Track semua aktivitas user dengan export
- **Master Control**: SuperAdmin dengan kontrol penuh sistem
- **UI/UX Modern**: Toast notifications, loading states, smart scoring assistant
- **Data Visualization**: Charts dan grafik untuk analisis hasil
- **Keyboard Shortcuts**: Navigasi cepat dengan shortcut keys
- **Command Palette**: Quick access ke semua fitur

## Kategori Kompetisi

1. **PERORANGAN**: Orisinalitas (39-50), Kemantapan (20-25), Stamina (20-25)
2. **BERKELOMPOK**: Orisinalitas (39-50), Kemantapan (20-25), Kekompakan (14-25)
3. **MASAL**: Orisinalitas (14-25), Kemantapan (20-25), Kekompakan (14-25), Kreatifitas (20-25)
4. **ATT**: Orisinalitas (35-50), Kemantapan (20-25), Kekayaan Teknik (20-25)
5. **BERPASANGAN**: Teknik Serang Bela (45-50), Kemantapan (20-25), Penghayatan (20-25)

## Desa Peserta

**KALIDERES** | **CENGKARENG** | **KEBON JAHE** | **JELAMBAR** | **KAPUK MELATI** | **CIPONDOH** | **TAMAN KOTA** | **BANDARA**

## Golongan Usia

**USIA DINI** | **PRA REMAJA** | **REMAJA** | **DEWASA** | **ISTIMEWA**

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
Buat file `.env.local`:
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
- Fitur: User management, system control, override semua fungsi, export data, reset passwords

### ADMIN (Operational Management):
- Username: `admin` | Password: `password123`
- Fitur: Monitor sistem, kelola user operasional, lihat semua hasil

### KOORDINATOR (Class Supervision):
- Username: `koordinator_putra`, `koordinator_putri` | Password: `password123`
- Fitur: Supervisi per kelas, override sesi pertandingan, detail penilaian

### SIRKULATOR (Competition Management):
- Username: `sirkulator_putra`, `sirkulator_putri` | Password: `password123`
- Fitur: Buat/kelola sesi pertandingan per kelas dengan validasi duplikasi

### JURI (Scoring - Terpisah per Kelas):
- **PUTRA**: `juri1`, `juri2`, `juri3`, `juri4`, `juri5` | Password: `password123`
- **PUTRI**: `juri_putri1`, `juri_putri2`, `juri_putri3`, `juri_putri4`, `juri_putri5` | Password: `password123`
- Fitur: Penilaian sesuai kelas masing-masing dengan smart scoring assistant

### VIEWER (Read-Only Access):
- Username: `viewer` | Password: `password123`
- Fitur: Lihat hasil pertandingan dan ranking (read-only)

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

- **users**: Data user, role, status aktif, timestamps dengan RLS
- **competitions**: Sesi pertandingan dengan filter per kelas dan status
- **scores**: Nilai dari juri dengan JSONB criteria_scores dan unique constraint
- **results**: Hasil akhir dengan array total_scores dan ranking otomatis
- **activity_logs**: Log aktivitas dengan user_id reference dan indexing

### Database Features:
- ✅ **Row Level Security (RLS)** untuk semua tabel
- ✅ **Indexes** untuk performa optimal
- ✅ **Foreign Key Constraints** dengan CASCADE delete
- ✅ **Check Constraints** untuk validasi data
- ✅ **JSONB** untuk flexible scoring criteria
- ✅ **Timestamps** dengan timezone support
- ✅ **Unique Constraints** untuk prevent duplicate scores

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + React 18
- **Database**: Supabase (PostgreSQL) dengan RLS
- **Styling**: Tailwind CSS dengan Dark Mode
- **Icons**: Lucide React
- **Deployment**: Vercel dengan optimasi
- **Authentication**: Custom dengan bcryptjs
- **State Management**: React Hooks + Context API
- **API**: Next.js 14 API Routes
- **PWA**: Manifest + Service Worker ready
- **Security**: Row Level Security + Input validation

## Fitur Sistem

### User Management (SuperAdmin):
- ✅ CRUD user lengkap dengan validasi
- ✅ Edit username, role, password dengan konfirmasi
- ✅ Reset password individual/batch dengan log
- ✅ Aktifkan/nonaktifkan user dengan status visual
- ✅ Activity logging dengan export JSON
- ✅ Statistik sistem real-time
- ✅ Bulk operations untuk maintenance

### Competition Control:
- ✅ **UI/UX Modern**: Toast notifications, loading states, button animations
- ✅ **Prevent Duplicate**: Validasi sesi duplikat dengan peringatan
- ✅ **Visual Feedback**: Button states (clickable → creating → created)
- ✅ Buat sesi per kelas dengan grid layout responsif
- ✅ Override control untuk admin dengan konfirmasi
- ✅ Filter otomatis berdasarkan role dan kelas
- ✅ Real-time status update dengan WebSocket-like behavior
- ✅ Delete competition dengan konfirmasi

### Scoring System:
- ✅ **Sistem Penilaian Baru**: Eliminasi nilai tertinggi & terendah (middle 3)
- ✅ **Detail Penilaian**: Visual breakdown nilai dipakai vs dibuang
- ✅ **Smart Scoring Assistant**: AI-powered suggestions dan warnings
- ✅ **Input Integer Only**: Validasi nilai bulat dengan range checking
- ✅ Form dinamis per kategori dengan auto-calculation
- ✅ Validasi range nilai sesuai kriteria kompetisi
- ✅ Juri terpisah per kelas dengan access control
- ✅ Hasil real-time dengan ranking otomatis
- ✅ Data visualization dengan charts

### Modern UI/UX:
- ✅ **Dark Mode**: Toggle tema dengan persistence
- ✅ **Command Palette**: Quick access dengan Ctrl+K
- ✅ **Keyboard Shortcuts**: Navigasi cepat
- ✅ **Loading States**: Skeleton loaders dan spinners
- ✅ **Toast System**: Notifikasi dengan auto-dismiss
- ✅ **Responsive Design**: Mobile-first dengan touch optimization
- ✅ **PWA Ready**: Manifest dan offline capability
- ✅ **Floating Action Button**: Quick actions
- ✅ **Data Export**: JSON export untuk backup

## Advanced Features

### Smart Scoring Assistant
- 🤖 **AI-Powered Analysis**: Deteksi pola penilaian tidak wajar
- ⚠️ **Real-time Warnings**: Peringatan nilai terlalu tinggi/rendah
- 💡 **Smart Suggestions**: Rekomendasi berdasarkan kategori kompetisi
- 📊 **Consistency Check**: Analisis variance antar kriteria

### Data Visualization
- 📊 **Interactive Charts**: Bar, pie, dan line charts dengan animasi
- 🎨 **Color-coded Results**: Visual feedback dengan tema konsisten
- 📈 **Real-time Updates**: Charts update otomatis saat ada perubahan
- 🖱️ **Hover Effects**: Interactive elements dengan smooth transitions

### Keyboard Shortcuts
- `Ctrl + K`: Command Palette
- `Ctrl + F`: Search
- `Ctrl + S`: Save (dalam form)
- `Ctrl + R`: Refresh data
- `?`: Show help
- `Escape`: Close modal/cancel

### Performance Optimizations
- ⚡ **Next.js 14**: App Router dengan server components
- 🚀 **Lazy Loading**: Components dimuat sesuai kebutuhan
- 💾 **Caching**: Optimized API responses
- 📱 **Mobile-First**: Touch-optimized interface
- 🔄 **Real-time Updates**: Efficient state management

## Deployment & Maintenance

### Environment Setup
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Database Migration
1. Jalankan `supabase-schema.sql` untuk setup awal
2. Jalankan `supabase-schema-update.sql` untuk update roles
3. Jalankan `supabase-juri-update.sql` untuk setup juri per kelas

### Maintenance Features
- 🔧 **System Statistics**: Monitor user activity dan performa
- 📤 **Data Export**: Backup semua data dalam format JSON
- 🔄 **Bulk Password Reset**: Reset password semua user sekaligus
- 🗑️ **Log Cleanup**: Hapus log lama (>30 hari) otomatis
- 👥 **User Status Management**: Bulk activate/deactivate users

## Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## License

MIT License - Lihat file LICENSE untuk detail lengkap.

## Support

Untuk bantuan teknis atau pertanyaan, silakan buat issue di repository ini.