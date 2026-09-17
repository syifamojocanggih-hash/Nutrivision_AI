const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Testing Dietary Restrictions Modal & Swaps Matrix ---');

// 1. Check index.html contains modal container
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('id="modal-restrictions-recommendations"'), 'index.html must contain modal-restrictions-recommendations');
assert(html.includes('id="restrictions-recommendations-modal-body"'), 'index.html must contain restrictions-recommendations-modal-body');
console.log('✓ index.html modal container verified.');

// 2. Mock browser environment for planner.js
global.window = {
  i18n: { getLanguage: () => 'id' },
  lucide: { createIcons: () => {} },
  addEventListener: () => {},
  app: {
    journeyCondition: 'post-surgery',
    showToast: (msg) => console.log('Toast:', msg),
    customDailySchedules: [],
    userDailyMealPlans: [],
    saveCustomDailySchedules: () => {},
    saveUserDailyMealPlans: () => {}
  }
};
global.document = {
  getElementById: (id) => {
    return {
      id: id,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      style: {},
      innerHTML: '',
      querySelectorAll: () => [],
      querySelector: () => null,
      scrollIntoView: () => {},
      focus: () => {}
    };
  },
  querySelectorAll: () => []
};

// 3. Load planner.js
require('../js/planner.js');
const planner = global.mealPlanner;
assert(planner, 'mealPlanner must exist');

// 4. Test getFoodSubstitutions
const customList = ['Gorengan', 'Santan Pekat', 'Susu & Laktosa', 'Gluten', 'Pepaya'];
const symptoms = ['dysphagia', 'nausea'];
const swaps = planner.getFoodSubstitutions(customList, symptoms);

console.log(`✓ Generated ${swaps.length} food substitutions.`);
assert(swaps.length >= 5, 'Must generate at least 5 swaps for the 5 restrictions');

const avoidGorengan = swaps.find(s => s.restrictionName === 'Gorengan');
assert(avoidGorengan, 'Gorengan swap must exist');
console.log('Gorengan swap replacement:', avoidGorengan.replaceWith);
assert(avoidGorengan.replaceWith.includes('kukus') || avoidGorengan.replaceWith.includes('steamed'), 'Gorengan replacement should recommend kukus/steamed');

const avoidSantan = swaps.find(s => s.restrictionName === 'Santan Pekat');
assert(avoidSantan, 'Santan swap must exist');
console.log('Santan swap replacement:', avoidSantan.replaceWith);
assert(avoidSantan.replaceWith.includes('kaldu') || avoidSantan.replaceWith.includes('oat') || avoidSantan.replaceWith.includes('almond'), 'Santan replacement should recommend kaldu/oat/almond');

const avoidPepaya = swaps.find(s => s.restrictionName === 'Pepaya');
assert(avoidPepaya, 'Pepaya swap must exist');
console.log('Pepaya swap replacement:', avoidPepaya.replaceWith);
assert(avoidPepaya.replaceWith.includes('buah naga') || avoidPepaya.replaceWith.includes('pir kukus'), 'Pepaya replacement should recommend buah naga/pir');

// 5. Test modal open & render content
let modalBodyContent = '';
const mockModalBody = {
  innerHTML: '',
  set innerHTML(val) { modalBodyContent = val; },
  get innerHTML() { return modalBodyContent; }
};
const mockModal = {
  id: 'modal-restrictions-recommendations',
  classList: {
    classes: new Set(),
    add(cls) { this.classes.add(cls); },
    remove(cls) { this.classes.delete(cls); },
    contains(cls) { return this.classes.has(cls); }
  },
  style: {}
};

global.document.getElementById = (id) => {
  if (id === 'restrictions-recommendations-modal-body') return mockModalBody;
  if (id === 'modal-restrictions-recommendations') return mockModal;
  return {
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {} }
  };
};

planner.customRestrictions.clear();
customList.forEach(r => planner.customRestrictions.add(r));
planner.openRestrictionsRecommendationModal();

assert(mockModal.classList.contains('open'), 'Modal must have class "open" after openRestrictionsRecommendationModal()');
assert(modalBodyContent.includes('Panduan Pantangan & Rekomendasi Solusi Makanan'), 'Modal body must contain title');
assert(modalBodyContent.includes('Gorengan'), 'Modal body must contain Gorengan badge or swap');
assert(modalBodyContent.includes('Santan Pekat'), 'Modal body must contain Santan Pekat');
assert(modalBodyContent.includes('Pepaya'), 'Modal body must contain Pepaya');
console.log('✓ Modal opened and rendered content successfully.');

planner.closeRestrictionsRecommendationModal();
assert(!mockModal.classList.contains('open'), 'Modal must not have class "open" after closeRestrictionsRecommendationModal()');
console.log('✓ Modal closed successfully.');

console.log('\nALL TESTS PASSED SUCCESSFULLY! 🚀');
