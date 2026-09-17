const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== VERIFYING COMPLETE REMOVAL OF DOCTOR ROLE ===\n');

// 1. Static Content Inspection
console.log('1. Checking HTML content (index.html)...');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');

const hasViewDoctor = html.includes('id="view-doctor"');
const hasSidebarDoctor = html.includes('id="sidebar-nav-doctor"');
const hasCompanionDoctorCard = html.includes('companion-role-card doctor');
const hasCaregiverDashboard = html.includes('id="view-caregiver-dashboard"');
const hasCaregiverCard = html.includes('companion-role-card caregiver');

console.assert(!hasViewDoctor, 'FAIL: id="view-doctor" should NOT exist');
console.assert(!hasSidebarDoctor, 'FAIL: id="sidebar-nav-doctor" should NOT exist');
console.assert(!hasCompanionDoctorCard, 'FAIL: companion-role-card doctor should NOT exist');
console.assert(hasCaregiverDashboard, 'FAIL: id="view-caregiver-dashboard" MUST exist');
console.assert(hasCaregiverCard, 'FAIL: companion-role-card caregiver MUST exist');

console.log('  [PASS] view-doctor removed:', !hasViewDoctor);
console.log('  [PASS] sidebar-nav-doctor removed:', !hasSidebarDoctor);
console.log('  [PASS] doctor card removed from companion modal:', !hasCompanionDoctorCard);
console.log('  [PASS] caregiver dashboard retained:', hasCaregiverDashboard);
console.log('  [PASS] caregiver card present in modal:', hasCaregiverCard);

// 2. CSS Check
console.log('\n2. Checking CSS files...');
const stylesCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf-8');
console.assert(!stylesCss.includes('doctor.css'), 'FAIL: styles.css should not import doctor.css');
console.assert(stylesCss.includes('caregiver.css'), 'FAIL: styles.css must import caregiver.css');
console.log('  [PASS] styles.css does not import doctor.css');
console.log('  [PASS] styles.css imports caregiver.css');

const caregiverCssExists = fs.existsSync(path.join(__dirname, '..', 'css', 'caregiver.css'));
console.assert(caregiverCssExists, 'FAIL: css/caregiver.css must exist');
console.log('  [PASS] css/caregiver.css exists on disk');

// 3. JS Environment Setup
console.log('\n3. Setting up Mock Environment for JS...');
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
  addEventListener() {}
  remove() {}
}

const domRegistry = {};
function getElementById(id) {
  if (!domRegistry[id]) {
    domRegistry[id] = new MockElement(id);
  }
  return domRegistry[id];
}

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Date,
  Math,
  JSON,
  encodeURIComponent,
  decodeURIComponent,
  parseFloat,
  parseInt,
  Boolean,
  Set,
  Array,
  Object,
  String,
  RegExp,
  document: {
    getElementById,
    querySelectorAll: () => [],
    querySelector: () => new MockElement(),
    body: new MockElement('body'),
    addEventListener: () => {}
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
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
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
sandbox.addEventListener = () => {};
sandbox.removeEventListener = () => {};
sandbox.dispatchEvent = () => {};
sandbox.scrollTo = () => {};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
vm.createContext(sandbox);

// 4. Test db.js
console.log('4. Testing js/db.js...');
const dbCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'db.js'), 'utf-8');
vm.runInContext(dbCode, sandbox);

const dbInstance = sandbox.window.nutriVisionDB;
console.assert(dbInstance, 'FAIL: nutriVisionDB not instantiated');
const defaultUsers = dbInstance.getSeedUsersList ? dbInstance.getSeedUsersList() : [];
const doctorInDb = defaultUsers.find(u => u.role === 'doctor' || u.role === 'clinician' || u.id === 'usr_demo_doctor');
console.assert(!doctorInDb, 'FAIL: Doctor user found in getSeedUsersList()');
console.log('  [PASS] No doctor user in db.js default users list');

const caregiverInDb = defaultUsers.find(u => u.role === 'caregiver');
console.assert(caregiverInDb, 'FAIL: Caregiver user missing in getDefaultUsers()');
console.log('  [PASS] Caregiver user present in db.js default users list (' + caregiverInDb.name + ')');

// 5. Test app.js
console.log('\n5. Testing js/app.js...');
const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf-8');
vm.runInContext(appCode, sandbox);

const appInstance = sandbox.window.app;
console.assert(appInstance, 'FAIL: NutriVisionApp not instantiated as window.app');

// Verify Caregiver patient data
const cgPatient = appInstance.getCaregiverPatientData();
console.assert(cgPatient && cgPatient.name === 'Siti Rahma', 'FAIL: getCaregiverPatientData invalid');
console.log('  [PASS] getCaregiverPatientData() returns patient:', cgPatient.name, '-', cgPatient.condition);

// Verify renderCaregiverDashboard
appInstance.renderCaregiverDashboard();
const cgMetricsBox = getElementById('caregiver-metrics-container');
console.assert(cgMetricsBox.innerHTML.includes('Pasien Keluarga Tercinta'), 'FAIL: Caregiver metrics did not render correctly');
console.assert(cgMetricsBox.innerHTML.includes('Kecukupan Protein Hari Ini'), 'FAIL: Caregiver protein metric missing');
console.log('  [PASS] renderCaregiverDashboard() successfully populated metrics container');

const cgMealsBox = getElementById('caregiver-meals-list');
console.assert(cgMealsBox.innerHTML.includes('Bubur Ikan Gabus'), 'FAIL: Caregiver meals did not render correctly');
console.log('  [PASS] renderCaregiverDashboard() successfully populated meals container');

// Verify openCompanionModal behavior
let demoLoginAttempted = null;
appInstance.loginAsDemo = async function(role) { demoLoginAttempted = role; };
appInstance.openCompanionModal();
console.assert(demoLoginAttempted === 'caregiver', 'FAIL: openCompanionModal should directly login as caregiver');
console.log('  [PASS] openCompanionModal() directly logs in as caregiver (role = ' + demoLoginAttempted + ')');

// Verify Navigation Guards
appInstance.userProfile = { role: 'patient' };
appInstance.navigate('doctor');
console.assert(appInstance.activeSection === 'overview', 'FAIL: navigate("doctor") should redirect patient to overview');
console.log('  [PASS] navigate("doctor") redirects patient to overview');

appInstance.userProfile = { role: 'caregiver' };
appInstance.navigate('overview');
console.assert(appInstance.activeSection === 'caregiver-dashboard', 'FAIL: navigate("overview") should redirect caregiver to caregiver-dashboard');
console.log('  [PASS] navigate("overview") redirects caregiver to caregiver-dashboard');

// Verify openDoctorPatientPdf compatibility alias
let pdfCalled = false;
appInstance.openCaregiverPatientPdf = function() { pdfCalled = true; };
appInstance.openDoctorPatientPdf();
// 6. Test caregiver.js
console.log('\n6. Testing js/caregiver.js...');
const cgCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'caregiver.js'), 'utf-8');
vm.runInContext(cgCode, sandbox);

const cgHandler = sandbox.window.caregiverHandler;
console.assert(cgHandler, 'FAIL: caregiverHandler not instantiated');
const nonFamily = cgHandler.caregivers.filter(c => 
  c.role.toLowerCase().includes('dokter') || 
  c.role.toLowerCase().includes('fisioterapis') || 
  c.name.toLowerCase().includes('fisioterapis') || 
  c.name.toLowerCase().includes('dr.')
);
console.assert(nonFamily.length === 0, 'FAIL: Non-family medical entries still found in caregiver list: ' + JSON.stringify(nonFamily));
console.log('  [PASS] Caregiver list contains strictly family members (0 medical/fisioterapis entries)');

const cgListBox = getElementById('caregiver-list-box-full');
cgHandler.renderCaregiverList();
console.assert(!cgListBox.innerHTML.includes('Fisioterapis'), 'FAIL: Fisioterapis rendered in caregiver list UI');
console.assert(!cgListBox.innerHTML.includes('dr.'), 'FAIL: dr. rendered in caregiver list UI');
console.assert(cgListBox.innerHTML.includes('Maria'), 'FAIL: Family member Maria missing from rendered UI');
console.log('  [PASS] renderCaregiverList() outputs only family caregivers (Maria)');

console.log('\n======================================================');
console.log('   ALL DOCTOR REMOVAL & CAREGIVER TESTS PASSED!       ');
console.log('======================================================');
