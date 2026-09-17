const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser DOM & environment
class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.style = {};
    this._classes = new Set();
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
    this.value = '0';
    this.checked = false;
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
  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k]; }
  appendChild(child) { this.children.push(child); }
  remove() {}
  focus() {}
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
    fill: () => {},
    stroke: () => {},
    closePath: () => {},
    setLineDash: () => {},
    fillText: () => {},
    measureText: () => ({ width: 50 }),
    translate: () => {},
    moveTo: () => {},
    lineTo: () => {},
    rect: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} })
  }),
  addEventListener: () => {},
  style: {}
};

global.window = {
  location: { hash: '#overview' },
  scrollTo: () => {},
  history: { pushState: () => {} },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  },
  navigator: {},
  addEventListener: () => {},
  devicePixelRatio: 1,
  lucide: { createIcons: () => {} }
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.localStorage = global.window.localStorage;
global.Image = class {
  constructor() {
    this.complete = false;
    this.naturalWidth = 0;
  }
};

const queryElements = [];
global.document = {
  body: new MockElement('body'),
  getElementById,
  querySelectorAll: (selector) => {
    if (selector.includes('.booster-preset-card')) {
      return [
        getElementById('preset-btn-default'),
        getElementById('preset-btn-rehab'),
        getElementById('preset-btn-wound'),
        getElementById('preset-btn-appetite')
      ];
    }
    if (selector.includes('.booster-chips-group input[type="checkbox"]')) {
      const allChips = [
        getElementById('booster-focus-albumin'),
        getElementById('booster-focus-zinc'),
        getElementById('booster-focus-vitc'),
        getElementById('booster-focus-omega3')
      ];
      if (selector.includes(':checked')) {
        return allChips.filter(c => c.checked);
      }
      return allChips;
    }
    return [];
  },
  querySelector: (selector) => new MockElement(),
  createElement: (tag) => new MockElement('', tag),
  documentElement: { lang: 'id', setAttribute: () => {}, removeAttribute: () => {}, classList: new Set() },
  addEventListener: () => {}
};

// Set dataset attributes for preset cards
getElementById('preset-btn-default').setAttribute('data-preset', 'default');
getElementById('preset-btn-rehab').setAttribute('data-preset', 'rehab');
getElementById('preset-btn-wound').setAttribute('data-preset', 'wound');
getElementById('preset-btn-appetite').setAttribute('data-preset', 'appetite');

// Set values for checkbox focus chips
getElementById('booster-focus-albumin').value = 'albumin';
getElementById('booster-focus-zinc').value = 'zinc';
getElementById('booster-focus-vitc').value = 'vitc';
getElementById('booster-focus-omega3').value = 'omega3';

// Load scripts in order
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const i18nCode = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');
const cvCode = fs.readFileSync(path.join(__dirname, '../js/cv-engine.js'), 'utf8');
const progCode = fs.readFileSync(path.join(__dirname, '../js/progress.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInThisContext(dataCode);
vm.runInThisContext(i18nCode);
vm.runInThisContext(cvCode);
vm.runInThisContext(progCode);

// Mock instance globals
global.cvEngine = new NutriVisionCVEngine();
global.progressTracker = new NutriVisionProgress();
global.mealPlanner = { renderPlanner: () => {}, renderSymptomFilter: () => {} };

vm.runInThisContext(appCode);

async function runTests() {
  dom['overview-plate-canvas'] = mockCanvas;
  const testApp = global.window.app;
  console.log('=== TEST 1: User Profile Initial & Demo Login ===');
  await testApp.loginAsDemo('post-surgery');

  const p = testApp.userProfile;
console.log('Base Protein:', p.baseTargets.protein, '(Expected: 75)');
console.log('Effective Protein:', p.targets.protein, '(Expected: 75)');
console.log('Effective Calories:', p.targets.calories, '(Expected: 1850)');
console.log('Booster Active:', p.additionalTargets.active, '(Expected: false)');

if (p.targets.protein !== 75 || p.targets.calories !== 1850) {
  throw new Error('Initial targets mismatch!');
}

console.log('\n=== TEST 2: Apply Rehab Preset (+15g Protein, +200 kcal) ===');
testApp.openNutritionBoosterModal();
testApp.selectBoosterPreset('rehab');

const protInput = getElementById('booster-input-protein');
const calsInput = getElementById('booster-input-calories');
console.log('Modal Input Protein value:', protInput.value, '(Expected: 15)');
console.log('Modal Input Calories value:', calsInput.value, '(Expected: 200)');

if (parseInt(protInput.value, 10) !== 15 || parseInt(calsInput.value, 10) !== 200) {
  throw new Error('Preset values not assigned to form controls!');
}

// Save booster
testApp.saveNutritionBooster();

const p2 = testApp.userProfile;
console.log('Updated Booster Active:', p2.additionalTargets.active, '(Expected: true)');
console.log('Updated Base Protein:', p2.baseTargets.protein, '(Expected: 75)');
console.log('Updated Additional Protein:', p2.additionalTargets.protein, '(Expected: 15)');
console.log('Updated Effective Protein:', p2.targets.protein, '(Expected: 90)');
console.log('Updated Effective Calories:', p2.targets.calories, '(Expected: 2050)');

if (p2.targets.protein !== 90 || p2.targets.calories !== 2050) {
  throw new Error('Effective targets did not sum base + booster!');
}

// Check DOM elements
const card2Badge = getElementById('ov-card2-booster-badge');
const card2Banner = getElementById('ov-card2-booster-active-banner');
const subProt = getElementById('macro-sub-protein');
const subCals = getElementById('macro-sub-cals');
const profileBadge = getElementById('profile-booster-status-badge');
const profileDetails = getElementById('profile-booster-details');

console.log('Card 2 Badge text:', card2Badge.textContent);
console.log('Card 2 Banner display:', card2Banner.style.display, '(Expected: flex)');
console.log('Sub Protein text:', subProt.textContent);
console.log('Sub Calories text:', subCals.textContent);
console.log('Profile Badge text:', profileBadge.textContent);

if (card2Banner.style.display !== 'flex') {
  throw new Error('Card 2 active booster banner not displayed!');
}
if (!subProt.textContent.includes('Booster 15g')) {
  throw new Error('Protein subtext does not mention Booster 15g!');
}

console.log('\n=== TEST 3: Step adjustment (+5g Protein via stepper) ===');
testApp.openNutritionBoosterModal();
testApp.stepBoosterValue('protein', 5); // 15 + 5 = 20
testApp.saveNutritionBooster();

const p3 = testApp.userProfile;
console.log('Stepped Protein Target:', p3.targets.protein, '(Expected: 95)');
if (p3.targets.protein !== 95) {
  throw new Error('Stepping booster value failed!');
}

console.log('\n=== TEST 4: Reset Booster to Baseline ===');
testApp.resetNutritionBooster();

const p4 = testApp.userProfile;
console.log('After Reset Booster Active:', p4.additionalTargets.active, '(Expected: false)');
console.log('After Reset Protein Target:', p4.targets.protein, '(Expected: 75)');
console.log('After Reset Calories Target:', p4.targets.calories, '(Expected: 1850)');
console.log('Card 2 Banner display after reset:', card2Banner.style.display, '(Expected: none)');

if (p4.targets.protein !== 75 || p4.additionalTargets.active !== false || card2Banner.style.display !== 'none') {
  throw new Error('Reset booster failed to restore clinical baseline!');
}

  console.log('\n🎉 ALL NUTRITION BOOSTER TESTS PASSED FLAWLESSLY!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
