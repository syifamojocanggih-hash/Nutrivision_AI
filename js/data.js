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
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Kaya Albumin 2.17g untuk granulasi luka & regenerasi sel bedah',
      clinicalIndication: 'Pasca-Operasi & Penutupan Luka',
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
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tinggi Leusin 2.4g & Asam Amino Esensial bebas lemak jenuh',
      clinicalIndication: 'Sintesis Protein & Regenerasi Otot',
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
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Nilai Biologis Protein 100 + Kolin 147mg & Kolagen Alami',
      clinicalIndication: 'Pemulihan Jaringan Harian',
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
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Kaya Omega-3 (EPA/DHA 2.6g) setara salmon untuk redakan inflamasi',
      clinicalIndication: 'Fisioterapi & Kesehatan Sendi',
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
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tinggi Zat Besi Heme 2.8mg, Zinc & Kolagen Pembentuk Sel Darah',
      clinicalIndication: 'Cegah Anemia & Kuatkan Imun',
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
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Fermentasi Rhizopus menghasilkan Prebiotik & Isoflavon 19g protein',
      clinicalIndication: 'Kesehatan Pencernaan & Imun',
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
      clinicalIndication: 'Tekstur Lunak / Disfagia',
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
      clinicalIndication: 'Hemoglobin & Sirkulasi Darah',
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
      clinicalIndication: 'Antioksidan & Integritas Mukosa',
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
      clinicalIndication: 'Pencegahan Konstipasi Bedah',
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
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Sumber energi primer glukosa untuk metabolisme sel & fisioterapi',
      clinicalIndication: 'Pemulihan Energi & Glikogen',
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
      popularSearchLabel: 'Pencarian Populer',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
      subtitle: 'Tekstur saring ultra-halus, transisi makanan hari 1-3 pasca-bedah',
      clinicalIndication: 'Diet Lunak Pasca-Anestesi',
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
      clinicalIndication: 'Kontrol Glukosa & Kalium Otot',
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
      clinicalIndication: 'Sintesis Kolagen & Imun',
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
      clinicalIndication: 'Trombosit & Kekebalan Sel',
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
      clinicalIndication: 'Rehidrasi & Keseimbangan Elektrolit',
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
      clinicalIndication: 'Elektrolit & Kesehatan Usus',
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
