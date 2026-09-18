const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Load index.html and verify static markup
console.log('=== TEST 1: Verifying data-i18n attributes in index.html ===');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const requiredI18nAttributes = [
  'data-i18n="ov_card2_calibrate_btn"',
  'data-i18n="ov_card3_title"',
  'data-i18n="ov_card3_sub"',
  'data-i18n="budget_label_quota"',
  'data-i18n="budget_tag_idr"',
  'data-i18n="budget_label_period"',
  'data-i18n="budget_dur_7_opt"',
  'data-i18n="budget_dur_30_opt"',
  'data-i18n="budget_label_region"',
  'data-i18n="budget_region_calibrated"',
  'data-i18n="budget_btn_update"',
  'data-i18n="budget_empty_heading"',
  'data-i18n="budget_empty_desc"',
  'data-i18n="budget_preset_quick_7"',
  'data-i18n="budget_preset_quick_30"',
  'data-i18n="budget_kpi_daily_lbl"',
  'data-i18n="budget_kpi_daily_sub"',
  'data-i18n="budget_kpi_total_lbl"',
  'data-i18n="budget_kpi_savings_lbl"',
  'data-i18n="budget_kpi_safe_rem"',
  'data-i18n="budget_kpi_prot_lbl"',
  'data-i18n="budget_kpi_prot_sub"',
  'data-i18n="budget_sched_lbl"',
  'data-i18n="budget_btn_print"',
  'data-i18n="budget_simrs_notice"',
  'data-i18n="budget_btn_log_patient"',
  'data-i18n="budget_evidence_title"',
  'data-i18n="budget_evidence_body"',
  'data-i18n="symp_dysphagia"',
  'data-i18n="symp_nausea"',
  'data-i18n="symp_gerd"',
  'data-i18n="symp_diarrhea"',
  'data-i18n="symp_constipation"',
  'data-i18n="symp_low_appetite"',
  'data-i18n="budget_modal_close"',
  'data-i18n="budget_btn_copy_grocery"'
];

requiredI18nAttributes.forEach(attr => {
  if (!html.includes(attr)) {
    throw new Error(`Missing ${attr} in index.html!`);
  }
});
console.log(`>> PASS: All ${requiredI18nAttributes.length} data-i18n attributes confirmed present in index.html!`);

// 2. Setup mock DOM environment
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
    this.style = {};
    this.attributes = {};
  }
  getAttribute(attr) { return this.attributes[attr] || null; }
  setAttribute(attr, val) { this.attributes[attr] = val; }
  querySelector(sel) {
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      return this.children.find(c => c.classList.contains(cls)) || null;
    }
    if (sel === 'span:not(.symptom-chip-icon)') {
      return this.children.find(c => !c.classList.contains('symptom-chip-icon')) || null;
    }
    if (sel === '.symptom-chip-icon') {
      return this.children.find(c => c.classList.contains('symptom-chip-icon')) || null;
    }
    if (sel.includes('option[value="7"]')) {
      return this.opt7 || new MockElement('option');
    }
    if (sel.includes('option[value="30"]')) {
      return this.opt30 || new MockElement('option');
    }
    return null;
  }
  querySelectorAll(sel) {
    return this.children;
  }
}

const mockDocElements = {};
global.document = {
  documentElement: { lang: 'en' },
  getElementById(id) {
    if (!mockDocElements[id]) {
      mockDocElements[id] = new MockElement('div', id);
    }
    return mockDocElements[id];
  },
  querySelectorAll(sel) {
    if (sel === '[data-i18n]') {
      return this.i18nElements || [];
    }
    if (sel === '#planner-symptom-chips .symptom-chip') {
      return this.chips || [];
    }
    return [];
  }
};

global.window = {
  app: {
    showToast: (msg) => { console.log('[Toast]:', msg); },
    requireAuth: (cb) => cb(),
    userProfile: { targets: {} }
  },
  lucide: { createIcons: () => {} },
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = v; }
  }
};
global.localStorage = global.window.localStorage;
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };

// Load i18n
eval(fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8'));
assert(window.i18n, 'window.i18n must exist');

console.log('\n=== TEST 2: Testing i18n Dictionary in English ===');
window.i18n.setLanguage('en', false);

// Check Callout Box Translations
const enTitle = window.i18n.t('budget_evidence_title');
const enBody = window.i18n.t('budget_evidence_body');
console.log('EN Evidence Title:', enTitle);
console.log('EN Evidence Body:', enBody);
assert.strictEqual(enTitle, 'Evidence-Based Cost-Effective Recovery Tips:');
assert(enBody.includes('Boiled eggs and steamed tempeh provide protein bioavailability'));
assert(!enBody.includes('Telur rebus'));

// Check Budget Toolbar & Cards Translations
assert.strictEqual(window.i18n.t('budget_label_quota'), 'Patient Budget Quota');
assert.strictEqual(window.i18n.t('budget_label_period'), 'Planning Period');
assert.strictEqual(window.i18n.t('budget_label_region'), 'Bapanas Price Region');
assert.strictEqual(window.i18n.t('budget_region_calibrated'), 'Calibrated');
assert.strictEqual(window.i18n.t('budget_btn_update'), 'Update Menu');
assert.strictEqual(window.i18n.t('budget_kpi_daily_lbl'), 'Daily Allocation');
assert.strictEqual(window.i18n.t('budget_kpi_savings_lbl'), 'Budget Efficiency');
assert.strictEqual(window.i18n.t('budget_sched_lbl'), 'Schedule:');
assert.strictEqual(window.i18n.t('budget_btn_print'), 'Print Nutrition Plan');
assert.strictEqual(window.i18n.t('budget_simrs_notice'), 'Connected to Patient SIMRS #RM-2825-098');
assert.strictEqual(window.i18n.t('budget_btn_log_patient'), 'Log to Patient Intake Record');
console.log('>> PASS: All budget & evidence translation keys return valid English text!');

// 3. Test Budget Planner English Rendering
console.log('\n=== TEST 3: Testing Budget Planner English Rendering ===');
// Load budget planner
eval(fs.readFileSync(path.join(__dirname, '../js/budget_planner.js'), 'utf8'));
const bp = window.budgetPlanner;
bp.budgetAmount = 200000;
bp.durationDays = 7;
bp.isPlanGenerated = true;

// Setup mock select element with options
const durSelect = document.getElementById('budget-select-duration');
durSelect.opt7 = new MockElement('option');
durSelect.opt7.value = '7';
durSelect.opt30 = new MockElement('option');
durSelect.opt30.value = '30';

bp.generatePlan();
bp.render();

const kpiDailyText = document.getElementById('budget-kpi-daily-quota').textContent;
const kpiSavingsText = document.getElementById('budget-kpi-savings').textContent;
const kpiProtText = document.getElementById('budget-kpi-avg-protein').textContent;
const schedTotalText = document.getElementById('budget-schedule-total').textContent;
const regionBadgeText = document.getElementById('budget-region-badge').textContent;
const durTagText = document.getElementById('budget-selected-duration-tag').textContent;
const groceryBtnText = document.getElementById('budget-btn-grocery-text').textContent;

console.log('KPI Daily text:', kpiDailyText);
console.log('KPI Savings text:', kpiSavingsText);
console.log('KPI Prot text:', kpiProtText);
console.log('Schedule Total text:', schedTotalText);
console.log('Region Badge text:', regionBadgeText);
console.log('Duration Tag text:', durTagText);
console.log('Grocery Btn text:', groceryBtnText);
console.log('Opt7 text:', durSelect.opt7.textContent);
console.log('Opt30 text:', durSelect.opt30.textContent);

assert(kpiDailyText.includes('day'), 'KPI Daily must include day');
assert(!kpiDailyText.includes('hari'), 'KPI Daily must not include hari');
assert(kpiSavingsText.includes('Saved') && !kpiSavingsText.includes('Hemat'), 'KPI Savings must use Saved');
assert(kpiProtText.includes('day') && !kpiProtText.includes('hari'), 'KPI Protein must use day');
assert(schedTotalText.includes('kcal') && !schedTotalText.includes('kkal'), 'Schedule total must use kcal');
assert.strictEqual(regionBadgeText, 'Calibrated', 'Region badge must be Calibrated');
assert(durTagText.includes('Selected:') && !durTagText.includes('Terpilih:'), 'Duration tag must be English');
assert(groceryBtnText.includes('Grocery Shopping List'), 'Grocery button must be English');
assert(durSelect.opt7.textContent.includes('1 Week (7 Days)'), 'Option 7 must be English');
assert(durSelect.opt30.textContent.includes('1 Month (30 Days)'), 'Option 30 must be English');

// Check Breakfast, Lunch, Dinner cards
const bfCard = document.getElementById('meal-card-breakfast');
const luCard = document.getElementById('meal-card-lunch');
const diCard = document.getElementById('meal-card-dinner');

console.log('\nBreakfast Card HTML:\n', bfCard.innerHTML);
assert(bfCard.innerHTML.includes('Breakfast • 07:00'), 'Breakfast card must have English time header');
assert(bfCard.innerHTML.includes('Focus: '), 'Breakfast card must have Focus:');
assert(!bfCard.innerHTML.includes('Fokus: '), 'Breakfast card must NOT have Fokus:');
assert(bfCard.innerHTML.includes('Swap Alternative'), 'Breakfast card must have Swap Alternative');
assert(!bfCard.innerHTML.includes('Ganti Alternatif'), 'Breakfast card must NOT have Ganti Alternatif');
assert(bfCard.innerHTML.includes('kcal'), 'Breakfast card must have kcal');
assert(!bfCard.innerHTML.includes('kkal'), 'Breakfast card must NOT have kkal');

assert(luCard.innerHTML.includes('Lunch • 12:30'), 'Lunch card must have English header');
assert(luCard.innerHTML.includes('Focus: '), 'Lunch card must have Focus:');
assert(diCard.innerHTML.includes('Dinner • 18:30'), 'Dinner card must have English header');
assert(diCard.innerHTML.includes('Focus: '), 'Dinner card must have Focus:');
console.log('>> PASS: Budget planner rendered 100% in English with zero Indonesian leaks!');

// 4. Test Symptom Filter & Agent English Output
console.log('\n=== TEST 4: Testing Symptom Filter & Agent English Output ===');
global.NUTRIVISION_DATA = { mealPlans: { standar: [], hemat: [] } };
global.window.NUTRIVISION_DATA = global.NUTRIVISION_DATA;
eval(fs.readFileSync(path.join(__dirname, '../js/symptom_filter_agent.js'), 'utf8'));

// Prepare mock chips
const mockChips = [
  new MockElement('button', '', 'symptom-chip active'),
  new MockElement('button', '', 'symptom-chip active'),
  new MockElement('button', '', 'symptom-chip'),
  new MockElement('button', '', 'symptom-chip active')
];
mockChips[0].setAttribute('data-symptom', 'dysphagia');
mockChips[0].children = [
  new MockElement('span', '', 'symptom-chip-icon'),
  new MockElement('span', '', '')
];
mockChips[1].setAttribute('data-symptom', 'nausea');
mockChips[1].children = [
  new MockElement('span', '', 'symptom-chip-icon'),
  new MockElement('span', '', '')
];
mockChips[2].setAttribute('data-symptom', 'gerd');
mockChips[2].children = [
  new MockElement('span', '', 'symptom-chip-icon'),
  new MockElement('span', '', '')
];
mockChips[3].setAttribute('data-symptom', 'constipation');
mockChips[3].children = [
  new MockElement('span', '', 'symptom-chip-icon'),
  new MockElement('span', '', '')
];
document.chips = mockChips;

eval(fs.readFileSync(path.join(__dirname, '../js/planner.js'), 'utf8'));
const mp = window.mealPlanner;
mp.activeSymptoms = new Set(['dysphagia', 'nausea', 'constipation']);
mp.syncChipUI();

// Verify chips and badge text
const badgeText = document.getElementById('symptom-active-count-badge').textContent;
console.log('Symptom badge text in English:', badgeText);
assert.strictEqual(badgeText, '3 active');
console.log('Dysphagia chip label:', mockChips[0].children[1].textContent);
assert.strictEqual(mockChips[0].children[1].textContent, 'Difficulty Swallowing (Dysphagia)');
console.log('GERD chip label:', mockChips[2].children[1].textContent);
assert.strictEqual(mockChips[2].children[1].textContent, 'GERD / Acid Reflux');

// Render symptom result
mp.renderSymptomFilter();
const resBoxHtml = document.getElementById('symptom-result-box').innerHTML;
console.log('\nSymptom Result Box HTML Sample:\n', resBoxHtml.substring(0, 400) + '...');

assert(resBoxHtml.includes('IDDSI Level 4 Safety Standard'), 'Must contain English IDDSI Level 4 Safety Standard');
assert(resBoxHtml.includes('Smooth Ripe Papaya Puree'), 'Must contain English meal title Smooth Ripe Papaya Puree');
assert(resBoxHtml.includes('Strained Snakehead Fish Porridge'), 'Must contain English meal title Strained Snakehead Fish Porridge');
assert(resBoxHtml.includes('kcal'), 'Must contain kcal');
assert(!resBoxHtml.includes('kkal'), 'Must NOT contain kkal');
assert(resBoxHtml.includes('Reset Selection'), 'Must contain Reset Selection');
assert(resBoxHtml.includes('Apply to Patient Menu'), 'Must contain Apply to Patient Menu');
assert(!resBoxHtml.includes('Standar Keamanan IDDSI'), 'Must NOT contain Standar Keamanan IDDSI');
assert(!resBoxHtml.includes('Pantangan Otomatis'), 'Must NOT contain Pantangan Otomatis');
assert(!resBoxHtml.includes('Reset Pilihan'), 'Must NOT contain Reset Pilihan');
assert(!resBoxHtml.includes('Terapkan ke Menu Pasien'), 'Must NOT contain Terapkan ke Menu Pasien');

console.log('>> PASS: Symptom filter rendered 100% in English with zero Indonesian leaks!');

console.log('\n=============================================================');
console.log('🎉 ALL ENGLISH LOCALIZATION VALIDATIONS COMPLETED SUCCESSFULLY! 🎉');
console.log('=============================================================');
