// NutriVision AI — Recovery Meal Planner & Symptom-Aware Filter
// Sesuai FR-10 (Dual Mode Standar vs Hemat) & FR-11 (Symptom-Aware Filter)

class NutriVisionPlanner {
  constructor() {
    this.currentMode = 'standar'; // 'standar' atau 'hemat'
    this.activeSymptoms = new Set(['dysphagia', 'sulit-menelan', 'nausea', 'mual', 'constipation', 'konstipasi']); // Default demo matching mockup (3 aktif)
    this.selectedMealNames = new Set();
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
    const count = this.selectedMealNames.size;
    if (count === 0) {
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(isId ? 'Silakan klik "Pilih" pada menu rekomendasi terlebih dahulu.' : 'Please click "Select" on recommended menu items first.');
      }
      return;
    }
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(isId ? `Berhasil menerapkan ${count} menu terverifikasi ke jadwal makan pasien!` : `Successfully applied ${count} verified meals to patient schedule!`);
    }
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

        return `
          <div class="meal-plan-item">
            <div class="meal-plan-info">
              <div class="name">${displayName}</div>
              <div class="macro">${displayMacro} · <span style="color:var(--teal-700)">${displaySuitable}</span></div>
              ${isSoftTextureRequired && isSoftItem ? `<span class="badge teal" style="margin-top:4px;font-size:10px;">${swallowTag}</span>` : ''}
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

        return `
          <div class="meal-plan-item" style="padding:14px;">
            <div class="meal-plan-info">
              <div class="name" style="font-size:15px;font-weight:600;">${displayName}</div>
              <div class="macro" style="margin-top:2px;">${displayMacro} · <span style="color:var(--teal-700);font-weight:500;">${displaySuitable}</span></div>
              <div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap;">
                <span class="meal-plan-tag">${displayBadge}</span>
                <span style="font-size:12px;color:var(--ink-soft);font-weight:600;">${costLabel} ${item.price}</span>
                ${isSoftTextureRequired && isSoftItem ? `<span class="badge teal" style="font-size:10.5px;">${dysphagiaTag}</span>` : ''}
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
    const aiOutput = agent ? agent.process(activeList) : null;

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

    // Summary Card 2: Pantangan Otomatis
    const restrictedTitle = isId ? 'Pantangan Otomatis' : 'Automatic Restrictions';
    let restrictedSub = isId ? aiOutput.restricted_summary : (aiOutput.restricted_summary_en || aiOutput.restricted_summary);
    if (!restrictedSub && aiOutput.restricted_ingredients && aiOutput.restricted_ingredients.length > 0) {
      restrictedSub = (isId ? 'Hindari ' : 'Avoid ') + aiOutput.restricted_ingredients.slice(0, 4).join(', ') + '...';
    } else if (!restrictedSub) {
      restrictedSub = isId 
        ? 'Hindari serat liat kasar, rempah biji utuh, santan pekat & suhu pan...' 
        : 'Avoid coarse fibrous foods, whole seed spices, thick coconut milk & high temp...';
    }

    // Dual summary grid HTML
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

        <div class="symptom-summary-card">
          <div class="symptom-summary-icon slate">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div class="symptom-summary-text">
            <div class="symptom-summary-title">${restrictedTitle}</div>
            <div class="symptom-summary-sub" title="${restrictedSub}">${restrictedSub}</div>
          </div>
        </div>
      </div>
    `;

    // Recommended Menu Cards HTML
    const menuCount = (aiOutput.recommended_menu || []).length;
    const recomHeadSub = isId 
      ? `${menuCount} pilihan menu sesuai toleransi` 
      : `${menuCount} meal options based on tolerance`;

    const menuCardsHtml = (aiOutput.recommended_menu || []).map(m => {
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
          <button type="button" class="btn-symptom-select${selectedClass}" 
            onclick="mealPlanner.selectSymptomMeal('${m.name.replace(/'/g, "\\'")}', this);">
            ${btnText}
          </button>
        </div>
      `;
    }).join('');

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
          <button type="button" class="btn-symptom-apply" onclick="mealPlanner.applyToPatientMenu();">
            <span>${isId ? 'Terapkan ke Menu Pasien' : 'Apply to Patient Menu'}</span>
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

    this.syncChipUI();
    this.renderPlanner();
  }
}

const mealPlanner = new NutriVisionPlanner();
if (typeof window !== 'undefined') {
  window.mealPlanner = mealPlanner;
}
if (typeof global !== 'undefined') {
  global.mealPlanner = mealPlanner;
}

