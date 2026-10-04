const fs = require('fs');

// Load files
const dataCode = fs.readFileSync('frontend/js/data.js', 'utf8');
const appCode = fs.readFileSync('frontend/js/app.js', 'utf8');

// Mock DOM
class MockElement {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.dataset = {};
    this.classList = {
      toggle: () => {},
      add: () => {},
      remove: () => {}
    };
    this.children = [];
  }
  querySelectorAll(sel) {
    return [];
  }
  querySelector(sel) {
    return null;
  }
  setAttribute() {}
  getAttribute() {}
}

const elements = {
  'journey-taxonomy-info-banner': new MockElement('journey-taxonomy-info-banner'),
  'journey-timeline-grid': new MockElement('journey-timeline-grid'),
  'journey-category-dropdown': new MockElement('journey-category-dropdown'),
  'optgroup-med': new MockElement('optgroup-med'),
  'optgroup-fit': new MockElement('optgroup-fit'),
  'journey-btn-group-med': new MockElement('journey-btn-group-med'),
  'journey-btn-group-fit': new MockElement('journey-btn-group-fit'),
  'journey-roadmap-sub': new MockElement('journey-roadmap-sub'),
  'journey-active-badge-text': new MockElement('journey-active-badge-text')
};

global.document = {
  getElementById: (id) => elements[id] || new MockElement(id),
  querySelectorAll: () => [],
  addEventListener: () => {}
};

global.localStorage = {
  store: {},
  getItem: (k) => global.localStorage.store[k] || null,
  setItem: (k, v) => { global.localStorage.store[k] = String(v); },
  removeItem: (k) => { delete global.localStorage.store[k]; },
  clear: () => { global.localStorage.store = {}; }
};

global.location = {
  search: '',
  pathname: '/'
};

global.window = {
  i18n: {
    lang: 'en',
    getLanguage: () => global.window.i18n.lang
  },
  lucide: {
    createIcons: () => {}
  },
  localStorage: global.localStorage,
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Evaluate data
const fnData = new Function(dataCode + '\nreturn NUTRIVISION_DATA;');
global.NUTRIVISION_DATA = fnData();

// Evaluate app
const NutriVisionAppClass = new Function(appCode + '\nreturn NutriVisionApp;')();
const app = new NutriVisionAppClass();

console.log('Testing Recovery Roadmap English vs Indonesian Output...');

// Test all 12 categories
const categories = [
  'post_op_digestive', 'post_op_oncology', 'post_op_burns', 'post_op_bariatric',
  'post_op_orthopedic', 'post_op_cardio', 'post_op_geriatric',
  'gym_hypertrophy', 'gym_powerlifting', 'gym_endurance', 'gym_recomp', 'gym_high_volume'
];

let hasError = false;

// Indonesian terms that shouldn't appear in English mode
const indoForbidden = [
  'Fase 1', 'Fase 2', 'Fase 3', 'Hari ', 'Minggu ', 'Bulan ',
  'Cair jernih', 'Lunak tim', 'Padat lunak', 'kaldu saring', 'puree halus',
  'Diet cair', 'Makanan lunak', 'Pengenalan serat',
  'Target Tercapai', 'Target Protein:', 'Tekstur Pangan:', 'g/kgBB', 'per hari',
  'Nutrisi Kunci:', 'Sumber API:'
];

for (const cat of categories) {
  // Test English
  global.window.i18n.lang = 'en';
  app.renderJourneyRoadmap(cat);
  app.renderJourneyTaxonomyInfoBanner(cat);
  
  const htmlEn = elements['journey-timeline-grid'].innerHTML + ' ' + elements['journey-taxonomy-info-banner'].innerHTML;
  
  for (const word of indoForbidden) {
    if (htmlEn.includes(word)) {
      console.error(`[FAIL EN] Category "${cat}" contains Indonesian term: "${word}"`);
      hasError = true;
    }
  }

  // Test Indonesian
  global.window.i18n.lang = 'id';
  app.renderJourneyRoadmap(cat);
  app.renderJourneyTaxonomyInfoBanner(cat);
  const htmlId = elements['journey-timeline-grid'].innerHTML + ' ' + elements['journey-taxonomy-info-banner'].innerHTML;
  
  const engForbidden = [
    'Phase 1', 'Phase 2', 'Phase 3',
    'Target Achieved', 'Protein Target:', 'Food Texture:', 'g/kg BW', 'per day',
    'Key Nutrients:', 'API Sources:'
  ];
  
  for (const word of engForbidden) {
    if (htmlId.includes(word)) {
      console.error(`[FAIL ID] Category "${cat}" contains English term: "${word}"`);
      hasError = true;
    }
  }
}

if (!hasError) {
  console.log('✅ ALL 12 CATEGORIES PASSED 100% CLEAN LOCALIZATION TEST (NO MIXED TEXT)!');
} else {
  process.exit(1);
}
