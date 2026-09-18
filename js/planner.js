// NutriVision AI — Recovery Meal Planner & Symptom-Aware Filter
// Sesuai FR-10 (Dual Mode Standar vs Hemat) & FR-11 (Symptom-Aware Filter)

const CLINICAL_FOOD_SWAPS = [
  {
    keywords: ['gorengan', 'goreng', 'fried', 'minyak', 'deep fried'],
    name: 'Gorengan & Minyak Berlebih',
    nameEn: 'Fried Foods & Excess Oil',
    category: 'Metode Olah & Lemak',
    categoryEn: 'Cooking & Fats',
    avoid: 'Gorengan bertepung tebal, kerupuk renyah kasar, deep-fried food, minyak jelantah',
    avoidEn: 'Deep-fried foods, heavy battered fritters, reused oil, coarse crunchy crackers',
    replaceWith: 'Olahan kukus (steamed), tim kaldu herbal, sup rebus bening, panggang lembut oven',
    replaceWithEn: 'Steamed, herb broth braised, clear poached, or gently baked soft dishes',
    clinicalReason: 'Menghindari stimulasi asam lambung berlebih, mempercepat pengosongan lambung, dan mencegah mikrolesi pada mukosa saluran cerna.',
    clinicalReasonEn: 'Prevents excess gastric acid secretion, accelerates gastric emptying, and avoids mucosal micro-irritation.'
  },
  {
    keywords: ['santan', 'santan pekat', 'coconut milk', 'gulai', 'lodeh'],
    name: 'Santan Pekat & Lemak Jenuh Nabati',
    nameEn: 'Thick Coconut Milk & Saturated Plant Fat',
    category: 'Emulsi Lemak',
    categoryEn: 'Fat Emulsions',
    avoid: 'Gulai kental, santan perasan pertama berminyak, kuah lodeh pekat, saus santan berat',
    avoidEn: 'Thick coconut curry, first-press coconut milk, heavy rendang sauce, oily coconut stews',
    replaceWith: 'Kaldu ayam kampung bening, kuah herbal jamur, susu oat/almond tanpa gula, santan encer sangat tipis',
    replaceWithEn: 'Clear free-range chicken broth, mild mushroom broth, unsweetened oat/almond milk, or ultra-thin coconut milk',
    clinicalReason: 'Menurunkan beban kerja enzim lipase pankreas dan asam empedu, mencegah distensi lambung, rasa enek, dan regurgitasi asam.',
    clinicalReasonEn: 'Reduces pancreatic lipase and bile workload, preventing postprandial abdominal distension, nausea, and reflux.'
  },
  {
    keywords: ['susu', 'laktosa', 'dairy', 'milk', 'lactose', 'keju'],
    name: 'Susu Hewani & Laktosa',
    nameEn: 'Dairy & Lactose',
    category: 'Laktosa & Protein Susu',
    categoryEn: 'Lactose & Milk Protein',
    avoid: 'Susu sapi murni whole milk, kental manis, keju tua fermentasi, krim kental, es krim',
    avoidEn: 'Whole cows milk, condensed milk, aged fermented cheese, heavy cream, ice cream',
    replaceWith: 'Susu kedelai murni non-GMO, almond milk tanpa gula, susu oat fortifikasi kalsium, formula bebas laktosa',
    replaceWithEn: 'Pure unsweetened soy milk, almond milk, calcium-fortified oat milk, or lactose-free formula',
    clinicalReason: 'Mencegah fermentasi laktosa di usus besar yang dapat memicu akumulasi gas mendesak, kram perut, dan diare osmotik.',
    clinicalReasonEn: 'Prevents unhydrolyzed lactose fermentation in the colon that triggers severe gas, cramping, and osmotic diarrhea.'
  },
  {
    keywords: ['gluten', 'terigu', 'gandum', 'wheat', 'mie instan', 'pasta'],
    name: 'Gluten & Tepung Terigu',
    nameEn: 'Gluten & Wheat Flour',
    category: 'Karbohidrat & Gandum',
    categoryEn: 'Grains & Gluten',
    avoid: 'Mie instan berbahan terigu, roti putih biasa, pastry gandum, biskuit renyah tepung konvensional',
    avoidEn: 'Instant wheat noodles, conventional white bread, wheat pastry, standard semolina pasta',
    replaceWith: 'Bubur beras organik, bihun pati jagung murni, kentang tumbuk halus, oatmeal bersertifikat bebas gluten',
    replaceWithEn: 'Organic rice porridge, pure corn starch vermicelli, soft mashed potatoes, certified gluten-free rolled oats',
    clinicalReason: 'Menghindari respon peradangan vili mukosa usus halus sensitif dan mempermudah absorbsi mikronutrien penting.',
    clinicalReasonEn: 'Avoids intestinal villi inflammation and facilitates smooth nutrient absorption without metabolic stress.'
  },
  {
    keywords: ['pepaya', 'papaya', 'kates'],
    name: 'Pepaya (Enzim Papain Aktif)',
    nameEn: 'Papaya (Active Papain Enzyme)',
    category: 'Buah & Enzim Protease',
    categoryEn: 'Fruits & Enzymes',
    avoid: 'Pepaya segar potong, rujak pepaya mengkal, jus pepaya murni tinggi papain aktif',
    avoidEn: 'Fresh raw papaya, underripe papaya slices, concentrated raw papaya juice rich in papain enzymes',
    replaceWith: 'Puree buah naga merah halus, pir kukus kupas empuk, pisang mas matang lembut, sari apel manis kukus',
    replaceWithEn: 'Red dragon fruit puree, gently steamed peeled pears, tender sweet bananas, or warm steamed apple sauce',
    clinicalReason: 'Aktivitas protease papain dapat mengikis lapisan glikoprotein pelindung pada mukosa lambung yang sedang hiperemis.',
    clinicalReasonEn: 'Active papain protease can irritate sensitized or hyperemic gastric epithelial mucosa.'
  },
  {
    keywords: ['pedas', 'cabai', 'spicy', 'chili', 'sambal', 'lada'],
    name: 'Cabai, Sambal & Bumbu Pedas Tajam',
    nameEn: 'Chili, Spicy Sambal & Sharp Spices',
    category: 'Bumbu & Kapsaisin',
    categoryEn: 'Spices & Capsaicin',
    avoid: 'Cabai rawit merah, sambal terasi pedas, lada bubuk hitam menyengat, saus cabai botolan tinggi sodium',
    avoidEn: 'Bird eye chilies, pungent chili paste, coarse black pepper, high-sodium spicy hot sauces',
    replaceWith: 'Parutan kunyit segar, ketumbar halus, daun salam, serai rebus aromatik, kaldu rebusan jahe tipis',
    replaceWithEn: 'Fresh mild grated turmeric, ground coriander, Indonesian bay leaf, lemongrass, gentle ginger broth',
    clinicalReason: 'Kapsaisin merangsang nosiseptor TRPV1 lambung yang memicu sensasi terbakar hebat dan memperlambat epitelisasi jaringan luka.',
    clinicalReasonEn: 'Capsaicin triggers TRPV1 nociceptors, inducing severe epigastric burning pain and delaying mucosal re-epithelialization.'
  },
  {
    keywords: ['asam', 'jeruk', 'lemon', 'cuka', 'tomat mentah', 'acidic'],
    name: 'Makanan / Buah Berasam Tinggi',
    nameEn: 'High-Acid Foods & Citrus',
    category: 'Keasaman & Asam Sitrat',
    categoryEn: 'Acids & Citrus',
    avoid: 'Jeruk nipis murni, cuka meja, tomat mentah konsentrasi tinggi, asinan cuka berfermentasi masam',
    avoidEn: 'Raw lime/lemon juice, table vinegar, raw sour tomatoes, heavily pickled sour condiments',
    replaceWith: 'Labu kuning kukus manis alami, semangka potong segar tanpa biji, melon cantaloupe netral, wortel rebus serut',
    replaceWithEn: 'Naturally sweet steamed butternut squash, seedless watermelon, sweet cantaloupe melon, steamed tender carrots',
    clinicalReason: 'Mempertahankan pH lambung dalam rentang fisiologis agar tidak memicu nyeri tajam pada area erosi mukosa.',
    clinicalReasonEn: 'Maintains friendly gastric luminal pH to prevent acute erosive mucosal stinging and irritation.'
  },
  {
    keywords: ['kafein', 'kopi', 'coffee', 'caffeine', 'teh kental', 'cola'],
    name: 'Kopi & Minuman Berkafein Tinggi',
    nameEn: 'Coffee & High-Caffeine Drinks',
    category: 'Stimulan & Tonus Sfingter',
    categoryEn: 'Stimulants',
    avoid: 'Kopi tubruk pekat, espresso, minuman soda berenergi, teh hitam seduhan kental pahit',
    avoidEn: 'Strong brewed coffee, espresso, commercial energy drinks, high-strength black tea',
    replaceWith: 'Seduhan chamomile hangat, infused water pir manis, air kelapa muda murni kaya elektrolit',
    replaceWithEn: 'Warm chamomile infusion, gentle pear-infused water, natural pure young coconut water',
    clinicalReason: 'Kafein merelaksasi Lower Esophageal Sphincter (LES) dan memacu sekresi asam hidroklorida lambung berlebih.',
    clinicalReasonEn: 'Caffeine relaxes the Lower Esophageal Sphincter (LES) and stimulates excess hydrochloric acid secretion.'
  },
  {
    keywords: ['udang', 'seafood', 'shrimp', 'kepiting', 'cumi', 'kerang'],
    name: 'Udang, Kepiting & Kerang Seafood',
    nameEn: 'Shrimp, Shellfish & Crustaceans',
    category: 'Alergen Tropomyosin',
    categoryEn: 'Tropomyosin Allergens',
    avoid: 'Udang goreng renyah, kepiting cangkang keras, cumi goreng tepung liat, kerang dara mentah/kurang matang',
    avoidEn: 'Fried shrimp, hard crustaceans, deep-fried calamari, raw or undercooked clams and bivalves',
    replaceWith: 'Fillet ikan gabus kukus lembut (tinggi albumin), ikan dori kukus tim jahe, putih telur rebus tumbuk, tahu sutra',
    replaceWithEn: 'Steamed snakehead fish fillet (rich in albumin), steamed dory fish, soft mashed egg whites, silken tofu',
    clinicalReason: 'Menghilangkan alergen tropomyosin dan menggantikannya dengan sumber asam amino esensial tinggi bioavailabilitas untuk pemulihan jaringan.',
    clinicalReasonEn: 'Eliminates allergen tropomyosin triggers and provides highly digestible, bioavailable healing proteins.'
  },
  {
    keywords: ['telur', 'egg', 'eggs'],
    name: 'Telur Utuh / Alergi Telur',
    nameEn: 'Whole Eggs & Egg Allergies',
    category: 'Protein Ovomukoid',
    categoryEn: 'Egg Proteins',
    avoid: 'Telur ceplok minyak berlebih, telur rebus kenyal keras, saus mayones berbahan kuning telur mentah',
    avoidEn: 'Greasy sunny-side-up eggs, rubbery hard-boiled eggs, commercial mayonnaise made with raw yolks',
    replaceWith: 'Tahu sutra kukus lembut remuk, pasta edamame halus, sup krim labu kaya protein kaldu ayam kampung',
    replaceWithEn: 'Silken tofu mash, pureed edamame spread, high-protein pumpkin cream soup with poultry broth',
    clinicalReason: 'Mencegah sensitisasi alergen ovomukoid dan memudahkan pencernaan saat kapasitas sekresi enzim masih terbatas.',
    clinicalReasonEn: 'Prevents allergic reactions to ovomucoid proteins and eases enzymatic digestion during recovery.'
  },
  {
    keywords: ['kacang', 'kacang tanah', 'peanut', 'nuts', 'kacang mete'],
    name: 'Kacang-kacangan Keras & Kacang Tanah',
    nameEn: 'Hard Nuts & Peanuts',
    category: 'Alergen & Tekstur Kasar',
    categoryEn: 'Nuts & Hard Legumes',
    avoid: 'Kacang tanah goreng garing, bumbu pecel butiran kasar, kacang mete goreng keras',
    avoidEn: 'Crunchy deep-fried peanuts, coarse peanut sauces, whole roasted cashews or hard nut shards',
    replaceWith: 'Pasta biji labu halus (pumpkin seed butter), tempe rebus blender lembut, tahu sutra kuah kaldu',
    replaceWithEn: 'Silky smooth pumpkin seed spread, well-blended steamed tempeh, silken tofu in savory clear broth',
    clinicalReason: 'Mencegah risiko tersedak (choking hazard) pada pasien disfagia dan menghindari abrasi fisik pada mukosa.',
    clinicalReasonEn: 'Prevents airway aspiration/choking risks and mechanical abrasion on upper GI tract lining.'
  }
];

class NutriVisionPlanner {
  constructor() {
    this.currentMode = 'standar'; // 'standar' atau 'hemat'
    this.activeSymptoms = new Set(['dysphagia', 'sulit-menelan', 'nausea', 'mual', 'constipation', 'konstipasi']); // Default demo matching mockup (3 aktif)
    this.selectedMealNames = new Set();
    this.customRestrictions = new Set();
    this.quickSuggestionList = [
      'Udang / Seafood',
      'Telur',
      'Susu & Laktosa',
      'Makanan Pedas',
      'Gorengan',
      'Santan Pekat',
      'Gluten',
      'Kacang Tanah',
      'Kafein'
    ];
    this.initRestrictions();
  }

  setMode(mode) {
    if (window.app && typeof window.app.requireAuth === 'function') {
      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      if (!window.app.requireAuth(() => {
        this.currentMode = (mode === 'hemat') ? 'hemat' : 'standar';
        this.renderPlanner();
      }, isId ? 'atur mode menu' : 'switch meal mode')) {
        return;
      }
    }
    this.currentMode = (mode === 'hemat') ? 'hemat' : 'standar';
    this.renderPlanner();
  }

  toggleSymptom(symptomKey, btnElement) {
    const keyMap = {
      'dysphagia': ['dysphagia', 'sulit-menelan'],
      'sulit-menelan': ['dysphagia', 'sulit-menelan'],
      'nausea': ['nausea', 'mual'],
      'mual': ['nausea', 'mual'],
      'gerd': ['gerd', 'asam-lambung'],
      'asam-lambung': ['gerd', 'asam-lambung'],
      'diarrhea': ['diarrhea', 'diare'],
      'diare': ['diarrhea', 'diare'],
      'constipation': ['constipation', 'konstipasi'],
      'konstipasi': ['constipation', 'konstipasi'],
      'low_appetite': ['low_appetite', 'nafsu-rendah'],
      'nafsu-rendah': ['low_appetite', 'nafsu-rendah']
    };

    const keys = keyMap[symptomKey] || [symptomKey];
    const isCurrentlyActive = keys.some(k => this.activeSymptoms.has(k));

    if (window.app && typeof window.app.requireAuth === 'function') {
      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      if (!window.app.requireAuth(() => {
        this._doToggleSymptom(keys, isCurrentlyActive);
      }, isId ? 'filter gejala' : 'filter symptoms')) {
        return;
      }
    }
    this._doToggleSymptom(keys, isCurrentlyActive);
  }

  _doToggleSymptom(keys, isCurrentlyActive) {
    keys.forEach(k => {
      if (isCurrentlyActive) {
        this.activeSymptoms.delete(k);
      } else {
        this.activeSymptoms.add(k);
      }
    });
    this.syncChipUI();
    this.renderSymptomFilter();
  }

  syncChipUI() {
    const chips = document.querySelectorAll('#planner-symptom-chips .symptom-chip');
    let activeCount = 0;
    const countedCategories = new Set();

    const categoryMap = {
      'dysphagia': 'dysphagia', 'sulit-menelan': 'dysphagia',
      'nausea': 'nausea', 'mual': 'nausea',
      'gerd': 'gerd', 'asam-lambung': 'gerd',
      'diarrhea': 'diarrhea', 'diare': 'diarrhea',
      'constipation': 'constipation', 'konstipasi': 'constipation',
      'low_appetite': 'low_appetite', 'nafsu-rendah': 'low_appetite'
    };

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const chipLabels = {
      dysphagia: isId ? 'Sulit Menelan (Disfagia)' : 'Difficulty Swallowing (Dysphagia)',
      nausea: isId ? 'Mual (Nausea)' : 'Nausea',
      gerd: isId ? 'GERD / Asam Lambung' : 'GERD / Acid Reflux',
      diarrhea: isId ? 'Diare' : 'Diarrhea',
      constipation: isId ? 'Konstipasi' : 'Constipation',
      low_appetite: isId ? 'Nafsu Makan Rendah' : 'Low Appetite'
    };

    chips.forEach(chip => {
      const sym = chip.getAttribute('data-symptom');
      const iconSpan = chip.querySelector('.symptom-chip-icon');
      const labelSpan = chip.querySelector('span:not(.symptom-chip-icon)');
      if (labelSpan && chipLabels[sym]) {
        labelSpan.textContent = chipLabels[sym];
      }
      const isActive = sym && this.activeSymptoms.has(sym);
      if (isActive) {
        chip.classList.add('active');
        if (iconSpan) iconSpan.textContent = '✓';
        const cat = categoryMap[sym] || sym;
        if (!countedCategories.has(cat)) {
          countedCategories.add(cat);
          activeCount++;
        }
      } else {
        chip.classList.remove('active');
        if (iconSpan) iconSpan.textContent = '+';
      }
    });

    const badge = document.getElementById('symptom-active-count-badge');
    if (badge) {
      badge.textContent = isId ? `${activeCount} aktif` : `${activeCount} active`;
    }
  }

  selectSymptomMeal(mealName, btnElement) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    if (this.selectedMealNames.has(mealName)) {
      this.selectedMealNames.delete(mealName);
      if (btnElement) {
        btnElement.classList.remove('selected');
        btnElement.textContent = isId ? 'Pilih' : 'Select';
      }
    } else {
      this.selectedMealNames.add(mealName);
      if (btnElement) {
        btnElement.classList.add('selected');
        btnElement.textContent = isId ? '✓ Terpilih' : '✓ Selected';
      }
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(isId ? `"${mealName}" dipilih untuk menu pasien.` : `"${mealName}" selected for patient menu.`);
      }
    }

    const applyBtn = document.getElementById('btn-symptom-apply-all');
    if (applyBtn) {
      const count = this.selectedMealNames.size;
      const span = applyBtn.querySelector('span:first-child');
      if (span) {
        if (count > 0) {
          span.textContent = isId 
            ? `Terapkan ${count} Menu ke Menu Pasien & Jadwal Kalender` 
            : `Apply ${count} Meals to Patient Menu & Calendar Schedule`;
        } else {
          span.textContent = isId ? 'Terapkan ke Menu Pasien (Jadwal Kalender)' : 'Apply to Patient Menu (Calendar Schedule)';
        }
      }
    }
  }

  applySingleMealToCalendar(mealName) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    this.selectedMealNames.add(mealName);
    const applied = this.applyMealsToCalendarSchedule([mealName]);
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(isId 
        ? `📅 "${mealName}" berhasil diterapkan ke Jadwal Kalender!` 
        : `📅 "${mealName}" successfully applied to Calendar Schedule!`, 'success');
    }
  }

  resetSymptoms() {
    this.activeSymptoms.clear();
    this.selectedMealNames.clear();
    this.syncChipUI();
    this.renderSymptomFilter();
    if (window.app && typeof window.app.showToast === 'function') {
      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      window.app.showToast(isId ? 'Pilihan gejala direset.' : 'Symptom filters reset.');
    }
  }

  applyToPatientMenu() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    let names = Array.from(this.selectedMealNames);
    if (names.length === 0) {
      if (this.currentRecommendations && this.currentRecommendations.length > 0) {
        names = [this.currentRecommendations[0].name];
        this.selectedMealNames.add(names[0]);
      } else {
        if (window.app && typeof window.app.showToast === 'function') {
          window.app.showToast(isId ? 'Silakan klik "Pilih" pada menu rekomendasi terlebih dahulu.' : 'Please click "Select" on recommended menu items first.');
        }
        return;
      }
    }

    const count = names.length;
    this.applyMealsToCalendarSchedule(names);
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(isId 
        ? `Berhasil menerapkan ${count} menu terverifikasi ke jadwal makan pasien!` 
        : `Successfully applied ${count} verified meals to patient schedule!`, 'success');
    }
  }

  applyMealsToCalendarSchedule(mealNames) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    if (!Array.isArray(mealNames) || mealNames.length === 0) return 0;

    const cond = (window.app && (window.app.journeyCondition || window.app.userProfile?.conditionId)) || 'post-surgery';
    const targetDate = (window.app && window.app.selectedCalendarDate) || new Date().toISOString().split('T')[0];

    const defaultSlots = [
      { slot: 'lunch', time: '12:00 - 13:00', label: isId ? 'Makan Siang' : 'Lunch' },
      { slot: 'snack', time: '15:30 - 16:30', label: isId ? 'Snack Pemulihan' : 'Recovery Snack' },
      { slot: 'dinner', time: '18:30 - 19:30', label: isId ? 'Makan Malam' : 'Dinner' },
      { slot: 'breakfast', time: '07:30 - 08:30', label: isId ? 'Sarapan' : 'Breakfast' }
    ];

    let appliedCount = 0;
    let firstNewSchedId = null;

    if (!window.app) window.app = {};
    if (!window.app.customDailySchedules) {
      window.app.customDailySchedules = (typeof window.app.loadCustomDailySchedules === 'function')
        ? window.app.loadCustomDailySchedules()
        : [];
    }
    if (!window.app.userDailyMealPlans) {
      window.app.userDailyMealPlans = (typeof window.app.loadUserDailyMealPlans === 'function')
        ? window.app.loadUserDailyMealPlans()
        : [];
    }

    mealNames.forEach((name, idx) => {
      const rec = (this.currentRecommendations || []).find(m => m.name === name) || {
        name: name,
        texture_category: 'Lunak',
        reason: isId ? 'Menu adaptasi klinis ramah gejala pasien' : 'Patient symptom-adapted meal',
        nutrients: ''
      };

      const slotConfig = defaultSlots[idx % defaultSlots.length];
      const schedId = 'symptom-sched-' + Date.now() + '-' + idx;
      if (!firstNewSchedId) firstNewSchedId = schedId;

      let prot = 15;
      let cal = 200;
      if (rec.nutrients) {
        const pMatch = rec.nutrients.match(/([\d\.]+)\s*g\s*(?:Protein|Albumin)/i);
        const cMatch = rec.nutrients.match(/([\d\.]+)\s*kkal/i);
        if (pMatch) prot = parseFloat(pMatch[1]);
        if (cMatch) cal = parseInt(cMatch[1], 10);
      }

      // 1. Simpan ke Jadwal Kalender Klinis (customDailySchedules)
      const newSched = {
        id: schedId,
        time: slotConfig.time,
        title: rec.name,
        desc: `${rec.texture_category ? `[${rec.texture_category}] ` : ''}${rec.reason || ''}${rec.nutrients ? ` (${rec.nutrients})` : ''}`,
        category: 'nutrition',
        dotColor: '#7C3AED',
        badge: isId ? 'Rekomendasi Gejala' : 'Symptom-Aware',
        source: 'symptom_filter',
        isSymptomAdaptive: true,
        textureCategory: rec.texture_category || 'Lunak',
        scientificRationale: isId ? 'Rekomendasi Adaptif Gejala (Symptom-Aware IDDSI)' : 'Symptom-Aware Clinical IDDSI',
        isCustom: true,
        conditionId: cond,
        targetDate: targetDate
      };

      const existsInSched = window.app.customDailySchedules.some(s => s.title === rec.name && (!s.targetDate || s.targetDate === targetDate));
      if (!existsInSched) {
        window.app.customDailySchedules.push(newSched);
      }

      // 2. Simpan ke Meal Planner Pasien (userDailyMealPlans)
      const existsInPlans = window.app.userDailyMealPlans.some(p => p.name === rec.name);
      if (!existsInPlans) {
        window.app.userDailyMealPlans.push({
          id: 'plan-sym-' + Date.now() + '-' + idx,
          foodId: 'sym-' + idx,
          name: rec.name,
          slot: slotConfig.slot,
          servings: 1,
          portionGrams: 200,
          protein: prot,
          calories: cal,
          carbs: 25,
          fat: 6,
          price: isId ? 'Pilihan Ramah Gejala' : 'Symptom Choice',
          image: 'icons/nutrivision-icon.png',
          timestamp: Date.now()
        });
      }

      appliedCount++;
    });

    if (typeof window.app.saveCustomDailySchedules === 'function') {
      window.app.saveCustomDailySchedules();
    }
    if (typeof window.app.saveUserDailyMealPlans === 'function') {
      window.app.saveUserDailyMealPlans();
    }

    // Refresh daftar meal planner jika ada di halaman
    this.renderPlanner();

    // Sorot event baru di timeline
    if (firstNewSchedId) {
      window.app.activeTimelineEventId = firstNewSchedId;
    }

    // NAVIGASI OTOMATIS: Buka Kalender Klinis & Jadwal Nutrisi Pasien
    if (window.app && typeof window.app.openCalendarModal === 'function') {
      window.app.openCalendarModal();
      if (typeof window.app.switchCalendarDetailTab === 'function') {
        window.app.switchCalendarDetailTab('meals');
      }
      if (typeof window.app.renderUpcomingEvents === 'function') {
        window.app.renderUpcomingEvents(targetDate);
      }
      if (typeof window.app.renderClinicalCalendar === 'function') {
        window.app.renderClinicalCalendar(window.app.calendarViewMode || 'month');
      }

      // Gulir halus ke event yang baru dijadwalkan
      setTimeout(() => {
        const activeEl = document.querySelector('.timeline-event-row.is-active');
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }

    return appliedCount;
  }

  // =========================================================================
  // Dietary Restrictions & Allergies Management (Symptom-Aware Add/Remove)
  // =========================================================================
  initRestrictions() {
    let restrStr = '';
    if (typeof window !== 'undefined' && window.app && window.app.userProfile && window.app.userProfile.restrictions) {
      restrStr = window.app.userProfile.restrictions;
    } else if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('nutrivision_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.restrictions) restrStr = parsed.restrictions;
        }
      } catch (e) {}
    }

    if (restrStr && typeof restrStr === 'string') {
      const items = restrStr.split(',').map(s => s.trim()).filter(Boolean);
      items.forEach(it => this.customRestrictions.add(it));
    }
  }

  getCustomRestrictions() {
    return Array.from(this.customRestrictions);
  }

  addCustomRestriction(item) {
    if (!item) return;
    const cleanItem = item.trim();
    if (!cleanItem) return;

    // Check case-insensitive duplicate
    const lower = cleanItem.toLowerCase();
    const existing = Array.from(this.customRestrictions).find(r => r.toLowerCase() === lower);
    if (!existing) {
      this.customRestrictions.add(cleanItem);
      this.syncRestrictionsToProfile();
      this.renderRestrictionsUI();
      this.renderSymptomFilter();
      this.renderPlanner();

      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(isId ? `"${cleanItem}" berhasil ditambahkan ke daftar pantangan.` : `"${cleanItem}" added to dietary restrictions.`);
      }
    }
  }

  addCustomRestrictionFromInput() {
    const input = document.getElementById('symptom-restriction-input');
    if (!input) return;
    const val = input.value.trim();
    if (val) {
      this.addCustomRestriction(val);
      input.value = '';
    }
  }

  removeCustomRestriction(item) {
    if (!item) return;
    const lower = item.trim().toLowerCase();
    let found = null;
    for (const r of this.customRestrictions) {
      if (r.toLowerCase() === lower) {
        found = r;
        break;
      }
    }
    if (found) {
      this.customRestrictions.delete(found);
      this.syncRestrictionsToProfile();
      this.renderRestrictionsUI();
      this.renderSymptomFilter();
      this.renderPlanner();

      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(isId ? `"${found}" dihapus dari daftar pantangan.` : `"${found}" removed from dietary restrictions.`);
      }
    }
  }

  toggleQuickRestriction(item) {
    const lower = item.trim().toLowerCase();
    const isExisting = Array.from(this.customRestrictions).some(r => r.toLowerCase() === lower);
    if (isExisting) {
      this.removeCustomRestriction(item);
    } else {
      this.addCustomRestriction(item);
    }
  }

  clearAllRestrictions() {
    if (this.customRestrictions.size === 0) return;
    this.customRestrictions.clear();
    this.syncRestrictionsToProfile();
    this.renderRestrictionsUI();
    this.renderSymptomFilter();
    this.renderPlanner();

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(isId ? 'Semua pantangan makanan berhasil dibersihkan.' : 'All dietary restrictions cleared.');
    }
  }

  syncRestrictionsToProfile() {
    const str = Array.from(this.customRestrictions).join(', ');

    if (typeof window !== 'undefined' && window.app && window.app.userProfile) {
      window.app.userProfile.restrictions = str;
      if (typeof window.app.saveUserProfile === 'function') {
        window.app.saveUserProfile();
      }
    } else if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('nutrivision_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.restrictions = str;
          localStorage.setItem('nutrivision_user_profile', JSON.stringify(parsed));
        }
      } catch (e) {}
    }

    const onboardInput = document.getElementById('onboard-restrictions');
    if (onboardInput) {
      onboardInput.value = str;
    }

    const elStatRestr = document.getElementById('profile-stat-restrictions');
    if (elStatRestr) {
      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      elStatRestr.textContent = str || (isId ? 'Bebas pantangan khusus' : 'No dietary restrictions');
    }

    if (typeof window !== 'undefined' && window.nutriVisionDB && window.nutriVisionDB.isReady && window.app && window.app.userProfile && window.app.userProfile.contact) {
      window.nutriVisionDB.updateUserProfile(window.app.userProfile.contact, {
        allergies: str
      }).catch(err => console.warn('DB restriction sync error:', err));
    }
  }

  renderRestrictionsUI() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const activeBox = document.getElementById('symptom-restr-active-box');
    const badge = document.getElementById('symptom-restr-count-badge');
    const quickList = document.getElementById('symptom-restr-quick-list');

    const restrictions = Array.from(this.customRestrictions);

    if (badge) {
      badge.textContent = isId ? `${restrictions.length} pantangan` : `${restrictions.length} restriction${restrictions.length === 1 ? '' : 's'}`;
    }

    if (quickList) {
      quickList.innerHTML = this.quickSuggestionList.map(item => {
        const lower = item.toLowerCase();
        const isActive = restrictions.some(r => r.toLowerCase() === lower || lower.includes(r.toLowerCase()) || r.toLowerCase().includes(lower));
        const icon = isActive ? '✓' : '+';
        const activeCls = isActive ? ' active' : '';
        return `
          <button type="button" class="restr-quick-chip${activeCls}"
            onclick="mealPlanner.toggleQuickRestriction('${item.replace(/'/g, "\\'")}');">
            <span>${icon}</span> <span>${item}</span>
          </button>
        `;
      }).join('');
    }

    if (activeBox) {
      if (restrictions.length === 0) {
        activeBox.innerHTML = `
          <div class="symptom-restr-empty">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>${isId ? 'Belum ada pantangan khusus yang ditambahkan. Gunakan pilihan cepat atau ketik di atas.' : 'No personal dietary restrictions added yet. Use quick suggestions or type above.'}</span>
          </div>
        `;
      } else {
        const headLbl = isId ? `Pantangan Aktif Pasien (${restrictions.length}):` : `Active Patient Restrictions (${restrictions.length}):`;
        const clearLbl = isId ? 'Hapus Semua' : 'Clear All';
        const tagsHtml = restrictions.map(item => `
          <span class="restr-active-chip">
            <span>${item}</span>
            <button type="button" class="btn-remove-restr" title="${isId ? 'Hapus pantangan ini' : 'Remove this restriction'}"
              onclick="mealPlanner.removeCustomRestriction('${item.replace(/'/g, "\\'")}');">
              &times;
            </button>
          </span>
        `).join('');

        activeBox.innerHTML = `
          <div class="symptom-restr-active-head">
            <span class="symptom-restr-active-lbl">${headLbl}</span>
            <button type="button" class="btn-clear-restr" onclick="mealPlanner.clearAllRestrictions();">${clearLbl}</button>
          </div>
          <div class="symptom-restr-tags">
            ${tagsHtml}
          </div>
        `;
      }
    }
  }

  _checkMealRestriction(mealName, mealDesc = '') {
    if (this.customRestrictions.size === 0) return null;
    const text = (mealName + ' ' + mealDesc).toLowerCase();

    for (const rawRestr of this.customRestrictions) {
      const restr = rawRestr.toLowerCase().trim();
      if (!restr) continue;

      if (text.includes(restr)) return rawRestr;

      if (restr.includes('pepaya') || restr.includes('papaya')) {
        if (text.includes('pepaya') || text.includes('papaya')) return rawRestr;
      }
      if (restr.includes('udang') || restr.includes('seafood')) {
        if (text.includes('udang') || text.includes('shrimp') || text.includes('prawn') || text.includes('seafood') || text.includes('kepiting') || text.includes('cumi')) return rawRestr;
      }
      if (restr.includes('telur')) {
        if (text.includes('telur') || text.includes('egg') || text.includes('chawanmushi')) return rawRestr;
      }
      if (restr.includes('susu') || restr.includes('laktosa')) {
        if (text.includes('susu') || text.includes('milk') || text.includes('keju') || text.includes('cheese') || text.includes('yogurt')) return rawRestr;
      }
      if (restr.includes('pedas') || restr.includes('cabai')) {
        if (text.includes('pedas') || text.includes('spicy') || text.includes('cabai') || text.includes('chili') || text.includes('sambal') || text.includes('merica')) return rawRestr;
      }
      if (restr.includes('gorengan')) {
        if (text.includes('goreng') || text.includes('fried') || text.includes('crispy')) return rawRestr;
      }
      if (restr.includes('santan')) {
        if (text.includes('santan') || text.includes('coconut milk')) return rawRestr;
      }
      if (restr.includes('gluten')) {
        if (text.includes('terigu') || text.includes('wheat') || text.includes('gluten') || text.includes('roti') || text.includes('mie')) return rawRestr;
      }
      if (restr.includes('kacang')) {
        if (text.includes('kacang') || text.includes('peanut')) return rawRestr;
      }
      if (restr.includes('kafein')) {
        if (text.includes('kopi') || text.includes('coffee') || text.includes('kafein') || text.includes('teh hitam')) return rawRestr;
      }
      if (restr.includes('ikan')) {
        if (text.includes('ikan') || text.includes('fish') || text.includes('gabus') || text.includes('salmon') || text.includes('tuna')) return rawRestr;
      }
      if (restr.includes('ayam')) {
        if (text.includes('ayam') || text.includes('chicken')) return rawRestr;
      }
      if (restr.includes('daging') || restr.includes('sapi')) {
        if (text.includes('daging') || text.includes('beef') || text.includes('sapi')) return rawRestr;
      }
    }
    return null;
  }

  // =========================================================================
  // Dietary Restrictions Modal & Recommendations Swaps (FR-11)
  // =========================================================================
  getFoodSubstitutions(customList = [], activeSymptoms = []) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const swaps = [];
    const matchedKeys = new Set();

    // 1. Process Patient's Custom Restrictions
    (customList || []).forEach(item => {
      const raw = (item || '').trim();
      if (!raw) return;
      const lower = raw.toLowerCase();

      const preset = CLINICAL_FOOD_SWAPS.find(entry =>
        entry.keywords.some(k => lower.includes(k) || k.includes(lower))
      );

      if (preset && !matchedKeys.has(preset.name)) {
        matchedKeys.add(preset.name);
        swaps.push({
          id: 'swap-' + preset.keywords[0],
          restrictionName: raw,
          category: isId ? preset.category : preset.categoryEn,
          avoid: isId ? preset.avoid : preset.avoidEn,
          replaceWith: isId ? preset.replaceWith : preset.replaceWithEn,
          clinicalReason: isId ? preset.clinicalReason : preset.clinicalReasonEn,
          isFromSymptom: false
        });
      } else if (!preset) {
        swaps.push({
          id: 'swap-custom-' + encodeURIComponent(raw),
          restrictionName: raw,
          category: isId ? 'Pantangan Pasien' : 'Patient Restriction',
          avoid: isId 
            ? `Konsumsi olahan ${raw} dalam porsi atau variasi apapun` 
            : `Consumption of ${raw} in any portion or variation`,
          replaceWith: isId 
            ? 'Menu ramah cerna: Fillet ikan kukus, sup kaldu ayam bening, tahu sutra, serta wortel dan labu siam kukus empuk' 
            : 'Gentle digestible alternatives: Steamed fish fillet, clear chicken broth, silken tofu, and steamed soft carrots and chayote',
          clinicalReason: isId 
            ? 'Menghindari potensi intoleransi spesifik pasien dan menjaga pemulihan metabolisme tetap optimal tanpa iritasi.' 
            : 'Prevents patient-specific intolerances and maintains optimal metabolic recovery without GI distress.',
          isFromSymptom: false
        });
      }
    });

    // 2. Process Clinical Symptoms for Physiological Dietary Adjustments
    const symArray = Array.isArray(activeSymptoms) ? activeSymptoms : Array.from(activeSymptoms || []);

    if (symArray.some(s => s.includes('dysphagia') || s.includes('sulit-menelan')) && !matchedKeys.has('Disfagia')) {
      matchedKeys.add('Disfagia');
      swaps.push({
        id: 'swap-sym-dysphagia',
        restrictionName: isId ? 'Gejala Disfagia (Sulit Menelan)' : 'Dysphagia (Difficulty Swallowing)',
        category: isId ? 'Tekstur & Keamanan Jalan Napas' : 'Texture & Airway Safety',
        avoid: isId 
          ? 'Tekstur kering rapuh, remah biskuit/roti, daging serat kasar liat, butiran biji utuh' 
          : 'Dry brittle textures, crumbly crackers, tough fibrous meat, whole dry grains',
        replaceWith: isId 
          ? 'Puree kental homogen (IDDSI Level 4), bubur saring halus, puding nutrisi lembut, sup krim tanpa serpihan' 
          : 'Homogeneous thick purees (IDDSI Level 4), smooth strained porridge, nutrient puddings, lump-free soups',
        clinicalReason: isId 
          ? 'Mencegah risiko fatal penetrasi bolus ke jalan napas (aspirasi paru) dan memudahkan koordinasi menelan orofaring.' 
          : 'Prevents fatal bolus aspiration into airways and facilitates safe oropharyngeal swallowing coordination.',
        isFromSymptom: true
      });
    }

    if (symArray.some(s => s.includes('nausea') || s.includes('mual')) && !matchedKeys.has('Mual')) {
      matchedKeys.add('Mual');
      swaps.push({
        id: 'swap-sym-nausea',
        restrictionName: isId ? 'Gejala Mual (Nausea)' : 'Nausea Management',
        category: isId ? 'Aroma & Pengaturan Porsi' : 'Aroma & Meal Portioning',
        avoid: isId 
          ? 'Makanan bersuhu panas mengepul beraroma tajam, hidangan berminyak/lengket, porsi besar sekaligus' 
          : 'Piping hot food with strong odors, greasy/sticky foods, large single-sitting meals',
        replaceWith: isId 
          ? 'Makanan bersuhu suam-suam kuku atau sejuk, biskuit gandum kering tawar, kaldu jahe tipis, porsi kecil tapi sering' 
          : 'Room-temperature or cool mild foods, dry crackers, gentle ginger broth, small frequent meal portions',
        clinicalReason: isId 
          ? 'Menekan hiperstimulasi Chemoreceptor Trigger Zone (CTZ) di batang otak dan mencegah distensi berlebih pada dinding lambung.' 
          : 'Minimizes CTZ trigger stimulation and prevents excessive gastric distension.',
        isFromSymptom: true
      });
    }

    if (symArray.some(s => s.includes('gerd') || s.includes('asam-lambung')) && !matchedKeys.has('GERD')) {
      matchedKeys.add('GERD');
      swaps.push({
        id: 'swap-sym-gerd',
        restrictionName: isId ? 'Gejala GERD / Asam Lambung' : 'GERD / Acid Reflux',
        category: isId ? 'Tonus Sfingter & Keasaman' : 'Sphincter Tone & Acidity',
        avoid: isId 
          ? 'Saus tomat asam pekat, cokelat, peppermint, masakan tinggi minyak, langsung berbaring setelah makan' 
          : 'Concentrated tomato sauce, chocolate, peppermint, high-fat fried dishes, lying down immediately after eating',
        replaceWith: isId 
          ? 'Oatmeal lembut kaldu gurih, labu siam kukus, ikan panggang tanpa mentega, air minum suhu suam kuku' 
          : 'Savory broth oatmeal, tender steamed chayote, oven-baked fish without butter, lukewarm water',
        clinicalReason: isId 
          ? 'Menjaga tonus katup Lower Esophageal Sphincter (LES) agar tetap tertutup rapat dan mencegah regurgitasi cairan lambung.' 
          : 'Maintains LES sphincter closure tone and prevents retrograde gastric fluid regurgitation.',
        isFromSymptom: true
      });
    }

    if (symArray.some(s => s.includes('diarrhea') || s.includes('diare')) && !matchedKeys.has('Diare')) {
      matchedKeys.add('Diare');
      swaps.push({
        id: 'swap-sym-diarrhea',
        restrictionName: isId ? 'Gejala Diare' : 'Diarrhea Management',
        category: isId ? 'Serat Larut & Rehidrasi' : 'Soluble Fiber & Hydration',
        avoid: isId 
          ? 'Serat kasar tidak larut (kulit buah keras, lalapan mentah), susu hewani berlakstosa, pemanis sorbitol' 
          : 'Coarse insoluble fibers (fruit skins, raw rough salads), dairy lactose, artificial sorbitol sweeteners',
        replaceWith: isId 
          ? 'Pektin larut air (puree pisang mas, puree apel kukus), air tajin beras organik, oralit kaldu ayam kampung bening' 
          : 'Soluble pectin (banana puree, steamed apple sauce), rice water, natural electrolyte chicken broth',
        clinicalReason: isId 
          ? 'Pektin mengikat air di lumen usus untuk memadatkan feses sekaligus mengembalikan cadangan natrium-kalium yang hilang.' 
          : 'Pectin absorbs excess lumen fluid to firm stool while restoring vital lost electrolytes.',
        isFromSymptom: true
      });
    }

    if (symArray.some(s => s.includes('constipation') || s.includes('konstipasi')) && !matchedKeys.has('Konstipasi')) {
      matchedKeys.add('Konstipasi');
      swaps.push({
        id: 'swap-sym-constipation',
        restrictionName: isId ? 'Gejala Konstipasi (Sembelit)' : 'Constipation Management',
        category: isId ? 'Hidrasi & Serat Larut Lembut' : 'Hydration & Gentle Fiber',
        avoid: isId 
          ? 'Makanan kering olahan refined, gorengan tepung minim air, kurang hidrasi (< 1.5 Liter/hari)' 
          : 'Dry ultra-processed snacks, refined flour dishes, inadequate hydration (< 1.5 Liters/day)',
        replaceWith: isId 
          ? 'Buah naga merah lembut, chia pudding basah empuk, labu siam kukus lembut, hidrasi air hangat 2–2.5 Liter/hari' 
          : 'Red dragon fruit puree, well-soaked chia pudding, steamed tender squash, 2–2.5 Liters warm water daily',
        clinicalReason: isId 
          ? 'Meningkatkan volume dan kelembaban bolus feses sehingga memicu refleks defekasi alami tanpa mengejan berlebih.' 
          : 'Increases fecal volume and moisture, inducing natural peristalsis without painful straining.',
        isFromSymptom: true
      });
    }

    return swaps;
  }

  openRestrictionsRecommendationModal() {
    this.renderRestrictionsModalContent();
    const modal = document.getElementById('modal-restrictions-recommendations');
    if (modal) {
      modal.classList.add('open');
      modal.style.display = 'flex';
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: modal });
      }
    }
  }

  closeRestrictionsRecommendationModal() {
    const modal = document.getElementById('modal-restrictions-recommendations');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = '';
    }
  }

  scrollToRestrictionsInput() {
    const input = document.getElementById('symptom-restriction-input');
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => input.focus(), 300);
    }
  }

  renderRestrictionsModalContent() {
    const container = document.getElementById('restrictions-recommendations-modal-body');
    if (!container) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const customList = this.getCustomRestrictions();
    const activeSymptoms = Array.from(this.activeSymptoms);
    const swaps = this.getFoodSubstitutions(customList, activeSymptoms);

    const safeRecs = (this.currentRecommendations && this.currentRecommendations.length > 0)
      ? this.currentRecommendations
      : (window.symptomFilterAgent ? window.symptomFilterAgent.filterMeals(activeSymptoms).recommended_menu : []);

    const compliantMenus = (safeRecs || []).filter(m => {
      const match = this._checkMealRestriction(m.name, (m.nameEn || '') + ' ' + (m.reason || ''));
      return !match;
    });

    // 1. Badges Bar
    let badgesHtml = '';
    if (customList.length > 0) {
      badgesHtml += customList.map(item => `
        <span class="restrictions-swap-pill active-restr">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          ${item}
        </span>
      `).join('');
    } else {
      badgesHtml += `
        <span class="restrictions-swap-pill" style="background:#ECFDF5; color:#065F46; border-color:#A7F3D0;">
          ✓ ${isId ? 'Tidak ada pantangan khusus pasien' : 'No patient custom restrictions'}
        </span>
      `;
    }

    if (activeSymptoms.length > 0) {
      const symSummary = activeSymptoms.slice(0, 3).join(', ');
      badgesHtml += `
        <span class="restrictions-swap-pill" style="background:#F0F9FF; color:#0369A1; border-color:#BAE6FD;">
          🛡️ ${isId ? 'Gejala Aktif: ' : 'Active Symptoms: '} ${symSummary}${activeSymptoms.length > 3 ? '...' : ''}
        </span>
      `;
    }

    // 2. Swaps Cards
    let swapsListHtml = '';
    if (swaps.length === 0) {
      swapsListHtml = `
        <div style="text-align:center; padding:32px 16px; background:#F8FAFC; border-radius:14px; border:1px dashed #CBD5E1;">
          <p style="margin:0; font-weight:700; color:#475569; font-size:13px;">
            ${isId ? '🎉 Tidak ada pantangan aktif yang perlu disubstitusi saat ini.' : '🎉 No active restrictions needing substitutions.'}
          </p>
          <p style="margin:6px 0 0; font-size:12px; color:#64748B;">
            ${isId ? 'Anda dapat menambahkan pantangan seperti "Gorengan", "Santan", atau "Gluten" melalui menu filter gejala.' : 'You can add dietary restrictions like "Fried foods", "Coconut milk", or "Gluten" via the symptom filter.'}
          </p>
        </div>
      `;
    } else {
      swapsListHtml = swaps.map(swap => `
        <div class="restrictions-swap-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
            <span class="swap-category-badge">${swap.category}</span>
            <span style="font-size:11.5px; font-weight:700; color:#64748B;">${swap.restrictionName}</span>
          </div>
          <div class="swap-comparison-grid">
            <div class="swap-box avoid">
              <div class="swap-box-header">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ${isId ? 'Hindari / Pantangan' : 'Avoid / Restrict'}
              </div>
              <div class="swap-box-body">${swap.avoid}</div>
            </div>
            <div class="swap-arrow-col">➔</div>
            <div class="swap-box replace">
              <div class="swap-box-header">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ${isId ? 'Rekomendasi Solusi Pengganti' : 'Recommended Safe Alternative'}
              </div>
              <div class="swap-box-body">${swap.replaceWith}</div>
            </div>
          </div>
          <div class="swap-reason-box">
            <strong>💡 ${isId ? 'Alasan Klinis' : 'Clinical Rationale'}:</strong> ${swap.clinicalReason}
          </div>
        </div>
      `).join('');
    }

    // 3. Compliant Menus Section
    let compliantMenusHtml = '';
    if (compliantMenus.length > 0) {
      const displayMenus = compliantMenus.slice(0, 3);
      compliantMenusHtml = `
        <div style="margin-top:22px; border-top:1.5px solid #F1F5F9; padding-top:18px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <div style="font-size:14px; font-weight:800; color:#0F172A; display:flex; align-items:center; gap:6px;">
              <span>🍲</span>
              <span>${isId ? 'Menu Rekomendasi Terverifikasi Bebas Pantangan' : 'Verified Compliant Meal Options'}</span>
            </div>
            <span style="font-size:11px; font-weight:700; color:#059669; background:#D1FAE5; padding:3px 8px; border-radius:6px;">
              ${isId ? `${compliantMenus.length} Menu Lolos Uji Klinis` : `${compliantMenus.length} Verified Safe Meals`}
            </span>
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:10px;">
            ${displayMenus.map(m => `
              <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                    <span style="font-size:13px; font-weight:800; color:#1E293B; line-height:1.35;">${m.name}</span>
                    <span style="font-size:10px; font-weight:700; background:#E0F2FE; color:#0369A1; padding:2px 6px; border-radius:4px; flex-shrink:0;">${m.texture_category || (isId ? 'Lunak' : 'Soft')}</span>
                  </div>
                  <p style="margin:4px 0 0; font-size:11px; color:#64748B; line-height:1.4;">${m.reason || ''}</p>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px dashed #E2E8F0; padding-top:6px; margin-top:2px;">
                  <span style="font-size:11px; font-weight:700; color:#0F766E;">${m.nutrients || 'Tinggi Protein'}</span>
                  <button type="button" class="btn-outline-glass" style="font-size:11px; padding:4px 10px; border-radius:8px; font-weight:700; background:#0F766E; color:#FFFFFF; border:none; cursor:pointer;"
                    onclick="mealPlanner.applySingleMealToCalendar('${m.name.replace(/'/g, "\\'")}'); mealPlanner.closeRestrictionsRecommendationModal();">
                    📅 ${isId ? 'Jadwalkan' : 'Schedule'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="restrictions-swap-header">
        <div class="restrictions-swap-title-group">
          <h3 style="display:flex; align-items:center; gap:8px; font-size:17px; font-weight:800; color:#0F172A; margin:0;">
            <span style="display:inline-flex; width:28px; height:28px; border-radius:8px; background:#FEF3C7; color:#D97706; align-items:center; justify-content:center; font-size:16px;">💡</span>
            <span>${isId ? 'Panduan Pantangan & Rekomendasi Solusi Makanan' : 'Dietary Restrictions & Food Swaps'}</span>
          </h3>
          <p style="margin:6px 0 0; font-size:12.5px; color:#64748B; line-height:1.45;">
            ${isId 
              ? 'Daftar bahan yang harus dihindari beserta alternatif pengganti yang ramah cerna, aman, dan telah diverifikasi klinis.' 
              : 'List of restricted ingredients along with safe, easily digestible, and clinically verified alternatives.'}
          </p>
        </div>
        <button type="button" class="modal-close-btn" onclick="mealPlanner.closeRestrictionsRecommendationModal()" title="${isId ? 'Tutup' : 'Close'}" aria-label="${isId ? 'Tutup' : 'Close'}" style="background:none; border:none; cursor:pointer; padding:6px; color:#64748B; border-radius:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="restrictions-swap-badges-bar">
        ${badgesHtml}
      </div>

      <div class="restrictions-swap-cards-list">
        ${swapsListHtml}
      </div>

      ${compliantMenusHtml}

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:14px; border-top:1px solid #E2E8F0; flex-wrap:wrap; gap:10px;">
        <button type="button" class="btn-outline-glass" onclick="mealPlanner.closeRestrictionsRecommendationModal(); mealPlanner.scrollToRestrictionsInput();" style="font-size:12px; padding:7px 14px; border-radius:10px; font-weight:700; display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:1px solid #CBD5E1; color:#334155; background:#FFFFFF;">
          <span>✏️</span>
          <span>${isId ? 'Ubah Pantangan Pasien' : 'Edit Patient Restrictions'}</span>
        </button>
        <button type="button" class="btn btn-primary" onclick="mealPlanner.closeRestrictionsRecommendationModal()" style="font-size:13px; padding:8px 20px; border-radius:10px; font-weight:700; background:#0F766E; color:#FFFFFF; border:none; cursor:pointer;">
          ${isId ? 'Selesai & Tutup' : 'Done & Close'}
        </button>
      </div>
    `;
  }

  // Render Meal Planner UI (Concise preview on Dashboard vs Full Page with actions)
  renderPlanner() {
    const container1 = document.getElementById('meal-plan-list');
    const container2 = document.getElementById('meal-plan-list-full');
    if (!container1 && !container2) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const plans = NUTRIVISION_DATA.mealPlans[this.currentMode] || [];
    const isSoftTextureRequired = this.activeSymptoms.has('sulit-menelan');

    // Render for Dashboard (Concise Top 2 Preview)
    if (container1) {
      const previewPlans = plans.slice(0, 2);
      container1.innerHTML = previewPlans.map(item => {
        const nameStr = (item.name + ' ' + (item.nameEn || '')).toLowerCase();
        const isSoftItem = nameStr.includes('bubur') || 
                           nameStr.includes('porridge') ||
                           nameStr.includes('halus') || 
                           nameStr.includes('smooth') ||
                           nameStr.includes('kukus') ||
                           nameStr.includes('steamed') ||
                           nameStr.includes('tim') ||
                           nameStr.includes('chawanmushi');

        const displayName = isId ? item.name : (item.nameEn || item.name);
        const displayMacro = isId ? item.macro : (item.macroEn || item.macro.replace('kkal', 'kcal'));
        const displaySuitable = isId ? item.suitableFor : (item.suitableForEn || item.suitableFor);
        const displayBadge = isId ? item.badge : (item.badgeEn || item.badge);
        const swallowTag = isId ? '✓ Ramah Menelan' : '✓ Easy Swallowing';
        const matchedRestr = this._checkMealRestriction(displayName, displaySuitable);
        const warningTag = matchedRestr ? `<span class="restr-warning-badge" style="margin-top:4px;font-size:10px;">⚠️ ${isId ? 'Pantangan: ' : 'Restriction: '}${matchedRestr}</span>` : '';
        const warningCls = matchedRestr ? ' meal-plan-item-warning' : '';

        let clinicalBadge = '';
        if (typeof window !== 'undefined' && window.FoodClinicalValidator && window.app && window.app.userProfile) {
          const v = window.FoodClinicalValidator.validateFood({
            name: displayName,
            protein: item.protein || 22,
            calories: item.calories || 360,
            portionGrams: 150
          }, window.app.userProfile);
          if (v && v.safetyBadgeText) {
            const cls = v.safetyLevel === 'SAFE' ? 'teal' : (v.safetyLevel === 'CAUTION' ? 'amber' : 'coral');
            clinicalBadge = `<span class="badge ${cls}" style="margin-top:4px;font-size:10px;font-weight:700;">${v.safetyBadgeText}</span>`;
          }
        }

        return `
          <div class="meal-plan-item${warningCls}">
            <div class="meal-plan-info">
              <div class="name">${displayName}</div>
              <div class="macro">${displayMacro} · <span style="color:var(--teal-700)">${displaySuitable}</span></div>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                ${isSoftTextureRequired && isSoftItem ? `<span class="badge teal" style="margin-top:4px;font-size:10px;">${swallowTag}</span>` : ''}
                ${clinicalBadge}
                ${warningTag}
              </div>
            </div>
            <div class="meal-plan-meta">
              <div class="meal-plan-price">${item.price}</div>
              <span class="meal-plan-tag">${displayBadge}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render for Dedicated Full Page
    if (container2) {
      const customPlans = (window.app && typeof window.app.loadUserDailyMealPlans === 'function') 
        ? window.app.loadUserDailyMealPlans() 
        : [];

      let customHtml = '';
      if (customPlans.length > 0) {
        const slotMap = {
          breakfast: isId ? 'Sarapan' : 'Breakfast',
          lunch: isId ? 'Makan Siang' : 'Lunch',
          dinner: isId ? 'Makan Malam' : 'Dinner',
          snack: isId ? 'Camilan' : 'Snack'
        };

        customHtml = `
          <div style="margin-bottom:16px;">
            <div style="font-size:12.5px;font-weight:700;color:#0F766E;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="bookmark-check" style="width:16px;height:16px;"></i>
              <span>${isId ? 'Menu Terencana dari Katalog Pangan' : 'Planned Menus from Food Catalog'} (${customPlans.length})</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${customPlans.map(cp => `
                <div class="meal-plan-item" style="padding:12px 14px;border:1.5px solid #A7F3D0;background:#F0FDF4;">
                  <div class="meal-plan-info">
                    <div class="name" style="font-size:14.5px;font-weight:700;color:#064E3B;">${cp.name}</div>
                    <div class="macro" style="margin-top:2px;">${cp.portionGrams}g · ${cp.protein}g Protein · ${cp.calories} kkal</div>
                    <div style="display:flex;gap:6px;align-items:center;margin-top:5px;flex-wrap:wrap;">
                      <span class="meal-plan-tag" style="background:#D1FAE5;color:#065F46;border-color:#A7F3D0;">
                        ${slotMap[cp.slot] || cp.slot}
                      </span>
                      <span style="font-size:11.5px;color:#047857;font-weight:600;">${cp.price}</span>
                    </div>
                  </div>
                  <div class="meal-plan-meta" style="display:flex;align-items:center;gap:6px;">
                    <button type="button" class="btn-sm-teal" style="font-size:11px;padding:5px 10px;display:inline-flex;align-items:center;gap:4px;" onclick="mealPlanner.logMeal('${cp.name.replace(/'/g, "\\'")}', '${cp.protein}g Protein · ${cp.calories} kkal')">
                      <i data-lucide="plus-circle" class="btn-icon-sm"></i> ${isId ? 'Catat' : 'Log'}
                    </button>
                    <button type="button" style="all:unset;cursor:pointer;padding:5px;color:#EF4444;" title="${isId ? 'Hapus' : 'Delete'}" onclick="app.deleteUserMealPlan('${cp.id}')">
                      <i data-lucide="trash-2" style="width:15px;height:15px;"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      const defaultPlansHtml = plans.map(item => {
        const nameStr = (item.name + ' ' + (item.nameEn || '')).toLowerCase();
        const isSoftItem = nameStr.includes('bubur') || 
                           nameStr.includes('porridge') ||
                           nameStr.includes('halus') || 
                           nameStr.includes('smooth') ||
                           nameStr.includes('kukus') ||
                           nameStr.includes('steamed') ||
                           nameStr.includes('tim') ||
                           nameStr.includes('chawanmushi');

        const displayName = isId ? item.name : (item.nameEn || item.name);
        const displayMacro = isId ? item.macro : (item.macroEn || item.macro.replace('kkal', 'kcal'));
        const displaySuitable = isId ? item.suitableFor : (item.suitableForEn || item.suitableFor);
        const displayBadge = isId ? item.badge : (item.badgeEn || item.badge);
        const costLabel = isId ? 'Est. Biaya:' : 'Est. Cost:';
        const dysphagiaTag = isId ? '✓ Tekstur Lunak / Ramah Disfagia' : '✓ Soft Texture / Dysphagia Friendly';
        const logBtnText = isId ? 'Catat Asupan' : 'Log Meal';
        const matchedRestr = this._checkMealRestriction(displayName, displaySuitable);
        const warningTag = matchedRestr ? `<span class="restr-warning-badge" style="font-size:10.5px;">⚠️ ${isId ? 'Pantangan: ' : 'Restriction: '}${matchedRestr}</span>` : '';
        const warningCls = matchedRestr ? ' meal-plan-item-warning' : '';

        return `
          <div class="meal-plan-item${warningCls}" style="padding:14px;">
            <div class="meal-plan-info">
              <div class="name" style="font-size:15px;font-weight:600;">${displayName}</div>
              <div class="macro" style="margin-top:2px;">${displayMacro} · <span style="color:var(--teal-700);font-weight:500;">${displaySuitable}</span></div>
              <div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap;">
                <span class="meal-plan-tag">${displayBadge}</span>
                <span style="font-size:12px;color:var(--ink-soft);font-weight:600;">${costLabel} ${item.price}</span>
                ${isSoftTextureRequired && isSoftItem ? `<span class="badge teal" style="font-size:10.5px;">${dysphagiaTag}</span>` : ''}
                ${warningTag}
              </div>
            </div>
            <div class="meal-plan-meta">
              <button class="btn-sm-teal" style="font-size:11.5px;padding:6px 12px;display:inline-flex;align-items:center;gap:4px;" onclick="mealPlanner.logMeal('${displayName.replace(/'/g, "\\'")}', '${displayMacro.replace(/'/g, "\\'")}')">
                <i data-lucide="plus-circle" class="btn-icon-sm"></i> ${logBtnText}
              </button>
            </div>
          </div>
        `;
      }).join('');

      container2.innerHTML = customHtml + defaultPlansHtml;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  logMeal(mealName, macroStr) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    app.requireAuth(() => {
      // Parse protein and calories from macroStr e.g. "28g Protein · 420 kkal" or "420 kcal"
      let prot = 25;
      let cals = 380;
      const protMatch = macroStr.match(/(\d+)g Protein/i);
      const calsMatch = macroStr.match(/(\d+)\s*(?:kkal|kcal)/i);
      if (protMatch) prot = parseInt(protMatch[1], 10);
      if (calsMatch) cals = parseInt(calsMatch[1], 10);

      const userKey = app.userProfile?.contact || app.userProfile?.email || app.userProfile?.name;
      progressTracker.addLoggedMeal({
        protein: [prot, prot],
        carbs: [Math.round(cals * 0.5 / 4), Math.round(cals * 0.5 / 4)],
        fat: [Math.round(cals * 0.25 / 9), Math.round(cals * 0.25 / 9)],
        cals: [cals, cals]
      }, userKey, { name: mealName, source: isId ? 'Rencana Menu' : 'Meal Planner' });

      progressTracker.renderMacroDonut(app.userProfile.targets);
      progressTracker.renderWeeklyBarChart();
      app.showToast(isId ? `Menu "${mealName}" berhasil dicatat!` : `Meal "${mealName}" logged!`);
    }, isId ? 'catat menu' : 'log meal');
  }

  // Render Symptom-Aware Feedback using Clinical Nutrition & Food Filter AI Agent
  renderSymptomFilter(resultContainerId = 'symptom-result-box') {
    const container = document.getElementById(resultContainerId);
    if (!container) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const activeList = Array.from(this.activeSymptoms);
    const customList = this.getCustomRestrictions();

    if (activeList.length === 0) {
      container.innerHTML = `
        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;padding:24px;text-align:center;">
          <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:6px;">
            ${isId ? 'Kondisi Normal / Tanpa Gejala Spesifik' : 'Normal Condition / No Specific Symptoms'}
          </div>
          <p style="font-size:12.5px;color:#64748B;margin:0;max-width:520px;margin:0 auto;">
            ${isId ? 'Menu disajikan dengan variasi gizi lengkap seimbang sesuai target fase pemulihan Anda. Silakan pilih gejala di atas jika mengalami keluhan klinis.' : 'Menus are served with complete balanced nutrition tailored to your recovery phase target. Please select symptoms above if experiencing clinical symptoms.'}
          </p>
        </div>
      `;
      this.syncChipUI();
      this.renderRestrictionsUI();
      this.renderPlanner();
      return;
    }

    const agent = (typeof clinicalNutritionFilterAgent !== 'undefined' && clinicalNutritionFilterAgent) 
      ? clinicalNutritionFilterAgent 
      : ((typeof window !== 'undefined' && window.clinicalNutritionFilterAgent) 
        ? window.clinicalNutritionFilterAgent 
        : ((typeof global !== 'undefined' && global.clinicalNutritionFilterAgent) 
          ? global.clinicalNutritionFilterAgent 
          : null));
    const aiOutput = agent ? agent.process(activeList, customList) : null;

    if (!aiOutput) {
      return;
    }

    // Safety Level check (ensures clinical compliance & test assertions)
    const safetyLevel = aiOutput.safety_level || 'Standard';

    // Summary Card 1: IDDSI Safety Standard
    const textureTitle = (isId ? aiOutput.texture_title : (aiOutput.texture_title_en || aiOutput.texture_title)) || (safetyLevel === 'High' 
      ? (isId ? 'Standar Keamanan IDDSI Level 4 (Puree / Soft Mash)' : 'IDDSI Level 4 Safety Standard (Puree / Soft Mash)') 
      : (isId ? 'Standar Keamanan IDDSI Level 6 (Soft & Bite-Sized)' : 'IDDSI Level 6 Safety Standard (Soft & Bite-Sized)'));
    const textureSub = (isId ? aiOutput.texture_sub : (aiOutput.texture_sub_en || aiOutput.texture_sub)) || (isId 
      ? 'Homogen, aman risiko aspirasi, disajikan pada suhu ruang nyaman.' 
      : 'Homogeneous, safe from aspiration risk, served at comfortable room temperature.');

    // Summary Card: IDDSI Safety Standard
    const dualSummaryHtml = `
      <div class="symptom-dual-summary-grid">
        <div class="symptom-summary-card">
          <div class="symptom-summary-icon teal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div class="symptom-summary-text">
            <div class="symptom-summary-title">${textureTitle}</div>
            <div class="symptom-summary-sub" title="${textureSub}">${textureSub}</div>
          </div>
        </div>
      </div>
    `;

    // Filter recommendations strictly against patient's custom restrictions
    const rawRecommendations = aiOutput.recommended_menu || [];
    const safeRecommendations = rawRecommendations.filter(m => {
      const match = this._checkMealRestriction(m.name, (m.nameEn || '') + ' ' + (m.reason || ''));
      return !match;
    });

    this.currentRecommendations = safeRecommendations;

    // Recommended Menu Cards HTML
    const menuCount = safeRecommendations.length;
    const recomHeadSub = isId 
      ? `${menuCount} pilihan menu sesuai toleransi` 
      : `${menuCount} meal options based on tolerance`;

    let menuCardsHtml = '';
    if (menuCount === 0) {
      menuCardsHtml = `
        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px;text-align:center;color:#991B1B;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">
            ${isId ? 'Menu Terfilter Oleh Pantangan Personal' : 'Meals Filtered by Personal Dietary Restrictions'}
          </div>
          <p style="font-size:12px;margin:0;color:#B91C1C;">
            ${isId ? 'Semua menu standar untuk gejala ini mengandung bahan pantangan aktif Anda. Silakan kurangi pantangan atau hubungi instalasi gizi.' : 'All standard meals for these symptoms contain your active dietary restrictions.'}
          </p>
        </div>
      `;
    } else {
      menuCardsHtml = safeRecommendations.map(m => {
        const isSelected = this.selectedMealNames.has(m.name);
        const btnText = isSelected ? (isId ? '✓ Terpilih' : '✓ Selected') : (isId ? 'Pilih' : 'Select');
        const selectedClass = isSelected ? ' selected' : '';
        const mealName = isId ? m.name : (m.nameEn || m.name);
        const mealReason = isId ? m.reason : (m.reasonEn || m.reason);
        const rawNutrients = isId ? m.nutrients : (m.nutrientsEn || (m.nutrients ? m.nutrients.replace('kkal', 'kcal') : ''));
        const nutrientsStr = rawNutrients ? `<span class="symptom-recom-nutrients">${rawNutrients}</span>` : '';
        const textureCat = isId ? m.texture_category : (m.texture_category_en || m.texture_category);
        const tagClass = (m.texture_category && m.texture_category.toLowerCase().includes('soft')) ? ' soft-mash' : '';

        return `
          <div class="symptom-recom-card">
            <div class="symptom-recom-left">
              <div class="symptom-recom-meta-row">
                <span class="symptom-recom-name">${mealName}</span>
                <span class="symptom-recom-tag${tagClass}">${textureCat}</span>
                ${nutrientsStr}
              </div>
              <p class="symptom-recom-desc">${mealReason}</p>
            </div>
            <div class="symptom-recom-actions">
              <button type="button" class="btn-symptom-select${selectedClass}" 
                onclick="mealPlanner.selectSymptomMeal('${m.name.replace(/'/g, "\\'")}', this);">
                ${btnText}
              </button>
              <button type="button" class="btn-symptom-schedule-direct" 
                onclick="mealPlanner.applySingleMealToCalendar('${m.name.replace(/'/g, "\\'")}')"
                title="${isId ? 'Terapkan langsung ke jadwal kalender' : 'Apply directly to calendar schedule'}">
                <i data-lucide="calendar-plus" style="width:13px;height:13px;"></i>
                <span>${isId ? 'Jadwalkan' : 'Schedule'}</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Bottom Action Footer HTML
    const actionFooterHtml = `
      <div class="symptom-action-footer">
        <div class="symptom-footer-note">
          ${isId ? 'Pilihan menu akan diverifikasi oleh instalasi gizi sebelum penyajian.' : 'Selected meals will be verified by the clinical nutrition unit before serving.'}
        </div>
        <div class="symptom-footer-btns">
          <button type="button" class="btn-symptom-reset" onclick="mealPlanner.resetSymptoms();">
            ${isId ? 'Reset Pilihan' : 'Reset Selection'}
          </button>
          <button type="button" class="btn-symptom-apply" id="btn-symptom-apply-all" onclick="mealPlanner.applyToPatientMenu();">
            <i data-lucide="calendar-check" style="width:15px;height:15px;"></i>
            <span>${isId ? 'Terapkan ke Menu Pasien & Jadwal Kalender' : 'Apply to Patient Menu & Calendar Schedule'}</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = `
      ${dualSummaryHtml}
      
      <div class="symptom-recom-head">
        <h3 class="symptom-recom-title">${isId ? 'Rekomendasi Menu Terverifikasi' : 'Verified Menu Recommendations'}</h3>
        <span class="symptom-recom-sub">${recomHeadSub}</span>
      </div>

      <div class="symptom-recom-list">
        ${menuCardsHtml}
      </div>

      ${actionFooterHtml}
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }

    this.syncChipUI();
    this.renderRestrictionsUI();
    this.renderPlanner();
  }
}

const mealPlanner = new NutriVisionPlanner();
if (typeof window !== 'undefined') {
  window.mealPlanner = mealPlanner;
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('DOMContentLoaded', () => {
      mealPlanner.initRestrictions();
      mealPlanner.renderRestrictionsUI();
    });
  }
}
if (typeof global !== 'undefined') {
  global.mealPlanner = mealPlanner;
}


