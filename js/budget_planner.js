// NutriVision AI — Smart Food Budgeting & Meal Planner
// Merancang alokasi anggaran belanja makanan (7 hari s/d 30 hari)
// dan menghasilkan rekomendasi menu harian bernutrisi lengkap sesuai budget.

class NutriVisionBudgetPlanner {
  constructor() {
    this.budgetAmount = 200000; // Default: Rp 200.000
    this.durationDays = 7;      // Default: 7 hari (seminggu)
    this.activeDay = 1;         // Hari ke-1 aktif
    this.activeWeek = 1;        // Minggu ke-1 (untuk tampilan 14/30 hari)
    this.preference = 'seimbang'; // 'seimbang', 'tinggi_protein', 'tekstur_lunak'
    this.plan = [];             // Data menu per hari [ { day, dailyBudget, breakfast, lunch, dinner, totalCost, totalProt, totalCals } ]
    this.isPlanGenerated = false; // Status awal kosong: tunggu input & klik Perbarui
    
    // Basis Data Menu Pangan Lokal Bergizi & Terjangkau
    this.mealPool = {
      breakfast: [
        {
          id: 'bf-1',
          name: 'Bubur Ayam Kaldu Kuning Suwir + Telur Rebus 1 Butir',
          nameEn: 'Shredded Chicken Yellow Broth Porridge + 1 Boiled Egg',
          price: 8500,
          calories: 360,
          protein: 18,
          carbs: 48,
          fat: 8,
          texture: 'soft',
          badge: 'Ramah Cerna',
          badgeEn: 'Easy Digest',
          tier: 'budget',
          ingredients: 'Beras pulen, kaldu ayam kampung, dada ayam suwir, 1 butir telur rebus, taburan daun seledri'
        },
        {
          id: 'bf-2',
          name: 'Nasi Uduk Gurih + Telur Dadar Iris + Tahu Tempe Bacem',
          nameEn: 'Savory Coconut Rice + Sliced Omelet + Braised Tofu & Tempeh',
          price: 8000,
          calories: 380,
          protein: 16,
          carbs: 52,
          fat: 10,
          texture: 'regular',
          badge: 'Energi Padat',
          badgeEn: 'Energy Dense',
          tier: 'budget',
          ingredients: 'Beras, santan encer, telur dadar tipis, tempe & tahu bacem bumbu ketumbar'
        },
        {
          id: 'bf-3',
          name: 'Oatmeal Pisang Raja + Susu Kedelai Alami & Biji Wijen',
          nameEn: 'Banana Oatmeal + Natural Soy Milk & Sesame Seeds',
          price: 7500,
          calories: 320,
          protein: 13,
          carbs: 55,
          fat: 5,
          texture: 'soft',
          badge: 'Tinggi Serat',
          badgeEn: 'High Fiber',
          tier: 'super_budget',
          ingredients: 'Rolled oats 40g, susu kedelai murni tanpa pemanis buatan, 1 buah pisang raja iris'
        },
        {
          id: 'bf-4',
          name: 'Nasi Putih + Telur Mata Sapi Setengah Matang + Tumis Buncis Jagung',
          nameEn: 'White Rice + Sunny Side Up Egg + Sautéed Green Beans & Corn',
          price: 8000,
          calories: 350,
          protein: 15,
          carbs: 46,
          fat: 9,
          texture: 'regular',
          badge: 'Kaya Vitamin A',
          badgeEn: 'Rich in Vit A',
          tier: 'budget',
          ingredients: 'Nasi putih 1 porsi, telur ayam 1 btr, buncis iris, jagung manis pipil'
        },
        {
          id: 'bf-5',
          name: 'Bubur Kacang Hijau Santan Encer + Jahe Wangi Rendah Gula',
          nameEn: 'Mung Bean Porridge + Light Coconut Milk & Warm Ginger',
          price: 6500,
          calories: 310,
          protein: 12,
          carbs: 56,
          fat: 4,
          texture: 'soft',
          badge: 'Mineral Seng & Besi',
          badgeEn: 'Zinc & Iron',
          tier: 'super_budget',
          ingredients: 'Kacang hijau rebus empuk, santan encer, jahe geprek, gula aren secukupnya'
        },
        {
          id: 'bf-6',
          name: 'Roti Gandum Panggang + Telur Rebus Cincang & Lalap Tomat',
          nameEn: 'Toasted Whole Wheat Bread + Mashed Boiled Egg & Tomato',
          price: 9000,
          calories: 340,
          protein: 17,
          carbs: 38,
          fat: 9,
          texture: 'regular',
          badge: 'Karbohidrat Kompleks',
          badgeEn: 'Complex Carbs',
          tier: 'optimal',
          ingredients: '2 lembar roti gandum utuh, 1 butir telur rebus cincang, irisan tomat segar'
        },
        {
          id: 'bf-7',
          name: 'Lontong Sayur Labu Siam Bening + Telur Rebus Bumbu Kuning',
          nameEn: 'Chayote Squash Lontong + Boiled Egg in Turmeric Broth',
          price: 8500,
          calories: 360,
          protein: 16,
          carbs: 50,
          fat: 7,
          texture: 'soft',
          badge: 'Kaya Antioksidan',
          badgeEn: 'Antioxidant Rich',
          tier: 'budget',
          ingredients: 'Lontong beras, kuah labu siam bumbu kuning rempah, 1 butir telur ayam rebus'
        },
        {
          id: 'bf-8',
          name: 'Bubur Tim Ayam Suwir Labu Kuning Halus',
          nameEn: 'Steamed Chicken & Yellow Pumpkin Porridge',
          price: 8000,
          calories: 310,
          protein: 16,
          carbs: 45,
          fat: 6,
          texture: 'soft',
          badge: 'Ramah Lambung/Disfagia',
          badgeEn: 'Dysphagia Friendly',
          tier: 'budget',
          ingredients: 'Beras tim halus, labu kuning kukus lumat, kaldu ayam gurih, ayam cincang halus'
        }
      ],
      lunch: [
        {
          id: 'lu-1',
          name: 'Nasi Putih + Dada Ayam Ungkep Kunyit + Sayur Bening Bayam Jagung',
          nameEn: 'White Rice + Turmeric Braised Chicken Breast + Spinach Corn Soup',
          price: 13500,
          calories: 520,
          protein: 34,
          carbs: 64,
          fat: 9,
          texture: 'regular',
          badge: 'Tinggi Protein Otot',
          badgeEn: 'High Muscle Protein',
          tier: 'budget',
          ingredients: 'Nasi putih 1 porsi, dada ayam fillet 100g ungkep kunyit jahe, bayam hijau segar, jagung manis'
        },
        {
          id: 'lu-2',
          name: 'Nasi Putih + Ikan Kembung Bakar Kunyit + Lalapan Labu Kukus & Sambal Tomat',
          nameEn: 'White Rice + Grilled Turmeric Mackerel + Steamed Chayote & Tomato Relish',
          price: 13000,
          calories: 490,
          protein: 28,
          carbs: 62,
          fat: 10,
          texture: 'regular',
          badge: 'Kaya Omega-3 Alami',
          badgeEn: 'Natural Omega-3',
          tier: 'budget',
          ingredients: 'Nasi putih, 1 ekor ikan kembung segar panggang rempah, labu siam kukus lembut, tomat segar'
        },
        {
          id: 'lu-3',
          name: 'Nasi Tim Ikan Gabus Kukus Albumin + Sup Wortel Kentang Bening',
          nameEn: 'Steamed Snakehead Fish (Albumin) + Clear Carrot Potato Soup',
          price: 15000,
          calories: 470,
          protein: 32,
          carbs: 60,
          fat: 7,
          texture: 'soft',
          badge: 'Pemulihan Sel / Albumin',
          badgeEn: 'Albumin Cell Repair',
          tier: 'optimal',
          ingredients: 'Nasi tim pulen, 100g ikan gabus kukus jahe daun bawang, wortel, kentang rebus empuk'
        },
        {
          id: 'lu-4',
          name: 'Nasi Putih + Telur Balado Rebus (2 btr) + Tempe Bacem Kukus + Tumis Kangkung',
          nameEn: 'White Rice + 2 Boiled Eggs Sambal + Steamed Tempeh + Water Spinach',
          price: 11500,
          calories: 530,
          protein: 26,
          carbs: 68,
          fat: 12,
          texture: 'regular',
          badge: 'Hemat Super Bergizi',
          badgeEn: 'Super Budget Nutrient',
          tier: 'super_budget',
          ingredients: 'Nasi putih, 2 btr telur rebus balado cabai merah tomat, 2 potong tempe bacem, kangkung segar'
        },
        {
          id: 'lu-5',
          name: 'Nasi Merah + Ayam Suwir Kemangi Gurih + Tumis Jamur Tiram Bawang Putih',
          nameEn: 'Brown Rice + Basil Shredded Chicken + Garlic Sautéed Oyster Mushroom',
          price: 14500,
          calories: 500,
          protein: 31,
          carbs: 60,
          fat: 8,
          texture: 'regular',
          badge: 'Anti-Inflamasi',
          badgeEn: 'Anti-Inflammatory',
          tier: 'optimal',
          ingredients: 'Nasi merah pulen, dada ayam suwir daun kemangi segar, jamur tiram ditumis minyak jagung sedikit'
        },
        {
          id: 'lu-6',
          name: 'Nasi Putih + Ikan Bandeng Presto Kukus + Sayur Asem Bening Segar',
          nameEn: 'White Rice + Steamed Pressure Cooked Milkfish + Clear Tamarind Soup',
          price: 14000,
          calories: 480,
          protein: 29,
          carbs: 63,
          fat: 9,
          texture: 'regular',
          badge: 'Kalsium & Fosfor Tulang',
          badgeEn: 'Bone Calcium & Phosphorus',
          tier: 'budget',
          ingredients: 'Nasi putih, 1 potong ikan bandeng presto lunak duri, sayur asem kacang panjang labu siam'
        },
        {
          id: 'lu-7',
          name: 'Nasi Putih + Sup Ayam Makaroni Wortel + Telur Puyuh (3 btr)',
          nameEn: 'White Rice + Chicken Macaroni Carrot Soup + 3 Quail Eggs',
          price: 13500,
          calories: 490,
          protein: 27,
          carbs: 65,
          fat: 9,
          texture: 'soft',
          badge: 'Segar & Kaya Kalium',
          badgeEn: 'Hydrating & Potassium',
          tier: 'budget',
          ingredients: 'Nasi putih, ayam kaldu bening, makaroni empuk, wortel cincang, 3 butir telur puyuh rebus'
        },
        {
          id: 'lu-8',
          name: 'Nasi Putih + Tahu Tempe Bacem Kuah Semur + Bening Oyong Soun',
          nameEn: 'White Rice + Braised Tofu Tempeh Stew + Luffa Glass Noodle Soup',
          price: 10500,
          calories: 460,
          protein: 23,
          carbs: 66,
          fat: 8,
          texture: 'soft',
          badge: 'Ramah Lambung',
          badgeEn: 'Gastric Friendly',
          tier: 'super_budget',
          ingredients: 'Nasi putih, 3 potong tahu tempe bumbu semur manis gurih, oyong rebus empuk, soun'
        }
      ],
      dinner: [
        {
          id: 'di-1',
          name: 'Nasi Putih + Sup Tahu Sutra Telur Puyuh Rebus + Wortel Bening',
          nameEn: 'White Rice + Silken Tofu Quail Egg Soup + Clear Carrots',
          price: 9500,
          calories: 390,
          protein: 20,
          carbs: 52,
          fat: 7,
          texture: 'soft',
          badge: 'Ringan & Menenangkan',
          badgeEn: 'Light & Soothing',
          tier: 'super_budget',
          ingredients: 'Nasi putih, tahu sutra putih potong dadu, 4 btr telur puyuh, kaldu sayur bening, wortel'
        },
        {
          id: 'di-2',
          name: 'Nasi Tim Ayam Cincang Jamur Tiram + Sayur Bening Daun Katuk',
          nameEn: 'Steamed Chicken Mushroom Rice + Katuk Leaf Clear Broth',
          price: 11500,
          calories: 430,
          protein: 25,
          carbs: 55,
          fat: 8,
          texture: 'soft',
          badge: 'Anti-Kelelahan',
          badgeEn: 'Anti-Fatigue',
          tier: 'budget',
          ingredients: 'Nasi tim pulen gurih, cincangan dada ayam dan jamur tiram bumbu kecap manis sedikit, daun katuk segar'
        },
        {
          id: 'di-3',
          name: 'Nasi Putih + Telur Dadar Daun Bawang + Tempe Bacem Panggang + Sayur Bening Labu',
          nameEn: 'White Rice + Scallion Omelet + Grilled Tempeh + Chayote Soup',
          price: 9000,
          calories: 410,
          protein: 19,
          carbs: 54,
          fat: 10,
          texture: 'regular',
          badge: 'Ekonomis & Lezat',
          badgeEn: 'Budget & Delicious',
          tier: 'super_budget',
          ingredients: 'Nasi putih, telur dadar daun bawang, 2 potong tempe bacem, kuah bening labu siam'
        },
        {
          id: 'di-4',
          name: 'Nasi Putih + Ikan Tongkol Suwir Tomat Segar + Sayur Bening Bayam',
          nameEn: 'White Rice + Shredded Tuna in Fresh Tomato + Clear Spinach',
          price: 11000,
          calories: 430,
          protein: 26,
          carbs: 53,
          fat: 8,
          texture: 'regular',
          badge: 'Protein Padat Rendah Lemak',
          badgeEn: 'Lean Dense Protein',
          tier: 'budget',
          ingredients: 'Nasi putih, suwiran ikan tongkol segar kukus bumbu tomat manis, daun bayam rebus'
        },
        {
          id: 'di-5',
          name: 'Nasi Putih + Sup Ayam Bening Jagung Wortel + Perkedel Tahu Kukus',
          nameEn: 'White Rice + Chicken Corn Carrot Soup + Steamed Tofu Patties',
          price: 11000,
          calories: 420,
          protein: 24,
          carbs: 56,
          fat: 7,
          texture: 'soft',
          badge: 'Cepat Diserap Tubuh',
          badgeEn: 'Quick Absorption',
          tier: 'budget',
          ingredients: 'Nasi putih, potongan ayam sup kaldu gurih, jagung manis, wortel, perkedel tahu daun bawang'
        },
        {
          id: 'di-6',
          name: 'Nasi Merah + Pepes Tahu Ikan Teri Basah Segar + Lalap Labu Siam',
          nameEn: 'Brown Rice + Steamed Tofu & Fresh Anchovy Pepes + Boiled Chayote',
          price: 10500,
          calories: 390,
          protein: 22,
          carbs: 50,
          fat: 6,
          texture: 'soft',
          badge: 'Kaya Kalsium Alami',
          badgeEn: 'Natural Calcium',
          tier: 'budget',
          ingredients: 'Nasi merah, pepes daun pisang isi tahu lumat dan teri basah kaya kalsium, lalapan labu siam'
        },
        {
          id: 'di-7',
          name: 'Nasi Putih + Orak-Arik Telur Buncis Wortel + Tempe Krispi Tipis',
          nameEn: 'White Rice + Scrambled Egg with Green Beans & Carrot + Crisp Tempeh',
          price: 9000,
          calories: 400,
          protein: 19,
          carbs: 52,
          fat: 9,
          texture: 'regular',
          badge: 'Kaya Serat Pangan',
          badgeEn: 'Rich in Fiber',
          tier: 'super_budget',
          ingredients: 'Nasi putih, 1 butir telur orak-arik dengan potongan buncis manis dan wortel, tempe goreng tipis'
        },
        {
          id: 'di-8',
          name: 'Sup Krim Labu Kuning Kentang + Telur Rebus Cincang & Roti Gandum',
          nameEn: 'Pumpkin Potato Cream Soup + Chopped Boiled Egg & Whole Wheat',
          price: 9500,
          calories: 360,
          protein: 17,
          carbs: 48,
          fat: 6,
          texture: 'soft',
          badge: 'Sangat Ramah Cerna',
          badgeEn: 'Ultra Gentle',
          tier: 'budget',
          ingredients: 'Labu kuning & kentang blender lembut dengan susu kedelai gurih, 1 telur rebus cincang, selembar roti'
        }
      ]
    };
  }

  init() {
    this.bindInputs();
    const isDemo = Boolean(window.app?.userProfile?.isDemo);
    let savedPlan = null;
    try {
      if (typeof localStorage !== 'undefined') {
        savedPlan = localStorage.getItem('nutrivision_budget_generated');
      }
    } catch(e) {}

    const inputAmount = document.getElementById('budget-input-amount');
    if (isDemo || savedPlan === 'true') {
      this.isPlanGenerated = true;
      if (inputAmount && !inputAmount.value) {
        inputAmount.value = this.formatRupiah(this.budgetAmount);
      }
    } else {
      this.isPlanGenerated = false;
      if (inputAmount) {
        inputAmount.value = '';
      }
    }
    this.generatePlan();
    this.render();
    this.initRegionSelector();
  }

  bindInputs() {
    const inputAmount = document.getElementById('budget-input-amount');
    if (inputAmount) {
      inputAmount.addEventListener('input', (e) => {
        let raw = e.target.value.replace(/[^0-9]/g, '');
        if (!raw) {
          e.target.value = '';
          return;
        }
        let num = parseInt(raw, 10);
        if (isNaN(num)) num = 0;
        this.budgetAmount = num;
        e.target.value = this.formatRupiah(num);
      });

      inputAmount.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.applyBudgetUpdate();
        }
      });
    }
  }

  async initRegionSelector() {
    const provSelect = document.getElementById('budget-select-province');
    const citySelect = document.getElementById('budget-select-city');
    const badgeEl = document.getElementById('budget-region-badge');
    const descEl = document.getElementById('budget-region-desc');
    if (!provSelect || !window.BappenasFoodAPI) return;

    try {
      const activeRegion = window.BappenasFoodAPI.getActiveRegion();
      const provinces = await window.BappenasFoodAPI.getProvinces();

      // Isi dropdown Provinsi
      provSelect.innerHTML = provinces.map(p => 
        `<option value="${p.id}" ${(p.name.toLowerCase() === activeRegion.provinceName.toLowerCase() || p.id === activeRegion.provinceId) ? 'selected' : ''}>${p.name} (${p.multiplier}x)</option>`
      ).join('');

      // Update Badge & Keterangan
      if (badgeEl) {
        badgeEl.textContent = `Bapanas RI · ${activeRegion.multiplier.toFixed(2)}x`;
      }
      if (descEl) {
        descEl.textContent = `Wilayah: ${activeRegion.label || activeRegion.provinceName} (${activeRegion.zone || 'Regional'})`;
      }

      // Isi dropdown Kota untuk provinsi awal
      const selProvId = provSelect.value || activeRegion.provinceId || 11;
      await this.populateCities(selProvId, activeRegion.cityName);

      // Dengarkan perubahan wilayah dari komponen lain
      window.BappenasFoodAPI.onRegionChange((reg) => {
        if (badgeEl) badgeEl.textContent = `Bapanas RI · ${reg.multiplier.toFixed(2)}x`;
        if (descEl) descEl.textContent = `Wilayah: ${reg.label} (${reg.zone})`;
        if (provSelect && provSelect.value != reg.provinceId) {
          provSelect.value = reg.provinceId;
          this.populateCities(reg.provinceId, reg.cityName);
        }
        this.generatePlan();
        this.render();
      });
    } catch (e) {
      console.warn('Init region selector notice:', e);
    }
  }

  async populateCities(provinceId, selectedCityName = '') {
    const citySelect = document.getElementById('budget-select-city');
    if (!citySelect || !window.BappenasFoodAPI) return;

    try {
      const cities = await window.BappenasFoodAPI.getCities(provinceId);
      citySelect.innerHTML = cities.map(c => 
        `<option value="${c.name}" ${selectedCityName && c.name.toLowerCase() === selectedCityName.toLowerCase() ? 'selected' : ''}>${c.name}</option>`
      ).join('');
    } catch (e) {
      citySelect.innerHTML = `<option value="Semua Wilayah">Semua Wilayah</option>`;
    }
  }

  async onProvinceSelectChange(provinceId) {
    if (!window.BappenasFoodAPI) return;
    const provinces = await window.BappenasFoodAPI.getProvinces();
    const matched = provinces.find(p => p.id === parseInt(provinceId, 10));
    if (!matched) return;

    await this.populateCities(provinceId);
    const citySelect = document.getElementById('budget-select-city');
    const cityName = citySelect ? citySelect.value : 'Semua Wilayah';

    window.BappenasFoodAPI.setActiveRegion({
      provinceId: matched.id,
      provinceName: matched.name,
      cityName: cityName,
      multiplier: matched.multiplier,
      zone: matched.zone,
      label: `${matched.name} · ${cityName}`
    });

    this.generatePlan();
    this.render();
  }

  onCitySelectChange(cityName) {
    if (!window.BappenasFoodAPI) return;
    const active = window.BappenasFoodAPI.getActiveRegion();
    window.BappenasFoodAPI.setActiveRegion({
      ...active,
      cityName: cityName,
      label: `${active.provinceName} · ${cityName}`
    });

    this.generatePlan();
    this.render();
  }

  applyBudgetUpdate() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const inputAmount = document.getElementById('budget-input-amount');
    let num = 0;
    if (inputAmount && inputAmount.value) {
      const raw = inputAmount.value.replace(/[^0-9]/g, '');
      num = parseInt(raw, 10);
    }
    if (!num || isNaN(num) || num < 15000) {
      num = this.durationDays === 30 ? 1000000 : 200000;
      this.budgetAmount = num;
      if (inputAmount) inputAmount.value = this.formatRupiah(num);
    } else {
      this.budgetAmount = num;
    }

    this.isPlanGenerated = true;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('nutrivision_budget_generated', 'true');
      }
    } catch (e) {}

    this.generatePlan();
    this.render();

    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(isId 
        ? `✅ Rencana anggaran ${this.formatRupiah(this.budgetAmount)} (${this.durationDays} hari) berhasil diperbarui!` 
        : `✅ Budget plan ${this.formatRupiah(this.budgetAmount)} (${this.durationDays} days) updated!`);
    }
  }

  selectPresetQuick(amount, days) {
    this.budgetAmount = amount;
    this.durationDays = days;
    const inputAmount = document.getElementById('budget-input-amount');
    if (inputAmount) inputAmount.value = this.formatRupiah(amount);
    this.updateDurationUI();
    this.applyBudgetUpdate();
  }

  setPresetBudget(amount, days = null) {
    this.budgetAmount = amount;
    if (days) {
      this.durationDays = days;
    }
    const inputAmount = document.getElementById('budget-input-amount');
    if (inputAmount) {
      inputAmount.value = this.formatRupiah(amount);
    }
    this.isPlanGenerated = true;
    this.updateDurationUI();
    this.updatePresetButtonsUI();
    this.generatePlan();
    this.render();
  }

  setDuration(days) {
    this.durationDays = days;
    this.activeDay = 1;
    this.activeWeek = 1;
    const inputAmount = document.getElementById('budget-input-amount');
    if (inputAmount && inputAmount.value) {
      if (days === 30 && this.budgetAmount <= 350000) {
        this.budgetAmount = 1000000;
        inputAmount.value = this.formatRupiah(1000000);
      } else if (days === 7 && this.budgetAmount >= 900000) {
        this.budgetAmount = 200000;
        inputAmount.value = this.formatRupiah(200000);
      }
    }
    this.updateDurationUI();
    if (this.isPlanGenerated) {
      this.generatePlan();
      this.render();
    }
  }

  setPreference(pref) {
    this.preference = pref;
    this.generatePlan();
    if (this.isPlanGenerated) {
      this.render();
    }
  }

  updateDurationUI() {
    const pills = document.querySelectorAll('.budget-duration-pill');
    pills.forEach(pill => {
      const d = parseInt(pill.getAttribute('data-days'), 10);
      if (d === this.durationDays) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  updatePresetButtonsUI() {
    const buttons = document.querySelectorAll('.budget-preset-chip, .btn-simple-preset');
    buttons.forEach(btn => {
      const amt = parseInt(btn.getAttribute('data-amount'), 10);
      const days = parseInt(btn.getAttribute('data-days'), 10);
      if (amt === this.budgetAmount && (!days || days === this.durationDays)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Menghitung jadwal menu makanan harian sesuai budget & preferensi
  generatePlan() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const dailyTargetBudget = Math.max(15000, Math.floor(this.budgetAmount / this.durationDays));
    this.plan = [];

    const region = (window.BappenasFoodAPI ? window.BappenasFoodAPI.getActiveRegion() : null) || { multiplier: 1.00 };
    const mult = region.multiplier || 1.00;

    // Filter makanan jika ada preferensi tekstur lunak & kalibrasikan ke harga pangan daerah
    let bfPool = this.mealPool.breakfast.map(m => ({ ...m, price: Math.round(m.price * mult / 500) * 500 }));
    let luPool = this.mealPool.lunch.map(m => ({ ...m, price: Math.round(m.price * mult / 500) * 500 }));
    let diPool = this.mealPool.dinner.map(m => ({ ...m, price: Math.round(m.price * mult / 500) * 500 }));

    if (this.preference === 'tekstur_lunak') {
      const softBf = bfPool.filter(m => m.texture === 'soft');
      const softLu = luPool.filter(m => m.texture === 'soft');
      const softDi = diPool.filter(m => m.texture === 'soft');
      if (softBf.length > 0) bfPool = softBf;
      if (softLu.length > 0) luPool = softLu;
      if (softDi.length > 0) diPool = softDi;
    } else if (this.preference === 'tinggi_protein') {
      bfPool.sort((a, b) => b.protein - a.protein);
      luPool.sort((a, b) => b.protein - a.protein);
      diPool.sort((a, b) => b.protein - a.protein);
    }

    // Jika budget sangat rendah (misal di bawah Rp 25.000/hari), utamakan tier super_budget & budget
    if (dailyTargetBudget < 25000) {
      bfPool.sort((a, b) => a.price - b.price);
      luPool.sort((a, b) => a.price - b.price);
      diPool.sort((a, b) => a.price - b.price);
    }

    // Jika budget harian tertentu, urutkan pool atau filter agar pas dengan budget
    // Target pembagian: Sarapan ~28%, Makan Siang ~42%, Makan Malam ~30%
    const targetBfCost = dailyTargetBudget * 0.28;
    const targetLuCost = dailyTargetBudget * 0.42;
    const targetDiCost = dailyTargetBudget * 0.30;

    for (let dayNum = 1; dayNum <= this.durationDays; dayNum++) {
      // Rotasi cerdas berdasarkan dayNum agar variasi terjaga selama 7 atau 30 hari
      const bfIdx = (dayNum - 1) % bfPool.length;
      const luIdx = (dayNum - 1 + Math.floor(dayNum / 3)) % luPool.length;
      const diIdx = (dayNum - 1 + Math.floor(dayNum / 2)) % diPool.length;

      let bf = { ...bfPool[bfIdx] };
      let lu = { ...luPool[luIdx] };
      let di = { ...diPool[diIdx] };

      let currentSum = bf.price + lu.price + di.price;

      // Jika melebihi dailyTargetBudget, cari variasi yang lebih hemat dari pool
      if (currentSum > dailyTargetBudget) {
        // Coba cari alternatif makan siang atau sarapan yang lebih hemat
        const cheaperLu = luPool.find(m => m.price <= targetLuCost);
        if (cheaperLu) lu = { ...cheaperLu };
        
        currentSum = bf.price + lu.price + di.price;
        if (currentSum > dailyTargetBudget) {
          const cheaperBf = bfPool.find(m => m.price <= targetBfCost);
          if (cheaperBf) bf = { ...cheaperBf };
        }

        currentSum = bf.price + lu.price + di.price;
        if (currentSum > dailyTargetBudget) {
          const cheaperDi = diPool.find(m => m.price <= targetDiCost);
          if (cheaperDi) di = { ...cheaperDi };
        }
      }

      // Jika masih ada sisa selisih (misal budget sangat ketat), sesuaikan proporsional porsi
      let costScale = 1.0;
      currentSum = bf.price + lu.price + di.price;
      if (currentSum > dailyTargetBudget) {
        costScale = Math.min(1.0, dailyTargetBudget / currentSum);
      } else if (dailyTargetBudget > 55000) {
        costScale = 1.25; // Porsi ekstra untuk budget leluasa
      }

      const bfCost = Math.round(bf.price * costScale / 100) * 100;
      const luCost = Math.round(lu.price * costScale / 100) * 100;
      const diCost = Math.round(di.price * costScale / 100) * 100;

      const totalDayCost = bfCost + luCost + diCost;
      const totalDayProtein = Math.round((bf.protein + lu.protein + di.protein) * Math.max(0.9, costScale));
      const totalDayCalories = Math.round((bf.calories + lu.calories + di.calories) * Math.max(0.9, costScale));

      this.plan.push({
        dayNumber: dayNum,
        dayLabel: isId ? `Hari ${dayNum}` : `Day ${dayNum}`,
        weekNumber: Math.ceil(dayNum / 7),
        dailyBudget: dailyTargetBudget,
        breakfast: { ...bf, appliedCost: bfCost },
        lunch: { ...lu, appliedCost: luCost },
        dinner: { ...di, appliedCost: diCost },
        totalDayCost,
        totalDayProtein,
        totalDayCalories,
        savings: dailyTargetBudget - totalDayCost
      });
    }

    // Pastikan activeDay valid
    if (this.activeDay > this.durationDays) {
      this.activeDay = 1;
    }
    this.activeWeek = Math.ceil(this.activeDay / 7);
  }

  selectDay(dayNum) {
    if (dayNum < 1 || dayNum > this.durationDays) return;
    this.activeDay = dayNum;
    this.activeWeek = Math.ceil(dayNum / 7);
    this.render();
  }

  selectWeek(weekNum) {
    this.activeWeek = weekNum;
    const startDay = (weekNum - 1) * 7 + 1;
    this.activeDay = Math.min(startDay, this.durationDays);
    this.render();
  }

  // Menukar variasi salah satu waktu makan (Sarapan, Siang, atau Malam)
  swapMeal(dayNum, mealType) {
    const dayPlan = this.plan.find(p => p.dayNumber === dayNum);
    if (!dayPlan) return;

    const pool = this.mealPool[mealType] || [];
    if (pool.length <= 1) return;

    const currentId = dayPlan[mealType]?.id;
    let currentIndex = pool.findIndex(m => m.id === currentId);
    let nextIndex = (currentIndex + 1) % pool.length;
    let nextMeal = pool[nextIndex];

    const dailyTargetBudget = dayPlan.dailyBudget;
    let costScale = 1.0;
    if (dailyTargetBudget > 55000) costScale = 1.25;
    else if (dailyTargetBudget < 24000) costScale = 0.85;

    const newCost = Math.round(nextMeal.price * costScale / 100) * 100;
    dayPlan[mealType] = { ...nextMeal, appliedCost: newCost };

    // Update total hari itu
    dayPlan.totalDayCost = dayPlan.breakfast.appliedCost + dayPlan.lunch.appliedCost + dayPlan.dinner.appliedCost;
    dayPlan.totalDayProtein = Math.round((dayPlan.breakfast.protein + dayPlan.lunch.protein + dayPlan.dinner.protein) * costScale);
    dayPlan.totalDayCalories = Math.round((dayPlan.breakfast.calories + dayPlan.lunch.calories + dayPlan.dinner.calories) * costScale);
    dayPlan.savings = dayPlan.dailyBudget - dayPlan.totalDayCost;

    this.render();

    // Animasi feedback visual
    const cardEl = document.getElementById(`meal-card-${mealType}`);
    if (cardEl) {
      cardEl.classList.add('meal-card-swapped');
      setTimeout(() => cardEl.classList.remove('meal-card-swapped'), 400);
    }
  }

  // Hitung agregasi daftar belanja bahan pokok (Grocery Shopping List) untuk seluruh periode
  getGrocerySummary() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const totalDays = this.durationDays;
    const ratio = totalDays / 7;
    const region = (window.BappenasFoodAPI ? window.BappenasFoodAPI.getActiveRegion() : null) || {
      provinceName: 'DKI Jakarta',
      cityName: 'Kota Jakarta Selatan',
      multiplier: 1.00,
      zone: 'Zona 1 (Jawa & Bali)',
      label: 'DKI Jakarta · Jakarta Selatan'
    };
    const mult = region.multiplier || 1.00;

    // Perhitungan porsi realistis berbasis gizi & referensi pasar Bapanas regional
    const items = [
      {
        category: isId ? 'Bahan Pokok & Karbohidrat' : 'Staples & Carbs',
        name: isId ? 'Beras Pulen Premium / Merah' : 'Premium White / Brown Rice',
        qty: `${(2.2 * ratio).toFixed(1)} kg`,
        estPrice: Math.round(32000 * ratio * mult / 1000) * 1000,
        note: isId ? `Acuan Bapanas: Rp ${(Math.round(14900 * mult / 500) * 500).toLocaleString('id-ID')}/kg` : `Bapanas: Rp ${(Math.round(14900 * mult / 500) * 500).toLocaleString('id-ID')}/kg`
      },
      {
        category: isId ? 'Bahan Pokok & Karbohidrat' : 'Staples & Carbs',
        name: isId ? 'Oatmeal / Roti Gandum / Jagung Manis' : 'Oatmeal / Whole Wheat / Sweet Corn',
        qty: `${Math.ceil(1 * ratio)} pack/kg`,
        estPrice: Math.round(18000 * ratio * mult / 1000) * 1000,
        note: isId ? 'Sumber serat basal' : 'Dietary fiber source'
      },
      {
        category: isId ? 'Lauk Hewani & Protein Tinggi' : 'Animal Protein & High Protein',
        name: isId ? 'Telur Ayam Ras / Omega-3' : 'Farm / Omega-3 Eggs',
        qty: `${Math.round(16 * ratio)} butir (~${(1 * ratio).toFixed(1)} kg)`,
        estPrice: Math.round(29000 * ratio * mult / 1000) * 1000,
        note: isId ? `Acuan Bapanas: Rp ${(Math.round(28500 * mult / 500) * 500).toLocaleString('id-ID')}/kg` : `Bapanas: Rp ${(Math.round(28500 * mult / 500) * 500).toLocaleString('id-ID')}/kg`
      },
      {
        category: isId ? 'Lauk Hewani & Protein Tinggi' : 'Animal Protein & High Protein',
        name: isId ? 'Dada Ayam Fillet Bersih' : 'Clean Chicken Breast Fillet',
        qty: `${(0.8 * ratio).toFixed(1)} kg`,
        estPrice: Math.round(35000 * ratio * mult / 1000) * 1000,
        note: isId ? `Acuan Bapanas: Rp ${(Math.round(35000 * mult / 500) * 500).toLocaleString('id-ID')}/kg` : `Bapanas: Rp ${(Math.round(35000 * mult / 500) * 500).toLocaleString('id-ID')}/kg`
      },
      {
        category: isId ? 'Lauk Hewani & Protein Tinggi' : 'Animal Protein & High Protein',
        name: isId ? 'Ikan Segar (Kembung / Bandeng / Gabus)' : 'Fresh Fish (Mackerel / Milkfish / Gabus)',
        qty: `${(0.9 * ratio).toFixed(1)} kg`,
        estPrice: Math.round(36000 * ratio * mult / 1000) * 1000,
        note: isId ? `Acuan Bapanas: Rp ${(Math.round(34000 * mult / 500) * 500).toLocaleString('id-ID')}/kg` : `Bapanas: Rp ${(Math.round(34000 * mult / 500) * 500).toLocaleString('id-ID')}/kg`
      },
      {
        category: isId ? 'Lauk Nabati (Tempe & Tahu)' : 'Plant Protein (Tempeh & Tofu)',
        name: isId ? 'Tempe Kedelai Murni & Tahu Putih Sutra' : 'Pure Soybean Tempeh & Silken Tofu',
        qty: `${Math.round(6 * ratio)} papan / pack`,
        estPrice: Math.round(16000 * ratio * mult / 1000) * 1000,
        note: isId ? 'Isoflavon & protein ramah kantong' : 'Isoflavones & cost-effective'
      },
      {
        category: isId ? 'Sayuran Segar & Serat' : 'Fresh Vegetables & Fiber',
        name: isId ? 'Bayam Hijau, Labu Siam, Wortel, Buncis' : 'Spinach, Chayote, Carrots, Green Beans',
        qty: `${(1.8 * ratio).toFixed(1)} kg (aneka)`,
        estPrice: Math.round(22000 * ratio * mult / 1000) * 1000,
        note: isId ? 'Vitamin A, C, kalium & serat larut' : 'Vit A, C, potassium & fiber'
      },
      {
        category: isId ? 'Bumbu Alami & Minyak' : 'Spices, Seasoning & Healthy Oils',
        name: isId ? 'Bawang Merah/Putih, Kunyit, Jahe, Minyak' : 'Shallots, Garlic, Turmeric, Ginger, Oil',
        qty: isId ? '1 paket dapur' : '1 pantry kit',
        estPrice: Math.round(15000 * ratio * mult / 1000) * 1000,
        note: isId ? 'Rempah antioksidan alami' : 'Natural antioxidant herbs'
      }
    ];

    const grandTotal = items.reduce((acc, it) => acc + it.estPrice, 0);

    return {
      durationDays: totalDays,
      ratio,
      region,
      items,
      grandTotal
    };
  }

  // Buka Modal Daftar Belanja Bahan
  openGroceryModal() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const summary = this.getGrocerySummary();
    const modal = document.getElementById('modal-budget-grocery');
    if (!modal) return;

    const listContainer = document.getElementById('budget-grocery-list-container');
    const totalEl = document.getElementById('budget-grocery-total-text');
    const titleEl = document.getElementById('budget-grocery-title');
    const subEl = document.getElementById('budget-grocery-subtitle');

    if (titleEl) {
      titleEl.textContent = isId 
        ? `Daftar Belanja Pangan (${summary.durationDays} Hari)` 
        : `Grocery Shopping List (${summary.durationDays} Days)`;
    }
    if (subEl) {
      const regLabel = summary.region?.label || summary.region?.provinceName || 'Nasional';
      const multText = summary.region?.multiplier ? `${summary.region.multiplier.toFixed(2)}x` : '1.00x';
      subEl.innerHTML = isId
        ? `Estimasi belanja bahan pokok acuan pasar: <b style="color:var(--ink);">${regLabel}</b> (${multText}) · Anggaran Rp ${this.budgetAmount.toLocaleString('id-ID')}`
        : `Grocery shopping estimates calibrated for: <b style="color:var(--ink);">${regLabel}</b> (${multText}) · Budget Rp ${this.budgetAmount.toLocaleString('id-ID')}`;
    }

    if (listContainer) {
      listContainer.innerHTML = summary.items.map(item => `
        <div class="grocery-item-row">
          <div class="grocery-item-info">
            <span class="grocery-item-cat">${item.category}</span>
            <div class="grocery-item-name">${item.name}</div>
            <div class="grocery-item-note">${item.note} · <b>${item.qty}</b></div>
          </div>
          <div class="grocery-item-price">Rp ${item.estPrice.toLocaleString('id-ID')}</div>
        </div>
      `).join('');
    }

    if (totalEl) {
      totalEl.innerHTML = isId
        ? `Total Est. Belanja Bahan: <b>Rp ${summary.grandTotal.toLocaleString('id-ID')}</b> (Hemat Rp ${Math.max(0, this.budgetAmount - summary.grandTotal).toLocaleString('id-ID')})`
        : `Total Est. Groceries: <b>Rp ${summary.grandTotal.toLocaleString('id-ID')}</b> (Saved Rp ${Math.max(0, this.budgetAmount - summary.grandTotal).toLocaleString('id-ID')})`;
    }

    modal.style.display = 'flex';
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  closeGroceryModal() {
    const modal = document.getElementById('modal-budget-grocery');
    if (modal) modal.style.display = 'none';
  }

  // Salin daftar belanja ke clipboard (untuk WA / Catatan)
  copyGroceryList() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const summary = this.getGrocerySummary();

    let text = isId 
      ? `🛒 *DAFTAR BELANJA PANGAN NUTRIVISION AI* (${summary.durationDays} Hari)\n`
      : `🛒 *NUTRIVISION AI GROCERY SHOPPING LIST* (${summary.durationDays} Days)\n`;
    text += isId 
      ? `Total Anggaran: Rp ${this.budgetAmount.toLocaleString('id-ID')}\n-----------------------------------\n`
      : `Total Budget: Rp ${this.budgetAmount.toLocaleString('id-ID')}\n-----------------------------------\n`;

    summary.items.forEach((it, idx) => {
      text += `${idx + 1}. [${it.qty}] ${it.name} ~ Rp ${it.estPrice.toLocaleString('id-ID')} (${it.note})\n`;
    });

    text += `-----------------------------------\n`;
    text += isId
      ? `💰 Total Estimasi Belanja: Rp ${summary.grandTotal.toLocaleString('id-ID')}\n`
      : `💰 Total Estimated Cost: Rp ${summary.grandTotal.toLocaleString('id-ID')}\n`;
    text += isId
      ? `✅ Sisa Hemat: Rp ${Math.max(0, this.budgetAmount - summary.grandTotal).toLocaleString('id-ID')}\n`
      : `✅ Remaining Savings: Rp ${Math.max(0, this.budgetAmount - summary.grandTotal).toLocaleString('id-ID')}\n`;
    text += `Dihasilkan otomatis via NutriVision AI Smart Budgeting`;

    navigator.clipboard.writeText(text).then(() => {
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(isId ? 'Daftar belanja berhasil disalin!' : 'Grocery list copied to clipboard!');
      } else {
        alert(isId ? 'Daftar belanja berhasil disalin ke clipboard!' : 'Grocery list copied to clipboard!');
      }
    }).catch(() => {
      alert(text);
    });
  }

  // Catat asupan hari ini ke Jurnal Nutrisi / Progress Tracker
  logActiveDayMeals() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const dayPlan = this.plan.find(p => p.dayNumber === this.activeDay);
    if (!dayPlan) return;

    if (window.app && typeof window.app.requireAuth === 'function') {
      window.app.requireAuth(() => {
        this.executeLogActiveDay(dayPlan);
      }, isId ? 'catat menu ke jurnal gizi' : 'log meal to nutrition journal');
    } else {
      this.executeLogActiveDay(dayPlan);
    }
  }

  executeLogActiveDay(dayPlan) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const userKey = window.app?.userProfile?.contact || window.app?.userProfile?.email || window.app?.userProfile?.name;
    
    const tracker = window.progressTracker || window.app?.progressTracker;
    if (tracker) {
      tracker.addLoggedMeal({
        protein: [dayPlan.totalDayProtein, dayPlan.totalDayProtein],
        calories: [dayPlan.totalDayCalories, dayPlan.totalDayCalories],
        carbs: [180, 180],
        fat: [35, 35]
      }, userKey, { name: isId ? `Rencana Menu Hari ke-${this.activeDay}` : `Day ${this.activeDay} Meal Plan`, source: 'Budget Planner' });
    }

    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(isId 
        ? `Menu Hari ke-${this.activeDay} (${dayPlan.totalDayProtein}g Protein) berhasil dicatat ke progres harian!` 
        : `Day ${this.activeDay} menu (${dayPlan.totalDayProtein}g Protein) logged to daily progress!`);
    }
  }

  // Format Rupiah
  formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  // Render Utama UI
  render() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';

    // 0. Toggle empty state vs active content visibility
    const emptyBox = document.getElementById('budget-empty-state');
    const activeContent = document.getElementById('budget-active-content');
    const footerBox = document.getElementById('budget-clean-footer');

    if (emptyBox && activeContent) {
      if (!this.isPlanGenerated) {
        emptyBox.style.display = 'block';
        activeContent.style.display = 'none';
        if (footerBox) footerBox.style.display = 'none';
      } else {
        emptyBox.style.display = 'none';
        activeContent.style.display = 'block';
        if (footerBox) footerBox.style.display = 'flex';
      }
    }

    const dayPlan = this.plan.find(p => p.dayNumber === this.activeDay) || this.plan[0];
    if (!dayPlan) return;

    // 1. Hitung ringkasan finansial & nutrisi keseluruhan periode
    const totalEstPlanCost = this.plan.reduce((sum, d) => sum + d.totalDayCost, 0);
    const totalSavings = this.budgetAmount - totalEstPlanCost;
    const avgDailyCost = Math.round(totalEstPlanCost / this.durationDays);
    const avgDailyProt = Math.round(this.plan.reduce((sum, d) => sum + d.totalDayProtein, 0) / this.durationDays);
    const dailyAllocation = Math.floor(this.budgetAmount / this.durationDays);

    // 2. Render Key KPI Metric Strip
    const kpiDaily = document.getElementById('budget-kpi-daily-quota');
    const kpiTotal = document.getElementById('budget-kpi-total-cost');
    const kpiSavings = document.getElementById('budget-kpi-savings');
    const kpiProt = document.getElementById('budget-kpi-avg-protein');

    if (kpiDaily) {
      kpiDaily.textContent = this.formatRupiah(dailyAllocation) + (isId ? ' / hari' : ' / day');
    }
    if (kpiTotal) {
      kpiTotal.textContent = this.formatRupiah(totalEstPlanCost);
    }
    if (kpiSavings) {
      if (totalSavings >= 0) {
        kpiSavings.innerHTML = `<span style="color:#1B5E20;font-weight:700;">Hemat ${this.formatRupiah(totalSavings)}</span>`;
      } else {
        kpiSavings.innerHTML = `<span style="color:#C62828;font-weight:700;">Defisit ${this.formatRupiah(Math.abs(totalSavings))}</span>`;
      }
    }
    if (kpiProt) {
      kpiProt.textContent = `~${avgDailyProt}g Protein / hari`;
    }

    // 3. Render Day Navigator
    const dayNavBox = document.getElementById('budget-day-navigator-box');
    const weekTabsBox = document.getElementById('budget-week-tabs-box');

    if (this.durationDays > 7 && weekTabsBox) {
      weekTabsBox.style.display = 'flex';
      const numWeeks = Math.ceil(this.durationDays / 7);
      weekTabsBox.innerHTML = Array.from({ length: numWeeks }, (_, i) => {
        const w = i + 1;
        const isActive = w === this.activeWeek;
        const startDay = (w - 1) * 7 + 1;
        const endDay = Math.min(w * 7, this.durationDays);
        return `
          <button class="budget-week-tab ${isActive ? 'active' : ''}" onclick="budgetPlanner.selectWeek(${w})">
            ${isId ? `Minggu ${w}` : `Week ${w}`} <small>(${startDay}-${endDay})</small>
          </button>
        `;
      }).join('');
    } else if (weekTabsBox) {
      weekTabsBox.style.display = 'none';
    }

    if (dayNavBox) {
      // Tampilkan hari-hari di minggu aktif jika > 7 hari, atau seluruh 7 hari jika 7 hari
      let daysToShow = this.plan;
      if (this.durationDays > 7) {
        daysToShow = this.plan.filter(p => p.weekNumber === this.activeWeek);
      }

      dayNavBox.innerHTML = daysToShow.map(p => {
        const isCurrent = p.dayNumber === this.activeDay;
        return `
          <button class="budget-day-chip ${isCurrent ? 'active' : ''}" onclick="budgetPlanner.selectDay(${p.dayNumber})">
            <span class="day-num">Day ${p.dayNumber}</span>
            <span class="day-cost">${this.formatRupiah(p.totalDayCost)}</span>
          </button>
        `;
      }).join('');
    }

    // 4. Render Active Day Meals (Sarapan, Makan Siang, Makan Malam)
    const activeDayTitle = document.getElementById('budget-active-day-title');
    const activeDaySub = document.getElementById('budget-active-day-sub');

    if (activeDayTitle) {
      activeDayTitle.innerHTML = `${isId ? `Rekomendasi Menu: Hari ke-${dayPlan.dayNumber}` : `Meal Itinerary: Day ${dayPlan.dayNumber}`}`;
    }
    if (activeDaySub) {
      activeDaySub.innerHTML = isId 
        ? `Estimasi Biaya: <b>${this.formatRupiah(dayPlan.totalDayCost)}</b> (Kuota: <b>${this.formatRupiah(dayPlan.dailyBudget)}</b>) · Protein: <b>${dayPlan.totalDayProtein}g</b>`
        : `Est. Cost: <b>${this.formatRupiah(dayPlan.totalDayCost)}</b> (Quota: <b>${this.formatRupiah(dayPlan.dailyBudget)}</b>) · Protein: <b>${dayPlan.totalDayProtein}g</b>`;
    }

    // Render Sarapan, Siang, Malam
    this.renderMealCard('breakfast', dayPlan.breakfast, isId);
    this.renderMealCard('lunch', dayPlan.lunch, isId);
    this.renderMealCard('dinner', dayPlan.dinner, isId);

    // Update streak element for backwards compatibility with tests
    const streakText = document.getElementById('ov-card3-streak-text');
    if (streakText && !streakText.textContent) {
      streakText.textContent = isId ? 'Streak: 0 Hari' : 'Streak: 0 Days';
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  renderMealCard(mealType, meal, isId) {
    const cardEl = document.getElementById(`meal-card-${mealType}`);
    if (!cardEl) return;

    let iconName = 'sun';
    let typeLabel = isId ? 'Sarapan' : 'Breakfast';
    let typeColor = '#D97706';
    if (mealType === 'lunch') {
      iconName = 'utensils';
      typeLabel = isId ? 'Makan Siang' : 'Lunch';
      typeColor = '#0284C7';
    } else if (mealType === 'dinner') {
      iconName = 'moon';
      typeLabel = isId ? 'Makan Malam' : 'Dinner';
      typeColor = '#6366F1';
    }

    const displayName = isId ? meal.name : (meal.nameEn || meal.name);
    const swapText = isId ? 'Ganti' : 'Swap';

    cardEl.innerHTML = `
      <div class="meal-clean-time">
        <i data-lucide="${iconName}" style="width:14px;height:14px;color:${typeColor};"></i>
        <span>${typeLabel}</span>
      </div>
      <div class="meal-clean-info">
        <span class="meal-clean-name">${displayName}</span>
        <span class="meal-clean-meta">${meal.protein}g Protein · ${meal.calories} kkal</span>
      </div>
      <div class="meal-clean-action">
        <span class="meal-clean-price">${this.formatRupiah(meal.appliedCost || meal.price)}</span>
        <button type="button" class="btn-clean-swap" onclick="budgetPlanner.swapMeal(${this.activeDay}, '${mealType}')" title="${isId ? 'Ganti menu alternatif' : 'Swap dish'}">
          <i data-lucide="refresh-cw" style="width:11px;height:11px;"></i>
          <span>${swapText}</span>
        </button>
      </div>
    `;
  }
}

// Inisialisasi global
window.budgetPlanner = new NutriVisionBudgetPlanner();
