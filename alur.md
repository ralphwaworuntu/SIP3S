# Alur Proses Bhabinkamtibmas

Dokumen ini merangkum alur kerja Bhabinkamtibmas di aplikasi SIP3S mulai dari masuk ke sistem, menerima penugasan, hingga menyampaikan laporan akhir. Penjelasan disusun berurutan sesuai perjalanan nyata petugas di lapangan.

## 1. Akses Awal & Persiapan
1. **Login** menggunakan akun Bhabinkamtibmas (email kedinasan).  
2. Setelah masuk, petugas langsung melihat dashboard berisi:  
   - Dropdown _“Wilayah kerja aktif”_ berisi assignment yang ditetapkan Admin Polres.  
   - Ringkasan tugas yang masih terbuka, status perangkat (online/offline), dan statistik singkat.
3. Petugas memilih wilayah aktif jika menangani lebih dari satu area. Pilihan ini akan menjadi konteks pada seluruh formulir berikutnya.

## 2. Menerima & Menyelesaikan Penugasan
1. **Pembuatan Tugas oleh Admin**  
   - Admin Polres membuat tugas lapangan melalui dialog _“Buat tugas lapangan”_.  
   - Wilayah ditentukan via dropdown (pencarian kelurahan/desa).  
   - Sistem otomatis menambahkan email Bhabin yang bertugas di wilayah tersebut ke daftar penerima tugas.
2. **Notifikasi pada Dashboard Bhabin**  
   - Tugas baru masuk ke daftar “Tugas prioritas Bhabinkamtibmas”.  
   - Bhabin dapat melihat detail, batas waktu, prioritas, serta apakah tugas bersifat kolaboratif (melibatkan PPL/petugas lapangan).
3. **Pembaruan Status oleh Admin**  
   - Admin dapat menandai tugas sebagai _Review_ atau _Approve_.  
   - Status ini langsung tercermin pada kartu tugas Bhabin.

## 3. Verifikasi Penyaluran Produk Subsidi
1. Bhabin membuka tab **“Verifikasi Penyaluran”**.  
2. Alur verifikasi:
   - Pilih petani penerima lewat dropdown dengan pencarian (Nama/NIK/wilayah).  
   - Ambil foto bukti penerimaan melalui kamera (hanya dari kamera, tidak dari galeri).  
   - Ambil koordinat GPS lokasi distribusi.  
   - Pilih jenis produk subsidi (_Benih_ atau _Pupuk_) dan lengkapi rincian (mis. jenis benih, volume NPK/Urea).  
   - Tambahkan catatan lapangan (opsional).  
3. Jika perangkat offline, data disimpan di IndexedDB & akan terkirim melalui Background Sync ketika koneksi kembali.
4. Setelah submit, status penerima berubah menjadi “verified” dan masuk riwayat verifikasi.

## 4. Pemantauan Perkembangan Tanaman
1. Bhabin pindah ke tab **“Perkembangan Tanaman”**.  
2. Langkah pengisian:
   - Pilih petani penerima (dropdown + detail profil).  
   - Pilih fase tanam (_Pembersihan Lahan_, _Pemupukan_, dst).  
   - Sistem menampilkan input tambahan sesuai fase (contoh: `Pemupukan` → jumlah pupuk yang digunakan).  
   - Ambil foto kondisi tanaman & koordinat lokasi.  
   - Tulis catatan lapangan (minimal 5 karakter) dan set kondisi (_Baik/Waspada/Kritikal_).  
3. Laporan tersimpan dan ditampilkan di riwayat berikut dengan bukti foto dan koordinat. Fitur offline & background sync juga berlaku di sini.

## 5. Verifikasi Hasil Panen
1. Pada tab **“Verifikasi Hasil Panen”**, Bhabin memastikan hasil panen sesuai target:  
   - Pilih petani penerima.  
   - Isi data luas panen (ha), total produksi (ton), dan lokasi penyimpanan/penjualan.  
   - Ambil dokumentasi foto & titik GPS.  
   - Pilih jenis produk subsidi terkait bila ingin mengaitkan dengan paket bantuan yang diterima.
2. Setelah submit, data tampil pada riwayat panen dan digunakan admin untuk melihat akumulasi hasil panen keseluruhan.

## 6. Permintaan Pengawalan Panen
1. Tab **“Permintaan Pengawalan”** digunakan ketika diperlukan dukungan keamanan saat panen raya:  
   - Isi wilayah, jadwal, titik kumpul, estimasi peserta, serta jumlah personel yang dibutuhkan.  
   - Tambahkan catatan koordinasi apabila diperlukan.
2. Permintaan terkirim ke Admin Polres dan akan muncul di antrian mereka untuk ditindaklanjuti (menetapkan personel atau jadwal pengawalan).

## 7. Penanganan Offline & Sinkronisasi
1. Setiap formulir (Verifikasi Penyaluran, Perkembangan Tanaman, Verifikasi Panen) mendukung mode offline.  
2. Data disimpan sementara ke IndexedDB, ditandai sebagai “pending”, dan otomatis disinkronkan menggunakan Background Sync saat koneksi pulih.  
3. Pengguna dapat memperbarui lokasi atau foto jika diperlukan sebelum kirim ulang.

## 8. Selesai & Pelaporan Akhir
1. Setelah tugas diselesaikan (tugas status “selesai” atau laporan terkirim), Bhabin dapat melihat rangkuman di dashboard Bhabin maupun statistik agregat di Admin.  
2. Admin memiliki tombol “Approve” dan “Review” pada antrian laporan untuk memastikan semua bukti lapangan valid sebelum ditutup.  
3. Untuk keperluan pemeliharaan, dashboard admin menyediakan tombol **“Bersihkan Cache”** yang akan menghapus service worker, cache offline, dan data lokal sebelum memuat ulang aplikasi.

---
Dokumen ini dapat diperbarui seiring penambahan fitur baru atau perubahan prosedur lapangan. Pastikan petugas memahami setiap langkah untuk menjaga konsistensi laporan dan koordinasi antar instansi. 
