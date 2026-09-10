
const fs = require('fs');
const vm = require('vm');

const appCode = fs.readFileSync('js/app.js', 'utf-8');

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
  if (!dom[id]) dom[id] = new MockElement(id);
  return dom[id];
}
global.document = {
  getElementById,
  createElement: (tag) => new MockElement('', tag),
  documentElement: new MockElement('html'),
  querySelectorAll: () => [],
  querySelector: () => null,
  body: new MockElement('body'),
  addEventListener: () => {}
};
global.window = global;
global.window.addEventListener = () => {};
global.window.scrollTo = () => {};
global.localStorage = {
  data: {},
  getItem: function(k) { return this.data[k] || null; },
  setItem: function(k, v) { this.data[k] = v; },
  removeItem: function(k) { delete this.data[k]; }
};
global.cvEngine = { currentScan: null };
global.progressTracker = {
  setEmptyState: () => {},
  renderMacroDonut: () => {},
  renderWeeklyBarChart: () => {}
};
global.mealPlanner = { renderPlanner: () => {}, renderSymptomFilter: () => {} };
global.communityHandler = { renderCommunityFeed: () => {} };
global.caregiverHandler = { renderCaregiverList: () => {} };

vm.runInThisContext(appCode);
global.app = new NutriVisionApp();

getElementById('reg-name').value = 'Syifa Canggih';
getElementById('reg-email').value = 'syifa@gmail.com';
getElementById('reg-password').value = 'mypassword123';

console.log('Calling app.handleRegister()...');
app.handleRegister().then(() => {
  console.log('User profile name:', app.userProfile.name);
  console.log('Auth modal open:', dom['auth-modal'].classList.contains('open'));
  console.log('Onboarding modal open:', dom['onboarding-modal'].classList.contains('open'));
  console.log('Current quiz step:', app.currentQuizStep);
  console.log('Has completed quiz:', app.userProfile?.hasCompletedQuiz);
}).catch(console.error);
