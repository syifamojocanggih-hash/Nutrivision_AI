/**
 * ============================================================================
 * NutriVision AI — Clinical Nutrition & Food Filter AI Agent
 * Symptom-Aware Texture & Food Filter Engine with Conflict Resolution
 * ============================================================================
 */

const CLINICAL_FILTER_SYSTEM_PROMPT = `[ROLE & SYSTEM PURPOSE]
Kamu adalah Clinical Nutrition & Food Filter AI Agent yang bertugas menyaring dan merekomendasikan menu makanan berdasarkan gejala fisiologis (Symptom-Aware Texture & Food Filter).

[INPUT DATA]
Sistem akan mengirimkan array/list gejala aktif pengguna: 
Gejala Aktif: {{selected_symptoms}} 
(Contoh nilai: ["dysphagia", "nausea", "constipation", "low_appetite", "diarrhea", "gerd"])

[PRIORITY RULES & CONFLICT RESOLUTION LOGIC]
Kamu HARUS menerapkan hirarki aturan berikut secara ketat saat memilih dan memfilter makanan:

1. PRIORITY 1: KESELAMATAN FISIK (SAFETY FIRST - DYSPHAGIA)
   - Jika "dysphagia" / "sulit_menelan" AKTIF:
     * Tekstur WAJIB mengikuti standar IDDSI Puree/Soft Mash (sangat lembut, tanpa rempah kasar, tanpa bahan liat/keras).
     * Aturan ini MENGAWALKAN semua gejala lain. Jika "constipation" juga aktif, serat HARUS diberikan dalam bentuk puree halus (contoh: puree pepaya/oatmeal halus), BUKAN buah utuh atau sayur kasar.

2. PRIORITY 2: GANGGUAN PENCERNAAN & IRITASI (GI TRACT PROTECTION)
   - Jika "nausea" / "mual" AKTIF:
     * Hindari makanan berbau tajam, tinggi lemak, atau terlalu panas. Utamakan aroma netral/dingin.
   - Jika "gerd" / "asam_lambung" AKTIF:
     * Hindari makanan asam (citrus, tomat), pedas, kafein, dan gorengan.
   - Jika "diarrhea" / "diare" AKTIF:
     * Terapkan diet rendah serat kasar (Low Residue). Hindari susu/laktosa dan pemanis buatan.

3. PRIORITY 3: DENSITAS NUTRISI & PORSI
   - Jika "low_appetite" / "nafsu_makan_rendah" AKTIF:
     * Berikan rekomendasi makanan padat gizi (high calorie-density) dengan porsi kecil tapi sering, namun tetap mematuhi batasan dari Priority 1 & 2.

[OUTPUT FORMAT REQUIREMENT]
Kembalikan respons dalam format JSON valid berikut:

{
  "active_filters": [daftar gejala yang diproses],
  "safety_level": "High/Medium/Standard",
  "texture_requirement": "Deskripsi singkat tekstur wajib (misal: Puree Halus / Soft / Normal)",
  "restricted_ingredients": ["bahan/tekstur yang WAJIB dihindari"],
  "recommended_menu": [
    {
      "name": "Nama Makanan",
      "texture_category": "Puree/Soft/Bland",
      "reason": "Penjelasan rinci mengapa menu ini cocok untuk kombinasi gejala aktif"
    }
  ]
}`;

class ClinicalNutritionFilterAgent {
  constructor() {
    this.system_message = CLINICAL_FILTER_SYSTEM_PROMPT;
    this.instructions = CLINICAL_FILTER_SYSTEM_PROMPT;
  }

  /**
   * Normalisasi input gejala dari UI front-end ke format standar agent
   * @param {Array<string>} rawSymptoms 
   * @returns {Array<string>}
   */
  normalizeSymptoms(rawSymptoms = []) {
    const map = {
      'dysphagia': 'dysphagia',
      'disfagia': 'dysphagia',
      'sulit-menelan': 'dysphagia',
      'sulit_menelan': 'dysphagia',
      'nausea': 'nausea',
      'mual': 'nausea',
      'gerd': 'gerd',
      'asam-lambung': 'gerd',
      'asam_lambung': 'gerd',
      'diarrhea': 'diarrhea',
      'diare': 'diarrhea',
      'constipation': 'constipation',
      'sembelit': 'constipation',
      'konstipasi': 'constipation',
      'low_appetite': 'low_appetite',
      'nafsu-rendah': 'low_appetite',
      'nafsu_rendah': 'low_appetite',
      'nafsu': 'low_appetite',
      'nafsu_makan_rendah': 'low_appetite'
    };

    const set = new Set();
    rawSymptoms.forEach(s => {
      const key = (s || '').toLowerCase().trim();
      if (map[key]) {
        set.add(map[key]);
      }
    });
    return Array.from(set);
  }

  /**
   * Menghasilkan prompt lengkap dengan menyuntikkan {{selected_symptoms}}
   * @param {Array<string>} selectedSymptoms 
   * @returns {string}
   */
  getSystemPrompt(selectedSymptoms = []) {
    const normalized = this.normalizeSymptoms(selectedSymptoms);
    const symptomsJson = JSON.stringify(normalized);
    return this.system_message.replace('{{selected_symptoms}}', symptomsJson);
  }

  /**
   * Mengeksekusi logika hirarki keselamatan dan resolusi konflik
   * @param {Array<string>} rawSymptoms 
   * @returns {Object} JSON Response sesuai OUTPUT FORMAT REQUIREMENT
   */
  process(rawSymptoms = []) {
    const activeFilters = this.normalizeSymptoms(rawSymptoms);

    // Kasus 0: Tanpa gejala aktif
    if (activeFilters.length === 0) {
      return {
        active_filters: [],
        safety_level: "Standard",
        texture_requirement: "Normal Seimbang (Tekstur Bebas Sesuai Selera)",
        restricted_ingredients: [],
        recommended_menu: [
          {
            name: "Dada Ayam Panggang Herbal & Nasi Merah",
            texture_category: "Normal",
            reason: "Tidak ada keluhan klinis aktif; gizi seimbang untuk pemeliharaan masa otot dan energi harian."
          },
          {
            name: "Sup Daging Sapi Bening & Sayur Bayam",
            texture_category: "Normal",
            reason: "Protein heme, zat besi, dan vitamin C untuk mendukung daya tahan tubuh harian."
          }
        ],
        raw_prompt: this.getSystemPrompt(activeFilters)
      };
    }

    const hasDysphagia = activeFilters.includes('dysphagia');
    const hasNausea = activeFilters.includes('nausea');
    const hasGerd = activeFilters.includes('gerd');
    const hasDiarrhea = activeFilters.includes('diarrhea');
    const hasConstipation = activeFilters.includes('constipation');
    const hasLowAppetite = activeFilters.includes('low_appetite');

    let safetyLevel = "Standard";
    let textureRequirement = "Normal / Soft";
    const restrictedIngredients = new Set();
    const recommendedMenu = [];

    // =========================================================================
    // 1. PRIORITY 1: KESELAMATAN FISIK (SAFETY FIRST - DYSPHAGIA)
    // =========================================================================
    if (hasDysphagia) {
      safetyLevel = "High";
      textureRequirement = "Standar IDDSI Puree / Soft Mash (Sangat Lembut, Bebas Rempah Kasar & Liat)";
      
      restrictedIngredients.add("Tekstur liat / daging berserat keras");
      restrictedIngredients.add("Bahan keras, butiran kasar, biji-bijian utuh");
      restrictedIngredients.add("Rempah kasar / utuh (merica butir, potongan serai keras)");
      restrictedIngredients.add("Keripik / gorengan renyah tajam (risiko aspirasi paru)");

      // Conflict Resolution: Dysphagia vs Constipation
      if (hasConstipation) {
        restrictedIngredients.add("Sayur berserat kasar utuh / lalapan mentah");
        restrictedIngredients.add("Buah berkulit keras tanpa dilumatkan");
      }
    }

    // =========================================================================
    // 2. PRIORITY 2: GANGGUAN PENCERNAAN & IRITASI (GI TRACT PROTECTION)
    // =========================================================================
    if (hasNausea) {
      if (safetyLevel !== "High") safetyLevel = "Medium";
      restrictedIngredients.add("Makanan berbau tajam / menyengat (bawang berlebih, terasi)");
      restrictedIngredients.add("Tinggi lemak / minyak jenuh / santan kental");
      restrictedIngredients.add("Makanan disajikan terlalu panas (disarankan suhu ruang / dingin)");
    }

    if (hasGerd) {
      if (safetyLevel !== "High") safetyLevel = "Medium";
      restrictedIngredients.add("Makanan asam (citrus, tomat, nanas, cuka)");
      restrictedIngredients.add("Makanan pedas / cabai / lada tajam");
      restrictedIngredients.add("Kafein (kopi pekat, teh hitam pekat)");
      restrictedIngredients.add("Gorengan / minyak jelantah berulang");
    }

    if (hasDiarrhea) {
      if (safetyLevel !== "High") safetyLevel = "Medium";
      restrictedIngredients.add("Serat kasar tidak larut (diet Low Residue)");
      restrictedIngredients.add("Susu hewani & produk tinggi laktosa");
      restrictedIngredients.add("Pemanis buatan (sorbitol, xylitol, sukralosa)");
    }

    // =========================================================================
    // 3. PRIORITY 3: DENSITAS NUTRISI & PORSI
    // =========================================================================
    if (hasLowAppetite && safetyLevel === "Standard") {
      safetyLevel = "Medium";
    }

    // =========================================================================
    // MENU RECOMMENDATION SYNTHESIS (Strictly respecting Priorities 1, 2, 3)
    // =========================================================================
    if (hasDysphagia) {
      // Disfagia AKTIF (IDDSI Puree/Soft Mash)
      if (hasConstipation) {
        recommendedMenu.push({
          name: "Puree Pepaya Matang Halus IDDSI 4",
          texture_category: "Puree",
          reason: "[Resolusi Konflik P1 vs P2] Mengatasi konstipasi dengan serat larut pektin, namun disajikan dalam bentuk puree halus bebas biji/serat kasar agar aman 100% dari risiko aspirasi disfagia."
        });
        recommendedMenu.push({
          name: "Bubur Saring Oatmeal Kaldu Labu Kuning",
          texture_category: "Soft Mash",
          reason: "Beta-glukan larut air melancarkan motilitas usus tanpa mengorbankan keamanan menelan pasien."
        });
      }

      if (hasNausea) {
        recommendedMenu.push({
          name: "Bubur Saring Ikan Gabus Suhu Ruang",
          texture_category: "Puree",
          reason: "Tekstur lumat IDDSI level 4, disajikan pada suhu ruang tanpa aroma uap panas tajam untuk meredam refleks mual. Albumin mempercepat granulasi jaringan."
        });
      } else if (!hasConstipation) {
        recommendedMenu.push({
          name: "Bubur Saring Ikan Gabus & Kaldu Wortel",
          texture_category: "Puree",
          reason: "Tekstur puree halus sesuai standar IDDSI, kaya albumin dan asam amino esensial penyembuh luka bedah."
        });
      }

      if (hasLowAppetite) {
        recommendedMenu.push({
          name: "Puree Alpukat Telur Kukus Padat Kalori",
          texture_category: "Puree",
          reason: "Densitas kalori dan protein tinggi dalam porsi kecil (small frequent), tekstur lumat lembut aman ditelan tanpa perlu tenaga kunyah."
        });
      } else {
        recommendedMenu.push({
          name: "Sup Tahu Sutra Halus Kaldu Bening",
          texture_category: "Puree/Soft",
          reason: "Protein nabati halus lembut, non-iritatif pada saluran cerna dan kerongkongan."
        });
      }
    } else {
      // Tanpa Disfagia: Prioritas 2 (GI Tract) & 3 (Appetite)
      if (hasNausea && hasGerd) {
        recommendedMenu.push({
          name: "Nasi Tim Kaldu Ayam Bening Wortel Rebus",
          texture_category: "Soft",
          reason: "Tekstur lembut ramah lambung, pH netral tanpa asam citrus/tomat, aroma lembut tidak memicu rasa mual."
        });
        recommendedMenu.push({
          name: "Sup Tahu Sutra Labu Siam Bening",
          texture_category: "Bland",
          reason: "Rendah lemak, tidak memicu refluks asam lambung, serta hidrasi elektrolit seimbang."
        });
      } else if (hasGerd) {
        recommendedMenu.push({
          name: "Kentang Kukus Tumbuk & Fillet Dada Ayam Tim",
          texture_category: "Soft",
          reason: "Bebas asam, tanpa cabai, rendah lemak jenuh sehingga mencegah relaksasi sfingter esofagus bawah."
        });
        recommendedMenu.push({
          name: "Sayur Bening Bayam & Jagung Manis Pipil Lembut",
          texture_category: "Soft",
          reason: "Kuah alkali alami menetralkan asam lambung, sumber mikronutrien zat besi."
        });
      } else if (hasNausea) {
        recommendedMenu.push({
          name: "Bubur Beras Putih Ayam Suwir Dingin/Suhu Ruang",
          texture_category: "Soft",
          reason: "Disajikan pada suhu ruang dengan aroma netral untuk menekan hiperaktivitas pusat mual di otak."
        });
        recommendedMenu.push({
          name: "Puding Kacang Hijau Santan Encer Dingin",
          texture_category: "Soft",
          reason: "Aroma segar tidak menyengat, sumber vitamin B kompleks peredam rasa mual."
        });
      } else if (hasDiarrhea) {
        recommendedMenu.push({
          name: "Bubur Beras Putih Dada Ayam Rebus (Low Residue)",
          texture_category: "Bland",
          reason: "Diet rendah residu meminimalkan beban kolon, bebas laktosa untuk mencegah fermentasi gas diare."
        });
        recommendedMenu.push({
          name: "Pisang Kepok Kukus Halus",
          texture_category: "Soft",
          reason: "Kaya kalium pengganti elektrolit yang hilang dan serat pektin pemadat feses."
        });
      } else if (hasConstipation) {
        recommendedMenu.push({
          name: "Sayur Bayam Kuah Bening & Tempe Panggang",
          texture_category: "Normal",
          reason: "Serat selulosa alami dan probiotik tempe memperlancar peristaltik usus besar."
        });
        recommendedMenu.push({
          name: "Potongan Buah Pepaya Segar & Jeruk Manis",
          texture_category: "Normal",
          reason: "Enzim papain dan serat air tinggi melunakkan masa feses."
        });
      }

      if (hasLowAppetite && recommendedMenu.length < 3) {
        recommendedMenu.push({
          name: "Tim Telur Daging Cincang Lembut Padat Nutrisi",
          texture_category: "Soft",
          reason: "Kalori dan protein terkonsentrasi dalam porsi saji kecil, mudah dihabiskan saat nafsu makan menurun."
        });
      }
    }

    // Default fallback jika kombinasi khusus
    if (recommendedMenu.length === 0) {
      recommendedMenu.push({
        name: "Sup Wortel Kentang Kaldu Bening Ayam",
        texture_category: hasDysphagia ? "Puree" : "Soft",
        reason: "Menu pemulihan netral yang aman untuk semua spektrum keluhan gastrointestinal."
      });
    }

    return {
      active_filters: activeFilters,
      safety_level: safetyLevel,
      texture_requirement: textureRequirement,
      restricted_ingredients: Array.from(restrictedIngredients),
      recommended_menu: recommendedMenu,
      raw_prompt: this.getSystemPrompt(activeFilters)
    };
  }
}

// Instance global yang siap digunakan di frontend dan backend
const clinicalNutritionFilterAgent = new ClinicalNutritionFilterAgent();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CLINICAL_FILTER_SYSTEM_PROMPT,
    ClinicalNutritionFilterAgent,
    clinicalNutritionFilterAgent
  };
}
