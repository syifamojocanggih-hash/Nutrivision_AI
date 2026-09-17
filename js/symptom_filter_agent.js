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
   * Mengecek apakah bahan tertentu masuk dalam daftar pantangan aktif
   * @param {string} ingredient 
   * @param {Array<string>} customList 
   * @returns {boolean}
   */
  isIngredientRestricted(ingredient, customList = []) {
    if (!customList || customList.length === 0) return false;
    const ing = (ingredient || '').toLowerCase().trim();
    if (!ing) return false;
    return customList.some(r => {
      const clean = (r || '').toLowerCase().trim();
      if (!clean) return false;
      return clean.includes(ing) || ing.includes(clean);
    });
  }

  /**
   * Mengecek apakah makanan melanggar salah satu pantangan aktif
   * @param {Object} meal 
   * @param {Array<string>} customList 
   * @returns {boolean}
   */
  isMealRestricted(meal, customList = []) {
    if (!customList || customList.length === 0) return false;

    // Bersihkan frasa negatif seperti "tanpa pepaya" atau "bebas telur" agar tidak memicu false-positive
    const cleanedReason = (meal.reason || '')
      .replace(/\b(tanpa|bebas)\s+[\w\s]+/gi, '');
    const cleanedReasonEn = (meal.reasonEn || '')
      .replace(/\b(without|free\s+from|no)\s+[\w\s]+/gi, '');

    const text = [
      meal.name || '',
      meal.nameEn || '',
      cleanedReason,
      cleanedReasonEn,
      meal.nutrients || '',
      meal.nutrientsEn || ''
    ].join(' ').toLowerCase();

    for (const rawRestr of customList) {
      const restr = (rawRestr || '').toLowerCase().trim();
      if (!restr || restr.length < 2) continue;

      if (text.includes(restr)) return true;

      // Synonym & translation mappings
      if (restr.includes('pepaya') || restr.includes('papaya')) {
        if (text.includes('pepaya') || text.includes('papaya')) return true;
      }
      if (restr.includes('udang') || restr.includes('seafood')) {
        if (text.includes('udang') || text.includes('shrimp') || text.includes('prawn') || text.includes('seafood') || text.includes('kepiting') || text.includes('cumi')) return true;
      }
      if (restr.includes('telur')) {
        if (text.includes('telur') || text.includes('egg')) return true;
      }
      if (restr.includes('susu') || restr.includes('laktosa')) {
        if (text.includes('susu') || text.includes('milk') || text.includes('keju') || text.includes('cheese') || text.includes('yogurt') || text.includes('laktosa')) return true;
      }
      if (restr.includes('pedas') || restr.includes('cabai')) {
        if (text.includes('pedas') || text.includes('spicy') || text.includes('cabai') || text.includes('chili') || text.includes('sambal')) return true;
      }
      if (restr.includes('gorengan') || restr.includes('minyak')) {
        if (text.includes('goreng') || text.includes('fried') || text.includes('crispy')) return true;
      }
      if (restr.includes('santan')) {
        if (text.includes('santan') || text.includes('coconut milk')) return true;
      }
      if (restr.includes('gluten') || restr.includes('terigu')) {
        if (text.includes('terigu') || text.includes('wheat') || text.includes('gluten') || text.includes('roti') || text.includes('mie')) return true;
      }
      if (restr.includes('kacang')) {
        if (text.includes('kacang') || text.includes('peanut')) return true;
      }
      if (restr.includes('kafein') || restr.includes('kopi')) {
        if (text.includes('kopi') || text.includes('coffee') || text.includes('kafein') || text.includes('teh')) return true;
      }
      if (restr.includes('ikan')) {
        if (text.includes('ikan') || text.includes('fish') || text.includes('gabus') || text.includes('salmon') || text.includes('tuna')) return true;
      }
      if (restr.includes('ayam')) {
        if (text.includes('ayam') || text.includes('chicken')) return true;
      }
      if (restr.includes('daging') || restr.includes('sapi')) {
        if (text.includes('daging') || text.includes('beef') || text.includes('sapi')) return true;
      }

      const tokens = restr.split(/\s+/).filter(t => t.length >= 3);
      if (tokens.length > 0 && tokens.some(t => text.includes(t))) {
        return true;
      }
    }
    return false;
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
   * @param {Array<string>|string} customRestrictions 
   * @returns {Object} JSON Response sesuai OUTPUT FORMAT REQUIREMENT
   */
  process(rawSymptoms = [], customRestrictions = []) {
    const activeFilters = this.normalizeSymptoms(rawSymptoms);
    const customList = Array.isArray(customRestrictions)
      ? customRestrictions.map(s => (s || '').trim()).filter(Boolean)
      : (typeof customRestrictions === 'string'
        ? customRestrictions.split(',').map(s => (s || '').trim()).filter(Boolean)
        : []);

    // Kasus 0: Tanpa gejala aktif
    if (activeFilters.length === 0) {
      return {
        active_filters: [],
        safety_level: "Standard",
        texture_requirement: "Normal Seimbang (Tekstur Bebas Sesuai Selera)",
        restricted_ingredients: customList,
        custom_restrictions: customList,
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

    // Tambahkan pantangan kustom personal dari pasien
    customList.forEach(item => {
      restrictedIngredients.add(item);
    });

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
        if (this.isIngredientRestricted('pepaya', customList) || this.isIngredientRestricted('papaya', customList)) {
          recommendedMenu.push({
            name: "Puree Buah Naga Merah & Pir Kukus Halus",
            nameEn: "Smooth Steamed Pear & Red Dragonfruit Puree",
            texture_category: "Puree",
            texture_category_en: "Puree",
            nutrients: "• 140 kkal • 2.4g Serat Larut",
            nutrientsEn: "• 140 kcal • 2.4g Soluble Fiber",
            reason: "Kaya serat pektin larut air dari buah naga dan pir kukus untuk melunakkan feses dan melancarkan motilitas usus.",
            reasonEn: "Rich in soluble pectin fiber from steamed pear and dragonfruit to soften stools and support bowel motility."
          });
        } else {
          recommendedMenu.push({
            name: "Puree Pepaya Matang Halus",
            nameEn: "Smooth Ripe Papaya Puree",
            texture_category: "Puree",
            texture_category_en: "Puree",
            nutrients: "• 140 kkal • 2.1g Serat Larut",
            nutrientsEn: "• 140 kcal • 2.1g Soluble Fiber",
            reason: "Membantu peristaltik usus dengan pektin alami tanpa menimbulkan residu faring.",
            reasonEn: "Supports bowel peristalsis with natural pectin without leaving pharyngeal residue."
          });
        }
        recommendedMenu.push({
          name: "Bubur Saring Oatmeal Kaldu Labu",
          nameEn: "Strained Oatmeal Pumpkin Broth",
          texture_category: "Soft Mash",
          texture_category_en: "Soft Mash",
          nutrients: "• 185 kkal • 4.8g Protein",
          nutrientsEn: "• 185 kcal • 4.8g Protein",
          reason: "Kombinasi beta-glukan terlarut lembut untuk saluran cerna tanpa memicu refluks lambung.",
          reasonEn: "Gentle dissolved beta-glucan combination for digestive tract without triggering acid reflux."
        });
      }

      if (hasNausea) {
        if (this.isIngredientRestricted('ikan', customList) || this.isIngredientRestricted('seafood', customList) || this.isIngredientRestricted('gabus', customList)) {
          recommendedMenu.push({
            name: "Bubur Saring Tahu Sutra & Kaldu Sayur",
            nameEn: "Strained Silken Tofu & Vegetable Broth Porridge",
            texture_category: "Puree",
            texture_category_en: "Puree",
            nutrients: "• 195 kkal • 10.5g Protein",
            nutrientsEn: "• 195 kcal • 10.5g Protein",
            reason: "Protein nabati murni ramah lambung tanpa memicu mual, aman bagi alergi ikan/seafood.",
            reasonEn: "Pure plant protein gentle on the stomach without nausea triggers, safe for fish/seafood allergies."
          });
        } else {
          recommendedMenu.push({
            name: "Bubur Saring Ikan Gabus",
            nameEn: "Strained Snakehead Fish Porridge",
            texture_category: "Puree",
            texture_category_en: "Puree",
            nutrients: "• 210 kkal • 14.2g Albumin",
            nutrientsEn: "• 210 kcal • 14.2g Albumin",
            reason: "Kaya albumin untuk regenerasi jaringan pasca bedah, disajikan netral aroma peredam mual.",
            reasonEn: "Rich in albumin for post-surgical tissue repair, served with neutral aroma to alleviate nausea."
          });
        }
      } else if (!hasConstipation) {
        if (this.isIngredientRestricted('ikan', customList) || this.isIngredientRestricted('seafood', customList) || this.isIngredientRestricted('gabus', customList)) {
          recommendedMenu.push({
            name: "Bubur Saring Tahu Sutra & Kaldu Sayur",
            nameEn: "Strained Silken Tofu & Vegetable Broth Porridge",
            texture_category: "Puree",
            texture_category_en: "Puree",
            nutrients: "• 195 kkal • 10.5g Protein",
            nutrientsEn: "• 195 kcal • 10.5g Protein",
            reason: "Tekstur puree halus bebas alergen ikan, kaya asam amino nabati untuk penyembuhan luka.",
            reasonEn: "Smooth puree texture free from fish allergens, rich in plant amino acids for wound healing."
          });
        } else {
          recommendedMenu.push({
            name: "Bubur Saring Ikan Gabus",
            nameEn: "Strained Snakehead Fish Porridge",
            texture_category: "Puree",
            texture_category_en: "Puree",
            nutrients: "• 210 kkal • 14.2g Albumin",
            nutrientsEn: "• 210 kcal • 14.2g Albumin",
            reason: "Tekstur puree halus sesuai standar IDDSI, kaya albumin dan asam amino esensial penyembuh luka bedah.",
            reasonEn: "Smooth puree texture meeting IDDSI standards, rich in albumin and essential amino acids for surgical wound healing."
          });
        }
      }

      if (this.isIngredientRestricted('telur', customList) || this.isIngredientRestricted('egg', customList)) {
        recommendedMenu.push({
          name: "Puree Alpukat & Labu Siam Halus",
          nameEn: "Steamed Avocado & Chayote Puree",
          texture_category: "Puree",
          texture_category_en: "Puree",
          nutrients: "• 220 kkal • 5.2g Protein",
          nutrientsEn: "• 220 kcal • 5.2g Protein",
          reason: "Densitas kalori sehat dari lemak nabati tak jenuh, bebas telur dan aman dari risiko aspirasi.",
          reasonEn: "Healthy caloric density from unsaturated plant fats, egg-free and safe from aspiration."
        });
      } else {
        recommendedMenu.push({
          name: "Puree Alpukat Telur Kukus",
          nameEn: "Steamed Egg & Avocado Puree",
          texture_category: "Puree",
          texture_category_en: "Puree",
          nutrients: "• 260 kkal • 9.5g Protein",
          nutrientsEn: "• 260 kcal • 9.5g Protein",
          reason: "Densitas kalori padat volume ringkas, mudah ditelan mulus tanpa resistensi orofaring.",
          reasonEn: "Compact caloric density in small volume, easily swallowed without oropharyngeal resistance."
        });
      }
    } else {
      // Tanpa Disfagia: Prioritas 2 (GI Tract) & 3 (Appetite)
      if (hasNausea && hasGerd) {
        recommendedMenu.push({
          name: "Nasi Tim Kaldu Ayam Bening Wortel Rebus",
          nameEn: "Steamed Rice in Clear Chicken Broth & Boiled Carrots",
          texture_category: "Soft",
          texture_category_en: "Soft",
          reason: "Tekstur lembut ramah lambung, pH netral tanpa asam citrus/tomat, aroma lembut tidak memicu rasa mual.",
          reasonEn: "Gentle stomach-friendly texture, neutral pH without citrus/tomato acidity, mild aroma preventing nausea."
        });
        recommendedMenu.push({
          name: "Sup Tahu Sutra Labu Siam Bening",
          nameEn: "Clear Silken Tofu & Chayote Squash Soup",
          texture_category: "Bland",
          texture_category_en: "Bland",
          reason: "Rendah lemak, tidak memicu refluks asam lambung, serta hidrasi elektrolit seimbang.",
          reasonEn: "Low in fat, prevents acid reflux, and delivers balanced electrolyte hydration."
        });
      } else if (hasGerd) {
        recommendedMenu.push({
          name: "Kentang Kukus Tumbuk & Fillet Dada Ayam Tim",
          nameEn: "Mashed Steamed Potatoes & Steamed Chicken Breast Fillet",
          texture_category: "Soft",
          texture_category_en: "Soft",
          reason: "Bebas asam, tanpa cabai, rendah lemak jenuh sehingga mencegah relaksasi sfingter esofagus bawah.",
          reasonEn: "Acid-free, no chili, low saturated fat preventing lower esophageal sphincter relaxation."
        });
        recommendedMenu.push({
          name: "Sayur Bening Bayam & Jagung Manis Pipil Lembut",
          nameEn: "Clear Spinach & Sweet Corn Soup",
          texture_category: "Soft",
          texture_category_en: "Soft",
          reason: "Kuah alkali alami menetralkan asam lambung, sumber mikronutrien zat besi.",
          reasonEn: "Naturally alkaline broth neutralizing stomach acid, source of dietary iron."
        });
      } else if (hasNausea) {
        recommendedMenu.push({
          name: "Bubur Beras Putih Ayam Suwir Dingin/Suhu Ruang",
          nameEn: "Room-Temperature White Rice Porridge with Shredded Chicken",
          texture_category: "Soft",
          texture_category_en: "Soft",
          reason: "Disajikan pada suhu ruang dengan aroma netral untuk menekan hiperaktivitas pusat mual di otak.",
          reasonEn: "Served at room temperature with neutral aroma to suppress nausea trigger centers."
        });
        recommendedMenu.push({
          name: "Puding Kacang Hijau Santan Encer Dingin",
          nameEn: "Chilled Mung Bean Pudding with Light Coconut Milk",
          texture_category: "Soft",
          texture_category_en: "Soft",
          reason: "Aroma segar tidak menyengat, sumber vitamin B kompleks peredam rasa mual.",
          reasonEn: "Refreshing gentle aroma, rich in vitamin B-complex to alleviate nausea."
        });
      } else if (hasDiarrhea) {
        recommendedMenu.push({
          name: "Bubur Beras Putih Dada Ayam Rebus (Low Residue)",
          nameEn: "White Rice Porridge with Boiled Chicken Breast (Low Residue)",
          texture_category: "Bland",
          texture_category_en: "Bland",
          reason: "Diet rendah residu meminimalkan beban kolon, bebas laktosa untuk mencegah fermentasi gas diare.",
          reasonEn: "Low residue diet minimizes colon workload, lactose-free to avoid gaseous fermentation."
        });
        recommendedMenu.push({
          name: "Pisang Kepok Kukus Halus",
          nameEn: "Steamed Kepok Banana Mash",
          texture_category: "Soft",
          texture_category_en: "Soft",
          reason: "Kaya kalium pengganti elektrolit yang hilang dan serat pektin pemadat feses.",
          reasonEn: "Rich in potassium to replenish lost electrolytes and pectin fiber to firm stools."
        });
      } else if (hasConstipation) {
        recommendedMenu.push({
          name: "Sayur Bayam Kuah Bening & Tempe Panggang",
          nameEn: "Clear Spinach Soup & Baked Tempeh",
          texture_category: "Normal",
          texture_category_en: "Normal",
          reason: "Serat selulosa alami dan probiotik tempe memperlancar peristaltik usus besar.",
          reasonEn: "Natural cellulose fiber and tempeh probiotics support healthy large intestine peristalsis."
        });
        if (this.isIngredientRestricted('pepaya', customList) || this.isIngredientRestricted('papaya', customList)) {
          recommendedMenu.push({
            name: "Potongan Buah Naga Merah & Pir Segar",
            nameEn: "Fresh Red Dragonfruit & Pear Slices",
            texture_category: "Normal",
            texture_category_en: "Normal",
            reason: "Kandungan air dan serat pektin tinggi melunakkan masa feses dan mendukung motilitas usus alami.",
            reasonEn: "High water and pectin fiber naturally soften stool consistency and support bowel motility."
          });
        } else {
          recommendedMenu.push({
            name: "Potongan Buah Pepaya Segar & Jeruk Manis",
            nameEn: "Fresh Papaya Slices & Sweet Orange",
            texture_category: "Normal",
            texture_category_en: "Normal",
            reason: "Enzim papain dan serat air tinggi melunakkan masa feses.",
            reasonEn: "Papain enzymes and high water fiber soften stool consistency."
          });
        }
      }

      if (hasLowAppetite && recommendedMenu.length < 3) {
        recommendedMenu.push({
          name: "Tim Telur Daging Cincang Lembut Padat Nutrisi",
          nameEn: "Nutrient-Dense Soft Steamed Egg with Minced Meat",
          texture_category: "Soft",
          texture_category_en: "Soft",
          reason: "Kalori dan protein terkonsentrasi dalam porsi saji kecil, mudah dihabiskan saat nafsu makan menurun.",
          reasonEn: "Concentrated calories and protein in a small serving size, easy to finish when appetite is low."
        });
      }
    }

    // Filter ketat: keluarkan menu apa pun yang melanggar pantangan aktif pasien
    const finalRecommendedMenu = recommendedMenu.filter(meal => !this.isMealRestricted(meal, customList));

    // Default fallback jika seluruh kombinasi menu terfilter pantangan
    if (finalRecommendedMenu.length === 0) {
      finalRecommendedMenu.push({
        name: "Bubur Saring Kaldu Sayur Bening Hipoalergenik",
        nameEn: "Hypoallergenic Clear Vegetable Broth Puree",
        texture_category: hasDysphagia ? "Puree" : "Soft",
        texture_category_en: hasDysphagia ? "Puree" : "Soft",
        nutrients: "• 150 kkal • Bebas Pantangan",
        nutrientsEn: "• 150 kcal • Allergen Free",
        reason: "Menu pemulihan netral bebas alergen yang disesuaikan secara ketat dengan pantangan Anda.",
        reasonEn: "Neutral allergen-free recovery dish strictly tailored to your dietary restrictions."
      });
    }

    let textureTitle = "Standar Keamanan IDDSI Level 4 (Puree / Soft Mash)";
    let textureTitleEn = "IDDSI Level 4 Safety Standard (Puree / Soft Mash)";
    let textureSub = "Homogen, aman risiko aspirasi, disajikan pada suhu ruang nyaman.";
    let textureSubEn = "Homogeneous, safe from aspiration risk, served at comfortable room temperature.";
    let restrictedSummary = "Hindari serat liat kasar, rempah biji utuh, santan pekat, dan sajian terlalu panas.";
    let restrictedSummaryEn = "Avoid coarse fibrous foods, whole seed spices, thick coconut milk, and scalding hot meals.";

    if (!hasDysphagia) {
      if (hasGerd || hasNausea || hasDiarrhea) {
        textureTitle = "Standar Keamanan IDDSI Level 6 (Soft & Bite-Sized)";
        textureTitleEn = "IDDSI Level 6 Safety Standard (Soft & Bite-Sized)";
        textureSub = "Tekstur lunak mudah cerna, ramah mukosa lambung dan motilitas usus.";
        textureSubEn = "Soft easy-to-digest texture, gentle on gastric mucosa and intestinal motility.";
        restrictedSummary = "Hindari asam tajam, cabai pedas, santan kental, serta gorengan.";
        restrictedSummaryEn = "Avoid sharp acids, spicy chili, thick coconut milk, and deep-fried dishes.";
      } else {
        textureTitle = "Standar Keamanan IDDSI Level 7 (Regular)";
        textureTitleEn = "IDDSI Level 7 Safety Standard (Regular)";
        textureSub = "Tekstur bebas gizi seimbang sesuai toleransi pemulihan klinis.";
        textureSubEn = "Balanced texture according to clinical recovery tolerance.";
        restrictedSummary = "Bebas bahan iritatif akut; utamakan hidrasi dan protein teratur.";
        restrictedSummaryEn = "Free from acute irritants; prioritize regular hydration and protein.";
      }
    }

    return {
      active_filters: activeFilters,
      safety_level: safetyLevel,
      texture_requirement: textureRequirement,
      texture_title: textureTitle,
      texture_title_en: textureTitleEn,
      texture_sub: textureSub,
      texture_sub_en: textureSubEn,
      restricted_summary: restrictedSummary,
      restricted_summary_en: restrictedSummaryEn,
      restricted_ingredients: Array.from(restrictedIngredients),
      recommended_menu: finalRecommendedMenu,
      raw_prompt: this.getSystemPrompt(activeFilters)
    };
  }
}

// Instance global yang siap digunakan di frontend dan backend
const clinicalNutritionFilterAgent = new ClinicalNutritionFilterAgent();
if (typeof window !== 'undefined') {
  window.clinicalNutritionFilterAgent = clinicalNutritionFilterAgent;
}
if (typeof global !== 'undefined') {
  global.clinicalNutritionFilterAgent = clinicalNutritionFilterAgent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CLINICAL_FILTER_SYSTEM_PROMPT,
    ClinicalNutritionFilterAgent,
    clinicalNutritionFilterAgent
  };
}
