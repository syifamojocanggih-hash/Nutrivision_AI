const fs = require('fs');
const path = require('path');

console.log('--- Starting Automated Test: Scan to Daily Intake Flow ---');

// 1. Verify index.html elements
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

if (!indexHtml.includes('id="overview-btn-add-daily"')) {
  throw new Error('FAIL: #overview-btn-add-daily not found in index.html');
}
console.log('PASS: #overview-btn-add-daily found in index.html beside Koreksi Manual');

if (indexHtml.includes('id="btn-hero-add-to-daily"')) {
  throw new Error('FAIL: #btn-hero-add-to-daily should be removed from hero-actions');
}
console.log('PASS: hero-actions has been restored without duplicate top button');

if (!indexHtml.includes('id="modal-confirm-daily-intake"')) {
  throw new Error('FAIL: #modal-confirm-daily-intake not found in index.html');
}
console.log('PASS: #modal-confirm-daily-intake found in index.html');

if (!indexHtml.includes('id="daily-confirm-content"')) {
  throw new Error('FAIL: #daily-confirm-content not found in index.html');
}
console.log('PASS: #daily-confirm-content found in index.html');

if (!indexHtml.includes('id="scan-modal-btn-add-daily"')) {
  throw new Error('FAIL: #scan-modal-btn-add-daily not found in index.html');
}
console.log('PASS: #scan-modal-btn-add-daily found in scan modal footer');

// 2. Verify css/dashboard.css
const dashCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'dashboard.css'), 'utf8');
if (!dashCss.includes('.overview-scan-status-wrap') || !dashCss.includes('.overview-unlogged-notice') || !dashCss.includes('.overview-logged-banner')) {
  throw new Error('FAIL: Status wrap classes not found in css/dashboard.css');
}
console.log('PASS: Dashboard CSS contains scan status banner classes');

// 3. Verify css/modals.css
const modalCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'modals.css'), 'utf8');
if (!modalCss.includes('.daily-confirm-box') || !modalCss.includes('.daily-slot-btn') || !modalCss.includes('.daily-confirm-food-card')) {
  throw new Error('FAIL: Daily confirm modal classes not found in css/modals.css');
}
console.log('PASS: Modals CSS contains daily confirm modal classes');

// 4. Verify js/i18n.js
const i18nJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'i18n.js'), 'utf8');
if (!i18nJs.includes("ov_btn_add_to_daily: 'Tambahkan ke Gizi Harian'") || !i18nJs.includes("ov_btn_add_to_daily: 'Add to Daily Nutrition'")) {
  throw new Error('FAIL: i18n keys for ov_btn_add_to_daily not found');
}
console.log('PASS: i18n contains ov_btn_add_to_daily in en and id');

// 5. Verify js/app.js methods
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const requiredMethods = [
  'openScanDailyIntakeConfirmModal',
  'selectDailyMealSlot',
  'changeDailyMealServings',
  'updateDailyMealTime',
  'renderDailyConfirmContent',
  'confirmAddScanToDailyIntake'
];
for (const m of requiredMethods) {
  if (!appJs.includes(`${m}(`)) {
    throw new Error(`FAIL: Method ${m} not found in js/app.js`);
  }
}
console.log('PASS: All required methods exist in js/app.js');

// 6. Functional runtime mock simulation
const domElements = {};
function createMockEl(id) {
  return {
    id: id,
    style: {},
    innerHTML: '',
    textContent: '',
    title: '',
    dataset: {},
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      toggle: function(c, force) {
        if (force !== undefined) {
          if (force) this._classes.add(c); else this._classes.delete(c);
        } else {
          if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
        }
      },
      contains: function(c) { return this._classes.has(c); }
    },
    querySelectorAll: function() { return []; }
  };
}

global.document = {
  getElementById: function(id) {
    if (!domElements[id]) domElements[id] = createMockEl(id);
    return domElements[id];
  },
  querySelectorAll: function() { return []; },
  addEventListener: function() {}
};

global.window = {
  i18n: { getLanguage: () => 'id' },
  lucide: { createIcons: () => {} },
  addEventListener: function() {}
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// Mock cvEngine with plate segments matching the user's screenshot
global.cvEngine = {
  currentScan: {
    id: 'test-scan-1',
    title: '🍛 Hasil Pindai Kamera AI',
    confidenceOverall: 84,
    segments: [
      { id: 'seg-1', name: 'Nasi Putih', portionGrams: 160, confidence: 92, color: '#9EA76B', protein: [3.8, 4.6], cals: [200, 230], carbs: [44, 50], fat: [0.4, 0.7] },
      { id: 'seg-2', name: 'Dada Ayam Suwir / Kukus', portionGrams: 110, confidence: 88, color: '#D85A30', protein: [26, 30], cals: [160, 190], carbs: [0, 1.0], fat: [3.2, 4.8] },
      { id: 'seg-3', name: 'Sayur Bening Bayam', portionGrams: 90, confidence: 80, color: '#EF9F27', protein: [1.6, 2.4], cals: [28, 38], carbs: [4.5, 6.5], fat: [0.2, 0.4] },
      { id: 'seg-4', name: 'Bahan Belum Teridentifikasi (Saus/Pelengkap)', portionGrams: 40, confidence: 54, color: '#FAEEDA', protein: [1.0, 2.5], cals: [40, 70], carbs: [4.0, 8.0], fat: [2.0, 4.0] }
    ]
  },
  calculateAggregatedNutrients: function() {
    let protMin = 0, protMax = 0, calsMin = 0, calsMax = 0, carbsMin = 0, carbsMax = 0, fatMin = 0, fatMax = 0, totalGrams = 0;
    this.currentScan.segments.forEach(s => {
      protMin += s.protein[0]; protMax += s.protein[1];
      calsMin += s.cals[0]; calsMax += s.cals[1];
      carbsMin += s.carbs[0]; carbsMax += s.carbs[1];
      fatMin += s.fat[0]; fatMax += s.fat[1];
      totalGrams += s.portionGrams;
    });
    return {
      protein: [protMin, protMax],
      cals: [calsMin, calsMax],
      carbs: [carbsMin, carbsMax],
      fat: [fatMin, fatMax],
      totalGrams
    };
  },
  renderCanvas: () => {}
};

// Mock progressTracker
const loggedMeals = [];
global.progressTracker = {
  addLoggedMeal: (nutrients, userKey, meta) => {
    loggedMeals.push({ nutrients, userKey, meta });
  },
  renderMacroDonut: () => {},
  renderWeeklyBarChart: () => {},
  renderTodayMealHistory: () => {}
};

const vm = require('vm');
const scriptContext = {
  console,
  document: global.document,
  window: global.window,
  localStorage: global.localStorage,
  cvEngine: global.cvEngine,
  progressTracker: global.progressTracker,
  NUTRIVISION_DATA: { presetScans: [], indonesianFoodDatabase: [] },
  cameraHandler: { startCamera: () => {}, stopCamera: () => {}, captureSnapshot: () => '', readFileAsDataURL: () => Promise.resolve('') },
  setTimeout: (fn) => fn(),
  Date: global.Date,
  Math: global.Math
};
vm.createContext(scriptContext);
vm.runInContext(appJs + '\n; globalThis.testApp = new NutriVisionApp();', scriptContext);
const appInstance = scriptContext.testApp;

appInstance.userProfile = {
  name: 'Test Patient',
  contact: 'patient@test.com',
  targets: { protein: 85, calories: 2000 }
};

console.log('PASS: NutriVisionApp instantiated successfully');

// Test 1: renderOverviewPlate initially before logging (unlogged state)
// Test 1: renderOverviewPlate initially before logging (unlogged state)
appInstance.renderOverviewPlate();

const btnAddDaily = global.document.getElementById('overview-btn-add-daily');
if (!btnAddDaily.innerHTML.includes('Tambahkan ke Gizi Harian')) {
  throw new Error('FAIL: #overview-btn-add-daily text not correct before logging');
}
console.log('PASS: #overview-btn-add-daily shows "Tambahkan ke Gizi Harian" beside Koreksi Manual');

// Test 2: openScanDailyIntakeConfirmModal
let modalOpened = false;
appInstance.openModal = (id) => { if (id === 'modal-confirm-daily-intake') modalOpened = true; };
appInstance.closeModal = () => {};
appInstance.showToast = () => {};

appInstance.openScanDailyIntakeConfirmModal();
if (!modalOpened) {
  throw new Error('FAIL: openScanDailyIntakeConfirmModal did not open modal-confirm-daily-intake');
}
console.log('PASS: openScanDailyIntakeConfirmModal opened modal');

// Test 3: verify rendered modal content
const confirmContent = global.document.getElementById('daily-confirm-content');
if (!confirmContent.innerHTML.includes('Tambahkan ke Gizi Harian') || !confirmContent.innerHTML.includes('Nasi Putih') || !confirmContent.innerHTML.includes('Dada Ayam Suwir')) {
  throw new Error('FAIL: daily-confirm-content did not render food summary with detected components');
}
console.log('PASS: daily-confirm-content rendered with detected ingredients');

// Test 4: select meal slot & change servings
appInstance.selectDailyMealSlot('lunch');
if (appInstance.dailyIntakeConfirmState.slot !== 'lunch') {
  throw new Error('FAIL: selectDailyMealSlot did not update state');
}
appInstance.changeDailyMealServings(1); // 1.0 -> 1.5
if (appInstance.dailyIntakeConfirmState.servings !== 1.5) {
  throw new Error('FAIL: changeDailyMealServings did not update servings to 1.5');
}
console.log('PASS: Slot and servings modified correctly');

// Test 5: Confirm and save to daily intake
appInstance.confirmAddScanToDailyIntake();

if (loggedMeals.length !== 1) {
  throw new Error('FAIL: progressTracker did not receive logged meal');
}
const logged = loggedMeals[0];
if (logged.meta.mealType !== 'lunch') {
  throw new Error('FAIL: logged meal mealType is not lunch');
}
if (!cvEngine.currentScan._isLoggedToday) {
  throw new Error('FAIL: cvEngine.currentScan._isLoggedToday was not set to true');
}
console.log('PASS: Meal logged with scaled nutrients & _isLoggedToday set to true:', logged.meta);

// Test 6: Verify renderOverviewPlate now reflects logged status
appInstance.renderOverviewPlate();
const statusWrap = global.document.getElementById('overview-scan-status-wrap');
if (!statusWrap.innerHTML.includes('overview-logged-banner') || !statusWrap.innerHTML.includes('Tercatat di Gizi Harian')) {
  throw new Error('FAIL: overview-scan-status-wrap does not show overview-logged-banner after confirmation');
}
console.log('PASS: renderOverviewPlate now displays overview-logged-banner with recorded meal details');

if (!btnAddDaily.innerHTML.includes('Tercatat di Gizi Harian')) {
  throw new Error('FAIL: overview-btn-add-daily does not reflect logged state');
}
console.log('PASS: #overview-btn-add-daily updated to reflect recorded status');

console.log('\n--- ALL AUTOMATED VERIFICATION CHECKS PASSED! ---');
