const fs = require('fs');
const assert = require('assert');

// Simple DOM Mock for verification
class MockElement {
  constructor(tag, id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className ? className.split(' ').filter(Boolean) : []),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c) => {
        if (this.classList._classes.has(c)) {
          this.classList._classes.delete(c);
          return false;
        } else {
          this.classList._classes.add(c);
          return true;
        }
      }
    };
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.attributes = {};
  }

  getAttribute(attr) {
    return this.attributes[attr];
  }

  setAttribute(attr, val) {
    this.attributes[attr] = val;
  }

  querySelector(selector) {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.children.find(c => c.classList.contains(cls)) || null;
    }
    return null;
  }
}

global.document = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = new MockElement('div', id);
    }
    return this.elements[id];
  },
  querySelectorAll(sel) {
    if (sel.includes('#planner-symptom-chips .symptom-chip')) {
      return this.chips || [];
    }
    return [];
  }
};

const mockUserProfile = {
  name: 'Test Patient',
  contact: 'patient@example.com',
  restrictions: ''
};

global.window = {
  i18n: {
    getLanguage: () => 'id'
  },
  app: {
    userProfile: mockUserProfile,
    saveUserProfile: () => {
      // Mock save
    },
    showToast: (msg) => {
      console.log('  [Toast]:', msg);
    },
    requireAuth: (cb) => {
      cb();
      return true;
    }
  }
};

// Setup symptom filter agent
const { clinicalNutritionFilterAgent } = require('../js/symptom_filter_agent.js');
global.clinicalNutritionFilterAgent = clinicalNutritionFilterAgent;

global.NUTRIVISION_DATA = {
  mealPlans: {
    standar: [
      {
        name: 'Bubur Ayam Telur Halus',
        macro: '24g Protein · 380 kkal',
        suitableFor: 'Pasca-operasi',
        badge: 'Tinggi Protein',
        price: 'Rp 15.000'
      },
      {
        name: 'Sup Tahu Brokoli Kukus',
        macro: '18g Protein · 320 kkal',
        suitableFor: 'Serat Lembut',
        badge: 'Pencernaan',
        price: 'Rp 12.000'
      }
    ],
    hemat: []
  }
};

// Load planner.js
const plannerCode = fs.readFileSync('js/planner.js', 'utf8');
eval(plannerCode + '\nglobal.mealPlanner = mealPlanner;');

console.log('=== TEST 1: Initial Empty Restrictions State ===');
assert.strictEqual(mealPlanner.customRestrictions.size, 0, 'Initially 0 restrictions');
mealPlanner.renderRestrictionsUI();
const activeBox = document.getElementById('symptom-restr-active-box');
const badge = document.getElementById('symptom-restr-count-badge');
assert(activeBox.innerHTML.includes('symptom-restr-empty'), 'Shows empty state in active box');
assert.strictEqual(badge.textContent, '0 pantangan', 'Badge displays 0 pantangan');
console.log('>> PASS: Initial state clean & empty.');

console.log('\n=== TEST 2: Adding Restrictions Directly (+ Tambah) ===');
mealPlanner.addCustomRestriction('Udang / Seafood');
assert.strictEqual(mealPlanner.customRestrictions.size, 1, 'Set now has 1 restriction');
assert(mealPlanner.customRestrictions.has('Udang / Seafood'), 'Has Udang / Seafood');
assert.strictEqual(window.app.userProfile.restrictions, 'Udang / Seafood', 'userProfile.restrictions synced');
assert.strictEqual(badge.textContent, '1 pantangan', 'Badge updated to 1 pantangan');
assert(activeBox.innerHTML.includes('Udang / Seafood'), 'Active box contains Udang / Seafood chip');
assert(activeBox.innerHTML.includes('btn-remove-restr'), 'Active chip has remove button (x)');
console.log('>> PASS: Custom restriction added and synchronized to userProfile.');

console.log('\n=== TEST 3: Adding Via Input Field (addCustomRestrictionFromInput) ===');
const inputElem = document.getElementById('symptom-restriction-input');
inputElem.value = 'Gluten';
mealPlanner.addCustomRestrictionFromInput();
assert.strictEqual(mealPlanner.customRestrictions.size, 2, 'Set now has 2 restrictions');
assert(mealPlanner.customRestrictions.has('Gluten'), 'Has Gluten');
assert.strictEqual(inputElem.value, '', 'Input cleared after addition');
assert.strictEqual(badge.textContent, '2 pantangan', 'Badge updated to 2 pantangan');
console.log('>> PASS: Input submission works and resets input field.');

console.log('\n=== TEST 4: Toggling Quick Suggestion Chips ===');
// Toggle Telur on
mealPlanner.toggleQuickRestriction('Telur');
assert.strictEqual(mealPlanner.customRestrictions.size, 3, 'Set now has 3 restrictions');
assert(mealPlanner.customRestrictions.has('Telur'), 'Has Telur');
assert(window.app.userProfile.restrictions.includes('Telur'), 'userProfile includes Telur');

// Toggle Telur off (should remove it)
mealPlanner.toggleQuickRestriction('Telur');
assert.strictEqual(mealPlanner.customRestrictions.size, 2, 'Set back to 2 restrictions');
assert(!mealPlanner.customRestrictions.has('Telur'), 'Telur removed by toggle');
console.log('>> PASS: Quick suggestion toggle successfully adds and removes items.');

console.log('\n=== TEST 5: Removing Single Restriction (Kurang via x button) ===');
mealPlanner.removeCustomRestriction('Gluten');
assert.strictEqual(mealPlanner.customRestrictions.size, 1, 'Only 1 restriction remains');
assert(!mealPlanner.customRestrictions.has('Gluten'), 'Gluten removed');
assert.strictEqual(window.app.userProfile.restrictions, 'Udang / Seafood', 'userProfile updated to only Udang');
console.log('>> PASS: Individual removal works smoothly.');

console.log('\n=== TEST 6: Meal Plan Restriction Conflict Check & Warning ===');
// Add 'Telur' back to test menu flagging
mealPlanner.addCustomRestriction('Telur');
const match = mealPlanner._checkMealRestriction('Bubur Ayam Telur Halus', 'Tinggi protein');
assert.strictEqual(match, 'Telur', 'Correctly flags Telur in Bubur Ayam Telur Halus');

const nonMatch = mealPlanner._checkMealRestriction('Sup Tahu Brokoli Kukus', 'Serat Lembut');
assert.strictEqual(nonMatch, null, 'No flag on dish without restricted ingredients');

// Render planner and verify warning badge in HTML
const container1 = document.getElementById('meal-plan-list');
mealPlanner.renderPlanner();
assert(container1.innerHTML.includes('meal-plan-item-warning'), 'Meal item has warning class');
assert(container1.innerHTML.includes('restr-warning-badge'), 'Meal item renders restriction warning badge');
console.log('>> PASS: Meal planner detects and visually flags dishes containing restricted ingredients!');

console.log('\n=== TEST 7: AI Agent Ingestion of Custom Restrictions ===');
const agentResult = clinicalNutritionFilterAgent.process(['dysphagia'], ['Udang / Seafood', 'Telur']);
assert(agentResult.restricted_ingredients.includes('Udang / Seafood'), 'Agent output includes Udang / Seafood');
assert(agentResult.restricted_ingredients.includes('Telur'), 'Agent output includes Telur');
assert(agentResult.safety_level === 'High', 'Safety level still High for dysphagia');
console.log('>> PASS: ClinicalNutritionFilterAgent processes custom restrictions into restricted_ingredients!');

console.log('\n=== TEST 8: Clear All Restrictions (Hapus Semua) ===');
mealPlanner.clearAllRestrictions();
assert.strictEqual(mealPlanner.customRestrictions.size, 0, 'Set cleared to 0');
assert.strictEqual(window.app.userProfile.restrictions, '', 'userProfile.restrictions is empty');
assert.strictEqual(badge.textContent, '0 pantangan', 'Badge displays 0 pantangan');
assert(activeBox.innerHTML.includes('symptom-restr-empty'), 'Active box returns to empty state');
console.log('>> PASS: Clear all resets state and syncs profile.');

console.log('\n=============================================================');
console.log('🎉 ALL RESTRICTIONS INTERACTION TESTS COMPLETED SUCCESSFULLY! 🎉');
console.log('=============================================================');
