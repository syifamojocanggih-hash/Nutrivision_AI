// NutriVision AI — Recovery Meal Planner & Symptom-Aware Filter
// Sesuai FR-10 (Dual Mode Standar vs Hemat) & FR-11 (Symptom-Aware Filter)

class NutriVisionPlanner {
  constructor() {
    this.currentMode = 'standar'; // 'standar' atau 'hemat'
    this.activeSymptoms = new Set(['dysphagia', 'sulit-menelan']); // Default symptom demo
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
    chips.forEach(chip => {
      const sym = chip.getAttribute('data-symptom');
      if (sym && this.activeSymptoms.has(sym)) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
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

  // Render Symptom-Aware Feedback using Clinical Nutrition & Food Filter AI Agent
  renderSymptomFilter(resultContainerId = 'symptom-result-box') {
    const container = document.getElementById(resultContainerId);
    if (!container) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const activeList = Array.from(this.activeSymptoms);

    if (activeList.length === 0) {
      container.innerHTML = `
        <div style="padding:4px 0;">
          <strong style="color:#242C10;">${isId ? 'Kondisi Normal / Tanpa Gejala Spesifik:' : 'Normal Condition / No Specific Symptoms:'}</strong>
          <span style="color:#4B5563;font-size:12.5px;">${isId ? 'Menu disajikan dengan variasi gizi lengkap seimbang sesuai target fase pemulihan Anda.' : 'Menus are served with complete balanced nutrition tailored to your recovery phase target.'}</span>
        </div>
      `;
      this.renderPlanner();
      return;
    }

    const agent = (typeof clinicalNutritionFilterAgent !== 'undefined') ? clinicalNutritionFilterAgent : null;
    const aiOutput = agent ? agent.process(activeList) : null;

    if (!aiOutput) {
      return;
    }

    // Safety Level Badge Styling
    let safetyBadgeBg = '#ECFDF5';
    let safetyBadgeColor = '#065F46';
    let safetyBadgeBorder = '#A7F3D0';
    let safetyIcon = 'shield-check';
    let safetyLabel = isId ? 'Standard: Pemulihan Umum' : 'Standard: General Recovery';

    if (aiOutput.safety_level === 'High') {
      safetyBadgeBg = '#FEF2F2';
      safetyBadgeColor = '#991B1B';
      safetyBadgeBorder = '#FCA5A5';
      safetyIcon = 'alert-triangle';
      safetyLabel = isId ? 'PRIORITAS 1: SAFETY FIRST (DYSPHAGIA IDDSI)' : 'PRIORITY 1: SAFETY FIRST (DYSPHAGIA IDDSI)';
    } else if (aiOutput.safety_level === 'Medium') {
      safetyBadgeBg = '#FFFBEB';
      safetyBadgeColor = '#92400E';
      safetyBadgeBorder = '#FCD34D';
      safetyIcon = 'shield-alert';
      safetyLabel = isId ? 'PRIORITAS 2: GI TRACT PROTECTION' : 'PRIORITY 2: GI TRACT PROTECTION';
    }

    // Restricted Tags HTML
    const restrictedHtml = aiOutput.restricted_ingredients && aiOutput.restricted_ingredients.length > 0
      ? `
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #E5E7EB;">
          <div style="font-size:11.5px;font-weight:700;color:#991B1B;margin-bottom:6px;display:flex;align-items:center;gap:5px;">
            <i data-lucide="ban" style="width:13px;height:13px;"></i>
            <span>${isId ? 'Pantangan Wajib Dihindari:' : 'Mandatory Restricted Ingredients:'}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            ${aiOutput.restricted_ingredients.map(r => `
              <span style="font-size:11px;font-weight:600;background:#FEE2E2;color:#991B1B;border:1px solid #FECACA;padding:2.5px 8px;border-radius:6px;">
                ✕ ${r}
              </span>
            `).join('')}
          </div>
        </div>
      `
      : '';

    // Recommended Menu HTML
    const menuHtml = aiOutput.recommended_menu && aiOutput.recommended_menu.length > 0
      ? `
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid #E5E7EB;">
          <div style="font-size:12px;font-weight:700;color:#166534;margin-bottom:8px;display:flex;align-items:center;gap:5px;">
            <i data-lucide="check-circle-2" style="width:14px;height:14px;"></i>
            <span>${isId ? 'Rekomendasi Menu Terverifikasi AI Agent:' : 'AI Agent Verified Menu Recommendations:'}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${aiOutput.recommended_menu.map(m => `
              <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:10px;padding:9px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;">
                  <b style="color:#1E293B;font-size:13px;">${m.name}</b>
                  <span style="font-size:10px;font-weight:700;background:#F1F5F9;color:#475569;border:1px solid #CBD5E1;padding:2px 7px;border-radius:5px;flex-shrink:0;">
                    ${m.texture_category}
                  </span>
                </div>
                <div style="font-size:11.5px;color:#475569;line-height:1.45;">
                  ${m.reason}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `
      : '';

    // Agent System Prompt Inspector
    const inspectorHtml = `
      <details style="margin-top:12px;padding-top:8px;border-top:1px dashed #CBD5E1;font-size:11px;">
        <summary style="cursor:pointer;font-weight:700;color:#475569;display:inline-flex;align-items:center;gap:5px;user-select:none;">
          <span>🤖 ${isId ? 'Lihat System Prompt & Payload AI Agent' : 'Inspect AI Agent System Prompt & Payload'}</span>
        </summary>
        <div style="margin-top:8px;background:#0F172A;color:#E2E8F0;padding:12px;border-radius:8px;font-family:Consolas, Monaco, monospace;font-size:11px;line-height:1.45;white-space:pre-wrap;max-height:220px;overflow-y:auto;border:1px solid #334155;">
<strong style="color:#38BDF8;">// 1. SYSTEM PROMPT WITH DYNAMIC {{selected_symptoms}}:</strong>
${aiOutput.raw_prompt}

<strong style="color:#4ADE80;">// 2. AGENT JSON OUTPUT:</strong>
${JSON.stringify({
  active_filters: aiOutput.active_filters,
  safety_level: aiOutput.safety_level,
  texture_requirement: aiOutput.texture_requirement,
  restricted_ingredients: aiOutput.restricted_ingredients,
  recommended_menu: aiOutput.recommended_menu
}, null, 2)}
        </div>
      </details>
    `;

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:4px;">
        <!-- Safety Level Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
          <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;background:${safetyBadgeBg};color:${safetyBadgeColor};border:1px solid ${safetyBadgeBorder};padding:3px 9px;border-radius:6px;letter-spacing:0.2px;">
            <i data-lucide="${safetyIcon}" style="width:13px;height:13px;"></i>
            ${safetyLabel}
          </span>
          <span style="font-size:11px;color:#64748B;font-weight:600;">
            ${isId ? `${aiOutput.active_filters.length} Gejala Aktif` : `${aiOutput.active_filters.length} Active Symptoms`}
          </span>
        </div>

        <!-- Texture Requirement -->
        <div style="font-size:13px;color:#1E293B;font-weight:700;display:flex;align-items:flex-start;gap:6px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 10px;">
          <i data-lucide="soup" style="width:16px;height:16px;color:#0F766E;flex-shrink:0;margin-top:1px;"></i>
          <div>
            <span style="font-size:11px;color:#64748B;display:block;font-weight:600;text-transform:uppercase;">${isId ? 'Standar Tekstur Wajib:' : 'Required Texture Standard:'}</span>
            <span>${aiOutput.texture_requirement}</span>
          </div>
        </div>

        ${restrictedHtml}
        ${menuHtml}
        ${inspectorHtml}
      </div>
    `;

    // Refresh lucide icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Re-render planner agar badge tekstur terupdate
    this.renderPlanner();
  }
}

const mealPlanner = new NutriVisionPlanner();

