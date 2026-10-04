// Automated Verification Suite for "Catat Asupan" Confirmation Popup & Button State Change
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 TESTING: Catat Asupan Confirmation Modal & Button State Change');
console.log('================================================================\n');

// 1. Verify HTML template contains modal-confirm-log-meal
const html = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf-8');
assert(html.includes('id="modal-confirm-log-meal"'), '❌ modal-confirm-log-meal must exist in index.html');
assert(html.includes('id="confirm-log-meal-question"'), '❌ confirm-log-meal-question must exist in index.html');
assert(html.includes('Apakah Anda ingin mencatat menu ini ke dalam nutrisi harian Anda hari ini?'), '❌ Expected exact Indonesian question prompt in index.html');
assert(html.includes('id="confirm-log-meal-btn-cancel"'), '❌ confirm-log-meal-btn-cancel must exist');
assert(html.includes('id="confirm-log-meal-btn-submit"'), '❌ confirm-log-meal-btn-submit must exist');
console.log('✅ HTML validation passed: modal-confirm-log-meal with Indonesian prompt exists');

// 2. Verify CSS has .btn-logged-gray
const css = fs.readFileSync(path.join(__dirname, '../frontend/css/dashboard.css'), 'utf-8');
assert(css.includes('.btn-logged-gray'), '❌ .btn-logged-gray must exist in dashboard.css');
assert(css.includes('background: #94A3B8 !important;'), '❌ .btn-logged-gray must have gray background #94A3B8');
assert(css.includes('cursor: not-allowed !important;'), '❌ .btn-logged-gray must have cursor: not-allowed');
console.log('✅ CSS validation passed: .btn-logged-gray defines gray disabled state');

// 3. Setup Virtual DOM & Mock Environment to test app logic
class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.style = {
      setProperty: (prop, val, pri) => { this.style[prop] = val; }
    };
    this._classes = new Set();
    this.children = [];
    this._innerHTML = '';
    this.textContent = '';
    this.disabled = false;
    this.attributes = {};
  }
  set innerHTML(val) {
    this._innerHTML = val;
    this.textContent = val.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  get innerHTML() {
    return this._innerHTML;
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] || null; }
  appendChild(child) { this.children.push(child); }
  remove() {}
  classList = {
    add: (c) => this._classes.add(c),
    remove: (c) => this._classes.delete(c),
    contains: (c) => this._classes.has(c),
    toggle: (c, val) => { if (val) this._classes.add(c); else this._classes.delete(c); }
  };
}

const domStore = {};
function getElementById(id) {
  if (!domStore[id]) {
    domStore[id] = new MockElement(id);
  }
  return domStore[id];
}

const context = {
  console: console,
  document: {
    getElementById,
    querySelector: () => null,
    createElement: (tag) => new MockElement('', tag),
    body: new MockElement('body', 'body'),
    querySelectorAll: (sel) => {
      if (sel === '[data-meal-name]') {
        return Object.values(domStore).filter(el => el.getAttribute('data-meal-name'));
      }
      return [];
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  window: {
    addEventListener: () => {},
    removeEventListener: () => {},
    i18n: { getLanguage: () => 'id' },
    lucide: { createIcons: () => {} },
    progressTracker: {
      todayMeals: [],
      todayIntake: { protein: 0, carbs: 0, fat: 0, calories: 0 },
      addLoggedMeal: function(nutrients, userKey, meta) {
        this.todayMeals.push({ name: meta.name, protein: nutrients.protein[0], calories: nutrients.calories[0] });
        this.todayIntake.protein += nutrients.protein[0];
        this.todayIntake.calories += nutrients.calories[0];
      },
      renderMacroDonut: () => {},
      renderTodayMealHistory: () => {},
      renderHistoryPage: () => {},
      renderWeeklyBarChart: () => {}
    }
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: (cb) => cb(),
  NUTRIVISION_DATA: {
    indonesianFoodDatabase: []
  }
};

const storageStore = {};
context.localStorage = {
  getItem: (k) => storageStore[k] || null,
  setItem: (k, v) => { storageStore[k] = String(v); },
  removeItem: (k) => { delete storageStore[k]; },
  clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};
context.window.localStorage = context.localStorage;

context.window.document = context.document;
vm.createContext(context);

// Load App and Progress Tracker
const appJs = fs.readFileSync(path.join(__dirname, '../frontend/js/app.js'), 'utf-8');
vm.runInContext(appJs + '\nwindow.app = new NutriVisionApp();', context);

const app = context.window.app;
assert(app, '❌ NutriVisionApp failed to initialize');
app.userProfile = { id: 'usr_test', name: 'Pasien Demo', email: 'demo@nutrivision.ai', targets: { protein: 75, calories: 1850 } };
console.log('✅ NutriVisionApp initialized in mock runtime with authenticated user');

// 4. Test renderRecommendationLogButton initial state
const sampleMealName = 'Bubur Ayam Suwir Oat Tinggi Protein';
const initialBtnHtml = app.renderRecommendationLogButton(sampleMealName, 28, 380, 'Jurnal Klinis', 'btn-primary-teal', 'Sarapan (07:00)');
assert(initialBtnHtml.includes('Catat ke Asupan'), '❌ Initial button must have label "Catat ke Asupan"');
assert(initialBtnHtml.includes('btn-primary-teal'), '❌ Initial button must have primary teal class');
assert(initialBtnHtml.includes('promptLogRecommendedMeal'), '❌ Initial button must call promptLogRecommendedMeal');
console.log('✅ Initial button renders correctly: "Catat ke Asupan"');

// 5. Test clicking "Catat ke Asupan" opens confirmation pop-up
const btnElement = new MockElement('btn-sample', 'button');
btnElement.setAttribute('data-meal-name', sampleMealName);
domStore['btn-sample'] = btnElement;

app.promptLogRecommendedMeal(btnElement, sampleMealName, 28, 380, 'Jurnal Klinis', { timing: 'Sarapan (07:00)' });

const modal = getElementById('modal-confirm-log-meal');
assert(modal.style.display === 'flex' || modal.classList.contains('open'), '❌ Modal must be visible and open');
const questionText = getElementById('confirm-log-meal-question').textContent;
assert(questionText.includes('Apakah Anda ingin mencatat menu ini ke dalam nutrisi harian Anda hari ini?'), '❌ Question text must match requirement');
const mealNameText = getElementById('confirm-log-meal-name').textContent;
assert(mealNameText === sampleMealName, '❌ Meal name preview in modal must match clicked item');
console.log('✅ Confirmation pop-up appeared with exact question and meal preview');

// 6. Test Cancel action: button must NOT change and meal must NOT be logged
app.closeConfirmLogMealModal();
assert(modal.style.display === 'none' || !modal.classList.contains('open'), '❌ Modal should close on cancel');
assert(!btnElement.classList.contains('btn-logged-gray'), '❌ Button should not be gray on cancel');
assert(!btnElement.disabled, '❌ Button should not be disabled on cancel');
assert(context.window.progressTracker.todayMeals.length === 0, '❌ No meal should be logged on cancel');
console.log('✅ Cancel test passed: button unchanged, 0 meals recorded');

// 7. Test Confirm action: user clicks "Ya, Catat Asupan"
app.promptLogRecommendedMeal(btnElement, sampleMealName, 28, 380, 'Jurnal Klinis', { timing: 'Sarapan (07:00)' });
app.executeConfirmLogMeal();

assert(modal.style.display === 'none' || !modal.classList.contains('open'), '❌ Modal must close after confirm');
assert(btnElement.disabled === true, '❌ Button must be disabled after confirm');
assert(btnElement.classList.contains('btn-logged-gray'), '❌ Button must have .btn-logged-gray class');
assert(btnElement.style.background === '#94A3B8', '❌ Button background must be gray (#94A3B8)');
assert(btnElement.innerHTML.includes('Sudah Tercatat'), '❌ Button text must be "Sudah Tercatat"');
assert(context.window.progressTracker.todayMeals.length === 1, '❌ Exactly 1 meal should be recorded');
assert(context.window.progressTracker.todayIntake.protein === 28, '❌ Protein should increase by 28g');
assert(context.window.progressTracker.todayIntake.calories === 380, '❌ Calories should increase by 380');
console.log('✅ Confirm test passed: Button changed to "Sudah Tercatat", color changed to gray (#94A3B8), intake recorded');

// 8. Test re-rendering: when isMealLoggedToday is true, renderRecommendationLogButton returns disabled gray button
const rerenderBtnHtml = app.renderRecommendationLogButton(sampleMealName, 28, 380, 'Jurnal Klinis', 'btn-primary-teal', 'Sarapan (07:00)');
assert(rerenderBtnHtml.includes('Sudah Tercatat'), '❌ Re-rendered button must show "Sudah Tercatat"');
assert(rerenderBtnHtml.includes('btn-logged-gray'), '❌ Re-rendered button must have class btn-logged-gray');
assert(rerenderBtnHtml.includes('disabled'), '❌ Re-rendered button must be disabled');
assert(rerenderBtnHtml.includes('background:#94A3B8'), '❌ Re-rendered button must have gray background #94A3B8');
console.log('✅ Re-rendering test passed: Button stays "Sudah Tercatat" and gray on page refresh or filter change');

// 9. Test duplicate click prevention
let toastMsg = '';
app.showToast = (msg) => { toastMsg = msg; };
app.promptLogRecommendedMeal(btnElement, sampleMealName, 28, 380, 'Jurnal Klinis');
assert(toastMsg.includes('sudah tercatat'), '❌ Attempting to log duplicate should notify user that it is already logged');
assert(context.window.progressTracker.todayMeals.length === 1, '❌ Duplicate meal should not be added');
console.log('✅ Duplicate prevention test passed: user informed and duplicates blocked');

// 10. Test Meal Planner integration
const plannerJs = fs.readFileSync(path.join(__dirname, '../frontend/js/planner.js'), 'utf-8');
context.app = app;
vm.runInContext(plannerJs + '\nwindow.mealPlanner = new NutriVisionPlanner();', context);
const mealPlanner = context.window.mealPlanner;
assert(mealPlanner, '❌ NutriVisionPlanner failed to initialize');

const plannerBtn = new MockElement('btn-planner-1', 'button');
const plannerMealName = 'Sup Ikan Gabus Labu Siam';
plannerBtn.setAttribute('data-meal-name', plannerMealName);
domStore['btn-planner-1'] = plannerBtn;

// Click Catat Asupan on planner
mealPlanner.promptLogMeal(plannerBtn, plannerMealName, '30g Protein · 320 kkal');
assert(modal.style.display === 'flex' || modal.classList.contains('open'), '❌ Modal must open when planner log button clicked');
assert(getElementById('confirm-log-meal-name').textContent === plannerMealName, '❌ Planner meal name must show in confirmation modal');

// Confirm logging
app.executeConfirmLogMeal();
assert(plannerBtn.disabled === true, '❌ Planner button must be disabled after confirm');
assert(plannerBtn.classList.contains('btn-logged-gray'), '❌ Planner button must have .btn-logged-gray');
assert(plannerBtn.innerHTML.includes('Sudah Tercatat'), '❌ Planner button text must change to "Sudah Tercatat"');
assert(context.window.progressTracker.todayMeals.some(m => m.name === plannerMealName), '❌ Planner meal must be recorded in todayMeals');
console.log('✅ MealPlanner test passed: Catat Asupan button triggers modal and updates to "Sudah Tercatat" (gray)');

console.log('\n================================================================');
console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
console.log('================================================================');

