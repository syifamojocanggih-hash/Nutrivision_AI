// Test Suite: 12-Taxonomy Dropdown & Diagnostic Preview Verification
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock browser environment
const dom = {};
global.document = {
  getElementById: (id) => {
    if (!dom[id]) {
      dom[id] = {
        id,
        value: '',
        textContent: '',
        innerHTML: '',
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          toggle(c, force) {
            if (force === undefined) {
              if (this.classes.has(c)) this.classes.delete(c);
              else this.classes.add(c);
            } else if (force) this.classes.add(c);
            else this.classes.delete(c);
          },
          contains(c) { return this.classes.has(c); }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        focus: () => {},
        scrollIntoView: () => {}
      };
    }
    return dom[id];
  },
  body: {
    appendChild: () => {},
    removeChild: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false }
  },
  createElement: () => ({
    classList: { add: () => {}, remove: () => {} },
    style: {},
    appendChild: () => {},
    setAttribute: () => {},
    remove: () => {}
  }),
  documentElement: {
    setAttribute: () => {},
    removeAttribute: () => {},
    getAttribute: () => null
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: (selector) => {
    return [];
  },
  querySelector: (selector) => {
    return null;
  }
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

global.window = {
  history: { pushState: () => {}, replaceState: () => {} },
  scrollTo: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  lucide: {
    createIcons: () => {}
  },
  i18n: {
    getLanguage: () => 'id',
    t: (k) => k
  },
  BappenasFoodAPI: {
    getActiveRegion: () => ({ provinceId: 11, provinceName: 'DKI Jakarta', cityName: 'Jakarta Pusat' }),
    setActiveRegion: () => {},
    getProvinces: async () => [{ id: 11, name: 'DKI Jakarta', multiplier: 1.0 }]
  },
  localStorage: global.localStorage
};

global.progressTracker = new Proxy({}, {
  get: () => () => {}
});

global.cvEngine = new Proxy({}, {
  get: () => () => {}
});

// Load App class
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

// Evaluate App class
const script = new Function(appCode + '; return NutriVisionApp;')();
const app = new script();

console.log('=== TEST 1: Check TAXONOMY_REGISTRY Count & Structure ===');
const registry = script.TAXONOMY_REGISTRY;
assert(registry, 'TAXONOMY_REGISTRY should be defined');
const keys = Object.keys(registry);
console.log('Total categories in TAXONOMY_REGISTRY:', keys.length);
assert.strictEqual(keys.length, 12, 'Must have exactly 12 categories');

const expectedCategories = [
  'post_op_digestive',
  'post_op_oncology',
  'post_op_burns',
  'post_op_bariatric',
  'post_op_orthopedic',
  'post_op_cardio',
  'post_op_geriatric',
  'gym_hypertrophy',
  'gym_powerlifting',
  'gym_endurance',
  'gym_recomp',
  'gym_high_volume'
];

expectedCategories.forEach((catId, idx) => {
  const item = registry[catId];
  assert(item, `Category ${catId} must exist`);
  assert(item.title, `Category ${catId} must have title`);
  assert(item.protocol, `Category ${catId} must have protocol`);
  assert(item.focusText, `Category ${catId} must have focusText`);
  assert(Array.isArray(item.keyNutrients) && item.keyNutrients.length > 0, `Category ${catId} must have keyNutrients`);
  assert(Array.isArray(item.apis) && item.apis.length > 0, `Category ${catId} must have apis`);
  assert(item.proteinMultiplier > 0, `Category ${catId} must have proteinMultiplier`);
  console.log(`  [OK] ${idx + 1}. ${item.id} -> ${item.title} (${item.proteinMultiplier} g/kg BB) [APIs: ${item.apis.join(', ')}]`);
});
console.log('>>> TEST 1 PASSED: All 12 taxonomies properly registered with protocols & APIs!\n');

console.log('=== TEST 2: Test renderTaxonomyPreview for all 12 Categories ===');
expectedCategories.forEach((catId) => {
  app.renderTaxonomyPreview(catId);
  const previewHtml = dom['onboard-taxonomy-preview-card'].innerHTML;
  const item = registry[catId];
  assert(previewHtml.includes(item.title), `Preview card must contain title for ${catId}`);
  assert(previewHtml.includes(item.protocol), `Preview card must contain protocol for ${catId}`);
  assert(previewHtml.includes(item.keyNutrients[0]), `Preview card must contain key nutrient for ${catId}`);
  assert(previewHtml.includes(item.apis[0]), `Preview card must contain API source for ${catId}`);
});
console.log('>>> TEST 2 PASSED: Live preview card correctly renders rich metadata for all 12 categories!\n');

console.log('=== TEST 3: Diagnostic Calculations for Medical & Fitness Profiles ===');
// Test Post-Op Burns (2.0 g/kg)
document.getElementById('onboard-name').value = 'Budi Santoso';
document.getElementById('onboard-weight').value = '70';
document.getElementById('onboard-height').value = '175';
document.getElementById('onboard-age').value = '35';
app.quizState.gender = 'male';
app.quizState.condition = 'post_op_burns';
app.quizState.activity = 'bedrest';
app.calculateDiagnosticResults();

assert.strictEqual(app.calculatedDiagnostics.protein, 140, '70kg * 2.0g/kg should be 140g protein');
console.log('  [OK] post_op_burns (70kg): Protein target =', app.calculatedDiagnostics.protein, 'g (Multiplier:', app.calculatedDiagnostics.protMultiplier, ')');

// Test Body Recomposition (2.2 g/kg)
app.quizState.condition = 'gym_recomp';
app.quizState.activity = 'active';
app.calculateDiagnosticResults();
assert.strictEqual(app.calculatedDiagnostics.protein, 154, '70kg * 2.2g/kg should be 154g protein');
console.log('  [OK] gym_recomp (70kg): Protein target =', app.calculatedDiagnostics.protein, 'g (Multiplier:', app.calculatedDiagnostics.protMultiplier, ')');

// Test Bariatric (1.4 g/kg)
app.quizState.condition = 'post_op_bariatric';
app.calculateDiagnosticResults();
assert.strictEqual(app.calculatedDiagnostics.protein, 98, '70kg * 1.4g/kg should be 98g protein');
console.log('  [OK] post_op_bariatric (70kg): Protein target =', app.calculatedDiagnostics.protein, 'g (Multiplier:', app.calculatedDiagnostics.protMultiplier, ')');

console.log('>>> TEST 3 PASSED: Precision WHO / ESPEN / ISSN macro calculations verified!\n');

console.log('=== TEST 4: Dropdown Change Event & Profile Save ===');
// Simulate user selecting Onkologi in dropdown
const mockSelect = { value: 'post_op_oncology' };
app.onConditionSelectChange(mockSelect);
assert.strictEqual(app.quizState.condition, 'post_op_oncology', 'quizState.condition should update on dropdown change');

// Setup form inputs for full onboarding completion
const provEl = document.getElementById('onboard-province');
provEl.value = '11';
provEl.selectedIndex = 0;
provEl.options = [{ text: 'DKI Jakarta (1.0x)' }];

document.getElementById('onboard-name').value = 'Siti Rahma';
document.getElementById('onboard-contact').value = 'siti@nutrivision.id';
document.getElementById('onboard-age').value = '42';
document.getElementById('onboard-phase').value = 'Minggu ke-2 (Fase Proliferasi & Jaringan)';
document.getElementById('onboard-restrictions').value = 'Hindari garam tinggi, alergi kerang';
document.getElementById('onboard-consent-check').checked = true;

app.saveOnboardingProfile();

assert.strictEqual(app.userProfile.conditionId, 'post_op_oncology', 'Saved profile conditionId must match');
assert.strictEqual(app.userProfile.conditionTitle, 'Pasca-Bedah Kanker & Onkologi', 'Saved profile conditionTitle must match');
assert.strictEqual(app.userProfile.targets.protein, Math.round(70 * 1.8), 'Protein target should match 1.8 multiplier');
assert.strictEqual(app.userProfile.hasCompletedQuiz, true, 'hasCompletedQuiz must be true');

console.log('  Saved Profile:', {
  name: app.userProfile.name,
  conditionId: app.userProfile.conditionId,
  conditionTitle: app.userProfile.conditionTitle,
  proteinTarget: app.userProfile.targets.protein,
  calorieTarget: app.userProfile.targets.calories
});

console.log('>>> TEST 4 PASSED: User profile successfully saved with selected 12-taxonomy condition!\n');

console.log('=== TEST 5: HTML Verification for <select> and <optgroup> in index.html ===');
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
assert(indexHtml.includes('id="onboard-condition-select"'), 'index.html must have #onboard-condition-select');
assert(indexHtml.includes('optgroup label="🏥 Pasca-Operasi (Medis) — 7 Kategori Klinis"'), 'index.html must have Medical optgroup');
assert(indexHtml.includes('optgroup label="⚡ Gym & Fitness — 5 Kategori Kebugaran"'), 'index.html must have Fitness optgroup');
assert(indexHtml.includes('value="post_op_digestive"'), 'index.html must have post_op_digestive option');
assert(indexHtml.includes('value="gym_high_volume"'), 'index.html must have gym_high_volume option');
assert(indexHtml.includes('id="onboard-taxonomy-preview-card"'), 'index.html must have #onboard-taxonomy-preview-card');

console.log('>>> TEST 5 PASSED: index.html markup correctly contains grouped 12-taxonomy dropdown & live preview card!\n');

console.log('🌟 ALL 12-TAXONOMY DROPDOWN & PREVIEW TESTS PASSED 100%! 🌟');
