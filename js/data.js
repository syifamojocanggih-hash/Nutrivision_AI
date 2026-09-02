// NutriVision AI — Comprehensive Food Database & Recovery Clinical Rules
// Basis Data Gizi Pangan Lokal Indonesia & Pedoman Pemulihan Pasca-Operasi / Fisioterapi / Gym

const NUTRIVISION_DATA = {
  // Profil Pemulihan Bawaan
  recoveryProfiles: {
    'post-surgery': {
      id: 'post-surgery',
      title: 'Pasca-Operasi (Penyembuhan Luka & Jaringan)',
      defaultPhase: 'Minggu ke-2 (Fase Proliferasi)',
      recommendedTargets: {
        calories: 1850,
        protein: 75,
        carbs: 240,
        fat: 55
      },
      proteinMultiplier: 1.5, // 1.5g per kg BB
      description: 'Fokus pada sintesis kolagen, pemulihan integritas jaringan, dan pencegahan infeksi serta sembelit.',
      guidelines: [
        'Tingkatkan asupan protein berkualitas tinggi (asam amino esensial) untuk percepat penutupan luka.',
        'Cukupi asupan vitamin C (buah jeruk, jambu) dan Zinc untuk sintesis kolagen.',
        'Pilih serat larut & hidrasi cukup untuk mencegah konstipasi akibat anestesi/analgetik.'
      ]
    },
    'rehab': {
      id: 'rehab',
      title: 'Rehabilitasi Medis / Fisioterapi (Cedera & Sendi)',
      defaultPhase: 'Fase Remodeling (Bulan ke-1)',
      recommendedTargets: {
        calories: 2000,
        protein: 80,
        carbs: 260,
        fat: 60
      },
      proteinMultiplier: 1.6,
      description: 'Menjaga massa otot di sekitar sendi yang cedera serta memberi energi optimal untuk sesi fisioterapi.',
      guidelines: [
        'Konsumsi protein terdistribusi merata setiap 3-4 jam untuk memicu protein synthesis otot.',
        'Penuhi kalsium dan vitamin D jika pemulihan melibatkan tulang atau fraktur.',
        'Konsumsi anti-inflamasi alami seperti kurkumin dan omega-3.'
      ]
    },
    'gym': {
      id: 'gym',
      title: 'Gym Recovery (Hipertrofi & Pemulihan Otot)',
      defaultPhase: 'Fase Pemulihan Intensif',
      recommendedTargets: {
        calories: 2300,
        protein: 110,
        carbs: 290,
        fat: 65
      },
      proteinMultiplier: 1.8,
      description: 'Pemulihan glikogen otot dan perbaikan mikrorobekan serat otot setelah latihan beban berat.',
      guidelines: [
        'Kombinasikan protein cepat serap dan karbohidrat kompleks pasca-latihan.',
        'Pastikan elektrolit (Kalium, Natrium, Magnesium) tercukupi untuk mencegah kram.',
        'Kualitas tidur 7-8 jam sangat esensial untuk hormon pertumbuhan.'
      ]
    }
  },

  // Basis Data Bahan Makanan & Minuman Pemulihan Klinis (TKPI Kemenkes RI & Acuan Harga Bappenas / Bapanas RI)
  indonesianFoodDatabase: [
    {
      id: 'ikan-gabus-kukus',
      name: 'Ikan Gabus Tim Albumin',
      category: 'protein-animal',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Kaya Albumin untuk regenerasi sel & luka bedah',
      clinicalIndication: 'Pasca-Operasi & Penutupan Luka',
      bappenasRef: 'Rp 65.000/kg Bapanas',
      defaultPortionGrams: 120,
      calsRange: [110, 130],
      proteinRange: [26, 30],
      carbsRange: [0, 1],
      fatRange: [1.2, 2.2],
      color: '#9EA76B',
      texture: 'soft',
      price: 'Rp 7.800'
    },
    {
      id: 'dada-ayam-panggang',
      name: 'Dada Ayam Fillet Kukus/Panggang',
      category: 'protein-animal',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tinggi Leusin & Asam Amino Esensial bebas lemak',
      clinicalIndication: 'Sintesis Protein & Hipertrofi',
      bappenasRef: 'Rp 38.500/kg Bapanas',
      defaultPortionGrams: 120,
      calsRange: [180, 210],
      proteinRange: [28, 33],
      carbsRange: [0, 1],
      fatRange: [3.5, 5.0],
      color: '#9EA76B',
      texture: 'regular',
      price: 'Rp 4.800'
    },
    {
      id: 'telur-rebus',
      name: 'Telur Ayam Ras / Omega-3 Rebus',
      category: 'protein-animal',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Nilai Biologis Protein 100 + Kolin & Kolagen',
      clinicalIndication: 'Pemulihan Harian & Pasca-Latihan',
      bappenasRef: 'Rp 29.000/kg (~16 btr) Bapanas',
      defaultPortionGrams: 60,
      calsRange: [75, 85],
      proteinRange: [6.5, 7.5],
      carbsRange: [0.5, 0.8],
      fatRange: [5.0, 5.5],
      color: '#F59E0B',
      texture: 'soft',
      price: 'Rp 2.000'
    },
    {
      id: 'ikan-kembung-bakar',
      name: 'Ikan Kembung Segar Kukus/Bakar',
      category: 'protein-animal',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tinggi Asam Lemak Omega-3 (EPA/DHA) Anti-Inflamasi',
      clinicalIndication: 'Fisioterapi & Kesehatan Sendi',
      bappenasRef: 'Rp 38.000/kg Bapanas',
      defaultPortionGrams: 120,
      calsRange: [150, 180],
      proteinRange: [22, 26],
      carbsRange: [0, 1],
      fatRange: [6.0, 8.5],
      color: '#06B6D4',
      texture: 'regular',
      price: 'Rp 4.500'
    },
    {
      id: 'daging-sapi-murni',
      name: 'Daging Sapi Has Tanpa Lemak',
      category: 'protein-animal',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tinggi Zat Besi Heme, Zinc & Kolagen Otot',
      clinicalIndication: 'Cegah Anemia & Imunitas',
      bappenasRef: 'Rp 135.000/kg Bapanas',
      defaultPortionGrams: 100,
      calsRange: [200, 230],
      proteinRange: [24, 28],
      carbsRange: [0, 0.5],
      fatRange: [7.0, 10.0],
      color: '#EF4444',
      texture: 'regular',
      price: 'Rp 13.500'
    },
    {
      id: 'tempe-bacem-kukus',
      name: 'Tempe Kedelai Murni Kukus',
      category: 'plant-veg',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1546069901-d77c3a0dfec2?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Fermentasi Probiotik Alami, Isoflavon & Serat',
      clinicalIndication: 'Kesehatan Mikrobioma & Protein Nabati',
      bappenasRef: 'Rp 13.000/kg Kedelai Bapanas',
      defaultPortionGrams: 100,
      calsRange: [150, 175],
      proteinRange: [16, 19],
      carbsRange: [9, 13],
      fatRange: [5.0, 7.5],
      color: '#10B981',
      texture: 'regular',
      price: 'Rp 1.500'
    },
    {
      id: 'tahu-putih-kukus',
      name: 'Tahu Putih Sutra Kukus',
      category: 'plant-veg',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Protein Lembut Ramah Lambung & Tinggi Kalsium',
      clinicalIndication: 'Diet Lunak & Pasca-Bedah',
      bappenasRef: 'Rp 11.000/kg Kedelai Bapanas',
      defaultPortionGrams: 100,
      calsRange: [75, 90],
      proteinRange: [8, 11],
      carbsRange: [1.5, 3.0],
      fatRange: [4.0, 5.0],
      color: '#10B981',
      texture: 'soft',
      price: 'Rp 1.200'
    },
    {
      id: 'sayur-bayam-bening',
      name: 'Sayur Bening Bayam & Labu',
      category: 'plant-veg',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Kaya Asam Folat, Lutein & Zat Besi Pembentuk Sel',
      clinicalIndication: 'Anti-Oksidan & Detoksifikasi',
      bappenasRef: 'Rp 3.500/ikat Pasar Eceran',
      defaultPortionGrams: 100,
      calsRange: [35, 50],
      proteinRange: [2.5, 3.5],
      carbsRange: [6, 8],
      fatRange: [0.3, 0.6],
      color: '#10B981',
      texture: 'soft',
      price: 'Rp 1.800'
    },
    {
      id: 'brokoli-wortel-kukus',
      name: 'Brokoli & Wortel Rebus',
      category: 'plant-veg',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Sulforaphane, Beta-Karoten & Vitamin A Epitel',
      clinicalIndication: 'Penyembuhan Jaringan Epitel',
      bappenasRef: 'Rp 18.000/kg Bapanas',
      defaultPortionGrams: 120,
      calsRange: [50, 65],
      proteinRange: [3.0, 4.2],
      carbsRange: [9, 13],
      fatRange: [0.4, 0.8],
      color: '#10B981',
      texture: 'soft',
      price: 'Rp 2.500'
    },
    {
      id: 'tumis-kangkung',
      name: 'Tumis Kangkung Bawang Putih',
      category: 'plant-veg',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Mineral Kalium & Allicin Alami Anti-Mikroba',
      clinicalIndication: 'Pemulihan Metabolisme Tubuh',
      bappenasRef: 'Rp 3.500/ikat Pasar Eceran',
      defaultPortionGrams: 90,
      calsRange: [45, 60],
      proteinRange: [2.2, 3.2],
      carbsRange: [4, 6],
      fatRange: [2.0, 3.0],
      color: '#10B981',
      texture: 'regular',
      price: 'Rp 2.000'
    },
    {
      id: 'nasi-putih',
      name: 'Nasi Putih Beras Medium',
      category: 'carbs',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Sumber Energi Glukosa Cepat untuk Pemulihan',
      clinicalIndication: 'Pengisian Glikogen & Energi Harian',
      bappenasRef: 'Rp 14.500/kg Beras Medium Bapanas',
      defaultPortionGrams: 150,
      calsRange: [195, 215],
      proteinRange: [3.5, 4.5],
      carbsRange: [42, 48],
      fatRange: [0.3, 0.6],
      color: '#9EA76B',
      texture: 'regular',
      price: 'Rp 2.200'
    },
    {
      id: 'bubur-ayam',
      name: 'Bubur Beras Sutra Halus',
      category: 'carbs',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tekstur Lunak Halus Khusus Disfagia & Pasca-Bedah',
      clinicalIndication: 'Diet Lunak / Sulit Mengunyah',
      bappenasRef: 'Rp 14.500/kg Beras Medium Bapanas',
      defaultPortionGrams: 200,
      calsRange: [140, 165],
      proteinRange: [3.0, 4.0],
      carbsRange: [30, 36],
      fatRange: [0.5, 1.0],
      color: '#9EA76B',
      texture: 'soft',
      price: 'Rp 2.500'
    },
    {
      id: 'kentang-ubi-kukus',
      name: 'Kentang & Ubi Jalar Kukus',
      category: 'carbs',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Karbohidrat Kompleks Kaya Kalium & Serat Pektin',
      clinicalIndication: 'Pemulihan Elektrolit & Bebas Gluten',
      bappenasRef: 'Rp 18.000/kg Pasar Eceran',
      defaultPortionGrams: 150,
      calsRange: [130, 155],
      proteinRange: [2.8, 3.8],
      carbsRange: [30, 35],
      fatRange: [0.2, 0.5],
      color: '#F59E0B',
      texture: 'soft',
      price: 'Rp 3.000'
    },
    {
      id: 'jus-jeruk-murni',
      name: 'Jus Jeruk Peras Murni',
      category: 'drinks-fruits',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tinggi Vitamin C untuk Pembentukan Kolagen Luka',
      clinicalIndication: 'Sintesis Kolagen & Anti-Oksidan',
      bappenasRef: 'Rp 24.000/kg Jeruk Bapanas',
      defaultPortionGrams: 250,
      calsRange: [105, 125],
      proteinRange: [1.5, 2.5],
      carbsRange: [24, 28],
      fatRange: [0.2, 0.5],
      color: '#F59E0B',
      texture: 'liquid-soft',
      price: 'Rp 3.500'
    },
    {
      id: 'jus-jambu-biji',
      name: 'Jus Jambu Biji Merah Murni',
      category: 'drinks-fruits',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Super-Antioksidan, Kaya Likopen & Vitamin C',
      clinicalIndication: 'Peningkat Imun & Trombosit',
      bappenasRef: 'Rp 16.000/kg Pasar Eceran',
      defaultPortionGrams: 250,
      calsRange: [110, 135],
      proteinRange: [2.0, 3.0],
      carbsRange: [26, 30],
      fatRange: [0.4, 0.8],
      color: '#EF4444',
      texture: 'liquid-soft',
      price: 'Rp 3.000'
    },
    {
      id: 'air-kelapa-murni',
      name: 'Air Kelapa Hijau Murni',
      category: 'drinks-fruits',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Isotonik Alami Kaya Kalium, Magnesium & Elektrolit',
      clinicalIndication: 'Rehidrasi Pasca-Operasi & Fisioterapi',
      bappenasRef: 'Rp 10.000/butir Kelapa Muda',
      defaultPortionGrams: 250,
      calsRange: [45, 60],
      proteinRange: [1.0, 1.8],
      carbsRange: [10, 13],
      fatRange: [0.2, 0.5],
      color: '#06B6D4',
      texture: 'liquid-soft',
      price: 'Rp 5.000'
    },
    {
      id: 'pisang-ambon-segar',
      name: 'Pisang Ambon Matang',
      category: 'drinks-fruits',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tinggi Kalium Otot, Vitamin B6 & Serat Pektin Halus',
      clinicalIndication: 'Relaksasi Otot & Cegah Konstipasi',
      bappenasRef: 'Rp 22.000/sisir (1.5kg)',
      defaultPortionGrams: 120,
      calsRange: [95, 110],
      proteinRange: [1.2, 1.8],
      carbsRange: [22, 26],
      fatRange: [0.2, 0.4],
      color: '#F59E0B',
      texture: 'soft',
      price: 'Rp 2.000'
    }
  ],

  // Preset Makanan Nyata untuk Demo Scan Computer Vision (Segmentasi Piring Interaktif)
  presetScans: [
    {
      id: 'preset-standard-nasi-ayam',
      title: '🍛 Nasi Ayam Panggang & Sayur (Menu Harian Pasca-Operasi)',
      plateColor: '#0F172A',
      confidenceOverall: 88,
      imagePlaceholderSvg: 'plate-ayam',
      segments: [
        {
          id: 'seg-1',
          name: 'Nasi Putih',
          foodId: 'nasi-putih',
          portionGrams: 175,
          confidence: 94,
          color: '#9EA76B',
          cals: [220, 250],
          protein: [4.0, 5.0],
          carbs: [48, 55],
          fat: [0.4, 0.8],
          polygon: [[25, 25], [75, 15], [75, 75], [20, 70]]
        },
        {
          id: 'seg-2',
          name: 'Dada Ayam Panggang',
          foodId: 'dada-ayam-panggang',
          portionGrams: 125,
          confidence: 91,
          color: '#9EA76B',
          cals: [190, 220],
          protein: [28, 33],
          carbs: [0, 1.5],
          fat: [3.8, 5.2],
          polygon: [[75, 15], [130, 35], [130, 95], [75, 75]]
        },
        {
          id: 'seg-3',
          name: 'Tumis Kangkung',
          foodId: 'tumis-kangkung',
          portionGrams: 85,
          confidence: 82,
          color: '#10B981',
          cals: [45, 60],
          protein: [2.5, 3.5],
          carbs: [4.5, 6.5],
          fat: [2.2, 3.2],
          polygon: [[75, 75], [130, 95], [85, 138], [50, 110]]
        },
        {
          id: 'seg-4',
          name: 'Telur Rebus (1/2 butir)',
          foodId: 'telur-rebus',
          portionGrams: 30,
          confidence: 76,
          color: '#F59E0B',
          cals: [38, 45],
          protein: [3.3, 3.8],
          carbs: [0.3, 0.5],
          fat: [2.6, 3.0],
          polygon: [[20, 70], [75, 75], [50, 110], [15, 100]]
        }
      ]
    },
    {
      id: 'preset-soft-bubur-gabus',
      title: '🥣 Bubur Ikan Gabus & Telur Tim (Khusus Sulit Menelan / Pasca-Bedah)',
      plateColor: '#0F172A',
      confidenceOverall: 92,
      imagePlaceholderSvg: 'plate-bubur',
      segments: [
        {
          id: 'seg-1',
          name: 'Bubur Beras Lembut',
          foodId: 'bubur-ayam',
          portionGrams: 220,
          confidence: 96,
          color: '#06B6D4',
          cals: [150, 175],
          protein: [2.8, 3.8],
          carbs: [33, 38],
          fat: [0.6, 1.2],
          polygon: [[20, 20], [80, 20], [80, 80], [20, 80]]
        },
        {
          id: 'seg-2',
          name: 'Ikan Gabus Kukus (Tinggi Albumin)',
          foodId: 'ikan-gabus-kukus',
          portionGrams: 110,
          confidence: 89,
          color: '#9EA76B',
          cals: [105, 125],
          protein: [24, 28],
          carbs: [0, 0.6],
          fat: [1.2, 2.2],
          polygon: [[80, 20], [135, 40], [130, 90], [80, 80]]
        },
        {
          id: 'seg-3',
          name: 'Telur Kukus Sutra (Tim)',
          foodId: 'telur-kukus-halus',
          portionGrams: 90,
          confidence: 90,
          color: '#F59E0B',
          cals: [70, 85],
          protein: [6.0, 7.5],
          carbs: [1.2, 2.0],
          fat: [4.0, 5.0],
          polygon: [[20, 80], [80, 80], [75, 135], [25, 130]]
        },
        {
          id: 'seg-4',
          name: 'Sup Krim Labu Kuning',
          foodId: 'sup-krim-wortel',
          portionGrams: 100,
          confidence: 84,
          color: '#10B981',
          cals: [55, 70],
          protein: [1.5, 2.2],
          carbs: [10, 13],
          fat: [1.5, 2.2],
          polygon: [[80, 80], [130, 90], [125, 135], [75, 135]]
        }
      ]
    },
    {
      id: 'preset-budget-tempe-telur',
      title: '🍳 Nasi Telur Dadar + Tempe Bacem + Sayur Bening (Opsi Hemat / Low-Budget)',
      plateColor: '#0F172A',
      confidenceOverall: 85,
      imagePlaceholderSvg: 'plate-hemat',
      segments: [
        {
          id: 'seg-1',
          name: 'Nasi Putih',
          foodId: 'nasi-putih',
          portionGrams: 160,
          confidence: 93,
          color: '#9EA76B',
          cals: [200, 230],
          protein: [3.8, 4.6],
          carbs: [44, 50],
          fat: [0.4, 0.7],
          polygon: [[25, 25], [75, 20], [75, 75], [20, 75]]
        },
        {
          id: 'seg-2',
          name: 'Telur Ayam Dadar Padat',
          foodId: 'telur-rebus',
          portionGrams: 65,
          confidence: 87,
          color: '#9EA76B',
          cals: [110, 130],
          protein: [8.0, 9.5],
          carbs: [1.0, 1.8],
          fat: [8.5, 10.0],
          polygon: [[75, 20], [130, 30], [130, 85], [75, 75]]
        },
        {
          id: 'seg-3',
          name: 'Tempe Bacem Kukus',
          foodId: 'tempe-bacem-kukus',
          portionGrams: 90,
          confidence: 84,
          color: '#F59E0B',
          cals: [145, 170],
          protein: [15.5, 18.5],
          carbs: [10, 13],
          fat: [5.5, 7.5],
          polygon: [[20, 75], [75, 75], [60, 135], [20, 120]]
        },
        {
          id: 'seg-4',
          name: 'Sayur Bening Bayam',
          foodId: 'sayur-bening-bayam',
          portionGrams: 100,
          confidence: 81,
          color: '#10B981',
          cals: [30, 42],
          protein: [1.8, 2.5],
          carbs: [5.0, 7.0],
          fat: [0.3, 0.6],
          polygon: [[75, 75], [130, 85], [105, 140], [60, 135]]
        }
      ]
    },
    {
      id: 'preset-salmon-quinoa',
      title: '🥗 Fillet Salmon Panggang & Quinoa Bowl (Gym / High-End Recovery)',
      plateColor: '#0F172A',
      confidenceOverall: 91,
      imagePlaceholderSvg: 'plate-salmon',
      segments: [
        {
          id: 'seg-1',
          name: 'Fillet Salmon Panggang',
          foodId: 'salmon-quinoa',
          portionGrams: 140,
          confidence: 93,
          color: '#9EA76B',
          cals: [290, 330],
          protein: [28, 33],
          carbs: [0, 1.0],
          fat: [16, 20],
          polygon: [[20, 20], [80, 20], [75, 80], [20, 75]]
        },
        {
          id: 'seg-2',
          name: 'Quinoa & Edamame',
          foodId: 'quinoa-bowl',
          portionGrams: 120,
          confidence: 89,
          color: '#10B981',
          cals: [160, 190],
          protein: [7.5, 9.5],
          carbs: [26, 32],
          fat: [3.0, 4.5],
          polygon: [[80, 20], [135, 30], [130, 90], [75, 80]]
        },
        {
          id: 'seg-3',
          name: 'Alpukat Potong',
          foodId: 'alpukat-segar',
          portionGrams: 60,
          confidence: 88,
          color: '#06B6D4',
          cals: [95, 115],
          protein: [1.2, 1.8],
          carbs: [4.0, 6.0],
          fat: [9.0, 11.5],
          polygon: [[20, 75], [75, 80], [110, 135], [30, 135]]
        }
      ]
    }
  ],

  // Dual Mode Recovery Meal Planner (Standar vs Hemat)
  mealPlans: {
    standar: [
      {
        name: 'Dada Ayam Panggang Herbal + Brokoli Kukus + Nasi Merah',
        macro: '34 - 38g Protein · 420 - 460 kkal',
        price: 'Rp 28.000',
        badge: 'Tinggi Protein',
        suitableFor: 'Makan Siang / Pemulihan Luka'
      },
      {
        name: 'Fillet Ikan Gabus Kukus + Sayur Bening Bayam + Nasi Putih',
        macro: '28 - 32g Protein · 380 - 410 kkal',
        price: 'Rp 24.000',
        badge: 'Cepat Sembuh (Albumin)',
        suitableFor: 'Pasca-Bedah'
      },
      {
        name: 'Salmon Panggang Saus Lemon + Sup Krim Wortel Halus',
        macro: '30 - 34g Protein · 440 - 480 kkal',
        price: 'Rp 45.000',
        badge: 'Anti-Inflamasi',
        suitableFor: 'Makan Malam'
      }
    ],
    hemat: [
      {
        name: 'Telur Rebus (2 butir) + Tempe Bacem Kukus + Nasi Putih',
        macro: '26 - 30g Protein · 390 - 430 kkal',
        price: 'Rp 8.500',
        badge: 'Hemat & Padat Gizi',
        suitableFor: 'Makan Siang Murah'
      },
      {
        name: 'Ikan Kembung Bakar Kunyit + Sayur Bening Oyong + Nasi',
        macro: '24 - 28g Protein · 360 - 400 kkal',
        price: 'Rp 11.000',
        badge: 'Kaya Omega-3 Hemat',
        suitableFor: 'Pemulihan Harian'
      },
      {
        name: 'Tahu Putih Kukus + Telur Dadar Daun Bawang + Tumis Kangkung',
        macro: '20 - 24g Protein · 330 - 360 kkal',
        price: 'Rp 7.500',
        badge: 'Ramah Kantong',
        suitableFor: 'Makan Malam Ringan'
      }
    ]
  },

  // Symptom-Aware Rules & Menu Recommendations
  symptomRules: {
    'mual': {
      title: 'Gejala: Mual / Mual Pasca-Anestesi',
      text: 'Hindari makanan berminyak pekat & berbau menyengat. Disarankan porsi kecil tapi sering (small frequent meals), suhu suam-kuku, dan jahe hangat.',
      recommendedFoods: ['Sup Bening Ayam Jahe', 'Bubur Beras Halus', 'Biskuit Gandum Kering', 'Telur Rebus Tanpa Minyak']
    },
    'sulit-menelan': {
      title: 'Gejala: Sulit Menelan (Disfagia / Pasca-Intubasi)',
      text: 'Sistem menyaring menu menjadi tekstur lembut (puree/soft mash). Hindari bahan keras, remah kasar, atau potongan liat.',
      recommendedFoods: ['Telur Kukus Sutra (Tim)', 'Bubur Ikan Gabus Halus', 'Sup Krim Labu Kuning', 'Puding Susu Kedelai']
    },
    'konstipasi': {
      title: 'Gejala: Konstipasi / Sembelit Pasca-Operasi',
      text: 'Tingkatkan serat larut lembut (labu siam, bayam) dan air putih hangat minimal 2-2.5 liter/hari untuk melancarkan peristaltik usus.',
      recommendedFoods: ['Sayur Bening Labu Siam & Bayam', 'Pepaya Matang', 'Oatmeal Lembut', 'Tempe Kukus']
    },
    'nafsu-rendah': {
      title: 'Gejala: Nafsu Makan Menurun',
      text: 'Fokus pada makanan padat gizi (high nutrient density) dalam volume kecil agar target protein harian tetap tercapai tanpa terasa begah.',
      recommendedFoods: ['Smoothie Pisang + Susu Kedelai', 'Sup Kaldu Tulang Sapi/Ayam', 'Telur Kukus Keju', 'Ikan Gabus Suwir']
    }
  },

  // Postingan Komunitas Pemulihan Awal
  initialCommunityPosts: [
    {
      id: 'comm-1',
      author: 'Sinta Dewi',
      initials: 'SD',
      category: 'post-surgery',
      categoryLabel: 'Pasca-Bedah Digestif · Mg 2',
      timeAgo: '2 jam yang lalu',
      verified: true,
      text: 'Setelah operasi usus buntu kemarin, minggu ke-2 ini dokter minta fokus protein. Trikku: bikin telur kukus tim ala Jepang ditambah tahu sutra. Teksturnya super lembut, nggak bikin kembung, dan dapet 16g protein per porsi!',
      likes: 18,
      comments: [
        { author: 'Budi H.', text: 'Boleh dicoba nih resepnya, kebetulan lagi fase pemulihan juga!' }
      ]
    },
    {
      id: 'comm-2',
      author: 'Andi Pratama',
      initials: 'AP',
      category: 'gym',
      categoryLabel: 'Gym Recovery & Hipertrofi',
      timeAgo: '5 jam yang lalu',
      verified: true,
      text: 'Buat yang cari opsi protein hemat pasca leg day berat: ikan kembung bakar (Rp 7rb) proteinnya tembus 20g + omega 3 alami. Jauh lebih hemat dibanding suplemen whey impor!',
      likes: 34,
      comments: [
        { author: 'Rian M.', text: 'Setuju banget, ikan kembung kandungan gizinya juara.' }
      ]
    },
    {
      id: 'comm-3',
      author: 'dr. Hendra (Sp.KFR / Nakes)',
      initials: 'DH',
      category: 'rehab',
      categoryLabel: 'Fisioterapi & Rehabilitasi ACL',
      timeAgo: '1 hari yang lalu',
      verified: true,
      text: 'Catatan penting untuk pasien pasca-rekonstruksi ACL: jangan kurangi kalori terlalu ekstrem karena otot paha (quadriceps) butuh nutrisi agar tidak atrofi selama latihan beban mandiri.',
      likes: 42,
      comments: []
    }
  ]
};
