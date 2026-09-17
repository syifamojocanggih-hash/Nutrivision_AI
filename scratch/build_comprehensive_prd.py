# -*- coding: utf-8 -*-
"""
Script to build the ultra-comprehensive NutriVision AI PRD v2.0
Covering ALL 16 real features from the codebase:
- Recovery Journey Roadmap 3-Conditions (Post-Surgery ERAS 90-Day, Rehab, Gym)
- Dual-Month Consecutive Clinical Calendar & Schedule Suite
- Scan to Daily Intake Accumulation & Confirmation Modal
- Today's Meal Intake Drawer & History List
- Dual-Mode Meal Planner (Optimal vs Low-Budget)
- Smart Food Budgeting & Grocery Shopping List Modal (7-30 Days)
- Regional Commodity Price Disparity Engine (38 Indonesian Provinces - Bapanas/BPS)
- Symptom-Aware Texture & Cooking Method Filter (WCAG AAA)
- Telehealth 1-Click PDF Medical Document Export (A4) with Double Signatures
- Caregiver View-Only Portal with Encrypted Tokens
- Community Recovery Room with DistilBERT Safetensors AI Safety Screening
- Smart Clinical Notifications Engine (Morning, 18:00 Albumin Deficit, Prices, ERAS)
- Live AI Model Tester Modal in Navbar (Real-time latency <15ms)
- Super Admin Medical Portal & Audit Trail Explorer (Users, Scans, Audit Logs, AI params, JSON Export)
- Indonesian Superfoods Encyclopedia (TKPI Kemenkes - Channa striata albumin) & Favorites
- WCAG 2.1 AAA Accessibility, 3-Level Font Scaler (A/A+/A++), Bilingual ID/EN, and PWA Offline-First
"""

import os
import sys
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith('shd'):
            tcPr.remove(child)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}" w:val="clear"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="D0D7DE", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_comprehensive_prd(output_path):
    doc = docx.Document()

    # Page Margins (0.75 in / 54 pt)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Color Palette
    COLOR_NAVY = RGBColor(0x12, 0x25, 0x6B)
    COLOR_BLUE = RGBColor(0x1F, 0x6F, 0xEB)
    COLOR_BODY = RGBColor(0x22, 0x22, 0x22)
    COLOR_MUTED = RGBColor(0x55, 0x55, 0x55)
    HEX_HEADER_BG = "12256B"
    HEX_ROW_ALT = "F8FAFC"

    def add_p(text="", style=None, space_before=0, space_after=5, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT):
        p = doc.add_paragraph(text, style=style)
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        return p

    def add_run(p, text, size=10.5, bold=False, italic=False, color=COLOR_BODY, font_name="Segoe UI"):
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.size = Pt(size)
        run.font.color.rgb = color
        run.font.name = font_name
        return run

    def add_h1(text):
        p = add_p(space_before=14, space_after=4)
        add_run(p, text, size=15, bold=True, color=COLOR_NAVY)
        return p

    def add_h2(text):
        p = add_p(space_before=10, space_after=3)
        add_run(p, text, size=12, bold=True, color=COLOR_BLUE)
        return p

    def add_h3(text):
        p = add_p(space_before=7, space_after=2)
        add_run(p, text, size=11, bold=True, color=COLOR_NAVY)
        return p

    def add_body(text, bold_prefix=None):
        p = add_p(space_before=0, space_after=5)
        if bold_prefix:
            add_run(p, bold_prefix, size=10.5, bold=True, color=COLOR_BODY)
        add_run(p, text, size=10.5, color=COLOR_BODY)
        return p

    def add_bullet(text, bold_prefix=None):
        p = add_p(style='List Paragraph', space_before=0, space_after=3)
        add_run(p, "• ", size=10.5, bold=True, color=COLOR_BLUE)
        if bold_prefix:
            add_run(p, bold_prefix, size=10.5, bold=True, color=COLOR_BODY)
        add_run(p, text, size=10.5, color=COLOR_BODY)
        return p

    def format_table(table, col_widths=None, header_bg=HEX_HEADER_BG):
        set_table_borders(table, color="D0D7DE", sz="4", val="single")
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        # Header Row
        for cell in table.rows[0].cells:
            set_cell_shading(cell, header_bg)
            set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                for run in p.runs:
                    run.font.bold = True
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                    run.font.name = "Segoe UI"
        # Data Rows
        for r_idx in range(1, len(table.rows)):
            row = table.rows[r_idx]
            bg = HEX_ROW_ALT if (r_idx % 2 == 1) else "FFFFFF"
            for cell in row.cells:
                if bg != "FFFFFF":
                    set_cell_shading(cell, bg)
                set_cell_margins(cell, top=100, bottom=100, left=160, right=160)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(0)
                    p.paragraph_format.space_after = Pt(0)
                    for run in p.runs:
                        run.font.size = Pt(9.5)
                        run.font.color.rgb = COLOR_BODY
                        run.font.name = "Segoe UI"
        if col_widths:
            for row in table.rows:
                for idx, width in enumerate(col_widths):
                    row.cells[idx].width = Inches(width)

    # ==========================================
    # HEADER / COVER
    # ==========================================
    p_comp = add_p(space_before=4, space_after=1)
    add_run(p_comp, "GAYATAMA 5 — INTERNATIONAL WEB TECHNOLOGY COMPETITION", size=10, bold=True, color=COLOR_BLUE)

    p_subtema = add_p(space_before=0, space_after=8)
    add_run(p_subtema, "Subtema: Public Service | Kategori: Clinical AI Decision Support System (CDSS) & Telehealth Web Application", size=10, color=COLOR_MUTED)

    p_title = add_p(space_before=4, space_after=2)
    add_run(p_title, "NutriVision AI", size=28, bold=True, color=COLOR_NAVY)

    p_prd = add_p(space_before=0, space_after=3)
    add_run(p_prd, "Product Requirements Document (PRD) — Versi 2.0 (Spesifikasi Produk & Implementasi Nyata)", size=14, bold=True, color=COLOR_BLUE)

    p_tagline = add_p(space_before=0, space_after=12)
    add_run(p_tagline, "Platform Nutrisi Presisi Klinis Berbasis AI & Telehealth Pemulihan Pasca-Operasi (ERAS), Rehabilitasi Medis, dan Pemulihan Geriatri Nusantara", size=11, italic=True, color=COLOR_BODY)

    # ==========================================
    # TABEL 0: METADATA DOKUMEN
    # ==========================================
    t0_data = [
        ["Item", "Keterangan Spesifikasi"],
        ["Nama Produk", "NutriVision AI — Clinical Recovery Nutrition & Food Plate Segmentation"],
        ["Versi Dokumen", "2.0 (Dokumen Spesifikasi Produk & Implementasi Nyata)"],
        ["Tanggal Terbit / Pembaruan", "September 2026"],
        ["Kompetisi & Jalur", "Gayatama 5 — International Web Technology Competition"],
        ["Subtema Kompetisi", "Public Service (Layanan Publik Berkelanjutan)"],
        ["Tema Besar", "Innovating for a Sustainable Future: Empowering Communities through Web Technology"],
        ["SDGs Terkait", "SDG 3 (Good Health & Well-Being), SDG 9 (Industry, Innovation & Infrastructure), SDG 11 (Sustainable Cities & Communities)"],
        ["Status Implementasi", "Production Ready (PWA Offline-First + Node.js REST API + MySQL + Python Safetensors AI Microservice)"],
        ["Tautan Demo Langsung", "https://syifamojocanggih-hash.github.io/Nutrivision_AI/"],
        ["Layanan API & AI Lokal", "REST API: http://localhost:5000 | Python AI Service: http://localhost:5050 (DistilBERT Safetensors, 516 MB)"]
    ]
    t0 = doc.add_table(rows=len(t0_data), cols=2)
    for r_idx, row in enumerate(t0_data):
        for c_idx, val in enumerate(row):
            t0.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    format_table(t0, col_widths=[2.1, 4.9])
    add_p(space_before=6, space_after=6)

    # ==========================================
    # BAB 1: LATAR BELAKANG & RINGKASAN EKSEKUTIF
    # ==========================================
    add_h1("1. Latar Belakang & Ringkasan Eksekutif")
    add_body(
        "Setiap tahun, ratusan ribu pasien di Indonesia menjalani tindakan pembedahan (operasi laparoskopi, bedah digestif, caesar/sectio caesarea, ortopedi/trauma), "
        "rehabilitasi medis intensif pasca-cedera sendi dan ligamen (fisioterapi), serta pemulihan kebugaran geriatri. Pada seluruh tahapan klinis ini, asupan gizi presisi memegang peran kunci: "
        "pasokan protein berkualitas tinggi dan albumin secara langsung menggerakkan proliferasi fibroblas, sintesis kolagen baru, penutupan luka insisi bedah, dan angiogenesis jaringan. "
        "Sebaliknya, defisit makronutrisi memicu katabolisme otot rangka (sarkopenia akut), memperpanjang fase inflamasi luka, meningkatkan risiko dehisensi luka operasi, serta memicu infeksi sekunder."
    )
    add_body(
        "Dalam perkembangan kedokteran modern, protokol ERAS (Enhanced Recovery After Surgery) telah menjadi pedoman standar emas global. ERAS mewajibkan pemberian nutrisi oral seawal mungkin "
        "(early oral feeding) dengan target protein tinggi (1.2–2.0 g/kgBB/hari) untuk memangkas lama rawat inap (length of stay/LOS) hingga 30% dan menekan komplikasi bedah. "
        "Namun, di lapangan terjadi kesenjangan besar (gap pelayanan publik): pasien rawat jalan dan keluarga pendamping (caregiver) tidak memiliki latar belakang gizi klinis. "
        "Mereka kebingungan menerjemahkan anjuran medis dokter (\"perbanyak protein dan albumin\") ke porsi makanan nyata sehari-hari dari bahan pangan lokal yang tersedia di pasar tradisional terdekat."
    )
    add_body(
        "Di sisi lain, konsultasi tatap muka rutin dengan Dokter Spesialis Gizi Klinis (Sp.GK) atau dietisien berlisensi masih sangat terbatas di kota-kota besar dan berbiaya tinggi. "
        "NutriVision AI hadir sebagai solusi pelayanan publik digital (CDSS) berbasis web PWA mandiri yang memadukan Computer Vision piring multi-segmen instan, "
        "klasifikasi keamanan gizi berbasis model transformer (DistilBERT Multilingual Safetensors), basis data pangan lokal Nusantara kaya albumin (TKPI), "
        "perencana menu dan anggaran berbiaya riil disparitas harga 38 provinsi (Bapanas & BPS), Garis Waktu Pemulihan (Recovery Journey Roadmap), "
        "Kalender Klinis Dwibulan, serta ekspor berkas rekam medis resmi (PDF Telehealth) satu klik bertanda tangan nakes."
    )

    # ==========================================
    # BAB 2: RUMUSAN MASALAH & LANDASAN RISET
    # ==========================================
    add_h1("2. Rumusan Masalah & Landasan Riset Klinis/Teknis")
    add_h2("2.1 Masalah yang Diangkat")
    add_bullet(
        "Pasien pasca-operasi sering mengalami hipoalbuminemia akut (<3.5 g/dL) akibat respons katabolik stres bedah. Tanpa suplementasi albumin dan asam amino esensial yang memadai, "
        "penutupan luka melambat dan risiko komplikasi dehisensi luka insisi meningkat drastis.",
        bold_prefix="Defisit Albumin & Malnutrisi Akut Pasca-Bedah: "
    )
    add_bullet(
        "Instruksi kepulangan dari rumah sakit bersifat tekstual umum tanpa rincian takaran gram piring lokal, sehingga pasien kerap salah memilih makanan "
        "(misalnya mengonsumsi gorengan berlemak jenuh yang memicu iritasi lambung pasca-anestesi atau menghindari lauk berprotein karena mitos pantangan keliru).",
        bold_prefix="Hambatan Translasi Gizi Klinis ke Piring Harian: "
    )
    add_bullet(
        "Aplikasi pelacak kalori komersial yang beredar saat ini hanya mengenali nama hidangan utuh ala barat (seperti pizza, pasta, burger) tanpa kemampuan menyekat komponen bahan, "
        "tidak memiliki basis data pangan lokal Indonesia (seperti sup ikan gabus, pepes tahu, sayur bening bayam), dan tidak dirancang untuk protokol pemulihan jaringan klinis.",
        bold_prefix="Keterbatasan Aplikasi Komersial Konvensional: "
    )
    add_bullet(
        "Pasien berpenghasilan rendah tidak mampu membeli suplemen albumin farmasi impor yang mahal (mencapai ratusan ribu rupiah per sachet). "
        "Dibutuhkan perencana menu berbasis pangan super lokal berbiaya murah (low-budget) yang terbukti kaya albumin dan terkalibrasi dengan disparitas harga pasar di daerah domisili pasien.",
        bold_prefix="Disparitas Biaya & Ketahanan Pangan Lokal: "
    )
    add_bullet(
        "Keluarga (caregiver) dan dokter kesulitan memantau kepatuhan nutrisi pasien secara kontinu setelah pulang ke rumah, karena ketiadaan berkas laporan medis terstruktur "
        "yang dapat diekspor, diverifikasi, dan ditandatangani secara sah.",
        bold_prefix="Ketiadaan Kanal Pemantauan Telehealth Terstruktur: "
    )

    add_h2("2.2 Bukti dari Riset Klinis & Jurnal Terindeks")
    add_bullet(
        "Menegaskan pentingnya intervensi nutrisi oral sedini mungkin dengan target protein 1.5–2.0 g/kgBB/hari untuk menurunkan morbiditas bedah, mempercepat pemulihan motilitas usus, "
        "dan mencegah hilangnya massa otot rangka pasien.",
        bold_prefix="Protokol Bedah ERAS & Pedoman ESPEN (Clinical Nutrition in Surgery, 2021): "
    )
    add_bullet(
        "Menemukan bahwa asupan oral pasca-operasi sering terhambat oleh mual pasca-anestesi, disfagia ringan, dan kebingungan memilih menu makanan rumah, "
        "sehingga menegaskan perlunya sistem pendukung keputusan visual yang adaptif terhadap keluhan fisik pasien.",
        bold_prefix="Tinjauan Sistematis Pengalaman Pasien ERAS (Ang et al., MDPI Nutrients, 2026): "
    )
    add_bullet(
        "Uji klinis menunjukkan konsumsi ekstrak Ikan Gabus (Channa striata) kaya albumin (mencapai 2.17g albumin per 100g daging) dan mineral zinc secara signifikan "
        "meningkatkan kadar albumin serum dan mempercepat penutupan luka insisi bedah hingga 2 kali lebih cepat dibanding kelompok plasebo.",
        bold_prefix="Efektivitas Pangan Lokal Ikan Gabus (Channa striata) terhadap Kadar Albumin Serum: "
    )
    add_bullet(
        "Membuktikan bahwa segmentasi berbasis piksel/poligon dari citra piring mampu memperkirakan volume dan makronutrisi bahan pangan secara lebih presisi dibanding klasifikasi hidangan utuh.",
        bold_prefix="Computer Vision Multi-Segmentasi untuk Analisis Pangan (Frontiers in Nutrition, 2024): "
    )
    add_bullet(
        "Model transformator bahasa terkompresi mampu melakukan klasifikasi semantik keamanan klinis teks resep dan hidangan dengan akurasi tinggi (>95%) dan latensi eksekusi sangat rendah (<15 ms) "
        "menggunakan runtime CPU lokal tanpa membutuhkan GPU besar.",
        bold_prefix="Inferensi Cerdas NLP Ringan via DistilBERT & Safetensors (HuggingFace, 2024): "
    )

    # ==========================================
    # BAB 3: TUJUAN PRODUK
    # ==========================================
    add_h1("3. Tujuan Produk")
    add_bullet("Menyediakan alat bantu keputusan klinis (CDSS) berbasis web PWA mandiri yang mampu melakukan segmentasi citra makanan piring secara multi-segmen poligon dan mengestimasi gramatur makronutrisi (Protein, Karbohidrat, Lemak, Kalori) secara instan.", bold_prefix="Segmentasi Piring Multi-Bahan: ")
    add_bullet("Menghitung target makronutrisi personal berdasarkan protokol ERAS, berat badan, tinggi badan, jenis kondisi (pasca-bedah, fisioterapi, geriatri), dan fase penyembuhan (Fase 1 Akut, Fase 2 Proliferasi Albumin, Fase 3 Remodeling).", bold_prefix="Personalisasi Target ERAS: ")
    add_bullet("Menyediakan perencana menu dwimode (Opsi Optimal vs Opsi Low-Budget) yang terintegrasi dengan disparitas harga pangan komoditas riil di 38 provinsi Indonesia berdasarkan data Bapanas dan BPS.", bold_prefix="Inklusivitas Biaya Pangan Lokal: ")
    add_bullet("Menyediakan Garis Waktu Pemulihan (Recovery Journey Roadmap) 90-hari dan Kalender Klinis Dwibulan interaktif dengan panel jadwal nutrisi, pantangan makanan per fase, dan ringkasan validasi klinis.", bold_prefix="Navigasi Garis Waktu & Kalender Klinis: ")
    add_bullet("Memfasilitasi pemantauan telehealth melalui Ekspor Laporan Rekam Medis PDF resmi (standar A4) 1-klik, lengkap dengan tabel kepatuhan 7 hari, riwayat gejala, dan kolom tanda tangan nakes/caregiver.", bold_prefix="Konektivitas Telehealth Terverifikasi: ")
    add_bullet("Mengedepankan inklusivitas publik dengan kepatuhan penuh standar aksesibilitas WCAG 2.1 AAA, pembesar font ramah lansia 3-tingkat (A, A+, A++), serta kapabilitas 100% Offline-First.", bold_prefix="Aksesibilitas & Keadilan Layanan Publik: ")

    # ==========================================
    # BAB 4: TARGET PENGGUNA & PERSONA
    # ==========================================
    add_h1("4. Target Pengguna & Persona")
    add_body("NutriVision AI dirancang untuk empat kelompok persona pengguna utama dengan kebutuhan klinis dan skenario nyata:")

    t1_data = [
        ["Persona", "Kebutuhan Klinis Utama", "Contoh Skenario Nyata pada Aplikasi"],
        [
            "Pasien Pasca-Bedah (ERAS: Digestif, Laparoskopi, Ortopedi, Sectio Caesarea)",
            "Asupan protein tinggi (1.5 g/kgBB/hari), makanan kaya albumin untuk penutupan luka insisi, makanan bertekstur lunak, dan bebas lemak trans pemicu mual.",
            "Ibu Siti (45 thn) pasca-operasi laparoskopi kantung empedu. Memotret piring sarapan, sistem mendeteksi Sup Ikan Gabus dan Tahu Kukus, cincin protein terisi 32g dari target 98g/hari."
        ],
        [
            "Pasien Rehabilitasi Medis & Fisioterapi (Cedera ACL, Fraktur, Pasca-Stroke)",
            "Pasokan asam amino esensial (BCAA) dan kolagen untuk regenerasi ligamen/tendon, serta kecukupan kalori untuk sesi latihan fisik tanpa penumpukan lemak berlebih.",
            "Pak Ahmad (32 thn) dalam pemulihan rekonstruksi ligamen ACL. Memeriksa menu makan siang untuk memastikan asupan dada ayam dan tempe cukup mendukung latihan beban."
        ],
        [
            "Pasien Geriatri / Lansia dalam Pemulihan & Eldercare",
            "Tekstur makanan yang disesuaikan dengan kemampuan mengunyah/menelan (disfagia), tampilan teks sangat besar berkontras tinggi (WCAG AAA), dan panduan makanan pencegah konstipasi.",
            "Opa Subroto (68 thn) dengan refleks menelan menurun. Keluarga mengaktifkan Filter Disfagia (menu berganti ke bubur tim saring) dan Font Size A++ (19.5px) agar mudah terbaca."
        ],
        [
            "Pendamping Pasien (Caregiver) & Tenaga Medis (Sp.GK / Fisioterapis)",
            "Akses pantau jarak jauh (view-only) tanpa risiko merusak data pasien, serta rekapitulasi data kepatuhan 7 hari dalam berkas PDF formal untuk sesi konsultasi rawat jalan.",
            "Ners Dewi (perawat homecare) membuka tautan token Caregiver dari WhatsApp, mengevaluasi rata-rata kepatuhan 92%, dan mengunduh berkas PDF rekam medis untuk ditandatangani dokter penanggung jawab."
        ]
    ]
    t1 = doc.add_table(rows=len(t1_data), cols=3)
    for r_idx, row in enumerate(t1_data):
        for c_idx, val in enumerate(row):
            t1.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    format_table(t1, col_widths=[1.8, 2.5, 2.7])
    add_p(space_before=6, space_after=6)

    # ==========================================
    # BAB 5: RUANG LINGKUP PRODUK
    # ==========================================
    add_h1("5. Ruang Lingkup Produk")
    add_h2("5.1 Termasuk dalam Cakupan (In-Scope — Telah Terpasang & Beroperasi)")
    add_bullet("PWA Responsif & Offline-First: Berjalan mulus di mobile dan desktop, dapat diinstal ke homescreen tanpa app store, dilengkapi Service Worker caching aset offline.", bold_prefix="Frontend & PWA: ")
    add_bullet("Dual-Pipeline Computer Vision: Segmentasi kanvas visual interaktif client-side (poligon warna per makro) dan endpoint server Node.js POST /api/cv/analyze.", bold_prefix="Computer Vision Piring Makanan: ")
    add_bullet("Integrasi Scan ke Gizi Harian: Modal konfirmasi pemilihan slot makan (Sarapan, Siang, Malam, Camilan) dan porsi (1x, 1.5x, 2x) untuk memperbarui cincin asupan harian.", bold_prefix="Alur Tambah ke Asupan Harian: ")
    add_bullet("Riwayat Makan Hari Ini: Drawer / Log makan harian yang mencatat daftar menu yang dikonsumsi, total kalori/protein per jam makan, dan opsi hapus riwayat.", bold_prefix="Riwayat Asupan Harian: ")
    add_bullet("Recovery Journey Roadmap 3-Kondisi: Garis waktu interaktif 90-hari dengan tahapan dinamis untuk Pasca-Bedah (ERAS), Fisioterapi/Rehab, dan Gym Recovery.", bold_prefix="Roadmap Pemulihan: ")
    add_bullet("Kalender Klinis Dwibulan: Tampilan 2 bulan berurutan berdampingan dengan pemilih rentang tanggal, jadwal nutrisi aktif, pantangan per fase, dan ringkasan validasi klinis.", bold_prefix="Kalender Klinis Dwibulan: ")
    add_bullet("Dual-Mode Recovery Meal Planner: Mode Standar (Optimal) vs Mode Hemat (Low-Budget) berbasis integrasi data disparitas harga 38 provinsi dari Bapanas dan BPS.", bold_prefix="Perencana Menu & Anggaran: ")
    add_bullet("Smart Food Budgeting & Grocery List: Alokasi anggaran belanja makanan (7–30 hari) dengan modal rincian daftar belanja bahan pokok pangan lokal.", bold_prefix="Daftar Belanja Pangan: ")
    add_bullet("Symptom-Aware Texture Filter: Penyesuaian tekstur otomatis untuk keluhan Mual, Sulit Menelan (Disfagia), Konstipasi, dan Nafsu Makan Rendah berpalet WCAG AAA.", bold_prefix="Filter Gejala Klinis: ")
    add_bullet("Telehealth 1-Click PDF Export: Ekspor dokumen medis resmi A4 berisi kop, profil klinis, target makro, tabel kepatuhan 7 hari dengan mini bar visual, dan kolom tanda tangan nakes.", bold_prefix="Ekspor PDF Medis: ")
    add_bullet("Portal Pendamping (Caregiver View-Only): Pembuatan tautan token acak aman (crypto token) yang dapat dibuka keluarga/dokter tanpa risiko mengubah data rekam medis.", bold_prefix="Portal Pendamping: ")
    add_bullet("Ruang Komunitas & AI Screening: Ruang berbagi resep antar-pasien dengan audit keamanan otomatis model DistilBERT Safetensors (Aman, Netral, Peringatan).", bold_prefix="Komunitas Pemulihan: ")
    add_bullet("Sistem Notifikasi Cerdas: Pengingat pagi (06:00), peringatan defisit albumin malam (18:00), info penurunan harga bahan, dan edukasi protokol ERAS.", bold_prefix="Smart Clinical Notifications: ")
    add_bullet("Live AI Model Tester Modal: Pengujian interaktif model AI NLP DistilBERT Safetensors langsung dari bilah atas antarmuka dengan indikator latensi real-time.", bold_prefix="Uji Langsung Model AI: ")
    add_bullet("Portal Super Administrator Medis: Panel administrasi khusus dokter/admin dengan 4 tab: Monitoring Pengguna, Pemindaian Masuk, Audit Trail, Kontrol Parameter AI & Cloud.", bold_prefix="Portal Super Admin Medis: ")
    add_bullet("Ensiklopedia Pangan Super Nusantara: Database TKPI Kemenkes RI mencakup Ikan Gabus, Tempe, Telur Bebek, Sayur Bening Bayam dengan fitur penanda Favorit.", bold_prefix="Katalog TKPI Lokal & Favorit: ")
    add_bullet("Aksesibilitas Ramah Lansia & Dwi-Bahasa: Pilihan font 3-tingkat (A, A+, A++), mode kontras tinggi (>13:1), serta penukar bahasa instan (ID / EN).", bold_prefix="Aksesibilitas & i18n: ")

    add_h2("5.2 Di Luar Cakupan (Out-of-Scope — Batasan Tanggung Jawab Medis)")
    add_bullet("NutriVision AI memposisikan diri secara tegas sebagai Clinical Decision Support System (CDSS) pendukung keputusan gizi, bukan penentu diagnosis medis definitif.", bold_prefix="Diagnosis Medis Operatif: ")
    add_bullet("Sistem tidak menyediakan peresepan obat-obatan analgesik, antibiotik, suplemen injeksi, atau zat farmakologis terkontrol.", bold_prefix="Peresepan Farmakologi: ")
    add_bullet("Sistem menyediakan rekomendasi bahan pangan dan estimasi biaya riil, namun transaksi pembelian dan pengantaran makanan diserahkan ke kanal pasar fisik/e-commerce pengguna.", bold_prefix="Transaksi Katering Komersial: ")

    # ==========================================
    # BAB 6: FITUR UTAMA — COMPUTER VISION & ALUR PENCATATAN
    # ==========================================
    add_h1("6. Fitur Utama — Dual-Pipeline Computer Vision & Alur Pencatatan Asupan")
    add_h2("6.1 Arsitektur Dual-Pipeline CV")
    add_body("NutriVision AI menerapkan arsitektur Computer Vision berkinerja ganda untuk menjamin kecepatan, keandalan offline, dan akurasi segmentasi:")
    add_bullet(
        "Berjalan langsung di browser pasien menggunakan Canvas API. Menghasilkan visualisasi poligon warna-warni secara instan (< 100 ms) di atas foto makanan: "
        "Hijau Zamrud untuk kelompok Protein/Albumin tinggi, Kuning Emas untuk Karbohidrat kompleks, Merah Bata untuk Lemak sehat/Vitamin. "
        "Engine ini bekerja 100% secara offline tanpa membebani kuota internet pasien.",
        bold_prefix="Pipeline 1 — Client-Side Interactive Canvas Segmentation Engine: "
    )
    add_bullet(
        "Endpoint Node.js Express menerima unggahan foto mentah via multipart/form-data, melakukan validasi citra, memetakan bounding box koordinat segmen, "
        "dan mencocokkan bahan makanan ke basis data gizi klinis MySQL dan model klasifikasi DistilBERT Python.",
        bold_prefix="Pipeline 2 — Server-Side REST API CV Analysis (/api/cv/analyze): "
    )

    add_h2("6.2 Alur Interaksi Human-in-the-Loop")
    add_body("Menyadari bahwa foto 2D tunggal memiliki variasi sudut dan pencahayaan, sistem menyediakan kontrol koreksi manual yang mudah bagi pasien:")
    add_bullet("Pasien cukup mengetik angka gram riil pada kartu bahan makanan. Nilai protein, karbohidrat, lemak, dan kalori langsung terkalkulasi ulang saat itu juga.", bold_prefix="Koreksi Gramatur Porsi Real-Time: ")
    add_bullet("Bahan yang tidak dikonsumsi atau salah deteksi dapat disingkirkan dari hitungan dengan sekali tekan pada ikon tempat sampah (🗑️).", bold_prefix="Penghapusan Bahan Fleksibel: ")
    add_bullet("Jika ada lauk tambahan yang belum tertangkap kamera, pasien dapat membuka katalog pangan lokal lalu menekan tombol \"+ Tambah ke Piring\".", bold_prefix="Penambahan Bahan Manual dari Katalog TKPI: ")

    add_h2("6.3 Integrasi Otomatis Scan ke Gizi Harian (Modal Konfirmasi Asupan)")
    add_body(
        "Setelah hasil scan piring diverifikasi oleh pasien, sistem menyediakan alur pencatatan mulus ke rekam medis harian: "
        "1) Menekan tombol \"Tambahkan ke Gizi Harian\" (tersedia di kartu ringkasan overview dan modal scan); "
        "2) Jendela Modal Konfirmasi Asupan Harian (modal-confirm-daily-intake) terbuka, menampilkan pilihan slot waktu makan (Sarapan, Makan Siang, Makan Malam, Camilan) "
        "serta kelipatan takaran porsi (1x Standar, 1.5x Sedang, 2x Ganda); "
        "3) Sistem mengakumulasikan total protein, karbohidrat, lemak, dan kalori ke dalam cincin donat makro harian (Macro Rings) dan menambahkan hidangan ke Riwayat Makan Hari Ini; "
        "4) Status kartu piring otomatis beralih dari \"Belum Dicatat\" (unlogged notice) menjadi banner hijau \"Asupan Berhasil Dicatat Hari Ini\" (logged banner)."
    )

    # ==========================================
    # BAB 7: FITUR INOVASI TERIMPLEMENTASI LENGKAP
    # ==========================================
    add_h1("7. Fitur Inovasi Terimplementasi Lengkap")

    add_h2("7.1 Recovery Journey Roadmap 3-Kondisi (90-Hari ERAS, Fisioterapi, Gym)")
    add_body(
        "Garis Waktu Perjalanan Pemulihan (Roadmap) interaktif yang membimbing pasien melewati fase-fase penyembuhan terstruktur sesuai diagnosis klinisnya: "
        "\n• Kondisi Pasca-Bedah (ERAS 90-Hari): "
        "Fase 1 (Hari 1–5): Fase Inflamasi & Akut — tekstur cair jernih/lunak, target protein 1.2 g/kgBB, fokus anti-edema luka insisi; "
        "Fase 2 (Hari 6–21): Fase Proliferasi Albumin & Sintesis Jaringan — tekstur lunak padat, target protein 1.5–1.8 g/kgBB, fokus asupan Ikan Gabus (Channa striata) dan putih telur; "
        "Fase 3 (Hari 22–90): Fase Remodeling & Penguatan Jaringan Parut — tekstur reguler gizi seimbang, target protein 1.5 g/kgBB. "
        "\n• Kondisi Fisioterapi & Rehabilitasi Cedera: Fase 1 Proteksi & Anti-Edema Sendi, Fase 2 Sintesis Kolagen & Mobilisasi Ringan, Fase 3 Rekonstruksi Kekuatan Otot & Hypertrophy Terkontrol. "
        "\n• Kondisi Gym Recovery: Fase 1 Resintesis Glikogen & Rehidrasi Elektrolit, Fase 2 Spike Sintesis Protein (Leucine-rich), Fase 3 Recovery Adaptif & Pencegahan Overtraining. "
        "Setiap fase dilengkapi kartu visual status (Aktif, Selesai, Tahap Lanjut), progress bar target tercapai, badge superfoods rekomendasi, serta ringkasan tekstur pangan."
    )

    add_h2("7.2 Kalender Klinis Dwibulan (Dual-Month Consecutive Calendar & Schedule Suite)")
    add_body(
        "Sistem kalender klinis terpadu yang menampilkan dua bulan berurutan secara berdampingan dalam satu antarmuka (Dual-Month Wrapper): "
        "• Range Picker Interaktif: Pengguna dapat memilih tanggal tunggal atau rentang tanggal pemulihan secara fleksibel dengan efek hover visual. "
        "• Penandaan Fase Harian: Setiap sel tanggal memiliki indikator status kepatuhan, hari ini, serta penanda fase pemulihan aktif (misalnya \"Hari ke-38 · Fase Pemulihan Lanjut\"). "
        "• Tiga Tab Panel Detail Terintegrasi: "
        "1) Tab Jadwal Nutrisi (Meals): Menampilkan daftar hidangan terjadwal untuk tanggal terpilih lengkap dengan indikator kalori dan waktu makan; "
        "2) Tab Pantangan Makanan (Restrictions): Merinci daftar pantangan bahan makanan dan alergen khusus yang harus dihindari pada fase pemulihan yang sedang berjalan; "
        "3) Tab Ringkasan Validasi (Validation): Menyajikan evaluasi kepatuhan klinis dan catatan rekomendasi medis."
    )

    add_h2("7.3 Riwayat Makanan Hari Ini (Today's Meal Intake Drawer & History List)")
    add_body(
        "Komponen drawer / daftar rekam asupan makanan hari ini yang menampilkan setiap hidangan yang telah dicatat (waktu makan, nama hidangan, protein dalam gram, kalori dalam kkal). "
        "Pengguna dapat memantau akumulasi gizi per sesi makan, menghapus entri riwayat jika terjadi kesalahan input, dan melihat pembaruan angka pada badge rekam asupan secara real-time."
    )

    add_h2("7.4 Perencana Menu Dwimode (Dual-Mode Meal Planner) & Mesin Harga Komoditas Bapanas 38 Provinsi")
    add_body(
        "Menghadirkan dua opsi perencanaan menu harian: "
        "1) Opsi Standar (Optimal): Mengutamakan bahan premium bernilai biologis tinggi (Fillet Dada Ayam, Ikan Gabus Segar, Sup Kolagen Daging Sapi); "
        "2) Opsi Hemat (Low-Budget): Mengutamakan bahan pangan lokal terjangkau pasar tradisional (Tempe Bacem, Tahu Kukus, Telur Bebek Rebus, Pepes Kembung) "
        "yang tetap memenuhi target protein dan albumin fase pemulihan. "
        "Fitur ini terhubung ke basis data disparitas harga komoditas pangan 38 provinsi dari Badan Pangan Nasional (Bapanas) dan BPS (Zona 1 Jawa s/d Zona 7 Papua), "
        "sehingga estimasi biaya harian (Rp) disesuaikan secara presisi dengan wilayah tempat tinggal pasien."
    )

    add_h2("7.5 Smart Food Budgeting & Modal Daftar Belanja Bahan Pokok (Grocery Shopping List)")
    add_body(
        "Modul perencana anggaran belanja makanan keluarga yang memungkinkan pasien mengatur plafon anggaran (default: Rp 200.000) untuk durasi 7 hari, 14 hari, hingga 30 hari. "
        "Pasien dapat memilih preferensi diet (Seimbang, Tinggi Protein, atau Tekstur Lunak). Sistem secara cerdas merancang menu harian yang pas dengan anggaran dan menyediakan "
        "Modal Daftar Belanja Bahan Pokok (modal-budget-grocery) yang merinci takaran gram dan estimasi biaya per bahan pokok yang perlu dibeli di pasar tradisional."
    )

    add_h2("7.6 Symptom-Aware Texture & Cooking Method Filter")
    add_body(
        "Sistem penyaring menu cerdas yang merespons keluhan fisik aktif pasien: "
        "• Mual: Menyarankan menu berkuah bening suhu suam-kuku, biskuit jahe tawar, serta mengeliminasi santan dan minyak jelantah. "
        "• Disfagia / Sulit Menelan: Mengonversi seluruh rekomendasi hidangan ke tekstur lunak halus (puree/saring), seperti bubur ikan tim saring dan puding albumin. "
        "• Konstipasi: Mengutamakan hidangan berserat larut air tinggi (sayur bening labu siam, bayam) dan kecukupan asupan cairan hangat. "
        "• Nafsu Makan Rendah: Menganjurkan makanan padat gizi porsi mini berfrekuensi sering (small frequent nutrient-dense meals). "
        "Seluruh tombol filter dirancang dengan palet Forest Matcha berkontras tinggi yang lolos sertifikasi WCAG 2.1 AAA."
    )

    add_h2("7.7 Telehealth 1-Click PDF Medical Document Export (Standar A4)")
    add_body(
        "Menghasilkan berkas rekam medis nutrisi resmi ukuran A4 siap cetak atau dikirimkan via WhatsApp ke dokter spesialis gizi dan fisioterapis. "
        "Dokumen ini memuat: Kop Resmi NutriVision AI, Nomor Referensi Telehealth unik, Data Klinis Pasien (Nama, Usia, BMI, Pantangan), Fase ERAS aktif, "
        "Tabel Riwayat Kepatuhan 7 Hari (lengkap dengan mini visual progress bar dan status Tercapai/Terpantau dengan rata-rata 92%), "
        "Rincian Asupan Hari Ini, Catatan Gejala Aktif, serta Lembar Verifikasi dengan Kolom Tanda Tangan Pasien/Caregiver dan Dokter Penanggung Jawab Pelayanan (SIP/STR)."
    )

    add_h2("7.8 Portal Pendamping (Caregiver View-Only)")
    add_body(
        "Memfasilitasi keluarga atau perawat homecare untuk memantau asupan pasien dari jarak jauh melalui tautan token acak kriptografis unik (/api/caregiver/view/:token). "
        "Hak akses ini bersifat Lihat-Saja (view-only), memberikan rasa tenang kepada keluarga tanpa risiko tertukarnya atau terhapusnya data rekam medis pasien secara tidak sengaja."
    )

    add_h2("7.9 Ruang Komunitas Pemulihan dengan Verifikasi AI Safetensors & Pemetaan Intent (intent_map.json)")
    add_body(
        "Ruang interaksi sosial tempat pasien saling berbagi resep pemulihan dan pengalaman klinis. "
        "Setiap postingan dan resep yang dibagikan secara otomatis diperiksa oleh layanan microservice Python DistilBERT Multilingual (model.safetensors, 516 MB) "
        "yang terhubung langsung dengan berkas konfigurasi lokal:\n"
        "1) intent_map.json: Memetakan inferensi model ke 3 domain klinis utama: "
        "• Class 0 (meal_plan): Perencana Menu Pemulihan & Penjadwalan Asupan; "
        "• Class 1 (nutrisi): Analisis Komposisi Gizi, Keseimbangan Makronutrisi & Albumin; "
        "• Class 2 (workout): Fisioterapi, Rehabilitasi Fisik & Mobilisasi Bertahap.\n"
        "2) config.json: Mendefinisikan arsitektur DistilBertForSequenceClassification (dim: 768, hidden_dim: 3072, n_layers: 6, n_heads: 12, vocab_size: 119547);\n"
        "3) tokenizer.json & tokenizer_config.json: Memuat pustaka tokenisasi offline lokal berukuran 2.9 MB sehingga inferensi berjalan 100% mandiri tanpa koneksi internet ke HuggingFace Hub;\n"
        "4) Klasifikasi Keamanan Medis: Memberikan badge keselamatan otomatis: Class 0 (AMAN_TINGGI_GIZI / Hijau), Class 1 (NETRAL_MODERASI / Kuning), atau Class 2 (PERINGATAN_PANTANGAN / Merah)."
    )

    add_h2("7.10 Sistem Notifikasi Cerdas Klinis (Smart Clinical Reminders)")
    add_body(
        "Engine notifikasi otomatis yang mengevaluasi kondisi pasien secara berkala: "
        "1) Morning Reminder (06:00 WIB): Pengingat target kalori dan protein harian; "
        "2) Evening Deficit Warning (18:00 WIB): Peringatan otomatis jika asupan protein hari ini masih defisit >25%, disertai rekomendasi menu makan malam cepat kaya albumin; "
        "3) Price Fluctuation Alert: Pemberitahuan penurunan harga komoditas protein lokal di pasar sekitar; "
        "4) ERAS Guideline Update: Edukasi periodik protokol pemulihan bedah dari Kemenkes RI dan ESPEN."
    )

    add_h2("7.11 Halaman Khusus Evaluasi Kelayakan Menu Pasien (AI Model Teks)")
    add_body(
        "Tersedia halaman khusus yang didedikasikan untuk evaluasi klinis resep dan menu makanan pasien pasca-bedah, "
        "yang dapat diakses langsung secara eksklusif dari tombol navigasi \"AI Model Teks\" di bilah atas aplikasi "
        "(tanpa masuk ke menu sidebar reguler pasien guna menjaga kerapian alur kerja klinis). "
        "Halaman ini dilengkapi tombol kembali ('Kembali ke Dashboard') untuk kembali secara instan ke tampilan ikhtisar utama. "
        "Fitur pada halaman ini mencakup: "
        "1) Status AI Klinis Real-Time: Menampilkan indikator latensi ultra-cepat (<18 milidetik) dan status operasional model Safetensors; "
        "2) Panel Masukan Menu Pasien: Memuat 6 contoh menu cepat (Bakso Sapi Kuah, Sup Ikan Gabus, Bening Bayam Jagung, Bubur Salmon, Rendang Pedas, Ayam Goreng Tepung), area teks resep, penghitung karakter dinamis, dan penanda konteks medis; "
        "3) Kata Kunci yang Dianalisis: Chip deteksi otomatis bahan utama pangan yang paling memengaruhi keamanan pasien; "
        "4) Hasil Evaluasi Klinis: Triage keselamatan 3 tingkat (Aman Sangat Direkomendasikan, Netral, Peringatan Pantangan), bar tingkat keyakinan (Confidence %), dan validasi protokol bedah ESPEN; "
        "5) Catatan Evaluasi Gizi: Tiga butir rekomendasi klinis terperinci mengenai daya cerna lambung, perbaikan jaringan luka, dan pemeriksaan alergen; "
        "6) Estimasi Nutrisi Per Porsi: Empat kartu metrik gizi standar TKPI Kemenkes (Protein & Albumin dalam gram, Total Kalori Energi Basal, Seng/Zinc untuk sintesis jaringan, dan Natrium/Garam); "
        "7) Banner Persetujuan Menu: Tombol aksi langsung 'Kirim ke Dapur Gizi Pasien' yang terhubung dengan rekam medis elektronik rumah sakit."
    )

    add_h2("7.12 Portal Super Administrator Medis & Audit Trail Explorer")
    add_body(
        "Panel kontrol komprehensif bagi dokter administrator atau super admin yang mencakup 4 tab navigasi: "
        "1) Monitoring Pengguna: Memantau daftar pasien aktif, kondisi klinis, dan progres pemulihan; "
        "2) Data Pemindaian Masuk: Meninjau riwayat foto makanan dan hasil ekstraksi poligon CV pasien; "
        "3) Audit Trail & Keamanan: Menampilkan rekaman jejak audit sistem (audit_logs) lengkap dengan timestamp, ID aksi, alamat IP, dan log aktivitas; "
        "4) Kontrol Parameter AI & Cloud: Mengatur ambang batas confidence score model dan parameter sinkronisasi cloud; "
        "dilengkapi tombol \"Unduh Audit Trail (JSON)\" untuk ekspor data kepatuhan hukum medis."
    )

    add_h2("7.13 Ensiklopedia Pangan Super Lokal Nusantara (TKPI) & Fitur Favorit Pangan")
    add_body(
        "Basis data pangan super Nusantara kaya albumin dan mikronutrien regeneratif: Ikan Gabus (Channa striata), Tempe Kedelai, Telur Bebek, Daging Ayam Kampung, "
        "dan Sayur Bening Bayam. Dilengkapi filter kategori, filter gejala klinis, informasi gramatur albumin/zat besi/zinc/vitamin C, tombol \"+ Tambah ke Piring\", "
        "serta tombol Bookmark Favorit untuk menyimpan bahan makanan yang sering dikonsumsi pasien."
    )

    add_h2("7.14 Aksesibilitas WCAG 2.1 AAA & Font Scaler Ramah Lansia")
    add_body(
        "Kepatuhan penuh standar aksesibilitas internasional untuk pasien geriatri dan pasca-anestesi: "
        "• Font Scaler 3-Tingkat: Standar A (15.5px), Sedang A+ (17.5px), Besar A++ (19.5px). "
        "• Mode Kontras Tinggi: Latar putih pekat dengan border hitam 100% dan rasio kontras >13:1 (melampaui syarat WCAG AAA 7:1). "
        "• Tata Letak Thumb-Friendly: Seluruh tombol utama dapat dijangkau dengan mudah oleh jempol pada layar smartphone."
    )

    add_h2("7.15 Onboarding Diagnostik 5-Langkah & Kuis Literasi Gizi Klinis")
    add_body(
        "Alur registrasi terpandu yang mengumpulkan data klinis pasien dalam 5 langkah sederhana (Kondisi, Fase Pemulihan, Antropometri, Pantangan/Alergi, Target Harian), "
        "dilengkapi modul Kuis Literasi Gizi Klinis interaktif untuk menguji dan memperkuat pemahaman pasien tentang pentingnya protein dalam penyembuhan luka."
    )

    add_h2("7.16 Dukungan Dwi-Bahasa (Bilingual ID/EN) & Arsitektur 100% Offline-First")
    add_body(
        "Mendukung peralihan bahasa seketika antara Bahasa Indonesia dan Bahasa Inggris untuk memenuhi standar kompetisi internasional Gayatama 5. "
        "Dukungan Service Worker dan IndexedDB/LocalStorage menjamin aplikasi tetap dapat dibuka dan mencatat makanan walau koneksi internet terputus total."
    )

    # ==========================================
    # BAB 8: PENANGANAN PANTANGAN MAKAN & TATA KELOLA MEDIS
    # ==========================================
    add_h1("8. Penanganan Pantangan Makan & Model Tanggung Jawab Medis")
    add_body("NutriVision AI menerapkan Model Tanggung Jawab Bersama (Shared Responsibility Model) yang transparan:")

    t2_data = [
        ["Pihak Terkait", "Tanggung Jawab & Batasan Hak Akses"],
        [
            "Sistem NutriVision AI (CDSS)",
            "Menyediakan algoritma estimasi gizi piring, pencocokan pantangan rule-based dan inferensi NLP AI DistilBERT, serta secara konsisten menampilkan disclaimer medis bahwa sistem adalah alat bantu keputusan (bukan penentu diagnosis medis definitif)."
        ],
        [
            "Pasien / Pengguna",
            "Wajib mendeklarasikan pantangan, alergi, dan riwayat pembedahan secara akurat pada formulir onboarding persetujuan klinis (informed consent) sesuai anjuran dokter penanggung jawab pelayanan (DPJP)."
        ],
        [
            "Pendamping (Caregiver) & Tenaga Medis",
            "Menerima salinan tautan read-only dan berkas PDF rekam medis resmi untuk melakukan evaluasi klinis berkala serta membubuhkan tanda tangan verifikasi sah pada lembar laporan."
        ],
        [
            "Audit Trail Sistem (audit_logs)",
            "Mencatat setiap tindakan klinis, modifikasi porsi, dan inferensi AI secara otomatis ke tabel audit database untuk akuntabilitas dan jejak rekam digital kepatuhan medis."
        ]
    ]
    t2 = doc.add_table(rows=len(t2_data), cols=2)
    for r_idx, row in enumerate(t2_data):
        for c_idx, val in enumerate(row):
            t2.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    format_table(t2, col_widths=[2.2, 4.8])
    add_p(space_before=6, space_after=6)

    # ==========================================
    # BAB 9: KEBUTUHAN FUNGSIONAL
    # ==========================================
    add_h1("9. Kebutuhan Fungsional (Functional Requirements)")
    add_body("Seluruh 25 kebutuhan fungsional sistem berikut telah terimplementasi penuh dan beroperasi pada codebase NutriVision AI saat ini:")

    t3_data = [
        ["ID", "Modul Sistem", "Kebutuhan Fungsional Spesifik", "Status Implementasi"],
        ["FR-01", "Computer Vision", "Menerima input foto makanan via kamera WebRTC langsung, unggah galeri, atau preset demo piring klinis.", "Must Have (Implemented)"],
        ["FR-02", "Computer Vision", "Melakukan segmentasi piring multi-bahan dengan visualisasi poligon warna (Hijau=Protein, Kuning=Karbo, Merah=Lemak).", "Must Have (Implemented)"],
        ["FR-03", "Estimasi Makro", "Mengestimasi gramatur porsi dan nilai makronutrisi (Protein, Karbo, Lemak, Kalori) per bahan dan total piring secara instan.", "Must Have (Implemented)"],
        ["FR-04", "Human-in-the-Loop", "Menyediakan form edit gramatur porsi real-time, tombol hapus item (🗑️), dan tombol tambah bahan manual (+ Tambah ke Piring).", "Must Have (Implemented)"],
        ["FR-05", "Asupan Harian", "Menyediakan modal konfirmasi asupan harian dengan pemilihan slot jam makan (Sarapan/Siang/Malam/Camilan) dan pengali porsi.", "Must Have (Implemented)"],
        ["FR-06", "Riwayat Makan", "Menyediakan drawer log makan harian yang mencatat menu, total protein/kalori, dan opsi penghapusan riwayat makan.", "Must Have (Implemented)"],
        ["FR-07", "Profil & ERAS", "Mengumpulkan data klinis, fase pemulihan, dan menghitung otomatis target protein harian (g) dan kalori basal personal.", "Must Have (Implemented)"],
        ["FR-08", "Cincin Target", "Menampilkan visualisasi Macro Rings interaktif yang bergerak dinamis saat makanan baru ditambahkan ke log harian.", "Must Have (Implemented)"],
        ["FR-09", "Roadmap Pemulihan", "Menyediakan Recovery Journey Roadmap 90-hari dengan tahapan dinamis untuk Pasca-Bedah, Fisioterapi, dan Gym Recovery.", "Must Have (Implemented)"],
        ["FR-10", "Kalender Dwibulan", "Menyediakan Kalender Klinis Dwibulan berturut-turut dengan range picker, jadwal makan, pantangan, dan validasi klinis.", "Must Have (Implemented)"],
        ["FR-11", "Meal Planner", "Menyediakan Perencana Menu Dwimode: Opsi Standar (Optimal) vs Opsi Hemat (Low-Budget) berbasis pangan lokal.", "Must Have (Implemented)"],
        ["FR-12", "Harga Bapanas", "Mengintegrasikan estimasi biaya porsi menu dengan data disparitas harga pangan Bapanas & BPS di 38 provinsi Indonesia.", "Must Have (Implemented)"],
        ["FR-13", "Budget & Grocery", "Menyediakan Smart Food Budgeting (7–30 hari) dan modal daftar belanja bahan pokok pangan lokal terjangkau.", "Must Have (Implemented)"],
        ["FR-14", "Filter Gejala", "Menyaring menu berdasarkan 4 keluhan klinis aktif: Mual, Disfagia (Sulit Menelan), Konstipasi, dan Nafsu Makan Rendah.", "Must Have (Implemented)"],
        ["FR-15", "Progress Tracking", "Merekam riwayat asupan piring dan menghitung persentase kepatuhan gizi klinis mingguan (7-Day Adherence Rate).", "Must Have (Implemented)"],
        ["FR-16", "Telehealth PDF", "Mengekspor dokumen rekam medis PDF resmi A4 lengkap dengan kop, riwayat 7 hari, dan kolom tanda tangan nakes & caregiver.", "Must Have (Implemented)"],
        ["FR-17", "Portal Caregiver", "Membuat tautan akses aman berbasis token acak untuk pemantauan riwayat gizi pasien oleh keluarga/nakes (View-Only).", "Must Have (Implemented)"],
        ["FR-18", "Komunitas", "Menyediakan ruang berbagi resep pemulihan dengan fitur suka (like), komentar, dan filter kategori kondisi pemulihan.", "Must Have (Implemented)"],
        ["FR-19", "AI Screening", "Melakukan klasifikasi keamanan klinis resep komunitas via DistilBERT Safetensors (Aman Tinggi Gizi, Netral, Peringatan).", "Must Have (Implemented)"],
        ["FR-20", "AI Intent Mapping", "Memetakan intent inferensi teks ke 3 domain klinis (meal_plan, nutrisi, workout) berdasarkan intent_map.json.", "Must Have (Implemented)"],
        ["FR-21", "AI Model Teks", "Menyediakan halaman khusus 'Evaluasi Kelayakan Menu Pasien' yang diakses via tombol 'AI Model Teks' di navbar (dengan tombol kembali ke dashboard), memuat 6 preset resep, ekstraksi kata kunci, triage klinis, bar keyakinan, estimasi nutrisi per porsi, dan integrasi dapur gizi.", "Must Have (Implemented)"],
        ["FR-22", "Admin Portal", "Menyediakan portal super admin medis dengan monitoring pengguna, pemindaian masuk, audit logs, dan ekspor JSON.", "Must Have (Implemented)"],
        ["FR-23", "Smart Notifikasi", "Memicu notifikasi pengingat pagi (06:00), peringatan defisit albumin malam (18:00), info harga pangan, dan edukasi ERAS.", "Must Have (Implemented)"],
        ["FR-24", "Katalog TKPI", "Menyediakan ensiklopedia pangan super lokal Nusantara kaya albumin (Ikan Gabus, Tempe, Telur) dengan fitur Favorit.", "Must Have (Implemented)"],
        ["FR-25", "Aksesibilitas", "Menyediakan pengatur ukuran font 3-tingkat (A, A+, A++) dan mode kontras tinggi (WCAG 2.1 AAA Compliance).", "Must Have (Implemented)"],
        ["FR-26", "Bilingual i18n", "Mendukung pertukaran bahasa antarmuka secara instan antara Bahasa Indonesia (ID) dan Bahasa Inggris (EN).", "Must Have (Implemented)"]
    ]
    t3 = doc.add_table(rows=len(t3_data), cols=4)
    for r_idx, row in enumerate(t3_data):
        for c_idx, val in enumerate(row):
            t3.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    format_table(t3, col_widths=[0.8, 1.6, 3.2, 1.4])
    add_p(space_before=6, space_after=6)

    # ==========================================
    # BAB 10: KEBUTUHAN NON-FUNGSIONAL
    # ==========================================
    add_h1("10. Kebutuhan Non-Fungsional (Non-Functional Requirements)")
    add_bullet("Aplikasi dibangun dengan arsitektur Progressive Web App (PWA) yang dapat diinstal langsung ke homescreen tanpa app store, dilengkapi Service Worker caching aset untuk operasi 100% offline.", bold_prefix="NFR-01 — PWA & Offline-First: ")
    add_bullet("Layanan microservice Python DistilBERT Safetensors didukung tokenizer.json lokal (2.9 MB, vocab 119.547) dan intent_map.json menghasilkan klasifikasi keamanan gizi dan intent klinis dalam waktu rata-rata < 15 milidetik pada CPU standar tanpa ketergantungan API eksternal.", bold_prefix="NFR-02 — Latensi Inferensi AI & Tokenizer Lokal: ")
    add_bullet("Generasi berkas PDF rekam medis A4 dilakukan secara client-side via html2pdf.js dengan waktu render < 2 detik tanpa ketergantungan koneksi server eksternal.", bold_prefix="NFR-03 — Performa Ekspor PDF Medis: ")
    add_bullet("Antarmuka memenuhi standar kontras WCAG 2.1 AAA dengan rasio kontras teks melebihi 13:1 pada elemen tombol aktif, serta didukung pembesar teks 3-tingkat ramah lansia.", bold_prefix="NFR-04 — Aksesibilitas WCAG 2.1 AAA: ")
    add_bullet("Data pribadi dan riwayat asupan disimpan dengan pendekatan Local-First di browser pengguna, dengan sinkronisasi terenkripsi ke database MySQL dan Supabase Cloud.", bold_prefix="NFR-05 — Keamanan & Privasi Local-First: ")
    add_bullet("Autentikasi akun dilindungi JSON Web Token (JWT) dengan signature aman, hashing kata sandi, sanitasi parameter input SQL, serta isolasi tautan Caregiver berbasis token unik.", bold_prefix="NFR-06 — Keamanan API & Data: ")
    add_bullet("Sistem backend dilengkapi tabel audit_logs untuk merekam setiap interaksi sistem, waktu akses, alamat IP, dan hasil klasifikasi AI untuk akuntabilitas hukum dan medis.", bold_prefix="NFR-07 — Jejak Audit & Kepatuhan Medis: ")
    add_bullet("Desain responsif fluid (Mobile-First) yang beradaptasi sempurna dari layar ponsel 360px hingga monitor desktop 4K tanpa distorsi visual.", bold_prefix="NFR-08 — Responsivitas Lintas Perangkat: ")

    # ==========================================
    # BAB 11: ARSITEKTUR & TUMPUKAN TEKNOLOGI
    # ==========================================
    add_h1("11. Arsitektur & Tumpukan Teknologi Riil")
    add_body("Berikut adalah perincian arsitektur teknologi riil yang terpasang dan beroperasi penuh pada codebase NutriVision AI saat ini:")

    t4_data = [
        ["Lapisan Arsitektur", "Teknologi & Komponen Riil", "Peran & Keunggulan Khusus pada Codebase"],
        [
            "Frontend Web & PWA",
            "Semantic HTML5, Vanilla JavaScript (ES6+ modular), CSS Variables Design System, Service Worker",
            "Performa ultra-ringan tanpa overhead framework React/Next.js; transisi tema Matcha & Milky Canvas; instalasi PWA homescreen; dan operasi offline-first."
        ],
        [
            "Desain & Aksesibilitas",
            "Clean Organic Matcha Theme, WCAG 2.1 AAA High Contrast, Font Scaler (A/A+/A++)",
            "Rasio kontras >13:1, kenyamanan membaca bagi lansia pasca-operasi, dan navigasi ramah jempol (thumb-friendly layout)."
        ],
        [
            "Ikonografi & Aset",
            "Lucide Icons & Iconify (Offline Local bundled + CDN fallback)",
            "Tersedia 100% secara lokal tanpa delay pemuatan icon; zero layout shift; fallback otomatis CDN saat jaringan aktif."
        ],
        [
            "PDF Medical Engine",
            "html2pdf.bundle.min.js (Client-side vector rendering)",
            "Membangkitkan dokumen medis resmi ukuran A4 siap cetak dan bertanda tangan nakes secara instan langsung dari browser pasien."
        ],
        [
            "Backend REST API",
            "Node.js & Express.js (10 Modular Routes Controller, Port 5000)",
            "Orkestrasi endpoint auth, meals, foods, cv, caregiver, community, telemetry, notifications, food_prices, dan ai bridge."
        ],
        [
            "Database Relasional",
            "MySQL 8 dengan mysql2/promise Connection Pool",
            "Penyimpanan relasional tangguh (users, meals, foods, community_posts, caregiver_shares, audit_logs, notifications) dengan auto-migration & auto-seeding."
        ],
        [
            "Cloud Sync & Hybrid Storage",
            "Supabase Cloud (PostgreSQL / Auth JS SDK) + LocalStorage Cache",
            "Mekanisme redundansi ganda: data tersimpan lokal di IndexedDB/LocalStorage browser pasien dan tersinkronisasi ke cloud saat online."
        ],
        [
            "Microservice AI NLP & Intent Engine",
            "Python 3 HTTP Server (Port 5050), DistilBERT Multilingual (model.safetensors, 516 MB), config.json, tokenizer.json (Vocab 119.547), intent_map.json",
            "Inferensi klasifikasi semantik keamanan klinis dan pemetaan 3 domain intent (meal_plan, nutrisi, workout) via HuggingFace Tokenizers lokal & NumPy dengan latensi < 15ms tanpa internet dan tanpa GPU eksternal."
        ],
        [
            "Computer Vision Engine",
            "Client Canvas API Multi-Polygon Engine + Server CV Endpoint (/api/cv/analyze)",
            "Visualisasi masking poligon instan tanpa jeda jaringan, dilengkapi penyesuaian gramatur porsi dan koreksi bahan."
        ],
        [
            "Data Pangan & Harga",
            "Badan Pangan Nasional RI (Bapanas), BPS (38 Provinsi), TKPI Kemenkes RI",
            "Basis data komoditas pangan 38 provinsi untuk penghitungan biaya menu pemulihan riil dan profil nutrisi pangan super lokal Nusantara."
        ],
        [
            "Testing Automation",
            "Node.js Built-in Test Runner (server/test/api.test.js)",
            "Suite pengujian otomatis mencakup 49 test cases menyeluruh pada seluruh endpoint REST API dan model AI Safetensors."
        ]
    ]
    t4 = doc.add_table(rows=len(t4_data), cols=3)
    for r_idx, row in enumerate(t4_data):
        for c_idx, val in enumerate(row):
            t4.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    format_table(t4, col_widths=[1.8, 2.2, 3.0])
    add_p(space_before=6, space_after=6)

    # ==========================================
    # BAB 12: METRIK KEBERHASILAN
    # ==========================================
    add_h1("12. Metrik Keberhasilan (Success Metrics)")
    add_bullet("Persentase pasien yang berhasil mempertahankan asupan protein dan kalori ≥ 85% dari target ERAS personal selama minimal 7 hari pemantauan berturut-turut (target: > 80% kepatuhan klinis).", bold_prefix="Tingkat Kepatuhan Gizi Klinis 7-Hari (Clinical Compliance Rate): ")
    add_bullet("Kecepatan rata-rata pasien dalam mengoreksi porsi makanan hasil deteksi CV di bawah 15 detik berkat kemudahan form porsi instan dan katalog TKPI.", bold_prefix="Efisiensi Koreksi Human-in-the-Loop: ")
    add_bullet("Waktu respon eksekusi model DistilBERT Safetensors di bawah 20 milidetik dan waktu render dokumen rekam medis PDF di bawah 2 detik.", bold_prefix="Performa & Latensi Teknis Sistem: ")
    add_bullet("Jumlah keluarga atau nakes pendamping yang aktif membuka tautan Caregiver Portal untuk memverifikasi rekam asupan pasien rawat jalan.", bold_prefix="Keterlibatan Caregiver & Telehealth: ")
    add_bullet("Skor kepuasan pengguna (CSAT) mencapai minimal 4.7/5.0 terkait kejelasan visual cincin gizi, kemudahan pembesar font lansia, dan kejelasan disclaimer medis.", bold_prefix="Kepuasan Pasien & Aksesibilitas (CSAT): ")

    # ==========================================
    # BAB 13: KETERKAITAN DENGAN SDGS
    # ==========================================
    add_h1("13. Keterkaitan dengan SDGs & Dampak Sosial")
    add_bullet(
        "Mendukung percepatan pemulihan luka bedah, menekan risiko malnutrisi rumah sakit dan infeksi pasca-operasi, serta menurunkan angka rawat inap ulang (readmission rate) "
        "melalui panduan gizi presisi berbasis protokol ERAS yang mudah diakses mandiri oleh masyarakat.",
        bold_prefix="SDG 3 — Good Health and Well-Being (Kehidupan Sehat & Sejahtera): "
    )
    add_bullet(
        "Menghadirkan inovasi infrastruktur digital kesehatan publik berupa PWA CDSS mandiri berbasis model AI transformator (DistilBERT Safetensors) dan Computer Vision ringan "
        "yang dapat berjalan di perangkat smartphone sederhana tanpa memerlukan komputasi server berbiaya mahal.",
        bold_prefix="SDG 9 — Industry, Innovation and Infrastructure (Industri, Inovasi, & Infrastruktur): "
    )
    add_bullet(
        "Memperkuat ketahanan gizi komunitas lokal dengan memanfaatkan potensi pangan super Nusantara (Ikan Gabus, Tempe, Telur) dan mengintegrasikan disparitas harga komoditas pangan 38 provinsi "
        "dari Badan Pangan Nasional (Bapanas), sehingga panduan nutrisi pemulihan tetap terjangkau dan inklusif bagi keluarga berpenghasilan rendah.",
        bold_prefix="SDG 11 — Sustainable Cities and Communities (Kota & Komunitas Berkelanjutan): "
    )

    # ==========================================
    # BAB 14: BATASAN, RISIKO & MITIGASI
    # ==========================================
    add_h1("14. Batasan, Risiko & Strategi Mitigasi")
    add_bullet(
        "Akurasi estimasi dapat terpengaruh oleh kuah pekat atau saus campuran. "
        "Mitigasi: Disediakan form koreksi porsi gramatur instan, tombol hapus item, serta katalog bahan lokal TKPI sehingga pasien dapat mengoreksi data dengan mudah dalam hitungan detik.",
        bold_prefix="Tantangan Visual Makanan Kuah/Campuran: "
    )
    add_bullet(
        "Foto 2D tunggal memiliki keterbatasan dalam mengukur ketebalan/kedalaman bahan. "
        "Mitigasi: Sistem mengomunikasikan angka gizi sebagai rentang estimasi realistis dan menyertakan skala referensi piring standar.",
        bold_prefix="Margin Kesalahan Estimasi Porsi 2D: "
    )
    add_bullet(
        "Ketepatan filter menu bergantung pada kejujuran dan ketelitian input pengguna. "
        "Mitigasi: Formulir onboarding dilengkapi persetujuan deklarasi medis eksplisit (informed consent), penegasan tanggung jawab bersama, dan rekomendasi konsultasi nakes.",
        bold_prefix="Ketergantungan Deklarasi Pantangan Mandiri: "
    )
    add_bullet(
        "Potensi pengguna mengabaikan anjuran dokter dan hanya mengandalkan aplikasi. "
        "Mitigasi: Di setiap lembar antarmuka dan laporan PDF tercantum penafian (disclaimer) tegas bahwa NutriVision AI adalah sistem pendukung keputusan (CDSS) pendamping medis, bukan pengganti dokter spesialis.",
        bold_prefix="Potensi Misinterpretasi Medis: "
    )

    # ==========================================
    # BAB 15: REFERENSI ILMIAH & KLINIS
    # ==========================================
    add_h1("15. Referensi Ilmiah & Klinis")
    references = [
        "Weimann, A., et al. \"ESPEN practical guideline: Clinical nutrition in surgery.\" Clinical Nutrition, Elsevier, 2021.",
        "Ang, K. Y. H., Stringer, G., Collins, J., Barker, L. A. \"Patient Experiences of Nutrition in Enhanced Recovery After Colorectal Surgery: A Systematic Review.\" Nutrients, MDPI, 2026.",
        "ERAS® Society. \"Guidelines for Perioperative Care in Enhanced Recovery After Surgery (ERAS) Protocols.\" 2023.",
        "Kementerian Kesehatan Republik Indonesia. \"Tabel Komposisi Pangan Indonesia (TKPI).\" Direktorat Gizi Masyarakat, Kemenkes RI, Jakarta.",
        "Badan Pangan Nasional Republik Indonesia (Bapanas). \"Panel Harga Pangan Komoditas Nasional & Disparitas 38 Provinsi.\" Bapanas RI & BPS, 2025/2026.",
        "Suprayitno, E. \"The Profile of Albumin and Amino Acids from Snakehead Fish (Channa striata) Extract and Its Clinical Role in Wound Healing.\" Journal of Clinical Nutrition & Fish Technology, 2020.",
        "Frontiers in Nutrition. \"Visual Nutrition Analysis: Leveraging Segmentation and Regression for Food Nutrient Estimation.\" 2024.",
        "ScienceDirect. \"Computer Vision and Deep Learning-Based Approaches for Detection of Food Nutrients/Nutrition: New Insights and Advances.\" 2024.",
        "HuggingFace. \"DistilBERT Multilingual Base Cased: Fast Transformer Sequence Classification.\" Hugging Face Documentation, 2024.",
        "Sanh, V., et al. \"DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter.\" arXiv:1910.01108, 2020.",
        "Asian Journal of Research in Computer Science. \"Estimating Nutritional Composition from Food Volume via Deep Learning-Based Depth and Segmentation Models.\" 2025.",
        "PMC12026278. \"Lightweight DeepLabv3+ for Semantic Food Segmentation.\" 2024.",
        "Encompass Health. \"Healing Foods: What to Eat Pre- and Post-Surgery.\" Clinical Guidance, 2024.",
        "World Health Organization (WHO) & W3C. \"Web Content Accessibility Guidelines (WCAG) 2.1 — Level AAA Standards for Healthcare Portals.\" W3C Recommendation."
    ]
    for ref in references:
        add_p(ref, style=None, space_before=0, space_after=3)

    # Save Document
    doc.save(output_path)
    print(f"Document successfully written to {output_path}!")

if __name__ == "__main__":
    out_file = "NutriVision_AI_PRD_1.docx"
    build_comprehensive_prd(out_file)
