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

  // Render Meal Planner UI
  renderPlanner() {
    const container1 = document.getElementById('meal-plan-list');
    const container2 = document.getElementById('meal-plan-list-full');
    if (!container1 && !container2) return;

    const plans = NUTRIVISION_DATA.mealPlans[this.currentMode] || [];
    const isSoftTextureRequired = this.activeSymptoms.has('sulit-menelan');

    const html = plans.map(item => {
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

    if (container1) container1.innerHTML = html;
    if (container2) container2.innerHTML = html;
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
