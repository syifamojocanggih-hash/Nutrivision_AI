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

  // Basis Data Bahan Makanan & Minuman Pemulihan Klinis (TKPI Kemenkes RI & Acuan Bappenas / Bapanas RI 2024)
  indonesianFoodDatabase: [
    {
      id: 'ikan-gabus-kukus',
      name: 'Ikan Gabus Tim Albumin',
      tkpiCode: 'TKPI-IK012',
      category: 'protein-animal',
      isPopular: true,
      popularRank: 'Terlaris #1',
      salesCount: '2.8k+',
      popularSearchLabel: 'Pencarian Populer',
      image: 'images/plate_bubur_gabus.jpg',
      subtitle: 'Kaya Albumin 2.17g untuk granulasi luka & regenerasi sel bedah',
      clinicalIndication: 'Pasca-Operasi',
      bappenasRef: 'Bapanas: Rp 65.000/kg',
      defaultPortionGrams: 120,
      calories: 124,
      protein: 27.6,
      carbs: 0.2,
      fat: 1.4,
      proteinRange: [26, 30],
      calsRange: [115, 130],
      color: '#9EA76B',
      texture: 'soft',
      price: 'Rp 7.800'
    },
    {
      id: 'dada-ayam-panggang',
      name: 'Dada Ayam Fillet Kukus/Panggang',
      tkpiCode: 'TKPI-DG005',
      category: 'protein-animal',
      isPopular: true,
      popularRank: 'Terlaris #3',
      salesCount: '2.5k+',
      popularSearchLabel: 'Pencarian Populer',
      image: 'images/plate_nasi_ayam.jpg',
      subtitle: 'Tinggi Leusin 2.4g & Asam Amino Esensial bebas lemak jenuh',
      clinicalIndication: 'Regenerasi Otot',
      bappenasRef: 'Bapanas: Rp 38.500/kg',
      defaultPortionGrams: 120,
      calories: 165,
      protein: 31.2,
      carbs: 0.0,
      fat: 4.2,
      proteinRange: [29, 33],
      calsRange: [155, 175],
      color: '#9EA76B',
      texture: 'regular',
      price: 'Rp 4.800'
    },
    {
      id: 'telur-rebus',
      name: 'Telur Ayam Ras / Omega-3 Rebus',
      tkpiCode: 'TKPI-TL001',
      category: 'protein-animal',
      isPopular: true,
      popularRank: 'Terlaris #2',
      salesCount: '3.4k+',
      popularSearchLabel: 'Pencarian Populer',
      image: 'images/telur_rebus.jpg',
      subtitle: 'Nilai Biologis Protein 100 + Kolin 147mg & Kolagen Alami',
      clinicalIndication: 'Pemulihan Sel',
      bappenasRef: 'Bapanas: Rp 29.500/kg (~16 btr)',
      defaultPortionGrams: 60,
      calories: 78,
      protein: 7.2,
      carbs: 0.6,
      fat: 5.3,
      proteinRange: [6.5, 7.5],
      calsRange: [75, 85],
      color: '#F59E0B',
      texture: 'soft',
      price: 'Rp 2.000'
    },
    {
      id: 'ikan-kembung-bakar',
      name: 'Ikan Kembung Segar Kukus/Bakar',
      tkpiCode: 'TKPI-IK018',
      category: 'protein-animal',
      isPopular: true,
      popularRank: 'Terlaris #5',
      salesCount: '1.6k+',
      popularSearchLabel: 'Pencarian Populer',
      image: 'images/plate_pepes_kembung.jpg',
      subtitle: 'Kaya Omega-3 (EPA/DHA 2.6g) setara salmon untuk redakan inflamasi',
      clinicalIndication: 'Kesehatan Sendi',
      bappenasRef: 'Bapanas: Rp 38.000/kg',
      defaultPortionGrams: 120,
      calories: 168,
      protein: 24.5,
      carbs: 0.0,
      fat: 7.4,
      proteinRange: [22, 26],
      calsRange: [155, 175],
      color: '#9EA76B',
      texture: 'regular',
      price: 'Rp 4.500'
    },
    {
      id: 'daging-sapi-murni',
      name: 'Daging Sapi Has Tanpa Lemak',
      tkpiCode: 'TKPI-DG001',
      category: 'protein-animal',
      isPopular: true,
      salesCount: '1.2k+',
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tinggi Zat Besi Heme 2.8mg, Zinc & Kolagen Pembentuk Sel Darah',
      clinicalIndication: 'Cegah Anemia',
      bappenasRef: 'Bapanas: Rp 135.000/kg',
      defaultPortionGrams: 100,
      calories: 185,
      protein: 26.5,
      carbs: 0.0,
      fat: 8.8,
      proteinRange: [24, 28],
      calsRange: [175, 195],
      color: '#EF4444',
      texture: 'regular',
      price: 'Rp 13.500'
    },
    {
      id: 'tempe-bacem-kukus',
      name: 'Tempe Kedelai Murni Kukus',
      tkpiCode: 'TKPI-KB003',
      category: 'plant-veg',
      isPopular: true,
      popularRank: 'Terlaris #4',
      salesCount: '1.9k+',
      popularSearchLabel: 'Pencarian Populer',
      image: 'images/plate_pepes_kembung.jpg',
      subtitle: 'Fermentasi Rhizopus menghasilkan Prebiotik & Isoflavon 19g protein',
      clinicalIndication: 'Pencernaan',
      bappenasRef: 'Bapanas: Rp 18.000/kg',
      defaultPortionGrams: 100,
      calories: 195,
      protein: 19.2,
      carbs: 12.5,
      fat: 8.5,
      proteinRange: [17, 21],
      calsRange: [185, 205],
      color: '#9EA76B',
      texture: 'soft',
      price: 'Rp 2.500'
    },
    {
      id: 'tahu-putih-kukus',
      name: 'Tahu Putih Sutra Kukus',
      tkpiCode: 'TKPI-KB004',
      category: 'plant-veg',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Protein nabati bertekstur halus, sangat ramah lambung pasca-anestesi',
      clinicalIndication: 'Diet Disfagia',
      bappenasRef: 'Bapanas: Rp 12.000/pak',
      defaultPortionGrams: 100,
      calories: 80,
      protein: 8.5,
      carbs: 1.8,
      fat: 4.6,
      proteinRange: [7, 10],
      calsRange: [75, 90],
      color: '#9EA76B',
      texture: 'soft',
      price: 'Rp 1.500'
    },
    {
      id: 'sayur-bayam-bening',
      name: 'Sayur Bening Bayam & Jagung',
      tkpiCode: 'TKPI-SY007',
      category: 'plant-veg',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Kaya Zat Besi 3.5mg, Asam Folat & Vitamin K untuk pembekuan darah',
      clinicalIndication: 'Hemoglobin',
      bappenasRef: 'Bapanas: Rp 4.000/ikat',
      defaultPortionGrams: 150,
      calories: 36,
      protein: 3.2,
      carbs: 5.4,
      fat: 0.4,
      proteinRange: [2.5, 4.0],
      calsRange: [30, 45],
      color: '#9EA76B',
      texture: 'soft',
      price: 'Rp 2.000'
    },
    {
      id: 'brokoli-wortel-kukus',
      name: 'Brokoli & Wortel Rebus',
      tkpiCode: 'TKPI-SY012',
      category: 'plant-veg',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Sulforaphane & Beta-karoten menekan inflamasi stres oksidatif luka',
      clinicalIndication: 'Antioksidan',
      bappenasRef: 'Bapanas: Rp 28.000/kg',
      defaultPortionGrams: 120,
      calories: 42,
      protein: 2.8,
      carbs: 7.2,
      fat: 0.4,
      proteinRange: [2.0, 3.5],
      calsRange: [38, 50],
      color: '#9EA76B',
      texture: 'soft',
      price: 'Rp 3.500'
    },
    {
      id: 'tumis-kangkung',
      name: 'Tumis Kangkung Bawang Putih',
      tkpiCode: 'TKPI-SY015',
      category: 'plant-veg',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Serat larut air melancarkan peristaltik usus & cegah konstipasi',
      clinicalIndication: 'Cegah Konstipasi',
      bappenasRef: 'Bapanas: Rp 3.500/ikat',
      defaultPortionGrams: 120,
      calories: 58,
      protein: 3.0,
      carbs: 4.5,
      fat: 3.2,
      proteinRange: [2.5, 3.8],
      calsRange: [50, 70],
      color: '#9EA76B',
      texture: 'regular',
      price: 'Rp 2.500'
    },
    {
      id: 'nasi-putih',
      name: 'Nasi Putih Beras Medium',
      tkpiCode: 'TKPI-SR001',
      category: 'carbs',
      isPopular: true,
      salesCount: '2.2k+',
      popularSearchLabel: 'Pencarian Populer',
      image: 'images/plate_nasi_ayam.jpg',
      subtitle: 'Sumber energi primer glukosa untuk metabolisme sel & fisioterapi',
      clinicalIndication: 'Pemulihan Energi',
      bappenasRef: 'Bapanas: Rp 14.500/kg',
      defaultPortionGrams: 150,
      calories: 185,
      protein: 3.6,
      carbs: 41.5,
      fat: 0.4,
      proteinRange: [3.0, 4.2],
      calsRange: [175, 195],
      color: '#DDD4B0',
      texture: 'regular',
      price: 'Rp 2.200'
    },
    {
      id: 'bubur-ayam',
      name: 'Bubur Beras Sutra Halus',
      tkpiCode: 'TKPI-SR003',
      category: 'carbs',
      isPopular: true,
      salesCount: '1.7k+',
      popularSearchLabel: 'Pencarian Populer',
      image: 'images/plate_bubur_gabus.jpg',
      subtitle: 'Tekstur saring ultra-halus, transisi makanan hari 1-3 pasca-bedah',
      clinicalIndication: 'Diet Lunak',
      bappenasRef: 'Bapanas: Rp 14.500/kg',
      defaultPortionGrams: 220,
      calories: 128,
      protein: 2.8,
      carbs: 28.4,
      fat: 0.3,
      proteinRange: [2.2, 3.4],
      calsRange: [115, 135],
      color: '#EFE8CA',
      texture: 'soft',
      price: 'Rp 2.000'
    },
    {
      id: 'kentang-ubi-kukus',
      name: 'Kentang & Ubi Jalar Kukus',
      tkpiCode: 'TKPI-UB002',
      category: 'carbs',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Karbohidrat kompleks indeks glikemik stabil + Kalium 450mg',
      clinicalIndication: 'Kontrol Gula',
      bappenasRef: 'Bapanas: Rp 18.000/kg',
      defaultPortionGrams: 150,
      calories: 148,
      protein: 2.5,
      carbs: 34.2,
      fat: 0.3,
      proteinRange: [2.0, 3.2],
      calsRange: [140, 160],
      color: '#F59E0B',
      texture: 'soft',
      price: 'Rp 3.500'
    },
    {
      id: 'jus-jeruk-murni',
      name: 'Jus Jeruk Peras Murni',
      tkpiCode: 'TKPI-BH005',
      category: 'fruit-bev',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Asam Askorbat 88mg mempercepat hidroksilasi prolin sintesis kolagen',
      clinicalIndication: 'Sintesis Kolagen',
      bappenasRef: 'Bapanas: Rp 22.000/kg',
      defaultPortionGrams: 200,
      calories: 86,
      protein: 1.4,
      carbs: 19.8,
      fat: 0.2,
      proteinRange: [1.0, 1.8],
      calsRange: [80, 95],
      color: '#F59E0B',
      texture: 'liquid',
      price: 'Rp 4.500'
    },
    {
      id: 'jus-jambu-biji',
      name: 'Jus Jambu Biji Merah Murni',
      tkpiCode: 'TKPI-BH009',
      category: 'fruit-bev',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Konsentrasi Vitamin C tertinggi (180mg) & Likopen anti-inflamasi',
      clinicalIndication: 'Kekebalan Sel',
      bappenasRef: 'Bapanas: Rp 16.000/kg',
      defaultPortionGrams: 200,
      calories: 98,
      protein: 1.8,
      carbs: 22.4,
      fat: 0.4,
      proteinRange: [1.2, 2.2],
      calsRange: [90, 105],
      color: '#EF4444',
      texture: 'liquid',
      price: 'Rp 4.000'
    },
    {
      id: 'air-kelapa-murni',
      name: 'Air Kelapa Hijau Murni',
      tkpiCode: 'TKPI-MN002',
      category: 'fruit-bev',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Isotonik alami kaya Kalium 600mg, Natrium & Magnesium cegah dehidrasi',
      clinicalIndication: 'Rehidrasi',
      bappenasRef: 'Bapanas: Rp 15.000/butir',
      defaultPortionGrams: 250,
      calories: 48,
      protein: 1.8,
      carbs: 10.2,
      fat: 0.4,
      proteinRange: [1.2, 2.2],
      calsRange: [42, 55],
      color: '#9EA76B',
      texture: 'liquid',
      price: 'Rp 6.000'
    },
    {
      id: 'pisang-ambon-segar',
      name: 'Pisang Ambon Matang',
      tkpiCode: 'TKPI-BH014',
      category: 'fruit-bev',
      isPopular: true,
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Kalium 358mg & Pektin lembut untuk energi instan & relaksasi otot',
      clinicalIndication: 'Kesehatan Usus',
      bappenasRef: 'Bapanas: Rp 24.000/sisir',
      defaultPortionGrams: 100,
      calories: 96,
      protein: 1.2,
      carbs: 23.5,
      fat: 0.2,
      proteinRange: [1.0, 1.6],
      calsRange: [90, 105],
      color: '#F59E0B',
      texture: 'soft',
      price: 'Rp 2.500'
    }
  ],

  // Preset Makanan Nyata untuk Demo Scan Computer Vision (Segmentasi Piring Interaktif)
  presetScans: [
    {
      id: 'preset-standard-nasi-ayam',
      title: '🍛 Nasi Ayam Panggang & Sayur (Menu Harian Pasca-Operasi)',
      plateColor: '#0F172A',
      imageUrl: 'images/plate_nasi_ayam.jpg',
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
          color: '#D85A30',
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
      imageUrl: 'images/plate_bubur_gabus.jpg',
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
      imageUrl: 'images/plate_pepes_kembung.jpg',
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
          color: '#E67E22',
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
          color: '#B45309',
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
          color: '#FF7F50',
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
  ],

  // =========================================================================
  // BUKU PANDUAN RESEP & PENGOLAHAN KLINIS TERSTANDAR (17 PANGAN LOKAL)
  // Data akurat terstandar 1 porsi, parameter memasak, timer aktif, & tips klinis
  // =========================================================================
  recipeBook: {
    'ikan-gabus-kukus': {
      title: 'Ikan Gabus Kukus Herbal Albumin',
      author: 'dr. Ratna Sp.GK & Tim Kuliner Medis',
      prepTime: '10m',
      cookTime: '15m',
      totalTime: '25m Time',
      caloriesBase: 124,
      rating: '4.9/5 Rating',
      ratingsCount: '1.4k',
      parameters: [
        { label: 'Kukus', icon: 'solar:stopwatch-bold', value: '15:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '85°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Resting', icon: 'solar:clock-circle-bold', value: '3:00', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Fillet ikan gabus segar (Channa striata)', amount: 120, unit: 'gram' },
        { name: 'Bawang putih (cincang halus)', amount: 2, unit: 'siung' },
        { name: 'Jahe segar (iris tipis korek api)', amount: 10, unit: 'gram' },
        { name: 'Serai (memarkan bagian putih)', amount: 1, unit: 'batang' },
        { name: 'Minyak wijen murni (finishing oil)', amount: 1, unit: 'sdt' },
        { name: 'Perasan air jeruk nipis', amount: 1, unit: 'sdt' },
        { name: 'Daun salam segar', amount: 1, unit: 'lembar' },
        { name: 'Daun bawang (iris halus)', amount: 1, unit: 'sdm' }
      ],
      steps: [
        {
          step: 1,
          title: 'Marinasi Ringan Fillet Ikan',
          instruction: 'Lumuri fillet ikan gabus segar dengan perasan jeruk nipis dan sejumput garam selama 5 menit untuk menetralkan aroma amis tanpa merusak jaringan protein. Bilas tipis dengan air matang dan tiriskan.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Penataan Herbal Aromatik',
          instruction: 'Tata fillet ikan di atas piring cekung tahan panas (pyrex/keramik). Susun irisan jahe, bawang putih cincang, serai memar, dan daun salam di atas dan bawah fillet agar uap herbal meresap merata ke seluruh serat daging.',
          timer: 0,
          tip: null
        },
        {
          step: 3,
          title: 'Pengukusan Uap Terkontrol',
          instruction: 'Panaskan kukusan hingga uap mengepul rata. Masukkan piring ikan, tutup rapat dengan dialasi kain bersih agar uap air tidak menetes langsung ke daging ikan. Kukus selama tepat 15 menit dengan api sedang.',
          timer: 900,
          timerLabel: 'Mulai Timer Kukus Ikan (15m)',
          tip: 'Pengukusan suhu 85-90°C menjaga retensi fraksi albumin hingga 94%, mencegah denaturasi asam amino penyembuh luka bedah.'
        },
        {
          step: 4,
          title: 'Finishing Oil & Penyajian Hangat',
          instruction: 'Buka kukusan hati-hati. Teteskan 1 sdt minyak wijen di atas permukaan fillet yang masih panas mendidih, lalu taburi daun bawang iris. Angkat piring saji, nikmati hangat bersama kaldu sari albuminnya.',
          timer: 0,
          tip: null
        }
      ]
    },
    'dada-ayam-panggang': {
      title: 'Dada Ayam Panggang Herbal Sehat',
      author: 'Chef Arnold & Ahli Gizi Olahraga',
      prepTime: '10m',
      cookTime: '12m',
      totalTime: '22m Time',
      caloriesBase: 165,
      rating: '4.8/5 Rating',
      ratingsCount: '2.1k',
      parameters: [
        { label: 'Panggang', icon: 'solar:stopwatch-bold', value: '10:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '165°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Resting', icon: 'solar:clock-circle-bold', value: '4:00', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Dada ayam tanpa kulit (skinless fillet)', amount: 120, unit: 'gram' },
        { name: 'Bawang putih (parut halus)', amount: 2, unit: 'siung' },
        { name: 'Minyak zaitun extra virgin', amount: 1, unit: 'sdt' },
        { name: 'Lada hitam bubuk', amount: 0.25, unit: 'sdt' },
        { name: 'Ketumbar bubuk sangrai', amount: 0.25, unit: 'sdt' },
        { name: 'Air perasan lemon segar', amount: 1, unit: 'sdt' },
        { name: 'Oregano kering', amount: 0.5, unit: 'sdt' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pemipihan & Marinasi Bumbu',
          instruction: 'Pipihkan dada ayam hingga ketebalan merata (~1.5 cm). Baluri dengan bawang putih parut, lada hitam, ketumbar, oregano, perasan lemon, dan minyak zaitun. Diamkan 10 menit.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Pemanggangan Pan-Sear Sedang',
          instruction: 'Panaskan wajan anti-lengket dengan api sedang. Panggang dada ayam selama 5 menit pada sisi pertama hingga berkulit emas pucat, balik dan panggang 5 menit lagi pada sisi kedua hingga matang merata.',
          timer: 600,
          timerLabel: 'Mulai Timer Panggang (10m)',
          tip: 'Memanggang dengan api sedang tanpa kulit memangkas 80% lemak jenuh sambil mempertahankan 31g protein murni tinggi leusin.'
        },
        {
          step: 3,
          title: 'Resting Daging (Kunci Keempukan)',
          instruction: 'Pindahkan dada ayam ke talenan bersih, diamkan selama 4 menit sebelum diiris agar jus daging meresap kembali dan daging tetap empuk juicy.',
          timer: 240,
          timerLabel: 'Mulai Timer Resting (4m)',
          tip: null
        }
      ]
    },
    'telur-rebus': {
      title: 'Telur Rebus Omega-3 Jammy Presisi',
      author: 'Standar Laboratorium Gizi Medis',
      prepTime: '2m',
      cookTime: '7m',
      totalTime: '9m Time',
      caloriesBase: 78,
      rating: '5.0/5 Rating',
      ratingsCount: '3.8k',
      parameters: [
        { label: 'Rebus', icon: 'solar:stopwatch-bold', value: '7:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Air', icon: 'solar:thermometer-bold', value: '100°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Ice Bath', icon: 'solar:clock-circle-bold', value: '3:00', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Telur ayam ras / omega-3 suhu ruang', amount: 1, unit: 'butir (~60g)' },
        { name: 'Air bersih higienis', amount: 400, unit: 'ml' },
        { name: 'Garam dapur', amount: 0.5, unit: 'sdt' },
        { name: 'Es batu & air dingin', amount: 1, unit: 'mangkuk' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pendidihan Air Bergaram',
          instruction: 'Didihkan 400ml air bersama 1/2 sdt garam dalam panci kecil hingga mendidih aktif. Pastikan telur berada pada suhu ruang agar tidak retak termal.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Perebusan Terkendali 7 Menit',
          instruction: 'Masukkan telur perlahan menggunakan sendok ke dasar panci. Setel api ke sedang. Rebus tepat 7 menit untuk kuning telur bertekstur lembut meleleh (jammy) dengan putih telur matang mantap.',
          timer: 420,
          timerLabel: 'Mulai Timer Rebus Telur (7m)',
          tip: 'Perebusan tepat waktu mencegah terbentuknya senyawa besi sulfida (cincin kehijauan), menjaga bioavailabilitas kolin 147mg dan protein biologis 100.'
        },
        {
          step: 3,
          title: 'Perendaman Air Es & Pengupasan',
          instruction: 'Segera angkat dan rendam di mangkuk air es selama 3 menit untuk menghentikan pematangan termal sekunder. Ketuk perlahan dan kupas di bawah aliran air.',
          timer: 180,
          timerLabel: 'Mulai Timer Ice Bath (3m)',
          tip: null
        }
      ]
    },
    'ikan-kembung-bakar': {
      title: 'Pepes Ikan Kembung Daun Pisang',
      author: 'Dapur Nusantara Sehat & Dokter Sendi',
      prepTime: '12m',
      cookTime: '18m',
      totalTime: '30m Time',
      caloriesBase: 168,
      rating: '4.9/5 Rating',
      ratingsCount: '1.6k',
      parameters: [
        { label: 'Kukus', icon: 'solar:stopwatch-bold', value: '18:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '95°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Panggang', icon: 'solar:clock-circle-bold', value: '4:00', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Ikan kembung segar utuh (bersihkan isi)', amount: 120, unit: 'gram' },
        { name: 'Bawang merah & putih (haluskan)', amount: 3, unit: 'siung' },
        { name: 'Kunyit bakar & jahe parut', amount: 1, unit: 'ruas' },
        { name: 'Kemangi segar', amount: 1, unit: 'genggam' },
        { name: 'Tomat merah potong dadu', amount: 0.5, unit: 'buah' },
        { name: 'Daun pisang pembungkus', amount: 2, unit: 'lembar' }
      ],
      steps: [
        {
          step: 1,
          title: 'Marinasi Bumbu Kunyit Rempah',
          instruction: 'Baluri ikan kembung dengan bumbu halus kunyit, jahe, bawang, dan sedikit garam. Diamkan 10 menit agar bumbu meresap ke serat daging ikan.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Pembungkusan Daun Pisang Rapat',
          instruction: 'Letakkan ikan di atas daun pisang, beri daun salam, serai, tomat, dan kemangi. Bungkus rapat dan semat kedua ujungnya dengan lidi.',
          timer: 0,
          tip: null
        },
        {
          step: 3,
          title: 'Pengukusan Pepes Sehat',
          instruction: 'Kukus bungkusan pepes selama 18 menit hingga ikan matang sempurna dan aroma kemangi menyatu ke dalam kaldu ikan.',
          timer: 1080,
          timerLabel: 'Mulai Timer Kukus Pepes (18m)',
          tip: 'Kandungan 2.6g EPA & DHA (omega-3 alami) terlindungi optimal di dalam bungkusan daun pisang dari paparan panas langsung.'
        }
      ]
    },
    'daging-sapi-murni': {
      title: 'Semur Daging Sapi Has Rendah Lemak',
      author: 'Instalasi Gizi RS & Ahli Hematologi',
      prepTime: '15m',
      cookTime: '35m',
      totalTime: '50m Time',
      caloriesBase: 185,
      rating: '4.7/5 Rating',
      ratingsCount: '1.1k',
      parameters: [
        { label: 'Simmering', icon: 'solar:stopwatch-bold', value: '35:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '90°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Resting', icon: 'solar:clock-circle-bold', value: '5:00', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Daging sapi has dalam (tenderloin) bebas lemak', amount: 100, unit: 'gram' },
        { name: 'Bawang putih & merah (haluskan)', amount: 3, unit: 'siung' },
        { name: 'Pala bubuk & cengkeh', amount: 0.25, unit: 'sdt' },
        { name: 'Kecap manis rendah gula / kedelai hitam', amount: 1, unit: 'sdm' },
        { name: 'Air kaldu sapi bening', amount: 350, unit: 'ml' },
        { name: 'Minyak kelapa untuk bumbu', amount: 0.5, unit: 'sdt' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pemotongan Melintang Serat Daging',
          instruction: 'Iris daging has melawan arah serat setebal 0.8 cm agar tekstur daging empuk dan mudah dicerna lambung.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Tumis Bumbu & Karamelisasi',
          instruction: 'Tumis bumbu halus dengan sedikit minyak hingga harum. Masukkan irisan daging, aduk hingga berubah warna dan mengunci sari daging.',
          timer: 0,
          tip: null
        },
        {
          step: 3,
          title: 'Slow Simmering Empuk',
          instruction: 'Tuangkan air kaldu dan kecap rendah gula. Masak dengan api kecil tertutup selama 35 menit hingga bumbu meresap dan daging empuk lembut.',
          timer: 2100,
          timerLabel: 'Mulai Timer Ungkep Daging (35m)',
          tip: 'Menyuplai 2.8mg zat besi heme dengan bioavailabilitas serap 3x lebih tinggi dibanding nabati untuk pembentukan eritrosit.'
        }
      ]
    },
    'tempe-bacem-kukus': {
      title: 'Tempe Bacem Kukus Air Kelapa Murni',
      author: 'Pakar Gizi Nabati & Diet Metabolik',
      prepTime: '8m',
      cookTime: '20m',
      totalTime: '28m Time',
      caloriesBase: 195,
      rating: '4.8/5 Rating',
      ratingsCount: '1.8k',
      parameters: [
        { label: 'Ungkep', icon: 'solar:stopwatch-bold', value: '15:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Kukus', icon: 'solar:stopwatch-bold', value: '5:00', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '95°C', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Tempe kedelai segar berkualitas', amount: 100, unit: 'gram (2 potong)' },
        { name: 'Air kelapa murni segar', amount: 150, unit: 'ml' },
        { name: 'Bawang merah & putih (haluskan)', amount: 3, unit: 'siung' },
        { name: 'Ketumbar butir sangrai halus', amount: 0.5, unit: 'sdt' },
        { name: 'Gula aren organik', amount: 1, unit: 'sdt (~5g)' },
        { name: 'Daun salam & lengkuas', amount: 1, unit: 'lbr / cm' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pengeratan Permukaan Tempe',
          instruction: 'Potong tempe setebal 1.5 cm, kerat tipis motif silang agar bumbu meresap ke pori-pori fermentasi tempe.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Ungkep Air Kelapa Alami',
          instruction: 'Campur air kelapa, bumbu halus, gula aren, dan tempe. Masak api kecil hingga air kelapa menyusut dan terkaramelisasi lembut.',
          timer: 900,
          timerLabel: 'Mulai Timer Ungkep Tempe (15m)',
          tip: 'Fermentasi Rhizopus dan perebusan air kelapa menghasilkan isoflavon bioaktif yang mendukung kesehatan mikrobioma usus.'
        },
        {
          step: 3,
          title: 'Kukus Finishing Tanpa Minyak',
          instruction: 'Kukus tempe selama 5 menit untuk mematangkan tekstur lembut tanpa setetes pun minyak goreng.',
          timer: 300,
          timerLabel: 'Mulai Timer Kukus Tempe (5m)',
          tip: null
        }
      ]
    },
    'tahu-putih-kukus': {
      title: 'Tahu Sutra Kukus Saus Jahe Hangat',
      author: 'Klinik Digestif & Diet Disfagia',
      prepTime: '5m',
      cookTime: '8m',
      totalTime: '13m Time',
      caloriesBase: 80,
      rating: '4.8/5 Rating',
      ratingsCount: '1.3k',
      parameters: [
        { label: 'Kukus', icon: 'solar:stopwatch-bold', value: '8:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '90°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Saus Kaldu', icon: 'solar:clock-circle-bold', value: '2:00', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Tahu putih sutra (silken tofu)', amount: 100, unit: 'gram' },
        { name: 'Jahe segar parut halus', amount: 1, unit: 'sdt' },
        { name: 'Kecap asin rendah natrium', amount: 1, unit: 'sdt' },
        { name: 'Minyak wijen tetes', amount: 0.5, unit: 'sdt' },
        { name: 'Air matang hangat', amount: 2, unit: 'sdm' },
        { name: 'Irisan daun bawang', amount: 1, unit: 'sdt' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pemotongan & Peracikan Saus',
          instruction: 'Potong tahu sutra menjadi balok 3x3 cm di piring tahan panas. Campur jahe parut, kecap asin rendah natrium, air hangat, dan minyak wijen.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Pengukusan Bersama Saus Jahe',
          instruction: 'Siramkan saus jahe ke atas tahu. Kukus selama 8 menit hingga tahu mengembang lembut dan aroma jahe menyatu.',
          timer: 480,
          timerLabel: 'Mulai Timer Kukus Tahu (8m)',
          tip: 'Tekstur ultra-lembut sangat aman bagi pasien masa transisi diet pasca-operasi rongga mulut atau gangguan menelan (disfagia).'
        }
      ]
    },
    'sayur-bayam-bening': {
      title: 'Sayur Bening Bayam Jagung Manis',
      author: 'Dokter Spesialis Gizi & Hematologi',
      prepTime: '6m',
      cookTime: '6m',
      totalTime: '12m Time',
      caloriesBase: 36,
      rating: '4.9/5 Rating',
      ratingsCount: '1.9k',
      parameters: [
        { label: 'Rebus Jagung', icon: 'solar:stopwatch-bold', value: '5:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Blanch Bayam', icon: 'solar:stopwatch-bold', value: '1:30', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '100°C', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Daun bayam hijau segar (petik)', amount: 100, unit: 'gram' },
        { name: 'Jagung manis pipil / potong', amount: 50, unit: 'gram' },
        { name: 'Bawang merah iris tipis', amount: 2, unit: 'siung' },
        { name: 'Temu kunci memar', amount: 1, unit: 'ruas kecil' },
        { name: 'Air bersih higienis', amount: 350, unit: 'ml' },
        { name: 'Garam & gula pasir', amount: 0.25, unit: 'sdt' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pematangan Jagung & Aromatik',
          instruction: 'Didihkan air bersama bawang merah dan temu kunci. Masukkan jagung manis, masak 5 menit hingga jagung matang manis.',
          timer: 300,
          timerLabel: 'Mulai Timer Rebus Jagung (5m)',
          tip: null
        },
        {
          step: 2,
          title: 'Quick Blanching Bayam',
          instruction: 'Masukkan daun bayam dan garam. Masak cepat hanya selama 90 detik hingga daun layu hijau segar. Segera matikan api!',
          timer: 90,
          timerLabel: 'Mulai Timer Rebus Bayam (90s)',
          tip: 'Memasak bayam tidak lebih dari 2 menit mencegah oksidasi zat besi dan mempertahankan 85% kadar asam folat aktif.'
        }
      ]
    },
    'brokoli-wortel-kukus': {
      title: 'Brokoli & Wortel Kukus Sulforaphane',
      author: 'NutriVision Clinical Onkologi Team',
      prepTime: '6m',
      cookTime: '7m',
      totalTime: '13m Time',
      caloriesBase: 42,
      rating: '4.8/5 Rating',
      ratingsCount: '1.2k',
      parameters: [
        { label: 'Kukus Wortel', icon: 'solar:stopwatch-bold', value: '4:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Kukus Brokoli', icon: 'solar:stopwatch-bold', value: '3:00', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '95°C', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Kuntum brokoli hijau segar', amount: 70, unit: 'gram' },
        { name: 'Wortel iris bulat serong', amount: 50, unit: 'gram' },
        { name: 'Bawang putih cincang halus', amount: 1, unit: 'siung' },
        { name: 'Minyak zaitun extra virgin', amount: 0.5, unit: 'sdt' }
      ],
      steps: [
        {
          step: 1,
          title: 'Kukus Wortel Bertahap',
          instruction: 'Kukus irisan wortel terlebih dahulu selama 4 menit karena serat wortel membutuhkan waktu pemanasan lebih lama.',
          timer: 240,
          timerLabel: 'Mulai Timer Kukus Wortel (4m)',
          tip: null
        },
        {
          step: 2,
          title: 'Kukus Kuntum Brokoli Singkat',
          instruction: 'Tambahkan kuntum brokoli di atas wortel. Kukus bersama selama 3 menit hingga hijau cerah dan renyah lembut.',
          timer: 180,
          timerLabel: 'Mulai Timer Kukus Brokoli (3m)',
          tip: 'Kukus singkat 3-4 menit menjaga enzim mirosinase yang memicu pelepasan sulforaphane, penangkal stres oksidatif luka.'
        }
      ]
    },
    'tumis-kangkung': {
      title: 'Tumis Kangkung Bawang Putih Renyah',
      author: 'Tim Gizi Peristaltik Usus',
      prepTime: '5m',
      cookTime: '4m',
      totalTime: '9m Time',
      caloriesBase: 58,
      rating: '4.7/5 Rating',
      ratingsCount: '950',
      parameters: [
        { label: 'Tumis Bumbu', icon: 'solar:stopwatch-bold', value: '1:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Stir-Fry', icon: 'solar:stopwatch-bold', value: '3:00', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Wajan', icon: 'solar:thermometer-bold', value: 'Api Besar', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Kangkung segar (petik daun & batang)', amount: 120, unit: 'gram' },
        { name: 'Bawang putih geprek cincang', amount: 3, unit: 'siung' },
        { name: 'Cabai merah buang biji iris', amount: 1, unit: 'buah' },
        { name: 'Minyak canola / kelapa', amount: 1, unit: 'sdt' },
        { name: 'Air matang', amount: 2, unit: 'sdm' }
      ],
      steps: [
        {
          step: 1,
          title: 'Penyiapan & Tumis Aromatik',
          instruction: 'Tumis bawang putih dan cabai merah dalam wajan panas dengan 1 sdt minyak selama 45 detik hingga harum.',
          timer: 45,
          timerLabel: 'Mulai Timer Tumis Bumbu (45s)',
          tip: null
        },
        {
          step: 2,
          title: 'Stir-Fry Kangkung Kilat',
          instruction: 'Masukkan kangkung dan 2 sdm air. Aduk cepat selama 2-3 menit hingga daun layu namun batang tetap renyah segar.',
          timer: 180,
          timerLabel: 'Mulai Timer Stir-Fry (3m)',
          tip: 'Serat selulosa pada kangkung yang ditumis cepat melancarkan gerakan peristaltik usus dan mencegah obstipasi pasca-operasi.'
        }
      ]
    },
    'nasi-putih': {
      title: 'Nasi Putih Pulen Kukus Dandang',
      author: 'Spesialis Karbohidrat Seimbang',
      prepTime: '5m',
      cookTime: '25m',
      totalTime: '30m Time',
      caloriesBase: 185,
      rating: '4.9/5 Rating',
      ratingsCount: '2.5k',
      parameters: [
        { label: 'Aron Beras', icon: 'solar:stopwatch-bold', value: '10:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Kukus Dandang', icon: 'solar:stopwatch-bold', value: '15:00', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '100°C', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Beras medium lokal pilihan', amount: 75, unit: 'gram (mentah)' },
        { name: 'Air bersih', amount: 120, unit: 'ml' },
        { name: 'Daun pandan wangi', amount: 1, unit: 'lembar' }
      ],
      steps: [
        {
          step: 1,
          title: 'Aron Beras di Panci',
          instruction: 'Masak beras, air, dan daun pandan dengan api kecil sambil diaduk hingga air terserap habis ke dalam butiran beras.',
          timer: 600,
          timerLabel: 'Mulai Timer Aron Beras (10m)',
          tip: null
        },
        {
          step: 2,
          title: 'Kukus Dandang Pulen',
          instruction: 'Pindahkan nasi aron ke dalam kukusan dandang panas. Kukus selama 15 menit hingga butir nasi mekar sempurna dan harum.',
          timer: 900,
          timerLabel: 'Mulai Timer Kukus Nasi (15m)',
          tip: 'Teknik aron-kukus menghasilkan gelatinisasi pati yang sempurna dan mudah dicerna enzim amilase lambung.'
        }
      ]
    },
    'bubur-ayam': {
      title: 'Bubur Beras Sutra Halus Kaldu Alami',
      author: 'Instalasi Diet Khusus Pasca-Bedah Mayor',
      prepTime: '5m',
      cookTime: '20m',
      totalTime: '25m Time',
      caloriesBase: 128,
      rating: '5.0/5 Rating',
      ratingsCount: '2.9k',
      parameters: [
        { label: 'Simmering', icon: 'solar:stopwatch-bold', value: '20:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '85°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Resting', icon: 'solar:clock-circle-bold', value: '5:00', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Beras lokal pulen', amount: 50, unit: 'gram' },
        { name: 'Kaldu ayam kampung rebusan bening', amount: 450, unit: 'ml' },
        { name: 'Jahe segar memar', amount: 1, unit: 'ruas kecil' },
        { name: 'Minyak wijen tetes', amount: 3, unit: 'tetes' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pemasakan Kaldu & Beras',
          instruction: 'Didihkan air kaldu ayam bersama jahe memar. Masukkan beras yang telah direndam sebentar.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Slow Simmering & Aduk Berkala',
          instruction: 'Kecilkan api ke level minimal. Masak selama 20 menit sambil diaduk berkala hingga butiran beras larut menyatu kental lembut.',
          timer: 1200,
          timerLabel: 'Mulai Timer Masak Bubur (20m)',
          tip: 'Osmolalitas rendah dan kandungan air 85% menjadikan bubur kaldu pilihan utama transisi makanan bertahap pasca-operasi.'
        }
      ]
    },
    'kentang-ubi-kukus': {
      title: 'Kentang & Ubi Jalar Kukus Kalium Tinggi',
      author: 'Konsultan Diet Hipertensi & Jantung',
      prepTime: '6m',
      cookTime: '20m',
      totalTime: '26m Time',
      caloriesBase: 148,
      rating: '4.8/5 Rating',
      ratingsCount: '1.5k',
      parameters: [
        { label: 'Kukus', icon: 'solar:stopwatch-bold', value: '20:00', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: '98°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Uji Garpu', icon: 'solar:clock-circle-bold', value: 'Empuk', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Kentang kuning kupas potong balok', amount: 80, unit: 'gram' },
        { name: 'Ubi jalar kuning/oranye potong balok', amount: 70, unit: 'gram' },
        { name: 'Peterseli kering', amount: 0.25, unit: 'sdt' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pemotongan & Penghilangan Getah',
          instruction: 'Kupas dan potong balok kentang serta ubi setebal 2 cm. Rendam 3 menit di air dingin lalu tiriskan.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Pengukusan Empuk',
          instruction: 'Kukus dalam dandang uap panas selama 20 menit hingga empuk saat ditusuk garpu. Sajikan hangat tabur peterseli.',
          timer: 1200,
          timerLabel: 'Mulai Timer Kukus Ubi Kentang (20m)',
          tip: 'Menyuplai 450mg kalium yang menyeimbangkan natrium darah dan relaksasi kontraksi pembuluh darah.'
        }
      ]
    },
    'jus-jeruk-murni': {
      title: 'Jus Jeruk Peras Murni Kolagen Alami',
      author: 'Spesialis Kolagen & Pemulihan Jaringan',
      prepTime: '5m',
      cookTime: '0m',
      totalTime: '5m Time',
      caloriesBase: 86,
      rating: '4.9/5 Rating',
      ratingsCount: '1.7k',
      parameters: [
        { label: 'Cold Press', icon: 'solar:stopwatch-bold', value: 'Manual', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Suhu', icon: 'solar:thermometer-bold', value: 'Segar', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Vit C', icon: 'solar:clock-circle-bold', value: '88mg', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Jeruk peras manis segar (baby/sunkist)', amount: 2, unit: 'buah (~200g)' },
        { name: 'Air matang dingin', amount: 50, unit: 'ml' },
        { name: 'Es batu kristal', amount: 2, unit: 'bongkah' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pemerasan Manual Lembut',
          instruction: 'Belah jeruk melintang. Peras manual dengan tekanan lembut agar minyak pahit kulit jeruk tidak keluar.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Penyaringan & Penyajian Segar',
          instruction: 'Saring biji jeruk namun biarkan bulir sari alami tetap ikut. Tambahkan sedikit air dingin dan nikmati dalam 15 menit.',
          timer: 0,
          tip: 'Vitamin C 88mg merupakan kofaktor enzim prolil hidroksilase krusial untuk biosintesis kolagen penutup luka.'
        }
      ]
    },
    'jus-jambu-biji': {
      title: 'Jus Jambu Biji Merah Murni Saring Trombosit',
      author: 'Laboratorium Hematologi & Imunologi',
      prepTime: '8m',
      cookTime: '0m',
      totalTime: '8m Time',
      caloriesBase: 98,
      rating: '5.0/5 Rating',
      ratingsCount: '2.3k',
      parameters: [
        { label: 'Blender', icon: 'solar:stopwatch-bold', value: '0:45', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Saring Kasa', icon: 'solar:thermometer-bold', value: 'Bebas Biji', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Vit C', icon: 'solar:clock-circle-bold', value: '180mg', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Jambu biji merah matang pohon', amount: 1, unit: 'buah (~150g)' },
        { name: 'Air matang dingin', amount: 100, unit: 'ml' },
        { name: 'Madu murni alami', amount: 1, unit: 'sdt (~5g)' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pemblenderan Singkat 45 Detik',
          instruction: 'Potong jambu biji. Blender bersama air dingin dan madu selama 45 detik saja dengan kecepatan sedang agar biji tidak hancur berpasir.',
          timer: 45,
          timerLabel: 'Mulai Timer Blender (45s)',
          tip: null
        },
        {
          step: 2,
          title: 'Penyaringan Biji Total',
          instruction: 'Tuang melalui saringan kawat halus sambil ditekan perlahan untuk memisahkan seluruh biji kerasnya. Sajikan dingin kental.',
          timer: 0,
          tip: 'Sumber vitamin C 180mg dan likopen perangsang trombopoietin untuk pembentukan keping darah trombosit.'
        }
      ]
    },
    'air-kelapa-murni': {
      title: 'Air Kelapa Hijau Murni Isotonik Alami',
      author: 'Dokter Rehidrasi & Keseimbangan Cairan',
      prepTime: '3m',
      cookTime: '0m',
      totalTime: '3m Time',
      caloriesBase: 48,
      rating: '5.0/5 Rating',
      ratingsCount: '3.1k',
      parameters: [
        { label: 'Segar Alami', icon: 'solar:stopwatch-bold', value: 'Tanpa Gula', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Kalium', icon: 'solar:thermometer-bold', value: '600mg', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Elektrolit', icon: 'solar:clock-circle-bold', value: 'Isotonik', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Air kelapa muda segar murni', amount: 250, unit: 'ml' },
        { name: 'Daging kelapa muda lembut', amount: 1, unit: 'sdm' }
      ],
      steps: [
        {
          step: 1,
          title: 'Penyaringan Batok Alami',
          instruction: 'Lubangi batok kelapa steril, tuang air kelapa langsung ke gelas saji melalui saringan kecil.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Penyajian Dingin Alami',
          instruction: 'Tambahkan kerokan daging kelapa muda lembut. Minum langsung tanpa pemanis sintetis.',
          timer: 0,
          tip: 'Osmolaritas elektrolit alami mempercepat rehidrasi seluler dan meredakan rasa haus pasca-tindakan medis.'
        }
      ]
    },
    'pisang-ambon-segar': {
      title: 'Pisang Ambon Matang Alami Kalium Usus',
      author: 'Ahli Gizi Pemulihan & Geriatri',
      prepTime: '2m',
      cookTime: '0m',
      totalTime: '2m Time',
      caloriesBase: 96,
      rating: '4.8/5 Rating',
      ratingsCount: '1.4k',
      parameters: [
        { label: 'Kematangan', icon: 'solar:stopwatch-bold', value: 'Sugar Spots', bg: '#FEF3C7', color: '#92400E' },
        { label: 'Kalium', icon: 'solar:thermometer-bold', value: '358mg', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Tekstur', icon: 'solar:clock-circle-bold', value: 'Lunak', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: 'Pisang ambon matang segar', amount: 1, unit: 'buah (~100g)' },
        { name: 'Perasan jeruk nipis (jika dipotong)', amount: 3, unit: 'tetes' }
      ],
      steps: [
        {
          step: 1,
          title: 'Pengupasan & Pemotongan Rapi',
          instruction: 'Kupas kulit pisang ambon matang dengan bintik gula alami. Iris serong setebal 1 cm di piring saji.',
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: 'Penyajian Ramah Lambung',
          instruction: 'Beri 3 tetes jeruk nipis agar warna tidak menggelap. Nikmati sebagai camilan lembut pelindung dinding lambung.',
          timer: 0,
          tip: 'Pektin alami dan kalium 358mg bertindak sebagai antasida alami pelindung lapisan mukosa lambung.'
        }
      ]
    }
  }
};
