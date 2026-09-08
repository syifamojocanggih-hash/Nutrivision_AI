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

---

## 🏃 Cara Menjalankan Server

### 1. Masuk ke direktori server:
```bash
cd server
```

### 2. Jalankan server:
```bash
npm start
```
Atau dengan mode live-reload (*development*):
```bash
npm run dev
```

Server akan aktif di: **`http://localhost:5000`**

---

## 🧪 Menjalankan Automated Test Suite

Untuk memastikan seluruh endpoint berfungsi normal:
```bash
npm test
```
*(Menjalankan 30 test case otomatis meliputi auth, meals, foods, CV, caregiver, community, dan telemetry).*

---

## 🔑 Akun Demo Bawaan (Auto-Seeded)

| Akun | Email | Kata Sandi | Peran |
| :--- | :--- | :--- | :--- |
| **Pasien Pasca-Bedah** | `pasien@nutrivision.id` | `pasien123` | Patient (Siti Rahma - Fase 2 Proliferasi Albumin) |
| **Pasien Fisioterapi** | `ahmad@nutrivision.id` | `ahmad123` | Patient (Ahmad Fauzi - Fase 3 Remodeling) |
| **Dokter Spesialis Gizi** | `hendra@nutrivision.id` | `dokter123` | Doctor (dr. Hendra Kurniawan, Sp.GK) |
| **Super Administrator** | `admin@nutrivision.id` | `admin123` | Admin (dr. Sarah Larasati, M.Kes) |
