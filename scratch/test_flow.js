// Test verification script for Nutrivision AI Empty State & Data Application Flow
const fs = require('fs');
const path = require('path');

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
    moveTo: () => {},
    lineTo: () => {},
    rect: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} })
  }),
  addEventListener: () => {},
  style: {}
};

global.window = {
  location: { hash: '#overview' },
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
global.Image = class {
  constructor() {
    this.complete = false;
    this.naturalWidth = 0;
  }
};
global.document = {
  body: new MockElement('body'),
  getElementById,
  querySelectorAll: () => [],
  querySelector: () => new MockElement(),
  createElement: (tag) => new MockElement('', tag),
  documentElement: { lang: 'id', setAttribute: () => {}, removeAttribute: () => {}, classList: new Set() },
  addEventListener: () => {}
};

// Load scripts in order
const vm = require('vm');
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const i18nCode = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');
const cvCode = fs.readFileSync(path.join(__dirname, '../js/cv-engine.js'), 'utf8');
const progCode = fs.readFileSync(path.join(__dirname, '../js/progress.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInThisContext(dataCode);
vm.runInThisContext(i18nCode);
vm.runInThisContext(cvCode);
vm.runInThisContext(progCode);

// Mock instance globals
global.cvEngine = new NutriVisionCVEngine();
global.progressTracker = new NutriVisionProgress();
global.mealPlanner = { renderPlanner: () => {}, renderSymptomFilter: () => {} };
global.communityHandler = { renderCommunityFeed: () => {} };
global.caregiverHandler = { renderCaregiverList: () => {} };

vm.runInThisContext(appCode);
global.app = new NutriVisionApp();

async function runTests() {
  console.log('=== TEST 1: Initial Guest / Preview Mode (ID) ===');
  window.localStorage.setItem('nutrivision_lang', 'id');
  dom['overview-plate-canvas'] = mockCanvas;
  dom['overview-plate-empty-disc'] = new MockElement('overview-plate-empty-disc');
  dom['overview-plate-empty-title'] = new MockElement('overview-plate-empty-title');
  dom['overview-plate-empty-sub'] = new MockElement('overview-plate-empty-sub');
  if (window.i18n) window.i18n.setLanguage('id');
  await app.init();

  console.log('Current Scan:', cvEngine.currentScan);
  console.log('Total Badge text:', dom['overview-total-badge']?.textContent);
  console.log('Empty Disc Title:', dom['overview-plate-empty-title']?.textContent);
  console.log('Legend contains empty state box:', dom['overview-segment-legend']?.innerHTML?.includes('overview-empty-state-box'));
  console.log('Card 2 Protein label:', dom['macro-num-protein']?.textContent);
  console.log('Card 2 Status badge text:', dom['ov-card2-status-text']?.textContent);
  console.log('Card 3 Streak text:', dom['ov-card3-streak-text']?.textContent);

  if (cvEngine.currentScan !== null) throw new Error('FAIL: cvEngine.currentScan should be null in preview mode!');
  if (!dom['overview-total-badge']?.textContent?.includes('0')) throw new Error('FAIL: total badge should show 0 Komponen!');
  if (dom['overview-plate-empty-title']?.textContent !== 'Piring Belum Terisi') throw new Error('FAIL: title should be Piring Belum Terisi!');
  if (!dom['overview-segment-legend']?.innerHTML?.includes('overview-empty-state-box')) throw new Error('FAIL: legend should contain empty state box!');
  const statusText = dom['ov-card2-status-text']?.textContent?.toLowerCase() || '';
  if (!statusText.includes('konfigur') && !statusText.includes('configur')) throw new Error('FAIL: status should be unconfigured!');
  if (!dom['ov-card3-streak-text']?.textContent?.includes('0')) throw new Error('FAIL: streak should be 0!');
  console.log('>>> TEST 1 PASSED: Dashboard Preview Mode successfully displays ceramic "Piring Belum Terisi" empty state!\n');

  console.log('=== TEST 2: Demo Login Mode ("Masuk Akun Demo") ===');
  await app.loginAsDemo('post-surgery');

  console.log('Current Scan segments count:', cvEngine.currentScan?.segments?.length);
  console.log('Total Badge text:', dom['overview-total-badge']?.textContent);
  console.log('Legend has segment rows:', dom['overview-segment-legend']?.innerHTML?.includes('segment-row'));
  console.log('Card 2 Protein label:', dom['macro-num-protein']?.textContent);
  console.log('Card 2 Status badge text:', dom['ov-card2-status-text']?.textContent);
  console.log('Card 3 Streak text:', dom['ov-card3-streak-text']?.textContent);

  if (!cvEngine.currentScan || cvEngine.currentScan.segments.length !== 4) throw new Error('FAIL: Demo should load 4 food segments!');
  if (!dom['overview-total-badge']?.textContent?.includes('4')) throw new Error('FAIL: total badge should be 4 for demo!');
  if (!dom['overview-segment-legend']?.innerHTML?.includes('segment-row')) throw new Error('FAIL: legend should contain food segments!');
  if (dom['macro-num-protein']?.textContent !== '62 / 75 g') throw new Error('FAIL: demo protein should be 62 / 75 g!');
  if (!dom['ov-card2-status-text']?.textContent?.includes('On Track')) throw new Error('FAIL: demo status should be On Track!');
  if (!dom['ov-card3-streak-text']?.textContent?.includes('6')) throw new Error('FAIL: demo streak should be 6!');
  console.log('>>> TEST 2 PASSED: Demo login successfully applied all rich clinical data to dashboard!\n');

  console.log('=== TEST 3: Logout Reset ===');
  app.handleLogout();
  console.log('After logout, Current Scan:', cvEngine.currentScan);
  console.log('Total Badge text:', dom['overview-total-badge']?.textContent);
  console.log('Empty Disc Title:', dom['overview-plate-empty-title']?.textContent);
  console.log('Legend has empty state:', dom['overview-segment-legend']?.innerHTML?.includes('overview-empty-state-box'));
  console.log('Card 2 Protein label:', dom['macro-num-protein']?.textContent);
  console.log('Card 3 Streak text:', dom['ov-card3-streak-text']?.textContent);

  if (cvEngine.currentScan !== null) throw new Error('FAIL: currentScan should be null after logout!');
  if (!dom['overview-total-badge']?.textContent?.includes('0')) throw new Error('FAIL: total badge should be 0 Komponen after logout!');
  if (dom['overview-plate-empty-title']?.textContent !== 'Piring Belum Terisi') throw new Error('FAIL: title should be Piring Belum Terisi!');
  if (dom['macro-num-protein']?.textContent !== '0 / -- g') throw new Error('FAIL: protein must reset to 0 / -- g after logout!');
  if (!dom['ov-card3-streak-text']?.textContent?.includes('0')) throw new Error('FAIL: streak must reset to 0 after logout!');
  console.log('>>> TEST 3 PASSED: Logout properly resets to ceramic "Piring Belum Terisi" empty state!\n');

  console.log('ALL SIMULATION TESTS PASSED SUCCESSFULLY! 🎉');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
