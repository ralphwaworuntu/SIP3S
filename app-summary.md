Anda adalah seorang pengembang web AI ahli. Tugas Anda adalah membangun Progressive Web App (PWA) yang lengkap dan siap-deploy berdasarkan spesifikasi proyek yang terperinci di bawah ini. Aplikasi ini bernama **SIP3S (Sistem Informasi Pengawasan Pengelolaan Produk Subsidi)**.

## **1. Gambaran Umum Proyek**
[cite_start]Bangun sebuah PWA untuk memantau dan mengawasi distribusi produk pertanian bersubsidi di seluruh Nusa Tenggara Timur (NTT), Indonesia[cite: 13]. [cite_start]Sistem ini akan memungkinkan kolaborasi yang lancar antara polisi, instansi pemerintah, dan petugas lapangan[cite: 13].

## **2. Prinsip Inti & Kualitas Pengalaman**
Aplikasi harus:
* [cite_start]**Dapat Dipercaya (Trustworthy)**: Desain profesional dan penanganan data yang andal[cite: 14].
* [cite_start]**Aksesibel (Accessible)**: Sangat mudah digunakan untuk pengguna non-teknis[cite: 14].
* [cite_start]**Responsif (Responsive)**: Berfungsi lancar di semua perangkat dengan kemampuan offline[cite: 14].

## **3. Tumpukan Teknologi (Technical Stack)**

### **Frontend**
* [cite_start]**Framework**: React + TypeScript[cite: 3].
* [cite_start]**Build System**: Vite[cite: 3].
* [cite_start]**Styling**: Tailwind CSS[cite: 3].
* [cite_start]**UI Components**: Shadcn UI[cite: 3].
* [cite_start]**Penyimpanan Sisi Klien**: KV storage (menggunakan IndexedDB) untuk persistensi data dan kemampuan offline[cite: 3].

### **Backend**
* **Framework**: Node.js dengan Express.js untuk membuat API.
* **Database**: **MySQL** untuk penyimpanan data pusat yang terstruktur dan relasional.

## **4. Sistem Desain & Antarmuka Pengguna (UI/UX)**
**Arah Desain:**
[cite_start]Desain harus membangkitkan kepercayaan, keandalan, dan otoritas pemerintah, namun tetap mudah didekati dan ramah pengguna untuk petugas lapangan[cite: 14]. [cite_start]Prioritaskan kejelasan dan efisiensi[cite: 14].

**Palet Warna:**
[cite_start]Gunakan skema warna triadik berikut yang menginspirasi kepercayaan dan otoritas[cite: 15, 16].

| Peran Warna | Nama | Nilai OKLCH | Teks Pasangan | Rasio Kontras |
| :--- | :--- | :--- | :--- | :--- |
| **Primer** | Biru Pemerintah | `oklch(0.45 0.15 250)` | Putih (`oklch(1 0 0)`) | [cite_start]6.2:1 [cite: 16, 17] |
| **Sekunder** | Hijau Hutan | `oklch(0.55 0.12 145)` | Putih (`oklch(1 0 0)`) | [cite_start]4.7:1 [cite: 17] |
| **Sekunder** | Slate Netral | `oklch(0.65 0.02 250)` | Gelap (`oklch(0.2 0.02 250)`) | N/A |
| **Aksen** | Oranye Hangat | `oklch(0.68 0.15 45)` | Putih (`oklch(1 0 0)`) | [cite_start]4.9:1 [cite: 17] |
| **Latar Belakang** | Putih | `oklch(1 0 0)` | Gelap (`oklch(0.2 0.02 250)`) | [cite_start]12.6:1 [cite: 17] |
| **Latar Kartu**| Abu-abu Terang| `oklch(0.98 0.005 250)`| Gelap (`oklch(0.2 0.02 250)`) | [cite_start]11.8:1 [cite: 17] |

**Tipografi:**
[cite_start]Gunakan font "Inter" dengan hierarki berikut untuk memastikan keterbacaan maksimum[cite: 18].
* [cite_start]**H1 (Judul Halaman)**: Inter Bold, 32px, spasi huruf rapat[cite: 18].
* [cite_start]**H2 (Judul Bagian)**: Inter SemiBold, 24px, spasi huruf normal[cite: 18].
* [cite_start]**H3 (Sub-bagian)**: Inter Medium, 20px, spasi huruf normal[cite: 18].
* [cite_start]**Teks Isi**: Inter Regular, 16px, tinggi baris longgar (1.6)[cite: 18].
* [cite_start]**Label**: Inter Medium, 14px[cite: 18].
* [cite_start]**Keterangan**: Inter Regular, 12px[cite: 18].

**Komponen & Elemen UI:**
[cite_start]Implementasikan komponen Shadcn UI berikut dengan kustomisasi[cite: 20]:
* [cite_start]**Elemen**: Cards, Buttons (primer/sekunder), Forms, Badges, Alerts, Dialogs, Tabs, Progress indicators[cite: 20].
* **Kustomisasi**:
    * [cite_start]Target sentuh besar (minimal 48px) untuk penggunaan mobile[cite: 20].
    * [cite_start]Komponen peta kustom untuk dashboard Super Admin[cite: 20].
    * [cite_start]Indikator status offline dengan status sinkronisasi[cite: 20].
    * [cite_start]Ikon: Gunakan ikon Phosphor untuk konsistensi[cite: 20].
* **Branding**:
    * [cite_start]Perbarui logo dengan file `BACKDROP_-_PELATIHAN_PPL.png`[cite: 1].
    * [cite_start]Integrasikan logo untuk 9 mitra kolaborasi[cite: 1].
    * [cite_start]Pastikan antarmuka menggunakan Bahasa Indonesia[cite: 1].

**Animasi:**
[cite_start]Animasi harus terasa profesional, efisien, dan halus untuk meningkatkan usabilitas tanpa terasa berlebihan[cite: 19]. [cite_start]Gunakan transisi halus untuk perubahan status dan navigasi halaman[cite: 19].

## **5. Peran Pengguna & Data Mock**
Konfigurasikan sistem dengan peran pengguna dan kredensial login berikut.

**A. Tipe Login Admin (Akses melalui tombol "Login Admin")**
1.  [cite_start]**Super Admin** [cite: 22]
    * **Email**: `superadmin@polda.ntt.gov.id`
    * **Password**: `password123`
    * **Dashboard Tujuan**: `SuperAdminDashboard`
2.  [cite_start]**Admin Spesialis** [cite: 22]
    * **Email**: `admin@polres.kupang.gov.id`
    * **Password**: `password123`
    * **Dashboard Tujuan**: `AdminSpesialisDashboard`

**B. [cite_start]Tipe Login User (Akses melalui tombol "Login User")** [cite: 23]
1.  [cite_start]**Super User (BULOG)** [cite: 23]
    * **Email**: `user@bulog.kupang.gov.id`
    * **Password**: `password123`
    * **Dashboard Tujuan**: `SuperUserDashboard`
2.  [cite_start]**End User (Bhabinkamtibmas)** [cite: 23]
    * **Email**: `bhabinkamtibmas@polsek.kupang.gov.id`
    * **Password**: `password123`
    * **Dashboard Tujuan**: `EndUserDashboard`
3.  [cite_start]**End User (PPL)** [cite: 23]
    * **Email**: `ppl@pertanian.kupang.gov.id`
    * **Password**: `password123`
    * **Dashboard Tujuan**: `EndUserDashboard`
4.  [cite_start]**End User (Bhabinkamtibmas 2)** [cite: 23]
    * **Email**: `bhabinkamtibmas2@polsek.kupang.gov.id`
    * [cite_start]**Password**: `password123` [cite: 24]
    * **Dashboard Tujuan**: `EndUserDashboard`
5.  [cite_start]**End User (PPL 2)** [cite: 24]
    * **Email**: `ppl2@pertanian.kupang.gov.id`
    * **Password**: `password123`
    * **Dashboard Tujuan**: `EndUserDashboard`

## **6. Alur Aplikasi & Implementasi Fitur**
**1. Halaman Landing Publik**
* [cite_start]**Tujuan**: Portal informasi yang membangun kepercayaan dan mengarahkan pengguna ke jalur login yang sesuai[cite: 10].
* **Fungsionalitas**:
    * Menampilkan tujuan sistem.
    * [cite_start]Memiliki dua tombol login yang berbeda: **"Login Admin"** dan **"Login User"**[cite: 23].

**2. Sistem Otentikasi & Otorisasi**
* **Alur Login**:
    * Klik "Login Admin" atau "Login User" akan membuka form login yang sesuai.
    * [cite_start]Setelah login berhasil, arahkan pengguna ke dashboard spesifik peran mereka[cite: 11, 22, 23].
* **Fungsionalitas**:
    * [cite_start]Login dan Logout yang aman untuk semua peran[cite: 1, 5].
    * [cite_start]Kontrol akses berbasis peran (Role-Based Access Control) yang ketat[cite: 5].

**3. Dashboard & Fitur Berbasis Peran**

**A. Dashboard Super Admin (`SuperAdminDashboard`)**
* [cite_start]**Tujuan**: Pengawasan tingkat tinggi untuk seluruh program di provinsi NTT[cite: 13].
* **Fitur**:
    * [cite_start]Visualisasi peta panas (heat map) interaktif untuk seluruh provinsi NTT[cite: 1, 4].
    * [cite_start]Sistem manajemen pengguna yang lengkap (buat, edit, hapus pengguna)[cite: 2].
    * [cite_start]Integrasi pemantauan cuaca secara real-time[cite: 1, 4].
    * [cite_start]Analisis data E-RDKK dengan rekomendasi alokasi subsidi[cite: 1, 2, 4].
    * [cite_start]Pemantauan rantai pasok[cite: 2, 4].
    * [cite_start]Dashboard analitik yang komprehensif[cite: 4].
    * [cite_start]Fungsi ekspor data[cite: 2, 4].
    * [cite_start]Sidebar navigasi yang dapat diperluas/diperkecil[cite: 1].

**B. Dashboard Admin Spesialis (`AdminSpesialisDashboard`)**
* [cite_start]**Tujuan**: Manajemen dan pengawasan regional untuk area Kupang[cite: 4].
* **Fitur**:
    * [cite_start]Sistem peninjauan dan persetujuan/penolakan laporan lapangan[cite: 4].
    * [cite_start]Pemberian tugas kepada petugas lapangan (End Users)[cite: 4].
    * [cite_start]Dashboard analitik dan pelaporan untuk wilayah Kupang[cite: 4].
    * [cite_start]Filter dan pencarian untuk laporan lapangan[cite: 4].
    * [cite_start]Manajemen tugas berbasis prioritas[cite: 4].
    * [cite_start]Sidebar navigasi dan fungsionalitas logout[cite: 1].

**C. Dashboard Super User (`SuperUserDashboard`)**
* [cite_start]**Tujuan**: Antarmuka khusus agensi (misalnya, BULOG) untuk pemantauan data[cite: 23].
* **Fitur**:
    * [cite_start]Antarmuka dasar untuk pemantauan data pasokan dan sinkronisasi[cite: 1, 23].
    * [cite_start]Menampilkan laporan khusus agensi[cite: 23].

**D. Dashboard End User (Petugas Lapangan) (`EndUserDashboard`)**
* [cite_start]**Tujuan**: Alat entri data yang dioptimalkan untuk seluler dan efisien bagi petugas di lapangan[cite: 11, 23].
* **Fitur**:
    * [cite_start]Antarmuka sederhana yang dioptimalkan untuk seluler[cite: 1].
    * [cite_start]**Kemampuan Offline**: Pengguna harus dapat memasukkan data tanpa koneksi internet, yang akan disinkronkan secara otomatis saat kembali online[cite: 1, 11].
    * [cite_start]Formulir pelaporan kondisi tanaman dengan pengambilan foto[cite: 1, 2].
    * [cite_start]Pengambilan lokasi GPS secara otomatis saat membuat laporan[cite: 1, 2, 11].
    * [cite_start]Integrasi kamera untuk dokumentasi (hanya izinkan pengambilan dari kamera, bukan galeri)[cite: 1, 2].
    * [cite_start]Melihat dan menyelesaikan tugas yang diberikan oleh Admin Spesialis[cite: 2, 12].
    * [cite_start]Verifikasi distribusi subsidi[cite: 2].

## **7. Implementasi Fitur Lanjutan: 

* [cite_start]**Progressive Web App (PWA)**: Implementasikan PWA dengan service worker dan manifest untuk kemampuan offline dan pemasangan di perangkat[cite: 1, 6].
* [cite_start]**Desain Responsif**: Pastikan aplikasi berfungsi dengan baik di desktop dan perangkat seluler, dengan breakpoint yang sesuai[cite: 1, 6].
* [cite_start]**Penanganan Status**: Implementasikan status loading dan penanganan error yang jelas di seluruh aplikasi[cite: 1].
* [cite_start]**Optimasi Kinerja**: Gunakan lazy loading untuk gambar dan aset untuk memastikan kinerja yang cepat[cite: 5, 6].

Implementasikan fitur **Background Sync API** untuk meningkatkan fungsionalitas offline bagi **End User** (Petugas Lapangan).

* **Tujuan**: Memungkinkan aplikasi mengirim data yang disimpan secara offline ke server secara otomatis di latar belakang saat koneksi internet pulih, tanpa mengharuskan pengguna membuka kembali aplikasi.
* **Alur Implementasi**:
    1.  Saat End User mengirimkan data laporan dalam kondisi offline, tangkap kegagalan koneksi.
    2.  Simpan data laporan tersebut di **KV Storage (IndexedDB)** sisi klien.
    3.  Setelah data disimpan, daftarkan sebuah event `sync` ke **Service Worker**.
    4.  Konfigurasikan Service Worker untuk "mendengarkan" event `sync`. Ketika event ini dipicu oleh browser (saat koneksi kembali stabil), Service Worker harus:
        * Mengambil data yang tersimpan dari IndexedDB.
        * Mengirimkan data tersebut ke endpoint API di server.
        * Setelah berhasil terkirim, hapus data yang sudah disinkronkan dari IndexedDB.
* **Penanganan Fallback**: Untuk browser yang tidak mendukung Background Sync API (seperti Safari di iOS), pastikan sistem memiliki *fallback* yang solid. Data harus tetap tersimpan secara offline, dan sinkronisasi akan dijalankan saat pengguna **membuka kembali aplikasi** saat sudah terhubung ke internet.

**Tujuan Akhir:**
[cite_start]Output akhir harus berupa aplikasi yang berfungsi penuh, profesional, dan siap-deploy yang secara akurat sesuai dengan semua spesifikasi yang diuraikan di atas[cite: 7, 26]. Semua fitur utama harus diimplementasikan dan diuji untuk semua peran pengguna.