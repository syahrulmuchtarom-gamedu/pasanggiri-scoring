# Pasanggiri - Clean Build

Aplikasi penilaian kompetisi pencak silat tanpa manifest conflicts.

## Setup

1. Setup Supabase database dengan `supabase-schema.sql`
2. Update `.env.local` dengan Supabase credentials
3. Deploy ke Vercel

## Akun Default

- JURI: juri1-juri5 / password123
- SIRKULATOR: sirkulator_putra, sirkulator_putri / password123

## Deploy

```bash
npm install
npm run build
```

Build akan berhasil tanpa manifest routing conflicts.