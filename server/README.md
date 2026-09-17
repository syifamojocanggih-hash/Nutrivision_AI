# 🚀 NutriVision AI — Backend REST API Server

Server REST API mandiri untuk platform **NutriVision AI — Clinical Recovery Nutrition & Food Segmentation**, dibangun menggunakan **Node.js**, **Express**, dan database **MySQL** (menggunakan connection pool `mysql2/promise`).

---

## ⚙️ Konfigurasi Database MySQL (`.env`)

Konfigurasi database diatur melalui file `server/.env`:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=nutrivision_ai
JWT_SECRET=nutrivision_jwt_secret_key_gayatama5_production_grade_clinical_secure
NODE_ENV=development
```
*Tabel dan database `nutrivision_ai` serta data demo (users, foods, meals, community) akan otomatis dibuat dan di-seed saat server pertama kali dijalankan.*

## 📋 Fitur & Endpoint API

### 1. 🩺 Status & Health Check
* `GET /api/health`: Memeriksa status kesehatan server, port, dan uptime.

### 2. 🔐 Autentikasi & Profil Pasien (`/api/auth`)
* `POST /api/auth/register`: Mendaftarkan akun pasien baru dan menghitung metrik gizi ERAS personal.
* `POST /api/auth/login`: Masuk ke akun dan mendapatkan token JWT.
* `GET /api/auth/me`: Mengambil data profil pasien aktif berdasarkan token.
* `PUT /api/auth/profile`: Memperbarui berat, tinggi, diagnosis, fase ERAS, dan pantangan.

### 3. 🍱 Pencatatan Makanan & Gizi (`/api/meals`)
* `GET /api/meals`: Mengambil riwayat asupan piring makanan pasien.
* `POST /api/meals`: Mencatat hidangan baru (beserta segmen poligon, protein, karbohidrat, dan kalori).
* `DELETE /api/meals/:id`: Menghapus riwayat hidangan makanan.
* `GET /api/meals/weekly-stats`: Agregasi kepatuhan gizi 7 hari (*7-day clinical compliance rate*).

### 4. 🥗 Katalog Pangan Lokal TKPI (`/api/foods`)
* `GET /api/foods`: Mengambil seluruh database pangan Nusantara dengan filter:
  * `?q=gabus` (Pencarian nama atau manfaat)
  * `?category=animal|plant|staple|fruit`
  * `?symptom=dysphagia|nausea|constipation|appetite`
* `GET /api/foods/:id`: Detail spesifikasi nutrisi mikronutrien (albumin, zat besi, zinc, vitamin C).
* `POST /api/foods`: Menambahkan pangan baru (khusus dokter/admin).

### 5. 👁️ Computer Vision & Clinical Intelligence (`/api/cv`)
* `POST /api/cv/analyze`: Menerima upload foto piring makanan (`multipart/form-data`) atau preset, mengembalikan estimasi porsi, masking poligon, dan advice klinis.

### 6. 👥 Portal Pendamping & Telehealth (`/api/caregiver`)
* `POST /api/caregiver/generate-token`: Membuat tautan akses aman terenkripsi untuk keluarga/perawat.
* `GET /api/caregiver/view/:token`: Endpoint *read-only* riwayat pemulihan pasien.

### 7. 💬 Komunitas & Berbagi Resep (`/api/community`)
* `GET /api/community/posts`: Daftar postingan pasien dan praktisi medis.
* `POST /api/community/posts`: Membagikan cerita pemulihan dan resep bergizi.
* `POST /api/community/posts/:id/like`: Menyukai postingan.
* `POST /api/community/posts/:id/comment`: Memberikan komentar dukungan.

### 8. 📊 Telemetri & Jejak Audit (`/api/telemetry`)
* `GET /api/telemetry/stats`: Ringkasan statistik performa aplikasi dan pengguna.
* `GET /api/telemetry/audit-logs`: Riwayat audit trail kejadian sistem.
* `GET /api/telemetry/export-json`: Unduh berkas data audit dalam format JSON.

### 9. 🔔 Smart Notifikasi Klinis (`/api/notifications`)
* `GET /api/notifications`: Mengambil daftar notifikasi aktif beserta penghitung unread badge.
* `PUT /api/notifications/:id/read`: Menandai 1 notifikasi sudah dibaca.
* `PUT /api/notifications/read-all`: Menandai semua notifikasi sudah dibaca.
* `POST /api/notifications/simulate-trigger`: Memicu 4 skenario simulasi:
  * `morning_reminder`: Pengingat target harian (kalori & protein) jam 06:00 WIB.
  * `evening_reminder`: Peringatan jam 18:00 WIB jika total protein hari ini masih defisit beserta rekomendasi menu makan malam tinggi albumin.
  * `price_change`: Info fluktuasi/penurunan harga bahan pangan lokal ramah anggaran.
  * `info`: Berita pembaruan protokol gizi ERAS dari Kemenkes/ESPEN.
* `POST /api/notifications/evaluate-smart`: Evaluasi otomatis kondisi jam dan nutrisi pasien.

### 10. 🧠 Layanan AI Safetensors (`/api/ai`)
Layanan inferensi cerdas berbasis model **DistilBERT Multilingual (`model.safetensors`, 516 MB)** untuk klasifikasi keamanan gizi & kepatuhan klinis pasien:
* `GET /api/ai/health`: Memeriksa status service Python AI (tensors count, latency, model status).
* `POST /api/ai/classify`: Menganalisis teks hidangan makanan/resep komunitas:
  * **Class 0 (`AMAN_TINGGI_GIZI`)**: Kaya albumin & protein, aman bagi pemulihan bedah digestif/luka.
  * **Class 1 (`NETRAL_MODERASI`)**: Gizi seimbang, konsumsi dengan porsi terukur.
  * **Class 2 (`PERINGATAN_PANTANGAN`)**: Makanan tinggi minyak jelantah, iritan lambung, atau kontraindikasi klinis.
  * *Audit Trail*: Setiap inferensi dicatat otomatis ke tabel `audit_logs` di MySQL.

---

## 🏃 Cara Menjalankan Layanan (Full Stack AI)

### 1. Jalankan Python AI Inference Service (Port 5050):
```bash
cd server
python ai_service.py 5050
```
*Menggunakan runtime ultra-cepat `safetensors` + HuggingFace `tokenizers` dengan latensi inferensi < 15ms.*

### 2. Jalankan Node.js Express Backend (Port 5000):
```bash
cd server
npm start
```
Atau dengan mode live-reload (*development*):
```bash
npm run dev
```

Server Express akan aktif di: **`http://localhost:5000`**

---

## 🧪 Menjalankan Automated Test Suite

Untuk memastikan seluruh endpoint (termasuk MySQL dan Python AI Safetensors) berfungsi normal:
```bash
npm test
```
*(Menjalankan 49 test case otomatis meliputi auth, meals, foods, CV, caregiver, community, telemetry, smart notifications, dan Safetensors AI).*

---

## 🔑 Akun Demo Bawaan (Auto-Seeded)

| Akun | Email | Kata Sandi | Peran |
| :--- | :--- | :--- | :--- |
| **Pasien Pasca-Bedah** | `pasien@nutrivision.id` | `pasien123` | Patient (Siti Rahma - Fase 2 Proliferasi Albumin) |
| **Pasien Fisioterapi** | `ahmad@nutrivision.id` | `ahmad123` | Patient (Ahmad Fauzi - Fase 3 Remodeling) |
| **Keluarga Pendamping** | `caregiver@nutrivision.id` | `caregiver123` | Caregiver (Ratna Dewi - Pendamping Pasien) |
| **Super Administrator** | `admin@nutrivision.id` | `admin123` | Admin (Sarah Larasati, M.Kes) |
