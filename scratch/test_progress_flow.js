// Test verification for NutriVision Progress Flow
// Node environment mock of browser globals
global.window = {
  i18n: { getLanguage: () => 'id' }
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};
global.document = {
  getElementById: (id) => null,
  querySelectorAll: () => []
};

const fs = require('fs');
const path = require('path');

// Evaluate js/progress.js in this context
const progressCode = fs.readFileSync(path.join(__dirname, '../js/progress.js'), 'utf8');
eval(progressCode.replace('class NutriVisionProgress', 'global.NutriVisionProgress = class NutriVisionProgress'));

console.log('--- TEST 1: Initial state for new real user ---');
const tracker = new NutriVisionProgress();
tracker.initUserProgress({ protein: 75, calories: 1800 }, 'pasien_baru@nutrivision.id');
console.log('Today protein:', tracker.todayIntake.protein); // Expected: 0
console.log('Logs count:', tracker.weeklyLogs.length); // Expected: 7
console.log('Today log protein:', tracker.weeklyLogs.find(l => l.isToday).protein); // Expected: 0

// Test streak calculation logic
let streak = 0;
for (let i = tracker.weeklyLogs.length - 1; i >= 0; i--) {
  const l = tracker.weeklyLogs[i];
  if (l.isToday && (l.protein || 0) === 0) continue;
  if ((l.protein || 0) > 0) streak++;
  else break;
}
console.log('Calculated streak for new user:', streak); // Expected: 0
if (tracker.todayIntake.protein !== 0 || streak !== 0) {
  throw new Error('Test 1 Failed: New user should have 0 protein and 0 streak');
}

console.log('\n--- TEST 2: Logging a meal ---');
tracker.addLoggedMeal({
  protein: [35, 35],
  carbs: [60, 60],
  fat: [15, 15],
  cals: [500, 500]
}, 'pasien_baru@nutrivision.id');

console.log('Updated today protein:', tracker.todayIntake.protein); // Expected: 35
console.log('Updated today log protein:', tracker.weeklyLogs.find(l => l.isToday).protein); // Expected: 35

let streakAfterMeal = 0;
for (let i = tracker.weeklyLogs.length - 1; i >= 0; i--) {
  const l = tracker.weeklyLogs[i];
  if (l.isToday && (l.protein || 0) === 0) continue;
  if ((l.protein || 0) > 0) streakAfterMeal++;
  else break;
}
console.log('Calculated streak after 1 meal:', streakAfterMeal); // Expected: 1
if (tracker.todayIntake.protein !== 35 || streakAfterMeal !== 1) {
  throw new Error('Test 2 Failed: Intake should be 35 and streak should be 1');
}

console.log('\n--- TEST 3: Reloading / Persistence ---');
const reloadedTracker = new NutriVisionProgress();
reloadedTracker.loadUserProgress({
  contact: 'pasien_baru@nutrivision.id',
  isDemo: false,
  targets: { protein: 75, calories: 1800 }
});
console.log('Restored today protein:', reloadedTracker.todayIntake.protein); // Expected: 35
if (reloadedTracker.todayIntake.protein !== 35) {
  throw new Error('Test 3 Failed: Progress was not restored from localStorage');
}

console.log('\n--- TEST 4: Demo user still gets rich demo showcase ---');
const demoTracker = new NutriVisionProgress();
demoTracker.loadUserProgress({
  isDemo: true,
  targets: { protein: 75, calories: 1850 }
});
console.log('Demo today protein:', demoTracker.todayIntake.protein); // Expected: 62
let demoStreak = 0;
for (let i = demoTracker.weeklyLogs.length - 1; i >= 0; i--) {
  const l = demoTracker.weeklyLogs[i];
  if (l.isToday && (l.protein || 0) === 0) continue;
  if ((l.protein || 0) > 0) demoStreak++;
  else break;
}
console.log('Demo streak:', demoStreak); // Expected: 7 (all 7 days have mock data)
if (demoTracker.todayIntake.protein !== 62 || demoStreak < 6) {
  throw new Error('Test 4 Failed: Demo user did not get demo data');
}

console.log('\n✅ ALL PROGRESS & STREAK TESTS PASSED SUCCESSFULLY!');
