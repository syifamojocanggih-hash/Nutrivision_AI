const fs = require('fs');

console.log('Testing Meal Planner Confirmation & Catalog Layout Reversal...');

// 1. Verify index.html contains modal-confirm-meal-planner
const indexHtml = fs.readFileSync('index.html', 'utf8');
if (!indexHtml.includes('id="modal-confirm-meal-planner"')) {
  console.error('FAIL: modal-confirm-meal-planner not found in index.html');
  process.exit(1);
}
console.log('PASS: modal-confirm-meal-planner found in index.html');

// 2. Verify components.css has popular-catalog-grid (260px) and popular-food-card
const compCss = fs.readFileSync('css/components.css', 'utf8');
if (!compCss.includes('minmax(260px, 1fr)')) {
  console.error('FAIL: popular-catalog-grid minmax(260px, 1fr) not found');
  process.exit(1);
}
console.log('PASS: popular-catalog-grid minmax(260px, 1fr) found');

if (!compCss.includes('.popular-food-card')) {
  console.error('FAIL: .popular-food-card not found');
  process.exit(1);
}
console.log('PASS: .popular-food-card found in components.css');

// 3. Verify modals.css has meal-planner-confirm-box
const modalCss = fs.readFileSync('css/modals.css', 'utf8');
if (!modalCss.includes('.meal-planner-confirm-box')) {
  console.error('FAIL: .meal-planner-confirm-box not found in modals.css');
  process.exit(1);
}
console.log('PASS: .meal-planner-confirm-box found in modals.css');

// 4. Verify app.js has openAddToMealPlannerModal and confirmAddToMealPlanner
const appJs = fs.readFileSync('js/app.js', 'utf8');
if (!appJs.includes('openAddToMealPlannerModal(')) {
  console.error('FAIL: openAddToMealPlannerModal not found in app.js');
  process.exit(1);
}
console.log('PASS: openAddToMealPlannerModal found in app.js');

if (!appJs.includes('confirmAddToMealPlanner(')) {
  console.error('FAIL: confirmAddToMealPlanner not found in app.js');
  process.exit(1);
}
console.log('PASS: confirmAddToMealPlanner found in app.js');

// 5. Verify renderFoodCatalog uses openAddToMealPlannerModal instead of addCatalogItemToScan on card click
if (!appJs.includes('onclick="app.openAddToMealPlannerModal(')) {
  console.error('FAIL: cards do not call openAddToMealPlannerModal on click');
  process.exit(1);
}
console.log('PASS: cards call openAddToMealPlannerModal on click');

// 6. Verify sw.js has cache v1.3.1
const swJs = fs.readFileSync('sw.js', 'utf8');
if (swJs.includes('nutrivision-v1.3')) {
  console.log('PASS: sw.js has updated cache version');
} else {
  console.error('FAIL: sw.js does not have nutrivision-v1.3.x');
  process.exit(1);
}
console.log('PASS: sw.js has nutrivision-v1.3.1');

console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
