const fs = require('fs');
const vm = require('vm');

// Mock browser environment
const dom = {};
const mockElements = [
  'macro-donut-value', 'macro-donut-circle-prot',
  'macro-num-protein', 'macro-num-carbs', 'macro-num-fat', 'macro-num-cals',
  'bar-fill-protein', 'bar-fill-carbs', 'bar-fill-fat', 'bar-fill-cals',
  'macro-num-vitamins', 'bar-fill-vitamins', 'macro-num-minerals', 'bar-fill-minerals',
  'ov-card2-status-badge', 'ov-card2-status-text', 'recovery-target-advice',
  'today-meal-history-container', 'today-meal-items-list', 'today-meal-total-badge', 'history-header-count-badge',
  'weekly-bar-chart-box', 'weekly-bar-chart-box-full',
  'ov-card3-streak-badge', 'ov-card3-streak-text', 'ov-weekly-avg-text'
];

mockElements.forEach(id => {
  dom[id] = {
    id,
    textContent: '',
    innerHTML: '',
    className: '',
    style: {},
    scrollIntoView: () => {}
  };
});

const localStorageStore = {};
const windowMock = {
  document: {
    getElementById: (id) => dom[id] || null,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  localStorage: {
    getItem: (k) => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: (k) => { delete localStorageStore[k]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
  },
  lucide: {
    createIcons: () => {}
  },
  i18n: {
    getLanguage: () => 'id'
  },
  confirm: () => true
};

Object.assign(global, {
  window: windowMock,
  document: windowMock.document,
  localStorage: windowMock.localStorage,
  lucide: windowMock.lucide,
  i18n: windowMock.i18n,
  app: {
    userProfile: {
      name: 'Budi Santoso',
      contact: '081234567890',
      targets: { protein: 75, calories: 1850 }
    },
    showToast: (msg) => { console.log('Toast:', msg); },
    navigate: (sec) => { console.log('Navigate to:', sec); }
  },
  confirm: () => true
});

const progressCode = fs.readFileSync('./js/progress.js', 'utf8');
vm.runInThisContext(progressCode);

const tracker = eval('progressTracker');

console.log('=== TEST 1: Initial State ===');
tracker.initUserProgress({ protein: 75, calories: 1850 }, 'test_user');
tracker.renderMacroDonut({ protein: 75, calories: 1850 });
tracker.renderTodayMealHistory();
console.log('Today meals count:', tracker.todayMeals.length);
console.log('Overview has no preview items (clean):', dom['today-meal-items-list'].innerHTML === '');
if (tracker.todayMeals.length !== 0) throw new Error('Expected 0 meals initially');

console.log('\n=== TEST 2: Add Logged Meal ===');
tracker.addLoggedMeal({
  protein: [34, 38],
  calories: [420, 460],
  carbs: [45, 45],
  fat: [10, 10]
}, 'test_user', {
  name: 'Dada Ayam Panggang Herbal + Brokoli Kukus',
  source: 'Rencana Menu'
});

console.log('Protein today:', tracker.todayIntake.protein);
console.log('Calories today:', tracker.todayIntake.calories);
console.log('Today meals count:', tracker.todayMeals.length);
console.log('Meal name:', tracker.todayMeals[0].name);
console.log('Meal protein:', tracker.todayMeals[0].protein);
console.log('Header badge count:', dom['history-header-count-badge'].textContent);

if (tracker.todayMeals.length !== 1) throw new Error('Expected 1 meal');
if (String(dom['history-header-count-badge'].textContent) !== '1') throw new Error('Expected header count badge to be 1');

console.log('\n=== TEST 3: Add Second Meal ===');
tracker.addLoggedMeal({
  protein: [28, 32],
  calories: [380, 410],
  carbs: [40, 40],
  fat: [8, 8]
}, 'test_user', {
  name: 'Fillet Ikan Gabus Kukus',
  source: 'Pindai AI'
});

console.log('Protein today after 2 meals:', tracker.todayIntake.protein);
console.log('Today meals count:', tracker.todayMeals.length);
if (tracker.todayMeals.length !== 2) throw new Error('Expected 2 meals');

console.log('\n=== TEST 4: Remove Meal ===');
const mealToRemove = tracker.todayMeals[0]; // Ikan Gabus
const initialProtein = tracker.todayIntake.protein;
tracker.removeLoggedMeal(mealToRemove.id);
console.log('Protein after removal:', tracker.todayIntake.protein);
console.log('Expected protein reduction:', initialProtein - mealToRemove.protein);
if (tracker.todayMeals.length !== 1) throw new Error('Expected 1 meal after deletion');
if (tracker.todayIntake.protein !== initialProtein - mealToRemove.protein) throw new Error('Protein not deducted properly');

console.log('\n=== TEST 5: Persistence & Restoration ===');
tracker.saveUserProgress('test_user');
const newTracker = new NutriVisionProgress();
newTracker.loadUserProgress(global.app.userProfile);
console.log('Restored meals count:', newTracker.todayMeals.length);
console.log('Restored meal name:', newTracker.todayMeals[0].name);
if (newTracker.todayMeals.length !== 1) throw new Error('Failed to restore meals');

console.log('\n>>> ALL HISTORY TRACK TESTS PASSED PERFECTLY! 🌟');
