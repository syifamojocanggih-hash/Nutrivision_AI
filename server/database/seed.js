/**
 * ============================================================================
 * NutriVision AI — MySQL Database Seeder
 * Populates initial clinical accounts, TKPI food catalog, and sample records
 * ============================================================================
 */

const bcrypt = require('bcryptjs');

async function seedDatabase(db) {
  try {
    const userCountResult = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCountResult && userCountResult.count > 0) {
      console.log('ℹ️ MySQL database already contains data. Skipping initial seeding.');
      return;
    }

    console.log('🌱 Seeding initial NutriVision AI clinical database to MySQL...');

    const passwordHashAdmin = bcrypt.hashSync('admin123', 10);
    const passwordHashPatient = bcrypt.hashSync('pasien123', 10);
    const passwordHashRehab = bcrypt.hashSync('ahmad123', 10);
    const passwordHashDoctor = bcrypt.hashSync('dokter123', 10);

    // 1. Users
    const insertUserSql = `
      INSERT INTO users (
        id, name, email, password_hash, phone, role, age, gender,
        clinical_condition, recovery_phase, weight_kg, height_cm, bmi,
        activity_level, restrictions, allergies, daily_calories,
        target_protein, target_carbs, target_fat
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(insertUserSql, [
      'usr_admin',
      'dr. Sarah Larasati, M.Kes',
      'admin@nutrivision.id',
      passwordHashAdmin,
      '081299990001',
      'admin',
      38,
      'female',
      'clinical-lead',
      'phase3',
      56.0,
      164.0,
      20.8,
      'moderate',
      JSON.stringify([]),
      JSON.stringify([]),
      1950,
      85.0,
      240.0,
      55.0
    ]);

    await db.run(insertUserSql, [
      'usr_patient_siti',
      'Siti Rahma',
      'pasien@nutrivision.id',
      passwordHashPatient,
      '081388880002',
      'patient',
      58,
      'female',
      'post-surgery',
      'phase2',
      62.0,
      158.0,
      24.8,
      'light',
      JSON.stringify(['Bebas Minyak Goreng Jelantah', 'Rendah Garam']),
      JSON.stringify(['Santan Kental', 'Makanan Pedas']),
      1820,
      93.0,
      215.0,
      52.0
    ]);

    await db.run(insertUserSql, [
      'usr_patient_ahmad',
      'Ahmad Fauzi',
      'ahmad@nutrivision.id',
      passwordHashRehab,
      '081277770003',
      'patient',
      34,
      'male',
      'rehabilitation',
      'phase3',
      70.0,
      175.0,
      22.9,
      'moderate',
      JSON.stringify(['Tinggi Protein']),
      JSON.stringify(['Kacang Tanah']),
      2350,
      115.0,
      290.0,
      65.0
    ]);

    await db.run(insertUserSql, [
      'usr_doctor_hendra',
      'dr. Hendra Kurniawan, Sp.GK',
      'hendra@nutrivision.id',
      passwordHashDoctor,
      '081166660004',
      'doctor',
      44,
      'male',
      'clinical-specialist',
      'phase3',
      68.0,
      172.0,
      23.0,
      'moderate',
      JSON.stringify([]),
      JSON.stringify([]),
      2100,
      90.0,
      260.0,
      60.0
    ]);

    // 2. Indonesian Food Catalog (TKPI Bappenas / Kemenkes)
    const insertFoodSql = `
      INSERT INTO foods (
        id, name, category, portion_grams, calories, protein, carbs, fat,
        fiber, albumin, iron, vitamin_c, zinc, price_est, symptom_tags, clinical_note, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const foodsData = [
      {
        id: 'food_gabus',
        name: 'Ikan Gabus Kukus (Channa striata)',
        category: 'animal',
        portion: 100,
        cals: 110,
        prot: 25.2,
        carbs: 0.0,
        fat: 1.0,
        fiber: 0.0,
        albumin: 6.8,
        iron: 1.2,
        vitC: 0,
        zinc: 2.1,
        price: 15000,
        tags: ['high_protein', 'high_albumin', 'dysphagia_friendly', 'post_surgery_gold'],
        note: 'Kadar albumin tertinggi di antara ikan air tawar. Mempercepat penyembuhan luka pasca-bedah hingga 2x.',
        img: 'images/plate_bubur_gabus.jpg'
      },
      {
        id: 'food_kembung',
        name: 'Pepes Ikan Kembung Bumbu Kuning',
        category: 'animal',
        portion: 100,
        cals: 135,
        prot: 21.3,
        carbs: 1.5,
        fat: 4.8,
        fiber: 0.2,
        albumin: 4.2,
        iron: 1.9,
        vitC: 1.5,
        zinc: 1.8,
        price: 8500,
        tags: ['high_protein', 'omega3_rich', 'anti_inflammatory', 'low_budget'],
        note: 'Kaya asam lemak Omega-3 setara salmon dengan harga lokal terjangkau. Menekan inflamasi akut.',
        img: 'images/plate_pepes_kembung.jpg'
      },
      {
        id: 'food_dada_ayam',
        name: 'Dada Ayam Rebus / Panggang Lembut',
        category: 'animal',
        portion: 100,
        cals: 165,
        prot: 31.0,
        carbs: 0.0,
        fat: 3.6,
        fiber: 0.0,
        albumin: 3.5,
        iron: 1.0,
        vitC: 0,
        zinc: 1.0,
        price: 11000,
        tags: ['high_protein', 'lean_meat', 'low_fat'],
        note: 'Sumber asam amino esensial lengkap untuk sintesis kolagen dan regenerasi massa otot skeletal.',
        img: 'images/plate_nasi_ayam.jpg'
      },
      {
        id: 'food_tempe',
        name: 'Tempe Kukus / Bacem Tradisional',
        category: 'plant',
        portion: 100,
        cals: 190,
        prot: 19.0,
        carbs: 9.0,
        fat: 11.0,
        fiber: 4.5,
        albumin: 1.5,
        iron: 2.7,
        vitC: 0,
        zinc: 1.8,
        price: 3500,
        tags: ['plant_protein', 'probiotic_fermented', 'low_budget', 'high_fiber'],
        note: 'Kaya bio-peptida hasil fermentasi Rhizopus oryzae yang mudah diserap saluran cerna pasca-anestesi.',
        img: 'images/plate_salmon_brokoli.jpg'
      },
      {
        id: 'food_tahu',
        name: 'Tahu Putih Kukus Halus',
        category: 'plant',
        portion: 100,
        cals: 76,
        prot: 8.1,
        carbs: 1.9,
        fat: 4.8,
        fiber: 1.2,
        albumin: 0.8,
        iron: 1.4,
        vitC: 0,
        zinc: 0.8,
        price: 2500,
        tags: ['plant_protein', 'dysphagia_friendly', 'nausea_friendly', 'easy_digest'],
        note: 'Tekstur lembut ramah lambung, sangat cocok untuk pasien pasca-operasi rongga mulut atau disfagia.',
        img: 'images/plate_bubur_gabus.jpg'
      },
      {
        id: 'food_telur',
        name: 'Telur Ayam Rebus Matang',
        category: 'animal',
        portion: 100,
        cals: 155,
        prot: 13.0,
        carbs: 1.1,
        fat: 11.0,
        fiber: 0.0,
        albumin: 5.4,
        iron: 1.8,
        vitC: 0,
        zinc: 1.1,
        price: 4000,
        tags: ['high_protein', 'high_bioavailability', 'low_budget'],
        note: 'Memiliki skor Biological Value (BV) 100 sebagai standar baku emas kecernaan protein.',
        img: 'images/plate_nasi_ayam.jpg'
      },
      {
        id: 'food_bayam',
        name: 'Sayur Bening Bayam Temu Kunci',
        category: 'plant',
        portion: 100,
        cals: 23,
        prot: 2.9,
        carbs: 3.6,
        fat: 0.4,
        fiber: 2.2,
        albumin: 0.2,
        iron: 3.5,
        vitC: 28.0,
        zinc: 0.5,
        price: 3000,
        tags: ['high_iron', 'high_folate', 'nausea_friendly', 'hydration'],
        note: 'Kombinasi zat besi dan folat untuk stimulasi hemoglobin dan eritropoiesis pasca kehilangan darah.',
        img: 'images/plate_nasi_ayam.jpg'
      },
      {
        id: 'food_kangkung',
        name: 'Tumis Kangkung Bawang Putih',
        category: 'plant',
        portion: 100,
        cals: 45,
        prot: 2.6,
        carbs: 3.1,
        fat: 1.2,
        fiber: 2.1,
        albumin: 0.1,
        iron: 2.5,
        vitC: 32.0,
        zinc: 0.4,
        price: 3000,
        tags: ['vitamin_c', 'fiber', 'antioxidant'],
        note: 'Kandungan Vitamin C tinggi merangsang enzim prolyl hidroksilase pada biosintesis rantai kolagen.',
        img: 'images/plate_nasi_ayam.jpg'
      },
      {
        id: 'food_brokoli',
        name: 'Brokoli Kukus Segar',
        category: 'plant',
        portion: 100,
        cals: 34,
        prot: 2.8,
        carbs: 6.6,
        fat: 0.4,
        fiber: 2.6,
        albumin: 0.2,
        iron: 0.7,
        vitC: 89.0,
        zinc: 0.4,
        price: 8000,
        tags: ['sulforaphane', 'high_vit_c', 'anti_inflammatory'],
        note: 'Kaya sulforaphane dan vitamin C esensial untuk remodeling jaringan dan daya tahan imunitas.',
        img: 'images/plate_salmon_brokoli.jpg'
      },
      {
        id: 'food_nasi_putih',
        name: 'Nasi Putih Pulen Hangat',
        category: 'staple',
        portion: 150,
        cals: 195,
        prot: 3.6,
        carbs: 43.0,
        fat: 0.4,
        fiber: 0.6,
        albumin: 0.0,
        iron: 0.4,
        vitC: 0,
        zinc: 0.7,
        price: 2500,
        tags: ['energy_dense', 'easy_digest', 'staple'],
        note: 'Menyediakan energi glukosa instan untuk mencegah katabolisme massa otot pada fase hipermetabolik.',
        img: 'images/plate_nasi_ayam.jpg'
      },
      {
        id: 'food_bubur',
        name: 'Bubur Beras Halus Saring',
        category: 'staple',
        portion: 200,
        cals: 140,
        prot: 2.4,
        carbs: 30.0,
        fat: 0.3,
        fiber: 0.4,
        albumin: 0.0,
        iron: 0.3,
        vitC: 0,
        zinc: 0.5,
        price: 3000,
        tags: ['dysphagia_friendly', 'easy_digest', 'post_anesthesia'],
        note: 'Tekstur cair-kental ramah mukosa esofagus, sangat cocok pada hari ke-1 hingga ke-3 pasca-bedah.',
        img: 'images/plate_bubur_gabus.jpg'
      }
    ];

    for (const f of foodsData) {
      await db.run(insertFoodSql, [
        f.id,
        f.name,
        f.category,
        f.portion,
        f.cals,
        f.prot,
        f.carbs,
        f.fat,
        f.fiber,
        f.albumin,
        f.iron,
        f.vitC,
        f.zinc,
        f.price,
        JSON.stringify(f.tags),
        f.note,
        f.img
      ]);
    }

    // 3. Initial Sample Meals for Siti Rahma (Last 7 Days)
    const insertMealSql = `
      INSERT INTO meals (
        id, user_id, meal_type, title, timestamp, total_calories, total_protein,
        total_carbs, total_fat, image_url, confidence, clinical_advice, segments_json
      ) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const sampleMeals = [
      {
        id: 'meal_demo_1',
        type: 'breakfast',
        title: 'Bubur Ikan Gabus Albumin Saring',
        daysAgo: 0,
        cals: 420,
        prot: 34.5,
        carbs: 48.0,
        fat: 7.2,
        conf: 95,
        advice: 'Tekstur bubur saring sangat ramah disfagia pasca-anestesi. Albumin Channa striata memicu pembentukan granulasi luka 2x lebih cepat.',
        segments: [
          { name: 'Ikan Gabus Tim', portionGrams: 120, protein: [28, 32], cals: [120, 140], color: '#E25822' },
          { name: 'Bubur Beras Putih', portionGrams: 200, protein: [2, 4], cals: [130, 150], color: '#06B6D4' },
          { name: 'Kuah Kaldu Temu Kunci', portionGrams: 80, protein: [1, 2], cals: [20, 30], color: '#10B981' }
        ]
      },
      {
        id: 'meal_demo_2',
        type: 'lunch',
        title: 'Nasi Tim Dada Ayam & Kangkung Rebus',
        daysAgo: 1,
        cals: 480,
        prot: 38.0,
        carbs: 55.0,
        fat: 8.5,
        conf: 92,
        advice: 'Asam amino lisin dan arginin pada dada ayam mendukung sintesis serat kolagen baru.',
        segments: [
          { name: 'Dada Ayam Panggang', portionGrams: 120, protein: [34, 38], cals: [180, 200], color: '#E25822' },
          { name: 'Nasi Putih Pulen', portionGrams: 150, protein: [3, 5], cals: [180, 210], color: '#06B6D4' },
          { name: 'Sayur Kangkung Kukus', portionGrams: 80, protein: [2, 3], cals: [30, 45], color: '#10B981' }
        ]
      },
      {
        id: 'meal_demo_3',
        type: 'dinner',
        title: 'Pepes Ikan Kembung Omega-3 & Tempe Bacem',
        daysAgo: 2,
        cals: 430,
        prot: 35.0,
        carbs: 42.0,
        fat: 10.0,
        conf: 94,
        advice: 'Asam lemak Omega-3 EPA/DHA ikan kembung efektif meredakan pembengkakan dan edema luka.',
        segments: [
          { name: 'Pepes Kembung', portionGrams: 130, protein: [26, 30], cals: [170, 190], color: '#9EA76B' },
          { name: 'Tempe Bacem', portionGrams: 80, protein: [14, 16], cals: [140, 160], color: '#F59E0B' },
          { name: 'Sayur Bening Bayam', portionGrams: 100, protein: [2, 4], cals: [25, 35], color: '#10B981' }
        ]
      },
      {
        id: 'meal_demo_4',
        type: 'lunch',
        title: 'Sup Ikan Gabus Labu Kuning Puree',
        daysAgo: 3,
        cals: 460,
        prot: 36.0,
        carbs: 50.0,
        fat: 7.0,
        conf: 93,
        advice: 'Beta-karoten labu kuning dan albumin ikan gabus mempercepat fase re-epitelisasi kulit.',
        segments: [
          { name: 'Fillet Ikan Gabus', portionGrams: 130, protein: [30, 34], cals: [140, 160], color: '#E25822' },
          { name: 'Puree Labu Kuning', portionGrams: 150, protein: [2, 3], cals: [90, 110], color: '#F59E0B' }
        ]
      }
    ];

    for (const m of sampleMeals) {
      await db.run(insertMealSql, [
        m.id,
        'usr_patient_siti',
        m.type,
        m.title,
        m.daysAgo,
        m.cals,
        m.prot,
        m.carbs,
        m.fat,
        'images/plate_bubur_gabus.jpg',
        m.conf,
        m.advice,
        JSON.stringify(m.segments)
      ]);
    }

    // 4. Initial Community Posts
    const insertPostSql = `
      INSERT INTO community_posts (
        id, user_id, author_name, author_badge, category, title, content,
        food_recipe_json, likes_count, comments_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(insertPostSql, [
      'post_1',
      'usr_patient_siti',
      'Siti Rahma',
      'Pasca-Bedah Digestif · Minggu 2',
      'resep',
      'Resep Tim Ikan Gabus Kuah Kuning Ramah Mual & Cepat Kering',
      'Alhamdulillah setelah rutin makan tim gabus 150g per hari, luka bekas jahitan saya mengering lebih cepat menurut dokter saat kontrol kemarin. Kuncinya kunyit dibakar dulu supaya tidak langu di lidah!',
      JSON.stringify({
        ingredients: ['150g Ikan Gabus Segar', '2 ruas Kunyit Bakar', '1 batang Sereh', '100ml Air Kaldu'],
        proteinTotal: '36g Protein'
      }),
      24,
      JSON.stringify([
        { author: 'dr. Hendra Kurniawan, Sp.GK', text: 'Pilihan luar biasa Bu Siti! Albumin gabus memang memicu granulasi sel lebih cepat.' }
      ])
    ]);

    await db.run(insertPostSql, [
      'post_2',
      'usr_patient_ahmad',
      'Ahmad Fauzi',
      'Rehabilitasi Ligamen Lutut · Bulan 1',
      'progres',
      'Target 105g Protein Tanpa Suplemen Mahal: Kuncinya Tempe & Ikan Kembung',
      'Banyak yang mengira pasca rekonstruksi ACL harus beli whey protein impor. Dengan menu lokal (kembung pepes, telur rebus, dan tempe bacem), biaya harian saya cuma Rp30.000 tapi target protein 105g tercapai konsisten!',
      JSON.stringify({
        ingredients: ['2 butir Telur Rebus', '100g Pepes Kembung', '100g Tempe Bacem'],
        proteinTotal: '53g Protein'
      }),
      38,
      JSON.stringify([])
    ]);

    // 5. Initial Caregiver Share Token
    await db.run(`
      INSERT INTO caregiver_shares (
        id, user_id, token, caregiver_name, role, is_active
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'cg_share_1',
      'usr_patient_siti',
      'demo-caregiver-token-siti',
      'Rina (Anak Pendamping)',
      'family',
      1
    ]);

    // 6. Initial Audit Log
    await db.run(`
      INSERT INTO audit_logs (id, user_id, action, details, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `, [
      'log_init_1',
      'usr_admin',
      'DATABASE_SEED',
      'Inisialisasi sistem NutriVision AI Database & Seeding Data Klinis ke MySQL',
      '127.0.0.1'
    ]);

    console.log('✅ NutriVision AI clinical database seeded to MySQL successfully!');
  } catch (err) {
    console.error('Error seeding MySQL database:', err);
  }
}

module.exports = { seedDatabase };
