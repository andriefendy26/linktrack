# LinkTrack — Generator Tracking Link + Dashboard (Next.js)

Buat link pendek, bagikan, lalu lihat metadata setiap klik di dashboard.

## Menjalankan
```bash
npm install
cp .env.example .env.local   # lalu isi DASHBOARD_PASSWORD & APP_SECRET
npm run dev                  # http://localhost:3000
```
Produksi: `npm run build && npm start` (butuh server dengan disk persisten; SQLite disimpan di `./data/tracker.db`).

## Cara kerja
1. Masuk ke `/login` dengan `DASHBOARD_PASSWORD`.
2. Buat link di `/dashboard` → dapat URL seperti `https://domainmu/l/abc123`.
3. Saat link dibuka, server mencatat metadata lalu redirect (302) ke URL tujuan.
4. Klik **Detail** untuk statistik: klik per hari, browser, OS, perangkat, negara, referrer, bahasa, dan 50 klik terakhir.

## Metadata yang dicatat (dari HTTP request standar)
Waktu, IP (default: hanya hash), User-Agent → browser/OS/perangkat, referrer, bahasa, negara/kota (dari header Vercel/Cloudflare bila ada), flag bot.
Tidak ada fingerprinting browser / script tersembunyi.

## Catatan privasi
- Default IP **tidak disimpan mentah** (hash + secret). Set `STORE_RAW_IP=true` hanya jika perlu.
- Beri tahu pengguna bahwa klik dicatat (kebijakan privasi), sesuai UU PDP No. 27/2022.
- Gunakan hanya untuk link milikmu / kampanye yang sah.
- Ganti `DASHBOARD_PASSWORD` dan `APP_SECRET` sebelum deploy.

## Struktur
- `app/l/[slug]/route.ts` — endpoint redirect + pencatatan klik
- `app/dashboard` — UI dashboard & detail
- `app/api/links` — API CRUD link
- `lib/db.ts` — skema SQLite
- `middleware.ts` — proteksi dashboard/API dengan cookie sesi
