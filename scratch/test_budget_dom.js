// End-to-end DOM integration test for Smart Food Budgeting AI
const fs = require('fs');
const path = require('path');

// Mock DOM environment
const elements = {};

function createElement(tag, id) {
  return {
    tagName: tag.toUpperCase(),
    id: id || '',
    className: '',
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); },
      toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
    },
    getAttribute(attr) { return this[attr] || null; },
    setAttribute(attr, val) { this[attr] = val; },
    addEventListener(event, fn) { this['on' + event] = fn; }
  };
}

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// List of required element IDs in index.html
const requiredIds = [
  'budget-input-amount',
  'budget-kpi-daily-quota',
  'budget-kpi-total-cost',
  'budget-kpi-savings',
  'budget-kpi-avg-protein',
  'budget-week-tabs-box',
  'budget-day-navigator-box',
  'budget-active-day-title',
  'budget-active-day-sub',
  'meal-card-breakfast',
  'meal-card-lunch',
  'meal-card-dinner',
  'modal-budget-grocery',
  'budget-grocery-list-container',
  'budget-grocery-total-text',
  'budget-grocery-title',
  'budget-grocery-subtitle',
  'ov-card3-streak-badge',
  'ov-card3-streak-text',
  'weekly-bar-chart-box',
  'ov-weekly-avg-text'
];

console.log('--- TEST 1: Checking required DOM IDs in index.html ---');
requiredIds.forEach(id => {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`Missing required ID in index.html: ${id}`);
  }
  elements[id] = createElement('div', id);
});
console.log(`✅ All ${requiredIds.length} required DOM elements are present in index.html!`);

// Setup window and document mock
global.window = {
  i18n: { getLanguage: () => 'id' },
  lucide: { createIcons: () => {} },
  app: {
    userProfile: { name: 'Pasien Demo' },
    showToast: (msg) => console.log('Toast:', msg),
    progressTracker: {
      addLoggedMeal: (data) => console.log('Logged meal to progressTracker:', data)
    }
  }
};

global.document = {
  getElementById: (id) => elements[id] || null,
  querySelectorAll: (sel) => []
};

// Evaluate budget_planner.js
const budgetCode = fs.readFileSync(path.join(__dirname, '../js/budget_planner.js'), 'utf8');
eval(budgetCode);

console.log('\n--- TEST 2: Initializing Budget Planner (7 Days @ Rp 200.000) ---');
window.budgetPlanner.init();

console.log('KPI Daily Quota:', elements['budget-kpi-daily-quota'].textContent);
console.log('KPI Total Cost:', elements['budget-kpi-total-cost'].textContent);
console.log('KPI Savings:', elements['budget-kpi-savings'].innerHTML);
console.log('Active Day Title:', elements['budget-active-day-title'].innerHTML);
console.log('Breakfast HTML length:', elements['meal-card-breakfast'].innerHTML.length);
console.log('Lunch HTML length:', elements['meal-card-lunch'].innerHTML.length);
console.log('Dinner HTML length:', elements['meal-card-dinner'].innerHTML.length);

if (!elements['budget-kpi-daily-quota'].textContent.includes('28')) {
  throw new Error('Daily quota should be ~28.571!');
}
if (!elements['meal-card-lunch'].innerHTML.includes('Makan Siang')) {
  throw new Error('Lunch card should render Makan Siang!');
}

console.log('\n--- TEST 3: Switching to 30 Days @ Rp 1.000.000 ---');
window.budgetPlanner.setPresetBudget(1000000, 30);
console.log('New KPI Daily Quota (30 days):', elements['budget-kpi-daily-quota'].textContent);
console.log('New KPI Total Cost (30 days):', elements['budget-kpi-total-cost'].textContent);
console.log('New KPI Savings (30 days):', elements['budget-kpi-savings'].innerHTML);
console.log('Day Navigator contains next arrow >:', elements['budget-day-navigator-box'].innerHTML.includes('changeWeek(1)'));

if (!elements['budget-kpi-daily-quota'].textContent.includes('33')) {
  throw new Error('Daily quota for 1M / 30d should be ~33.333!');
}
if (!elements['budget-day-navigator-box'].innerHTML.includes('changeWeek(1)')) {
  throw new Error('Next day navigation arrow > should be visible for 30-day view!');
}

console.log('\n--- TEST 4: Day Selection (Day 15) & Meal Swapping ---');
window.budgetPlanner.selectDay(15);
console.log('Selected Day Title:', elements['budget-active-day-title'].innerHTML);
if (!elements['budget-active-day-title'].innerHTML.includes('15')) {
  throw new Error('Active day title should show Day 15!');
}

const beforeSwap = elements['meal-card-breakfast'].innerHTML;
window.budgetPlanner.swapMeal(15, 'breakfast');
const afterSwap = elements['meal-card-breakfast'].innerHTML;
console.log('Breakfast swapped successfully:', beforeSwap !== afterSwap);
if (beforeSwap === afterSwap) {
  throw new Error('Meal card should change after swapMeal()!');
}

console.log('\n--- TEST 5: Grocery Shopping List Modal ---');
window.budgetPlanner.openGroceryModal();
console.log('Grocery Modal display:', elements['modal-budget-grocery'].style.display);
console.log('Grocery List items count in HTML:', (elements['budget-grocery-list-container'].innerHTML.match(/grocery-item-row/g) || []).length);
console.log('Grocery Total text:', elements['budget-grocery-total-text'].innerHTML);

if (elements['modal-budget-grocery'].style.display !== 'flex') {
  throw new Error('Grocery modal should be open (display: flex)!');
}

window.budgetPlanner.closeGroceryModal();
console.log('Grocery Modal display after close:', elements['modal-budget-grocery'].style.display);
if (elements['modal-budget-grocery'].style.display !== 'none') {
  throw new Error('Grocery modal should be closed (display: none)!');
}

console.log('\n--- TEST 6: Logging Day Meals to Diary ---');
window.budgetPlanner.logActiveDayMeals();

console.log('\n🎉 ALL DOM INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
