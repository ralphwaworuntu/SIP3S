# SIP3S (Sistem Informasi Pengawasan Pengelolaan Produk Subsidi)

Repositori ini berisi implementasi lengkap aplikasi Progressive Web App berbasis React + TypeScript dan backend Express.js untuk memonitor distribusi produk pertanian bersubsidi di Nusa Tenggara Timur.

## Struktur Proyek

- `frontend/` – PWA berbasis Vite, Tailwind, dan komponen Shadcn UI.
- `backend/` – REST API Express dengan integrasi MySQL (fallback mock data bila koneksi DB tidak tersedia).
- `app-summary.md` – Ringkasan kebutuhan aplikasi.

## Menjalankan Proyek

### Prasyarat
- Node.js >= 18
- npm/pnpm/yarn
- MySQL (opsional, aplikasi akan otomatis memakai mock data jika koneksi gagal)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`.

### Backend
```bash
cd backend
cp .env.example .env
# Sesuaikan kredensial MySQL jika tersedia
npm install
npm run dev
```
API tersedia di `http://localhost:4000`. Endpoint kunci:
- `POST /api/auth/login`
- `GET/POST /api/tasks`
- `GET/POST /api/reports`

## Fitur Utama
- Login multi peran (Super Admin, Admin Spesialis, Super User/BULOG, Petugas Lapangan)
- Dashboard khusus untuk tiap peran dengan grafik, peta, dan penugasan
- Form laporan lapangan dengan kamera (hanya capture baru) dan geolokasi
- Offline-first: data disimpan ke IndexedDB, sinkron via Service Worker + Background Sync
- Manifest & service worker siap deploy (installable di perangkat mobile)
- UI profesional berbahasa Indonesia mengikuti palet warna yang ditentukan

## Catatan Penting
- Ganti ikon PWA di `frontend/public/icons/` dengan aset resmi (misal logo pada `BACKDROP_-_PELATIHAN_PPL.png`).
- Implementasi peta menggunakan SVG kustom; integrasikan dengan penyedia peta sebenarnya jika diperlukan.
- Tambahkan tabel pengguna/tugas/laporan di MySQL sesuai struktur pada `backend/src/services/*` bila ingin produksi penuh.
