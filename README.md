# 🥗 NutriVision AI

> **Platform Segmentasi & Panduan Gizi Makanan Berbasis Computer Vision untuk Pemulihan Pasca-Operasi, Rehabilitasi Medis, dan Gym Recovery**
> 
> *Dikembangkan untuk Kompetisi:* **GAYATAMA 5 — International Web Technology Competition**  
> *Subtema:* **Public Service** | *Tema Besar:* **Innovating for a Sustainable Future: Empowering Communities through Web Technology**

---

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-0F6E56?style=for-the-badge&logo=pwa&logoColor=white)](https://syifamojocanggih-hash.github.io/Nutrivision_AI/)
[![SDG 3](https://img.shields.io/badge/SDG%203-Good%20Health%20%26%20Well--Being-4C9F38?style=for-the-badge)](https://sdgs.un.org/goals/goal3)
[![SDG 9](https://img.shields.io/badge/SDG%209-Industry%20%26%20Innovation-FD6925?style=for-the-badge)](https://sdgs.un.org/goals/goal9)
[![SDG 11](https://img.shields.io/badge/SDG%2011-Sustainable%20Cities-FD9D24?style=for-the-badge)](https://sdgs.un.org/goals/goal11)
[![Design](https://img.shields.io/badge/UI%2FUX-Lucide%20Vector%20Icons-04342C?style=for-the-badge)](https://lucide.dev)

---

## 📌 1. Latar Belakang & Urgensi

Setiap tahun, jutaan orang menjalani operasi medis, fisioterapi rehabilitasi cedera, maupun program pemulihan intensif kebugaran (*gym recovery*). Pada fase-fase kritis ini, **asupan gizi yang tepat memegang peran vital**:
* **Protein berkualitas tinggi** mempercepat regenerasi jaringan, sintesis kolagen, dan penutupan luka.
* **Karbohidrat kompleks & mikronutrien seimbang** menjaga energi terapi dan mencegah hilangnya massa otot (*muscle atrophy*).

Namun, sebagian besar pasien awam mengalami **kebingungan menerjemahkan anjuran umum dokter/ahli gizi** (*"perbanyak protein"*, *"kurangi lemak jenuh"*) ke dalam menu makanan sehari-hari. Di sisi lain, konsultasi ahli gizi secara rutin membutuhkan biaya tinggi dan belum terdistribusi merata di luar fasilitas kesehatan tier-1.

**NutriVision AI hadir sebagai layanan publik digital (public service tool)** yang memanfaatkan teknologi *Computer Vision* untuk melakukan segmentasi detail terhadap foto makanan per-jenis bahan (bukan sekadar mengenali nama hidangan utuh), menampilkan gambaran komposisi gizi dalam bentuk **rentang estimasi (range estimation)**, serta memberikan panduan adaptif sesuai kondisi pemulihan pasien.

```
                  ┌────────────────────────────────────────┐
                  │       📸 Foto Makanan Pengguna         │
                  │   (Kamera WebRTC / Unggah Galeri)      │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │    🤖 Computer Vision Segmentation     │
                  │  (Deteksi Segmen Bahan & Masking)      │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │    📊 Estimasi Rentang Gizi Porsi      │
                  │    (USDA & Basis Data Pangan Lokal)    │
                  └───────────────────┬────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │ 🍽️ Recovery Meal Planner  │             │ 📈 Progress & Telehealth  │
   │  • Opsi Standar (Optimal) │             │  • Kepatuhan Gizi 7 Hari  │
   │  • Opsi Hemat/Low-Budget  │             │  • Portal Pendamping View │
   │  • Symptom-Aware Filter   │             │  • Ruang Komunitas Pasien │
   └───────────────────────────┘             └───────────────────────────┘
```

---

## ✨ 2. Fitur Unggulan (Functional Requirements)

Berdasarkan dokumen spesifikasi **Product Requirements Document (PRD)**, NutriVision AI mengimplementasikan fitur-fitur fungsional secara komprehensif:

| ID | Fitur | Deskripsi | Status |
|---|---|---|:---:|
| **FR-01** | **Web & Mobile Camera Capture** | Pengambilan foto langsung melalui WebRTC Camera API dan unggah berkas (JPEG/PNG) dengan pratinjau instan. | ✅ Ready |
| **FR-02** | **Interactive CV Segmentation** | Pemetaan visual poligon berwarna per-bahan piring makan dengan skor keyakinan model (*Confidence Score %*). | ✅ Ready |
| **FR-03** | **Nutritional Range Estimation** | Estimasi makronutrisi (Kalori, Protein, Karbohidrat, Lemak) disajikan dalam bentuk rentang (*range*), sesuai standar riset ilmiah. | ✅ Ready |
| **FR-04** | **Recovery User Profile** | Personalisasi profil kondisi (*Pasca-Operasi*, *Fisioterapi*, *Gym Recovery*), fase klinis, berat badan, dan deklarasi pantangan/alergi. | ✅ Ready |
| **FR-05** | **Dynamic Recovery Indicators** | Indikator target gizi harian (*Macro Ring*) dengan saran penyeimbang gizi kontekstual otomatis. | ✅ Ready |
| **FR-06** | **Shared Responsibility Consent** | Wizard onboarding dengan persetujuan *disclaimer* medis eksplisit (*Shared Responsibility Model*). | ✅ Ready |
| **FR-07** | **Human-in-the-Loop Correction** | Pengguna dapat mengedit gram porsi, menghapus bahan, atau menambah bahan jika model belum yakin. | ✅ Ready |
| **FR-08** | **Indonesian Food Database** | Katalog gizi bahan pangan lokal Indonesia (ikan gabus, tempe, tahu, bayam, telur, kangkung, dll.) dengan panduan ERAS. | ✅ Ready |
| **FR-09** | **7-Day Compliance Tracking** | Grafik batang tren kepatuhan protein 7 hari, rekapitulasi streak, dan tombol ekspor laporan ke fisioterapis/nakes. | ✅ Ready |
| **FR-10** | **Dual-Mode Meal Planner** | Rekomendasi menu adaptif dengan 2 opsi: **Opsi Standar (Optimal)** & **Opsi Hemat (Low-Budget)** untuk inklusivitas ekonomi. | ✅ Ready |
| **FR-11** | **Symptom-Aware Filter** | Filter menu berbasis gejala pasca-bedah (*Mual*, *Sulit Menelan/Disfagia*, *Konstipasi*, *Nafsu Makan Rendah*). | ✅ Ready |
| **FR-12** | **Portal Pendamping (Caregiver)** | Mode *view-only* untuk keluarga/perawat dengan tautan akses terenkripsi tanpa izin mengubah data medis. | ✅ Ready |
| **FR-13** | **Ruang Komunitas Pemulihan** | Forum berbagi pengalaman antar sesama pasien dengan sistem verifikasi gizi dasar otomatis dan interaksi suka/komentar. | ✅ Ready |

---

## 📱 3. Aksesibilitas & Arsitektur Mobile (PWA)

* **Progressive Web App (PWA):** Dapat diinstall langsung ke layar utama smartphone (*Android / iOS*) dan desktop tanpa perlu toko aplikasi pihak ketiga.
* **Offline-Ready:** Dilengkapi `sw.js` (Service Worker) yang melakukan *pre-caching* aset esensial agar tetap dapat diakses saat koneksi internet tidak stabil.
* **Ergonomi Layar HP:**
  * **Bottom Navigation Bar:** 5 tab akses utama yang mudah dijangkau satu ibu jari.
  * **Floating Action Button (FAB):** Tombol kamera mengambang untuk pemindaian cepat.
  * **Bottom Sheet Modals:** Jendela interaksi meluncur dari bawah layar sesuai standar UX aplikasi modern.
* **Ramah Lansia (Accessibility):** Pengatur ukuran teks instan (**Normal**, **A+**, **A++**) dan **Mode Kontras Tinggi** untuk memudahkan pengguna lansia dan penyandang gangguan penglihatan ringan.
* **Desain Ikon Vektor:** Menggunakan **Lucide Icons** (standar Figma & Iconify) dengan ketebalan garis 2px yang presisi dan tajam di layar Retina/OLED.

---

## 🛠️ 4. Tumpukan Teknologi (Tech Stack)

* **Frontend:** HTML5 Semantik, CSS3 (Custom Design System, Modern Squircle Tokens, Glassmorphism), Vanilla JavaScript (Modular ES6).
* **Typography:** `Fraunces` (Editorial Serif untuk Branding) + `Inter` (UI Sans-Serif).
* **Vector Icons:** [Lucide Icons](https://lucide.dev) (Standard Figma / Iconify).
* **PWA Engine:** Web App Manifest (`manifest.json`), Cache API, Service Worker (`sw.js`).
* **Hardware Integration:** MediaDevices API / WebRTC untuk kamera langsung, File API untuk unggah gambar.
* **Computer Vision Simulator:** HTML5 Canvas Multi-Polygon Segmentation Renderer & Range Estimator.
* **Data Storage:** LocalStorage Persistence untuk profil, riwayat gizi, dan postingan komunitas.

---

## 🚀 5. Cara Menjalankan & Menguji Aplikasi

### Opsi A: Mengakses Langsung (Online)
Buka tautan GitHub Pages yang telah aktif:
👉 **[https://syifamojocanggih-hash.github.io/Nutrivision_AI/](https://syifamojocanggih-hash.github.io/Nutrivision_AI/)**

---

### Opsi B: Menjalankan di Komputer Lokal

1. **Clone repositori:**
   ```bash
   git clone https://github.com/syifamojocanggih-hash/Nutrivision_AI.git
   cd Nutrivision_AI
   ```

2. **Jalankan web server lokal:**
   * **Menggunakan Python:**
     ```bash
     python -m http.server 8080
     ```
   * **Menggunakan Node.js:**
     ```bash
     npx serve . -p 8080
     ```

3. **Buka di Browser:**
   * Di Laptop: Buka `http://localhost:8080/index.html`
   * Di HP (Wi-Fi sama): Buka `http://[IP_LAPTOP]:8080/index.html`

4. **Simulasi Layar HP di Laptop:**
   * Buka browser 👉 Tekan `F12` 👉 Tekan `Ctrl + Shift + M` (Toggle Device Toolbar) 👉 Pilih *iPhone 14* atau *Samsung Galaxy*.

---

## 📁 6. Struktur Direktori Proyek

```
Nutrivision_AI/
├── index.html                 # PWA Entry Point & SPA Views
├── NutriVision_AI_Dashboard.html # Forwarder redirect ke index.html
├── manifest.json              # Web App Manifest PWA
├── sw.js                      # Service Worker (Offline Cache & Lifecycle)
├── README.md                  # Dokumentasi Resmi Proyek
├── .gitignore                 # Konfigurasi Git Ignore
├── css/
│   └── styles.css             # Design System, Tokens, Squircle, Mobile Responsive
├── js/
│   ├── app.js                 # State Manager, Router, Modals & Onboarding
│   ├── data.js                # Database Pangan Lokal, Preset Scan & Pedoman ERAS
│   ├── cv-engine.js           # Engine Segmentasi Canvas Poligon & Estimasi Rentang Gizi
│   ├── camera.js              # WebRTC Camera Handler & File Reader
│   ├── planner.js             # Dual-Mode Planner (Standar vs Hemat) & Filter Gejala
│   ├── progress.js            # Grafik Tren Kepatuhan Mingguan & Donut Target Gizi
│   ├── community.js           # Ruang Komunitas, Verifikasi Gizi Dasar, Suka & Komentar
│   └── caregiver.js           # Portal Pendamping (Akses Lihat-Saja & Token Link)
└── icons/
    ├── icon.svg               # Master Vector SVG Icon
    ├── icon-192.png           # PWA Icon 192x192
    └── icon-512.png           # PWA Icon 512x512
```

---

## 🌍 7. Keterkaitan dengan SDGs & Dampak Sosial

1. **SDG 3 — Good Health and Well-Being:**
   Membantu mempercepat pemulihan klinis pasien pasca-operasi dan rehabilitasi melalui panduan gizi terukur yang mudah dipahami, menurunkan risiko komplikasi, infeksi luka, dan malnutrisi.
2. **SDG 9 — Industry, Innovation, and Infrastructure:**
   Menerapkan inovasi *Computer Vision* dan *Progressive Web App* sebagai infrastruktur kesehatan digital yang ringan, inklusif, dan dapat diakses dari perangkat berdaya komputasi rendah.
3. **SDG 11 — Sustainable Cities and Communities:**
   Menyediakan opsi menu gizi hemat (*low-budget*) berbasis bahan pangan lokal Indonesia agar layanan kesehatan bermutu dapat diakses oleh seluruh lapisan ekonomi masyarakat secara berkelanjutan.

---

## 📚 8. Referensi Ilmiah

* **Ang, K. Y. H., Stringer, G., Collins, J., & Barker, L. A. (2026).** *Patient Experiences of Nutrition in Enhanced Recovery After Colorectal Surgery: A Systematic Review.* Nutrients, MDPI.
* **Encompass Health.** *Healing Foods: What to Eat Pre- and Post-Surgery.*
* **Human Performance Resource Center (HPRC).** *Nutritional Considerations and Strategies to Facilitate Injury Recovery and Rehabilitation.*
* **Frontiers in Nutrition (2024).** *Visual Nutrition Analysis: Leveraging Segmentation and Regression for Food Nutrient Estimation.*
* **PMC12026278 (2024).** *Lightweight DeepLabv3+ for Semantic Food Segmentation on Edge Devices.*
* **Asian Journal of Research in Computer Science (2025).** *Estimating Nutritional Composition from Food Volume via Deep Learning-Based Depth and Segmentation Models (FoodSAM).*

---

## ⚖️ 9. Penafian Medis (Medical Disclaimer)

NutriVision AI dirancang sebagai **alat bantu pendukung keputusan (decision-support tool)** berbasis estimasi kecerdasan buatan. Sistem ini **bukan pengganti diagnosis, pengobatan, atau instruksi medis langsung** dari dokter atau ahli gizi berlisensi. Tanggung jawab pemilihan asupan dan deklarasi pantangan makanan berada pada pengguna dan/atau tenaga medis pendamping.

---

## 📄 Lisensi & Hak Cipta

Dibuat dengan ❤️ untuk **Gayatama 5 — International Web Technology Competition**.  
© 2026 **NutriVision AI Team**. All rights reserved.
