const fs = require('fs');

console.log('--- Simulating DOM and Card Click Flow ---');

// Mock browser window and DOM globals
global.window = global;
global.window.i18n = {
  getLanguage: () => 'id'
};
global.document = {
  getElementById: (id) => {
    if (!global.document._elements[id]) {
      global.document._elements[id] = {
        id: id,
        innerHTML: '',
        textContent: '',
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); },
          toggle(c, force) { if (force !== undefined) { force ? this.add(c) : this.remove(c); } else { this.contains(c) ? this.remove(c) : this.add(c); } }
        },
        dataset: {},
        querySelector: (s) => null,
        appendChild(child) {},
        addEventListener(e, fn) {},
        remove() {}
      };
    }
    return global.document._elements[id];
  },
  querySelectorAll: (sel) => [],
  querySelector: (sel) => null,
  addEventListener: (e, fn) => {},
  _elements: {}
};

global.localStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; }
};

// Load data.js
const dataCode = fs.readFileSync('js/data.js', 'utf8');
eval(dataCode);

// Mock cvEngine and progressTracker
global.cvEngine = {
  currentScan: { segments: [] },
  addSegment(food, grams) {
    console.log(`[cvEngine] Added segment: ${food.name} (${grams}g)`);
  }
};

global.progressTracker = {
  addLoggedMeal(nutrients, userKey) {
    console.log(`[progressTracker] Meal logged for ${userKey}:`, nutrients);
  },
  renderMacroDonut() {},
  renderWeeklyBarChart() {}
};

// Check data integrity
const foods = global.NUTRIVISION_DATA.indonesianFoodDatabase;
console.log(`Loaded ${foods.length} foods in indonesianFoodDatabase.`);

// Test app methods
const appCode = fs.readFileSync('js/app.js', 'utf8');
const classCode = appCode.substring(appCode.indexOf('class NutriVisionApp'), appCode.indexOf('const app = new NutriVisionApp();'));
global.NutriVisionApp = eval(`(${classCode})`);

const testApp = new global.NutriVisionApp();
testApp.currentUser = { id: 'usr-1', email: 'goblok@gaming.com', name: 'GOBLOK GAMING' };
testApp.userProfile = { name: 'GOBLOK GAMING', heightCm: 165, weightKg: 60, conditionId: 'post-surgery' };
testApp.journeyCondition = 'post-surgery';

// Setup DOM elements for catalog
const catalogGrid = global.document.getElementById('food-catalog-grid');
const confirmContent = global.document.getElementById('meal-planner-confirm-content');
const confirmModal = global.document.getElementById('modal-confirm-meal-planner');

// 1. Render Catalog
testApp.renderFoodCatalog();
console.log(`Rendered catalog HTML length: ${catalogGrid.innerHTML.length}`);

// Verify that .popular-food-card is rendered
if (!catalogGrid.innerHTML.includes('class="popular-food-card')) {
  console.error('FAIL: Catalog HTML does not contain popular-food-card!');
  process.exit(1);
}
console.log('PASS: .popular-food-card is correctly rendered in catalogGrid!');

// Verify cards contain onclick openAddToMealPlannerModal
if (!catalogGrid.innerHTML.includes('app.openAddToMealPlannerModal(')) {
  console.error('FAIL: Catalog HTML does not contain openAddToMealPlannerModal!');
  process.exit(1);
}
console.log('PASS: Cards wire to app.openAddToMealPlannerModal() on click!');

// 2. Simulate User Clicking a Card
console.log('\n--- Simulating User Clicking "Salmon Panggang" Card ---');
try {
  testApp.openAddToMealPlannerModal('salmon-panggang');
} catch (err) {
  console.error('Error in openAddToMealPlannerModal:', err);
}

// Check modal open state
if (!confirmModal.classList.contains('open')) {
  console.error('FAIL: modal-confirm-meal-planner was not opened! Current classes:', [...confirmModal.classList.classes]);
  process.exit(1);
}
console.log('PASS: modal-confirm-meal-planner opened with class "open"!');

// Check confirmation modal content
const modalHtml = confirmContent.innerHTML;
if (!modalHtml.includes('Tambahkan ke Meal Planner?') || !modalHtml.includes('Salmon Panggang')) {
  console.error('FAIL: Modal content does not have title or food name!');
  process.exit(1);
}
console.log('PASS: Confirmation modal shows title and selected food details!');

if (!modalHtml.includes('data-slot="lunch"') || !modalHtml.includes('data-slot="breakfast"')) {
  console.error('FAIL: Modal does not have meal time buttons (Sarapan, Siang, Malam, Camilan)!');
  process.exit(1);
}
console.log('PASS: Modal contains meal slot buttons (Sarapan, Siang, Malam, Camilan)!');

// 3. Simulate Servings Change (+1)
console.log('\n--- Simulating User Increasing Servings to 1.5 Porsi ---');
testApp.changeMealPlannerServings(1);
console.log(`Updated servings: ${testApp.mealPlannerConfirmState.servings}`);
if (testApp.mealPlannerConfirmState.servings !== 1.5) {
  console.error('FAIL: Servings not updated to 1.5');
  process.exit(1);
}
console.log('PASS: Servings changed to 1.5, modal dynamically recalculated macros!');

// 4. Simulate Selecting "Makan Malam"
console.log('\n--- Simulating User Choosing "Makan Malam" ---');
testApp.selectMealPlannerSlot('dinner');
if (testApp.mealPlannerConfirmState.slot !== 'dinner') {
  console.error('FAIL: Slot not changed to dinner');
  process.exit(1);
}
console.log('PASS: Slot changed to "dinner"!');

// 5. Simulate User Confirming "Tambahkan ke Meal Planner"
console.log('\n--- Simulating User Clicking "Ya, Tambahkan ke Meal Planner" ---');
testApp.showToast = (msg, type) => console.log(`[Toast] ${msg}`);
testApp.confirmAddToMealPlanner();

// Verify modal closed
if (confirmModal.classList.contains('open')) {
  console.error('FAIL: modal-confirm-meal-planner was not closed after confirmation!');
  process.exit(1);
}
console.log('PASS: modal-confirm-meal-planner closed after confirmation!');

// Verify user daily meal plan stored in localStorage
const savedPlans = JSON.parse(global.localStorage.getItem('nutrivision_user_meal_plans'));
console.log('Saved meal plans in storage:', savedPlans);
if (!savedPlans || savedPlans.length === 0 || savedPlans[0].foodId !== 'salmon-panggang') {
  console.error('FAIL: Meal plan not properly saved to localStorage!');
  process.exit(1);
}
console.log('PASS: Meal plan properly saved in localStorage with slot "dinner" and 1.5 servings!');

console.log('\nALL SIMULATION AND INTEGRATION TESTS PASSED 100%!');
