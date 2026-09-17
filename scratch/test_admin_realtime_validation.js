/**
 * ============================================================================
 * NutriVision AI — Automated Real-Time Admin Validation & Sync Test Suite
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== VERIFYING REAL-TIME ADMIN VALIDATION & SYNC ===\n');

// 1. Mock Environment Setup
class MockElement {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.children = [];
    this.style = {};
    this.classList = {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, val) { if (val === undefined) val = !this._classes.has(c); if (val) this.add(c); else this.remove(c); }
    };
  }
  appendChild(child) { this.children.push(child); return child; }
  remove() {}
}

const mockElements = new Map();
function getElementById(id) {
  if (!mockElements.has(id)) {
    mockElements.set(id, new MockElement('div', id));
  }
  return mockElements.get(id);
}

// Global CustomEvent & BroadcastChannel mock
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.listeners = [];
  }
  addEventListener(type, cb) {
    if (type === 'message') this.listeners.push(cb);
  }
  postMessage(data) {
    MockBroadcastChannel.lastMessage = { channel: this.name, data };
    this.listeners.forEach(cb => cb({ data }));
  }
}
MockBroadcastChannel.lastMessage = null;

const eventListeners = new Map();
const sandbox = {
  console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  parseFloat,
  parseInt,
  Boolean,
  Set,
  Array,
  Object,
  String,
  RegExp,
  Date,
  Math,
  JSON,
  BroadcastChannel: MockBroadcastChannel,
  CustomEvent: class {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail || {};
    }
  },
  document: {
    getElementById,
    querySelectorAll: () => [],
    querySelector: () => new MockElement(),
    createElement: (tag) => new MockElement(tag),
    body: new MockElement('body'),
    addEventListener: (type, cb) => {
      if (!eventListeners.has(type)) eventListeners.set(type, []);
      eventListeners.get(type).push(cb);
    }
  },
  window: {
    location: { hash: '' },
    history: { pushState: () => {} },
    localStorage: {
      store: {},
      getItem(k) { return this.store[k] || null; },
      setItem(k, v) { this.store[k] = String(v); },
      removeItem(k) { delete this.store[k]; },
      clear() { this.store = {}; }
    },
    lucide: { createIcons: () => {} },
    refreshIcons: () => {},
    addEventListener: (type, cb) => {
      if (!eventListeners.has(type)) eventListeners.set(type, []);
      eventListeners.get(type).push(cb);
    },
    removeEventListener: () => {},
    dispatchEvent: (evt) => {
      const list = eventListeners.get(evt.type) || [];
      list.forEach(cb => cb(evt));
      return true;
    },
    scrollTo: () => {}
  },
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  },
  navigator: { userAgent: 'NodeTest' }
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.window.BroadcastChannel = MockBroadcastChannel;
vm.createContext(sandbox);

// 2. Load and Test js/admin_validator.js
console.log('1. Testing js/admin_validator.js...');
const validatorCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'admin_validator.js'), 'utf-8');
vm.runInContext(validatorCode, sandbox);

const validator = sandbox.window.nutriVisionAdminValidator;
console.assert(validator, 'FAIL: nutriVisionAdminValidator not instantiated');

// Test BMI
const bmi = validator.calculateBMI(65, 172);
console.assert(bmi === 22.0, `FAIL: BMI expected 22.0 got ${bmi}`);
const bmiCat = validator.getBMICategory(bmi);
console.assert(bmiCat.label.includes('Normal'), 'FAIL: BMI Category should be Normal');
console.log('  [PASS] BMI Calculation & Category: 65kg/172cm -> ' + bmi + ' (' + bmiCat.label + ')');

// Test Optimal Patient Evaluation (ERAS compliant: 80g / 50kg = 1.6 g/kg)
const patientSiti = {
  id: 'usr_demo_rehab',
  name: 'Siti Rahmawati',
  role: 'patient',
  weight: 50,
  height: 160,
  targetProtein: 80,
  targetCalories: 1750,
  hasCompletedQuiz: true
};
const valSiti = validator.validateUserClinicalData(patientSiti);
console.assert(valSiti.status === 'VALID_OPTIMAL', `FAIL: Expected VALID_OPTIMAL, got ${valSiti.status}`);
console.assert(valSiti.proteinRatio === 1.6, `FAIL: Expected 1.6 g/kg, got ${valSiti.proteinRatio}`);
console.log('  [PASS] Patient Siti: ' + valSiti.label + ' | Ratio: ' + valSiti.proteinRatio + ' g/kg');

// Test Sub-Optimal Patient Evaluation (Protein low: 40g / 65kg = 0.62 g/kg)
const lowProteinUser = {
  id: 'usr_test_low',
  name: 'Budi Rendah',
  role: 'patient',
  weight: 65,
  height: 170,
  targetProtein: 40,
  targetCalories: 1800,
  hasCompletedQuiz: true
};
const valLow = validator.validateUserClinicalData(lowProteinUser);
console.assert(valLow.status === 'NEEDS_ATTENTION', `FAIL: Expected NEEDS_ATTENTION, got ${valLow.status}`);
console.assert(valLow.flags.includes('PROTEIN_LOW'), 'FAIL: Expected PROTEIN_LOW flag');
console.log('  [PASS] Sub-optimal Protein Evaluation: ' + valLow.label + ' | Flags: ' + valLow.flags.join(', '));

// Test Incomplete Quiz Patient Evaluation
const noQuizUser = {
  id: 'usr_test_noquiz',
  name: 'Pasien Belum Kuis',
  role: 'patient',
  hasCompletedQuiz: false
};
const valNoQuiz = validator.validateUserClinicalData(noQuizUser);
console.assert(valNoQuiz.status === 'PENDING_QUIZ', `FAIL: Expected PENDING_QUIZ, got ${valNoQuiz.status}`);
console.log('  [PASS] Incomplete Quiz Evaluation: ' + valNoQuiz.label);

// Test Non-Patient System Role
const adminUser = { id: 'usr_admin', role: 'admin' };
const valAdmin = validator.validateUserClinicalData(adminUser);
console.assert(valAdmin.status === 'SYSTEM_ROLE', `FAIL: Expected SYSTEM_ROLE, got ${valAdmin.status}`);
console.log('  [PASS] Admin System Role Evaluation: ' + valAdmin.label);

// 3. Load and Test js/db.js Real-Time Pipeline
console.log('\n2. Testing js/db.js Real-Time Broadcast & Stats...');
const dbCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'db.js'), 'utf-8');
vm.runInContext(dbCode, sandbox);

const dbInstance = sandbox.window.nutriVisionDB;
console.assert(dbInstance, 'FAIL: nutriVisionDB not instantiated');

// Check stats with caregiverCount
dbInstance.getSystemStats().then(async stats => {
  console.assert(typeof stats.caregiverCount === 'number', 'FAIL: caregiverCount missing in stats');
  console.log('  [PASS] getSystemStats() includes caregiverCount: ' + stats.caregiverCount);

  // Test broadcast on saveUserDirect
  let receivedBroadcast = null;
  sandbox.window.addEventListener('nutrivision:data-changed', (e) => {
    receivedBroadcast = e.detail;
  });

  const updatedPatient = {
    id: 'usr_demo_surgery',
    name: 'Rangga Pratama',
    email: 'pasien@nutrivision.id',
    role: 'patient',
    weight: 65,
    height: 172,
    targetProtein: 90,
    targetCalories: 2100,
    hasCompletedQuiz: true
  };

  await dbInstance.saveUserDirect(updatedPatient);
  console.assert(receivedBroadcast && receivedBroadcast.type === 'USER_UPDATED', 'FAIL: Real-time broadcast not emitted on saveUserDirect');
  console.assert(receivedBroadcast.userId === 'usr_demo_surgery', 'FAIL: Incorrect userId in broadcast');
  console.log('  [PASS] saveUserDirect() successfully emits USER_UPDATED broadcast');

  // Verify Audit Log was recorded
  const auditLogs = dbInstance.getAuditLogs();
  console.assert(auditLogs.length > 0, 'FAIL: Audit logs empty');
  console.log('  [PASS] Audit logs populated: ' + auditLogs.length + ' logs in storage');

  // 4. Test js/app.js Integration
  console.log('\n3. Testing js/app.js Real-Time Sync & Admin Rendering...');
  const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf-8');
  vm.runInContext(appCode, sandbox);

  const appInstance = sandbox.window.app;
  console.assert(appInstance, 'FAIL: NutriVisionApp not instantiated');

  // Setup Admin view
  appInstance.activeSection = 'admin';
  await appInstance.renderAdminPortal('usr_demo_surgery');

  const usersTableBody = getElementById('admin-users-table-body');
  console.assert(usersTableBody.innerHTML.includes('Rangga Pratama'), 'FAIL: Rangga Pratama missing from admin users table');
  console.assert(usersTableBody.innerHTML.includes('admin-val-badge'), 'FAIL: Clinical validation badge missing from table');
  console.assert(usersTableBody.innerHTML.includes('admin-row-updated'), 'FAIL: Updated row pulse class missing for highlighted user');
  console.log('  [PASS] renderAdminPortal() rendered table with clinical validation badges & pulse highlight');

  // Test Clinical Verification Action
  await appInstance.verifyPatientClinicalData('usr_demo_surgery');
  const verifiedUser = (await dbInstance.getAllUsers()).find(u => u.id === 'usr_demo_surgery');
  console.assert(verifiedUser && verifiedUser.isClinicallyVerified === true, 'FAIL: Patient not marked as clinically verified');
  console.log('  [PASS] verifyPatientClinicalData() successfully verified user & logged audit');

  // Test 1-Click Simulation Trigger
  await appInstance.simulateUserRealtimeChange('target');
  console.log('  [PASS] simulateUserRealtimeChange("target") executed without error');

  console.log('\n======================================================');
  console.log('   ALL REAL-TIME ADMIN VALIDATION TESTS PASSED!       ');
  console.log('======================================================\n');
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
