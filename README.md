# 🥗 NutriVision AI — Panduan Penggunaan Aplikasi

NutriVision AI adalah aplikasi web pemandu asupan gizi berbasis kecerdasan buatan (*Computer Vision*) yang dirancang untuk membantu pemulihan pasien pasca-operasi, rehabilitasi cedera medis, maupun program kebugaran.

Dokumen ini berisi panduan lengkap langkah demi langkah cara menggunakan seluruh fitur yang tersedia di dalam aplikasi.

---

## 📑 Daftar Isi
1. [Cara Mengakses & Menginstall Aplikasi](#1-cara-mengakses--menginstall-aplikasi)
2. [Langkah Awal: Pengaturan Profil Pasien](#2-langkah-awal-pengaturan-profil-pasien)
3. [Cara Memindai (Scan) & Mengenali Makanan](#3-cara-memindai-scan--mengenali-makanan)
4. [Cara Mengatur Porsi & Mengoreksi Bahan Makanan](#4-cara-mengatur-porsi--mengoreksi-bahan-makanan)
5. [Menggunakan Perencana Menu (Opsi Standar vs Hemat)](#5-menggunakan-perencana-menu-opsi-standar-vs-hemat)
6. [Mengaktifkan Filter Gejala (Symptom-Aware Filter)](#6-mengaktifkan-filter-gejala-symptom-aware-filter)
7. [Mencari Bahan di Katalog Pangan Lokal](#7-mencari-bahan-di-katalog-pangan-lokal)
8. [Melihat Progres & Mengekspor Laporan ke Dokter/Nakes](#8-melihat-progres--mengekspor-laporan-ke-dokternakes)
9. [Membagikan Akses ke Pendamping (Caregiver Portal)](#9-membagikan-akses-ke-pendamping-caregiver-portal)
10. [Berinteraksi di Ruang Komunitas Pemulihan](#10-berinteraksi-di-ruang-komunitas-pemulihan)
11. [Fitur Ramah Lansia & Aksesibilitas](#11-fitur-ramah-lansia--aksesibilitas)

---

## 1. Cara Mengakses & Menginstall Aplikasi

### A. Akses Langsung Melalui Browser
Buka tautan website pada browser di Laptop, Tablet, atau HP Anda:
👉 **[https://syifamojocanggih-hash.github.io/Nutrivision_AI/](https://syifamojocanggih-hash.github.io/Nutrivision_AI/)**

### B. Menginstall ke Layar Utama HP (PWA)
Aplikasi ini dapat diinstall seperti aplikasi native tanpa perlu mendownload dari App Store / Play Store:
* **Pengguna Android (Google Chrome):**
  1. Klik banner **"Install Aplikasi"** di bagian atas layar, atau
  2. Tekan menu titik tiga (⋮) di kanan atas browser 👉 Pilih **"Tambahkan ke Layar Utama" / "Install Aplikasi"**.
* **Pengguna iPhone / iPad (Safari):**
  1. Tekan tombol **Bagikan (Share / ikon kotak panah ke atas)** di bagian bawah Safari.
  2. Gulir ke bawah dan pilih **"Tambah ke Layar Utama" (Add to Home Screen)**.

---

## 2. Langkah Awal: Pengaturan Profil Pasien

Saat pertama kali membuka aplikasi, Anda akan disambut oleh jendela **Profil Pemulihan**:

1. **Nama Lengkap:** Masukkan nama pasien/pengguna.
2. **Kondisi Pemulihan:** Pilih salah satu kondisi:
   * 🏥 **Pasca-Operasi:** Untuk pasien yang baru selesai menjalani operasi pembedahan (target protein tinggi untuk regenerasi jaringan).
   * 🏃‍♂️ **Fisioterapi & Cedera:** Untuk rehabilitasi sendi, ligamen, atau patah tulang.
   * 🏋️ **Gym & Muscle Recovery:** Untuk pemulihan intensitas latihan fisik dan pembentukan massa otot.
3. **Fase Pemulihan & Berat Badan:** Masukkan fase klinis saat ini (contoh: *Minggu ke-2*) dan berat badan dalam kg.
4. **Target Gizi Otomatis:** Sistem akan secara otomatis menghitung kebutuhan protein harian (contoh: 65 kg × 1.5g = **98g Protein/hari**).
5. **Persetujuan Medis:** Centang kotak persetujuan tanggung jawab bersama lalu tekan **"Simpan & Mulai Pemulihan"**.

> 💡 *Catatan: Anda dapat mengubah profil kapan saja dengan menekan kartu nama profil Anda di pojok kanan atas.*

---

## 3. Cara Memindai (Scan) & Mengenali Makanan

NutriVision AI dapat mengenali beberapa jenis bahan makanan dalam satu piring sekaligus secara otomatis.

1. Tekan tombol **"Scan Makanan Baru"** pada kartu utama di Dashboard atau tekan **Ikon Kamera Melayang (FAB)** di kanan bawah layar HP.
2. Pilih metode pengambilan foto:
   * 📷 **Buka Kamera:** Menggunakan kamera langsung dari HP/Laptop untuk memotret piring makanan.
   * 📁 **Unggah Foto:** Memilih foto makanan yang sudah ada di galeri ponsel Anda.
   * ⚡ **Preset Demo:** Memilih contoh hidangan siap saji (*Piring Pemulihan Ikan Gabus*, *Sup Tim Ayam Tahu*, atau *Salmon Bowl*) untuk pengujian cepat.
3. Sistem Computer Vision akan menampilkan **masking visual poligon berwarna** di atas piring dan memecah rincian gizi per bahan.

---

## 4. Cara Mengatur Porsi & Mengoreksi Bahan Makanan

Jika porsi atau bahan yang dikenali sistem belum sesuai dengan piring Anda:

* **Mengubah Berat Porsi (Gram):** Ubah angka pada kotak gram (contoh: dari 120g menjadi 150g). Total protein dan kalori piring akan dihitung ulang secara instan.
* **Menghapus Bahan:** Tekan tombol ikon tempat sampah (**🗑️**) di samping bahan yang tidak ada di piring Anda.
* **Menambah Bahan Tambahan:** Jika ada bahan makanan yang belum terdeteksi, buka menu **Katalog Pangan** dan klik **"+ Tambah ke Piring"**.
* **Simpan Catatan:** Tekan tombol **"Catat Asupan Ini"** di bawah untuk memasukkan makanan ke dalam progres gizi harian Anda.

---

## 5. Menggunakan Perencana Menu (Opsi Standar vs Hemat)

Pada menu **"Rencana Menu"** di navigasi bawah:

1. **Pilih Mode Anggaran:**
   * **Opsi Standar (Optimal):** Rekomendasi menu pemulihan klinis terbaik (contoh: Salmon Panggang, Dada Ayam Kukus, Sup Ikan Gabus).
   * **Opsi Hemat (Low-Budget):** Menu padat gizi berbasis pangan lokal dengan harga sangat terjangkau (contoh: Pepes Ikan Kembung, Tahu Tempe Bacem, Telur Rebus).
2. Setiap kartu menu dilengkapi rincian kandungan protein, estimasi biaya harian, dan label kecocokan klinis (*Kaya Omega-3, Tinggi Albumin, dll.*).

---

## 6. Mengaktifkan Filter Gejala (Symptom-Aware Filter)

Pasien pasca-operasi sering kali mengalami keluhan pencernaan. Anda dapat menyaring rekomendasi makanan berdasarkan gejala yang sedang dirasakan:

1. Buka tab **"Rencana Menu"**.
2. Pada bagian **"Filter Berdasarkan Gejala Klinis"**, klik salah satu atau beberapa gejala:
   * 🌊 **Mual:** Sistem menyarankan makanan berkuah bening hangat, dingin bersuhu ruang, dan non-lemak.
   * 💧 **Sulit Menelan (Disfagia):** Sistem merekomendasikan hidangan bertekstur lunak/halus (bubur saring, telur orak-arik, sup kental).
   * 🛡️ **Konstipasi:** Sistem memprioritaskan makanan kaya serat larut (sup bayam, labu siam, pepaya) dan hidrasi.
   * ✨ **Nafsu Makan Rendah:** Sistem menyarankan porsi kecil padat nutrisi yang sering (*small frequent meals*).
3. Hasil rekomendasi dan panduan tekstur akan langsung muncul di kotak saran.

---

## 7. Mencari Bahan di Katalog Pangan Lokal

1. Tekan tab **"Katalog"** pada navigasi bawah / sidebar.
2. Ketik nama bahan makanan pada kolom pencarian (contoh: `gabus`, `tempe`, `telur`, `bayam`).
3. Anda dapat melihat takaran porsi standar, estimasi harga lokal, dan rentang makronutrisi bahan tersebut.
4. Klik tombol **"+ Tambah ke Piring"** untuk memasukkan bahan tersebut ke piring scan Anda.

---

## 8. Melihat Progres & Mengekspor Laporan ke Dokter/Nakes

1. Buka tab **"Progres"**.
2. **Cincin Target Harian (Macro Ring):** Memperlihatkan persentase target protein yang sudah terpenuhi hari ini beserta saran penyeimbang.
3. **Grafik 7 Hari Terakhir:** Memantau konsistensi dan tren asupan gizi selama seminggu penuh.
4. **Ekspor Laporan Telehealth:** 
   * Tekan tombol **"Salin Ringkasan untuk Dokter"**.
   * Format teks ringkasan medis akan otomatis tersalin ke clipboard. Anda tinggal menempelkannya (*Paste*) ke chat WhatsApp dokter, fisioterapis, atau ahli gizi Anda.

---

## 9. Membagikan Akses ke Pendamping (Caregiver Portal)

Fitur ini memungkinkan keluarga atau perawat memantau asupan makanan pasien dari perangkat mereka sendiri tanpa risiko merusak data:

1. Buka tab **"Pendamping"**.
2. Aktifkan sakelar (*toggle*) pada nama pendamping Anda.
3. Klik tombol **"Salin Tautan Akses"**.
4. Kirimkan tautan tersebut ke WhatsApp keluarga/perawat. Mereka dapat membuka tautan untuk melihat status gizi harian pasien secara *view-only*.

---

## 10. Berinteraksi di Ruang Komunitas Pemulihan

1. Buka tab **"Komunitas"**.
2. **Membaca Tips:** Lihat tips praktis dan menu pemulihan yang dibagikan oleh sesama pasien yang telah diverifikasi oleh sistem dasar.
3. **Memberi Reaksi:** Tekan tombol **Suka (❤️)** atau **Komentar (💬)** untuk saling memberi semangat.
4. **Berbagi Tips Baru:** Tekan tombol **"Tulis Pengalaman"**, tuliskan saran menu atau tips pemulihan Anda, lalu publikasikan.

---

## 11. Fitur Ramah Lansia & Aksesibilitas

Untuk kenyamanan mata pengguna lanjut usia:

* **Mengubah Ukuran Tulisan:** Di bagian bawah bilah navigasi kiri (Desktop) atau pengaturan profil, pilih ukuran huruf:
  * **A** : Ukuran Standar (15px)
  * **A+** : Ukuran Sedang (17px)
  * **A++** : Ukuran Besar (19px)
* **Mode Kontras Tinggi:** Centang opsi kontras tinggi untuk mempertegas garis dan batas kartu dengan latar belakang putih pekat dan teks hitam tegas.

---

## ❓ Pertanyaan yang Sering Diajukan (FAQ)

**Q: Apakah NutriVision AI menggantikan anjuran dokter?**  
A: Tidak. NutriVision AI adalah alat bantu estimasi dan pendukung keputusan (*decision-support tool*). Selalu prioritaskan instruksi khusus dan pantangan makanan yang diberikan oleh dokter yang merawat Anda.

**Q: Apakah aplikasi ini membutuhkan internet terus-menerus?**  
A: Berkat teknologi PWA (*Progressive Web App*), aplikasi tetap dapat dibuka dan digunakan untuk melihat katalog serta rencana menu meskipun koneksi internet sedang terputus.

---

*Selamat menggunakan NutriVision AI untuk mendukung proses pemulihan kesehatan yang lebih cepat dan optimal!* 💚
