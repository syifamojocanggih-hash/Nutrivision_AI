const fs = require('fs');
const path = require('path');

// Mock DOM
const dom = {};
function getElementById(id) {
  if (!dom[id]) {
    dom[id] = {
      id,
      tagName: 'DIV',
      value: '',
      style: {},
      innerHTML: '',
      textContent: '',
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      addEventListener: () => {}
    };
  }
  return dom[id];
}

global.document = {
  getElementById,
  querySelectorAll: () => []
};

global.window = {
  i18n: { getLanguage: () => 'id' },
  lucide: { createIcons: () => {} },
  app: {
    userProfile: { name: 'Budi Santoso', isDemo: false },
    showToast: (msg) => console.log('Toast:', msg)
  }
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

const budgetCode = fs.readFileSync(path.join(__dirname, '../js/budget_planner.js'), 'utf8');
eval(budgetCode);

async function testBudgetUpdateFlow() {
  console.log('=== TEST 1: Initial Empty State for Real / New User ===');
  window.budgetPlanner.init();

  console.log('isPlanGenerated:', window.budgetPlanner.isPlanGenerated);
  console.log('budget-empty-state display:', dom['budget-empty-state']?.style?.display);
  console.log('budget-active-content display:', dom['budget-active-content']?.style?.display);
  console.log('budget-clean-footer display:', dom['budget-clean-footer']?.style?.display);
  console.log('budget-input-amount value:', dom['budget-input-amount']?.value);

  if (window.budgetPlanner.isPlanGenerated !== false) throw new Error('FAIL: Initial state must be empty (false)');
  if (dom['budget-empty-state']?.style?.display !== 'block') throw new Error('FAIL: Empty state box must be visible');
  if (dom['budget-active-content']?.style?.display !== 'none') throw new Error('FAIL: Active content must be hidden initially');
  if (dom['budget-clean-footer']?.style?.display !== 'none') throw new Error('FAIL: Footer must be hidden initially');
  console.log('>>> TEST 1 PASSED: Budgeting starts cleanly empty until user inputs data!\n');

  console.log('=== TEST 2: Typing without clicking Perbarui ===');
  dom['budget-input-amount'].value = '350000';
  // Simulate duration click
  window.budgetPlanner.setDuration(7);

  console.log('After duration click, isPlanGenerated:', window.budgetPlanner.isPlanGenerated);
  console.log('After duration click, budget-empty-state display:', dom['budget-empty-state']?.style?.display);
  if (window.budgetPlanner.isPlanGenerated !== false) throw new Error('FAIL: Should NOT auto-generate before Perbarui is clicked');
  console.log('>>> TEST 2 PASSED: Data does not automatically appear before Perbarui!\n');

  console.log('=== TEST 3: Click "Perbarui" Button ===');
  window.budgetPlanner.applyBudgetUpdate();

  console.log('After applyBudgetUpdate, isPlanGenerated:', window.budgetPlanner.isPlanGenerated);
  console.log('budget-empty-state display:', dom['budget-empty-state']?.style?.display);
  console.log('budget-active-content display:', dom['budget-active-content']?.style?.display);
  console.log('budget-clean-footer display:', dom['budget-clean-footer']?.style?.display);
  console.log('Calculated Daily Quota:', dom['budget-kpi-daily-quota']?.textContent);

  if (window.budgetPlanner.isPlanGenerated !== true) throw new Error('FAIL: Plan must be marked generated after Perbarui');
  if (dom['budget-empty-state']?.style?.display !== 'none') throw new Error('FAIL: Empty state must be hidden after Perbarui');
  if (dom['budget-active-content']?.style?.display !== 'block') throw new Error('FAIL: Active content must be shown after Perbarui');
  if (dom['budget-clean-footer']?.style?.display !== 'flex') throw new Error('FAIL: Footer must be visible after Perbarui');
  if (!dom['budget-kpi-daily-quota']?.textContent?.includes('50.000')) throw new Error('FAIL: Daily quota for 350k / 7d should be 50.000!');
  console.log('>>> TEST 3 PASSED: Clicking Perbarui generates plan and displays all data!\n');

  console.log('=== TEST 4: Quick Preset Selection (Rp 1.000.000 / 30 Hari) ===');
  window.budgetPlanner.selectPresetQuick(1000000, 30);
  console.log('Duration Days:', window.budgetPlanner.durationDays);
  console.log('Budget Amount:', window.budgetPlanner.budgetAmount);
  console.log('30-Day Daily Quota:', dom['budget-kpi-daily-quota']?.textContent);

  if (window.budgetPlanner.durationDays !== 30) throw new Error('FAIL: Duration should be 30 days');
  if (window.budgetPlanner.budgetAmount !== 1000000) throw new Error('FAIL: Budget should be 1.000.000');
  if (!dom['budget-kpi-daily-quota']?.textContent?.includes('33.333')) throw new Error('FAIL: Daily quota should be ~33.333');
  console.log('>>> TEST 4 PASSED: Quick preset cleanly updates and renders!\n');

  console.log('🎉 ALL BUDGET UPDATE & MANUAL TRIGGER TESTS PASSED 100%! 🎉');
}

testBudgetUpdateFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
