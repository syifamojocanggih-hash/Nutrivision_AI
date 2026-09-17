const fs = require('fs');
const assert = require('assert');
const path = require('path');

// Mock DOM
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
    this.value = '';
    this.attributes = {};
  }
  getAttribute(attr) { return this.attributes[attr]; }
  setAttribute(attr, val) { this.attributes[attr] = val; }
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
  querySelectorAll() { return []; }
};

const mockUserProfile = {
  name: 'Test Patient',
  contact: 'patient@example.com',
  restrictions: 'pepaya'
};

global.window = {
  i18n: {
    getLanguage: () => 'id'
  },
  app: {
    userProfile: mockUserProfile,
    saveUserProfile: () => {},
    showToast: (msg) => console.log('  [Toast]:', msg)
  }
};

global.NUTRIVISION_DATA = {
  mealPlans: { standar: [], hemat: [] }
};

// Load modules
const { clinicalNutritionFilterAgent } = require('../js/symptom_filter_agent.js');
global.clinicalNutritionFilterAgent = clinicalNutritionFilterAgent;

const plannerCode = fs.readFileSync('js/planner.js', 'utf8');
eval(plannerCode + '\nglobal.mealPlanner = mealPlanner;');

console.log('🧪 RUNNING PAPAYA RESTRICTION VERIFICATION TESTS...\n');

// Symptoms from user's screenshot: Sulit Menelan, Mual, GERD, Konstipasi
const screenshotSymptoms = ['dysphagia', 'nausea', 'gerd', 'constipation'];

console.log('Test 1: Agent Process WITH "pepaya" in customRestrictions');
const resWithPapayaRestricted = clinicalNutritionFilterAgent.process(screenshotSymptoms, ['pepaya']);
console.log('  Restricted ingredients:', resWithPapayaRestricted.restricted_ingredients);
assert(resWithPapayaRestricted.restricted_ingredients.includes('pepaya'), 'restricted_ingredients must include pepaya');

const dishesWithPapaya = resWithPapayaRestricted.recommended_menu.filter(m => 
  (m.name + ' ' + (m.nameEn || '') + ' ' + (m.reason || '')).toLowerCase().includes('pepaya')
);
console.log('  Dishes containing pepaya in recommendations:', dishesWithPapaya.length);
assert.strictEqual(dishesWithPapaya.length, 0, 'ZERO dishes with pepaya should be recommended when pepaya is restricted!');

const hasAlternative = resWithPapayaRestricted.recommended_menu.some(m => 
  m.name.includes('Buah Naga') || m.name.includes('Pir')
);
assert(hasAlternative, 'Alternative for constipation (e.g. Buah Naga / Pir) must be provided');
console.log('  ✅ Test 1 Passed: Papaya is completely excluded from agent recommendations and alternative is present!\n');

console.log('Test 2: Agent Process WITHOUT "pepaya" restriction');
const resWithoutRestriction = clinicalNutritionFilterAgent.process(screenshotSymptoms, []);
const hasPureePapaya = resWithoutRestriction.recommended_menu.some(m => m.name.includes('Puree Pepaya Matang Halus'));
assert(hasPureePapaya, 'When not restricted, Puree Pepaya Matang Halus can be recommended');
console.log('  ✅ Test 2 Passed: Puree Pepaya is recommended normally when no restriction is set.\n');

console.log('Test 3: MealPlanner renderSymptomFilter UI with active "pepaya" restriction');
mealPlanner.activeSymptoms = new Set(['sulit-menelan', 'mual', 'gerd', 'konstipasi']);
mealPlanner.customRestrictions = new Set(['pepaya']);

mealPlanner.renderSymptomFilter('symptom-result-box');
const resultEl = document.getElementById('symptom-result-box');
const renderedHtml = resultEl.innerHTML;

// Must display the restriction in the summary box
assert(renderedHtml.includes('Pantangan Pasien: pepaya'), 'UI summary card must show "Pantangan Pasien: pepaya"');

// MUST NOT contain Puree Pepaya in the recommendations section
assert(!renderedHtml.includes('Puree Pepaya Matang Halus'), 'UI recommendation cards MUST NOT contain "Puree Pepaya Matang Halus"');
assert(!renderedHtml.includes('Pepaya'), 'UI recommendation cards MUST NOT contain "Pepaya"');

console.log('  ✅ Test 3 Passed: UI renders "Pantangan Pasien: pepaya" in summary card, and recommendations are 100% free of papaya!\n');

console.log('🎉 ALL PAPAYA RESTRICTION TESTS PASSED! 🚀');
