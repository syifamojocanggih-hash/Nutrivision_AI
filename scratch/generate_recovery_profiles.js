// Script to construct and validate the 12-Taxonomy Recovery Profiles for NutriVision AI
const fs = require('fs');
const path = require('path');

const recoveryProfiles = {
  // =========================================================================
  // KELOMPOK 1: PASCA-OPERASI (MEDIS) — 7 KATEGORI KLINIS INTERNASIONAL
  // =========================================================================

  'post_op_digestive': {
    id: 'post_op_digestive',
    group: 'Pasca-Operasi (Medis)',
    groupKey: 'medical',
    category: 'Bedah Saluran Cerna',
    title: 'Pasca-Bedah Saluran Cerna (Digestif)',
    titleEn: 'Post-Digestive Surgery Recovery',
    protocol: 'Konsensus ESPEN Surgery, ERAS Society & IDDSI Protocol',
    protocolEn: 'ESPEN Surgical & ERAS Society Digestive Protocol',
    activeBadge: 'Fase 2 Aktif',
    icon: 'utensils',
    accentColor: '#15803D',
    caloricNeedType: 'Maintenance to Moderate Surplus (1850 - 2000 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 1.5,
      carbPct: 55,
      fatPct: 25,
      fiberRestriction: true,
      textureTransition: 'Cair -> Saring -> Lunak -> Padat Bertahap'
    },
    keyMicronutrients: ['L-Glutamin', 'Zinc Organik', 'Albumin', 'Vitamin B12', 'Kalium Elektrolit'],
    recommendedApiSources: ['USDA FoodData Central', 'FatSecret Indonesia'],
    proteinMultiplier: 1.5,
    description: 'Fokus pada regenerasi mukosa saluran cerna, hemostasis jahitan anastomosis, pembatasan serat kasar awal, dan transisi tekstur IDDSI bertahap.',
    guidelines: [
      'Tingkatkan asam amino L-Glutamin & albumin untuk mempercepat regenerasi enterosit dan kekuatan anastomosis usus.',
      'Terapkan restriksi serat kasar dan makanan bergas pada 4 minggu pertama untuk mencegah distensi abdomen pasca-ileus.',
      'Transisi tekstur secara gradual dari cair jernih, bubur saring lunak, hingga makanan padat mudah cerna.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Hari 1–5',
        title: 'Fase Adaptasi Cair Jernih & Saring',
        desc: 'Diet cair jernih bertransisi ke sup saring bening, stabilisasi elektrolit, dan pencegahan ileus pasca-anestesi.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 5],
        clinicalFocus: 'Hemostasis luka bedah cerna, resolusi ileus, & diet saring rendah residu',
        proteinTarget: '1.2 - 1.4 g/kgBB (Cairan Protein Isolat)',
        texture: 'Cair jernih, kaldu saring, puree halus',
        superfoods: ['Kaldu Ikan Gabus Bening', 'Air Kelapa Murni', 'Puree Labu Kuning Halus']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Hari 6–21 (Aktif)',
        title: 'Fase Regenerasi Mukosa & Makanan Lunak',
        desc: 'Makanan lunak tim saring kaya albumin & L-Glutamin untuk epitelisasi mukosa usus dan integritas jahitan.',
        status: 'active',
        progressPct: 68,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [6, 21],
        clinicalFocus: 'Regenerasi enterosit, pembentukan jaringan granulasi, & absorpsi nutrisi mikron',
        proteinTarget: '1.5 g/kgBB (Tinggi Albumin & Glutamin)',
        texture: 'Lunak tim, bubur halus, tahu sutra kukus',
        superfoods: ['Ikan Gabus Tim Albumin', 'Tahu Sutra Kukus Kaldu', 'Putih Telur Rebus']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 4–8',
        title: 'Fase Adaptasi Padat & Reintroduksi Serat',
        desc: 'Pengenalan serat larut air bertahap, normalisasi motilitas peristaltik usus, dan diet seimbang padat.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [22, 56],
        clinicalFocus: 'Kekuatan fungsional dinding cerna & adaptasi mikrobioma kolon',
        proteinTarget: '1.3 - 1.5 g/kgBB',
        texture: 'Padat lunak ke normal berkuah',
        superfoods: ['Dada Ayam Kukus Jahe', 'Nasi Tim Beras Putih/Merah', 'Sayur Oyong Bening']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Hemostasis Anastomosis & Transisi Diet Lunak',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'ESPEN Guideline: Clinical Nutrition in Surgery (2021) & ERAS Colorectal Consensus',
        healingTarget: {
          title: 'Integritas Mukosa Saluran Cerna & Penutupan Jahitan',
          markers: 'Albumin serum > 3.5 g/dL, tidak ada kebocoran anastomosis, peristaltik usus normal, feses berbentuk lunak.',
          clinicalGoal: 'Mencegah dehisiensi anastomosis lambung/usus dan meminimalkan ileus post-operatif.'
        },
        nutritionTarget: {
          protein: '1.4 – 1.6 g/kg BB/hari (Isolat Peptida & Albumin Ikan Gabus)',
          calories: '1850 – 2000 kkal/hari',
          micronutrients: 'L-Glutamin 10g, Zinc 15-20mg, Vitamin B12, Kalium Elektrolit',
          texture: 'Diet cair pekat ke bubur halus saring bergizi (IDDSI Level 3-4)',
          recommendedMenu: ['Ikan Gabus Tim Bening', 'Putih Telur Rebus Halus', 'Bubur Beras Gandum Halus', 'Puree Labu Kuning']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Proliferasi Vili Usus & Reintroduksi Serat Larut',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Weimann A. et al., ESPEN Guidelines & Surgical Wound Healing Consensus',
        healingTarget: {
          title: 'Absorpsi Nutrisi Optimal & Adaptasi Mikrobiota',
          markers: 'Peningkatan kapasitas absorpsi makronutrien, toleransi makanan bertekstur padat lunak tanpa mual/kembung.',
          clinicalGoal: 'Memulihkan luas permukaan absorpsi vili enterosit dan motilitas lambung normal.'
        },
        nutritionTarget: {
          protein: '1.3 – 1.5 g/kg BB/hari',
          calories: '1900 – 2100 kkal/hari',
          micronutrients: 'Serat Larut Air (Pektin, Inulin) 15-20g, Multivitamin Kompleks, Probiotik Alami',
          texture: 'Makanan padat lunak berkuah hangat (IDDSI Level 5-6)',
          recommendedMenu: ['Dada Ayam Fillet Rebus Suwir', 'Tahu Tempe Tim Lembut', 'Nasi Tim Kaldu Ayam', 'Sup Wortel Labu Siam']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Pemulihan Fungsional & Pola Makan Normal',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'ERAS Society Consensus on Long-Term Functional Recovery Post-Surgery',
        healingTarget: {
          title: 'Restorasi Fungsional Total Saluran Cerna',
          markers: 'Toleransi penuh aneka kelompok makanan padat, berat badan stabil ideal, enzim pencernaan bekerja efisien.',
          clinicalGoal: 'Pencegahan adhesi pasca-bedah dan adaptasi pola makan bergizi seimbang permanen.'
        },
        nutritionTarget: {
          protein: '1.2 – 1.4 g/kg BB/hari (Maintenance Seimbang)',
          calories: '2000 kkal/hari',
          micronutrients: 'Serat Pangan Lengkap 25-30g, Kalsium 1000mg, Hidrasi 2.0-2.5 L/hari',
          texture: 'Makanan padat gizi seimbang normal harian',
          recommendedMenu: ['Ikan Kembung Panggang Kunyit', 'Pepes Tahu Jamur', 'Capcay Bening Brokoli Wortel', 'Pepaya Segar']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-pod-1',
        time: '07:00',
        title: 'Sarapan Lunak Tinggi Albumin',
        desc: 'Ikan gabus tim albumin (120g) + bubur beras halus + putih telur kukus (Target: 26g Protein).',
        category: 'nutrition',
        dotColor: '#15803D',
        scientificRationale: 'Albumin cepat diserap usus halus untuk regenerasi enterosit pasca-puasa (ESPEN, 2021).'
      },
      {
        id: 'sched-pod-2',
        time: '10:00',
        title: 'Hidrasi Kaldu Bening & Glutamin',
        desc: 'Kaldu ayam/ikan bening temu kunci (250ml) kaya elektrolit & asam amino glutamin.',
        category: 'hydration',
        dotColor: '#0284C7',
        scientificRationale: 'Glutamin adalah bahan bakar utama pemulihan enterosit mukosa lambung dan usus.'
      },
      {
        id: 'sched-pod-3',
        time: '12:30',
        title: 'Makan Siang Tim Rendah Residu',
        desc: 'Nasi tim kaldu ayam + tahu sutra kukus + labu siam rebus empuk (Target: 24g Protein).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Rendah residu serat kasar mengurangi gesekan pada dinding usus yang sedang menyembuh.'
      },
      {
        id: 'sched-pod-4',
        time: '16:00',
        title: 'Snack Puree Labu Kuning & Zinc',
        desc: 'Puding puree labu kuning + susu kedelai hangat tanpa gula (Target: Zinc & Antioksidan).',
        category: 'snack',
        dotColor: '#7C3AED',
        scientificRationale: 'Zinc mengkatalisis sintesis protein DNA fibroblas pada dinding submukosa.'
      },
      {
        id: 'sched-pod-5',
        time: '19:00',
        title: 'Makan Malam Protein Cepat Serap',
        desc: 'Ikan tenggiri kukus kuah jahe bening + kentang rebus tumbuk + sup bayam saring (Target: 25g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Jahe menenangkan motilitas lambung dan mengurangi spasme kembung nokturnal.'
      },
      {
        id: 'sched-pod-6',
        time: '21:30',
        title: 'Seduhan Herbal Chamomile & Istirahat Usus',
        desc: 'Teh chamomile hangat 200ml + istirahat tidur anabolik 8 jam untuk regenerasi sistem cerna.',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Relaksasi vagal saat tidur dalam memperlancar mikrosirkulasi darah ke organ visceral.'
      }
    ],
    contraindications: [
      {
        id: 'contra-pod-1',
        food: 'Makanan Gorengan Jelantah & Lemak Tinggi',
        risk: 'Tinggi (Hindari Total)',
        reason: 'Memperlambat waktu pengosongan lambung, memicu refluks empedu, dan iritasi luka anastomosis usus.',
        forbiddenItems: ['Gorengan pinggir jalan (bakwan, cireng, mendoan)', 'Ayam goreng renyah cepat saji', 'Gulai santan kental pekat'],
        citation: 'ESPEN Surgical Nutrition Guidelines & British Journal of Surgery'
      },
      {
        id: 'contra-pod-2',
        food: 'Makanan Sangat Pedas & Asam Ekstrem',
        risk: 'Tinggi (Hindari Total)',
        reason: 'Kapsaisin cabai mengiritasi mukosa lambung yang meradang dan memicu hiperperistaltik diare.',
        forbiddenItems: ['Sambal cabai rawit pedas level tinggi', 'Cuka pempek asam pekat', 'Asinan buah asam tajam'],
        citation: 'Indonesian Society of Digestive Surgeons (IKABDI) Consensus'
      },
      {
        id: 'contra-pod-3',
        food: 'Sayuran & Buah Penghasil Gas Berlebih / Serat Kasar',
        risk: 'Sedang (Batasi Ketat)',
        reason: 'Memicu fermentasi berlebih di usus besar yang menyebabkan meteorismus, distensi gas, dan nyeri jahitan.',
        forbiddenItems: ['Kol/kubis mentah, sawi putih, nangka muda', 'Durian, tape singkong/ketan', 'Minuman soda berkarbonasi'],
        citation: 'ERAS Society Perioperative Digestive Guidelines'
      },
      {
        id: 'contra-pod-4',
        food: 'Minuman Beralkohol & Produk Nikotin',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Merusak barier mukosa lambung dan menghambat vaskularisasi mikroskopis ke tepi sayatan usus.',
        forbiddenItems: ['Bir, anggur beralkohol, soju, arak masak', 'Rokok tembakau & rokok elektrik/vape'],
        citation: 'Annals of Surgery on Anastomotic Leakage Risk Factors'
      }
    ]
  },

  'post_op_oncology': {
    id: 'post_op_oncology',
    group: 'Pasca-Operasi (Medis)',
    groupKey: 'medical',
    category: 'Kanker (Onkologi)',
    title: 'Pasca-Bedah Kanker & Onkologi',
    titleEn: 'Post-Oncology Surgical & Immunonutrition',
    protocol: 'ESPEN Oncology Guidelines & Immunonutrition Consensus',
    protocolEn: 'ESPEN Oncology & Perioperative Immunonutrition Protocol',
    activeBadge: 'Immunonutrition Aktif',
    icon: 'shield-alert',
    accentColor: '#B91C1C',
    caloricNeedType: 'Tinggi Kalori & Protein (2000 - 2400 kkal / Anti-Cachexia)',
    targetMacronutrients: {
      proteinGPerKg: 1.8,
      carbPct: 50,
      fatPct: 30,
      fiberRestriction: false,
      immunonutritionFocus: 'Arginin, Omega-3 EPA/DHA, Nukleotida'
    },
    keyMicronutrients: ['L-Arginin', 'Asam Lemak Omega-3 (EPA/DHA)', 'Nukleotida', 'Zinc', 'Selenium Antioksidan'],
    recommendedApiSources: ['USDA FoodData Central', 'FatSecret Indonesia'],
    proteinMultiplier: 1.8,
    description: 'Fokus pada imunonutrisi perioperatif, penanganan cancer cachexia, preservasi Lean Body Mass (LBM), dan modulasi respon inflamasi sistemik.',
    guidelines: [
      'Gunakan formula imunonutrisi kaya L-Arginin dan Omega-3 EPA untuk memodulasi respon imun sel T dan menekan sitokin IL-6/TNF-alpha.',
      'Targetkan asupan protein tinggi 1.5–2.0 g/kg BB/hari untuk mencegah katabolisme massa otot bebas lemak.',
      'Sajikan makanan dalam porsi kecil namun sering dan padat energi untuk mengatasi anoreksia dan mual pasca-kemoterapi/bedah.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2',
        title: 'Fase Imunonutrisi Akut & Proteksi Infeksi',
        desc: 'Asupan formula imunonutrisi (Arginin + Omega-3) untuk mencegah komplikasi infeksi dan penurunan albumin drastis.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 14],
        clinicalFocus: 'Imunomodulasi seluler, modulasi sitokin inflamasi, & kestabilan metabolik',
        proteinTarget: '1.5 - 1.8 g/kgBB (Formula Imun)',
        texture: 'Cair kental ONS, sup saring padat energi',
        superfoods: ['Formula Imunonutrisi EPA', 'Ikan Kembung/Salmon Kukus', 'Jus Jambu Biji Ekstra Zinc']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–6 (Aktif)',
        title: 'Fase Anti-Cachexia & Pembentukan Massa Otot',
        desc: 'Kombinasi protein hewani bernilai biologis tinggi dan asam lemak sehat untuk melawan pemecahan sarkopenia kanker.',
        status: 'active',
        progressPct: 65,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [15, 42],
        clinicalFocus: 'Supresi katabolisme otot skelet via EPA/DHA & keseimbangan nitrogen positif',
        proteinTarget: '1.8 - 2.0 g/kgBB',
        texture: 'Lunak padat bergizi tinggi porsi kecil sering',
        superfoods: ['Dada Ayam Kampung Tim Jahe', 'Putih Telur Rebus Organik', 'Avokad & Kacang Kedelai']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 7–12',
        title: 'Fase Konsolidasi Imun & Ketahanan Vitalitas',
        desc: 'Diet mediterania kaya antioksidan polifenol, serat prebiotik usus, dan energi optimal untuk terapi lanjutan.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [43, 84],
        clinicalFocus: 'Kekuatan fisik fungsional, performa status Karnofsky, & daya tahan terapi',
        proteinTarget: '1.5 - 1.8 g/kgBB',
        texture: 'Padat kaya nutrisi antioksidan',
        superfoods: ['Sup Ikan Gabus Temu Lawak', 'Pepes Tahu Tempe Probiotik', 'Smoothie Buah Beri & Bayam']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Imunonutrisi Spesifik & Kontrol Inflamasi Sistemik',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'ESPEN Guidelines on Nutrition in Cancer Patients (2021) & ESMO Clinical Practice',
        healingTarget: {
          title: 'Supresi Reaksi Inflamasi Sistemik & Imunokompetensi',
          markers: 'Penurunan rasio Neutrofil-Limfosit (NLR), kadar C-Reactive Protein (CRP) melandai, proteksi LBM.',
          clinicalGoal: 'Menurunkan risiko Surgical Site Infection (SSI) dan sepsis pasca-reseksi tumor.'
        },
        nutritionTarget: {
          protein: '1.5 – 1.8 g/kg BB/hari (Diperkaya Asam Amino Imun)',
          calories: '2100 – 2400 kkal/hari (Padat Kalori)',
          micronutrients: 'EPA/DHA 2.0g/hari, L-Arginin 12-15g, Zinc 25mg, Selenium 100mcg',
          texture: 'Diet lunak padat energi dengan ONS (Oral Nutritional Supplement)',
          recommendedMenu: ['Formula Imunonutrisi EPA', 'Ikan Gabus Tim Jahe Merah', 'Putih Telur Rebus', 'Puree Alpukat Madu']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Penanganan Cachexia & Keseimbangan Nitrogen Positif',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Arends J. et al., Cancer Cachexia Multimodal Management Consensus',
        healingTarget: {
          title: 'Pemulihan Massa Bebas Lemak & Status Fungsional',
          markers: 'Berat badan stabil tanpa penurunan >2% per bulan, skor indeks massa otot skelet (SMI) meningkat.',
          clinicalGoal: 'Mencegah wasting sindrom cachexia dan meningkatkan toleransi kemoterapi/radioterapi.'
        },
        nutritionTarget: {
          protein: '1.8 – 2.0 g/kg BB/hari',
          calories: '2200 – 2500 kkal/hari',
          micronutrients: 'Vitamin D3 2000-4000 IU, Vitamin B Kompleks, Asam Lemak Omega-3, Koenzim Q10',
          texture: 'Makanan padat seimbang porsi kecil sering (5-6 kali makan)',
          recommendedMenu: ['Dada Ayam Kukus Rempah', 'Sup Salmon Bening Wortel', 'Tahu Tempe Bacem Kukus', 'Nasi Tim Kaldu Sapi']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Pemeliharaan Imunitas Jangka Panjang & Kebugaran',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'American Cancer Society (ACS) Guidelines on Nutrition and Physical Activity',
        healingTarget: {
          title: 'Ketahanan Vitalitas Tubuh & Regenerasi Sel Sehat',
          markers: 'Kebugaran fisik mandiri (Karnofsky Score >80%), kadar hemoglobin dan albumin stabil dalam batas normal.',
          clinicalGoal: 'Mempersiapkan tubuh menghadapi fase terapi pemeliharaan jangka panjang tanpa malnutrisi.'
        },
        nutritionTarget: {
          protein: '1.5 – 1.7 g/kg BB/hari',
          calories: '2000 – 2300 kkal/hari',
          micronutrients: 'Antioksidan Polifenol Alami, Serat Pangan Prebiotik, Hidrasi 2.5 L/hari',
          texture: 'Makanan padat bergizi seimbang segar',
          recommendedMenu: ['Ikan Kembung Bakar Kunyit', 'Pepes Jamur Tahu Sutra', 'Sayur Bening Bayam Jagung Manis', 'Jus Buah Bit Jeruk']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-ponc-1',
        time: '07:00',
        title: 'Sarapan Padat Energi & Imunonutrisi',
        desc: 'Bubur havermut ikan gabus (100g) + 2 butir telur rebus + ONS kaya EPA (Target: 30g Protein).',
        category: 'nutrition',
        dotColor: '#B91C1C',
        scientificRationale: 'Kombinasi protein dan EPA menekan katabolisme otot pagi hari (ESPEN Oncology, 2021).'
      },
      {
        id: 'sched-ponc-2',
        time: '10:00',
        title: 'Snack Imunomodulator L-Arginin & Antioksidan',
        desc: 'Smoothie alpukat buah naga + suplementasi L-Arginin (Target: Lemak sehat & Imunitas).',
        category: 'snack',
        dotColor: '#7C3AED',
        scientificRationale: 'L-Arginin merangsang proliferasi limfosit T dan sintesis oksida nitrat mikrokapiler.'
      },
      {
        id: 'sched-ponc-3',
        time: '12:30',
        title: 'Makan Siang Anti-Inflamasi Omega-3',
        desc: 'Sup salmon / kembung kuah bening jahe + nasi tim beras merah + tahu tempe kukus (Target: 32g Protein).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Omega-3 laut dalam menekan jalur pensinyalan karsinogenesis dan sitokin katabolik.'
      },
      {
        id: 'sched-ponc-4',
        time: '16:00',
        title: 'Nutrisi Densitas Tinggi Porsi Mikro',
        desc: 'Puding labu kuning chia seed + susu kedelai fortified kalsium (Target: 12g Protein).',
        category: 'snack',
        dotColor: '#0284C7',
        scientificRationale: 'Porsi mikro sering menjamin kecukupan kalori pada pasien dengan anoreksia parsial.'
      },
      {
        id: 'sched-ponc-5',
        time: '19:00',
        title: 'Makan Malam Regeneratif & Selenium',
        desc: 'Dada ayam fillet kampung panggang rempah + sup jamur wortel + kentang rebus (Target: 28g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Selenium dan vitamin C bersinergi melindungi membran sel sehat dari radikal bebas.'
      },
      {
        id: 'sched-ponc-6',
        time: '21:30',
        title: 'ONS Malam & Restorasi Seluler',
        desc: 'Minuman nutrisi medis ONS 150ml hangat + persiapan istirahat tidur gelap tanpa distraksi.',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Tidur dalam memicu sintesis melatonin alami yang memiliki sifat onkostatis.'
      }
    ],
    contraindications: [
      {
        id: 'contra-ponc-1',
        food: 'Makanan Mentah / Setengah Matang Tanpa Higienitas Tinggi',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Risiko infeksi oportunistik fatal (Salmonella, Listeria) saat sistem imun pasien mengalami neutropenia.',
        forbiddenItems: ['Sashimi / sushi mentah', 'Telur setengah matang & mayones mentah', 'Daging steak rare/medium', 'Lalapan mentah yang tidak disterilisasi'],
        citation: 'CDC & WHO Food Safety Guidelines for Immunocompromised & Oncology Patients'
      },
      {
        id: 'contra-ponc-2',
        food: 'Daging Bakar Gosong / Karamelisasi Ekstrem (HCA & PAH)',
        risk: 'Tinggi (Hindari Total)',
        reason: 'Senyawa Heterocyclic Amines (HCA) dan Polycyclic Aromatic Hydrocarbons (PAH) bersifat karsinogenik DNA.',
        forbiddenItems: ['Sate ayam/kambing dengan kerak arang gosong', 'Ikan bakar berkerak hitam', 'Daging olahan asap berlebih'],
        citation: 'IARC & World Cancer Research Fund (WCRF) Guidelines'
      },
      {
        id: 'contra-ponc-3',
        food: 'Makanan Ultra-Proses & Minyak Goreng Jelantah Berulang',
        risk: 'Tinggi (Hindari)',
        reason: 'Lemak trans teroksidasi dan lipid peroksida memicu stres oksidatif masif yang mempercepat atrofi otot.',
        forbiddenItems: ['Gorengan minyak hitam berulang', 'Keripik usus goreng renyah industri', 'Sosis berpengawet nitrit tinggi'],
        citation: 'ESPEN Oncology Clinical Nutrition Consensus'
      }
    ]
  },

  'post_op_burns': {
    id: 'post_op_burns',
    group: 'Pasca-Operasi (Medis)',
    groupKey: 'medical',
    category: 'Luka Bakar & Rekonstruksi',
    title: 'Luka Bakar & Bedah Rekonstruksi',
    titleEn: 'Burn Recovery & Reconstruction Plastic Surgery',
    protocol: 'ISBI Practice Guidelines & ESPEN Burns Hypermetabolic Protocol',
    protocolEn: 'ISBI Guidelines for Burn Care & Hypermetabolism Protocol',
    activeBadge: 'Hypermetabolic Aktif',
    icon: 'flame',
    accentColor: '#EA580C',
    caloricNeedType: 'Hypermetabolic High Energy (2400 - 3200 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 2.0,
      carbPct: 55,
      fatPct: 25,
      fiberRestriction: false,
      hypermetabolicSurplus: 'Surplus 500-800 kkal'
    },
    keyMicronutrients: ['Zinc Organik (25-50mg)', 'Vitamin C (1000mg)', 'Vitamin A (10.000 IU)', 'Tembaga (Cu)', 'L-Glutamin'],
    recommendedApiSources: ['USDA FoodData Central', 'FatSecret Indonesia'],
    proteinMultiplier: 2.0,
    description: 'Kondisi hipermetabolik ekstrem dengan eksudasi protein masif melalui area kulit. Membutuhkan kalori-protein ultra-tinggi dan mikronutrien antioksidan kofaktor kolagen.',
    guidelines: [
      'Penuhi asupan protein 1.8–2.5 g/kg BB untuk mengimbangi kehilangan nitrogen via eksudat luka bakar.',
      'Suplementasikan Vitamin C dosis tinggi (500–1000mg) dan Seng (Zinc 30–50mg) untuk sintesis ikatan silang kolagen jaringan granulasi.',
      'Terapkan pola makan tinggi kalori karbohidrat kompleks untuk mencegah glukoneogenesis katabolik dari massa otot.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2 (Hipermetabolik Akut)',
        title: 'Fase Resusitasi Nutrisi & Penutupan Defisit Nitrogen',
        desc: 'Kalori ekstra tinggi dan asam amino bebas untuk menghentikan pemecahan protein katabolik akut pasca-luka bakar.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 14],
        clinicalFocus: 'Keseimbangan nitrogen positif, penggantian protein eksudat, & epitelisasi dini',
        proteinTarget: '2.0 - 2.5 g/kgBB (Ultra High)',
        texture: 'Cair kental ONS + lunak padat energi',
        superfoods: ['Formula Protein Whey Isolat', 'Ikan Gabus Tim Albumin', 'Putih Telur Rebus 6 Butir']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–8 (Aktif)',
        title: 'Fase Granulasi & Rekonstruksi Jaringan Kulit',
        desc: 'Biosintesis masif serabut kolagen tipe I & III, neovaskularisasi graft kulit, dan suplementasi Zinc + Vit C.',
        status: 'active',
        progressPct: 58,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [15, 56],
        clinicalFocus: 'Granulasi luka masif, take graft kulit, & elastisitas dermal',
        proteinTarget: '1.8 - 2.2 g/kgBB',
        texture: 'Padat kaya mikronutrien kolagen',
        superfoods: ['Dada Ayam Fillet Panggang', 'Jus Jambu Biji Ekstra Vit C', 'Sup Daging Sapi Lembut']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 9–16',
        title: 'Fase Maturasi Skar & Remodeling Kulit',
        desc: 'Mencegah pembentukan kontraktur skar hipertrofik melalui nutrisi anti-inflamasi dan hidrasi epidermis optimal.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [57, 112],
        clinicalFocus: 'Pematangan ikatan silang kolagen, elastisitas skar, & integritas barier kulit',
        proteinTarget: '1.5 - 1.8 g/kgBB',
        texture: 'Padat bergizi seimbang normal',
        superfoods: ['Ikan Kembung Omega-3', 'Tahu Tempe Kedelai', 'Alpukat & Sayuran Hijau']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Hipermetabolisme Puncak & Penutupan Epitelial',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'ISBI Practice Guidelines for Burn Care (2023) & ESPEN Burns Guidelines',
        healingTarget: {
          title: 'Hemostasis Eksudatif & Re-Epitelisasi Dermal',
          markers: 'Penutupan area luka bakar >60%, resolusi sindrom respon hipermetabolik (keseimbangan nitrogen positif).',
          clinicalGoal: 'Menutup barier kulit dan mencegah sepsis bakterial oportunistik.'
        },
        nutritionTarget: {
          protein: '2.0 – 2.5 g/kg BB/hari (Tinggi Albumin & Glutamin)',
          calories: '2600 – 3200 kkal/hari (Rumus Curreri / ESPEN)',
          micronutrients: 'Vitamin C 1000mg, Zinc elemental 45mg, Vitamin A 10.000 IU, Tembaga 3mg',
          texture: 'Padat energi tinggi protein + suplementasi ONS',
          recommendedMenu: ['Putih Telur Rebus (6 butir/hari)', 'Ikan Gabus Tim Albumin', 'Jus Jambu Biji Asam Askorbat', 'Susu Protein Isolat']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Angiogenesis & Integrasi Skin Graft Rekonstruksi',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Rousseau AF et al., ESPEN endorsed recommendations: Nutritional therapy in major burns',
        healingTarget: {
          title: 'Vaskularisasi Graft & Pembentukan Kolagen Tipe I',
          markers: 'Take rate skin graft mencapai 95-100%, peningkatan elastisitas jaringan parut, penurunan eritema.',
          clinicalGoal: 'Mendukung revaskularisasi kapiler pada area bedah flap/graft rekonstruksi.'
        },
        nutritionTarget: {
          protein: '1.8 – 2.2 g/kg BB/hari',
          calories: '2400 – 2800 kkal/hari',
          micronutrients: 'Vitamin E Alami, Selenium, Asam Lemak Esensial Omega-3, Multivitamin Lengkap',
          texture: 'Padat seimbang kaya protein hewani dan nabati',
          recommendedMenu: ['Dada Ayam Fillet Panggang', 'Sup Daging Sapi Has Bening', 'Tahu Sutra Kukus', 'Ubi Jalar Rebus Madu']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Remodeling Matriks Skar & Elastisitas Epidermis',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'Plastic and Reconstructive Surgery Journal on Long-Term Burn Scar Rehabilitation',
        healingTarget: {
          title: 'Elastisitas Jaringan Parut & Mobilitas Fungsional Sendi',
          markers: 'Tensile strength jaringan parut >75%, pencegahan kontraktur sendi sekitar area rekonstruksi.',
          clinicalGoal: 'Mempertahankan fleksibilitas rentang gerak (ROM) dan barier hidrasi kulit normal.'
        },
        nutritionTarget: {
          protein: '1.5 – 1.8 g/kg BB/hari',
          calories: '2200 – 2500 kkal/hari',
          micronutrients: 'Hidrasi 3.0 L/hari, Antioksidan Polifenol, Zinc 15mg, Asam Hialuronat Alami',
          texture: 'Makanan padat seimbang harian',
          recommendedMenu: ['Ikan Kembung Bakar Rempah', 'Pepes Tempe Jamur', 'Capcay Brokoli Wortel', 'Buah Pepaya & Alpukat']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-pbrn-1',
        time: '07:00',
        title: 'Sarapan Ultra-Tinggi Albumin & Kalori',
        desc: '4 butir putih telur rebus + ikan gabus tim (120g) + nasi uduk kaldu bening (Target: 38g Protein).',
        category: 'nutrition',
        dotColor: '#EA580C',
        scientificRationale: 'Menutup defisit eksudatif nitrogen yang hilang semalaman (ISBI, 2023).'
      },
      {
        id: 'sched-pbrn-2',
        time: '10:00',
        title: 'Vitamin C Dosis Tinggi & Zinc Kofaktor',
        desc: 'Jus jambu biji murni (Vit C 500mg) + suplemen Zinc elemental 30mg + 2 keping biskuit gandum.',
        category: 'nutrition',
        dotColor: '#0284C7',
        scientificRationale: 'Vitamin C esensial untuk hidroksilasi prolin dan lisin dalam pembentukan triple helix kolagen.'
      },
      {
        id: 'sched-pbrn-3',
        time: '12:30',
        title: 'Makan Siang Anabolik Daging Merah & Seng',
        desc: 'Daging sapi has tanpa lemak (150g) + sup kacang merah + wortel kukus + nasi merah (Target: 40g Protein).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Zat besi heme dan seng mendukung proliferasi fibroblas dan sintesis hemoglobin.'
      },
      {
        id: 'sched-pbrn-4',
        time: '16:00',
        title: 'Smoothie Regeneratif Whey Isolat & Buah',
        desc: 'Smoothie mangga alpukat + whey protein isolate 25g (Target: 30g Protein & Lemak Sehat).',
        category: 'snack',
        dotColor: '#7C3AED',
        scientificRationale: 'Whey protein cepat cerna memicu sintesis protein trans-epitelial.'
      },
      {
        id: 'sched-pbrn-5',
        time: '19:00',
        title: 'Makan Malam Pembentukan Jaringan Baru',
        desc: 'Dada ayam bakar bumbu kunyit (150g) + tahu tempe kukus + sayur bening bayam jagung (Target: 36g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Kombinasi asam amino esensial lengkap untuk maturasi matriks ekstraseluler.'
      },
      {
        id: 'sched-pbrn-6',
        time: '21:30',
        title: 'ONS Pelepasan Lambat & Kesiapan Tidur',
        desc: 'Susu protein ONS 250ml kaya glutamin + hidrasi air 300ml untuk regenerasi sel nokturnal.',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Pelepasan hormon pertumbuhan nokturnal memaksimalkan mitosis sel keratinosit basal.'
      }
    ],
    contraindications: [
      {
        id: 'contra-pbrn-1',
        food: 'Makanan Sampah Rendah Gizi (Empty Calories) & Gula Rafinasi',
        risk: 'Tinggi (Hindari)',
        reason: 'Memicu hiperglikemia yang melumpuhkan migrasi leukosit fagositik dan memperburuk inflamasi sistemik.',
        forbiddenItems: ['Permen, sirup manis kental, donat gula tabur', 'Minuman soda bergula tinggi', 'Kue bolu manis industri'],
        citation: 'ISBI Practice Guidelines on Glycemic Control in Burns'
      },
      {
        id: 'contra-pbrn-2',
        food: 'Makanan Tinggi Natrium Olahan (Pemicu Retensi Edema)',
        risk: 'Sedang (Batasi Ketat)',
        reason: 'Memperparah edema interstisial di sekitar area luka bakar yang menghambat difusi oksigen ke graft.',
        forbiddenItems: ['Mie instan beserta kuah bumbu asin pekat', 'Keripik asin kemasan komersial', 'Ikan asin & telur asin pekat'],
        citation: 'ESPEN Burns Clinical Nutrition Consensus'
      },
      {
        id: 'contra-pbrn-3',
        food: 'Konsumsi Alkohol & Rokok Nikotin',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Nikotin menyebabkan vasokonstriksi mikrovaskular yang memicu nekrosis iskemia pada graft/flap kulit.',
        forbiddenItems: ['Rokok konvensional, rokok elektrik (vape)', 'Minuman keras beralkohol jenis apapun'],
        citation: 'Annals of Plastic Surgery on Microvascular Graft Failure'
      }
    ]
  },

  'post_op_bariatric': {
    id: 'post_op_bariatric',
    group: 'Pasca-Operasi (Medis)',
    groupKey: 'medical',
    category: 'Bedah Bariatrik',
    title: 'Pasca-Bedah Bariatrik & Metabolik',
    titleEn: 'Post-Bariatric & Metabolic Surgery Recovery',
    protocol: 'ASMBS / IFSO Integrated Nutrition & Micronutrient Guidelines',
    protocolEn: 'ASMBS Nutritional Guidelines for Bariatric Surgery Patients',
    activeBadge: 'Porsi Mikro Aktif',
    icon: 'scale',
    accentColor: '#0284C7',
    caloricNeedType: 'Hipokalorik Padat Nutrisi / Porsi Mikro (800 - 1200 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 1.4,
      proteinMinGrams: 70,
      carbPct: 35,
      fatPct: 25,
      fiberRestriction: true,
      portionVolumeMl: 100
    },
    keyMicronutrients: ['Vitamin B12 Sublingual', 'Zat Besi Fumarat/Bisglisinat', 'Kalsium Sitrat (1200mg)', 'Vitamin D3 (3000 IU)', 'Whey Isolate'],
    recommendedApiSources: ['Open Food Facts API', 'FatSecret Indonesia', 'USDA FoodData Central'],
    proteinMultiplier: 1.4,
    description: 'Fokus pada toleransi kantung lambung mikro (gastric pouch), pencegahan dumping syndrome, target minimal 60–80g protein harian murni, dan suplementasi mikronutrien seumur hidup.',
    guidelines: [
      'Prioritaskan protein murni (minimal 60–80g/hari) sebelum menyentuh makanan lain pada setiap waktu makan.',
      'Hindari minum air 30 menit sebelum, saat makan, dan 30 menit setelah makan untuk mencegah peregangan pouch lambung.',
      'Hindari total gula sederhana dan sirup konsentrat tinggi untuk mencegah Dumping Syndrome akut (hipoglikemia reaktif, mual, takikardia).'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2',
        title: 'Fase Cair Jernih & Protein Cair Bening',
        desc: 'Cairan bebas gula, kaldu saring jernih, dan whey protein isolate cair bening dalam tegukan kecil perlahan.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 14],
        clinicalFocus: 'Proteksi garis stapler lambung, hidrasi perlahan, & toleransi cairan protein',
        proteinTarget: '60 - 70g Protein Cair Total / hari',
        texture: 'Cair jernih encer bebas gula',
        superfoods: ['Whey Protein Isolate Bening', 'Kaldu Ayam Kampung Saring Bening', 'Air Putih Elektrolit Ringan']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–6 (Aktif)',
        title: 'Fase Puree Halus & Protein Lunak (Porsi Mikro)',
        desc: 'Tekstur puree halus lembut konsistensi yogurt, putih telur kukus saring, dan tahu sutra porsi 60–100 ml.',
        status: 'active',
        progressPct: 62,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [15, 42],
        clinicalFocus: 'Adaptasi volume pouch lambung, absorpsi kalsium sitrat, & pencegahan dumping',
        proteinTarget: '70 - 80g Protein / hari (Porsi Mikro 5-6x)',
        texture: 'Puree halus blender lembut (IDDSI Level 4)',
        superfoods: ['Puree Ikan Gabus Kukus', 'Greek Yogurt Bebas Gula', 'Tahu Sutra Tim Halus']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 7–12',
        title: 'Fase Makanan Padat Lunak & Kunyah Sempurna',
        desc: 'Transisi ke daging lembut cincang, ikan kukus, sayuran empuk dengan teknik kunyah 30 kali per suapan.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [43, 84],
        clinicalFocus: 'Preservasi massa otot rangka selama penurunan berat badan cepat',
        proteinTarget: '80g Protein / hari + Suplemen Bariatrik',
        texture: 'Padat lunak dikunyah sangat halus',
        superfoods: ['Dada Ayam Cincang Empuk', 'Ikan Salmon/Tuna Panggang Halus', 'Telur Rebus Lunak']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Adaptasi Garis Stapler & Transisi Puree Halus',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'Mechanick JI et al., ASMBS/AACE/TOS Bariatric Clinical Practice Guidelines (2020)',
        healingTarget: {
          title: 'Hemostasis Garis Stapler Lambung & Toleransi Cairan',
          markers: 'Tidak ada kebocoran garis stapler, toleransi cairan >1.5 L/hari dalam tegukan mikro, tidak ada muntah residu.',
          clinicalGoal: 'Menghindari distensi lambung mikro dan dehidrasi dini pasca-bedah.'
        },
        nutritionTarget: {
          protein: '60 – 70 g/hari (Whey Protein Isolate 100%)',
          calories: '600 – 800 kkal/hari',
          micronutrients: 'Vitamin B12 1000mcg sublingual, Kalsium Sitrat 1200mg + D3 3000 IU, Besi Fumarat 45mg',
          texture: 'Diet cair pekat bertransisi ke puree halus homogen (IDDSI 3-4)',
          recommendedMenu: ['Whey Protein Isolate Cair', 'Puree Ikan Gabus Halus', 'Greek Yogurt Bebas Lemak', 'Sup Kaldu Labu Halus']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Transisi Protein Padat Lunak & Pencegahan Dumping',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'IFSO / ASMBS Guidelines on Post-Bariatric Macronutrient Partitioning',
        healingTarget: {
          title: 'Preservasi Otot (LBM) Selama Rapid Weight Loss',
          markers: 'Penurunan berat badan stabil dari massa lemak (Fat Mass), preservasi massa otot skelet, bebas dumping sindrom.',
          clinicalGoal: 'Mencegah sarkopenia bariatrik dan defisiensi mikronutrien laten.'
        },
        nutritionTarget: {
          protein: '70 – 80 g/hari (Protein Prioritas Utama Setiap Makan)',
          calories: '800 – 1000 kkal/hari',
          micronutrients: 'Multivitamin Bariatrik Lengkap Kunyah, Seng 15mg, Tembaga 2mg, Biotin 5000mcg',
          texture: 'Makanan lunak empuk porsi kecil (60-100 gram/makan)',
          recommendedMenu: ['Dada Ayam Suwir Tim Kaldu', 'Putih Telur Kukus Lembut', 'Ikan Dori Kukus Jahe', 'Tahu Sutra Tumis Halus']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Kebiasaan Nutrisi Padat Permanen & Suplementasi',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'Parrott J et al., American Society for Metabolic and Bariatric Surgery Nutrition Guidelines',
        healingTarget: {
          title: 'Kepatuhan Suplementasi Seumur Hidup & Pola Makan Teratur',
          markers: 'Kadar ferritin darah, B12, 25-OH Vitamin D, dan kalsium serum dalam rentang optimal stabil.',
          clinicalGoal: 'Membangun disiplin makan lambat (20-30 menit per porsi mini) dan gaya hidup metabolik sehat.'
        },
        nutritionTarget: {
          protein: '75 – 85 g/hari',
          calories: '1000 – 1200 kkal/hari',
          micronutrients: 'Kalsium Sitrat Terbagi (3x500mg), Besi + Vit C, B-Kompleks Harian, Hidrasi Terpisah Makan',
          texture: 'Makanan padat bergizi tinggi dikunyah sangat matang',
          recommendedMenu: ['Ikan Salmon Panggang Lembut', 'Daging Sapi Cincang Empuk', 'Pepes Jamur Tahu', 'Brokoli Kukus Sangat Empuk']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-pbar-1',
        time: '07:30',
        title: 'Sarapan Whey Isolate Murni (Porsi Mikro)',
        desc: 'Whey Protein Isolate (30g protein) dalam 150ml air dingin diminum perlahan dalam 20 menit.',
        category: 'nutrition',
        dotColor: '#0284C7',
        scientificRationale: 'Memastikan target protein terpenuhi tanpa membebani kapasitas kantung lambung mikro (ASMBS, 2020).'
      },
      {
        id: 'sched-pbar-2',
        time: '10:00',
        title: 'Snack Puree Putih Telur & Kalsium Sitrat',
        desc: '2 butir putih telur kukus puree halus + suplementasi Kalsium Sitrat 500mg + Vitamin D3.',
        category: 'snack',
        dotColor: '#7C3AED',
        scientificRationale: 'Kalsium sitrat diserap lebih baik pada kondisi asam lambung rendah pasca-bedah bariatrik.'
      },
      {
        id: 'sched-pbar-3',
        time: '12:30',
        title: 'Makan Siang Puree Ikan Gabus (80 gram)',
        desc: 'Ikan gabus tim puree halus (100g) + kuah kaldu sayur bening terpisah 30 menit kemudian (Target: 22g Protein).',
        category: 'nutrition',
        dotColor: '#15803D',
        scientificRationale: 'Memisahkan cairan dari makanan padat mencegah ekspansi peregangan pouch dan regurgitasi.'
      },
      {
        id: 'sched-pbar-4',
        time: '15:30',
        title: 'Snack Greek Yogurt Bebas Gula',
        desc: 'Greek yogurt tawar (100g) tinggi kasein dan kultur probiotik usus (Target: 10g Protein).',
        category: 'snack',
        dotColor: '#D97706',
        scientificRationale: 'Probiotik memelihara keseimbangan mikrobiota usus pasca-perubahan anatomi pencernaan.'
      },
      {
        id: 'sched-pbar-5',
        time: '18:30',
        title: 'Makan Malam Protein Halus & B12 Sublingual',
        desc: 'Dada ayam cincang empuk kukus tahu (80g) + Vitamin B12 Sublingual 1000mcg (Target: 20g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Penyerapan B12 melalui mukosa sublingual mengatasi hilangnya faktor intrinsik lambung.'
      },
      {
        id: 'sched-pbar-6',
        time: '21:00',
        title: 'Hidrasi Perlahan & Relaksasi Malam',
        desc: 'Air putih hangat diminum teguk mini teratur (Target hidrasi 1.8 L total per hari terpisah dari makan).',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Mencegah dehidrasi nokturnal yang rentan memicu konstipasi dan batu ginjal pasca-bariatrik.'
      }
    ],
    contraindications: [
      {
        id: 'contra-pbar-1',
        food: 'Gula Sederhana, Sirup Manis, & Makanan Manis Konsentrat',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Memicu Early & Late Dumping Syndrome: perpindahan cairan masif ke lumen usus, kram perut hebat, diare, mual, takikardia, dan syok hipoglikemia.',
        forbiddenItems: ['Minuman boba manis, jus buah manis kemasan, es krim', 'Kue manis berglazuur, donat manis, cokelat susu', 'Sirup kental manis & madu dosis tinggi'],
        citation: 'ASMBS Practice Guidelines on Dumping Syndrome Prevention'
      },
      {
        id: 'contra-pbar-2',
        food: 'Minuman Berkarbonasi & Bersoda',
        risk: 'Tinggi (Hindari Total)',
        reason: 'Gas karbon dioksida mengekspansi dan meregangkan kantung lambung mikro (pouch dilation) serta memicu nyeri hebat.',
        forbiddenItems: ['Soda kaleng, sparkling water, bir berkarbonasi, kombucha bersoda'],
        citation: 'IFSO Clinical Consensus on Post-Bariatric Safety'
      },
      {
        id: 'contra-pbar-3',
        food: 'Daging Keras Alot, Berserat Kasar, & Makanan Tidak Dikunyah',
        risk: 'Tinggi (Hindari)',
        reason: 'Menyebabkan impaksi bolus makanan (obstruksi stoma anastomosis) yang memerlukan evakuasi endoskopi darurat.',
        forbiddenItems: ['Daging steak liat alot, daging kambing berserat tebal', 'Seledri berserat kasar panjang, jagung pipil utuh, kulit buah keras'],
        citation: 'SAGES & ASMBS Post-Operative Obstruction Protocol'
      },
      {
        id: 'contra-pbar-4',
        food: 'Minum Cairan Bersamaan Dengan Makanan Padat',
        risk: 'Sedang (Aturan Ketat: Pisahkan 30 Menit)',
        reason: 'Membilas makanan terlalu cepat keluar dari pouch (menghilangkan rasa kenyang) atau memicu muntah akibat volume berlebih.',
        forbiddenItems: ['Minum segelas air bersamaan saat menyantap makanan padat'],
        citation: 'Mechanick JI et al., Clinical Practice Guidelines'
      }
    ]
  },

  'post_op_orthopedic': {
    id: 'post_op_orthopedic',
    group: 'Pasca-Operasi (Medis)',
    groupKey: 'medical',
    category: 'Ortopedi & Trauma',
    title: 'Pasca-Bedah Ortopedi, Tulang & Trauma',
    titleEn: 'Orthopedic, Bone Fracture & Joint Reconstruction',
    protocol: 'AAOS & ACSM Bone Matrix & Synovial Collagen Protocol',
    protocolEn: 'AAOS Fracture Healing & Synovial Matrix Consensus',
    activeBadge: 'Osteogenesis Aktif',
    icon: 'bone',
    accentColor: '#15803D',
    caloricNeedType: 'Moderate Surplus (2000 - 2300 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 1.6,
      carbPct: 50,
      fatPct: 25,
      fiberRestriction: false,
      boneMatrixFocus: 'Kalsium, Fosfor, Magnesium, Vitamin D3'
    },
    keyMicronutrients: ['Kalsium Bioavailable (1200mg)', 'Fosfor', 'Magnesium Bisglisinat (400mg)', 'Vitamin D3 (2000 IU)', 'Gelatin / Kolagen Hidrolisat'],
    recommendedApiSources: ['USDA FoodData Central', 'FatSecret Indonesia'],
    proteinMultiplier: 1.6,
    description: 'Fokus pada pembentukan kalus tulang primer (osteogenesis), sintesis serabut kolagen tipe I & II pada kartilago/ligamen, serta penguatan matriks mineral tulang.',
    guidelines: [
      'Penuhi asupan Kalsium (1000–1200mg/hari) dan Vitamin D3 (2000 IU) untuk mineralisasi osifikasi matriks osteoblas.',
      'Konsumsi gelatin/kolagen bersama Vitamin C 30–60 menit sebelum sesi latihan fisioterapi untuk memaksimalkan sintesis tendon/ligamen.',
      'Jaga asupan protein 1.5–1.7 g/kg BB untuk mencegah atrofi otot skelet penyangga sendi yang diimobilisasi.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2',
        title: 'Fase Kalus Lunak & Anti-Edema Intra-Artikular',
        desc: 'Meredakan hematoma fraktur, proteksi cairan sinovial, dan pembentukan jaringan granulasi kartilago lunak.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 14],
        clinicalFocus: 'Reduksi efusi sendi, hemostasis periosteal, & sintesis kalus fibrokartilago',
        proteinTarget: '1.4 - 1.6 g/kgBB',
        texture: 'Lunak sup kaldu tulang kolagen alami (Bone Broth)',
        superfoods: ['Sup Bone Broth Sapi', 'Ikan Kembung Omega-3', 'Jus Jambu Biji Vit C']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–6 (Aktif)',
        title: 'Fase Osifikasi Mineral & Kalus Keras (Aktif)',
        desc: 'Deposisi mineral hidroksiapatit kalsium-fosfat pada matriks kolagen dan regenerasi ligamen sendi.',
        status: 'active',
        progressPct: 60,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [15, 42],
        clinicalFocus: 'Mineralisasi osteoblas, penguatan tensile strength kalus keras, & mobilitas sendi',
        proteinTarget: '1.5 - 1.7 g/kgBB (Tinggi Kalsium + D3)',
        texture: 'Padat seimbang kaya mineral tulang',
        superfoods: ['Gelatin Buah + Jeruk Segar Pre-Rehab', 'Ikan Gabus Tim Albumin', 'Tahu Tempe Sumber Isoflavon']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 7–12',
        title: 'Fase Remodeling Tulang Trabekular & Rekondisi',
        desc: 'Adaptasi beban biomekanik gravitasi penuh, peningkatan densitas mineral tulang, dan pencegahan atrofi otot.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [43, 84],
        clinicalFocus: 'Kekuatan biomekanik penuh & kesiapan aktivitas fungsional tanpa nyeri',
        proteinTarget: '1.4 - 1.6 g/kgBB',
        texture: 'Padat bergizi seimbang tinggi kalsium & magnesium',
        superfoods: ['Dada Ayam Fillet Panggang', 'Telur Omega-3 Rebus', 'Yogurt Rendah Lemak & Bayam']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Pembentukan Kalus Fibrokartilago Dini',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'Baar K., Sports Med (2017) & AAOS Clinical Practice Guidelines for Fracture Healing',
        healingTarget: {
          title: 'Bridging Kalus Lunak & Reduksi Pembengkakan',
          markers: 'Penurunan lingkar pembengkakan >50%, hematoma fraktur terkonsolidasi menjadi kalus kartilago, nyeri berkurang.',
          clinicalGoal: 'Mencegah sindrom atrofi disuse dan memfasilitasi revaskularisasi periosteal.'
        },
        nutritionTarget: {
          protein: '1.4 – 1.6 g/kg BB/hari',
          calories: '2000 – 2200 kkal/hari',
          micronutrients: 'Kalsium 1000mg, Asam Lemak Omega-3 2g, Vitamin C 250mg, Zinc 20mg',
          texture: 'Lunak kaya kuah kaldu kolagen tulang (Bone Broth)',
          recommendedMenu: ['Sup Kaldu Tulang Sapi (Bone Broth)', 'Ikan Kembung Kukus Omega-3', 'Jus Buah Beri Antioksidan', 'Tahu Sutra Kukus']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Mineralisasi Osteoid & Pembentukan Kalus Keras',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Shaw G et al., Am J Clin Nutr (2017) & Orthopedic Trauma Association Protocols',
        healingTarget: {
          title: 'Osifikasi Hidroksiapatit & Mobilitas Sendi (ROM 80–90%)',
          markers: 'Garis fraktur pada radiologi mulai menyatu (trabecular bridging), kekuatan sendi meningkat tanpa instabilitas.',
          clinicalGoal: 'Load-induced matrix uptake: gelatin + vit C 45 menit sebelum sesi fisioterapi gerak.'
        },
        nutritionTarget: {
          protein: '1.5 – 1.7 g/kg BB/hari (Tinggi Glisin, Prolin & Kalsium)',
          calories: '2100 – 2300 kkal/hari',
          micronutrients: 'Kalsium Sitrat 1200mg, Vitamin D3 2000 IU, Magnesium 400mg, Gelatin 15g Pre-Rehab',
          texture: 'Makanan padat bergizi seimbang teratur',
          recommendedMenu: ['Gelatin Buah + Jeruk Segar', 'Ikan Gabus Tim Rempah', 'Tahu Tempe Bacem Kedelai', 'Brokoli Wortel Kukus']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Remodeling Tulang Haversian & Penguatan Otot',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'ACSM Musculoskeletal Rehabilitation & Bone Remodeling Consensus',
        healingTarget: {
          title: 'Konsolidasi Tulang Kortikal & Stabilitas Biomekanik',
          markers: 'Union tulang komplit, kapasitas menahan beban berat badan penuh (Full Weight Bearing), simetri kekuatan otot.',
          clinicalGoal: 'Kembali ke aktivitas harian mandiri dan pencegahan refraktur sekunder.'
        },
        nutritionTarget: {
          protein: '1.4 – 1.6 g/kg BB/hari',
          calories: '2200 kkal/hari',
          micronutrients: 'Kalsium 1000mg, Vitamin K2 (MK-7) 100mcg, Fosfor, Magnesium 350mg',
          texture: 'Padat berenergi tinggi mikronutrien tulang-otot',
          recommendedMenu: ['Dada Ayam Fillet Panggang', 'Telur Rebus Omega-3', 'Yogurt Rendah Lemak + Bayam', 'Pisang Ambon & Almond']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-porth-1',
        time: '07:00',
        title: 'Sarapan Penguat Matriks Tulang & Kalsium',
        desc: '2 butir telur omega-3 + oatmeal susu rendah lemak fortified kalsium + bayam kukus (Target: 25g Protein, Kalsium 400mg).',
        category: 'nutrition',
        dotColor: '#15803D',
        scientificRationale: 'Kalsium dan protein pagi hari memicu mineralisasi osteoblas pasca-puasa malam (AAOS, 2021).'
      },
      {
        id: 'sched-porth-2',
        time: '09:30',
        title: 'Protokol Gelatin & Vit C Pre-Fisioterapi',
        desc: 'Gelatin buah kaya kolagen (15g) + perasan jeruk lemon segar (Vit C 60mg) diminum 45 menit sebelum latihan.',
        category: 'therapy',
        dotColor: '#7C3AED',
        scientificRationale: 'Meningkatkan sirkulasi asam amino kolagen spesifik ke ligamen dan tendon selama sendi bergerak (Shaw et al., 2017).'
      },
      {
        id: 'sched-porth-3',
        time: '12:30',
        title: 'Makan Siang Anti-Inflamasi Sendi & Kaldu Tulang',
        desc: 'Sup kaldu tulang sapi (Bone Broth) + ikan kembung bakar kunyit + tumis buncis tempe + nasi merah (Target: 30g Protein).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Bone broth menyediakan kondroitin dan glukosamin alami untuk pemulihan cairan sinovial.'
      },
      {
        id: 'sched-porth-4',
        time: '16:00',
        title: 'Snack Mineral Tulang & Magnesium',
        desc: 'Smoothie alpukat buah naga + segenggam kacang almond panggang (Target: Magnesium 120mg & Lemak Baik).',
        category: 'snack',
        dotColor: '#0284C7',
        scientificRationale: 'Magnesium mengaktifkan vitamin D untuk memfasilitasi absorpsi kalsium usus.'
      },
      {
        id: 'sched-porth-5',
        time: '19:00',
        title: 'Makan Malam Pembentukan Massa Otot Penopang',
        desc: 'Dada ayam panggang rempah (130g) + sup bayam bening jagung + kentang kukus (Target: 32g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Asam amino esensial berkelanjutan mencegah atrofi otot kuadrisep/hamstring penopang sendi.'
      },
      {
        id: 'sched-porth-6',
        time: '21:30',
        title: 'Suplementasi Kalsium-D3 & Tidur Anabolik',
        desc: 'Susu berkalsium tinggi + Vitamin D3 2000 IU + 300ml air putih untuk mineralisasi tulang sepanjang malam.',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Remodeling dan osifikasi trabekular tulang berlangsung paling aktif selama fase tidur dalam.'
      }
    ],
    contraindications: [
      {
        id: 'contra-porth-1',
        food: 'Daging Olahan Berpengawet Nitrit & Makanan Inflamasi',
        risk: 'Tinggi (Hindari)',
        reason: 'AGEs dan asam arakidonat memicu enzim COX-2 yang memperpanjang peradangan sinovial dan nyeri sendi kronis.',
        forbiddenItems: ['Sosis industri, kornet kaleng, daging asap olahan', 'Nugget beku berpengawet boraks/nitrit', 'Jeroan sapi berlemak tinggi'],
        citation: 'Arthritis & Rheumatology Nutrition Review'
      },
      {
        id: 'contra-porth-2',
        food: 'Minuman Bersoda Mengandung Asam Fosfat Berlebih',
        risk: 'Tinggi (Hindari)',
        reason: 'Asam fosfat berlebih mengikat kalsium bebas di darah dan memicu resorpsi osteoklas yang melemahkan kalus tulang.',
        forbiddenItems: ['Minuman soda cola berkarbonasi tinggi asam fosfat', 'Energy drinks dengan pengasam sintetis'],
        citation: 'Journal of Bone and Mineral Research on Calcium Homeostasis'
      },
      {
        id: 'contra-porth-3',
        food: 'Garam / Natrium Berlebih (>2000mg/hari)',
        risk: 'Sedang (Batasi Ketat)',
        reason: 'Meningkatkan ekskresi kalsium melalui urin (hiperkalsiuria) dan memperparah edema intra-artikular.',
        forbiddenItems: ['Mie instan kuah micin pekat', 'Keripik asin kemasan', 'Ikan asin & kecap asin berlebih'],
        citation: 'AAOS Clinical Consensus on Bone Health'
      }
    ]
  },

  'post_op_cardio': {
    id: 'post_op_cardio',
    group: 'Pasca-Operasi (Medis)',
    groupKey: 'medical',
    category: 'Kardiovaskular',
    title: 'Pasca-Bedah Kardiovaskular & Sternotomi',
    titleEn: 'Post-Cardiovascular Surgery & Sternum Recovery',
    protocol: 'AHA / ACC Dietary Guidelines & ERAS Cardiac Consensus',
    protocolEn: 'AHA/ACC Cardiovascular Perioperative Nutrition',
    activeBadge: 'Kardio-Protektif Aktif',
    icon: 'activity',
    accentColor: '#059669',
    caloricNeedType: 'Isokalorik Jantung Sehat (1750 - 1950 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 1.3,
      carbPct: 55,
      fatPct: 25,
      sodiumLimitMg: 1500,
      saturatedFatMaxPct: 6
    },
    keyMicronutrients: ['Rendah Natrium (<1500mg Na)', 'Lemak Tak Jenuh MUFA/PUFA', 'Omega-3 EPA/DHA', 'Kalium Organik', 'Magnesium Sitrat'],
    recommendedApiSources: ['USDA FoodData Central', 'FatSecret Indonesia'],
    proteinMultiplier: 1.3,
    description: 'Fokus pada penyembuhan luka insisi sternotomi, pencegahan kelebihan beban cairan (fluid overload), kontrol ketat natrium, dan optimasi profil lipid endotel vaskular.',
    guidelines: [
      'Batasi asupan natrium total maksimal 1500–2000 mg/hari untuk mencegah retensi cairan dan beban kerja ventrikel jantung.',
      'Gunakan sumber lemak tak jenuh ganda (Omega-3 ikan laut, alpukat, minyak zaitun) dan hindari lemak jenuh trans/santan pekat.',
      'Jaga asupan protein 1.2–1.4 g/kg BB untuk penyambungan tulang sternum tanpa membebani klirens filtrasi ginjal.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2',
        title: 'Fase Hemodinamik & Kontrol Cairan-Natrium',
        desc: 'Pemantauan ketat keseimbangan cairan, diet rendah garam <1500mg, dan proteksi hemostasis sternum insisi.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 14],
        clinicalFocus: 'Kestabilan tekanan darah, pencegahan edema paru/perifer, & stabilitas sternum',
        proteinTarget: '1.2 - 1.3 g/kgBB',
        texture: 'Lunak rendah garam berkuah bening herbal',
        superfoods: ['Sup Ikan Gabus Bawang Putih', 'Bubur Oatmeal Pisang Chia', 'Putih Telur Rebus']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–6 (Aktif)',
        title: 'Fase Penyatuan Tulang Sternum & Endotel (Aktif)',
        desc: 'Penyambungan kawat/tulang sternum dengan kalsium-D3 seimbang dan asam lemak omega-3 anti-aritmia.',
        status: 'active',
        progressPct: 65,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [15, 42],
        clinicalFocus: 'Osteogenesis sternotomi, elastisitas vaskular, & kontrol profil kolesterol LDL',
        proteinTarget: '1.3 - 1.4 g/kgBB',
        texture: 'Padat teratur kaya serat larut pektin/beta-glukan',
        superfoods: ['Ikan Tenggiri Kukus Jahe', 'Nasi Merah Lunak', 'Sayur Bening Bayam Oyong']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 7–12',
        title: 'Fase Rehabilitasi Jantung & Ketahanan Fisik',
        desc: 'Pola diet Mediterania/DASH permanen untuk mendukung latihan rehabilitasi kardiorespirasi bertahap.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [43, 84],
        clinicalFocus: 'Kapasitas fungsional jantung, tekanan darah terkontrol <120/80, & daya tahan',
        proteinTarget: '1.2 - 1.4 g/kgBB',
        texture: 'Padat gizi seimbang Mediterania rendah sodium',
        superfoods: ['Ikan Salmon Panggang Rempah', 'Tahu Tempe Kukus', 'Alpukat & Buah Beri']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Kestabilan Hemodinamik & Restriksi Natrium',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'AHA / ACC Guideline on Perioperative Cardiovascular Care & ERAS Cardiac Consensus',
        healingTarget: {
          title: 'Hemostasis Sternotomi & Bebas Edema Cairan',
          markers: 'Tekanan darah terkontrol stabil, tidak ada ronki paru atau edema pretibial, fusi sternum awal stabil.',
          clinicalGoal: 'Mencegah dekompensasi gagal jantung kongestif dan infeksi luka sternotomi.'
        },
        nutritionTarget: {
          protein: '1.2 – 1.3 g/kg BB/hari',
          calories: '1750 – 1950 kkal/hari',
          micronutrients: 'Natrium < 1500mg, Kalium 3500mg, Magnesium 350mg, Asam Lemak Omega-3 1.5g',
          texture: 'Diet lunak rendah garam hangat rempah herbal',
          recommendedMenu: ['Oatmeal Pisang Biji Chia', 'Sup Ikan Gabus Bawang Putih', 'Putih Telur Rebus', 'Puree Pepaya Segar']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Konsolidasi Sternum & Modulasi Lipid Endotel',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Lichtenstein AH et al., AHA Dietary Guidance to Improve Cardiovascular Health',
        healingTarget: {
          title: 'Konsolidasi Tulang Sternum & Reduksi Kolesterol LDL',
          markers: 'Stabilitas dinding dada saat batuk/bernapas dalam, LDL-C < 70 mg/dL, fungsi endotel membaik.',
          clinicalGoal: 'Menjaga patensi graf pembuluh darah koroner (CABG) dan katup jantung baru.'
        },
        nutritionTarget: {
          protein: '1.3 – 1.4 g/kg BB/hari',
          calories: '1850 – 2000 kkal/hari',
          micronutrients: 'Beta-glukan Serat Larut 25-30g, Fitosterol Alami, Vitamin D3 1000 IU, Koenzim Q10',
          texture: 'Makanan padat gizi seimbang diet DASH / Mediterania',
          recommendedMenu: ['Ikan Tenggiri Kukus Rempah', 'Nasi Merah Tim', 'Sayur Bening Bayam Oyong', 'Segenggam Walnut Panggang']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Kebugaran Fungsional Kardiorespirasi Jangka Panjang',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'ESC Guidelines on Cardiovascular Disease Prevention in Clinical Practice',
        healingTarget: {
          title: 'Kebugaran Fungsional Total & Tekanan Darah Optimal',
          markers: 'Toleransi latihan jalan 6 menit (6MWT) meningkat >450 meter tanpa sesak atau iskemia miokard.',
          clinicalGoal: 'Pencegahan kekambuhan aterosklerosis jangka panjang melalui gaya hidup kardioprotektif.'
        },
        nutritionTarget: {
          protein: '1.2 – 1.4 g/kg BB/hari',
          calories: '1900 – 2100 kkal/hari',
          micronutrients: 'Polifenol Minyak Zaitun, Antioksidan Likopen Tomat, Natrium < 2000mg, Hidrasi Teratur',
          texture: 'Makanan padat gizi seimbang kardioprotektif',
          recommendedMenu: ['Ikan Kembung Bakar Dabu-Dabu Rendah Garam', 'Pepes Tahu Jamur', 'Capcay Rebus Brokoli', 'Apel Segar']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-pcar-1',
        time: '07:00',
        title: 'Sarapan Jantung Sehat (Beta-Glukan Serat)',
        desc: 'Oatmeal gandum utuh + potongan pisang ambon + 1 sdm biji chia + 2 putih telur rebus (Target: 22g Protein, 0g Garam Tambahan).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Beta-glukan menurunkan absorpsi kolesterol empedu di usus halus pagi hari (AHA, 2021).'
      },
      {
        id: 'sched-pcar-2',
        time: '10:00',
        title: 'Snack Kalium Alami & Antioksidan',
        desc: 'Jus buah naga merah segar tanpa gula pasir + segenggam kacang almond tawar tanpa garam (Target: Kalium & Magnesium).',
        category: 'snack',
        dotColor: '#0284C7',
        scientificRationale: 'Kalium membantu menjaga tonus vasomotor pembuluh darah arteri dan menurunkan tekanan darah.'
      },
      {
        id: 'sched-pcar-3',
        time: '12:30',
        title: 'Makan Siang Omega-3 & Bawang Putih Allicin',
        desc: 'Ikan kembung/salmon kukus bawang putih jahe + nasi merah tim + tumis buncis wortel minyak zaitun (Target: 28g Protein).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Allicin bawang putih dan EPA/DHA menjaga elastisitas endotel vaskular dan mencegah trombosis.'
      },
      {
        id: 'sched-pcar-4',
        time: '16:00',
        title: 'Snack Buah Segar Pektin Tinggi',
        desc: 'Potongan buah pepaya matang + apel potong segar (Target: Serat Larut Pektin & Vitamin C).',
        category: 'snack',
        dotColor: '#7C3AED',
        scientificRationale: 'Pektin mengikat asam empedu di saluran cerna untuk ekskresi kolesterol berlebih.'
      },
      {
        id: 'sched-pcar-5',
        time: '19:00',
        title: 'Makan Malam Protein Rendah Lemak Jenuh',
        desc: 'Dada ayam fillet kukus rempah daun ketumbar + sup bayam labu siam kuah bening + kentang rebus (Target: 26g Protein).',
        category: 'nutrition',
        dotColor: '#15803D',
        scientificRationale: 'Protein murni tanpa lemak jenuh menjaga integritas penyambungan tulang sternotomi.'
      },
      {
        id: 'sched-pcar-6',
        time: '21:30',
        title: 'Hidrasi Terukur & Relaksasi Napas Kardio',
        desc: 'Air putih hangat 200ml terukur + latihan pernapasan diafragma 10 menit untuk menstabilkan tonus saraf otonom parasimpatis.',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Pernapasan lambat menurunkan tonus simpatis, menurunkan laju denyut jantung istirahat (HRV membaik).'
      }
    ],
    contraindications: [
      {
        id: 'contra-pcar-1',
        food: 'Makanan Tinggi Natrium, Garam Dapur, Micin & Makanan Kaleng',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Natrium menahan air di intravaskular, meningkatkan afterload ventrikel, memicu krisis hipertensi dan edema paru akut.',
        forbiddenItems: ['Ikan asin, telur asin, kecap asin kental', 'Mie instan beserta bumbu asin gurih micin', 'Makanan kaleng berpengawet natrium benzoat/glutamat'],
        citation: 'AHA / ACC Dietary Guidelines on Sodium Reduction'
      },
      {
        id: 'contra-pcar-2',
        food: 'Lemak Jenuh Trans, Santan Kental Pekat & Gajih Sapi',
        risk: 'Tinggi (Hindari Total)',
        reason: 'Meningkatkan kolesterol LDL dan menginduksi disfungsi endotel pada graf bypass arteri koroner.',
        forbiddenItems: ['Gulai dan rendang santan kental yang dihangatkan berulang', 'Gajih lemak sapi, kulit ayam goreng, jeroan', 'Margarin terhidrogenasi & shortening kue'],
        citation: 'European Heart Journal on Dietary Fats and Cardiovascular Disease'
      },
      {
        id: 'contra-pcar-3',
        food: 'Minuman Berkafein Tinggi & Minuman Berenergi',
        risk: 'Sedang (Batasi Ketat)',
        reason: 'Memicu takikardia, aritmia atrium pasca-bedah jantung (Atrial Fibrillation Post-Op), dan vasokonstriksi.',
        forbiddenItems: ['Energy drinks kemasan, kopi hitam pekat >2 cangkir/hari, pre-workout stimulan'],
        citation: 'Heart Rhythm Society Guidelines on Post-Operative Arrhythmia Management'
      }
    ]
  },

  'post_op_geriatric': {
    id: 'post_op_geriatric',
    group: 'Pasca-Operasi (Medis)',
    groupKey: 'medical',
    category: 'Geriatri Pasca-Operasi',
    title: 'Geriatri Pasca-Operasi & Anti-Sarkopenia',
    titleEn: 'Post-Surgical Geriatric & Sarcopenia Prevention',
    protocol: 'ESPEN Geriatric Nutrition Guidelines & EWGSOP2 Sarcopenia Consensus',
    protocolEn: 'ESPEN Clinical Nutrition & Hydration in Geriatrics',
    activeBadge: 'Anti-Sarkopenia Aktif',
    icon: 'user-check',
    accentColor: '#7C3AED',
    caloricNeedType: 'Densitas Nutrisi Tinggi (1800 - 2000 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 1.4,
      carbPct: 50,
      fatPct: 30,
      fiberRestriction: false,
      textureGrade: 'Lunak Mudah Kunyah & Telan (IDDSI Level 5)'
    },
    keyMicronutrients: ['HMB (Beta-hydroxy-beta-methylbutyrate)', 'Vitamin D3 (2000-4000 IU)', 'Vitamin B12', 'Kalsium Sitrat', 'Serat Larut Probiotik'],
    recommendedApiSources: ['Open Food Facts API', 'FatSecret Indonesia', 'USDA FoodData Central'],
    proteinMultiplier: 1.4,
    description: 'Fokus pada pencegahan atrofi massa otot saat tirah baring (bedridden), mengatasi resistensi anabolik geriatri via HMB dan Leusin, serta kemudahan tekstur mengunyah dan menelan.',
    guidelines: [
      'Tingkatkan asupan protein menjadi 1.2–1.5 g/kg BB/hari yang diperkaya metabolit Leusin (HMB 1.5–3g) untuk mengatasi resistensi anabolik usia lanjut.',
      'Sajikan makanan dalam tekstur lunak padat nutrisi mudah dikunyah/ditelan untuk mencegah aspirasi pneumonia dan kelelahan makan.',
      'Pastikan kecukupan hidrasi teratur (minimal 1.5–2.0 L/hari) dan serat larut untuk mencegah konstipasi impaksi pasca-tirah baring.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2',
        title: 'Fase Proteksi Otot Bedridden & Hidrasi',
        desc: 'Pemberian ONS cair tinggi protein + HMB, pencegahan dehidrasi geriatri, dan proteksi luka dekubitus.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 14],
        clinicalFocus: 'Supresi katabolisme otot saat imobilisasi, hidrasi seluler, & pencegahan dekubitus',
        proteinTarget: '1.2 - 1.4 g/kgBB (ONS Cair + HMB)',
        texture: 'Cair kental ONS, bubur saring lembut',
        superfoods: ['Formula ONS Tinggi HMB', 'Bubur Beras Ikan Gabus', 'Puree Labu Kuning Halus']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–6 (Aktif)',
        title: 'Fase Mobilisasi Duduk & Kekuatan Fungsional (Aktif)',
        desc: 'Makanan tim padat nutrisi kaya Vitamin D3 dan Kalsium untuk mendukung latihan berdiri dan mobilisasi mandiri.',
        status: 'active',
        progressPct: 60,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [15, 42],
        clinicalFocus: 'Peningkatan kekuatan genggam tangan (handgrip strength), keseimbangan, & nafsu makan',
        proteinTarget: '1.3 - 1.5 g/kgBB',
        texture: 'Lunak tim cincang halus mudah kunyah (IDDSI Level 5)',
        superfoods: ['Nasi Tim Ayam Cincang Tahu', 'Sup Ikan Patin Kuah Kuning', 'Putih Telur Kukus Halus']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 7–12',
        title: 'Fase Kemandirian Geriatri & Kebugaran Harian',
        desc: 'Diet gizi seimbang geriatri padat vitamin B12 dan antioksidan untuk mempertahankan status kognitif dan fisik.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [43, 84],
        clinicalFocus: 'Kemandirian Activities of Daily Living (ADL) & pencegahan frailty berulang',
        proteinTarget: '1.2 - 1.4 g/kgBB',
        texture: 'Padat lembut ramah geriatri',
        superfoods: ['Pepes Tahu Telur Puyuh', 'Sayur Bening Bayam Wortel Cincang', 'Pepaya Matang Lembut']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Mitigasi Sarkopenia Akut & Tirah Baring',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'ESPEN Guidelines on Clinical Nutrition and Hydration in Geriatrics (2022)',
        healingTarget: {
          title: 'Preservasi Massa Otot Bebas Lemak & Hidrasi Normal',
          markers: 'Berat badan stabil, tidak ada dekubitus, turgor kulit baik, kadar albumin serum > 3.5 g/dL.',
          clinicalGoal: 'Mencegah wasting sindrom tirah baring dan penurunan status fungsional drastis.'
        },
        nutritionTarget: {
          protein: '1.2 – 1.4 g/kg BB/hari (Diperkaya HMB & ONS)',
          calories: '1800 – 2000 kkal/hari',
          micronutrients: 'HMB 3g/hari, Vitamin D3 2000-4000 IU, Kalsium 1200mg, Vitamin B12 500mcg',
          texture: 'Lunak lembut mudah kunyah (IDDSI Level 4-5) + ONS Harian',
          recommendedMenu: ['Bubur Halus Ikan Gabus', 'Formula ONS HMB Cair', 'Puree Labu Kuning Telur', 'Sup Kaldu Ayam Halus']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Pemulihan Kekuatan Otot & Mobilisasi Dini',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Cruz-Jentoft AJ et al., EWGSOP2 Sarcopenia: revised European consensus on definition and diagnosis',
        healingTarget: {
          title: 'Peningkatan Daya Cengkeram Tangan & Kecepatan Berjalan',
          markers: 'Handgrip strength meningkat >2 kg, mampu transfer dari tempat tidur ke kursi secara mandiri.',
          clinicalGoal: 'Meningkatkan kemandirian fisik dasar dan mencegah risiko jatuh pasca-operasi.'
        },
        nutritionTarget: {
          protein: '1.3 – 1.5 g/kg BB/hari',
          calories: '1900 – 2100 kkal/hari',
          micronutrients: 'Magnesium 350mg, Zinc 15mg, Serat Larut Air 20g, Probiotik Alami',
          texture: 'Makanan padat lunak teratur porsi kecil sering (5-6x sehari)',
          recommendedMenu: ['Nasi Tim Daging Cincang Tahu', 'Sup Ikan Patin Kuah Jahe', 'Putih Telur Rebus Halus', 'Puree Alpukat Pisang']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Kemandirian ADL & Kebugaran Fungsional Geriatri',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'Bauer J et al., PROT-AGE Study Group: Evidence-based recommendations for optimal dietary protein intake in older people',
        healingTarget: {
          title: 'Kemandirian Fungsional Total & Kualitas Hidup Optimal',
          markers: 'Skor Barthel Index ADL meningkat menuju mandiri, nafsu makan normal, status kognitif stabil.',
          clinicalGoal: 'Mempertahankan gaya hidup aktif usia lanjut yang bermartabat dan bebas ketergantungan.'
        },
        nutritionTarget: {
          protein: '1.2 – 1.4 g/kg BB/hari',
          calories: '1900 kkal/hari',
          micronutrients: 'Multivitamin Geriatri Lengkap, Serat Pangan 25g, Hidrasi 1.8-2.0 L/hari',
          texture: 'Makanan padat bergizi seimbang lembut',
          recommendedMenu: ['Ikan Kembung Kukus Daun Pisang', 'Pepes Tahu Telur', 'Sayur Bening Bayam Oyong Cincang', 'Pepaya & Pisang Matang']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-pger-1',
        time: '07:00',
        title: 'Sarapan Lembut Bernutrisi Tinggi & HMB',
        desc: 'Bubur beras lembut ikan gabus (100g) + putih telur kukus + ONS kaya HMB (Target: 26g Protein).',
        category: 'nutrition',
        dotColor: '#7C3AED',
        scientificRationale: 'HMB menstimulasi sintesis protein otot pada lansia yang resisten anabolik (ESPEN Geriatrics, 2022).'
      },
      {
        id: 'sched-pger-2',
        time: '10:00',
        title: 'Snack Puree Buah & Vitamin D3',
        desc: 'Puree pepaya matang + susu kedelai tinggi kalsium + Vitamin D3 2000 IU (Target: Serat & Tulang).',
        category: 'snack',
        dotColor: '#0284C7',
        scientificRationale: 'Vitamin D3 menjaga kekuatan otot tipe II dan koordinasi neuromuskular refleks keseimbangan.'
      },
      {
        id: 'sched-pger-3',
        time: '12:30',
        title: 'Makan Siang Nasi Tim Cincang Mudah Telan',
        desc: 'Nasi tim kaldu ayam + dada ayam cincang lembut + tahu sutra tim brokoli cincang halus (Target: 28g Protein).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Tekstur cincang halus meminimalkan risiko disfagia dan kelelahan mengunyah pada lansia.'
      },
      {
        id: 'sched-pger-4',
        time: '16:00',
        title: 'Snack Puding Puree Labu Kuning & Zinc',
        desc: 'Puding puree labu kuning santan encer + teh chamomile hangat (Target: Antioksidan & Zinc).',
        category: 'snack',
        dotColor: '#15803D',
        scientificRationale: 'Zinc mendukung fungsi indra pengecap nafsu makan dan integritas imun kulit lansia.'
      },
      {
        id: 'sched-pger-5',
        time: '19:00',
        title: 'Makan Malam Hangat Sup Ikan & Kentang Tumbuk',
        desc: 'Sup ikan patin kuah bening temu kunci + kentang tumbuk halus + wortel kukus empuk (Target: 25g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Kuah hangat mempermudah proses menelan dan menenangkan saluran pencernaan malam hari.'
      },
      {
        id: 'sched-pger-6',
        time: '21:00',
        title: 'Minuman ONS Malam & Hidrasi Teratur',
        desc: 'Minuman nutrisi medis ONS 150ml hangat + hidrasi cukup sebelum tidur untuk mencegah dehidrasi nokturnal.',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Menjaga ketersediaan asam amino plasma untuk mencegah pemecahan otot nocturne.'
      }
    ],
    contraindications: [
      {
        id: 'contra-pger-1',
        food: 'Makanan Keras, Liat, Alot & Kering (Risiko Disfagia & Aspirasi)',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Lansia rentan mengalami gangguan menelan (presbyphagia); makanan keras berisiko tersedak ke paru memicu aspirasi pneumonia fatal.',
        forbiddenItems: ['Keripik keras, kacang goreng keras utuh', 'Daging sapi alot berserat panjang tanpa dicincang', 'Biskuit kering tanpa dicelup cairan'],
        citation: 'IDDSI (International Dysphagia Diet Standardisation Initiative) & ESPEN'
      },
      {
        id: 'contra-pger-2',
        food: 'Diet Defisit Kalori Rendah Protein Ekstrem',
        risk: 'Tinggi (Hindari Total)',
        reason: 'Mempercepat hilangnya massa otot secara drastis (katabolisme sarkopenia) dalam hitungan hari.',
        forbiddenItems: ['Hanya makan bubur polos air garam tanpa protein', 'Melewatkan waktu makan > 5 jam di siang hari'],
        citation: 'PROT-AGE Study Group Consensus on Geriatric Protein Intake'
      },
      {
        id: 'contra-pger-3',
        food: 'Makanan Berpengawet Tinggi & Pemicu Konstipasi',
        risk: 'Sedang (Batasi)',
        reason: 'Motilitas kolon geriatri lambat; makanan rendah serat larut memicu impaksi feses dan ileus obstruksi.',
        forbiddenItems: ['Daging olahan kaleng berpengawet natrium nitrit', 'Gorengan berlemak jenuh padat'],
        citation: 'American Geriatrics Society Clinical Guidelines'
      }
    ]
  },

  // =========================================================================
  // KELOMPOK 2: GYM & FITNESS — 5 KATEGORI PERFORMA INTERNASIONAL
  // =========================================================================

  'gym_hypertrophy': {
    id: 'gym_hypertrophy',
    group: 'Gym & Fitness',
    groupKey: 'fitness',
    category: 'Bulking & Hipertrofi',
    title: 'Bulking & Hipertrofi Myofibril',
    titleEn: 'Hypertrophy & Myofibrillar Lean Bulking',
    protocol: 'ISSN Sports Nutrition Position Stand & Muscle Hypertrophy Protocol',
    protocolEn: 'ISSN Hypertrophy & Protein Timing Protocol',
    activeBadge: 'Hipertrofi Aktif',
    icon: 'dumbbell',
    accentColor: '#B45309',
    caloricNeedType: 'Surplus Kalori Moderat (+300 - 500 kcal / 2400 - 2800 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 1.8,
      carbPct: 50,
      fatPct: 25,
      fiberRestriction: false,
      leucinePerMealGrams: 3.0
    },
    keyMicronutrients: ['Leusin Minimal 3.0g/Meal', 'Karbohidrat Kompleks', 'Kreatin Monohidrat (5g)', 'Magnesium Bisglisinat', 'Kalium Elektrolit'],
    recommendedApiSources: ['USDA FoodData Central', 'FatSecret Indonesia'],
    proteinMultiplier: 1.8,
    description: 'Fokus pada surplus kalori moderat, pengisian glikogen intramuskular, aktivasi pensinyalan mTORC1 via Leusin (minimal 3g per meal), dan sintesis protein myofibril pasca-latihan beban.',
    guidelines: [
      'Konsumsi protein 1.6–2.2 g/kg BB terdistribusi merata per 3–4 jam dengan ambang leusin (leucine trigger) minimal 3.0g per waktu makan.',
      'Terapkan surplus kalori 300–500 kkal di atas TDEE untuk mendukung pembentukan jaringan otot baru tanpa penumpukan lemak berlebih.',
      'Kombinasikan karbohidrat kompleks indeks glikemik sedang dan protein cepat serap dalam rasio 3:1 pasca-latihan beban.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Hari 1–2 (Akut Post-Workout)',
        title: 'Resintesis Glikogen & Reduksi DOMS Akut',
        desc: 'Pengisian cepat cadangan glikogen otot, aktivasi jalur mTORC1 via asam amino Leusin, dan hidrasi elektrolit seluler.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 2],
        clinicalFocus: 'Jendela anabolik, resintesis glikogen otot, & relaksasi miofasial',
        proteinTarget: '1.6 - 1.8 g/kgBB',
        texture: 'Protein shake + karbohidrat cepat cerna sehat',
        superfoods: ['Pisang Ambon + Madu Murni', 'Whey Isolate & Susu Kedelai', 'Air Kelapa Elektrolit']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Hari 3–7 (Aktif)',
        title: 'Hipertrofi Myofibril & MPS Puncak (Aktif)',
        desc: 'Perbaikan mikrorobekan serat aktin-miosin. Distribusi protein merata setiap 3–4 jam untuk status anabolik positif.',
        status: 'active',
        progressPct: 65,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [3, 7],
        clinicalFocus: 'Puncak Muscle Protein Synthesis (MPS) & hipertrofi serat otot tipe II',
        proteinTarget: '1.8 - 2.2 g/kgBB',
        texture: 'Padat kaya protein tinggi asam amino esensial',
        superfoods: ['Dada Ayam Fillet Panggang', 'Daging Sapi Has Luar', 'Tempe Bacem & Telur Rebus']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 2–4',
        title: 'Adaptasi Neuromuskular & Superkompensasi',
        desc: 'Peningkatan densitas serat otot baru, konsolidasi kapasitas angkat beban lebih berat, dan regenerasi deload.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [8, 28],
        clinicalFocus: 'Superkompensasi glikogenik & adaptasi resistensi neuromuskular',
        proteinTarget: '1.6 - 1.8 g/kgBB',
        texture: 'Padat seimbang makronutrisi kompleks',
        superfoods: ['Ikan Salmon / Tuna Lokal', 'Nasi Merah & Ubi Jalar', 'Kacang Almond & Sayuran Hijau']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Siklus Akumulasi Volume & Hipertrofi Myofibril',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'Jäger R et al., ISSN Position Stand on Protein and Exercise (2017) & Phillips SM (2020)',
        healingTarget: {
          title: 'Resintesis Glikogen Penuh & Puncak Muscle Protein Synthesis (MPS)',
          markers: 'Resolusi DOMS dalam 48 jam, pemulihan kadar glikogen intramuskular > 95%, keseimbangan nitrogen positif.',
          clinicalGoal: 'Perbaikan mikrorobekan serabut aktin-miosin dan stimulasi jalur mTORC1 via asam amino Leusin.'
        },
        nutritionTarget: {
          protein: '1.8 – 2.2 g/kg BB/hari (3–4 porsi @ 0.4–0.5g/kg BB)',
          calories: '2400 – 2700 kkal/hari (Surplus Moderat)',
          micronutrients: 'Leusin minimal 3.0g per waktu makan (Leucine Trigger), Kreatin Monohidrat 5g/hari, Elektrolit Mg-K-Na',
          texture: 'Padat kaya protein tinggi asam amino esensial (EAA)',
          recommendedMenu: ['Dada Ayam Fillet Panggang', 'Putih Telur & Susu Kedelai', 'Daging Sapi Has Luar', 'Pisang Ambon + Madu']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Siklus Progresi Beban Mekanikal & Superkompensasi',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Schoenfeld BJ et al., Effects of Resistance Training Frequency on Muscle Hypertrophy (2021)',
        healingTarget: {
          title: 'Peningkatan Cross-Sectional Area (CSA) Serat Otot',
          markers: 'Peningkatan lingkar otot tanpa kenaikan persentase lemak berlebih, kekuatan repetisi beban meningkat.',
          clinicalGoal: 'Adaptasi beban mekanikal progresif (Progressive Overload) dengan pemulihan glikogen sempurna.'
        },
        nutritionTarget: {
          protein: '1.8 – 2.0 g/kg BB/hari',
          calories: '2500 – 2800 kkal/hari',
          micronutrients: 'Omega-3 EPA/DHA 2g, Zinc 20mg, Magnesium Bisglisinat 400mg, Asam Askorbat',
          texture: 'Padat seimbang kaya karbohidrat kompleks indeks glikemik sedang',
          recommendedMenu: ['Ikan Salmon / Tuna Lokal', 'Nasi Merah & Ubi Jalar Panggang', 'Tempe Bacem Rebus', 'Kacang Almond & Sayuran Hijau']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Siklus Deload Terstruktur & Konsolidasi Lean Mass',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'Helms ER et al., Evidence-based recommendations for natural bodybuilding contest preparation',
        healingTarget: {
          title: 'Konsolidasi Jaringan Otot Baru & Restorasi Saraf Pusat (CNS)',
          markers: 'Hilangnya kelelahan sistemik kronis, elastisitas tendon sendi prima, kesiapan siklus beban berikutnya.',
          clinicalGoal: 'Menghindari overreaching non-fungsional dan mempertahankan Lean Body Mass permanen.'
        },
        nutritionTarget: {
          protein: '1.6 – 1.8 g/kg BB/hari (Maintenance Deload)',
          calories: '2300 – 2500 kkal/hari',
          micronutrients: 'Multivitamin Lengkap, Glukosamin, Hidrasi Optimal 3.0 L/hari',
          texture: 'Padat gizi seimbang harian',
          recommendedMenu: ['Dada Ayam Bakar Madu Rempah', 'Pepes Ikan Kembung', 'Tumis Buncis Tahu', 'Nasi Beras Merah & Alpukat']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-ghyp-1',
        time: '07:00',
        title: 'Sarapan Pemicu Anabolik (Leucine Trigger)',
        desc: '4 butir putih telur + 1 telur utuh + oatmeal pisang madu murni (Target: 32g Protein, Leusin > 3.2g).',
        category: 'nutrition',
        dotColor: '#15803D',
        scientificRationale: 'Memicu sinyal mTORC1 pertama hari itu untuk menghentikan katabolisme nokturnal (Phillips, 2020).'
      },
      {
        id: 'sched-ghyp-2',
        time: '10:30',
        title: 'Snack Nutrisi & Elektrolit Pra-Latihan',
        desc: 'Air kelapa murni (300ml) + 3 butir kurma + segenggam almond (Target: Kalsium, Kalium & Karbohidrat Cepat).',
        category: 'snack',
        dotColor: '#0284C7',
        scientificRationale: 'Menjamin ketersediaan glukosa darah dan elektrolit mencegah kram saat kontraksi eksentrik.'
      },
      {
        id: 'sched-ghyp-3',
        time: '13:00',
        title: 'Nutrisi Jendela Anabolik Pasca-Latihan',
        desc: 'Protein shake cepat cerna (25g isolate) + pisang ambon / madu rasio karbo:protein 3:1 + Kreatin 5g.',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Memaksimalkan laju resintesis glikogen otot yang terkuras dan aktivasi serapan kreatin (Ivy et al.).'
      },
      {
        id: 'sched-ghyp-4',
        time: '15:30',
        title: 'Makan Siang Utama Regenerasi Myofibril',
        desc: 'Dada ayam bakar bumbu lengkuas (180g) + nasi merah + tumis buncis tempe (Target: 42g Protein).',
        category: 'nutrition',
        dotColor: '#7C3AED',
        scientificRationale: 'Asam amino esensial berkelanjutan untuk sintesis protein otot fase puncak (MPS peak 3–5 jam post-exercise).'
      },
      {
        id: 'sched-ghyp-5',
        time: '19:00',
        title: 'Makan Malam Perbaikan Jaringan & Antioksidan',
        desc: 'Daging sapi tanpa lemak / ikan tuna kukus (150g) + kentang panggang + brokoli wortel (Target: 36g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Zat besi heme dan seng mendukung sintesis hemoglobin dan pemulihan mioglobin otot.'
      },
      {
        id: 'sched-ghyp-6',
        time: '21:30',
        title: 'Kasein Pelepasan Lambat & Kualitas Tidur Anabolik',
        desc: 'Susu kedelai kental hangat / tahu sutra + magnesium bisglisinat (Target: 8 jam tidur restorasi CNS).',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Menjaga kadar asam amino plasma tetap stabil selama tidur, mencegah pemecahan otot nocturne.'
      }
    ],
    contraindications: [
      {
        id: 'contra-ghyp-1',
        food: 'Alkohol Pasca-Latihan (Post-Workout Alcohol Consumption)',
        risk: 'Kritis (Kontraindikasi Total)',
        reason: 'Menekan fosforilasi mTORC1 dan menurunkan sintesis protein otot (MPS) sebesar 24–37% meskipun diimbangi nutrisi protein cukup.',
        forbiddenItems: ['Bir, soju, cocktail beralkohol pasca-sesi beban', 'Minuman keras / hard liquor', 'Kue / dessert beralkohol tinggi'],
        citation: 'Parr EB et al., Alcohol Impairs Muscle Protein Synthesis, PLOS ONE (2014)'
      },
      {
        id: 'contra-ghyp-2',
        food: 'Pola Makan Defisit Protein Ekstrem & Melewatkan Nutrisi Pasca-Latihan',
        risk: 'Tinggi (Hindari)',
        reason: 'Memicu katabolisme massa otot bebas lemak (LBM), peningkatan hormon kortisol, dan pembatalan fase adaptasi hipertrofi.',
        forbiddenItems: ['Melewatkan makanan bergizi > 3–4 jam setelah sesi intensif', 'Hanya meminum air putih tanpa asam amino pemulihan otot', 'Diet nol karbohidrat & nol protein saat beban berat'],
        citation: 'ISSN Position Stand on Protein and Exercise (2017)'
      },
      {
        id: 'contra-ghyp-3',
        food: 'Fast Food Tinggi Lemak Jenuh & Minyak Teroksidasi (Trans-Fat)',
        risk: 'Sedang (Hindari)',
        reason: 'Menginduksi resistensi anabolik transien pada membran sarkolema dan memperpanjang inflamasi nyeri otot tertunda (DOMS).',
        forbiddenItems: ['Burger fast-food berlemak trans, kentang goreng deep-fried', 'Pizza keju olahan tinggi lemak jenuh & daging olahan', 'Keripik gurih minyak jelantah'],
        citation: 'Frontiers in Sports Nutrition & Muscle Biology'
      }
    ]
  },

  'gym_powerlifting': {
    id: 'gym_powerlifting',
    group: 'Gym & Fitness',
    groupKey: 'fitness',
    category: 'Powerlifting & Strength',
    title: 'Powerlifting & Maximum Strength Recovery',
    titleEn: 'Powerlifting & Central Nervous System Recovery',
    protocol: 'NSCA Strength & Conditioning & ISSN Ergogenic Aids Consensus',
    protocolEn: 'NSCA Strength Protocol & CNS Neuro-Recovery',
    activeBadge: 'CNS-Recovery Aktif',
    icon: 'shield',
    accentColor: '#4338CA',
    caloricNeedType: 'High Caloric Strength Maintenance (2600 - 3200 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 2.0,
      carbPct: 50,
      fatPct: 25,
      fiberRestriction: false,
      creatineDailyGrams: 5.0
    },
    keyMicronutrients: ['Creatine Monohydrate (5g)', 'Magnesium Bisglisinat (400mg)', 'Zinc Picolinate (25mg)', 'Kalsium Organik', 'Natrium Elektrolit'],
    recommendedApiSources: ['USDA FoodData Central', 'FatSecret Indonesia'],
    proteinMultiplier: 2.0,
    description: 'Fokus pada restorasi sistem saraf pusat (CNS), pemulihan cadangan fosfagen intramuskular (ATP-PCr), proteksi kepadatan tulang dan persendian dari beban kompresi aksial berat.',
    guidelines: [
      'Konsumsi Creatine Monohydrate 5g/hari secara konsisten untuk saturasi fosfokreatin otot dan regenerasi ATP cepat saat angkatan 1RM.',
      'Suplementasikan Magnesium Bisglisinat (400mg) sebelum tidur untuk relaksasi neuromuscular spindle dan restorasi neurotransmitter GABA.',
      'Pertahankan asupan kalori isokalorik hingga surplus ringan dengan karbohidrat tinggi untuk pengisian glikogen sistem saraf.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2',
        title: 'Fase Saturasi Kreatin & Restorasi Fosfagen',
        desc: 'Saturasi cadangan fosfokreatin (ATP-PCr), hidrasi seluler miofibril, dan adaptasi beban kompresi awal.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 14],
        clinicalFocus: 'Ketersediaan ATP-PCr, hidrasi intraseluler miofasial, & proteksi tendon',
        proteinTarget: '1.8 - 2.0 g/kgBB + Creatine 5g',
        texture: 'Padat berenergi tinggi asam amino',
        superfoods: ['Daging Sapi Has Dalam', 'Creatine Monohydrate', 'Telur Omega-3 Utuh']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–8 (Aktif)',
        title: 'Fase Beban Intensitas Maksimal & Proteksi Sendi (Aktif)',
        desc: 'Nutrisi pendukung beban angkatan >85% 1RM, densitas tulang aksial, dan suplementasi kalsium-magnesium sendi.',
        status: 'active',
        progressPct: 62,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [15, 56],
        clinicalFocus: 'Kekuatan kontraksi serat tipe IIx, integritas ligamen sakroiliaka/lutut, & CNS recovery',
        proteinTarget: '2.0 - 2.2 g/kgBB',
        texture: 'Padat padat gizi seimbang tinggi protein & elektrolit',
        superfoods: ['Dada Ayam Fillet Bakar', 'Sup Tulang Sumsum Sapi', 'Ubi Jalar Panggang']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 9–12',
        title: 'Fase Peaking Angkatan & Deload Kompetisi',
        desc: 'Optimasi cadangan neuromuskular puncak, superkompensasi glikogen, dan kesiapan rekor angkatan baru.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [57, 84],
        clinicalFocus: 'Efisiensi sinaps saraf motorik, kesiapan 1RM maksimal, & bebas inflamasi',
        proteinTarget: '1.8 - 2.0 g/kgBB',
        texture: 'Padat tinggi karbohidrat glikemik terkontrol',
        superfoods: ['Ikan Salmon Panggang', 'Nasi Putih / Merah Madu', 'Kacang Almond & Pisang']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Saturasi Fosfagen & Restorasi Neuromuskular',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'Buford TW et al., ISSN Position Stand on Creatine Supplementation (2017) & NSCA Guidelines',
        healingTarget: {
          title: 'Saturasi Fosfokreatin Otot (>120 mmol/kg DM) & CNS Reset',
          markers: 'Peningkatan kapasitas angkatan repetisi beban berat, hilangnya tremor kelelahan neuromuskular pasca-sesi.',
          clinicalGoal: 'Memaksimalkan laju resintesis ATP anaerobik alaktat saat kontraksi isometrik/konsentrik maksimal.'
        },
        nutritionTarget: {
          protein: '1.8 – 2.2 g/kg BB/hari (Daging Merah Heme & Telur)',
          calories: '2600 – 3000 kkal/hari',
          micronutrients: 'Creatine Monohydrate 5g, Magnesium Bisglisinat 400mg, Zinc 25mg, Natrium 3000mg',
          texture: 'Makanan padat bernilai biologis protein tinggi',
          recommendedMenu: ['Daging Sapi Has Cincang + Telur Utuh', 'Roti Gandum Utuh Madu', 'Sup Kaldu Tulang Sapi', 'Pisang Ambon']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Adaptasi Beban Aksial & Densitas Tulang-Tendon',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Close GL et al., Nutrition for the Prevention and Treatment of Muscle and Tendon Injuries',
        healingTarget: {
          title: 'Ketahanan Tendon Patella/Achilles & Kolagen Sendi',
          markers: 'Sendi bebas rasa nyeri tumpul pasca-squat/deadlift berat, densitas mineral tulang menahan beban aksial.',
          clinicalGoal: 'Memperkuat sambungan osteotendineus (Enthesis) menahan tegangan mekanis ekstrem.'
        },
        nutritionTarget: {
          protein: '2.0 – 2.2 g/kg BB/hari',
          calories: '2800 – 3200 kkal/hari',
          micronutrients: 'Kalsium 1200mg, Vitamin D3 3000 IU, Kolagen Hidrolisat 15g Pre-Lift, Omega-3 2g',
          texture: 'Padat berenergi tinggi karbohidrat kompleks',
          recommendedMenu: ['Dada Ayam Fillet Panggang', 'Ubi Jalar Bakar Madu', 'Pepes Ikan Kembung Omega-3', 'Tumis Bayam Wijen']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Peaking 1RM & Pemulihan Kelelahan Saraf Pusat',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'Helms ER et al., Strength and Conditioning Journal on Peaking Protocols for Powerlifting',
        healingTarget: {
          title: 'Efisiensi Laju Tembak Unit Motorik (Motor Unit Firing Rate)',
          markers: 'Pencapaian rekor angkatan baru (PR), kualitas tidur REM/Deep sleep optimal, HR variability (HRV) tinggi.',
          clinicalGoal: 'Mencegah burnout sistem saraf simpatis dan mencapai performa fisik puncak.'
        },
        nutritionTarget: {
          protein: '1.8 – 2.0 g/kg BB/hari',
          calories: '2700 – 3000 kkal/hari',
          micronutrients: 'Antioksidan Polifenol, L-Teanin, Magnesium, Hidrasi 3.5 L/hari',
          texture: 'Padat bergizi seimbang mudah cerna',
          recommendedMenu: ['Steak Daging Sapi Tenderloin', 'Nasi Putih Pulen + Sayur Bening', 'Smoothie Whey Tart Cherry', 'Almond Panggang']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-ppow-1',
        time: '07:00',
        title: 'Sarapan Padat Energi & Neurotransmitter',
        desc: '3 butir telur utuh + 100g daging sapi cincang + 2 lembar roti gandum panggang (Target: 38g Protein, Kolin & Zat Besi).',
        category: 'nutrition',
        dotColor: '#4338CA',
        scientificRationale: 'Kolin telur memicu sintesis neurotransmitter asetilkolin untuk transmisi sinaps neuromuskular (NSCA).'
      },
      {
        id: 'sched-ppow-2',
        time: '10:00',
        title: 'Pre-Lift Fosfagen & Elektrolit Pump',
        desc: 'Creatine Monohydrate 5g + air kelapa murni (300ml) + sejumput garam Himalaya + 1 buah pisang.',
        category: 'hydration',
        dotColor: '#0284C7',
        scientificRationale: 'Natrium dan glukosa mempercepat transportasi kreatin intraseluler via transporter CreaT.'
      },
      {
        id: 'sched-ppow-3',
        time: '13:00',
        title: 'Post-Lift Protein Tinggi & Pengisian Glikogen Cepat',
        desc: 'Whey Protein Isolate (35g protein) + nasi putih pulen madu (Target: 35g Protein + 60g Karbohidrat).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Lonjakan insulin pasca-latihan mempercepat transportasi asam amino dan glukosa ke serat otot tipe IIx.'
      },
      {
        id: 'sched-ppow-4',
        time: '15:30',
        title: 'Makan Siang Utama Anabolik Daging & Ubi',
        desc: 'Dada ayam bakar bumbu rempah (200g) + ubi jalar bakar + sup bayam jagung (Target: 45g Protein).',
        category: 'nutrition',
        dotColor: '#7C3AED',
        scientificRationale: 'Asam amino esensial sustained-release menjaga sintesis protein otot berkelanjutan.'
      },
      {
        id: 'sched-ppow-5',
        time: '19:00',
        title: 'Makan Malam Kolagen & Proteksi Tulang Sendi',
        desc: 'Ikan salmon / tuna steak bakar + sup tulang sumsum sapi + brokoli wortel kukus (Target: 38g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Omega-3 dan gelatin tulang meredakan inflamasi kompresi bantalan diskus intervertebralis.'
      },
      {
        id: 'sched-ppow-6',
        time: '21:30',
        title: 'Magnesium Bisglisinat & Tidur Restorasi CNS',
        desc: 'Magnesium Bisglisinat 400mg + segelas susu kasein hangat (Target: 8 jam tidur restorasi gelombang lambat delta).',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Magnesium menduduki reseptor NMDA untuk meredakan eksitotoksisitas neuron pasca-angkat beban maksimal.'
      }
    ],
    contraindications: [
      {
        id: 'contra-ppow-1',
        food: 'Pola Makan Defisit Kalori Drastis Saat Beban Berat',
        risk: 'Kritis (Hindari Total)',
        reason: 'Menyebabkan penurunan kadar glikogen sistem saraf, kehilangan koordinasi motorik, dan meningkatkan risiko hernia nukleus pulposus (HNP).',
        forbiddenItems: ['Diet defisit >700 kkal saat fase angkatan berat', 'Melewatkan sarapan sebelum sesi latihan beban berat'],
        citation: 'NSCA Strength & Conditioning Guidelines'
      },
      {
        id: 'contra-ppow-2',
        food: 'Dehidrasi & Pembatasan Elektrolit Natrium/Kalium',
        risk: 'Tinggi (Hindari)',
        reason: 'Dehidrasi 2% menurunkan output daya kontraksi 1RM sebesar 10–15% dan memicu kram spasme paraspinal.',
        forbiddenItems: ['Hanya minum air distilasi nol mineral', 'Menghindari garam total saat volume latihan angkat berat tinggi'],
        citation: 'American College of Sports Medicine (ACSM) Hydration Stand'
      },
      {
        id: 'contra-ppow-3',
        food: 'Konsumsi Alkohol Malam Hari Sebelum Latihan Berat',
        risk: 'Tinggi (Kontraindikasi Mutlak)',
        reason: 'Mengganggu transmisi neuromuskular asetilkolin dan menurunkan waktu reaksi refleks penopang beban sendi.',
        forbiddenItems: ['Minuman beralkohol pada malam sebelum sesi angkat beban berat'],
        citation: 'Sports Medicine Review on Alcohol and Neuromuscular Function'
      }
    ]
  },

  'gym_endurance': {
    id: 'gym_endurance',
    group: 'Gym & Fitness',
    groupKey: 'fitness',
    category: 'CrossFit / Endurance',
    title: 'CrossFit, Triathlon & High Endurance',
    titleEn: 'CrossFit & Endurance Metabolic Glycogen Reload',
    protocol: 'ACSM / IOC Consensus on Nutrition for Athletic Performance',
    protocolEn: 'ACSM / IOC High-Volume Endurance Protocol',
    activeBadge: 'Endurance Aktif',
    icon: 'activity',
    accentColor: '#0D9488',
    caloricNeedType: 'Tinggi Karbohidrat & Energi Tinggi (2800 - 3800 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 1.6,
      carbGPerKg: 7.0,
      carbPct: 60,
      fatPct: 20,
      fiberRestriction: false
    },
    keyMicronutrients: ['Karbohidrat Cepat & Lambat (6-10g/kg)', 'Natrium Elektrolit (500-1000mg/L)', 'Kalium', 'Magnesium', 'Antioksidan Quercetin'],
    recommendedApiSources: ['Edamam / Nutritionix API', 'FatSecret Indonesia', 'USDA FoodData Central'],
    proteinMultiplier: 1.6,
    description: 'Fokus pada pembakaran kalori ekstrem, pengisian kembali glikogen otot-hati dengan karbohidrat multimodal, hidrasi cairan elektrolit isotonik, dan pencegahan hiponatremia.',
    guidelines: [
      'Penuhi asupan karbohidrat 6–10 g/kg BB/hari untuk saturasi glikogen hepar dan intramuskular sebelum dan sesudah sesi volume tinggi.',
      'Gunakan strategi hidrasi isotonik dengan natrium (500–700mg/L) dan elektrolit kalium untuk mengganti keringat masif.',
      'Kombinasikan protein berkualitas 1.4–1.8 g/kg BB untuk meredakan pemecahan asam amino BCAA saat durasi latihan panjang.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Hari 1–3',
        title: 'Fase Resintesis Glikogen Cepat & Rehidrasi Seluler',
        desc: 'Penggantian cairan elektrolit masif dan karbohidrat multimodal (glukosa:fruktosa 2:1) pasca-sesi high-intensity.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 3],
        clinicalFocus: 'Keseimbangan cairan seluler, restorasi glikogen hepar, & klirens asam laktat',
        proteinTarget: '1.4 - 1.6 g/kgBB + Karbohidrat Tinggi',
        texture: 'Minuman isotonik + makanan padat karbohidrat tinggi',
        superfoods: ['Air Kelapa Murni + Garam Himalaya', 'Pisang Ambon + Madu', 'Oatmeal Kismis']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 1–4 (Aktif)',
        title: 'Fase Efisiensi Oksidasi Substrat & Ambang Laktat',
        desc: 'Optimasi metabolisme mitokondria, ketahanan VO2 max, dan preservasi massa otot saat volume latihan mingguan tinggi.',
        status: 'active',
        progressPct: 68,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [4, 28],
        clinicalFocus: 'Biogenesis mitokondria, efisiensi glikolisis aerobik, & supresi DOMS',
        proteinTarget: '1.6 - 1.8 g/kgBB',
        texture: 'Padat kaya karbohidrat kompleks & protein lean',
        superfoods: ['Nasi Merah & Ubi Ungu', 'Dada Ayam Fillet Rebus', 'Smoothie Bit & Beri']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 5–12',
        title: 'Fase Superkompensasi Karbohidrat (Carbo-Loading)',
        desc: 'Protokol carbo-loading terstruktur menjelang kompetisi endurance dan pemeliharaan imunitas mukosa.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [29, 84],
        clinicalFocus: 'Saturasi cadangan glikogen maksimal (supercompensation) & performa puncak',
        proteinTarget: '1.4 - 1.6 g/kgBB',
        texture: 'Padat tinggi karbohidrat indeks glikemik terkontrol',
        superfoods: ['Pasta Gandum Ikan Tuna', 'Kurma Medjool', 'Jus Buah Bit Quercetin']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Resintesis Glikogen Hepato-Muskular & Hidrasi',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'Thomas DT et al., ACSM / AND Joint Position Statement on Nutrition and Athletic Performance',
        healingTarget: {
          title: 'Resintesis Glikogen Lengkap dalam 24 Jam & Euvolemia',
          markers: 'Warna urin jernih/kuning pucat (Usg < 1.020), glikogen intramuskular kembali penuh, bebas kram panas (heat cramps).',
          clinicalGoal: 'Menjaga volume plasma intravaskular dan ketersediaan glukosa selama latihan intensif multi-jam.'
        },
        nutritionTarget: {
          protein: '1.4 – 1.6 g/kg BB/hari',
          calories: '2800 – 3400 kkal/hari (Tinggi Karbohidrat 6-8g/kg)',
          micronutrients: 'Natrium 800mg/L keringat, Kalium 4000mg, Magnesium 400mg, Antioksidan Vitamin C & E',
          texture: 'Padat kaya karbohidrat kompleks + minuman hidrasi isotonik',
          recommendedMenu: ['Oatmeal Kismis Pisang Madu', 'Minuman Isotonik Elektrolit', 'Nasi Merah + Dada Ayam + Tumis Sayur', 'Smoothie Buah Bit']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Adaptasi Mitokondria & Ambang Laktat Tinggi',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Burke LM et al., IOC Consensus Statement on Dietary Supplements and the High-Performance Athlete',
        healingTarget: {
          title: 'Efisiensi Pembakaran Lemak & Karbohidrat Substrat',
          markers: 'Peningkatan daya tahan pada ambang anaerobik (Lactate Threshold), pemulihan denyut jantung cepat pasca-interval.',
          clinicalGoal: 'Meningkatkan densitas mitokondria serabut otot tipe I dan toleransi asidosis laktat.'
        },
        nutritionTarget: {
          protein: '1.6 – 1.8 g/kg BB/hari',
          calories: '3000 – 3600 kkal/hari (Karbohidrat 7-9g/kg)',
          micronutrients: 'Quercetin 500mg, Beta-Alanin 3.2g, Zat Besi Heme, Vitamin B-Kompleks',
          texture: 'Padat berenergi tinggi bergizi seimbang',
          recommendedMenu: ['Pasta Gandum Ikan Tuna Saus Tomat Segar', 'Ubi Jalar Rebus + Telur Rebus', 'Sup Daging Sapi Bening', 'Kurma Segar']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Carbo-Loading Kompetisi & Puncak VO2 Max',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'Jeukendrup A., Nutrition for endurance sports: marathon, triathlon, and road cycling (Sports Med)',
        healingTarget: {
          title: 'Kapasitas Superkompensasi Glikogen Puncak (Carbo-Load)',
          markers: 'Cadangan glikogen meningkat hingga 150% kapasitas normal, daya tahan optimal tanpa "hitting the wall".',
          clinicalGoal: 'Mempertahankan output daya aerobik konstan selama seluruh durasi perlombaan endurance.'
        },
        nutritionTarget: {
          protein: '1.4 – 1.6 g/kg BB/hari',
          calories: '3200 – 3800 kkal/hari (Karbohidrat 8-10g/kg)',
          micronutrients: 'Elektrolit Lengkap Na-K-Mg-Cl, Antioksidan Tart Cherry, Hidrasi Terjadwal',
          texture: 'Padat mudah cerna rendah lemak & serat moderat',
          recommendedMenu: ['Nasi Putih Pulen + Dada Ayam Panggang Lembut', 'Smoothie Pisang Madu Chia', 'Jus Tart Cherry Anti-DOMS', 'Roti Gandum Selai Kacang']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-pend-1',
        time: '06:30',
        title: 'Sarapan Pengisi Glikogen Pra-Endurance',
        desc: 'Oatmeal matang + kismis + pisang ambon + madu murni + 2 butir putih telur (Target: 20g Protein, 75g Karbohidrat).',
        category: 'nutrition',
        dotColor: '#0D9488',
        scientificRationale: 'Meningkatkan cadangan glikogen hepar yang berkurang semalaman (ACSM, 2020).'
      },
      {
        id: 'sched-pend-2',
        time: '09:30',
        title: 'Intra-Session Hidrasi Isotonik & Elektrolit',
        desc: 'Minuman isotonik (500ml) dengan 30g karbohidrat multimodal (glukosa:fruktosa) + 300mg Natrium + 2 butir kurma.',
        category: 'hydration',
        dotColor: '#0284C7',
        scientificRationale: 'Mempertahankan glukosa darah 4-5 mmol/L dan mencegah dehidrasi hiponatremik saat sesi berat.'
      },
      {
        id: 'sched-pend-3',
        time: '12:30',
        title: 'Makan Siang Pemulihan Glikogen & Otot',
        desc: 'Nasi merah (200g) + dada ayam fillet bakar + tumis sayuran warna-warni brokoli wortel (Target: 35g Protein, 80g Karbohidrat).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Jendela resintesis glikogen tingkat tinggi berlangsung paling efisien pada 2 jam pasca-latihan.'
      },
      {
        id: 'sched-pend-4',
        time: '15:30',
        title: 'Smoothie Pemulihan Oksigenasi Buah Bit',
        desc: 'Smoothie buah bit merah (kaya nitrat alami) + buah beri + whey protein isolate 20g (Target: Nitrit Oksida & Protein).',
        category: 'snack',
        dotColor: '#7C3AED',
        scientificRationale: 'Nitrat alami buah bit meningkatkan efisiensi konsumsi oksigen mitokondria (VO2 efficiency).'
      },
      {
        id: 'sched-pend-5',
        time: '18:30',
        title: 'Makan Malam Pasta Gandum & Ikan Tuna',
        desc: 'Pasta gandum utuh + tuna suwir saus tomat segar + minyak zaitun + salad bayam (Target: 32g Protein, 85g Karbohidrat).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Karbohidrat kompleks melepaskan glukosa stabil untuk pemulihan glikogen otot sepanjang malam.'
      },
      {
        id: 'sched-pend-6',
        time: '21:00',
        title: 'Tart Cherry Juice Anti-DOMS & Hidrasi Kelapa',
        desc: 'Jus Tart Cherry (200ml) kaya antosianin anti-inflamasi + air kelapa murni 200ml untuk pemulihan otot nokturnal.',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Antosianin tart cherry mempercepat pemulihan kekuatan otot isometrik dan meredakan DOMS.'
      }
    ],
    contraindications: [
      {
        id: 'contra-pend-1',
        food: 'Diet Sangat Rendah Karbohidrat (Keto Ekstrem) Tanpa Adaptasi',
        risk: 'Tinggi (Hindari)',
        reason: 'Menguras glikogen otot, memicu penurunan performa drastis ("bonking / hitting the wall") pada intensitas tinggi >75% VO2max.',
        forbiddenItems: ['Diet nol karbohidrat saat fase volume endurance tinggi', 'Melewatkan asupan karbohidrat pra-latihan jarak jauh'],
        citation: 'Burke LM et al., Low carbohydrate, high fat diet impairs exercise economy in elite race walkers'
      },
      {
        id: 'contra-pend-2',
        food: 'Minum Air Murni Berlebih Tanpa Elektrolit (Water Intoxication)',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Memicu hiponatremia terkait olahraga (Exercise-Associated Hyponatremia / EAH), edema serebral, dan kejang.',
        forbiddenItems: ['Meminum >1.5 liter air putih murni per jam tanpa tambahan natrium/elektrolit saat berkeringat masif'],
        citation: 'Consensus Statement of the 3rd International Exercise-Associated Hyponatremia Consensus Conference'
      },
      {
        id: 'contra-pend-3',
        food: 'Makanan Tinggi Serat Kasar & Lemak Tepat Sebelum Sesi Latihan',
        risk: 'Sedang (Batasi 2 Jam Pre-Workout)',
        reason: 'Memperlambat pengosongan lambung dan memicu kram perut, refluks asam, dan diare pelari (runner’s diarrhea).',
        forbiddenItems: ['Sayuran kol mentah, kacang merah mentah berserat tebal 30 menit sebelum lari', 'Gorengan berlemak jenuh'],
        citation: 'ACSM Sports Nutrition Pre-Exercise Guidelines'
      }
    ]
  },

  'gym_recomp': {
    id: 'gym_recomp',
    group: 'Gym & Fitness',
    groupKey: 'fitness',
    category: 'Body Recomposition',
    title: 'Body Recomposition (Fat Loss & Muscle Gain)',
    titleEn: 'Body Recomposition & Lean Mass Retention',
    protocol: 'ISSN Body Composition & Energy Restriction Stand',
    protocolEn: 'ISSN Recomposition & Protein Partitioning Protocol',
    activeBadge: 'Recomp Aktif',
    icon: 'target',
    accentColor: '#D97706',
    caloricNeedType: 'Defisit Ringan Termogenik (-200 - 300 kcal / 1900 - 2200 kkal)',
    targetMacronutrients: {
      proteinGPerKg: 2.2,
      carbPct: 40,
      fatPct: 25,
      fiberGrams: 35,
      fiberRestriction: false
    },
    keyMicronutrients: ['Protein Maksimal (2.0-2.4 g/kg)', 'Tinggi Serat Larut (>30g)', 'Magnesium Sitrat', 'Vitamin D3', 'Kromium Pikolinat'],
    recommendedApiSources: ['FatSecret Indonesia', 'Open Food Facts API', 'USDA FoodData Central'],
    proteinMultiplier: 2.2,
    description: 'Fokus pada preservasi total massa otot bebas lemak (LBM) saat pembakaran cadangan lemak subkutan melalui defisit kalori tipis (-200 hingga -300 kcal) dan protein ultra-tinggi.',
    guidelines: [
      'Tingkatkan asupan protein ke tingkat maksimal 2.0–2.4 g/kg BB untuk mencegah pemecahan otot dalam kondisi defisit kalori.',
      'Jaga defisit kalori tetap konservatif (10–15% di bawah TDEE) agar laju sintesis protein otot (MPS) tetap aktif berjalan.',
      'Konsumsi serat pangan tinggi (>30–35g/hari) untuk rasa kenyang berkelanjutan dan kestabilan indeks glikemik darah.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2',
        title: 'Fase Termogenik & Adaptasi Keseimbangan Nitrogen',
        desc: 'Penetapan defisit kalori konservatif (-250 kcal) dengan protein maksimal untuk mempertahankan retensi nitrogen positif.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 14],
        clinicalFocus: 'Keseimbangan nitrogen positif dalam defisit, supresi rasa lapar, & hidrasi seluler',
        proteinTarget: '2.0 - 2.2 g/kgBB (High Protein Retention)',
        texture: 'Padat tinggi serat & protein murni tanpa lemak',
        superfoods: ['Dada Ayam Fillet Kukus', 'Putih Telur Rebus 5 Butir', 'Bayam & Brokoli Kukus']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–8 (Aktif)',
        title: 'Fase Oksidasi Lemak Subkutan & Hipertrofi LBM',
        desc: 'Mobilisasi asam lemak bebas melalui defisit terukur seraya menjaga intensitas angkat beban untuk sinyal anabolik otot.',
        status: 'active',
        progressPct: 65,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [15, 56],
        clinicalFocus: 'Penurunan persentase lemak tubuh (body fat %) & peningkatan densitas otot skelet',
        proteinTarget: '2.2 - 2.4 g/kgBB',
        texture: 'Padat padat nutrisi rendah kalori (High Volume, Low Calorie)',
        superfoods: ['Ikan Tenggiri / Kembung Panggang', 'Tahu Tempe Rebus Probiotik', 'Nasi Shirataki / Konjac']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 9–12',
        title: 'Fase Konsolidasi Komposisi Tubuh & Diet Break',
        desc: 'Periode isokalorik terjadwal (refeed / diet break) untuk merestorasi hormon tiroid T3 dan leptin pembakar lemak.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [57, 84],
        clinicalFocus: 'Reset metabolisme basal (BMR), pemeliharaan LBM, & pencegahan adaptasi metabolik',
        proteinTarget: '2.0 - 2.2 g/kgBB',
        texture: 'Padat gizi seimbang teratur',
        superfoods: ['Dada Ayam Panggang Herbal', 'Kentang Rebus Kulit', 'Alpukat Porsi Terukur']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Retensi Nitrogen Positif Dalam Defisit Energi',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'Barakat C et al., Body Recomposition: Can Trained Individuals Build Muscle and Lose Fat at the Same Time? (2020)',
        healingTarget: {
          title: 'Preservasi Massa Otot & Awal Penurunan Lemak',
          markers: 'Penurunan lingkar pinggang 1–2 cm, massa otot skelet (InBody/DEXA) stabil/meningkat, kekuatan angkatan beban terjaga.',
          clinicalGoal: 'Menjamin stimulus anabolik myofibril tetap aktif meskipun tubuh dalam kondisi defisit energi moderat.'
        },
        nutritionTarget: {
          protein: '2.0 – 2.2 g/kg BB/hari',
          calories: '1900 – 2100 kkal/hari (Defisit Tipis 200-300 kcal)',
          micronutrients: 'Serat Larut >30g, Magnesium Sitrat 400mg, Vitamin D3 2000 IU, Kromium Pikolinat 200mcg',
          texture: 'Volume makanan tinggi (High Volume Foods) kaya sayuran hijau & protein murni',
          recommendedMenu: ['Putih Telur Rebus + Tumis Bayam Jamur', 'Dada Ayam Panggang + Nasi Konjac / Merah', 'Greek Yogurt Rendah Lemak', 'Ikan Tenggiri Bakar']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Oksidasi Lemak Maksimal & Partisi Nutrisi P-Ratio',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Aragon AA et al., International Society of Sports Nutrition Position Stand: Diets and Body Composition (2017)',
        healingTarget: {
          title: 'Penurunan Persentase Lemak Tubuh (Body Fat % Turun 1.5–2.5%)',
          markers: 'Definisi vaskularitas otot meningkat, rasio lingkar pinggang-panggul (WHR) membaik, tidak ada kehilangan kekuatan.',
          clinicalGoal: 'Mengarahkan partisi kalori (P-Ratio) menuju oksidasi adiposa seraya mempertahankan LBM.'
        },
        nutritionTarget: {
          protein: '2.2 – 2.4 g/kg BB/hari (Protein Maksimal Pelindung Otot)',
          calories: '1950 – 2200 kkal/hari',
          micronutrients: 'EGCG Ekstrak Teh Hijau, Omega-3 2g, Zinc 20mg, Kalsium 1000mg',
          texture: 'Padat seimbang rendah indeks glikemik',
          recommendedMenu: ['Dada Ayam Fillet Bakar Lengkuas', 'Sup Ikan Kembung Bening', 'Tahu Tempe Kukus', 'Brokoli & Kembang Kol Kukus']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Refeed Karbohidrat Terjadwal & Konsolidasi Otot',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'Longland TM et al., Higher compared with lower dietary protein during an energy deficit combined with resistance training (AJCN)',
        healingTarget: {
          title: 'Komposisi Tubuh Atletik Baru & Kestabilan Metabolik',
          markers: 'Pencapaian target komposisi tubuh ideal, kadar hormon leptin dan tiroid terjaga stabil, nafsu makan terkontrol.',
          clinicalGoal: 'Mencegah perlambatan metabolisme adaptif (Adaptive Thermogenesis) dan menetapkan set-point baru.'
        },
        nutritionTarget: {
          protein: '2.0 – 2.2 g/kg BB/hari',
          calories: '2100 – 2300 kkal/hari (Isokalorik Refeed)',
          micronutrients: 'Multivitamin Harian Lengkap, Antioksidan Polifenol, Hidrasi 3.0 L/hari',
          texture: 'Makanan padat bergizi seimbang permanen',
          recommendedMenu: ['Daging Sapi Has Luar Panggang', 'Nasi Merah Pulen', 'Pepes Tahu Jamur Tiram', 'Buah Apel Hijau & Alpukat']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-prec-1',
        time: '07:00',
        title: 'Sarapan Protein Termogenik Tinggi & Teh Hijau',
        desc: '4 butir putih telur + 1 telur utuh + tumis bayam jamur kancing + secangkir teh hijau tanpa gula (Target: 28g Protein, EGCG).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Efek termis makanan (TEF) protein tinggi membakar 20–30% kalorinya sendiri selama proses pencernaan (ISSN).'
      },
      {
        id: 'sched-prec-2',
        time: '10:30',
        title: 'Snack Protein Rendah Lemak & Biji Chia',
        desc: 'Greek yogurt tanpa gula (120g) + 1 sdt biji chia + kayu manis bubuk (Target: 14g Protein, Serat Larut).',
        category: 'snack',
        dotColor: '#0284C7',
        scientificRationale: 'Kayu manis membantu meningkatkan sensitivitas reseptor insulin sel otot terhadap glukosa.'
      },
      {
        id: 'sched-prec-3',
        time: '13:00',
        title: 'Makan Siang Volume Tinggi Rendah Kalori',
        desc: 'Dada ayam panggang fillet (160g) + nasi shirataki/konjac + brokoli & wortel kukus porsi melimpah (Target: 40g Protein, <400 kkal).',
        category: 'nutrition',
        dotColor: '#15803D',
        scientificRationale: 'Makanan bervolume tinggi dengan densitas kalori rendah meregangkan mekanoreseptor lambung, memicu hormon kenyang PYY.'
      },
      {
        id: 'sched-prec-4',
        time: '16:00',
        title: 'Post-Workout Whey Isolate & Apel Hijau',
        desc: 'Whey Protein Isolate (25g protein) dalam air dingin + 1 buah apel hijau segar (Target: 25g Protein, Pektin).',
        category: 'snack',
        dotColor: '#7C3AED',
        scientificRationale: 'Menyediakan asam amino esensial cepat serap untuk memicu sintesis protein otot pasca-latihan beban.'
      },
      {
        id: 'sched-prec-5',
        time: '19:00',
        title: 'Makan Malam Pembakar Lemak & Serat',
        desc: 'Ikan kembung/tenggiri bakar sambal dabu-dabu segar + sup bening oyong tahu sutra (Target: 32g Protein, Omega-3).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Asam lemak Omega-3 mengaktivasi reseptor PPAR-alpha di hati untuk meningkatkan laju beta-oksidasi lemak.'
      },
      {
        id: 'sched-prec-6',
        time: '21:30',
        title: 'Magnesium Sitrat & Hidrasi Malam',
        desc: 'Suplemen Magnesium Sitrat 350mg + 300ml air putih hangat untuk mendukung relaksasi otot dan tidur restoratif.',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Kualitas tidur optimal menurunkan hormon kortisol katabolik dan menstimulasi pembakaran lemak nokturnal.'
      }
    ],
    contraindications: [
      {
        id: 'contra-prec-1',
        food: 'Camilan Manis Tersembunyi, Saus Salad Berkalori Tinggi & Sirup',
        risk: 'Tinggi (Hindari)',
        reason: 'Menghilangkan defisit kalori harian tanpa memberikan rasa kenyang ataupun asam amino protektif otot.',
        forbiddenItems: ['Mayones biasa porsi tebal, dressing salad botolan manis', 'Minuman boba manis, es kopi susu gula aren', 'Keripik gurih berkalori padat tersembunyi'],
        citation: 'ISSN Position Stand on Diets and Body Composition'
      },
      {
        id: 'contra-prec-2',
        food: 'Defisit Kalori Terlalu Ekstrem (>750 kcal / Crash Dieting)',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Memicu penurunan hormon tiroid T3, peningkatan drastis kortisol, kehilangan massa otot hingga 40% dari total penurunan berat.',
        forbiddenItems: ['Diet kelaparan <1000 kkal per hari untuk orang aktif', 'Hanya makan buah tanpa asupan protein memadai'],
        citation: 'American Journal of Clinical Nutrition on Severe Caloric Restriction'
      },
      {
        id: 'contra-prec-3',
        food: 'Konsumsi Alkohol Rutin',
        risk: 'Tinggi (Batasi Ketat)',
        reason: 'Alkohol menghentikan oksidasi lemak hati hingga 73% dan menurunkan sintesis protein otot.',
        forbiddenItems: ['Minuman bir, cocktail berkalori tinggi alkohol'],
        citation: 'Journal of Lipid Research on Alcohol and Fat Oxidation'
      }
    ]
  },

  'gym_high_volume': {
    id: 'gym_high_volume',
    group: 'Gym & Fitness',
    groupKey: 'fitness',
    category: 'Atlet High-Volume',
    title: 'Atlet High-Volume & Reduksi DOMS Ekstrem',
    titleEn: 'High-Volume Multi-Session Athlete & Anti-Inflammation',
    protocol: 'IOC Consensus Statement on Sports Nutrition & DOMS Management',
    protocolEn: 'IOC High-Volume Athlete & Tissue Remodeling Consensus',
    activeBadge: 'Anti-DOMS Aktif',
    icon: 'zap',
    accentColor: '#B91C1C',
    caloricNeedType: 'Kalori Ekstrem Multi-Sesi (3200 - 5000+ kkal)',
    targetMacronutrients: {
      proteinGPerKg: 2.0,
      carbPct: 55,
      fatPct: 25,
      fiberRestriction: false
    },
    keyMicronutrients: ['Kurkuminoid Bioaktif (500mg)', 'Asam Lemak Omega-3 (3g EPA/DHA)', 'Vitamin C (500mg)', 'Vitamin E Alami', 'Glukosa Polimer'],
    recommendedApiSources: ['USDA FoodData Central', 'FatSecret Indonesia', 'Edamam / Nutritionix API'],
    proteinMultiplier: 2.0,
    description: 'Fokus pada atlet kompetitif dengan sesi latihan 2–3 kali sehari, kebutuhan kalori masif (3000–5000+ kcal), penanganan mikrorobekan otot ekstrem (EIMD / DOMS), dan pemulihan cepat antar-sesi.',
    guidelines: [
      'Gunakan strategi nutrisi terbagi 5–6 kali makan padat energi + cairan pemulihan cepat untuk memenuhi kebutuhan 3500–5000 kkal tanpa gangguan lambung.',
      'Suplementasikan kurkuminoid, ekstrak buah tart cherry, dan Omega-3 dosis tinggi (3g EPA/DHA) untuk mempercepat klirens enzim Creatine Kinase (CK).',
      'Pastikan jendela resintesis glikogen dimulai dalam 30 menit pasca-sesi 1 untuk kesiapan performa optimal pada sesi 2 di hari yang sama.'
    ],
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Hari 1–3',
        title: 'Fase Meredakan EIMD & Marker Kerusakan Otot',
        desc: 'Asupan polifenol antioksidan tinggi (Kurkumin + Tart Cherry) untuk meredakan inflamasi sitokin dan marker CK otot.',
        status: 'completed',
        progressPct: 100,
        icon: 'check-circle',
        badgeText: 'Selesai',
        dayRange: [1, 3],
        clinicalFocus: 'Klirens kreatin kinase (CK), redakan pembengkakan miofasial, & resintesis glikogen',
        proteinTarget: '1.8 - 2.0 g/kgBB + Anti-Inflamasi Alami',
        texture: 'Padat berenergi tinggi + smoothie antioksidan',
        superfoods: ['Jus Tart Cherry Murni', 'Ekstrak Temu Lawak / Kunyit', 'Ikan Salmon Kaya Omega-3']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 1–4 (Aktif)',
        title: 'Fase Resintesis Cepat Antar-Sesi (Inter-Session Recovery)',
        desc: 'Protokol nutrisi cepat serap di antara sesi pagi dan sore untuk mempertahankan output daya tinggi tanpa kelelahan bertumpuk.',
        status: 'active',
        progressPct: 65,
        icon: 'zap',
        badgeText: 'Fase Berjalan',
        dayRange: [4, 28],
        clinicalFocus: 'Keseimbangan energi harian penuh, supresi stres oksidatif, & imunitas mukosa',
        proteinTarget: '2.0 - 2.2 g/kgBB',
        texture: 'Padat berenergi masif mudah cerna',
        superfoods: ['Dada Ayam Fillet Bakar Madu', 'Nasi Putih Pulen + Ubi Jalar', 'Smoothie Pisang Whey Protein']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 5–12',
        title: 'Fase Remodeling Jaringan Puncak & Kebugaran Super',
        desc: 'Konsolidasi kapasitas kerja atletik maksimal, adaptasi neuromuscular firing, dan proteksi kekebalan tubuh jangka panjang.',
        status: 'upcoming',
        progressPct: 0,
        icon: 'lock',
        badgeText: 'Tahap Lanjut',
        dayRange: [29, 84],
        clinicalFocus: 'Puncak performa kompetisi, ketahanan sendi-tendon, & pencegahan sindrom RED-S',
        proteinTarget: '1.8 - 2.0 g/kgBB',
        texture: 'Padat gizi seimbang kalori ultra-tinggi',
        superfoods: ['Daging Sapi Tenderloin', 'Ikan Kembung Omega-3', 'Kacang Almond & Buah Segar']
      }
    ],
    monthlyMilestones: [
      {
        monthIndex: 1,
        monthLabel: 'Bulan ke-1 (Hari 1–30)',
        phaseName: 'Fase Reduksi Kerusakan Otot (EIMD) & Marker CK',
        durationDays: 'Hari 1 – 30',
        scientificCitation: 'Owens DJ et al., Exercise-induced muscle damage: What is it, what causes it and what are the nutritional solutions? (Sports Med)',
        healingTarget: {
          title: 'Penurunan Cepat Kadar Creatine Kinase (CK) Serum',
          markers: 'Kadar CK turun kembali normal dalam 36 jam, pemulihan Delayed Onset Muscle Soreness (DOMS) 50% lebih cepat.',
          clinicalGoal: 'Menjaga integritas sarkolema dan mengurangi kebocoran protein intramuskular ke sirkulasi darah.'
        },
        nutritionTarget: {
          protein: '2.0 – 2.2 g/kg BB/hari',
          calories: '3400 – 4200 kkal/hari (Padat Energi Multi-Sesi)',
          micronutrients: 'Kurkumin 500mg, Asam Lemak Omega-3 3g EPA/DHA, Vitamin C 500mg, Vitamin E Alami 200 IU',
          texture: 'Padat berenergi masif + smoothie antioksidan tart cherry',
          recommendedMenu: ['Nasi Uduk Ayam Kampung Telur', 'Smoothie Whey Tart Cherry', 'Recovery Bowl Salmon Nasi Merah', 'Steak Daging Sapi + Kentang']
        }
      },
      {
        monthIndex: 2,
        monthLabel: 'Bulan ke-2 (Hari 31–60)',
        phaseName: 'Fase Pemulihan Antar-Sesi & Keseimbangan Energi Positif',
        durationDays: 'Hari 31 – 60',
        scientificCitation: 'Betts JA et al., Recovery nutrition for athletes: accelerating muscle glycogen resynthesis and protein balance',
        healingTarget: {
          title: 'Resintesis Glikogen Otot Maksimal Antar-Sesi Latihan',
          markers: 'Kapasitas output daya sesi ke-2 di hari yang sama mencapai >95% sesi pertama, tidak ada defisit energi relatif.',
          clinicalGoal: 'Mencegah sindrom Relative Energy Deficiency in Sport (RED-S) dan supresi hormon tiroid/testosteron.'
        },
        nutritionTarget: {
          protein: '1.8 – 2.2 g/kg BB/hari',
          calories: '3600 – 4600 kkal/hari',
          micronutrients: 'Glukosa Polimer Cepat Cerna, Elektrolit Lengkap Na-K-Mg, Seng 25mg, B-Kompleks',
          texture: 'Padat berenergi tinggi mudah dicerna antar sesi',
          recommendedMenu: ['Pasta Gandum Daging Sapi Cincang', 'Jus Jeruk Segar Madu', 'Dada Ayam Bakar Lengkuas', 'Pisang Ambon + Roti Gandum']
        }
      },
      {
        monthIndex: 3,
        monthLabel: 'Bulan ke-3 (Hari 61–90)',
        phaseName: 'Fase Imunitas Saluran Napas Atas & Puncak Kompetisi',
        durationDays: 'Hari 61 – 90',
        scientificCitation: 'Gleeson M., Immunological aspects of sport and exercise (Sports Science Exchange & IOC Consensus)',
        healingTarget: {
          title: 'Proteksi Imunologis Mukosa (sIgA) & Bebas Sindrom Overtraining',
          markers: 'Kadar Secretory IgA saliva stabil, tidak ada episode Upper Respiratory Tract Infection (URTI), kesiapan puncak.',
          clinicalGoal: 'Mempertahankan daya tahan imunologis tubuh saat beban volume latihan mencapai puncak kompetisi.'
        },
        nutritionTarget: {
          protein: '1.8 – 2.0 g/kg BB/hari',
          calories: '3500 – 4500 kkal/hari',
          micronutrients: 'Probiotik Multi-Strain, Vitamin D3 4000 IU, Antioksidan Polifenol, Hidrasi 4.0 L/hari',
          texture: 'Padat bergizi seimbang kalori tinggi',
          recommendedMenu: ['Ikan Kembung Bakar Kunyit Rempah', 'Pepes Tahu Telur', 'Sayur Bening Bayam Oyong', 'Susu Kasein Madu Hangat']
        }
      }
    ],
    defaultDailySchedules: [
      {
        id: 'sched-phvol-1',
        time: '06:30',
        title: 'Sarapan Kalori Tinggi Sesi Pagi',
        desc: 'Nasi uduk (200g) + dada ayam kampung suwir + 2 telur rebus + jus jeruk segar madu (Target: 36g Protein, 90g Karbohidrat).',
        category: 'nutrition',
        dotColor: '#B91C1C',
        scientificRationale: 'Menyediakan energi glukosa penuh untuk sesi latihan volume tinggi pertama hari itu (IOC, 2021).'
      },
      {
        id: 'sched-phvol-2',
        time: '09:30',
        title: 'Intra/Post Session 1 Recovery Shake',
        desc: 'Minuman karbohidrat glukosa polimer (40g) + BCAA/EAA 10g + 400ml air kelapa elektrolit.',
        category: 'hydration',
        dotColor: '#0284C7',
        scientificRationale: 'Menghentikan katabolisme otot segera setelah sesi 1 dan memulai resintesis glikogen hepar.'
      },
      {
        id: 'sched-phvol-3',
        time: '12:30',
        title: 'Makan Siang Utama: Recovery Power Bowl',
        desc: 'Nasi merah pulen (250g) + ikan salmon bakar / kembung (150g) + edamame + sup tahu wortel (Target: 45g Protein, 100g Karbohidrat).',
        category: 'nutrition',
        dotColor: '#D97706',
        scientificRationale: 'Kombinasi asam lemak Omega-3 dan protein murni meredakan sitokin pro-inflamasi IL-6.'
      },
      {
        id: 'sched-phvol-4',
        time: '15:30',
        title: 'Snack Pre-Session 2 Smoothie Tart Cherry',
        desc: 'Smoothie whey protein isolate 25g + jus tart cherry murni (200ml) + 1 buah pisang ambon (Target: 28g Protein, Antioksidan).',
        category: 'snack',
        dotColor: '#7C3AED',
        scientificRationale: 'Tart cherry antosianin melindungi sarkolema dari kerusakan mekanis sesi latihan kedua.'
      },
      {
        id: 'sched-phvol-5',
        time: '18:30',
        title: 'Makan Malam Anabolik Daging Merah & Seng',
        desc: 'Steak daging sapi tenderloin (180g) + kentang tumbuk + tumis brokoli wortel minyak zaitun (Target: 44g Protein).',
        category: 'nutrition',
        dotColor: '#059669',
        scientificRationale: 'Zat besi heme dan seng mendukung resintesis mioglobin dan enzim respirasi seluler.'
      },
      {
        id: 'sched-phvol-6',
        time: '21:30',
        title: 'Susu Kasein + Kurkumin Madu Hangat',
        desc: 'Susu kasein murni 250ml + seduhan ekstrak kurkumin temulawak hangat madu + suplemen Omega-3 (Target: Anti-DOMS nokturnal).',
        category: 'rest',
        dotColor: '#475569',
        scientificRationale: 'Kurkuminoid menekan enzim COX-2 dan menurunkan marker Creatine Kinase selama regenerasi tidur malam.'
      }
    ],
    contraindications: [
      {
        id: 'contra-phvol-1',
        food: 'Asupan Energi Tidak Memadai (Defisit Energi Relatif / RED-S)',
        risk: 'Kritis (Kontraindikasi Mutlak)',
        reason: 'Memicu gangguan fungsi fisiologis menyeluruh: penurunan laju metabolisme, gangguan imunitas, atrofi otot, dan risiko fraktur stres tulang.',
        forbiddenItems: ['Membatasi asupan kalori <2500 kkal saat volume latihan harian >3 jam', 'Melewatkan pengisian karbohidrat pasca-latihan'],
        citation: 'IOC Consensus Statement on Relative Energy Deficiency in Sport (RED-S)'
      },
      {
        id: 'contra-phvol-2',
        food: 'Makanan Sulit Cerna / Lemak Trans Jelantah Sebelum Sesi Latihan',
        risk: 'Tinggi (Hindari)',
        reason: 'Mengalihkan aliran darah ke saluran cerna (splanchnic steal syndrome), memicu kram diafragma dan kelesuan fisik.',
        forbiddenItems: ['Gorengan minyak jelantah, makanan santan kental pekat sebelum latihan'],
        citation: 'Journal of Sports Sciences on Gastrointestinal Symptoms in Athletes'
      },
      {
        id: 'contra-phvol-3',
        food: 'Konsumsi Alkohol Pasca-Latihan',
        risk: 'Tinggi (Kontraindikasi Mutlak)',
        reason: 'Menghambat rehidrasi cairan seluler, memperpanjang inflamasi DOMS, dan menghalangi pemulihan glikogen intramuskular.',
        forbiddenItems: ['Minuman beralkohol pasca-sesi volume tinggi'],
        citation: 'Sports Medicine Review on Alcohol and Athletic Recovery'
      }
    ]
  }
};

// =========================================================================
// BACKWARD COMPATIBILITY ALIASES FOR LEGACY CONDITION IDS
// =========================================================================
recoveryProfiles['post-surgery'] = recoveryProfiles['post_op_digestive'];
recoveryProfiles['rehab'] = recoveryProfiles['post_op_orthopedic'];
recoveryProfiles['gym'] = recoveryProfiles['gym_hypertrophy'];

// Summary of 12 Taxonomies for Quick Lookup & Select Dropdowns
const recoveryTaxonomyRegistry = [
  // 7 Medical Post-Op
  { id: 'post_op_digestive', group: 'Pasca-Operasi (Medis)', groupKey: 'medical', label: '1. Bedah Saluran Cerna', title: 'Saluran Cerna (Digestif)', icon: 'utensils', badge: 'ESPEN Surgical', apis: ['USDA', 'FatSecret'] },
  { id: 'post_op_oncology', group: 'Pasca-Operasi (Medis)', groupKey: 'medical', label: '2. Kanker (Onkologi)', title: 'Kanker (Onkologi)', icon: 'shield-alert', badge: 'Immunonutrition', apis: ['USDA', 'FatSecret'] },
  { id: 'post_op_burns', group: 'Pasca-Operasi (Medis)', groupKey: 'medical', label: '3. Luka Bakar & Rekonstruksi', title: 'Luka Bakar & Rekonstruksi', icon: 'flame', badge: 'Hypermetabolic', apis: ['USDA', 'FatSecret'] },
  { id: 'post_op_bariatric', group: 'Pasca-Operasi (Medis)', groupKey: 'medical', label: '4. Bedah Bariatrik', title: 'Bedah Bariatrik & Metabolik', icon: 'scale', badge: 'ASMBS Porsi Mikro', apis: ['Open Food Facts', 'FatSecret', 'USDA'] },
  { id: 'post_op_orthopedic', group: 'Pasca-Operasi (Medis)', groupKey: 'medical', label: '5. Ortopedi & Trauma', title: 'Ortopedi & Trauma', icon: 'bone', badge: 'AAOS Osteogenesis', apis: ['USDA', 'FatSecret'] },
  { id: 'post_op_cardio', group: 'Pasca-Operasi (Medis)', groupKey: 'medical', label: '6. Kardiovaskular', title: 'Kardiovaskular & Sternotomi', icon: 'activity', badge: 'AHA Jantung Sehat', apis: ['USDA', 'FatSecret'] },
  { id: 'post_op_geriatric', group: 'Pasca-Operasi (Medis)', groupKey: 'medical', label: '7. Geriatri Pasca-Operasi', title: 'Geriatri Pasca-Operasi', icon: 'user-check', badge: 'Anti-Sarkopenia', apis: ['Open Food Facts', 'FatSecret'] },
  
  // 5 Gym & Fitness
  { id: 'gym_hypertrophy', group: 'Gym & Fitness', groupKey: 'fitness', label: '8. Bulking & Hipertrofi', title: 'Bulking & Hipertrofi Myofibril', icon: 'dumbbell', badge: 'ISSN Hypertrophy', apis: ['USDA', 'FatSecret'] },
  { id: 'gym_powerlifting', group: 'Gym & Fitness', groupKey: 'fitness', label: '9. Powerlifting & Strength', title: 'Powerlifting & Strength', icon: 'shield', badge: 'NSCA Strength', apis: ['USDA', 'FatSecret'] },
  { id: 'gym_endurance', group: 'Gym & Fitness', groupKey: 'fitness', label: '10. CrossFit / Endurance', title: 'CrossFit & High Endurance', icon: 'activity', badge: 'ACSM Endurance', apis: ['Edamam/Nutritionix', 'FatSecret', 'USDA'] },
  { id: 'gym_recomp', group: 'Gym & Fitness', groupKey: 'fitness', label: '11. Body Recomposition', title: 'Body Recomposition', icon: 'target', badge: 'ISSN Recomp', apis: ['FatSecret', 'Open Food Facts'] },
  { id: 'gym_high_volume', group: 'Gym & Fitness', groupKey: 'fitness', label: '12. Atlet High-Volume', title: 'Atlet High-Volume', icon: 'zap', badge: 'IOC Anti-DOMS', apis: ['USDA', 'FatSecret', 'Edamam'] }
];

console.log('Total Profiles Defined:', Object.keys(recoveryProfiles).length);
console.log('Taxonomy Registry Count:', recoveryTaxonomyRegistry.length);

module.exports = { recoveryProfiles, recoveryTaxonomyRegistry };
