const fs = require('fs');
const vm = require('vm');

const appCode = fs.readFileSync('js/app.js', 'utf-8');

class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.style = {};
    this._classes = new Set();
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.dataset = {};
    this.addEventListener = () => {};
    this.classList = {
      add: (c) => this._classes.add(c),
      remove: (c) => this._classes.delete(c),
      contains: (c) => this._classes.has(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) this._classes.add(c); else this._classes.delete(c);
        } else {
          if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
        }
      }
    };
  }
  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k]; }
  removeAttribute(k) { delete this[k]; }
  appendChild(child) { this.children.push(child); }
  remove() {}
  focus() {}
  scrollIntoView() {}
}

const dom = {};
function getElementById(id) {
  if (!dom[id]) dom[id] = new MockElement(id);
  return dom[id];
}

global.document = {
  getElementById,
  createElement: (tag) => new MockElement('', tag),
  documentElement: new MockElement('html'),
  querySelectorAll: (selector) => {
    if (selector.includes('user-name-placeholder')) return [getElementById('name-placeholder-1')];
    if (selector.includes('user-condition-placeholder')) return [getElementById('cond-placeholder-1')];
    if (selector.includes('user-avatar-placeholder')) return [getElementById('avatar-placeholder-1')];
    if (selector.includes('topbar-greeting')) return [getElementById('greeting-1')];
    return [];
  },
  querySelector: (selector) => {
    if (selector.includes('topbar-greeting h1')) return getElementById('greeting-h1');
    return null;
  },
  body: new MockElement('body'),
  addEventListener: () => {}
};
global.window = global;
global.window.i18n = { getLanguage: () => 'id' };
global.window.addEventListener = () => {};
global.window.scrollTo = () => {};
global.window.history = { pushState: () => {} };
global.localStorage = {
  data: {},
  getItem: function(k) { return this.data[k] || null; },
  setItem: function(k, v) { this.data[k] = v; },
  removeItem: function(k) { delete this.data[k]; }
};
global.cvEngine = { 
  currentScan: null,
  renderCanvas: () => {}
};
global.progressTracker = {
  setEmptyState: () => {},
  initUserProgress: () => {},
  renderMacroDonut: () => {},
  renderWeeklyBarChart: () => {}
};
global.budgetPlanner = {
  preference: 'seimbang',
  generatePlan: () => {},
  render: () => {}
};
global.mealPlanner = { renderPlanner: () => {}, renderSymptomFilter: () => {} };
global.communityHandler = { renderCommunityFeed: () => {} };
global.caregiverHandler = { renderCaregiverList: () => {} };

vm.runInThisContext(appCode);
global.app = new NutriVisionApp();
global.app.userProfile.language = 'id';

async function testSignupAndDiagnosticFlow() {
  console.log('=== TEST 1: New User Registration ===');
  getElementById('reg-name').value = 'Dewi Lestari';
  getElementById('reg-email').value = 'dewi@example.com';
  getElementById('reg-password').value = 'secret123';

  await app.handleRegister();

  console.log('Registered User Name:', app.userProfile.name);
  console.log('User hasCompletedQuiz:', app.userProfile.hasCompletedQuiz);
  console.log('Overview Unconfigured Banner Display:', dom['overview-unconfigured-banner']?.style?.display);
  console.log('Card 2 Status Text:', dom['ov-card2-status-text']?.textContent);
  console.log('Sidebar Profile Card HTML contains Dewi Lestari:', dom['sidebar-profile-card']?.innerHTML?.includes('Dewi Lestari'));
  console.log('Sidebar Profile Card shows Belum Kalibrasi:', dom['sidebar-profile-card']?.innerHTML?.includes('Belum Kalibrasi'));

  if (app.userProfile.name !== 'Dewi Lestari') throw new Error('FAIL: User name mismatch');
  if (app.userProfile.hasCompletedQuiz !== false) throw new Error('FAIL: New user must have hasCompletedQuiz: false');
  if (dom['overview-unconfigured-banner']?.style?.display !== 'block') throw new Error('FAIL: Overview unconfigured banner must be visible!');
  if (!dom['ov-card2-status-text']?.textContent?.includes('Belum Dikonfigurasi')) throw new Error('FAIL: Card 2 should show Belum Dikonfigurasi');
  if (!dom['sidebar-profile-card']?.innerHTML?.includes('Dewi Lestari')) throw new Error('FAIL: Sidebar should show registered name');

  console.log('>>> TEST 1 PASSED: New signup cleanly displays overview diagnostic calibration banner & status!\n');

  console.log('=== TEST 2: Open Quiz Modal & Pre-fill Identity ===');
  app.openQuizModal(1);
  console.log('Onboarding modal display:', dom['onboarding-modal']?.style?.display);
  console.log('Onboarding modal classes contains open:', dom['onboarding-modal']?.classList?.contains('open'));
  console.log('Onboard Name field value:', dom['onboard-name']?.value);
  console.log('Onboard Contact field value:', dom['onboard-contact']?.value);

  if (dom['onboard-name']?.value !== 'Dewi Lestari') throw new Error('FAIL: Onboard name was not pre-filled');
  if (dom['onboard-contact']?.value !== 'dewi@example.com') throw new Error('FAIL: Onboard contact was not pre-filled');
  if (dom['onboarding-modal']?.style?.display !== 'flex') throw new Error('FAIL: Onboarding modal display should be flex');
  console.log('>>> TEST 2 PASSED: Quiz modal opens cleanly and pre-fills user identity!\n');

  console.log('=== TEST 3: Complete Quiz & Calibrate Food Needs ===');
  // Fill quiz step inputs
  getElementById('onboard-age').value = '32';
  app.quizState.condition = 'post-surgery';
  getElementById('onboard-phase').value = 'Minggu ke-2 (Fase Proliferasi & Jaringan)';
  getElementById('onboard-restrictions').value = 'Alergi kacang, hindari pedas';
  getElementById('onboard-weight').value = '60';
  getElementById('onboard-height').value = '165';
  app.quizState.activity = 'bedrest';
  getElementById('onboard-consent-check').checked = true;

  // Finish quiz
  app.saveOnboardingProfile();

  console.log('Post-Quiz hasCompletedQuiz:', app.userProfile.hasCompletedQuiz);
  console.log('Calculated Protein Target:', app.userProfile.targets?.protein, 'g');
  console.log('Calculated Calorie Target:', app.userProfile.targets?.calories, 'kkal');
  console.log('Overview Unconfigured Banner Display after quiz:', dom['overview-unconfigured-banner']?.style?.display);
  console.log('Card 2 Status Badge Text:', dom['ov-card2-status-text']?.textContent);
  console.log('Card 2 Protein label:', dom['macro-num-protein']?.textContent);
  console.log('Card 2 Calorie label:', dom['macro-num-cals']?.textContent);
  console.log('Sidebar Profile Card now shows Condition:', dom['sidebar-profile-card']?.innerHTML?.includes('Pasca-Operasi & Bedah'));

  if (app.userProfile.hasCompletedQuiz !== true) throw new Error('FAIL: hasCompletedQuiz should be true');
  if (!app.userProfile.targets?.protein || app.userProfile.targets.protein <= 0) throw new Error('FAIL: target protein invalid');
  if (dom['overview-unconfigured-banner']?.style?.display !== 'none') throw new Error('FAIL: Banner should be hidden after quiz!');
  if (!dom['ov-card2-status-text']?.textContent?.includes('Target Terkalibrasi')) throw new Error('FAIL: Card 2 should show Target Terkalibrasi');
  if (!dom['macro-num-protein']?.textContent?.includes(`${app.userProfile.targets.protein} g`)) throw new Error('FAIL: Macro num protein mismatch');

  console.log('>>> TEST 3 PASSED: Food needs and nutrition calibration successfully applied to dashboard!\n');

  console.log('🎉 ALL SIGNUP & DIAGNOSTIC CALIBRATION TESTS PASSED 100%! 🎉');
}

testSignupAndDiagnosticFlow().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
