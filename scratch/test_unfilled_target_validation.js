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
    return [];
  },
  querySelector: (selector) => new MockElement(),
  createElement: (tag) => new MockElement('', tag),
  documentElement: { lang: 'id', setAttribute: () => {}, removeAttribute: () => {}, classList: new Set() },
  addEventListener: () => {}
};

getElementById('preset-btn-default').setAttribute('data-preset', 'default');
getElementById('preset-btn-rehab').setAttribute('data-preset', 'rehab');
getElementById('preset-btn-wound').setAttribute('data-preset', 'wound');
getElementById('preset-btn-appetite').setAttribute('data-preset', 'appetite');

const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const i18nCode = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');
const cvCode = fs.readFileSync(path.join(__dirname, '../js/cv-engine.js'), 'utf8');
const progCode = fs.readFileSync(path.join(__dirname, '../js/progress.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInThisContext(dataCode);
vm.runInThisContext(i18nCode);
vm.runInThisContext(cvCode);
vm.runInThisContext(progCode);

global.cvEngine = new NutriVisionCVEngine();
global.progressTracker = new NutriVisionProgress();
global.mealPlanner = { renderPlanner: () => {}, renderSymptomFilter: () => {} };

vm.runInThisContext(appCode);

async function runValidation() {
  dom['overview-plate-canvas'] = mockCanvas;
  const testApp = global.window.app;

  console.log('--- TEST A: Fresh user login (Zero Booster & Zero Healing Targets Inputted) ---');
  await testApp.loginAsDemo('post-surgery');

  const card2Badge = getElementById('ov-card2-booster-badge');
  const card2Banner = getElementById('ov-card2-booster-active-banner');
  const c2MilestoneBox = getElementById('ov-card2-healing-milestone-box');

  console.log('Card 2 Badge display:', card2Badge.style.display, '(Expected: none)');
  console.log('Card 2 Banner display:', card2Banner.style.display, '(Expected: none)');
  console.log('Card 2 Milestone Box display:', c2MilestoneBox.style.display, '(Expected: none)');

  if (card2Badge.style.display !== 'none' || card2Banner.style.display !== 'none' || c2MilestoneBox.style.display !== 'none') {
    throw new Error('Fresh user targets are unexpectedly visible before input!');
  }

  console.log('\n--- TEST B: Stale LocalStorage Sanitization (Simulate User Screenshot State) ---');
  // Mock the exact state that caused the user bug:
  // additionalTargets with active: true, +0g Prot, reason: "Saran akselerasi mobilisasi luka bedah dari dr. Hendra, Sp.KFR"
  // healingTarget with totalGrams: 200, accumulatedGrams: 420
  const buggyProfile = {
    hasCompletedQuiz: true,
    role: 'patient',
    name: 'Pasien Test',
    contact: 'test@nutrivision.id',
    targets: { protein: 75, calories: 1800, carbs: 220, fat: 55 },
    baseTargets: { protein: 75, calories: 1800, carbs: 220, fat: 55 },
    additionalTargets: {
      protein: 0,
      calories: 0,
      carbs: 0,
      fat: 0,
      focus: ['albumin', 'zinc'],
      reason: 'Saran akselerasi mobilisasi luka bedah dari dr. Hendra, Sp.KFR',
      active: true
    },
    healingTarget: {
      totalGrams: 200,
      accumulatedGrams: 420
    }
  };

  global.localStorage.setItem('nutrivision_user_profile', JSON.stringify(buggyProfile));

  // Reload profile through loadUserProfile
  const cleanedProfile = testApp.loadUserProfile();
  testApp.userProfile = cleanedProfile;
  testApp.updateBoosterUI();

  console.log('Cleaned booster active:', cleanedProfile.additionalTargets.active, '(Expected: false)');
  console.log('Cleaned booster reason:', cleanedProfile.additionalTargets.reason, '(Expected: "")');
  console.log('Cleaned healing target active:', cleanedProfile.healingTarget?.active, '(Expected: false)');
  console.log('Cleaned healing target total:', cleanedProfile.healingTarget?.totalGrams, '(Expected: >= 500)');
  console.log('Card 2 Banner display after reload:', card2Banner.style.display, '(Expected: none)');
  console.log('Card 2 Badge display after reload:', card2Badge.style.display, '(Expected: none)');
  console.log('Card 2 Milestone Box display after reload:', c2MilestoneBox.style.display, '(Expected: none)');

  if (cleanedProfile.additionalTargets.active !== false) {
    throw new Error('Booster active was not sanitized to false!');
  }
  if (card2Banner.style.display !== 'none') {
    throw new Error('Booster banner is still showing for 0g booster!');
  }
  if (c2MilestoneBox.style.display !== 'none') {
    throw new Error('Milestone box is still showing when not explicitly active!');
  }

  console.log('\n--- TEST C: Opening Booster Modal has 0g inputs and no dummy text ---');
  testApp.openNutritionBoosterModal();
  const inpProt = getElementById('booster-input-protein');
  const inpReason = getElementById('booster-reason-input');
  const inpTotProt = getElementById('booster-total-prot-input');
  const healAccumTxt = getElementById('booster-healing-accum-txt');

  console.log('Modal booster protein input value:', inpProt.value, '(Expected: 0)');
  console.log('Modal total protein input value:', inpTotProt.value, '(Expected: 75)');
  console.log('Modal reason input value:', inpReason.value, '(Expected: "")');
  console.log('Modal healing accumulated text:', healAccumTxt.textContent, '(Expected: 0 g)');

  if (inpProt.value !== 0 && inpProt.value !== '0') {
    throw new Error('Modal booster protein should default to 0!');
  }
  if (inpReason.value !== '') {
    throw new Error('Modal reason should be empty!');
  }
  if (healAccumTxt.textContent !== '0 g') {
    throw new Error('Healing accumulated text should be 0 g!');
  }

  console.log('\n✅ ALL UNFILLED TARGET VALIDATION TESTS PASSED PERFECTLY!');
}

runValidation().catch(err => {
  console.error(err);
  process.exit(1);
});
