const fs = require('fs');
const assert = require('assert');

// Simple DOM Mock for verification
class MockElement {
  constructor(tag, id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className ? className.split(' ').filter(Boolean) : []),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c) => {
        if (this.classList._classes.has(c)) {
          this.classList._classes.delete(c);
          return false;
        } else {
          this.classList._classes.add(c);
          return true;
        }
      }
    };
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
    this.attributes = {};
  }

  getAttribute(attr) {
    return this.attributes[attr];
  }

  setAttribute(attr, val) {
    this.attributes[attr] = val;
  }

  querySelector(selector) {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.children.find(c => c.classList.contains(cls)) || null;
    }
    return null;
  }
}

global.document = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = new MockElement('div', id);
    }
    return this.elements[id];
  },
  querySelectorAll(sel) {
    if (sel.includes('#planner-symptom-chips .symptom-chip')) {
      return this.chips || [];
    }
    return [];
  }
};

global.window = {
  i18n: {
    getLanguage: () => 'id'
  },
  app: {
    showToast: (msg) => {
      console.log('[Mock Toast]:', msg);
    },
    requireAuth: (cb) => {
      cb();
      return true;
    }
  }
};

// Setup symptom filter agent
const { clinicalNutritionFilterAgent } = require('../js/symptom_filter_agent.js');
global.clinicalNutritionFilterAgent = clinicalNutritionFilterAgent;

// Load NUTRIVISION_DATA mock
global.NUTRIVISION_DATA = {
  mealPlans: {
    standar: [],
    hemat: []
  }
};

// Setup DOM chips
const chipData = [
  { sym: 'dysphagia', text: 'Sulit Menelan (Disfagia)', active: true },
  { sym: 'nausea', text: 'Mual (Nausea)', active: true },
  { sym: 'gerd', text: 'GERD / Asam Lambung', active: false },
  { sym: 'diarrhea', text: 'Diare', active: false },
  { sym: 'constipation', text: 'Konstipasi', active: true },
  { sym: 'low_appetite', text: 'Nafsu Makan Rendah', active: false }
];

document.chips = chipData.map(c => {
  const btn = new MockElement('button', '', c.active ? 'symptom-chip active' : 'symptom-chip');
  btn.setAttribute('data-symptom', c.sym);
  const iconSpan = new MockElement('span', '', 'symptom-chip-icon');
  iconSpan.textContent = c.active ? '✓' : '+';
  btn.children.push(iconSpan);
  return btn;
});

// Load planner.js
const plannerCode = fs.readFileSync('js/planner.js', 'utf8');
eval(plannerCode + '\nglobal.mealPlanner = mealPlanner;');

console.log('--- TEST 1: Initial State (3 Active Symptoms) ---');
console.log('Active symptoms in planner:', Array.from(global.mealPlanner.activeSymptoms));
mealPlanner.syncChipUI();
const badge = document.getElementById('symptom-active-count-badge');
console.log('Badge text:', badge.textContent);
assert.strictEqual(badge.textContent, '3 aktif', 'Badge displays 3 aktif');

console.log('\n--- TEST 2: Rendering Symptom Filter Output ---');
mealPlanner.renderSymptomFilter('symptom-result-box');
const resultContainer = document.getElementById('symptom-result-box');
const html = resultContainer.innerHTML;

assert(html.includes('symptom-dual-summary-grid'), 'Dual summary grid rendered');
assert(html.includes('Standar Keamanan IDDSI Level 4 (Puree / Soft Mash)'), 'Contains IDDSI Level 4 title');
assert(html.includes('Pantangan Otomatis'), 'Contains Pantangan Otomatis title');
assert(html.includes('Rekomendasi Menu Terverifikasi'), 'Contains verified recommendation header');
assert(html.includes('4 pilihan menu sesuai toleransi'), 'Shows 4 pilihan menu sesuai toleransi');

assert(html.includes('Puree Pepaya Matang Halus'), 'Contains Puree Pepaya Matang Halus');
assert(html.includes('Bubur Saring Oatmeal Kaldu Labu'), 'Contains Bubur Saring Oatmeal Kaldu Labu');
assert(html.includes('Bubur Saring Ikan Gabus'), 'Contains Bubur Saring Ikan Gabus');
assert(html.includes('Puree Alpukat Telur Kukus'), 'Contains Puree Alpukat Telur Kukus');

assert(html.includes('• 140 kkal • 2.1g Serat Larut'), 'Contains papaya nutrients');
assert(html.includes('• 185 kkal • 4.8g Protein'), 'Contains oatmeal nutrients');
assert(html.includes('• 210 kkal • 14.2g Albumin'), 'Contains gabus fish nutrients');
assert(html.includes('• 260 kkal • 9.5g Protein'), 'Contains avocado egg nutrients');

assert(html.includes('Reset Pilihan'), 'Contains Reset button');
assert(html.includes('Terapkan ke Menu Pasien'), 'Contains Apply button');

console.log('>> PASS: All mockup elements correctly generated in HTML output!');

console.log('\n--- TEST 3: Meal Selection & Apply ---');
const btnElem = new MockElement('button');
mealPlanner.selectSymptomMeal('Puree Pepaya Matang Halus', btnElem);
assert(mealPlanner.selectedMealNames.has('Puree Pepaya Matang Halus'), 'Meal added to selection');
assert.strictEqual(btnElem.textContent, '✓ Terpilih', 'Button text toggled to Terpilih');

mealPlanner.applyToPatientMenu();

console.log('\n--- TEST 4: Reset Symptoms ---');
mealPlanner.resetSymptoms();
assert.strictEqual(mealPlanner.activeSymptoms.size, 0, 'Symptoms set emptied');
assert.strictEqual(badge.textContent, '0 aktif', 'Badge updated to 0 aktif');
const resetHtml = document.getElementById('symptom-result-box').innerHTML;
assert(resetHtml.includes('Kondisi Normal / Tanpa Gejala Spesifik'), 'Shows normal condition when 0 active');

console.log('\n=============================================');
console.log('🎉 ALL SYMPTOM UI TESTS PASSED SUCCESSFULLY! 🎉');
console.log('=============================================');
