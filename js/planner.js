// NutriVision AI — Recovery Meal Planner & Symptom-Aware Filter
// Sesuai FR-10 (Dual Mode Standar vs Hemat) & FR-11 (Symptom-Aware Filter)

class NutriVisionPlanner {
  constructor() {
    this.currentMode = 'standar'; // 'standar' atau 'hemat'
    this.activeSymptoms = new Set(['sulit-menelan']); // Default symptom demo
  }

  setMode(mode) {
    this.currentMode = (mode === 'hemat') ? 'hemat' : 'standar';
    this.renderPlanner();
  }

  toggleSymptom(symptomKey) {
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

    const plans = NUTRIVISION_DATA.mealPlans[this.currentMode] || [];
    const isSoftTextureRequired = this.activeSymptoms.has('sulit-menelan');

    // Render for Dashboard (Concise Top 2 Preview)
    if (container1) {
      const previewPlans = plans.slice(0, 2);
      container1.innerHTML = previewPlans.map(item => {
        const isSoftItem = item.name.toLowerCase().includes('bubur') || 
                           item.name.toLowerCase().includes('halus') || 
                           item.name.toLowerCase().includes('kukus') ||
                           item.name.toLowerCase().includes('tim');

        return `
          <div class="meal-plan-item">
            <div class="meal-plan-info">
              <div class="name">${item.name}</div>
              <div class="macro">${item.macro} · <span style="color:var(--teal-700)">${item.suitableFor}</span></div>
              ${isSoftTextureRequired && isSoftItem ? `<span class="badge teal" style="margin-top:4px;font-size:10px;">✓ Ramah Menelan</span>` : ''}
            </div>
            <div class="meal-plan-meta">
              <div class="meal-plan-price">${item.price}</div>
              <span class="meal-plan-tag">${item.badge}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render for Dedicated Full Page
    if (container2) {
      container2.innerHTML = plans.map(item => {
        const isSoftItem = item.name.toLowerCase().includes('bubur') || 
                           item.name.toLowerCase().includes('halus') || 
                           item.name.toLowerCase().includes('kukus') ||
                           item.name.toLowerCase().includes('tim');

        return `
          <div class="meal-plan-item" style="padding:14px;">
            <div class="meal-plan-info">
              <div class="name" style="font-size:15px;font-weight:600;">${item.name}</div>
              <div class="macro" style="margin-top:2px;">${item.macro} · <span style="color:var(--teal-700);font-weight:500;">${item.suitableFor}</span></div>
              <div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap;">
                <span class="meal-plan-tag">${item.badge}</span>
                <span style="font-size:12px;color:var(--ink-soft);font-weight:600;">Est. Biaya: ${item.price}</span>
                ${isSoftTextureRequired && isSoftItem ? `<span class="badge teal" style="font-size:10.5px;">✓ Tekstur Lunak / Ramah Disfagia</span>` : ''}
              </div>
            </div>
            <div class="meal-plan-meta">
              <button class="btn-sm-teal" style="font-size:11.5px;padding:6px 12px;display:inline-flex;align-items:center;gap:4px;" onclick="mealPlanner.logMeal('${item.name}', '${item.macro}')">
                <i data-lucide="plus-circle" class="btn-icon-sm"></i> Catat Asupan
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  logMeal(mealName, macroStr) {
    app.requireAuth(() => {
      // Parse protein and calories from macroStr e.g. "28g Protein · 420 kkal"
      let prot = 25;
      let cals = 380;
      const protMatch = macroStr.match(/(\d+)g Protein/i);
      const calsMatch = macroStr.match(/(\d+) kkal/i);
      if (protMatch) prot = parseInt(protMatch[1], 10);
      if (calsMatch) cals = parseInt(calsMatch[1], 10);

      progressTracker.addLoggedMeal({
        protein: [prot, prot],
        carbs: [Math.round(cals * 0.5 / 4), Math.round(cals * 0.5 / 4)],
        fat: [Math.round(cals * 0.25 / 9), Math.round(cals * 0.25 / 9)],
        cals: [cals, cals]
      });

      progressTracker.renderMacroDonut(app.userProfile.targets);
      progressTracker.renderWeeklyBarChart();
      app.showToast(`Menu "${mealName}" berhasil dicatat ke progres asupan harian!`);
    }, `mencatat menu "${mealName}"`);
  }

  // Render Symptom-Aware Feedback
  renderSymptomFilter(resultContainerId = 'symptom-result-box') {
    const container = document.getElementById(resultContainerId);
    if (!container) return;

    if (this.activeSymptoms.size === 0) {
      container.innerHTML = `
        <strong>Kondisi Normal / Tanpa Gejala Spesifik:</strong>
        Menu disajikan dengan variasi gizi lengkap seimbang sesuai target fase pemulihan kamu.
      `;
      return;
    }

    let combinedText = [];
    let combinedFoods = [];

    this.activeSymptoms.forEach(key => {
      const rule = NUTRIVISION_DATA.symptomRules[key];
      if (rule) {
        combinedText.push(`• <strong>${rule.title}:</strong> ${rule.text}`);
        combinedFoods.push(...rule.recommendedFoods);
      }
    });

    const uniqueFoods = [...new Set(combinedFoods)].slice(0, 4);

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${combinedText.join('')}
        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(15,110,86,0.15)">
          <strong style="color:var(--teal-800)">Pilihan Makanan Dianjurkan:</strong>
          <span>${uniqueFoods.join(', ')}.</span>
        </div>
      </div>
    `;

    // Re-render planner agar badge tekstur terupdate
    this.renderPlanner();
  }
}

const mealPlanner = new NutriVisionPlanner();
