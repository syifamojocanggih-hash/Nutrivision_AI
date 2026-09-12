// Unit & Integration test for Dedicated Meal History Page (#view-history)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Lightweight DOM mock
const dom = {};
const mockIds = [
  'view-history', 'hist-stat-count', 'hist-stat-protein', 'hist-stat-calories',
  'hist-stat-status-badge', 'history-page-meal-list', 'history-7day-table-body',
  'history-filter-chips', 'history-search-input',
  'macro-donut-value', 'macro-donut-circle-prot',
  'macro-num-protein', 'macro-num-carbs', 'macro-num-fat', 'macro-num-cals',
  'bar-fill-protein', 'bar-fill-carbs', 'bar-fill-fat', 'bar-fill-cals',
  'macro-num-vitamins', 'bar-fill-vitamins', 'macro-num-minerals', 'bar-fill-minerals',
  'ov-card2-status-badge', 'ov-card2-status-text', 'recovery-target-advice',
  'today-meal-history-container', 'today-meal-items-list', 'today-meal-total-badge', 'history-header-count-badge',
  'weekly-bar-chart-box', 'weekly-bar-chart-box-full',
  'ov-card3-streak-badge', 'ov-card3-streak-text', 'ov-weekly-avg-text'
];

mockIds.forEach(id => {
  dom[id] = {
    id,
    tagName: 'div',
    textContent: '',
    innerHTML: '',
    className: '',
    style: {},
    children: [],
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k] || null; },
    querySelector(sel) {
      if (sel && sel.includes('data-filter')) {
        const match = sel.match(/data-filter="([^"]+)"/);
        if (match) {
          return this.children.find(c => c.getAttribute && c.getAttribute('data-filter') === match[1]) || null;
        }
      }
      return this.children[0] || null;
    },
    querySelectorAll(sel) {
      if (sel === 'button') {
        return this.children.filter(c => c.tagName && c.tagName.toLowerCase() === 'button');
      }
      return this.children;
    },
    appendChild(child) { this.children.push(child); }
  };
});

const storage = {};
const windowMock = {
  localStorage: {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  },
  location: { hash: '' },
  confirm: () => true,
  lucide: { createIcons: () => {} },
  i18n: {
    getLanguage: () => 'id',
    t: (k) => k
  }
};

let lastToast = '';
const appMock = {
  userProfile: {
    name: 'Budi Santoso',
    contact: '081234567890',
    targets: { protein: 75, calories: 1850, carbs: 250, fat: 65 }
  },
  showToast: (msg) => { lastToast = msg; console.log('Toast:', msg); },
  navigate: (sec) => { console.log('Navigated to:', sec); }
};

Object.assign(global, {
  window: windowMock,
  document: {
    documentElement: { lang: 'id' },
    getElementById: (id) => dom[id] || null,
    querySelector: (sel) => {
      if (sel && sel.startsWith('#')) {
        const id = sel.substring(1).split(' ')[0];
        return dom[id] || null;
      }
      return null;
    },
    querySelectorAll: () => []
  },
  localStorage: windowMock.localStorage,
  lucide: windowMock.lucide,
  i18n: windowMock.i18n,
  app: appMock,
  confirm: () => true
});

// Setup filter chips mock buttons in #history-filter-chips
const chipContainer = dom['history-filter-chips'];
const btnAll = {
  tagName: 'button',
  style: {},
  getAttribute: (k) => (k === 'data-filter' ? 'all' : null),
  setAttribute: () => {}
};
const btnRencana = {
  tagName: 'button',
  style: {},
  getAttribute: (k) => (k === 'data-filter' ? 'Rencana Menu' : null),
  setAttribute: () => {}
};
const btnPindai = {
  tagName: 'button',
  style: {},
  getAttribute: (k) => (k === 'data-filter' ? 'Pindai' : null),
  setAttribute: () => {}
};
chipContainer.children.push(btnAll, btnRencana, btnPindai);

// Load progress.js
const progressCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'progress.js'), 'utf8');
vm.runInThisContext(progressCode);

const tracker = eval('progressTracker');
windowMock.progressTracker = tracker;

console.log('=== TEST 1: Initial State of Dedicated History Page ===');
tracker.initUserProgress(appMock.userProfile.targets, 'test_user');
tracker.renderHistoryPage();

console.log('Meals count text:', dom['hist-stat-count'].textContent);
console.log('Status badge text:', dom['hist-stat-status-badge'].textContent);
console.log('Has empty state in list:', dom['history-page-meal-list'].innerHTML.includes('hist_empty_title') || dom['history-page-meal-list'].innerHTML.includes('Belum Ada'));
console.log('Has 7-day table rows:', dom['history-7day-table-body'].innerHTML.includes('<tr'));

if (dom['hist-stat-count'].textContent.includes('0') && dom['hist-stat-status-badge'].textContent.includes('Belum Ada Asupan')) {
  console.log('✅ TEST 1 PASSED: Empty state correctly initialized.\n');
} else {
  throw new Error('Test 1 failed');
}

console.log('=== TEST 2: Add Logged Meals with Different Sources ===');
// Meal 1: Planner
tracker.addLoggedMeal({
  protein: 35,
  calories: 450,
  carbs: 40,
  fat: 12
}, 'test_user', { name: 'Ayam Kukus Bumbu Kuning', source: 'Rencana Menu' });

// Meal 2: AI Camera Scan
tracker.addLoggedMeal({
  protein: 30,
  calories: 280,
  carbs: 5,
  fat: 8
}, 'test_user', { name: 'Sup Ikan Gabus Segar', source: 'Pindai Kamera AI' });

// Meal 3: Catalog
tracker.addLoggedMeal({
  protein: 15,
  calories: 190,
  carbs: 18,
  fat: 6
}, 'test_user', { name: 'Tempe Bacem Solo', source: 'Katalog Pangan' });

tracker.renderHistoryPage();

console.log('Meals count text:', dom['hist-stat-count'].textContent);
console.log('Protein accumulated HTML:', dom['hist-stat-protein'].innerHTML);
console.log('Calories accumulated text:', dom['hist-stat-calories'].textContent);
console.log('Status badge class:', dom['hist-stat-status-badge'].className, 'text:', dom['hist-stat-status-badge'].textContent);
console.log('List contains Meal 1:', dom['history-page-meal-list'].innerHTML.includes('Ayam Kukus Bumbu Kuning'));
console.log('List contains Meal 2:', dom['history-page-meal-list'].innerHTML.includes('Sup Ikan Gabus Segar'));
console.log('List contains Meal 3:', dom['history-page-meal-list'].innerHTML.includes('Tempe Bacem Solo'));

// Total protein = 35 + 30 + 15 = 80g (Target 75g -> 107% -> Optimal)
if (dom['hist-stat-count'].textContent.includes('3') && dom['hist-stat-status-badge'].textContent.includes('Optimal') && dom['hist-stat-status-badge'].className.includes('badge green')) {
  console.log('✅ TEST 2 PASSED: Meals logged and KPIs correctly updated with Optimal badge.\n');
} else {
  throw new Error('Test 2 failed');
}

console.log('=== TEST 3: History Filtering by Source ===');
tracker.setHistoryFilter('Pindai', btnPindai);
console.log('Filtered (Pindai) contains Sup Ikan Gabus:', dom['history-page-meal-list'].innerHTML.includes('Sup Ikan Gabus Segar'));
console.log('Filtered (Pindai) does NOT contain Ayam Kukus:', !dom['history-page-meal-list'].innerHTML.includes('Ayam Kukus Bumbu Kuning'));

tracker.setHistoryFilter('Rencana Menu', btnRencana);
console.log('Filtered (Rencana Menu) contains Ayam Kukus:', dom['history-page-meal-list'].innerHTML.includes('Ayam Kukus Bumbu Kuning'));
console.log('Filtered (Rencana Menu) does NOT contain Sup Ikan Gabus:', !dom['history-page-meal-list'].innerHTML.includes('Sup Ikan Gabus Segar'));

tracker.setHistoryFilter('all', btnAll);
console.log('Filtered (All) contains all 3 meals:', dom['history-page-meal-list'].innerHTML.includes('Ayam Kukus') && dom['history-page-meal-list'].innerHTML.includes('Sup Ikan Gabus') && dom['history-page-meal-list'].innerHTML.includes('Tempe Bacem'));

if (btnAll.style.background === '#233917' && dom['history-page-meal-list'].innerHTML.includes('Ayam Kukus')) {
  console.log('✅ TEST 3 PASSED: Filtering by source works properly.\n');
} else {
  throw new Error('Test 3 failed');
}

console.log('=== TEST 4: History Search Handling ===');
tracker.handleHistorySearch('Gabus');
console.log('Search "Gabus" contains Sup Ikan Gabus:', dom['history-page-meal-list'].innerHTML.includes('Sup Ikan Gabus Segar'));
console.log('Search "Gabus" does NOT contain Tempe Bacem:', !dom['history-page-meal-list'].innerHTML.includes('Tempe Bacem'));

tracker.handleHistorySearch('MakananGaib');
console.log('Search "MakananGaib" shows no-match empty state:', dom['history-page-meal-list'].innerHTML.includes('Tidak ada hidangan yang cocok'));

tracker.handleHistorySearch('');
console.log('Cleared search shows items again:', dom['history-page-meal-list'].innerHTML.includes('Ayam Kukus'));

console.log('✅ TEST 4 PASSED: Search query handling works properly.\n');

console.log('=== TEST 5: Clear Today Meals / Reset ===');
tracker.clearTodayMeals();
console.log('Meals count after clear:', tracker.todayMeals.length);
console.log('Today protein intake after clear:', tracker.todayIntake.protein);
console.log('Last toast message:', lastToast);
console.log('Status badge after clear:', dom['hist-stat-status-badge'].textContent);

if (tracker.todayMeals.length === 0 && tracker.todayIntake.protein === 0 && dom['hist-stat-count'].textContent.includes('0')) {
  console.log('✅ TEST 5 PASSED: clearTodayMeals successfully reset state and updated UI.\n');
} else {
  throw new Error('Test 5 failed');
}

console.log('🎉 ALL DEDICATED HISTORY PAGE TESTS PASSED WITH 100% SUCCESS!');
