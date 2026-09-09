// Verification script for centered, compact, brief toast notification
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
    this.innerHTML = '';
    this.textContent = '';
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
  appendChild(child) { this.children.push(child); }
  remove() {}
}

const dom = {};
function getElementById(id) {
  if (!dom[id]) dom[id] = new MockElement(id);
  return dom[id];
}

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
  lucide: { createIcons: () => {} },
  i18n: { getLanguage: () => 'id' }
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
global.localStorage = global.window.localStorage;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const cvCode = fs.readFileSync(path.join(__dirname, '../js/cv-engine.js'), 'utf8');
const progCode = fs.readFileSync(path.join(__dirname, '../js/progress.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInThisContext(dataCode);
vm.runInThisContext(cvCode);
vm.runInThisContext(progCode);

global.cvEngine = new NutriVisionCVEngine();
global.progressTracker = new NutriVisionProgress();

vm.runInThisContext(appCode);

const app = new NutriVisionApp();
global.window.app = app;

console.log('--- Testing requireAuth toast formatting ---');

let lastToastMessage = null;
let lastToastType = null;
let lastToastDuration = null;

// Intercept showToast
const origShowToast = app.showToast.bind(app);
app.showToast = function(message, type, duration) {
  lastToastMessage = message;
  lastToastType = type;
  lastToastDuration = duration;
  origShowToast(message, type, duration);
};

// 1. Trigger openScanModal when unauthenticated
app.openScanModal();

console.log('Intercepted Toast Message:', lastToastMessage);
console.log('Toast Type:', lastToastType);

const expected = 'Silakan masuk untuk memindai makanan.';
if (lastToastMessage === expected) {
  console.log('✅ SUCCESS: Toast message is concise and direct ("secukupnya aja"):', lastToastMessage);
} else {
  console.error('❌ FAIL: Expected "' + expected + '", got "' + lastToastMessage + '"');
  process.exit(1);
}

// 2. Trigger requireAuth without actionDescription
app.requireAuth(() => {});
console.log('Intercepted Default Action Toast:', lastToastMessage);
if (lastToastMessage === 'Silakan masuk terlebih dahulu.') {
  console.log('✅ SUCCESS: Default action toast is also concise and clean.');
} else {
  console.error('❌ FAIL: Unexpected default action message:', lastToastMessage);
  process.exit(1);
}

// 3. Inspect toast element created in DOM
const container = document.getElementById('toast-container');
const lastToastChild = container.children[container.children.length - 1];
console.log('Toast element created in container:', !!lastToastChild);
console.log('Toast element innerHTML:', lastToastChild.innerHTML);

console.log('--- All toast checks passed successfully! 🎉 ---');
