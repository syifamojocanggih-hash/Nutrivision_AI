// NutriVision AI — Recovery Meal Planner & Symptom-Aware Filter
// Sesuai FR-10 (Dual Mode Standar vs Hemat) & FR-11 (Symptom-Aware Filter)

class NutriVisionPlanner {
  constructor() {
    this.currentMode = 'standar'; // 'standar' atau 'hemat'
    this.activeSymptoms = new Set(['sulit-menelan']); // Default symptom demo
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

  toggleSymptom(symptomKey) {
    if (window.app && typeof window.app.requireAuth === 'function') {
      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      if (!window.app.requireAuth(() => {
        if (this.activeSymptoms.has(symptomKey)) {
          this.activeSymptoms.delete(symptomKey);
        } else {
          this.activeSymptoms.add(symptomKey);
        }
        this.renderSymptomFilter();
      }, isId ? 'filter gejala' : 'filter symptoms')) {
        return;
      }
    }
    if (this.activeSymptoms.has(symptomKey)) {
      this.activeSymptoms.delete(symptomKey);
    } else {
      this.activeSymptoms.add(symptomKey);
    }
    this.renderSymptomFilter();
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
      }, userKey);

      progressTracker.renderMacroDonut(app.userProfile.targets);
      progressTracker.renderWeeklyBarChart();
      app.showToast(isId ? `Menu "${mealName}" berhasil dicatat!` : `Meal "${mealName}" logged!`);
    }, isId ? 'catat menu' : 'log meal');
  }

  // Render Symptom-Aware Feedback
  renderSymptomFilter(resultContainerId = 'symptom-result-box') {
    const container = document.getElementById(resultContainerId);
    if (!container) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';

    if (this.activeSymptoms.size === 0) {
      container.innerHTML = isId ? `
        <strong>Kondisi Normal / Tanpa Gejala Spesifik:</strong>
        Menu disajikan dengan variasi gizi lengkap seimbang sesuai target fase pemulihan kamu.
      ` : `
        <strong>Normal Condition / No Specific Symptoms:</strong>
        Menus are served with complete balanced nutrition tailored to your recovery phase target.
      `;
      return;
    }

    let combinedText = [];
    let combinedFoods = [];

    this.activeSymptoms.forEach(key => {
      const rule = NUTRIVISION_DATA.symptomRules[key];
      if (rule) {
        const title = isId ? rule.title : (rule.titleEn || rule.title);
        const text = isId ? rule.text : (rule.textEn || rule.text);
        const foods = isId ? rule.recommendedFoods : (rule.recommendedFoodsEn || rule.recommendedFoods);
        combinedText.push(`• <strong>${title}:</strong> ${text}`);
        combinedFoods.push(...foods);
      }
    });

    const uniqueFoods = [...new Set(combinedFoods)].slice(0, 4);
    const recLabel = isId ? 'Pilihan Makanan Dianjurkan:' : 'Recommended Food Choices:';

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${combinedText.join('')}
        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(15,110,86,0.15)">
          <strong style="color:var(--teal-800)">${recLabel}</strong>
          <span>${uniqueFoods.join(', ')}.</span>
        </div>
      </div>
    `;

    // Re-render planner agar badge tekstur terupdate
    this.renderPlanner();
  }
}

const mealPlanner = new NutriVisionPlanner();

