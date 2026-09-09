// Test verification script for Recovery Journey Roadmap and Dual Calendar
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
  querySelectorAll: (selector) => [],
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

console.log('=== TEST 1: Default Post-Surgery Roadmap & Dual Calendar ===');
app.init();
app.renderJourneyRoadmap('post-surgery');
app.renderDualCalendar('post-surgery');

const grid = getElementById('journey-timeline-grid');
const sub = getElementById('journey-roadmap-sub').textContent;
const calContainer = getElementById('dual-calendar-container');
const calLabel = getElementById('dual-cal-window-label').textContent;

console.log('Roadmap HTML length:', grid.innerHTML.length);
console.log('Sub header:', sub);
console.log('Dual Calendar window label:', calLabel);
console.log('Dual Calendar HTML contains mini-calendar-card:', calContainer.innerHTML.includes('mini-calendar-card'));

if (grid.innerHTML.includes('Fase 1 · Hari 1–5') && grid.innerHTML.includes('Fase 2 · Hari 6–21') && calContainer.innerHTML.includes('Bulan Pertama')) {
  console.log('>>> TEST 1 PASSED: Post-Surgery phases and 2 consecutive months rendered!');
} else {
  throw new Error('Test 1 failed!');
}

console.log('\n=== TEST 2: Switch to Rehab & Fisioterapi ===');
app.setJourneyCondition('rehab');
console.log('Active Condition:', app.journeyCondition);
const subRehab = getElementById('journey-roadmap-sub').textContent;
console.log('Sub header after rehab switch:', subRehab);

if (app.journeyCondition === 'rehab' && grid.innerHTML.includes('Proteksi & Anti-Edema Sendi')) {
  console.log('>>> TEST 2 PASSED: Successfully adjusted to Rehab protocol!');
} else {
  throw new Error('Test 2 failed!');
}

console.log('\n=== TEST 3: Switch to Gym & Muscle Recovery ===');
app.setJourneyCondition('gym');
console.log('Active Condition:', app.journeyCondition);
const subGym = getElementById('journey-roadmap-sub').textContent;
console.log('Sub header after gym switch:', subGym);

if (app.journeyCondition === 'gym' && grid.innerHTML.includes('Resintesis Glikogen')) {
  console.log('>>> TEST 3 PASSED: Successfully adjusted to Gym recovery protocol!');
} else {
  throw new Error('Test 3 failed!');
}

console.log('\n=== TEST 4: Shift Dual Calendar & Select Date ===');
app.shiftDualCalendar(1);
console.log('Calendar Month Offset:', app.calendarMonthOffset);
const newLabel = getElementById('dual-cal-window-label').textContent;
console.log('Shifted Window Label:', newLabel);

app.selectCalendarDate('2026-10-15', 38, 'rehab', 2);
const infoText = getElementById('dual-cal-selected-info').textContent;
console.log('Selected Date Info:', infoText);

if (app.calendarMonthOffset === 1 && infoText.includes('Hari ke-38')) {
  console.log('>>> TEST 4 PASSED: Dual calendar shifting and date selection work seamlessly!');
} else {
  throw new Error('Test 4 failed!');
}

console.log('\nALL 4 RECOVERY JOURNEY TESTS PASSED! 🎉');
