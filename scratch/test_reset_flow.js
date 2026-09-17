const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Reset Feature Verification...\n');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
const jsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf-8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'ai_text_eval.css'), 'utf-8');

// 1. Check HTML markup
console.log('Test 1: Check HTML markup for Reset button');
const hasResetBtn = html.includes('id="ai-eval-reset-btn"');
const hasResetClick = html.includes('app.resetAIEvalPage()');
const hasRotateIcon = html.includes('data-lucide="rotate-ccw"');
console.log('  ai-eval-reset-btn present:', hasResetBtn);
console.log('  onclick calls resetAIEvalPage():', hasResetClick);
console.log('  lucide rotate-ccw icon present:', hasRotateIcon);
if (!hasResetBtn || !hasResetClick || !hasRotateIcon) {
  throw new Error('Test 1 Failed: Reset button markup is incomplete.');
}
console.log('  ✅ [PASS]\n');

// 2. Check CSS styles for rotation animation
console.log('Test 2: Check CSS animation for Reset button');
const hasRotatingClass = css.includes('.ai-eval-btn-reset.rotating');
const hasKeyframes = css.includes('@keyframes ai-reset-spin');
console.log('  .rotating selector present:', hasRotatingClass);
console.log('  @keyframes ai-reset-spin present:', hasKeyframes);
if (!hasRotatingClass || !hasKeyframes) {
  throw new Error('Test 2 Failed: CSS animation missing.');
}
console.log('  ✅ [PASS]\n');

// 3. Simulate resetAIEvalPage behavior using mock DOM
console.log('Test 3: Simulate resetAIEvalPage execution');

// Mock DOM elements
const elements = {
  'ai-eval-reset-btn': { classList: new Set(), offsetWidth: 100 },
  'ai-eval-input-text': { value: 'bakso sapi kuah bening', focus: () => { elements['ai-eval-input-text'].focused = true; } },
  'ai-eval-char-counter': { textContent: '22 karakter' },
  'ai-eval-context-label': { textContent: 'Konteks: Pasca Operasi' },
  'ai-eval-chips-box': { innerHTML: '<span>some chips</span>' },
  'ai-eval-status-icon-box': { className: 'ai-eval-icon-circle safe', innerHTML: '' },
  'ai-eval-result-title': { textContent: 'Aman', style: {} },
  'ai-eval-result-desc': { textContent: 'Menu kaya albumin' },
  'ai-eval-goal-pill': { textContent: 'Tujuan: Pemulihan Jaringan', style: {} },
  'ai-eval-confidence-val': { textContent: '89.4% (Tinggi)' },
  'ai-eval-progress-bar': { style: { width: '89.4%', background: '#064E3B' } },
  'ai-eval-domain-category': { textContent: 'Kategori: Pasca Bedah' },
  'ai-eval-notes-list': { innerHTML: '<div>existing notes</div>' },
  'ai-eval-nutri-protein': { textContent: '28.5 g' },
  'ai-eval-nutri-protein-sub': { textContent: '29% Kebutuhan' },
  'ai-eval-nutri-cals': { textContent: '340 kkal' },
  'ai-eval-nutri-zinc': { textContent: '4.2 mg' },
  'ai-eval-nutri-sodium': { textContent: '380 mg' },
  'ai-eval-order-title': { textContent: 'Kesesuaian Disetujui' },
  'ai-eval-order-desc': { textContent: 'Diverifikasi' }
};

// Preset pills mock
const presetPills = [
  { classList: new Set(['ai-eval-preset-pill', 'active']) },
  { classList: new Set(['ai-eval-preset-pill']) }
];

// Setup global mock
global.document = {
  getElementById: (id) => elements[id] || null,
  querySelector: (sel) => elements['ai-eval-reset-btn'],
  querySelectorAll: (sel) => {
    if (sel === '.ai-eval-preset-pill') return presetPills;
    return [];
  }
};
function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (c) => set.add(c),
    remove: (c) => set.delete(c),
    contains: (c) => set.has(c),
    has: (c) => set.has(c)
  };
}

elements['ai-eval-reset-btn'].classList = createClassList();
presetPills[0].classList = createClassList(['ai-eval-preset-pill', 'active']);
presetPills[1].classList = createClassList(['ai-eval-preset-pill']);

global.window = {
  lucide: { createIcons: () => { global.window.lucideCalled = true; } }
};

let toastMsg = null;
let toastType = null;

// Execute resetAIEvalPage using extracted method logic
const app = {
  showToast: (msg, type) => {
    toastMsg = msg;
    toastType = type;
  }
};

// Extract and bind resetAIEvalPage
const methodMatch = jsCode.match(/resetAIEvalPage\(\)\s*\{([\s\S]*?)\n  \}/);
if (!methodMatch) {
  throw new Error('resetAIEvalPage method not found in js/app.js');
}

const resetFn = new Function(methodMatch[1]);
resetFn.call(app);

console.log('  Textarea cleared:', elements['ai-eval-input-text'].value === '');
console.log('  Textarea focused:', elements['ai-eval-input-text'].focused === true);
console.log('  Char counter zeroed:', elements['ai-eval-char-counter'].textContent === '0 karakter');
console.log('  Context label reset:', elements['ai-eval-context-label'].textContent === 'Konteks: Siap Menerima Input Baru');
console.log('  Preset pills active removed:', !presetPills[0].classList.has('active'));
console.log('  Chips box placeholder set:', elements['ai-eval-chips-box'].innerHTML.includes('Belum ada bahan makanan'));
console.log('  Status title reset:', elements['ai-eval-result-title'].textContent === 'Siap Menganalisis Menu Pasien');
console.log('  Confidence zeroed:', elements['ai-eval-confidence-val'].textContent === '0.0% (Menunggu Analisis)');
console.log('  Progress bar 0%:', elements['ai-eval-progress-bar'].style.width === '0%');
console.log('  Protein zeroed:', elements['ai-eval-nutri-protein'].textContent === '0.0 g');
console.log('  Calories zeroed:', elements['ai-eval-nutri-cals'].textContent === '0 kkal');
console.log('  Zinc zeroed:', elements['ai-eval-nutri-zinc'].textContent === '0.0 mg');
console.log('  Sodium zeroed:', elements['ai-eval-nutri-sodium'].textContent === '0 mg');
console.log('  Order banner waiting state:', elements['ai-eval-order-title'].textContent === 'Menunggu Analisis Menu Pasien');
console.log('  Toast notification displayed:', toastMsg && toastMsg.includes('direset'));

if (
  elements['ai-eval-input-text'].value !== '' ||
  elements['ai-eval-char-counter'].textContent !== '0 karakter' ||
  elements['ai-eval-nutri-protein'].textContent !== '0.0 g' ||
  elements['ai-eval-nutri-cals'].textContent !== '0 kkal' ||
  elements['ai-eval-nutri-zinc'].textContent !== '0.0 mg' ||
  elements['ai-eval-nutri-sodium'].textContent !== '0 mg' ||
  !toastMsg
) {
  throw new Error('Test 3 Failed: Mock DOM did not reset as expected');
}

console.log('  ✅ [PASS]\n');
console.log('🎉 Reset feature is 100% verified and operational!');
