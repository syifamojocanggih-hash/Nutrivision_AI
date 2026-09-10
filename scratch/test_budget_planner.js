// Test validation for NutriVisionBudgetPlanner
global.window = {
  i18n: { getLanguage: () => 'id' }
};
global.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};

const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../js/budget_planner.js'), 'utf8');
eval(code);

console.log('--- TEST 1: Default 7 Days with Rp 200.000 ---');
const bp = window.budgetPlanner;
bp.setPresetBudget(200000, 7);

console.log('Duration Days:', bp.durationDays);
console.log('Budget Amount:', bp.budgetAmount);
console.log('Plan Days count:', bp.plan.length);
if (bp.plan.length !== 7) throw new Error('Expected 7 days in plan!');

const totalCost7 = bp.plan.reduce((sum, d) => sum + d.totalDayCost, 0);
console.log('Total Estimated Cost for 7 days:', totalCost7);
console.log('Daily Target Budget:', bp.plan[0].dailyBudget);
console.log('Day 1 Meals:', {
  breakfast: bp.plan[0].breakfast.name,
  lunch: bp.plan[0].lunch.name,
  dinner: bp.plan[0].dinner.name,
  totalDayCost: bp.plan[0].totalDayCost,
  totalDayProtein: bp.plan[0].totalDayProtein
});

if (totalCost7 > 210000) throw new Error('Total 7-day cost exceeds budget threshold!');
if (bp.plan[0].totalDayProtein < 50) throw new Error('Day 1 protein is too low!');

console.log('--- TEST 2: 30 Days with Rp 1.000.000 ---');
bp.setPresetBudget(1000000, 30);
console.log('Duration Days:', bp.durationDays);
console.log('Plan Days count:', bp.plan.length);
if (bp.plan.length !== 30) throw new Error('Expected 30 days in plan!');

const totalCost30 = bp.plan.reduce((sum, d) => sum + d.totalDayCost, 0);
console.log('Total Estimated Cost for 30 days:', totalCost30);
console.log('Daily Target Budget for 30 days:', bp.plan[0].dailyBudget);
console.log('Day 15 Meals:', {
  breakfast: bp.plan[14].breakfast.name,
  lunch: bp.plan[14].lunch.name,
  dinner: bp.plan[14].dinner.name,
  totalDayCost: bp.plan[14].totalDayCost,
  totalDayProtein: bp.plan[14].totalDayProtein
});

if (totalCost30 > 1050000) throw new Error('Total 30-day cost exceeds budget threshold!');
if (bp.plan[14].totalDayProtein < 50) throw new Error('Day 15 protein is too low!');

console.log('--- TEST 3: Swap Meal functionality ---');
const beforeSwapLunch = bp.plan[0].lunch.id;
bp.swapMeal(1, 'lunch');
const afterSwapLunch = bp.plan[0].lunch.id;
console.log('Day 1 lunch swapped from', beforeSwapLunch, 'to', afterSwapLunch);
if (beforeSwapLunch === afterSwapLunch) throw new Error('Meal swap did not change dish!');

console.log('--- TEST 4: Grocery List Aggregation ---');
const grocery7 = bp.getGrocerySummary();
console.log('Grocery Items count:', grocery7.items.length);
console.log('Grand Total groceries for 30 days:', grocery7.grandTotal);
if (grocery7.grandTotal <= 0) throw new Error('Grocery grand total should be > 0!');

console.log('🎉 ALL BUDGET PLANNER UNIT TESTS PASSED SUCCESSFULLY!');
