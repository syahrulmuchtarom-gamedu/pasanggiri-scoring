# Quick Fix untuk Error Build

## Error yang Terjadi:
```
Cannot parse JSON: manifest.json in app/ folder
```

## Solusi Cepat:

### 1. Pastikan struktur folder benar:
```
public/
  └── manifest.json  ✅ (BENAR)
app/
  └── manifest.json  ❌ (SALAH - HAPUS INI)
```

### 2. Commit perubahan terbaru:
```bash
git add .
git commit -m "Remove app/manifest.json, fix routing conflicts"
git push origin main
```

### 3. Jika masih error, coba:
1. Di Vercel dashboard → Settings → Functions
2. Clear all caches
3. Redeploy from scratch

### 4. Alternative: Manual deploy
```bash
# Clone fresh dari GitHub
git clone https://github.com/username/repo.git
cd repo

# Pastikan struktur benar
ls public/manifest.json  # Harus ada
ls app/manifest.json     # Harus tidak ada

# Test build lokal
npm install
npm run build
```

## Perubahan Terakhir:
- ✅ Hapus app/metadata.ts
- ✅ Simplify layout.tsx  
- ✅ Hapus folder app/scoring kosong
- ✅ Update .gitignore
- ✅ Tambah .vercelignore

## Jika Masih Error:
Buat project Vercel baru dan import ulang dari GitHub.