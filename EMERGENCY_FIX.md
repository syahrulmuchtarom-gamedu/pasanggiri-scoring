# EMERGENCY FIX - Hapus Semua Manifest

## Masalah Persisten:
Next.js masih mendeteksi `app/manifest.json` meskipun sudah dihapus berkali-kali.

## Solusi Darurat:
1. Hapus semua file manifest
2. Deploy tanpa PWA manifest dulu
3. Tambahkan PWA nanti setelah app berjalan

## Commit:
```bash
git add .
git commit -m "Emergency fix: Remove all manifest files to resolve build error"
git push origin main
```

## Setelah Deploy Berhasil:
Bisa tambahkan PWA manifest dengan cara yang benar nanti.