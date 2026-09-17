// Test verification script for Doctor & Caregiver Role Split and Quiz Form Guard
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
    this.value = '';
    this.checked = false;
    this.dataset = {};
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
  querySelectorAll() { return []; }
  querySelector() { return null; }
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
    rotate: () => {},
    rect: () => {},
    roundRect: () => {},
    moveTo: () => {},
    lineTo: () => {}
  }),
  parentElement: { clientWidth: 400 },
  width: 180,
  height: 180
};

// Global mocks
global.window = {
  location: { hash: '' },
  history: { pushState: () => {} },
  scrollTo: () => {},
  addEventListener: () => {},
  navigator: {},
  devicePixelRatio: 1,
  lucide: { createIcons: () => {} },
  i18n: { getLanguage: () => 'id' },
  localStorage: {
    _data: {},
    getItem: function (k) { return this._data[k] || null; },
    setItem: function (k, v) { this._data[k] = String(v); },
    removeItem: function (k) { delete this._data[k]; },
    clear: function () { this._data = {}; }
  }
};

global.document = {
  getElementById: (id) => {
    if (id && id.includes('canvas')) return mockCanvas;
    return getElementById(id);
  },
  querySelectorAll: (selector) => {
    return [new MockElement('mock-el')];
  },
  querySelector: (selector) => {
    return new MockElement('mock-query');
  },
  createElement: (tag) => new MockElement('', tag),
  documentElement: { lang: 'id', setAttribute: () => {}, removeAttribute: () => {}, classList: new Set() },
  addEventListener: () => {},
  body: new MockElement('body')
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.localStorage = global.window.localStorage;
global.Image = class {
  constructor() {
    this.complete = false;
    this.naturalWidth = 0;
  }
};

// Load scripts in order
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const i18nCode = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');
const cvCode = fs.readFileSync(path.join(__dirname, '../js/cv-engine.js'), 'utf8');
const progCode = fs.readFileSync(path.join(__dirname, '../js/progress.js'), 'utf8');
const dbCode = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInThisContext(dataCode);
vm.runInThisContext(i18nCode);
vm.runInThisContext(cvCode);
vm.runInThisContext(progCode);
vm.runInThisContext(dbCode);

// Mock instance globals
global.cvEngine = new NutriVisionCVEngine();
global.progressTracker = new NutriVisionProgress();
global.mealPlanner = { renderPlanner: () => {}, renderSymptomFilter: () => {} };
global.communityHandler = { renderCommunityFeed: () => {} };
global.caregiverHandler = { renderCaregiverList: () => {} };
global.nutriVisionDB = window.nutriVisionDB || new NutriVisionDatabase();

vm.runInThisContext(appCode);
global.app = new NutriVisionApp();

async function runDoctorTests() {
  console.log('=== TEST 1: Doctor Login & Dashboard Routing ===');
  
  // Login as doctor demo
  await app.loginAsDemo('doctor');

  console.log('User Profile Role:', app.userProfile.role);
  console.log('User Profile Name:', app.userProfile.name);
  console.log('hasCompletedQuiz:', app.userProfile.hasCompletedQuiz);
  console.log('Active Section:', app.activeSection);
  console.log('Current Doctor Patient ID:', app.currentDoctorPatientId);
  console.log('Doctor Patients count:', app.doctorPatients?.length);

  if (app.userProfile.role !== 'doctor') throw new Error('FAIL: role must be doctor!');
  if (!app.userProfile.hasCompletedQuiz) throw new Error('FAIL: doctor must have hasCompletedQuiz: true!');
  if (app.activeSection !== 'doctor') throw new Error(`FAIL: doctor active section must be "doctor", got "${app.activeSection}"!`);
  if (!app.doctorPatients || app.doctorPatients.length < 3) throw new Error('FAIL: doctor must have 3 patients monitored!');

  console.log('>>> TEST 1 PASSED: Doctor login routed to Doctor Clinical Dashboard without quiz!\n');

  console.log('=== TEST 2: Strict Quiz Form Guard on Doctor Role ===');
  dom['onboarding-modal'] = new MockElement('onboarding-modal');
  
  app.openQuizModal(1);
  if (dom['onboarding-modal'].classList.contains('open')) {
    throw new Error('FAIL: openQuizModal must NEVER open for a doctor!');
  }
  
  app.openDiagnosticQuiz(1);
  if (dom['onboarding-modal'].classList.contains('open')) {
    throw new Error('FAIL: openDiagnosticQuiz must NEVER open for a doctor!');
  }
  console.log('>>> TEST 2 PASSED: Quiz modal was strictly blocked from opening for doctor role!\n');

  console.log('=== TEST 3: Doctor Patient Switching & PDF Export ===');
  app.selectDoctorPatient('patient_ahmad');
  if (app.currentDoctorPatientId !== 'patient_ahmad') throw new Error('FAIL: active patient should switch to patient_ahmad!');
  console.log('Switched to patient:', app.currentDoctorPatientId);

  app.selectDoctorPatient('patient_subroto');
  if (app.currentDoctorPatientId !== 'patient_subroto') throw new Error('FAIL: active patient should switch to patient_subroto!');
  console.log('Switched to patient:', app.currentDoctorPatientId);

  console.log('>>> TEST 3 PASSED: Patient roster switching works seamlessly!\n');

  console.log('=== TEST 4: Caregiver Login & Dashboard Routing ===');
  await app.loginAsDemo('caregiver');
  console.log('User Profile Role:', app.userProfile.role);
  console.log('Active Section:', app.activeSection);
  if (app.userProfile.role !== 'caregiver') throw new Error('FAIL: role must be caregiver!');
  if (app.activeSection !== 'caregiver-dashboard') throw new Error(`FAIL: caregiver section must be caregiver-dashboard, got ${app.activeSection}!`);

  app.openQuizModal(1);
  if (dom['onboarding-modal'].classList.contains('open')) {
    throw new Error('FAIL: openQuizModal must NEVER open for a caregiver!');
  }
  console.log('>>> TEST 4 PASSED: Caregiver login routed to caregiver dashboard without quiz!\n');

  console.log('ALL DOCTOR & CAREGIVER ROLE TESTS PASSED! 🩺👨‍👩‍👧🎉');
  process.exit(0);
}

runDoctorTests().catch(err => {
  console.error('Doctor Test Error:', err);
  process.exit(1);
});
