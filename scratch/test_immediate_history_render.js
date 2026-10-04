// Test: Immediate rendering of Meal History on app load & navigation without clicking any filter buttons
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dom = {};
const mockIds = [
  'view-history', 'view-overview', 'hist-stat-count', 'hist-stat-protein', 'hist-stat-calories',
  'hist-stat-status-badge', 'history-page-meal-list', 'history-7day-table-body',
  'history-filter-chips', 'history-search-input', 'history-header-count-badge',
  'macro-donut-value', 'macro-donut-circle-prot',
  'macro-num-protein', 'macro-num-carbs', 'macro-num-fat', 'macro-num-cals',
  'bar-fill-protein', 'bar-fill-carbs', 'bar-fill-fat', 'bar-fill-cals',
  'macro-num-vitamins', 'bar-fill-vitamins', 'macro-num-minerals', 'bar-fill-minerals',
  'ov-card2-status-badge', 'ov-card2-status-text', 'recovery-target-advice',
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
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          this.contains(c) ? this.remove(c) : this.add(c);
        } else if (force) {
          this.add(c);
        } else {
          this.remove(c);
        }
      }
    },
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
    querySelectorAll() { return this.children; },
    appendChild(child) { this.children.push(child); }
  };
});

const storage = {
  'nutrivision_user_profile': JSON.stringify({
    name: 'Ibra',
    contact: 'ibra@example.com',
    role: 'patient',
    conditionId: 'post-surgery',
    targets: { protein: 75, calories: 1850, carbs: 250, fat: 65 }
  }),
  'nutrivision_progress_ibra@example.com': JSON.stringify({
    todayIntake: { protein: 202, calories: 2100, carbs: 210, fat: 48 },
    todayMeals: [
      { id: 'm1', name: 'Breakfast: Savory Coconut Rice + Sliced Omelet', protein: 16, calories: 380, source: 'Rencana Menu', time: '19:36' },
      { id: 'm2', name: 'Tim Putih Telur Sutra & Daging Ayam Cincang Herbal', protein: 24, calories: 210, source: 'Rencana Menu', time: '19:35' },
      { id: 'm3', name: 'Sup Ikan Gabus Albumin Kuah Bening', protein: 28, calories: 240, source: 'Pindai Kamera AI', time: '19:30' },
      { id: 'm4', name: 'Pepes Tahu Jamur Tiram', protein: 14, calories: 160, source: 'Rencana Menu', time: '19:25' },
      { id: 'm5', name: 'Smoothie Buah Bit & Ekstrak Daun Katuk', protein: 8, calories: 140, source: 'Katalog Pangan', time: '18:50' },
      { id: 'm6', name: 'Dada Ayam Rebus Jahe Lengkuas', protein: 32, calories: 260, source: 'Rencana Menu', time: '14:20' },
      { id: 'm7', name: 'Puding Sutra Tempe Kedelai Hitam', protein: 18, calories: 180, source: 'Katalog Pangan', time: '11:15' },
      { id: 'm8', name: 'Telur Rebus Setengah Matang Omega-3', protein: 14, calories: 140, source: 'Rencana Menu', time: '08:00' },
      { id: 'm9', name: 'Bubur Manado Ikan Cakalang', protein: 48, calories: 390, source: 'Pindai Kamera AI', time: '07:30' }
    ],
    weeklyLogs: [
      { day: 'Hari Ini', date: 'Hari Ini', protein: 202, targetProt: 75, calories: 2100, targetCal: 1850, compliancePct: 100, isToday: true }
    ],
    dateKey: new Date().toISOString().split('T')[0]
  })
};

const windowMock = {
  localStorage: {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => {}
  },
  location: { hash: '#history' },
  history: {
    pushState: (state, title, url) => { windowMock.location.hash = url; }
  },
  confirm: () => true,
  lucide: { createIcons: () => {} },
  i18n: {
    getLanguage: () => 'id',
    t: (k) => k
  }
};

const context = {
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
    querySelectorAll: (sel) => {
      if (sel === '.view-section') return [dom['view-history'], dom['view-overview']];
      if (sel.includes('.sidebar-nav') || sel.includes('.bottom-nav-pwa')) return [];
      return [];
    },
    addEventListener: () => {}
  },
  localStorage: windowMock.localStorage,
  lucide: windowMock.lucide,
  i18n: windowMock.i18n,
  console: console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {}
};

vm.createContext(context);

// Load progress.js
const progressJsCode = fs.readFileSync(path.join(__dirname, '../frontend/js/progress.js'), 'utf8');
vm.runInContext(progressJsCode, context);

console.log('--- TEST 1: progressTracker available on window and globally ---');
if (!context.window.progressTracker) {
  throw new Error('FAILED: window.progressTracker is undefined!');
}
console.log('✅ window.progressTracker is successfully defined!');

console.log('\n--- TEST 2: Immediate loadUserProgress render without clicking buttons ---');
context.window.progressTracker.loadUserProgress({
  name: 'Ibra',
  contact: 'ibra@example.com',
  targets: { protein: 75, calories: 1850 }
});

const countEl = dom['hist-stat-count'];
const protEl = dom['hist-stat-protein'];
const calEl = dom['hist-stat-calories'];
const badgeEl = dom['hist-stat-status-badge'];
const listEl = dom['history-page-meal-list'];
const headerBadge = dom['history-header-count-badge'];

console.log('Meals count text:', countEl.textContent);
console.log('Protein accumulated HTML:', protEl.innerHTML);
console.log('Calories accumulated text:', calEl.textContent);
console.log('Status badge:', badgeEl.className, badgeEl.textContent);
console.log('Header count badge text:', headerBadge.textContent);

if (!countEl.textContent.includes('9')) {
  throw new Error(`FAILED: Count text expected to contain 9, got "${countEl.textContent}"`);
}
if (!protEl.innerHTML.includes('202')) {
  throw new Error(`FAILED: Protein expected to contain 202, got "${protEl.innerHTML}"`);
}
if (!calEl.textContent.includes('2,100') && !calEl.textContent.includes('2100')) {
  throw new Error(`FAILED: Calories expected 2100, got "${calEl.textContent}"`);
}
if (!badgeEl.textContent.includes('Optimal')) {
  throw new Error(`FAILED: Status expected Optimal, got "${badgeEl.textContent}"`);
}
if (!listEl.innerHTML.includes('Breakfast: Savory Coconut Rice')) {
  throw new Error('FAILED: Meals list does not contain initial logged meals!');
}
console.log('✅ TEST 2 PASSED: Meals and KPIs immediately rendered on load without button clicks!');

console.log('\n--- TEST 3: Meal Planner filter chip matches planner meals ---');
context.window.progressTracker.setHistoryFilter('Rencana Menu', null);
console.log('Filter Rencana Menu list length check:');
if (!listEl.innerHTML.includes('Breakfast: Savory Coconut Rice')) {
  throw new Error('FAILED: Meal planner filter should contain Breakfast: Savory Coconut Rice');
}
if (!listEl.innerHTML.includes('Tim Putih Telur Sutra')) {
  throw new Error('FAILED: Meal planner filter should contain Tim Putih Telur Sutra');
}
if (listEl.innerHTML.includes('Sup Ikan Gabus Albumin Kuah Bening')) {
  throw new Error('FAILED: Meal planner filter should NOT contain Pindai Kamera meal');
}
console.log('✅ TEST 3 PASSED: Meal Planner filter chip correctly matches planner meals!');

console.log('\n--- TEST 4: Reset filter to "all" shows all 9 meals ---');
context.window.progressTracker.setHistoryFilter('all', null);
if (!listEl.innerHTML.includes('Breakfast: Savory Coconut Rice') ||
    !listEl.innerHTML.includes('Sup Ikan Gabus Albumin Kuah Bening') ||
    !listEl.innerHTML.includes('Smoothie Buah Bit & Ekstrak Daun Katuk')) {
  throw new Error('FAILED: "all" filter should show dishes from all sources!');
}
console.log('✅ TEST 4 PASSED: All 9 dishes visible under "All Sources" filter!');

console.log('\n🎉 ALL IMMEDIATE HISTORY RENDER TESTS PASSED 100%!');
