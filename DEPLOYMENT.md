# Panduan Deployment Aplikasi Pasanggiri

## 1. Setup Supabase Database

### Langkah 1: Buat Project Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Klik "Start your project"
3. Buat akun atau login
4. Klik "New Project"
5. Pilih organization dan isi detail project:
   - Name: `pasanggiri-app`
   - Database Password: (buat password yang kuat)
   - Region: Southeast Asia (Singapore)

### Langkah 2: Setup Database Schema
1. Tunggu project selesai dibuat (2-3 menit)
2. Masuk ke project dashboard
3. Klik "SQL Editor" di sidebar kiri
4. Klik "New Query"
5. Copy-paste seluruh isi file `supabase-schema.sql`
6. Klik "Run" untuk menjalankan script

### Langkah 3: Ambil API Keys
1. Klik "Settings" di sidebar kiri
2. Klik "API"
3. Copy nilai berikut:
   - `URL` (Project URL)
   - `anon public` (API Key)
   - `service_role` (Service Role Key - hanya untuk server)

## 2. Setup Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 3. Test Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Buka http://localhost:3000 dan test:
- Login dengan akun default
- Buat sesi pertandingan (sebagai SIRKULATOR)
- Input nilai (sebagai JURI)

## 4. Deploy ke Vercel

### Langkah 1: Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/pasanggiri-app.git
git push -u origin main
```

### Langkah 2: Deploy di Vercel
1. Kunjungi [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik "New Project"
4. Import repository `pasanggiri-app`
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Langkah 3: Set Environment Variables
Di Vercel dashboard:
1. Klik tab "Settings"
2. Klik "Environment Variables"
3. Tambahkan 3 environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Set untuk semua environments (Production, Preview, Development)

### Langkah 4: Deploy
1. Klik "Deploy"
2. Tunggu proses build selesai (2-3 menit)
3. Aplikasi akan tersedia di URL Vercel

## 5. Custom Domain (Opsional)

1. Di Vercel dashboard, klik "Domains"
2. Tambahkan domain custom
3. Update DNS records sesuai instruksi Vercel

## 6. Monitoring & Maintenance

### Analytics
- Vercel Analytics otomatis aktif
- Monitor performa di Vercel dashboard

### Database Monitoring
- Monitor usage di Supabase dashboard
- Set up alerts untuk usage limits

### Backup Database
```sql
-- Export data (jalankan di Supabase SQL Editor)
SELECT * FROM users;
SELECT * FROM competitions;
SELECT * FROM scores;
SELECT * FROM results;
```

## 7. Troubleshooting

### Error: "Invalid API Key"
- Pastikan environment variables sudah benar
- Redeploy aplikasi setelah update env vars

### Error: "Database Connection Failed"
- Cek Supabase project status
- Pastikan RLS policies sudah diset

### Error: "Build Failed"
- Cek TypeScript errors
- Pastikan semua dependencies terinstall

### Performance Issues
- Enable Vercel Edge Functions
- Optimize images dengan Next.js Image
- Enable caching di Supabase

## 8. Security Checklist

- [ ] Environment variables tidak di-commit ke Git
- [ ] Supabase RLS policies aktif
- [ ] Password default sudah diganti
- [ ] HTTPS enforced di production
- [ ] Rate limiting aktif di Supabase

## 9. Akun Default

Setelah deployment, gunakan akun berikut untuk testing:

**JURI:**
- juri1 / password123
- juri2 / password123
- juri3 / password123
- juri4 / password123
- juri5 / password123

**SIRKULATOR:**
- sirkulator_putra / password123
- sirkulator_putri / password123

**PENTING:** Ganti password default setelah deployment!