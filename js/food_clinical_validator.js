/**
 * ============================================================================
 * NutriVision AI — Deep Clinical Food Validation Engine (CDSS)
 * Validasi Makanan Berdasarkan Biometrik (BB, TB, BMI), Kondisi Medis/Penyakit,
 * Gejala Pencernaan, dan Pantangan Pasien
 * Sesuai Standar Konsensus Medis: ESPEN, ERAS, PERKENI, PERKI, & KDIGO
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    const inst = factory();
    module.exports = inst;
    if (typeof root !== 'undefined') root.FoodClinicalValidator = inst;
    if (typeof window !== 'undefined') window.FoodClinicalValidator = inst;
    if (typeof global !== 'undefined') global.FoodClinicalValidator = inst;
  } else {
    root.FoodClinicalValidator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Database Bahan Berisiko / Nutrisi Kritis Spesifik Penyakit
  const CLINICAL_INGREDIENT_DATABASE = {
    // Bahan Tinggi Natrium (Kritis untuk Hipertensi & CKD)
    highSodium: [
      'ikan asin', 'telur asin', 'kornet', 'sosis', 'kecap asin', 'terasi', 'petis',
      'keju olahan', 'mi instan', 'chips', 'keripik asin', 'kaldu blok', 'msg',
      'baking powder', 'acar garam', 'daging asap', 'bacon', 'nugget olahan'
    ],
    // Bahan Tinggi Lemak Jenuh & Trans (Kritis untuk Pasca-Kolesistektomi, Dislipidemia, & GERD)
    highSaturatedFat: [
      'gorengan', 'minyak jelantah', 'santan kental', 'santan pekat', 'kulit ayam',
      'gajih', 'jeroan', 'lemak sapi', 'mentega', 'margarine trans', 'deep-fried',
      'bakwan', 'mendoan', 'cireng', 'krispi'
    ],
    // Bahan Tinggi Gula / Indeks Glikemik Ekstrem (Kritis untuk Diabetes)
    highSugar: [
      'gula pasir', 'sirup', 'kental manis', 'boba', 'dessert manis', 'donat glazuur',
      'madu berlebih', 'minuman bersoda', 'selai manis', 'kue tart', 'permen'
    ],
    // Bahan Tinggi Purin (Kritis untuk Asam Urat / Gout)
    highPurine: [
      'jeroan', 'hati sapi', 'hati ayam', 'babat', 'usus', 'paru', 'emping',
      'melinjo', 'kerang', 'sarden kaleng', 'ekstrak ragi', 'otak sapi'
    ],
    // Bahan Pemicu Iritasi Lambung / Refluks (Kritis untuk GERD & Gastritis)
    gerdTriggers: [
      'cabai rawit', 'sambal pedas', 'lada hitam', 'cuka', 'jeruk nipis asam',
      'kopi', 'kafein pekat', 'cokelat pekat', 'mint', 'peppermint', 'bawang mentah'
    ],
    // Bahan Tinggi Kalium (Wajib Dibatasi pada Pasien Gagal Ginjal / CKD Stadium Lanjut)
    highPotassium: [
      'air kelapa', 'air kelapa murni', 'pisang ambon', 'durian', 'alpukat',
      'kurma', 'kentang mentah tanpa rendam', 'bayam mentah'
    ],
    // Tekstur Keras / Alot / Kasar (Bahaya Aspirasi untuk Disfagia)
    dysphagiaHazardTextures: [
      'keras', 'alot', 'renyah', 'kering', 'biji-bijian utuh', 'kacang utuh',
      'keripik', 'daging serat kasar', 'tulang lunak', 'sayur mentah renyah'
    ]
  };

  class FoodClinicalValidationEngine {
    constructor() {
      this.db = CLINICAL_INGREDIENT_DATABASE;
    }

    /**
     * Hitung parameter biometrik & metabolisme presisi pengguna
     * @param {Object} profile 
     * @returns {Object}
     */
    calculateAnthropometrics(profile = {}) {
      const weight = Math.max(30, Math.min(250, parseFloat(profile.weightKg || profile.weight) || 65));
      const height = Math.max(100, Math.min(230, parseFloat(profile.heightCm || profile.height) || 170));
      const age = Math.max(10, Math.min(120, parseInt(profile.age, 10) || 28));
      const gender = (profile.gender === 'female') ? 'female' : 'male';
      const activity = profile.activityLevel || profile.activity || 'light';

      // 1. BMI Calculation
      const heightM = height / 100;
      const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
      
      // Klasifikasi BMI Standar Asia-Pasifik (WHO WPRO)
      let bmiCategory = 'Normal';
      let bmiRiskLevel = 'low';
      if (bmi < 18.5) {
        bmiCategory = 'Underweight (Kurang Energi Kronis)';
        bmiRiskLevel = 'warning';
      } else if (bmi <= 22.9) {
        bmiCategory = 'Normal (Ideal)';
        bmiRiskLevel = 'optimal';
      } else if (bmi <= 24.9) {
        bmiCategory = 'Kelebihan BB (Overweight Ringan)';
        bmiRiskLevel = 'caution';
      } else if (bmi <= 29.9) {
        bmiCategory = 'Obesitas Tingkat 1';
        bmiRiskLevel = 'warning';
      } else {
        bmiCategory = 'Obesitas Tingkat 2 (Morbid)';
        bmiRiskLevel = 'danger';
      }

      // 2. BMR (Mifflin-St Jeor)
      let bmr = (10 * weight) + (6.25 * height) - (5 * age);
      bmr += (gender === 'male') ? 5 : -161;

      // 3. Aktivitas Faktor
      const activityFactors = {
        'bedrest': 1.15,
        'light': 1.25,
        'therapy': 1.35,
        'active': 1.55
      };
      const actFactor = activityFactors[activity] || 1.25;
      const tdee = Math.round(bmr * actFactor);

      // 4. Target Kalori 1 Kali Makan (25% - 35% TDEE)
      const mealCalMin = Math.round(tdee * 0.25);
      const mealCalMax = Math.round(tdee * 0.35);
      const mealCalIdeal = Math.round(tdee * 0.30);

      return {
        weight,
        height,
        age,
        gender,
        bmi,
        bmiCategory,
        bmiRiskLevel,
        bmr: Math.round(bmr),
        tdee,
        mealCalMin,
        mealCalMax,
        mealCalIdeal
      };
    }

    /**
     * Hitung batas target protein per kali makan berdasarkan kondisi medis dan BB
     * @param {Object} anthro - Hasil calculateAnthropometrics
     * @param {Array<string>} diseases - Daftar penyakit aktif
     * @param {string} conditionId - Kondisi utama ('post-surgery', 'rehab', 'gym', 'wellness')
     * @returns {Object}
     */
    getProteinBudget(anthro, diseases = [], conditionId = 'post-surgery') {
      const isCKD = diseases.includes('ckd') || diseases.includes('ginjal');
      const isSurgery = conditionId === 'post-surgery' || conditionId.startsWith('post_op') || diseases.includes('post-surgery') || diseases.includes('bedah');
      const isRehab = conditionId === 'rehab' || conditionId === 'post_op_orthopedic' || diseases.includes('rehab') || diseases.includes('fraktur');
      const isGym = conditionId === 'gym' || conditionId.startsWith('gym') || diseases.includes('gym');

      let dailyMultiplierMin = 1.0;
      let dailyMultiplierMax = 1.2;
      let clinicalNote = 'Kebutuhan protein pemeliharaan normal.';

      const recProfile = (typeof NUTRIVISION_DATA !== 'undefined' && NUTRIVISION_DATA.recoveryProfiles) 
        ? NUTRIVISION_DATA.recoveryProfiles[conditionId] 
        : null;

      if (isCKD) {
        // Konsensus KDIGO: Restriksi protein ketat non-dialisis (0.6 - 0.8 g/kg BB)
        dailyMultiplierMin = 0.6;
        dailyMultiplierMax = 0.8;
        clinicalNote = 'Batasan ketat KDIGO Penyakit Ginjal Kronis (0.6-0.8g/kg BB) untuk mencegah uremia.';
      } else if (recProfile && recProfile.targetMacronutrients && recProfile.targetMacronutrients.proteinGPerKg) {
        const baseTarget = recProfile.targetMacronutrients.proteinGPerKg;
        dailyMultiplierMin = Math.max(1.2, +(baseTarget - 0.2).toFixed(1));
        dailyMultiplierMax = +(baseTarget + 0.2).toFixed(1);
        clinicalNote = `Target protokol ${recProfile.title} (${dailyMultiplierMin}-${dailyMultiplierMax}g/kg BB): ${recProfile.protocol}`;
      } else if (isSurgery) {
        // Konsensus ESPEN / ERAS: 1.5 - 2.0 g/kg BB
        dailyMultiplierMin = 1.5;
        dailyMultiplierMax = 2.0;
        clinicalNote = 'Target tinggi ESPEN Pasca-Bedah (1.5-2.0g/kg BB) untuk regenerasi kolagen luka.';
      } else if (isRehab) {
        dailyMultiplierMin = 1.4;
        dailyMultiplierMax = 1.6;
        clinicalNote = 'Target rehabilitasi muskuloskeletal & pembentukan kalus tulang (1.4-1.6g/kg BB).';
      } else if (isGym) {
        dailyMultiplierMin = 1.6;
        dailyMultiplierMax = 2.2;
        clinicalNote = 'Target hipertrofi & sintesis protein otot pasca-latihan beban (1.6-2.2g/kg BB).';
      }

      const dailyMin = Math.round(anthro.weight * dailyMultiplierMin);
      const dailyMax = Math.round(anthro.weight * dailyMultiplierMax);

      // Porsi 1 kali makan (~30% dari kuota harian)
      const mealMin = Math.round(dailyMin * 0.28);
      const mealMax = Math.round(dailyMax * 0.36);
      const mealHardCap = isCKD ? Math.round(anthro.weight * 0.35) : Math.round(anthro.weight * 0.75);

      return {
        isCKD,
        dailyMultiplierMin,
        dailyMultiplierMax,
        dailyMin,
        dailyMax,
        mealMin,
        mealMax,
        mealHardCap,
        clinicalNote
      };
    }

    /**
     * Normalisasi daftar penyakit dari profil user
     * @param {Object} profile 
     * @returns {Array<string>}
     */
    extractDiseases(profile = {}) {
      const list = new Set();
      if (profile.conditionId) list.add(profile.conditionId.toLowerCase());
      if (Array.isArray(profile.diseases)) {
        profile.diseases.forEach(d => list.add((d || '').toLowerCase().trim()));
      } else if (typeof profile.diseases === 'string') {
        profile.diseases.split(',').forEach(d => list.add((d || '').toLowerCase().trim()));
      }
      if (Array.isArray(profile.comorbidities)) {
        profile.comorbidities.forEach(d => list.add((d || '').toLowerCase().trim()));
      }
      return Array.from(list).filter(Boolean);
    }

    /**
     * Normalisasi daftar gejala dari profil user
     * @param {Object} profile 
     * @returns {Array<string>}
     */
    extractSymptoms(profile = {}) {
      const list = new Set();
      const raw = profile.symptoms || [];
      const arr = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split(',') : []);
      const map = {
        'dysphagia': 'dysphagia', 'disfagia': 'dysphagia', 'sulit-menelan': 'dysphagia', 'sulit_menelan': 'dysphagia',
        'nausea': 'nausea', 'mual': 'nausea',
        'gerd': 'gerd', 'asam-lambung': 'gerd', 'asam_lambung': 'gerd',
        'diarrhea': 'diarrhea', 'diare': 'diarrhea',
        'constipation': 'constipation', 'konstipasi': 'constipation', 'sembelit': 'constipation',
        'low_appetite': 'low_appetite', 'nafsu': 'low_appetite', 'nafsu-rendah': 'low_appetite'
      };
      arr.forEach(s => {
        const k = (s || '').toLowerCase().trim();
        if (map[k]) list.add(map[k]);
      });
      return Array.from(list);
    }

    /**
     * Normalisasi daftar pantangan & alergi (membersihkan prefix kata 'alergi', 'pantangan', dll)
     * @param {Object} profile 
     * @returns {Array<string>}
     */
    extractRestrictions(profile = {}) {
      const raw = profile.restrictions || profile.allergies || '';
      const items = Array.isArray(raw)
        ? raw
        : (typeof raw === 'string' ? raw.split(/[,;\n]/) : []);

      const cleaned = new Set();
      const prefixRegex = /^(alergi|pantangan|hindari|tidak boleh|tidak bisa|sensitif terhadap|riwayat alergi|riwayat)\s+/i;
      items.forEach(it => {
        let str = (it || '').toLowerCase().trim();
        str = str.replace(prefixRegex, '').trim();
        if (str && str !== 'tidak ada' && str !== 'none' && str !== '-' && str !== 'tidak') {
          cleaned.add(str);
        }
      });
      return Array.from(cleaned);
    }

    /**
     * Estimasi kandungan mikro & parameter khusus dari segmen makanan
     * @param {Object} scanData 
     * @returns {Object}
     */
    aggregateFoodNutrients(scanData = {}) {
      const segments = scanData.segments || [];
      let minCals = 0, maxCals = 0;
      let minProt = 0, maxProt = 0;
      let minCarbs = 0, maxCarbs = 0;
      let minFat = 0, maxFat = 0;
      let totalGrams = 0;
      const ingredientNames = [];
      const textures = [];

      segments.forEach(seg => {
        minCals += (seg.cals ? seg.cals[0] : 0);
        maxCals += (seg.cals ? seg.cals[1] : 0);
        minProt += (seg.protein ? seg.protein[0] : 0);
        maxProt += (seg.protein ? seg.protein[1] : 0);
        minCarbs += (seg.carbs ? seg.carbs[0] : 0);
        maxCarbs += (seg.carbs ? seg.carbs[1] : 0);
        minFat += (seg.fat ? seg.fat[0] : 0);
        maxFat += (seg.fat ? seg.fat[1] : 0);
        totalGrams += (seg.portionGrams || 0);

        const name = (seg.name || seg.nameEn || '').toLowerCase();
        if (name) ingredientNames.push(name);
        if (seg.texture) textures.push(seg.texture.toLowerCase());
      });

      // Jika input tunggal bukan segmen
      if (segments.length === 0) {
        minCals = maxCals = scanData.calories || 0;
        minProt = maxProt = scanData.protein || 0;
        minCarbs = maxCarbs = scanData.carbs || 0;
        minFat = maxFat = scanData.fat || 0;
        totalGrams = scanData.portionGrams || scanData.defaultPortionGrams || 150;
        if (scanData.name) ingredientNames.push(scanData.name.toLowerCase());
        if (scanData.texture) textures.push(scanData.texture.toLowerCase());
      }

      const avgCals = Math.round((minCals + maxCals) / 2);
      const avgProt = Math.round(((minProt + maxProt) / 2) * 10) / 10;
      const avgCarbs = Math.round(((minCarbs + maxCarbs) / 2) * 10) / 10;
      const avgFat = Math.round(((minFat + maxFat) / 2) * 10) / 10;

      // Estimasi Natrium (mg) berdasarkan profil bahan
      let estimatedSodiumMg = Math.round(totalGrams * 1.8); // Baseline normal
      const fullText = ingredientNames.join(' ');
      if (/asin|kornet|sosis|kecap|kaldu|terasi|gurih|bakso/.test(fullText)) {
        estimatedSodiumMg += 520;
      }
      if (/sup|kuah|tumis/.test(fullText)) {
        estimatedSodiumMg += 220;
      }

      // Estimasi Gula Bebas (g)
      let estimatedSugarG = 0;
      if (/manis|sirup|gula|dessert|kolak|boba|jus/.test(fullText)) {
        estimatedSugarG += 18;
      }

      // Deteksi Tekstur dominan
      let dominantTexture = 'soft';
      if (/bubur|puree|saring|kaldu|jus|smoothie/.test(fullText)) {
        dominantTexture = 'puree';
      } else if (/goreng|kering|krispi|keripik|bakar kering|alot/.test(fullText)) {
        dominantTexture = 'hard';
      } else if (/kukus|tim|rebus|sup|lunak/.test(fullText)) {
        dominantTexture = 'soft';
      }

      return {
        cals: [minCals, maxCals],
        avgCals,
        protein: [minProt, maxProt],
        avgProt,
        carbs: [minCarbs, maxCarbs],
        avgCarbs,
        fat: [minFat, maxFat],
        avgFat,
        totalGrams,
        ingredientNames,
        fullText,
        estimatedSodiumMg,
        estimatedSugarG,
        dominantTexture
      };
    }

    /**
     * FUNGSI UTAMA: Validasi piring makanan secara mendalam terhadap seluruh data profil user
     * @param {Object} scanData - Piring hasil scan citra atau resep makanan
     * @param {Object} userProfile - Profil lengkap pengguna (BB, TB, usia, gender, penyakit, gejala, pantangan)
     * @returns {Object} Hasil evaluasi komprehensif (status, skor, temuan per pilar, rekomendasi tindakan)
     */
    validateFood(scanData, userProfile = {}) {
      if (!scanData) {
        return {
          status: 'NO_DATA',
          safetyLevel: 'UNKNOWN',
          score: 0,
          summary: 'Belum ada data piring makanan untuk divalidasi.',
          findings: []
        };
      }

      const anthro = this.calculateAnthropometrics(userProfile);
      const diseases = this.extractDiseases(userProfile);
      const symptoms = this.extractSymptoms(userProfile);
      const restrictions = this.extractRestrictions(userProfile);
      const food = this.aggregateFoodNutrients(scanData);
      const protBudget = this.getProteinBudget(anthro, diseases, userProfile.conditionId);

      const findings = [];
      let totalPenalty = 0;
      let hasSevereDanger = false;

      // =======================================================================
      // PILAR 1: BIOMETRIK & ENERGI (BB, TB, BMI, KALORI & PROTEIN SESUAI BB)
      // =======================================================================
      const pilar1 = {
        title: 'Kesesuaian Biometrik & Beban Energi',
        icon: 'solar:user-bold-duotone',
        status: 'optimal',
        metrics: {
          weight: `${anthro.weight} kg`,
          height: `${anthro.height} cm`,
          bmi: `${anthro.bmi} (${anthro.bmiCategory})`,
          mealCalories: `${food.avgCals} kkal`,
          targetRange: `${anthro.mealCalMin} - ${anthro.mealCalMax} kkal`
        },
        items: []
      };

      // 1A. Evaluasi Kalori & Lemak vs BMI (BB & TB)
      if (anthro.bmi >= 23.0) {
        // Pasien Overweight / Obesitas (Standar Asia-Pasifik BMI >= 23)
        const isExcessiveCal = food.avgCals > (anthro.tdee * 0.33);
        const isHighFat = food.avgFat > 16 || this.db.highSaturatedFat.some(item => food.fullText.includes(item));
        if (isExcessiveCal || isHighFat) {
          pilar1.status = 'warning';
          totalPenalty += 18;
          pilar1.items.push({
            type: 'warning',
            title: 'Densitas Kalori & Lemak Tinggi untuk Profil Kelebihan BB / Obesitas',
            detail: `Porsi piring (${food.avgCals} kkal, ${food.avgFat}g lemak) melampaui batas anjuran satu kali makan (~${anthro.mealCalIdeal} kkal) untuk BMI ${anthro.bmi} (${anthro.bmiCategory}). Disarankan membatasi gorengan/minyak jenuh dan mengurangi porsi karbohidrat guna mempermudah kontrol komposisi lemak tubuh.`
          });
        } else {
          pilar1.items.push({
            type: 'optimal',
            title: 'Kalori Sesuai Target Defisit Terkontrol',
            detail: `Kalori porsi (${food.avgCals} kkal) berada dalam rentang ideal (${anthro.mealCalMin}-${anthro.mealCalMax} kkal) untuk menjaga massa otot tanpa menambah timbunan lemak.`
          });
        }
      } else if (anthro.bmi < 18.5) {
        // Pasien Underweight / Malnutrisi
        if (food.avgCals < (anthro.tdee * 0.20)) {
          pilar1.status = 'warning';
          totalPenalty += 15;
          pilar1.items.push({
            type: 'warning',
            title: 'Densitas Kalori Terlalu Rendah untuk Pasien Underweight',
            detail: `Kalori piring (${food.avgCals} kkal) berada di bawah ambang minimal pemulihan gizi. Pasien dengan BMI ${anthro.bmi} membutuhkan densitas energi yang lebih padat (target: ${anthro.mealCalIdeal} kkal) untuk regenerasi jaringan.`
          });
        } else {
          pilar1.items.push({
            type: 'optimal',
            title: 'Kecukupan Energi Sesuai Target Anabolik',
            detail: `Porsi kalori (${food.avgCals} kkal) mendukung pembentukan massa bebas lemak (LBM).`
          });
        }
      } else {
        // Normal BMI
        if (food.avgCals > (anthro.mealCalMax * 1.25)) {
          pilar1.status = 'caution';
          totalPenalty += 10;
          pilar1.items.push({
            type: 'caution',
            title: 'Porsi Kalori Sedikit Melebihi Anggaran Makan',
            detail: `Kalori (${food.avgCals} kkal) sedikit di atas target satu kali makan (${anthro.mealCalMax} kkal), disarankan menyesuaikan porsi karbohidrat.`
          });
        } else {
          pilar1.items.push({
            type: 'optimal',
            title: 'Proporsi Kalori Piring Sangat Sesuai',
            detail: `Porsi ${food.avgCals} kkal sangat pas mewakili ~30% total kebutuhan harian (${anthro.tdee} kkal).`
          });
        }
      }

      // 1B. Evaluasi Protein per kg BB
      if (protBudget.isCKD) {
        // Kasus Khusus Ginjal: Protein Tinggi Adalah BAHAYA
        if (food.avgProt > protBudget.mealHardCap) {
          pilar1.status = 'danger';
          hasSevereDanger = true;
          totalPenalty += 45;
          pilar1.items.push({
            type: 'danger',
            title: 'Kelebihan Beban Protein Ginjal (Kontraindikasi CKD)',
            detail: `Piring mengandung ${food.avgProt}g protein! Batas toleransi aman 1 kali makan untuk BB ${anthro.weight}kg dengan Penyakit Ginjal Kronis adalah ${protBudget.mealMax}g (maksimal keras ${protBudget.mealHardCap}g). Beban filtrasi glomerulus berisiko memicu lonjakan ureum darah.`
          });
        } else {
          pilar1.items.push({
            type: 'optimal',
            title: 'Kandungan Protein Terkontrol untuk Fungsi Ginjal',
            detail: `Protein ${food.avgProt}g terkontrol aman di bawah ambang batas toleransi nefropati (~${protBudget.mealMax}g per porsi).`
          });
        }
      } else {
        // Pasca-Bedah / Cedera / Normal: Protein Tinggi Sangat Baik
        if (food.avgProt < (protBudget.mealMin * 0.6)) {
          pilar1.status = (pilar1.status === 'danger') ? 'danger' : 'warning';
          totalPenalty += 14;
          pilar1.items.push({
            type: 'warning',
            title: 'Kandungan Protein di Bawah Target Penyembuhan Jaringan',
            detail: `Protein piring ini hanya ${food.avgProt}g. Untuk berat badan ${anthro.weight}kg pada fase pemulihan, target protein 1 kali makan adalah ${protBudget.mealMin}-${protBudget.mealMax}g (${protBudget.dailyMultiplierMin}g/kg BB) guna mendukung biosintesis fibroblas & kolagen.`
          });
        } else {
          pilar1.items.push({
            type: 'optimal',
            title: 'Kandungan Protein Memadai Sesuai Rasio BB',
            detail: `Asupan ${food.avgProt}g protein memenuhi kuota 1 kali makan (${protBudget.mealMin}-${protBudget.mealMax}g untuk BB ${anthro.weight}kg).`
          });
        }
      }

      // =======================================================================
      // PILAR 2: PENYAKIT & KONDISI KLINIS (DISEASE CLINICAL RULES)
      // =======================================================================
      const pilar2 = {
        title: 'Kesesuaian Kondisi Klinis & Penyakit',
        icon: 'solar:hospital-bold-duotone',
        status: 'optimal',
        diseasesEvaluated: diseases,
        items: []
      };

      // 2A. Aturan Hipertensi & Kardiovaskular
      if (diseases.includes('hipertensi') || diseases.includes('hypertension') || diseases.includes('jantung')) {
        const hasHighSodiumFood = this.db.highSodium.some(item => food.fullText.includes(item));
        if (food.estimatedSodiumMg > 650 || hasHighSodiumFood) {
          pilar2.status = 'danger';
          totalPenalty += 35;
          hasSevereDanger = true;
          pilar2.items.push({
            type: 'danger',
            disease: 'Hipertensi',
            title: 'Peringatan Natrium Tinggi (Risiko Lonjakan Tekanan Darah)',
            detail: `Estimasi natrium mencapai ~${food.estimatedSodiumMg}mg per porsi. Panduan PERKI/AHA menetapkan batas <400-500mg natrium per makan bagi penderita hipertensi untuk mencegah retensi cairan dan vasokonstriksi pembuluh darah.`
          });
        } else if (food.estimatedSodiumMg > 400) {
          pilar2.status = (pilar2.status === 'danger') ? 'danger' : 'warning';
          totalPenalty += 15;
          pilar2.items.push({
            type: 'warning',
            disease: 'Hipertensi',
            title: 'Batas Toleransi Natrium Teratas',
            detail: `Kadar natrium mendekati batas maksimal (~${food.estimatedSodiumMg}mg). Kurangi kuah asin atau bumbu penyedap tambahan.`
          });
        } else {
          pilar2.items.push({
            type: 'optimal',
            disease: 'Hipertensi',
            title: 'Rendah Natrium (Ramah Tekanan Darah)',
            detail: `Kandungan garam dan bumbu tergolong aman (<400mg natrium).`
          });
        }
      }

      // 2B. Aturan Diabetes Mellitus
      if (diseases.includes('diabetes') || diseases.includes('dm') || diseases.includes('gula')) {
        const hasHighSugarFood = this.db.highSugar.some(item => food.fullText.includes(item));
        if (hasHighSugarFood || food.estimatedSugarG > 10) {
          pilar2.status = 'danger';
          totalPenalty += 35;
          hasSevereDanger = true;
          pilar2.items.push({
            type: 'danger',
            disease: 'Diabetes Mellitus',
            title: 'Gula Sederhana Tinggi (Risiko Lonjakan Glukosa Darah Postprandial)',
            detail: `Ditemukan komponen pemanis/gula cepat serap (~${food.estimatedSugarG}g gula). Pasien diabetes wajib membatasi gula tambahan <5g per makan untuk menjaga kestabilan HbA1c dan sensitivitas insulin.`
          });
        } else if (food.avgCarbs > 60) {
          pilar2.status = (pilar2.status === 'danger') ? 'danger' : 'warning';
          totalPenalty += 18;
          pilar2.items.push({
            type: 'warning',
            disease: 'Diabetes Mellitus',
            title: 'Beban Karbohidrat Tinggi',
            detail: `Total karbohidrat (${food.avgCarbs}g) melampaui alokasi 1 kali makan (~45-50g). Kurangi porsi nasi putih atau ganti dengan karbohidrat kompleks berserat (nasi merah/oat).`
          });
        } else {
          pilar2.items.push({
            type: 'optimal',
            disease: 'Diabetes Mellitus',
            title: 'Beban Glikemik Terkontrol',
            detail: `Karbohidrat seimbang (${food.avgCarbs}g) tanpa gula sederhana berlebih.`
          });
        }
      }

      // 2C. Aturan Penyakit Ginjal Kronis (CKD)
      if (diseases.includes('ckd') || diseases.includes('ginjal')) {
        const hasHighPotassiumFood = this.db.highPotassium.some(item => food.fullText.includes(item));
        if (hasHighPotassiumFood) {
          pilar2.status = 'danger';
          totalPenalty += 30;
          pilar2.items.push({
            type: 'danger',
            disease: 'Penyakit Ginjal Kronis',
            title: 'Bahan Tinggi Kalium (Risiko Hiperkalemia)',
            detail: `Mengandung bahan tinggi kalium (seperti air kelapa/pisang). Pada penurunan LFG (Laju Filtrasi Glomerulus), kalium berlebih berisiko memicu aritmia jantung.`
          });
        }
      }

      // 2D. Aturan GERD / Asam Lambung & Gastritis
      if (diseases.includes('gerd') || diseases.includes('asam-lambung') || diseases.includes('gastritis') || symptoms.includes('gerd')) {
        const hasGerdTrigger = this.db.gerdTriggers.some(item => food.fullText.includes(item));
        const isHighFat = food.avgFat > 16 || this.db.highSaturatedFat.some(item => food.fullText.includes(item));

        if (hasGerdTrigger) {
          pilar2.status = (pilar2.status === 'danger') ? 'danger' : 'warning';
          totalPenalty += 24;
          pilar2.items.push({
            type: 'warning',
            disease: 'GERD & Gastritis',
            title: 'Mengandung Bahan Pemicu Iritasi Lambung & Refluks',
            detail: `Terdeteksi bumbu pedas, asam pekat, atau kafein yang dapat merelaksasi sfingter esofagus bawah (LES) dan memicu rasa terbakar di dada (heartburn).`
          });
        }
        if (isHighFat) {
          pilar2.status = (pilar2.status === 'danger') ? 'danger' : 'warning';
          totalPenalty += 20;
          pilar2.items.push({
            type: 'warning',
            disease: 'GERD & Gastritis',
            title: 'Lemak Jenuh Tinggi Memperlambat Pengosongan Lambung',
            detail: `Kandungan lemak (${food.avgFat}g) memperlambat motilitas lambung (gastric emptying), meningkatkan tekanan intra-lambung.`
          });
        }
        if (!hasGerdTrigger && !isHighFat) {
          pilar2.items.push({
            type: 'optimal',
            disease: 'GERD',
            title: 'Aman untuk Asam Lambung',
            detail: `Tidak mengandung iritan pedas, asam tinggi, atau gorengan berlebih.`
          });
        }
      }

      // 2E. Aturan Pasca-Operasi Bedah & Kolesistektomi (Kantung Empedu)
      if (diseases.includes('post-surgery') || diseases.includes('kolesistektomi') || diseases.includes('empedu') || userProfile.conditionId === 'post-surgery') {
        const isHighFat = food.avgFat > 15 || this.db.highSaturatedFat.some(item => food.fullText.includes(item));
        if (isHighFat) {
          pilar2.status = (pilar2.status === 'danger') ? 'danger' : 'warning';
          totalPenalty += 22;
          pilar2.items.push({
            type: 'warning',
            disease: 'Pasca-Bedah & Kolesistektomi',
            title: 'Kandungan Lemak Melebihi Toleransi Enzim Empedu',
            detail: `Lemak (${food.avgFat}g) atau minyak jenuh tinggi. Pasca-operasi (khususnya kolesistektomi/saluran cerna), pencernaan lipid terganggu dan berisiko diare steatorea serta mual.`
          });
        } else {
          pilar2.items.push({
            type: 'optimal',
            disease: 'Pasca-Bedah',
            title: 'Metode Pengolahan Rendah Minyak Jenuh',
            detail: `Pengolahan sehat (kukus/tim/rebus) mempercepat absorpsi nutrisi albumin ke jaringan luka.`
          });
        }
      }

      // 2F. Aturan Asam Urat (Gout)
      if (diseases.includes('asam-urat') || diseases.includes('gout') || diseases.includes('hiperurisemia')) {
        const hasHighPurine = this.db.highPurine.some(item => food.fullText.includes(item));
        if (hasHighPurine) {
          pilar2.status = 'danger';
          totalPenalty += 38;
          hasSevereDanger = true;
          pilar2.items.push({
            type: 'danger',
            disease: 'Asam Urat (Gout)',
            title: 'Bahan Tinggi Purin (Kontraindikasi Gout Akut)',
            detail: `Mengandung bahan tinggi purin (jeroan/emping/kaldu pekat/kerang). Berisiko langsung memicu kristalisasi monosodium urat dan serangan radang sendi gout.`
          });
        } else {
          pilar2.items.push({
            type: 'optimal',
            disease: 'Asam Urat',
            title: 'Rendah Purin',
            detail: `Bahan makanan bebas dari jeroan, ekstrak kaldu pekat, atau melinjo.`
          });
        }
      }

      // 2G. Aturan Kolesterol & Dislipidemia
      if (diseases.includes('kolesterol') || diseases.includes('dislipidemia')) {
        if (food.avgFat > 18 || this.db.highSaturatedFat.some(item => food.fullText.includes(item))) {
          pilar2.status = (pilar2.status === 'danger') ? 'danger' : 'warning';
          totalPenalty += 20;
          pilar2.items.push({
            type: 'warning',
            disease: 'Kolesterol Tinggi',
            title: 'Minyak Jenuh / Trans Fat Tinggi',
            detail: `Kandungan lemak jenuh (${food.avgFat}g) memperburuk rasio LDL dan apolipoprotein B.`
          });
        }
      }

      // Default jika tidak ada penyakit spesifik
      if (diseases.length === 0 && pilar2.items.length === 0) {
        pilar2.items.push({
          type: 'optimal',
          title: 'Pemeliharaan Gizi Seimbang',
          detail: 'Tidak ada riwayat penyakit kronis yang membatasi makronutrisi piring ini.'
        });
      }

      // =======================================================================
      // PILAR 3: GEJALA & ALERGI PRIBADI (SYMPTOMS & ALLERGIES)
      // =======================================================================
      const pilar3 = {
        title: 'Keamanan Gejala & Pantangan Pribadi',
        icon: 'solar:shield-warning-bold-duotone',
        status: 'optimal',
        symptomsEvaluated: symptoms,
        restrictionsEvaluated: restrictions,
        items: []
      };

      // 3A. Disfagia (Sulit Menelan - Physical Choking Hazard)
      if (symptoms.includes('dysphagia') || symptoms.includes('disfagia')) {
        const isHazardousTexture = food.dominantTexture === 'hard' || this.db.dysphagiaHazardTextures.some(t => food.fullText.includes(t));
        if (isHazardousTexture) {
          pilar3.status = 'danger';
          totalPenalty += 45;
          hasSevereDanger = true;
          pilar3.items.push({
            type: 'danger',
            title: 'BAHAYA ASPIRASI PARU: Tekstur Makanan Terlalu Keras / Alot',
            detail: `Makanan bertekstur keras, renyah, atau liat berisiko tinggi memicu aspirasi makanan ke saluran pernapasan pada pasien disfagia. Wajib dihaluskan sesuai konsistensi IDDSI Puree / Soft Mash.`
          });
        } else if (food.dominantTexture === 'puree') {
          pilar3.items.push({
            type: 'optimal',
            title: 'Tekstur Puree Aman Disfagia (Standar IDDSI)',
            detail: `Konsistensi lembut dan homogen mencegah bahaya tersedak dan mudah ditelan.`
          });
        } else {
          pilar3.status = (pilar3.status === 'danger') ? 'danger' : 'caution';
          totalPenalty += 10;
          pilar3.items.push({
            type: 'caution',
            title: 'Periksa Kelembutan Tekstur Makanan',
            detail: `Pastikan makanan dilumatkan atau dipotong kecil-kecil berkuah sebelum disuap.`
          });
        }
      }

      // 3B. Mual (Nausea)
      if (symptoms.includes('nausea') || symptoms.includes('mual')) {
        const isGreasy = food.avgFat > 14 || /minyak|santan|goreng/.test(food.fullText);
        if (isGreasy) {
          pilar3.status = (pilar3.status === 'danger') ? 'danger' : 'warning';
          totalPenalty += 18;
          pilar3.items.push({
            type: 'warning',
            title: 'Aroma Minyak / Lemak Berisiko Memperparah Mual',
            detail: `Makanan berminyak menunda pengosongan lambung dan merangsang pusat emesis. Utamakan sajian berkuah bening dengan aroma jahe/lemon hangat.`
          });
        } else {
          pilar3.items.push({
            type: 'optimal',
            title: 'Aroma Netral Ramah Lambung Mual',
            detail: `Makanan segar rendah minyak dapat ditoleransi dengan baik saat nafsu makan menurun.`
          });
        }
      }

      // 3C. Alergi / Pantangan Pribadi Pasien
      if (restrictions.length > 0) {
        const matchedRestrictions = [];
        restrictions.forEach(restr => {
          const cleanRestr = restr.toLowerCase().trim();
          const tokens = cleanRestr.split(/\s+/).filter(w => w.length >= 3);
          const isDirectMatch = food.fullText.includes(cleanRestr) ||
                                tokens.some(t => food.fullText.includes(t)) ||
                                food.ingredientNames.some(name => name.includes(cleanRestr) || tokens.some(t => name.includes(t)));
          if (isDirectMatch) {
            matchedRestrictions.push(restr);
          }
        });

        if (matchedRestrictions.length > 0) {
          pilar3.status = 'danger';
          totalPenalty += 50;
          hasSevereDanger = true;
          pilar3.items.push({
            type: 'danger',
            title: `KONTRAINDIKASI ALERGEN: Terdeteksi Pantangan Pasien (${matchedRestrictions.join(', ')})`,
            detail: `Piring mengandung bahan makanan yang telah dideklarasikan sebagai pantangan/alergi pribadi Anda: "${matchedRestrictions.join(', ')}". Konsumsi bahan ini berisiko memicu reaksi hipersensitivitas.`
          });
        } else {
          pilar3.items.push({
            type: 'optimal',
            title: 'Bebas dari Pantangan Pribadi',
            detail: `Tidak terdeteksi bahan yang bertentangan dengan daftar pantangan Anda (${restrictions.join(', ')}).`
          });
        }
      } else {
        pilar3.items.push({
          type: 'optimal',
          title: 'Tidak Ada Deklarasi Alergen',
          detail: 'Pasien tidak mendeklarasikan alergi atau pantangan spesifik.'
        });
      }

      // =======================================================================
      // SKOR & REKOMENDASI TINDAKAN KLINIS (RECOMMENDATION & SCORE)
      // =======================================================================
      let calculatedScore = Math.max(20, Math.min(100, Math.round(100 - totalPenalty)));
      if (hasSevereDanger && calculatedScore > 58) {
        calculatedScore = 55; // Paksa di bawah 60 jika ada kontraindikasi kritis
      }

      let safetyLevel = 'SAFE';
      let safetyBadgeText = 'AMAN & OPTIMAL';
      let safetyColor = '#15803D';
      let safetyBg = '#DCFCE7';
      let safetyBorder = '#86EFAC';
      let clinicalVerdict = 'Piring makanan ini sangat selaras dengan kebutuhan gizi biologis dan batasan klinis Anda.';

      if (hasSevereDanger || calculatedScore < 60) {
        safetyLevel = 'DANGER';
        safetyBadgeText = 'KONTRAINDIKASI / BAHAYA MEDIS';
        safetyColor = '#B91C1C';
        safetyBg = '#FEE2E2';
        safetyBorder = '#FCA5A5';
        clinicalVerdict = 'Piring makanan ini mengandung bahan atau rasio gizi yang berisiko memperparah kondisi klinis aktif Anda. Tinjau peringatan di bawah.';
      } else if (calculatedScore < 85 || pilar1.status === 'warning' || pilar2.status === 'warning' || pilar3.status === 'warning') {
        safetyLevel = 'CAUTION';
        safetyBadgeText = 'PERINGATAN / KONSUMSI TERBATAS';
        safetyColor = '#B45309';
        safetyBg = '#FEF3C7';
        safetyBorder = '#FCD34D';
        clinicalVerdict = 'Dapat dikonsumsi dengan modifikasi takaran porsi atau cara memasak sesuai saran klinis di bawah.';
      }

      // Susun Saran Modifikasi Praktis
      const practicalModifications = [];
      if (protBudget.isCKD && food.avgProt > protBudget.mealHardCap) {
        practicalModifications.push(`Kurangi porsi sumber protein (misal separuh dada ayam/daging) agar tidak melampaui ${protBudget.mealMax}g protein per makan.`);
      }
      if (food.avgFat > 14) {
        practicalModifications.push('Ganti metode penggorengan dengan pengukusan, panggang tanpa minyak jelantah, atau sup bening.');
      }
      if (food.estimatedSodiumMg > 450) {
        practicalModifications.push('Hindari menghabiskan seluruh kuah sup asin dan jangan menambah kecap/garam meja.');
      }
      if (food.avgCarbs > 55 && diseases.includes('diabetes')) {
        practicalModifications.push('Kurangi porsi nasi putih menjadi 100g (1 centong peres) dan perbanyak porsi sayur berserat tinggi.');
      }
      if (symptoms.includes('dysphagia') && food.dominantTexture !== 'puree') {
        practicalModifications.push('Lumatkan atau blender makanan dengan sedikit kaldu hangat hingga mencapai konsistensi puree lembut (IDDSI Level 4).');
      }
      if (practicalModifications.length === 0) {
        practicalModifications.push('Pertahankan komposisi ini sebagai acuan menu pemulihan harian yang optimal.');
      }

      return {
        timestamp: new Date().toISOString(),
        score: calculatedScore,
        safetyLevel,
        safetyBadgeText,
        safetyColor,
        safetyBg,
        safetyBorder,
        clinicalVerdict,
        foodNutrients: food,
        anthropometrics: anthro,
        proteinBudget: protBudget,
        userConditions: {
          diseases,
          symptoms,
          restrictions
        },
        pillars: [pilar1, pilar2, pilar3],
        practicalModifications
      };
    }
  }

  return new FoodClinicalValidationEngine();
}));
