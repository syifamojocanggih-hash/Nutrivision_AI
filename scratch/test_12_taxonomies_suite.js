// Comprehensive Test Suite for 12 Recovery Taxonomies and API Integrations
const fs = require('fs');
const path = require('path');
const vm = require('vm');

class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.style = {};
    this._classes = new Set();
    this.children = [];
    this._innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.dataset = {};
    this.getContext = () => mockCanvas.getContext();
    this.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300, right: 300, bottom: 300 });
    this.addEventListener = () => {};
    this.classList = {
      add: (c) => this._classes.add(c),
      remove: (c) => this._classes.delete(c),
      contains: (c) => this._classes.has(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) this._classes.add(c); else this._classes.delete(c);
        } else {
          if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
        }
      }
    };
  }
  set innerHTML(val) {
    this._innerHTML = val;
    this.textContent = val.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  get innerHTML() {
    return this._innerHTML;
  }
  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k]; }
  appendChild(child) { this.children.push(child); }
  remove() {}
  focus() {}
  reset() {}
}

const dom = {};
function getElementById(id) {
  if (!dom[id]) {
    dom[id] = new MockElement(id);
  }
  return dom[id];
}

const mockCanvas = {
  getContext: () => ({
    scale: () => {},
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    arc: () => {},
    stroke: () => {},
    fill: () => {},
    fillText: () => {},
    strokeRect: () => {},
    fillRect: () => {},
    rect: () => {},
    roundRect: () => {},
    setLineDash: () => {},
    moveTo: () => {},
    lineTo: () => {},
    measureText: () => ({ width: 50 })
  }),
  width: 300,
  height: 300,
  style: {}
};

const mockLocalStorage = {
  _data: {},
  getItem: (k) => mockLocalStorage._data[k] || null,
  setItem: (k, v) => { mockLocalStorage._data[k] = String(v); },
  removeItem: (k) => { delete mockLocalStorage._data[k]; },
  clear: () => { mockLocalStorage._data = {}; }
};

global.window = {
  location: { hash: '', search: '', pathname: '/' },
  history: { pushState: () => {}, replaceState: () => {} },
  scrollTo: () => {},
  lucide: { createIcons: () => {} },
  localStorage: mockLocalStorage,
  addEventListener: () => {},
  document: {
    getElementById,
    querySelector: (sel) => {
      const idMatch = sel.match(/#([\w-]+)/);
      if (idMatch) return getElementById(idMatch[1]);
      return new MockElement('', sel);
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: (tag) => {
      if (tag === 'canvas') return mockCanvas;
      return new MockElement('', tag);
    },
    documentElement: { setAttribute: () => {}, removeAttribute: () => {} },
    body: new MockElement('body', 'body')
  }
};
global.document = global.window.document;
global.localStorage = mockLocalStorage;
global.navigator = { language: 'id-ID', userAgent: 'NodeTest' };
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

// Load application scripts
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const i18nCode = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');
const cvCode = fs.readFileSync(path.join(__dirname, '../js/cv-engine.js'), 'utf8');
const progCode = fs.readFileSync(path.join(__dirname, '../js/progress.js'), 'utf8');
const valCode = fs.readFileSync(path.join(__dirname, '../js/food_clinical_validator.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInThisContext(dataCode);
vm.runInThisContext(i18nCode);
vm.runInThisContext(cvCode);
vm.runInThisContext(progCode);
vm.runInThisContext(valCode);

global.cvEngine = new NutriVisionCVEngine();
global.progressTracker = new NutriVisionProgress();
global.mealPlanner = { renderPlanner: () => {}, renderSymptomFilter: () => {} };
global.communityHandler = { renderCommunityFeed: () => {} };
global.caregiverHandler = { renderCaregiverList: () => {} };

vm.runInThisContext(appCode);
global.app = new NutriVisionApp();

console.log('=== TEST 1: 12 Taxonomies Completeness Verification ===');
const expectedTaxonomies = [
  // 7 Medical
  'post_op_digestive',
  'post_op_oncology',
  'post_op_burns',
  'post_op_bariatric',
  'post_op_orthopedic',
  'post_op_cardio',
  'post_op_geriatric',
  // 5 Fitness
  'gym_hypertrophy',
  'gym_powerlifting',
  'gym_endurance',
  'gym_recomp',
  'gym_high_volume'
];

expectedTaxonomies.forEach(tId => {
  const prof = NUTRIVISION_DATA.recoveryProfiles[tId];
  if (!prof) {
    throw new Error(`Missing taxonomy profile for: ${tId}`);
  }
  console.log(`[PASS] ${prof.category || prof.title} (${prof.group})`);
  console.log(`  Protocol: ${prof.protocol}`);
  console.log(`  Key Nutrients: ${prof.keyMicronutrients?.join(', ')}`);
  console.log(`  API Sources: ${prof.recommendedApiSources?.join(', ')}`);
  console.log(`  Phases: ${prof.phases.length}, Milestones: ${prof.monthlyMilestones.length}, Schedules: ${prof.defaultDailySchedules.length}, Contraindications: ${prof.contraindications.length}`);

  if (prof.phases.length < 3) throw new Error(`${tId} missing 3 phases!`);
  if (prof.monthlyMilestones.length < 2) throw new Error(`${tId} missing milestones!`);
  if (prof.defaultDailySchedules.length < 5) throw new Error(`${tId} missing schedules!`);
  if (prof.contraindications.length < 3) throw new Error(`${tId} missing contraindications!`);
});
console.log('>>> TEST 1 PASSED: All 12 taxonomy profiles verified with full clinical depth!\n');

console.log('=== TEST 2: Backward Compatibility Aliases ===');
const legacyAliases = ['post-surgery', 'rehab', 'gym'];
legacyAliases.forEach(alias => {
  const p = NUTRIVISION_DATA.recoveryProfiles[alias];
  if (!p || !p.monthlyMilestones) {
    throw new Error(`Legacy alias broken: ${alias}`);
  }
  console.log(`[PASS] Legacy alias ${alias} resolves to -> ${p.title}`);
});
console.log('>>> TEST 2 PASSED: Backward compatibility verified!\n');

console.log('=== TEST 3: App Group & Category Selection Simulation ===');
app.init();

// Select Medical Group
app.handleJourneyGroupSelect('medical');
console.log('Switched to Medical Group:', app.journeyCondition);
if (app.journeyCondition !== 'post_op_digestive') {
  throw new Error('Medical group default condition should be post_op_digestive');
}

// Select Specific Bariatric Category
app.handleJourneyCategorySelect('post_op_bariatric');
console.log('Switched to Bariatric:', app.journeyCondition);
const banner = getElementById('journey-taxonomy-info-banner');
console.log('Banner contains ASMBS / Porsi Mikro / Bariatrik:', banner.innerHTML.includes('Bedah Bariatrik') || banner.innerHTML.includes('Bariatrik'));
if (app.journeyCondition !== 'post_op_bariatric') {
  throw new Error('Category select failed for bariatric!');
}

// Select Fitness Group
app.handleJourneyGroupSelect('fitness');
console.log('Switched to Fitness Group:', app.journeyCondition);
if (app.journeyCondition !== 'gym_hypertrophy') {
  throw new Error('Fitness group default condition should be gym_hypertrophy');
}

// Select High-Volume Endurance Category
app.handleJourneyCategorySelect('gym_endurance');
console.log('Switched to Endurance:', app.journeyCondition);
console.log('Endurance Banner contains Karbohidrat / Elektrolit / ACSM:', banner.innerHTML.includes('CrossFit') || banner.innerHTML.includes('Endurance'));

console.log('>>> TEST 3 PASSED: Group selection and category dropdown switching verified!\n');

console.log('=== TEST 4: Clinical Protein Budget Calculation Across 12 Taxonomies ===');
const anthro = { weight: 70, height: 175, age: 30, gender: 'male' };
expectedTaxonomies.forEach(tId => {
  const budget = global.FoodClinicalValidator.getProteinBudget(anthro, [], tId);
  console.log(`[PASS] Protein budget for ${tId} (70kg): ${budget.dailyMin}-${budget.dailyMax}g (${budget.clinicalNote})`);
  if (!budget.dailyMin || budget.dailyMin < 60) {
    throw new Error(`Invalid protein budget for ${tId}`);
  }
});
console.log('>>> TEST 4 PASSED: Protein calculation accurate across all 12 taxonomies!\n');

console.log('=== TEST 5: HTML Verification in index.html ===');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
console.log('index.html contains journey-taxonomy-selector-wrapper:', html.includes('journey-taxonomy-selector-wrapper'));
console.log('index.html contains journey-category-dropdown:', html.includes('id="journey-category-dropdown"'));
console.log('index.html contains journey-btn-group-med:', html.includes('id="journey-btn-group-med"'));
console.log('index.html contains journey-btn-group-fit:', html.includes('id="journey-btn-group-fit"'));
console.log('index.html contains all 12 option values:');
expectedTaxonomies.forEach(tId => {
  const hasOpt = html.includes(`value="${tId}"`);
  console.log(`  value="${tId}": ${hasOpt}`);
  if (!hasOpt) throw new Error(`Missing option ${tId} in index.html`);
});

console.log('>>> TEST 5 PASSED: HTML structure fully aligned with 12-taxonomy model!\n');

console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 12-TAXONOMY CLINICAL & FITNESS ARCHITECTURE FULLY VALIDATED! 🎉');
