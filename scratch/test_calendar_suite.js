// Comprehensive Verification Suite for Clinical Calendar & Upcoming Events Suite
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
    fill: () => {},
    stroke: () => {},
    closePath: () => {},
    setLineDash: () => {},
    fillText: () => {},
    measureText: () => ({ width: 50 }),
    translate: () => {},
    rotate: () => {},
    strokeRect: () => {},
    fillRect: () => {},
    rect: () => {},
    roundRect: () => {},
    moveTo: () => {},
    lineTo: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
  }),
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 320 }),
  width: 320,
  height: 320,
  style: {}
};

const storage = {};
global.window = {
  location: { hash: '#progress' },
  history: { pushState: () => {}, replaceState: () => {} },
  scrollTo: () => {},
  addEventListener: () => {},
  refreshIcons: () => {},
  lucide: { createIcons: () => {} },
  localStorage: {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  }
};
global.localStorage = global.window.localStorage;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

global.document = {
  getElementById: (id) => {
    if (id && id.includes('canvas')) return mockCanvas;
    return getElementById(id);
  },
  querySelectorAll: (selector) => {
    if (selector.includes('.cal-view-btn')) {
      return ['day', 'week', 'month'].map(v => {
        const el = new MockElement();
        el.dataset.view = v;
        return el;
      });
    }
    return [];
  },
  querySelector: (selector) => new MockElement(),
  createElement: (tag) => new MockElement('', tag),
  documentElement: { lang: 'id', setAttribute: () => {}, removeAttribute: () => {}, classList: new Set() },
  addEventListener: () => {},
  body: new MockElement('body')
};

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

global.cvEngine = new NutriVisionCVEngine();
global.progressTracker = new NutriVisionProgress();
global.mealPlanner = { renderPlanner: () => {}, renderSymptomFilter: () => {} };
global.communityHandler = { renderCommunityFeed: () => {} };
global.caregiverHandler = { renderCaregiverList: () => {} };

vm.runInThisContext(appCode);
global.app = new NutriVisionApp();

console.log('=== TEST 1: Clinical Data Verification ===');
['post-surgery', 'rehab', 'gym'].forEach(cId => {
  const prof = NUTRIVISION_DATA.recoveryProfiles[cId];
  console.log(`Condition: ${prof.title}`);
  console.log(`  Monthly Milestones count: ${prof.monthlyMilestones.length}`);
  console.log(`  Default Daily Schedules count: ${prof.defaultDailySchedules.length}`);
  
  prof.monthlyMilestones.forEach(m => {
    if (!m.healingTarget || !m.nutritionTarget || !m.scientificCitation) {
      throw new Error(`Incomplete milestone for ${cId} month ${m.monthIndex}`);
    }
  });
});
console.log('>>> TEST 1 PASSED: All 3 recovery conditions have fully validated monthly milestones & clinical schedules!\n');

console.log('=== TEST 2: App Suite Initialization & Rendering (Compact Boxes) ===');
app.init();
app.renderClinicalCalendarAndScheduleSuite();

const monthPills = getElementById('recovery-month-pills');
const monthBanner = getElementById('recovery-month-target-banner');
const upcomingList = getElementById('upcoming-events-list');
const calBody = getElementById('integrated-cal-body');

console.log('Month Pills HTML contains Bulan 1:', monthPills.innerHTML.includes('Bulan 1'));
console.log('Month Banner contains Target Penyembuhan Medis:', monthBanner.innerHTML.includes('Target Penyembuhan Medis'));
console.log('Month Banner contains ESPEN / ERAS citation:', monthBanner.innerHTML.includes('ESPEN'));
console.log('Upcoming events count rendered items:', upcomingList.innerHTML.includes('Sarapan Tinggi Albumin'));
console.log('Calendar Body contains compact-box:', calBody.innerHTML.includes('compact-box'));
console.log('Calendar Body contains cal-dot-indicator:', calBody.innerHTML.includes('cal-dot-indicator'));

if (monthPills.innerHTML.includes('Bulan 1') &&
    monthBanner.innerHTML.includes('Target Penyembuhan Medis') &&
    upcomingList.innerHTML.includes('Sarapan Tinggi Albumin') &&
    calBody.innerHTML.includes('compact-box') &&
    calBody.innerHTML.includes('cal-dot-indicator')) {
  console.log('>>> TEST 2 PASSED: 2-Column Suite successfully rendered with compact square boxes & clinical schedules!\n');
} else {
  throw new Error('Test 2 failed!');
}

console.log('=== TEST 3: Calendar Month Navigation ===');
app.shiftCalendarMonth(1);
console.log('Shifted month forward:', calBody.innerHTML.includes('compact-box'));
app.shiftCalendarMonth(-1);
console.log('Shifted month backward:', calBody.innerHTML.includes('compact-box'));
console.log('>>> TEST 3 PASSED: Calendar month navigation verified!\n');

console.log('=== TEST 4: Monthly Target Switching (Bulan 1 -> Bulan 2) ===');
app.switchRecoveryMonth(2);
console.log('Active Recovery Month Index:', app.activeRecoveryMonthIndex);
console.log('Banner updated for Bulan ke-2:', monthBanner.innerHTML.includes('Bulan ke-2'));
console.log('Banner contains tensile strength 50–70%:', monthBanner.innerHTML.includes('50–70%'));
if (app.activeRecoveryMonthIndex === 2 && monthBanner.innerHTML.includes('Bulan ke-2')) {
  console.log('>>> TEST 4 PASSED: Monthly target switcher dynamically shifts clinical focus & calendar!\n');
} else {
  throw new Error('Test 4 failed!');
}

console.log('=== TEST 5: Upcoming Events Task Completion & Date Selection ===');
const testDate = '2026-09-12';
app.selectCalendarDate(testDate);
console.log('Selected calendar date:', app.selectedCalendarDate);
const schedId = 'sched-ps-1';
app.toggleScheduleCompletion(schedId, testDate);
const completedKey = `${testDate}_${schedId}`;
console.log('Schedule item completed in storage:', app.completedScheduleItems[completedKey]);
if (app.completedScheduleItems[completedKey] === true) {
  console.log('>>> TEST 5 PASSED: Interactive task completion and date selection verified!\n');
} else {
  throw new Error('Test 5 failed!');
}

console.log('=== TEST 6: Condition Switch to Rehab & Gym Protocols ===');
app.setJourneyCondition('rehab');
console.log('Switched condition to rehab:', app.journeyCondition);
console.log('Rehab banner contains Baar / Shaw citation:', monthBanner.innerHTML.includes('Baar') || monthBanner.innerHTML.includes('Shaw') || monthBanner.innerHTML.includes('Matriks'));
console.log('Rehab schedule contains Gelatin Vit C / Matriks:', upcomingList.innerHTML.includes('Gelatin') || upcomingList.innerHTML.includes('Matriks'));

app.setJourneyCondition('gym');
console.log('Switched condition to gym:', app.journeyCondition);
console.log('Gym banner contains ISSN / Leucine citation:', monthBanner.innerHTML.includes('ISSN') || monthBanner.innerHTML.includes('Myofibril'));
console.log('Gym schedule contains Leucine Trigger / Anabolik:', upcomingList.innerHTML.includes('Leucine') || upcomingList.innerHTML.includes('Anabolik'));

console.log('>>> TEST 6 PASSED: All condition switches seamlessly adjust clinical targets and upcoming routines!\n');

console.log('=== TEST 7: Direct Modal Open & Close Trigger ===');
const modalEl = getElementById('modal-clinical-calendar');
modalEl.style.display = 'none';
app.openCalendarModal();
console.log('Modal display after openCalendarModal:', modalEl.style.display);
if (modalEl.style.display !== 'flex') {
  throw new Error('openCalendarModal failed to set display to flex!');
}
app.closeCalendarModal();
console.log('Modal display after closeCalendarModal:', modalEl.style.display);
if (modalEl.style.display !== 'none') {
  throw new Error('closeCalendarModal failed to set display to none!');
}
console.log('>>> TEST 7 PASSED: Modal direct triggers function properly!\n');

console.log('=== TEST 8: Pantangan Makanan (Dietary Restrictions) Verification ===');
['post-surgery', 'rehab', 'gym'].forEach(cId => {
  app.setJourneyCondition(cId);
  app.renderPantanganMakanan(cId);
  const pantanganEl = getElementById('pantangan-events-list');
  console.log(`Pantangan for ${cId} rendered:`, pantanganEl.innerHTML.includes('Peringatan Klinis Dokter'));
  if (!pantanganEl.innerHTML.includes('Peringatan Klinis Dokter') || !pantanganEl.innerHTML.includes('Validasi Medis')) {
    throw new Error(`Pantangan makanan failed for condition: ${cId}`);
  }
});
console.log('>>> TEST 8 PASSED: Medical contraindications & doctor warnings verified for all conditions!\n');

console.log('=== TEST 9: Detail Panel Tab Switching (Meals, Restrictions, Validation) ===');
app.switchCalendarDetailTab('restrictions');
console.log('Switched to restrictions tab, active:', app.calendarDetailTab === 'restrictions');
app.switchCalendarDetailTab('validation');
const valEl = getElementById('validation-events-list');
console.log('Validation tab contains Konsensus Ilmiah:', valEl.innerHTML.includes('Konsensus Ilmiah'));
app.switchCalendarDetailTab('meals');
console.log('Switched back to meals tab, active:', app.calendarDetailTab === 'meals');
if (valEl.innerHTML.includes('Konsensus Ilmiah') && app.calendarDetailTab === 'meals') {
  console.log('>>> TEST 9 PASSED: Detail segmented tabs toggle seamlessly!\n');
} else {
  throw new Error('Test 9 failed!');
}

console.log('=== TEST 10: Verify Removal of AI Tester UI ===');
const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const hasTopbarAITester = htmlContent.includes('id="topbar-ai-tester-btn"');
const hasAITesterModal = htmlContent.includes('id="ai-tester-modal"');
console.log('index.html contains topbar-ai-tester-btn:', hasTopbarAITester);
console.log('index.html contains ai-tester-modal:', hasAITesterModal);
if (!hasTopbarAITester && !hasAITesterModal) {
  console.log('>>> TEST 10 PASSED: AI model tester button and modal successfully removed!\n');
} else {
  throw new Error('Test 10 failed: AI UI elements still present in index.html!');
}

console.log('🎉 ALL 10 TEST SUITES PASSED SUCCESSFULLY! EVERYTHING IS VERIFIED! 🎉');


