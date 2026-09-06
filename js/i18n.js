// NutriVision AI — Internationalization (i18n) Engine
// Dual-Language Support: English (Default) & Bahasa Indonesia (id)
// GAYATAMA 5 — International Web Technology Competition

(function () {
  'use strict';

  const TRANSLATIONS = {
    en: {
      // Document metadata & brands
      app_title: 'NutriVision AI — Clinical Recovery Nutrition & Food Segmentation',
      app_description: 'NutriVision AI — Computer Vision Clinical Nutrition & Plate Segmentation Platform for Post-Surgery, Rehabilitation, and Eldercare Recovery',
      brand_tagline: 'Clinical Recovery & Food Segmentation',

      // Navbar
      nav_simulation: 'AI Simulation',
      nav_clinical: 'Clinical Features',
      nav_superfoods: 'Local Superfoods',
      nav_evidence: 'Research Evidence',
      nav_calculator: 'Calculator',
      nav_database: 'Database',
      nav_login: 'Login',
      nav_overview: 'Overview',
      nav_planner: 'Meal Planner',
      nav_catalog: 'Catalog',
      nav_community: 'Community',
      nav_progress: 'Progress & PDF',
      nav_profile: 'Profile',
      nav_scan: 'Scan Plate',

      // Transparency Alert Banner
      banner_notice: '<strong>Public Service & Clinical Decision-Support Notice:</strong> All food image segmentations and nutritional estimations on this application are presented as clinical decision-support ranges, not as a replacement for professional medical advice, prescription, or clinical diagnosis from a physician or registered dietitian.',

      // Hero Section
      hero_title: 'Scan meals, don\'t guess your <span class="highlight-coral">recovery</span> nutrition.',
      hero_desc: 'After surgery, physical injury, or during post-hospital eldercare, daily protein requirements should never be left to guesswork. NutriVision AI identifies plate contents from photos, computes instant nutrition ranges, and aligns meals with local nutrient-dense foods.',
      hero_cta_primary: 'Sign In & Calibrate Dashboard',
      hero_cta_secondary: 'View Dashboard Preview →',

      // Hero Preview Card
      preview_title: 'AI Plate Segmentation Result',
      preview_ready: 'Ready to Scan',
      preview_empty_title: 'Empty Plate',
      preview_empty_sub: 'No food detected yet',
      preview_seg_protein: 'Protein Segment',
      preview_seg_carbs: 'Carbohydrate Segment',
      preview_seg_veg: 'Fiber / Vegetable Segment',
      preview_target_label: 'Daily Target: ',
      preview_target_val: '0g / 98g Protein',
      preview_scan_cta: 'Try Scanning Yourself →',

      // AI Simulation Feature Section
      feature_title: 'AI-Powered Food Image Segmentation',
      feature_subtitle: 'Instant portion breakdown for protein, carbohydrates, and fiber with clinical-grade accuracy',
      preset_empty: 'Empty Plate (Reset)',
      preset_soft_bubur_gabus: 'Snakehead Fish Porridge (Dysphagia)',
      preset_standard_nasi_ayam: 'Chicken Breast & Water Spinach',
      preset_fish_kembung: 'Mackerel Pepes (Omega-3)',
      preset_salmon_quinoa: 'Salmon & Quinoa Bowl',
      mode_ai: 'AI Layer',
      mode_photo: 'Photo',
      mode_heatmap: 'Heatmap',
      conf_ready: 'AI Status: Ready to Scan',
      energy_empty: 'Energy Density: 0 kcal (Empty Plate · Waiting for Scan)',
      advice_empty: '<strong>AI Clinical Guide:</strong> No food data calculated yet. Select a sample meal above to simulate segmentation, or use the scan button to test an actual plate photo.',
      comp_prot_empty: 'Protein Component: Not detected',
      comp_carb_empty: 'Carbohydrate Component: Not detected',
      comp_veg_empty: 'Vegetables & Fiber: Not detected',
      cv_ready: 'CV Accuracy: Ready to Scan',

      // Clinical Recovery Assessment Factors (Protein, Vitamins, Minerals)
      assessment_badge: 'PRIMARY RECOVERY CRITERIA',
      assessment_title: 'Clinical Nutrition Factors',
      factor_protein_title: 'Protein & Albumin',
      factor_prot_sub: 'Wound Granulation & Cellular Repair',
      factor_vit_title: 'Vitamins (C, A, D)',
      factor_vit_sub: 'Collagen Biosynthesis & Immune Defense',
      factor_min_title: 'Minerals (Zinc & Iron)',
      factor_min_sub: 'Cellular Proliferation & Oxygenation',

      // Clinical Support Features
      support_title: '3 Pillars of Precision Recovery Nutrition',
      support_subtitle: 'Adaptive algorithms engineered from international ERAS surgical guidelines, medical rehabilitation, and tissue regeneration science',
      support_card1_title: 'Phase-Adaptive Clinical Nutrition (ERAS)',
      support_card1_desc: 'Dynamic automatic transitions from soft post-anesthesia dysphagia textures to high-albumin proliferation synthesis and scar tissue remodeling.',
      support_card1_badge: 'Clinical Protocol',
      support_card2_title: 'Bioavailable Local Superfoods',
      support_card2_desc: 'Harnessing Channa striata (gabus) albumin, tempeh bio-peptides, and moringa oleifera to accelerate wound closure up to 2x faster.',
      support_card2_badge: 'Evidence-Based',
      support_card3_title: 'Caregiver & Telehealth Portal',
      support_card3_desc: 'Share encrypted read-only nutritional reports and weekly recovery charts with attending doctors, dietitians, or family caregivers.',
      support_card3_badge: 'Protected Access',

      // Local Superfoods Section
      superfoods_title: 'Local Nutrient-Dense Superfoods for Rapid Healing',
      superfoods_subtitle: 'Harnessing rich biodiversity with scientifically proven clinical nutritional profiles for surgery and injury convalescence',

      // Research Evidence
      evidence_title: 'Scientific Validation & Research Foundations',
      evidence_subtitle: 'Built upon ERAS guidelines, Indonesian Ministry of Health RDAs, and peer-reviewed tissue regeneration literature',

      // Calculator Section
      calc_title: 'Personal Recovery Calorie & Protein Calculator',
      calc_subtitle: 'Estimate basal expenditure and targeted daily protein grams matched to your specific clinical condition',
      calc_condition_label: 'Clinical Condition / Goal',
      calc_condition_surgery: 'Post-Surgery (Tissue & Wound Healing)',
      calc_condition_rehab: 'Medical Rehabilitation / Physical Therapy',
      calc_condition_gym: 'Gym & Sports Recovery',
      calc_weight_label: 'Body Weight (kg)',
      calc_activity_label: 'Daily Activity Level',
      calc_activity_bed: 'Bedridden / Restricted Movement',
      calc_activity_light: 'Light Walking / Sitting',
      calc_activity_moderate: 'Active Rehabilitation / Physiotherapy',
      calc_calories_label: 'Estimated Daily Calories',
      calc_protein_label: 'Daily Protein Target',
      calc_formula_note: 'Calculated using Harris-Benedict & ASPEN/ESPEN clinical surgical recovery formulas (1.5 - 2.0g protein/kg body weight).',

      // Footer
      footer_desc: 'NutriVision AI is an intelligent computer vision clinical nutrition platform engineered for surgical recovery, medical rehabilitation, and eldercare convalescence.',
      footer_copyright: '© 2026 NutriVision AI. Developed for GAYATAMA 5 — International Web Technology Competition.',
      footer_disclaimer: 'Disclaimer: This platform provides clinical decision-support estimates and does not replace medical consultation.',

      // Profile Page
      profile_empty_title: 'Patient Profile Not Yet Configured',
      profile_empty_desc: 'You are currently in <b>Guest Mode</b>. Sign in to your patient account or start the 5-step diagnostic quiz to calculate your personalized recovery calorie needs and protein targets.',
      profile_btn_quiz: 'Start Nutrition Diagnostic (5 Steps)',
      profile_btn_login: 'Sign In to Patient Account',
      profile_title: 'Patient Profile',
      profile_badge_guest: 'Guest Mode',
      profile_badge_patient: 'Patient Profile',
      profile_badge_admin: 'Admin Mode',
      profile_not_logged_in: 'Not signed in',
      profile_unconfigured: 'Not configured (Start Nutrition Diagnostic)',
      profile_btn_recalc: 'Recalculate Diagnostic',
      profile_biometrics_title: 'Physical Metrics & Body Mass Index (BMI)',
      profile_biometrics_subtitle: 'Biometric calculations based on clinical standards',
      profile_weight_height: 'Weight & Height',
      profile_bmi: 'Body Mass Index (BMI)',
      profile_bmi_uncalc: '-- (Not calculated)',
      profile_tdee_prefix: 'Daily Calorie Requirement (TDEE):',
      profile_tdee_suffix: 'kcal/day to support tissue repair without excess fat accumulation during limited physical mobility.',
      profile_macros_title: 'Daily Macronutrient Targets',
      profile_macros_subtitle: 'ERAS (Enhanced Recovery After Surgery) clinical nutritional formulation',
      profile_target_protein: 'Protein Target',
      profile_target_carbs: 'Carbohydrate Target',
      profile_target_fat: 'Healthy Fat Target',
      profile_restrictions_title: 'Dietary Restrictions & Clinical Symptoms',
      profile_restrictions_subtitle: 'Adaptive data for recipe filtering and plate guidance',
      profile_allergies_label: 'Self-Declared Restrictions & Allergies:',
      profile_allergies_empty: 'No restrictions declared',
      profile_activity_label: 'Activity Level & Therapy:',
      profile_activity_empty: 'No activity level declared',
      profile_caregiver_title: 'Caregiver Portal (Caregiver Access)',
      profile_caregiver_subtitle: 'Manage remote monitoring permissions for family and clinical team',
      profile_caregiver_badge: 'Protected Read-Only Mode',
      profile_caregiver_desc: 'Caregivers with a designated link can only view daily nutrition summaries and meal history without permission to alter profile or medical records.',
      profile_caregiver_link_label: 'Encrypted Caregiver Access Link:',
      profile_caregiver_copy_btn: 'Copy Caregiver Link',
      profile_session_title: 'Active Login Session',
      profile_session_connected: 'Connected as',
      profile_session_not_connected: 'Not connected',
      profile_session_switch: 'Switch Patient Account',
      profile_session_logout: 'Sign Out (Logout)',

      // Profile Language & Accessibility (NEW)
      profile_language_title: 'Language & Accessibility Settings',
      profile_language_subtitle: 'Choose interface language and customize display readability',
      profile_language_heading: 'Interface Language',
      profile_lang_en: 'English (Default)',
      profile_lang_id: 'Bahasa Indonesia',
      profile_font_heading: 'Text Size Scaling',
      profile_font_normal: 'Normal (100%)',
      profile_font_large: 'Large (110%)',
      profile_font_xl: 'Extra Large (120%)',
      profile_contrast_heading: 'High Contrast Display',
      profile_contrast_label: 'High Contrast Mode (Senior-Friendly)',

      // App Shell & Topbar
      topbar_search_placeholder: 'Search local foods, recipes, or clinical guidelines...',
      topbar_greeting_guest: 'Welcome to <span style="color:var(--teal-700);">NutriVision AI</span>',
      topbar_greeting_patient: 'Good day, <span class="user-name-placeholder">{name}</span>',
      topbar_greeting_admin: 'Admin Panel: <span class="user-name-placeholder" style="color:var(--matcha-600);">Super Admin Telemetry</span>',
      topbar_btn_scan: 'Scan Meal Photo',
      topbar_profile_chip: 'Profile',

      // Overview View & Cards
      ov_hero_title: 'Recovery Nutrition AI Scanner',
      ov_hero_desc: 'Instant meal photo segmentation with nutritional confidence intervals for clinical healing protocols.',
      ov_btn_scan: 'Scan Meal',
      ov_btn_history: 'Scan History',
      ov_stat_calories: 'Calories Today',
      ov_stat_protein: 'Protein Intake',
      ov_stat_carbs: 'Carbohydrates',
      ov_stat_fat: 'Healthy Fats',
      ov_card1_title: 'AI-Powered Food Image Segmentation',
      ov_card1_desc: 'Capture your meal via camera or gallery. The system segments ingredients, computes nutritional ranges, and matches them against your clinical recovery phase.',
      ov_btn_scan_new: 'Scan New Meal',
      ov_btn_catalog: 'Food Catalog',
      ov_legend_title: 'Composition Breakdown & AI Confidence',
      ov_btn_manual_correct: 'Manual Correction',
      ov_card2_title: 'Clinical Recovery Nutrition Targets',
      ov_phase_prefix: 'Active Phase:',
      ov_card2_badge: 'On Track',
      ov_donut_label: 'Daily Protein',
      macro_calories: 'Total Calories (Basal Energy)',
      ov_advice_hdr: 'Recovery Nutrition Advice:',
      ov_advice_body: 'Complete your diagnostic profile or scan meals to receive phase-specific tissue healing nutritional guidance.',
      ov_card3_title: '7-Day Nutrition Compliance Trend',
      ov_card3_subtitle: 'Consistency in achieving recovery protein & vital micronutrients',
      ov_card3_streak: 'Streak: 6 Days',
      ov_weekly_avg: 'Weekly Average: <b>92% achieved</b>',
      ov_btn_pdf: 'Export PDF Document',
      ov_btn_caregiver_text: 'Copy Telehealth Text',

      // Meal Planner View
      plan_filter_title: 'Symptom-Aware Texture & Food Filter',
      plan_filter_sub: 'Select active clinical complaints or symptoms for automatic texture adaptation',
      symp_nausea: 'Nausea',
      symp_dysphagia: 'Difficulty Swallowing / Dysphagia',
      symp_constipation: 'Constipation / Bowel Sluggishness',
      symp_low_appetite: 'Low Appetite',
      plan_main_title: 'Adaptive Recovery Meal Planner',
      plan_main_sub: 'Structured daily meal itinerary matched to your clinical recovery profile',
      plan_desc: 'Choose between fully optimized standard clinical options or budget-friendly local superfood alternatives while fulfilling complete tissue repair protein targets.',
      plan_opt_standard: 'Standard Option (Optimal)',
      plan_opt_budget: 'Low-Budget Option (Local Superfoods)',

      // Food Catalog View
      cat_heading: 'Bappenas & TKPI Indonesian Food Catalog',
      cat_sub: 'Official Indonesian Food Composition Database (TKPI Bappenas/Ministry of Health) & National Food Agency Price Baselines.',
      cat_pill_all: 'All',
      cat_pill_fav: 'My Favorites',
      cat_pill_animal: 'Animal Protein',
      cat_pill_plant: 'Plant & Fiber',
      cat_pill_carbs: 'Carbohydrates',
      cat_pill_fruit: 'Fruits & Drinks',
      cat_pill_soft: 'Soft / Pureed Diet',
      cat_search_placeholder: 'Search local foods (Snakehead Fish, Tempeh, Egg, Brown Rice, etc.)...',

      // Community Forum View
      comm_heading: 'NutriVision Recovery Community',
      comm_sub: 'Share nutritious meal ideas, recovery strategies, and patient motivation',
      comm_btn_new_post: 'Write Recovery Tip',
      comm_filter_all: 'All Topics',
      comm_filter_surgery: 'Post-Surgery',
      comm_filter_rehab: 'Rehab & Physical Therapy',
      comm_filter_gym: 'Gym & Sports Recovery',

      // Recovery Progress & Journey
      prog_journey_title: 'Clinical Recovery Phase Journey',
      prog_journey_sub: 'Adaptive pathway engineered from ERAS surgical protocols & tissue biological regeneration',
      prog_journey_active_badge: 'Phase 2 Active',
      prog_phase1_chip: 'Phase 1 · Days 1–5',
      prog_phase1_title: 'Acute & Inflammatory Phase',
      prog_phase1_desc: 'Alleviating tissue edema, soft-liquid dietary transition, and electrolyte rebalancing.',
      prog_phase2_chip: 'Phase 2 · Days 6–21 (Active)',
      prog_phase2_title: 'Proliferation & Synthesis Phase',
      prog_phase2_desc: 'High-target albumin and specific amino acids for rapid granulated tissue closure.',
      prog_phase3_chip: 'Phase 3 · Weeks 4–8',
      prog_phase3_title: 'Remodeling & Collagen Cross-Linking',
      prog_phase3_desc: 'Scar tissue tensile strength reinforcement and solid dietary transition.',
      prog_recap_title: 'Weekly Nutrition & Compliance Summary',
      prog_recap_sub: 'Daily compliance analysis against clinical recovery nutrition targets',
      prog_streak_badge: 'Streak: 6 Days',
      prog_telehealth_title: 'Patient Telehealth Summary',
      prog_ready_export: 'Report Ready to Export',
      prog_telehealth_desc: 'Average protein compliance over the past 7 days: <b>92%</b>. Patient exhibits high adherence to soft-textured animal and plant protein intake. No significant constipation reported following increased dietary fiber.',
      prog_btn_pdf: 'Export Report Document (PDF)',
      prog_btn_telehealth: 'Copy Telehealth Report',

      // Toasts & Alerts
      toast_lang_changed: 'Language set to English',
      toast_font_changed: 'Text size set to: ',
      toast_contrast_on: 'High Contrast Mode Enabled',
      toast_contrast_off: 'Standard Contrast Mode Enabled',
      toast_caregiver_copied: 'Caregiver access link copied to clipboard!'
    },

    id: {
      // Document metadata & brands
      app_title: 'NutriVision AI — Panduan Gizi Pemulihan & Segmentasi Pangan',
      app_description: 'NutriVision AI — Platform Segmentasi & Panduan Gizi Makanan Berbasis Computer Vision untuk Pemulihan Pasca-Operasi, Rehabilitasi Medis, dan Gym Recovery',
      brand_tagline: 'Panduan Gizi Pemulihan & Segmentasi Pangan',

      // Navbar
      nav_simulation: 'Simulasi AI',
      nav_clinical: 'Fitur Klinis',
      nav_superfoods: 'Pangan Lokal',
      nav_evidence: 'Bukti Riset',
      nav_calculator: 'Kalkulator',
      nav_database: 'Database',
      nav_login: 'Login',
      nav_overview: 'Ringkasan',
      nav_planner: 'Menu',
      nav_catalog: 'Katalog',
      nav_community: 'Komunitas',
      nav_progress: 'Progres',
      nav_profile: 'Profil',
      nav_scan: 'Pindai Piring',

      // Transparency Alert Banner
      banner_notice: '<strong>Pemberitahuan Layanan Publik &amp; Pendukung Keputusan:</strong> Seluruh segmentasi citra dan estimasi gizi pada aplikasi ini disajikan sebagai rentang pendukung keputusan (<em>clinical decision-support</em>), bukan pengganti nasihat, resep, atau diagnosis medis profesional dokter/ahli gizi.',

      // Hero Section
      hero_title: 'Scan makanan, bukan tebak-tebak gizi <span class="highlight-coral">pemulihan</span>.',
      hero_desc: 'Ketika baru melewati operasi, cedera fisik, atau merawat lansia pasca-rawat inap, takaran protein tubuh tidak boleh sekadar tebakan. NutriVision AI mengenali isi piring Anda melalui foto, menghitung rentang gizi instan, dan menyesuaikan menu ramah gejala dengan pangan lokal nusantara.',
      hero_cta_primary: 'Masuk &amp; Kalibrasi Dasbor',
      hero_cta_secondary: 'Lihat Pratinjau Dasbor →',

      // Hero Preview Card
      preview_title: 'Hasil Segmentasi Piring AI',
      preview_ready: 'Siap Memindai',
      preview_empty_title: 'Piring Belum Terisi',
      preview_empty_sub: 'Belum ada makanan terdeteksi',
      preview_seg_protein: 'Segmen Protein',
      preview_seg_carbs: 'Segmen Karbohidrat',
      preview_seg_veg: 'Segmen Serat / Sayur',
      preview_target_label: 'Target Harian: ',
      preview_target_val: '0g / 98g Protein',
      preview_scan_cta: 'Coba Scan Sendiri →',

      // AI Simulation Feature Section
      feature_title: 'Segmentasi citra makanan berbasis AI',
      feature_subtitle: 'Deteksi instan porsi protein, karbohidrat, dan serat dengan akurasi klinis tinggi',
      preset_empty: 'Piring Kosong (Reset)',
      preset_soft_bubur_gabus: 'Bubur Ikan Gabus (Disfagia)',
      preset_standard_nasi_ayam: 'Nasi Dada Ayam & Kangkung',
      preset_fish_kembung: 'Pepes Ikan Kembung (Omega-3)',
      preset_salmon_quinoa: 'Salmon & Quinoa Bowl',
      mode_ai: 'Lapisan AI',
      mode_photo: 'Foto Asli',
      mode_heatmap: 'Heatmap',
      conf_ready: 'Status AI: Siap Memindai',
      energy_empty: 'Densitas Energi: 0 kkal (Piring Kosong · Menunggu Pemindaian)',
      advice_empty: '<strong>Panduan AI:</strong> Belum ada data makanan yang dihitung. Silakan pilih salah satu menu sampel di atas untuk simulasi segmentasi, atau gunakan tombol scan untuk menguji foto piring asli.',
      comp_prot_empty: 'Komponen Protein: Belum terdeteksi',
      comp_carb_empty: 'Komponen Karbohidrat: Belum terdeteksi',
      comp_veg_empty: 'Sayur & Serat: Belum terdeteksi',
      cv_ready: 'Akurasi CV: Siap Memindai',

      // Clinical Recovery Assessment Factors (Protein, Vitamins, Minerals)
      assessment_badge: 'KRITERIA UTAMA PEMULIHAN',
      assessment_title: 'Faktor Penilaian Gizi Klinis',
      factor_protein_title: 'Protein & Albumin',
      factor_prot_sub: 'Granulasi Luka & Perbaikan Seluler',
      factor_vit_title: 'Vitamin (C, A, D)',
      factor_vit_sub: 'Biosintesis Kolagen & Imunologis',
      factor_min_title: 'Mineral (Zinc & Zat Besi)',
      factor_min_sub: 'Proliferasi Sel & Oksigenasi Jaringan',

      // Clinical Support Features
      support_title: '3 Pilar Presisi Gizi Pemulihan Klinis',
      support_subtitle: 'Algoritma adaptif berbasis pedoman klinis pasca-bedah, rehabilitasi medik, dan regenerasi jaringan',
      support_card1_title: 'Gizi Adaptif Fase Klinis (ERAS)',
      support_card1_desc: 'Penyesuaian otomatis dari tekstur lunak pasca-anestesi hingga pemenuhan albumin tinggi fase proliferasi dan remodeling.',
      support_card1_badge: 'Protokol Klinis',
      support_card2_title: 'Bioavailabilitas Pangan Nusantara',
      support_card2_desc: 'Pemanfaatan albumin ikan gabus, peptida tempe, daun kelor, dan ragam pangan lokal dengan bioavailabilitas tinggi untuk akselerasi penyembuhan 2x lebih cepat.',
      support_card2_badge: 'Berbasis Riset',
      support_card3_title: 'Portal Pendamping & Telehealth',
      support_card3_desc: 'Bagikan tautan rekapitulasi asupan gizi harian secara terenkripsi kepada dokter, ahli gizi, atau keluarga pendamping.',
      support_card3_badge: 'Akses Terproteksi',

      // Local Superfoods Section
      superfoods_title: 'Pangan Super Lokal untuk Penyembuhan Cepat',
      superfoods_subtitle: 'Kekayaan biodiversitas nusantara dengan profil gizi klinis tinggi yang teruji secara empiris dan ilmiah',

      // Research Evidence
      evidence_title: 'Bukti Ilmiah & Landasan Riset Klinis',
      evidence_subtitle: 'Mengacu pada pedoman ERAS, Angka Kecukupan Gizi (AKG) Kemenkes RI, dan riset regenerasi jaringan',

      // Calculator Section
      calc_title: 'Kalkulator Kalori & Protein Pemulihan',
      calc_subtitle: 'Hitung estimasi pengeluaran energi dan sasaran gramatur protein harian sesuai kondisi klinis',
      calc_condition_label: 'Kondisi Klinis / Tujuan',
      calc_condition_surgery: 'Pasca-Operasi (Penyembuhan Luka & Jaringan)',
      calc_condition_rehab: 'Rehabilitasi Medis / Fisioterapi',
      calc_condition_gym: 'Gym Recovery & Hipertrofi',
      calc_weight_label: 'Berat Badan (kg)',
      calc_activity_label: 'Tingkat Aktivitas Harian',
      calc_activity_bed: 'Istirahat Total / Bedrest',
      calc_activity_light: 'Jalan Ringan / Duduk',
      calc_activity_moderate: 'Rehabilitasi Aktif / Fisioterapi',
      calc_calories_label: 'Estimasi Kalori Harian',
      calc_protein_label: 'Target Protein Harian',
      calc_formula_note: 'Dihitung berdasarkan formula Harris-Benedict & pedoman protein bedah ASPEN / ESPEN (1.5 - 2.0g/kg).',

      // Footer
      footer_desc: 'NutriVision AI adalah platform cerdas pemandu gizi berbasis computer vision untuk percepatan pemulihan bedah, rehabilitasi fisik, dan rawat lansia.',
      footer_copyright: '© 2026 NutriVision AI. Dikembangkan untuk GAYATAMA 5 — International Web Technology Competition.',
      footer_disclaimer: 'Pernyataan: Aplikasi ini memberikan rekomendasi pendukung keputusan klinis dan tidak menggantikan konsultasi medis dokter.',

      // Profile Page
      profile_empty_title: 'Profil Pasien Belum Dikonfigurasi',
      profile_empty_desc: 'Kamu saat ini berada dalam <b>Mode Tamu</b>. Masuk ke akun pasien atau mulai kuesioner diagnostik gizi 5-langkah untuk menghitung kebutuhan kalori dan target protein pemulihanmu secara personal.',
      profile_btn_quiz: 'Mulai Diagnostik Gizi (5 Langkah)',
      profile_btn_login: 'Masuk ke Akun Pasien',
      profile_title: 'Profil Pasien',
      profile_badge_guest: 'Mode Tamu',
      profile_badge_patient: 'Profil Pasien',
      profile_badge_admin: 'Mode Admin',
      profile_not_logged_in: 'Belum masuk akun',
      profile_unconfigured: 'Belum dikonfigurasi (Mulai Diagnostik Gizi)',
      profile_btn_recalc: 'Hitung Ulang Diagnostik',
      profile_biometrics_title: 'Metrik Fisik & Indeks Massa Tubuh (BMI)',
      profile_biometrics_subtitle: 'Kalkulasi biometrik berdasarkan standar klinis',
      profile_weight_height: 'Berat & Tinggi Badan',
      profile_bmi: 'Indeks Massa Tubuh (BMI)',
      profile_bmi_uncalc: '-- (Belum dihitung)',
      profile_tdee_prefix: 'Kebutuhan Kalori Harian (TDEE):',
      profile_tdee_suffix: 'kkal/hari untuk mendukung proses perbaikan jaringan tanpa memicu kelebihan lemak saat gerak fisik terbatas.',
      profile_macros_title: 'Sasaran Makronutrisi Harian',
      profile_macros_subtitle: 'Formula gizi ERAS (Enhanced Recovery After Surgery)',
      profile_target_protein: 'Target Protein',
      profile_target_carbs: 'Target Karbohidrat',
      profile_target_fat: 'Target Lemak Sehat',
      profile_restrictions_title: 'Pantangan Makanan & Gejala Klinis Pasien',
      profile_restrictions_subtitle: 'Data adaptasi filter resep dan panduan piring makan',
      profile_allergies_label: 'Pantangan & Alergi Deklarasi Mandiri:',
      profile_allergies_empty: 'Belum mengisi deklarasi pantangan',
      profile_activity_label: 'Tingkat Aktivitas & Terapi:',
      profile_activity_empty: 'Belum mengisi tingkat aktivitas',
      profile_caregiver_title: 'Portal Pendamping (Caregiver Access)',
      profile_caregiver_subtitle: 'Kelola izin pantau jarak jauh untuk keluarga dan tim medis pendamping',
      profile_caregiver_badge: 'Mode Lihat-Saja Terproteksi',
      profile_caregiver_desc: 'Pendamping dengan tautan khusus hanya dapat melihat rekapitulasi asupan gizi harian dan riwayat piring makan tanpa izin mengubah pengaturan profil atau data rekam medis pasien.',
      profile_caregiver_link_label: 'Tautan Akses Pendamping Terenkripsi:',
      profile_caregiver_copy_btn: 'Salin Link Pendamping',
      profile_session_title: 'Status Sesi Login Aktif',
      profile_session_connected: 'Terhubung sebagai',
      profile_session_not_connected: 'Belum terhubung',
      profile_session_switch: 'Ganti Akun Pasien',
      profile_session_logout: 'Keluar (Logout)',

      // Profile Language & Accessibility (NEW)
      profile_language_title: 'Pengaturan Bahasa & Tampilan',
      profile_language_subtitle: 'Pilih bahasa pengantar antarmuka dan sesuaikan kenyamanan tampilan',
      profile_language_heading: 'Bahasa Antarmuka',
      profile_lang_en: 'English (Default)',
      profile_lang_id: 'Bahasa Indonesia',
      profile_font_heading: 'Ukuran Teks & Aksesibilitas',
      profile_font_normal: 'Normal (100%)',
      profile_font_large: 'Besar (110%)',
      profile_font_xl: 'Ekstra Besar (120%)',
      profile_contrast_heading: 'Kontras Warna Layar',
      profile_contrast_label: 'Mode Kontras Tinggi (Ramah Lansia)',

      // App Shell & Topbar
      topbar_search_placeholder: 'Cari pangan lokal, resep, atau panduan klinis...',
      topbar_greeting_guest: 'Selamat datang di <span style="color:var(--teal-700);">NutriVision AI</span>',
      topbar_greeting_patient: 'Selamat siang, <span class="user-name-placeholder">{name}</span>',
      topbar_greeting_admin: 'Panel Administrator: <span class="user-name-placeholder" style="color:var(--matcha-600);">Super Admin Telemetry</span>',
      topbar_btn_scan: 'Pindai Foto Makanan',
      topbar_profile_chip: 'Profil',

      // Overview View & Cards
      ov_hero_title: 'Scanner AI Nutrisi Pemulihan',
      ov_hero_desc: 'Segmentasi instan foto makanan dengan rentang estimasi klinis untuk protokol regenerasi jaringan.',
      ov_btn_scan: 'Pindai Piring',
      ov_btn_history: 'Riwayat Scan',
      ov_stat_calories: 'Kalori Hari Ini',
      ov_stat_protein: 'Asupan Protein',
      ov_stat_carbs: 'Karbohidrat',
      ov_stat_fat: 'Lemak Sehat',
      ov_card1_title: 'Segmentasi Citra Makanan Berbasis AI',
      ov_card1_desc: 'Foto makananmu dari kamera atau galeri. Sistem menyekat bahan per segmen, mengestimasi rentang gizi, dan mencocokkannya dengan target fase pemulihanmu.',
      ov_btn_scan_new: 'Scan Makanan Baru',
      ov_btn_catalog: 'Katalog Pangan',
      ov_legend_title: 'Breakdown Komposisi & Keyakinan AI',
      ov_btn_manual_correct: 'Koreksi Manual',
      ov_card2_title: 'Target Gizi Pemulihan Hari Ini',
      ov_phase_prefix: 'Fase aktif:',
      ov_card2_badge: 'On Track',
      ov_donut_label: 'Protein Harian',
      macro_calories: 'Kalori Total (Energi Basal)',
      ov_advice_hdr: 'Saran Gizi Pemulihan:',
      ov_advice_body: 'Isi data diagnostik atau scan makananmu untuk menerima rekomendasi asupan spesifik fase pemulihan jaringan.',
      ov_card3_title: 'Tren Kepatuhan Gizi 7 Hari',
      ov_card3_subtitle: 'Konsistensi pencapaian protein & mikronutrien pemulihan',
      ov_card3_streak: 'Streak: 6 Hari',
      ov_weekly_avg: 'Rata-rata mingguan: <b>92% tercapai</b>',
      ov_btn_pdf: 'Ekspor Dokumen PDF',
      ov_btn_caregiver_text: 'Salin Teks Nakes',

      // Meal Planner View
      plan_filter_title: 'Symptom-Aware Texture & Food Filter',
      plan_filter_sub: 'Tandai keluhan/gejala saat ini untuk penyesuaian tekstur menu',
      symp_nausea: 'Mual',
      symp_dysphagia: 'Sulit Menelan / Disfagia',
      symp_constipation: 'Konstipasi / Sembelit',
      symp_low_appetite: 'Nafsu Makan Rendah',
      plan_main_title: 'Recovery Meal Planner Adaptif',
      plan_main_sub: 'Rencana menu harian terstruktur berdasarkan profil kondisi klinis',
      plan_desc: 'Pilih antara opsi standar bergizi penuh atau opsi hemat biaya berbasis pangan lokal yang ramah anggaran namun tetap mencukupi target protein untuk regenerasi jaringan.',
      plan_opt_standard: 'Opsi Standar (Optimal)',
      plan_opt_budget: 'Opsi Hemat / Low-Budget',

      // Food Catalog View
      cat_heading: 'Katalog Pangan Lokal Bappenas & TKPI',
      cat_sub: 'Data Resmi Komposisi Pangan Indonesia (TKPI Bappenas/Kemenkes RI) & Acuan Harga Pangan Bapanas.',
      cat_pill_all: 'Semua',
      cat_pill_fav: 'Favorit Saya',
      cat_pill_animal: 'Protein Hewani',
      cat_pill_plant: 'Nabati & Sayur',
      cat_pill_carbs: 'Karbohidrat',
      cat_pill_fruit: 'Buah & Minuman',
      cat_pill_soft: 'Diet Lunak',
      cat_search_placeholder: 'Cari pangan lokal (Ikan Gabus, Tempe, Telur, Beras, dll)...',

      // Community Forum View
      comm_heading: 'Ruang Komunitas Pemulihan NutriVision',
      comm_sub: 'Saling berbagi ide makanan, strategi pemulihan, dan motivasi',
      comm_btn_new_post: 'Tulis Tips Baru',
      comm_filter_all: 'Semua Topik',
      comm_filter_surgery: 'Pasca-Operasi',
      comm_filter_rehab: 'Fisioterapi / Cedera',
      comm_filter_gym: 'Gym Recovery',

      // Recovery Progress & Journey
      prog_journey_title: 'Peta Perjalanan Fase Pemulihan Klinis',
      prog_journey_sub: 'Jalur adaptif berbasis protokol ERAS & regenerasi biologis jaringan',
      prog_journey_active_badge: 'Fase 2 Aktif',
      prog_phase1_chip: 'Fase 1 · Hari 1–5',
      prog_phase1_title: 'Fase Inflamasi & Akut',
      prog_phase1_desc: 'Meredakan edema jaringan, adaptasi diet cair-lunak, dan stabilisasi elektrolit.',
      prog_phase2_chip: 'Fase 2 · Hari 6–21 (Aktif)',
      prog_phase2_title: 'Fase Proliferasi & Sintesis',
      prog_phase2_desc: 'Target tinggi albumin & asam amino spesifik untuk penutupan jaringan baru.',
      prog_phase3_chip: 'Fase 3 · Minggu 4–8',
      prog_phase3_title: 'Fase Remodeling & Kolagen',
      prog_phase3_desc: 'Penguatan elastisitas jaringan parut dan transisi ke makanan padat seimbang.',
      prog_recap_title: 'Rekapitulasi Kepatuhan Gizi & Nutrisi Mingguan',
      prog_recap_sub: 'Analisis kepatuhan harian terhadap anjuran target gizi',
      prog_streak_badge: 'Streak 6 Hari',
      prog_telehealth_title: 'Ringkasan Telehealth Pasien',
      prog_ready_export: 'Rekap Siap Ekspor',
      prog_telehealth_desc: 'Rata-rata kepatuhan protein 7 hari terakhir: <b>92%</b>. Pasien menunjukkan konsistensi tinggi pada asupan protein hewani dan nabati bertekstur lunak. Tidak dilaporkan adanya keluhan sembelit signifikan setelah penambahan serat sayur bening bayam.',
      prog_btn_pdf: 'Ekspor Dokumen Laporan (PDF)',
      prog_btn_telehealth: 'Salin Laporan Telehealth',

      // Toasts & Alerts
      toast_lang_changed: 'Bahasa berhasil diubah ke Bahasa Indonesia',
      toast_font_changed: 'Ukuran teks diatur ke: ',
      toast_contrast_on: 'Mode Kontras Tinggi Diaktifkan',
      toast_contrast_off: 'Mode Standar Diaktifkan',
      toast_caregiver_copied: 'Tautan pendamping berhasil disalin!'
    }
  };

  class I18nManager {
    constructor() {
      const savedLang = localStorage.getItem('nutrivision_lang');
      // Default to English ('en') if not set
      this.currentLang = (savedLang === 'id' || savedLang === 'en') ? savedLang : 'en';
    }

    init() {
      this.applyLanguage(this.currentLang, false);
    }

    getLanguage() {
      return this.currentLang;
    }

    t(key, fallback = '') {
      const langDict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
      if (langDict && langDict[key] !== undefined) {
        return langDict[key];
      }
      const fallbackDict = TRANSLATIONS.en;
      if (fallbackDict && fallbackDict[key] !== undefined) {
        return fallbackDict[key];
      }
      return fallback || key;
    }

    setLanguage(lang, showToast = true) {
      if (lang !== 'en' && lang !== 'id') lang = 'en';
      this.currentLang = lang;
      localStorage.setItem('nutrivision_lang', lang);
      document.documentElement.lang = lang;

      // Also persist to app userProfile if available
      if (window.app && window.app.userProfile) {
        window.app.userProfile.language = lang;
        if (typeof window.app.saveUserProfile === 'function') {
          window.app.saveUserProfile();
        }
      }

      this.applyLanguage(lang, showToast);

      // Trigger app onLanguageChange hooks if defined
      if (window.app && typeof window.app.onLanguageChange === 'function') {
        window.app.onLanguageChange(lang);
      }
    }

    applyLanguage(lang, showToast = false) {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
      document.documentElement.lang = lang;

      // 1. Update text & HTML nodes with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key && dict[key] !== undefined) {
          const val = dict[key];
          if (val.includes('<') && val.includes('>')) {
            el.innerHTML = val;
          } else {
            el.textContent = val;
          }
        }
      });

      // 2. Update placeholder attributes
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key && dict[key] !== undefined) {
          el.placeholder = dict[key];
        }
      });

      // 3. Update title attributes
      document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const key = el.getAttribute('data-i18n-title');
        if (key && dict[key] !== undefined) {
          el.title = dict[key];
        }
      });

      // 4. Update landing page switcher active state
      document.querySelectorAll('.lp-lang-btn').forEach((btn) => {
        const btnLang = btn.getAttribute('data-lang');
        btn.classList.toggle('active', btnLang === lang);
      });

      // 5. Update profile switcher active state
      document.querySelectorAll('.profile-lang-btn').forEach((btn) => {
        const btnLang = btn.getAttribute('data-lang');
        btn.classList.toggle('active', btnLang === lang);
      });

      // 6. Refresh icons if any were replaced
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }

      // 7. Toast feedback
      if (showToast && window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(this.t('toast_lang_changed'));
      }
    }
  }

  window.nutriI18n = new I18nManager();
  window.i18n = window.nutriI18n;

  // Auto-init early as soon as script evaluates
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.nutriI18n.init();
    });
  } else {
    window.nutriI18n.init();
  }
})();
