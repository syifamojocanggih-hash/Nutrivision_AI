const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// Mock DOM
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
  remove() {}
  focus() {}
  scrollIntoView() {}
  querySelector(sel) {
    return new MockElement('inner');
  }
}

const dom = {};
function getElementById(id) {
  if (!dom[id]) {
    dom[id] = new MockElement(id);
  }
  return dom[id];
}

global.window = {
  location: { hash: '#planner' },
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
global.document = {
  body: new MockElement('body'),
  getElementById,
  querySelectorAll: (selector) => [],
  querySelector: (selector) => new MockElement(),
  createElement: (tag) => new MockElement('', tag),
  documentElement: { lang: 'id', setAttribute: () => {}, removeAttribute: () => {}, classList: new Set() },
  addEventListener: () => {}
};

// Load code in order
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const i18nCode = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');
const agentCode = fs.readFileSync(path.join(__dirname, '../js/symptom_filter_agent.js'), 'utf8');
const cvCode = fs.readFileSync(path.join(__dirname, '../js/cv-engine.js'), 'utf8');
const progCode = fs.readFileSync(path.join(__dirname, '../js/progress.js'), 'utf8');
const plannerCode = fs.readFileSync(path.join(__dirname, '../js/planner.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInThisContext(dataCode);
vm.runInThisContext(i18nCode);
vm.runInThisContext(agentCode);
vm.runInThisContext(cvCode);
vm.runInThisContext(progCode);
vm.runInThisContext(plannerCode);
vm.runInThisContext(appCode);

async function runTests() {
  console.log('=== TEST 1: Symptom Recommendation Generation ===');
  const planner = global.mealPlanner;
  const app = global.window.app;

  // Set symptoms: Disfagia & Mual
  planner.activeSymptoms.add('dysphagia');
  planner.activeSymptoms.add('nausea');
  planner.renderSymptomFilter('symptom-result-box');

  const recBox = getElementById('symptom-result-box');
  assert(recBox.innerHTML.includes('Bubur Saring Ikan Gabus'), 'Recommendations contain Bubur Saring Ikan Gabus');
  assert(recBox.innerHTML.includes('btn-symptom-schedule-direct'), 'Card has direct schedule button');
  console.log('>> PASS: Symptom recommendations generated with direct schedule buttons.');

  console.log('\n=== TEST 2: Single-Click Direct Apply & Auto-Navigate ===');
  let calendarModalOpened = false;
  app.openCalendarModal = () => {
    calendarModalOpened = true;
    getElementById('modal-clinical-calendar').style.display = 'flex';
  };

  const initialCustomSchedCount = (app.customDailySchedules || []).length;
  planner.applySingleMealToCalendar('Bubur Saring Ikan Gabus');

  // Verify stored in customDailySchedules
  const updatedSchedules = app.customDailySchedules || [];
  assert(updatedSchedules.length > initialCustomSchedCount, 'Custom daily schedules incremented');
  const foundSched = updatedSchedules.find(s => s.title === 'Bubur Saring Ikan Gabus');
  assert(foundSched, 'Schedule found with title Bubur Saring Ikan Gabus');
  assert.strictEqual(foundSched.category, 'nutrition');
  assert.strictEqual(foundSched.isCustom, true);
  console.log('Saved Schedule Title:', foundSched.title);
  console.log('Saved Schedule Time:', foundSched.time);
  console.log('Saved Schedule Desc:', foundSched.desc);

  // Verify stored in userDailyMealPlans (Meal Planner)
  const userPlans = app.userDailyMealPlans || [];
  const foundPlan = userPlans.find(p => p.name === 'Bubur Saring Ikan Gabus');
  assert(foundPlan, 'Meal plan found in userDailyMealPlans');
  console.log('Saved Meal Plan in Planner:', foundPlan.name, `(${foundPlan.slot})`);

  // Verify auto-navigation
  assert.strictEqual(calendarModalOpened, true, 'openCalendarModal was automatically triggered');
  console.log('Calendar Modal opened automatically:', calendarModalOpened);

  // Verify timeline events render contains the new meal
  const upcomingListEl = getElementById('upcoming-events-list');
  app.renderUpcomingEvents(app.selectedCalendarDate);
  assert(upcomingListEl.innerHTML.includes('Bubur Saring Ikan Gabus'), 'Upcoming events timeline rendered the newly scheduled meal');
  console.log('>> PASS: Direct meal scheduling & automatic calendar navigation verified!');

  console.log('\n=== TEST 3: Multi-Meal Selection & Apply to Calendar ===');
  calendarModalOpened = false;
  planner.selectedMealNames.clear();
  planner.selectSymptomMeal('Puree Pepaya Matang Halus');
  assert(planner.selectedMealNames.has('Puree Pepaya Matang Halus'), 'Papaya puree selected');

  planner.applyToPatientMenu();
  assert.strictEqual(calendarModalOpened, true, 'openCalendarModal automatically triggered on multi-apply');
  const foundPapaya = (app.customDailySchedules || []).find(s => s.title === 'Puree Pepaya Matang Halus');
  assert(foundPapaya, 'Papaya puree scheduled in customDailySchedules');
  console.log('Multi-applied Schedule:', foundPapaya.title, `(${foundPapaya.time})`);

  app.renderUpcomingEvents(app.selectedCalendarDate);
  assert(upcomingListEl.innerHTML.includes('Puree Pepaya Matang Halus'), 'Upcoming events timeline includes Papaya puree');
  console.log('>> PASS: Multi-meal selection apply & auto-navigation verified!');

  console.log('\n=============================================================');
  console.log('🎉 ALL SYMPTOM-TO-CALENDAR AUTOMATIC NAVIGATION TESTS PASSED! 🎉');
  console.log('=============================================================');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
