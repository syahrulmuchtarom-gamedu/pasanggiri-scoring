# Fix untuk Error Build Vercel

## Masalah yang Diperbaiki:

1. **manifest.json di folder app/** - Dipindahkan ke public/
2. **next.config.js deprecated option** - Dihapus experimental.appDir
3. **Supabase auth helpers deprecated** - Update ke @supabase/ssr

## Perubahan yang Dilakukan:

### 1. Pindahkan manifest.json
```bash
# File dipindahkan dari app/manifest.json ke public/manifest.json
```

### 2. Update next.config.js
```js
// SEBELUM (ERROR)
const nextConfig = {
  experimental: {
    appDir: true, // DEPRECATED
  },
}

// SESUDAH (FIXED)
const nextConfig = {
  // Configuration options
}
```

### 3. Update package.json
```json
// Ganti dependency lama:
"@supabase/auth-helpers-nextjs": "^0.8.7"

// Dengan yang baru:
"@supabase/ssr": "^0.0.10"
```

### 4. Update layout.tsx
```tsx
// Pisahkan metadata ke file terpisah untuk menghindari konflik
export { metadata } from './metadata';
```

## Langkah Deploy Ulang:

1. **Commit perubahan ke GitHub:**
```bash
git add .
git commit -m "Fix build errors: move manifest, update config"
git push origin main
```

2. **Redeploy di Vercel:**
- Vercel akan otomatis redeploy setelah push
- Atau manual trigger di Vercel dashboard

3. **Jika masih error, coba:**
- Clear build cache di Vercel
- Redeploy dari scratch

## Verifikasi Fix:

Build seharusnya berhasil dengan perubahan ini. Error utama:
- ❌ `Cannot parse JSON: manifest.json` - FIXED
- ❌ `Invalid next.config.js: appDir` - FIXED  
- ❌ `Deprecated auth-helpers` - FIXED

## Environment Variables yang Diperlukan:

Pastikan di Vercel sudah set:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```