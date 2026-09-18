// Test script: Onboarding Budgeting & Clinical Calendar Suite Integration
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Starting Budget Calendar Integration Test ---');

// 1. Check index.html elements
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert(htmlContent.includes('onboard-budget-section'), 'index.html must contain onboard-budget-section');
assert(htmlContent.includes('onboard-budget-dur-7'), 'index.html must contain onboard-budget-dur-7');
assert(htmlContent.includes('onboard-budget-dur-30'), 'index.html must contain onboard-budget-dur-30');
assert(htmlContent.includes('onboard-tier-super_budget'), 'index.html must contain onboard-tier-super_budget');
assert(htmlContent.includes('onboard-tier-budget'), 'index.html must contain onboard-tier-budget');
assert(htmlContent.includes('onboard-tier-optimal'), 'index.html must contain onboard-tier-optimal');
assert(htmlContent.includes('modal-adjust-budget-calendar'), 'index.html must contain modal-adjust-budget-calendar');
assert(htmlContent.includes('cal-budget-indicator-bar'), 'index.html must contain cal-budget-indicator-bar');
assert(htmlContent.includes('btn-budget-sync-link'), 'index.html must contain btn-budget-sync-link');

console.log('✓ HTML Elements Verified');

// 2. Mock DOM & test App logic
global.window = {
  i18n: { getLanguage: () => 'id' },
  BappenasFoodAPI: {
    getActiveRegion: () => ({ multiplier: 1.00, label: 'Jawa Tengah · Kab. Magelang', zone: 'Zona 1' }),
    hasCustomRegion: true,
    onRegionChange: () => {}
  }
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.document = {
  getElementById: (id) => ({
    value: id === 'onboard-budget-amount' ? '250000' : (id === 'cal-adjust-budget-amount' ? '1050000' : ''),
    textContent: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    querySelector: () => ({ textContent: '', style: {} }),
    querySelectorAll: () => []
  }),
  querySelectorAll: () => []
};

const dataJsPath = path.join(__dirname, '..', 'js', 'data.js');
const budgetJsPath = path.join(__dirname, '..', 'js', 'budget_planner.js');

const dataContent = fs.readFileSync(dataJsPath, 'utf8');
const budgetContent = fs.readFileSync(budgetJsPath, 'utf8');

eval(dataContent);
eval(budgetContent);

const bp = window.budgetPlanner;
bp.setPresetBudget(250000, 7);

assert(bp.plan.length === 7, 'Default budgetPlanner plan length must be 7 days');
const day1 = bp.plan[0];
assert(day1.breakfast && day1.breakfast.name, 'Day 1 must have a breakfast meal');
assert(day1.lunch && day1.lunch.name, 'Day 1 must have a lunch meal');
assert(day1.dinner && day1.dinner.name, 'Day 1 must have a dinner meal');
console.log(`✓ 7-Day Budget Planner Plan: Day 1 Meals:`);
console.log(`   - Sarapan: ${day1.breakfast.name} (Rp ${day1.breakfast.price})`);
console.log(`   - Siang:   ${day1.lunch.name} (Rp ${day1.lunch.price})`);
console.log(`   - Malam:   ${day1.dinner.name} (Rp ${day1.dinner.price})`);

// 3. Test 30-Day Plan Generation
bp.setDuration(30);
bp.setPresetBudget(1050000, 30);
assert(bp.plan.length === 30, 'Plan length must be 30 days after duration switch');
console.log(`✓ 30-Day Budget Planner Plan: Day 30 lunch = ${bp.plan[29].lunch.name} (Rp ${bp.plan[29].lunch.price})`);

// 4. Test calendar integration mapping
const mockApp = {
  userProfile: {
    conditionId: 'post-surgery',
    budget: { durationDays: 7, budgetAmount: 250000, tier: 'budget', preference: 'seimbang' }
  },
  calendarStartDate: '2026-09-01',
  selectedCalendarDate: '2026-09-01',
  completedScheduleItems: {},
  customDailySchedules: [],
  getConditionSchedules: function(conditionId, targetDate = null) {
    const curDate = targetDate || this.selectedCalendarDate || '2026-09-01';
    let baseSchedules = [];
    if (window.budgetPlanner && window.budgetPlanner.plan && window.budgetPlanner.plan.length > 0) {
      const plan = window.budgetPlanner.plan;
      const duration = window.budgetPlanner.durationDays || plan.length || 7;
      const targetD = new Date(curDate + 'T00:00:00');
      const startD = new Date(this.calendarStartDate + 'T00:00:00');
      const diffDays = Math.floor((targetD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24));
      const dayIdx = ((diffDays % duration) + duration) % duration;
      const dayPlan = plan[dayIdx] || plan[0];

      baseSchedules = [
        { id: 'bf', time: '07:00 - 08:00', title: `Sarapan: ${dayPlan.breakfast.name}`, price: dayPlan.breakfast.price, category: 'nutrition' },
        { id: 'snack-1', time: '10:00 - 10:30', title: 'Snack Pemulihan & Hidrasi Seluler', price: 5000, category: 'hydration' },
        { id: 'lu', time: '12:30 - 13:30', title: `Makan Siang: ${dayPlan.lunch.name}`, price: dayPlan.lunch.price, category: 'nutrition' },
        { id: 'snack-2', time: '15:30 - 16:00', title: 'Terapi Nutrisi & Camilan Anti-Inflamasi', price: 5000, category: 'snack' },
        { id: 'di', time: '19:00 - 20:00', title: `Makan Malam: ${dayPlan.dinner.name}`, price: dayPlan.dinner.price, category: 'nutrition' }
      ];
    }
    return baseSchedules;
  }
};

const schedulesDay1 = mockApp.getConditionSchedules('post-surgery', '2026-09-01');
assert(schedulesDay1.length === 5, 'Must have 5 schedule events (3 meals + 2 snacks/hydration)');
assert(schedulesDay1[0].price > 0, 'Breakfast must have a price');
assert(schedulesDay1[2].price > 0, 'Lunch must have a price');
assert(schedulesDay1[4].price > 0, 'Dinner must have a price');

const totalMealCost = schedulesDay1.reduce((sum, s) => sum + s.price, 0);
console.log(`✓ Calendar schedule generated with 5 events, Total Day Cost: Rp ${totalMealCost.toLocaleString('id-ID')}`);

console.log('--- All Budget Calendar Integration Tests Passed Successfully! ---');
