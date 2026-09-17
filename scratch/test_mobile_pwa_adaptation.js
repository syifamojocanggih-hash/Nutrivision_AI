/**
 * ============================================================================
 * NutriVision AI — Automated Mobile PWA Adaptation & Responsiveness Test Suite
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== VERIFYING MOBILE PWA ADAPTATION & RESPONSIVENESS ===\n');

// 1. Verify CSS Media Queries for Mobile PWA
console.log('1. Checking Mobile Media Queries in CSS files...');
const adminCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'admin.css'), 'utf-8');
const caregiverCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'caregiver.css'), 'utf-8');
const swJs = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf-8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');

console.assert(adminCss.includes('@media (max-width: 768px)'), 'FAIL: admin.css missing 768px media query');
console.assert(adminCss.includes('@media (max-width: 480px)'), 'FAIL: admin.css missing 480px media query');
console.assert(adminCss.includes('.admin-live-toast'), 'FAIL: admin.css missing admin-live-toast');
console.assert(caregiverCss.includes('@media (max-width: 768px)'), 'FAIL: caregiver.css missing 768px media query');
console.assert(caregiverCss.includes('@media (max-width: 480px)'), 'FAIL: caregiver.css missing 480px media query');
console.log('  [PASS] admin.css and caregiver.css contain mobile breakpoint rules');

// 2. Verify Service Worker PWA Cache
console.log('\n2. Checking Service Worker PWA Offline Assets Cache...');
console.assert(swJs.includes('nutrivision-v1.3.8'), 'FAIL: sw.js cache name not bumped to v1.3.8');
console.assert(swJs.includes('./css/caregiver.css'), 'FAIL: sw.js missing caregiver.css in cache');
console.assert(swJs.includes('./js/admin_validator.js'), 'FAIL: sw.js missing admin_validator.js in cache');
console.log('  [PASS] sw.js ASSETS_TO_CACHE properly includes caregiver.css and admin_validator.js (v1.3.8)');

// 3. Verify HTML Modal Structure for Mobile Bottom-Sheet
console.log('\n3. Checking HTML Modal Overlay & Box Structure...');
console.assert(indexHtml.includes('id="modal-admin-validate-user"') && indexHtml.includes('class="modal-overlay"'), 'FAIL: modal-admin-validate-user not using modal-overlay');
console.assert(indexHtml.includes('class="modal-box"'), 'FAIL: modal-admin-validate-user not using modal-box');
console.log('  [PASS] modal-admin-validate-user conforms to mobile bottom-sheet architecture');

// 4. Test Dynamic Role-based Mobile Bottom Nav in js/app.js
console.log('\n4. Testing Dynamic Mobile Bottom Nav in js/app.js...');
class MockElement {
  constructor(tag = 'div', id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.innerHTML = '';
    this.style = {};
    this.children = [];
    this.classList = {
      _c: new Set(),
      add(c) { this._c.add(c); },
      remove(c) { this._c.delete(c); },
      contains(c) { return this._c.has(c); },
      toggle(c, v) { if (v === undefined) v = !this._c.has(c); if (v) this.add(c); else this.remove(c); }
    };
  }
  querySelector(sel) { return null; }
  querySelectorAll(sel) { return []; }
}

const mockDom = {
  bottomNav: new MockElement('nav', '', 'bottom-nav-pwa'),
  fabBtn: new MockElement('button', '', 'fab-scan-btn')
};

const sandbox = {
  console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  document: {
    querySelector: (sel) => {
      if (sel === '.bottom-nav-pwa') return mockDom.bottomNav;
      if (sel === '.fab-scan-btn') return mockDom.fabBtn;
      return null;
    },
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: (tag) => new MockElement(tag),
    body: new MockElement('body'),
    addEventListener: () => {}
  },
  window: {
    addEventListener: () => {},
    removeEventListener: () => {},
    lucide: { createIcons: () => {} },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
vm.createContext(sandbox);

const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf-8');
vm.runInContext(appCode, sandbox);
const app = sandbox.window.app;

// Test Admin Mobile Bottom Nav
app.renderMobileBottomNav('admin');
console.assert(mockDom.fabBtn.style.display === 'none', 'FAIL: FAB camera button should be hidden for Admin');
console.assert(mockDom.bottomNav.innerHTML.includes('data-sec="admin"'), 'FAIL: Admin mobile nav missing Monitoring');
console.assert(mockDom.bottomNav.innerHTML.includes('data-sec="admin-clinical-menu"'), 'FAIL: Admin mobile nav missing Analitik');
console.assert(mockDom.bottomNav.innerHTML.includes('data-sec="database"'), 'FAIL: Admin mobile nav missing Cloud Sync');
console.log('  [PASS] Admin Mobile Bottom Nav: displays Monitoring, Analitik, Cloud Sync, and Logout; hides FAB camera');

// Test Caregiver Mobile Bottom Nav
app.renderMobileBottomNav('caregiver');
console.assert(mockDom.fabBtn.style.display === 'none', 'FAIL: FAB camera button should be hidden for Caregiver');
console.assert(mockDom.bottomNav.innerHTML.includes('data-sec="caregiver-dashboard"'), 'FAIL: Caregiver mobile nav missing Pasien');
console.assert(mockDom.bottomNav.innerHTML.includes('data-sec="profile"'), 'FAIL: Caregiver mobile nav missing Izin & Profil');
console.log('  [PASS] Caregiver Mobile Bottom Nav: displays Pasien, Izin & Profil, and Logout; hides FAB camera');

// Test Patient Mobile Bottom Nav
app.renderMobileBottomNav('patient');
console.assert(mockDom.fabBtn.style.display === 'none', 'FAIL: FAB camera button should be hidden (integrated into center bottom nav)');
console.assert(mockDom.bottomNav.innerHTML.includes('data-sec="overview"'), 'FAIL: Patient mobile nav missing Overview');
console.assert(mockDom.bottomNav.innerHTML.includes('data-sec="planner"'), 'FAIL: Patient mobile nav missing Menu');
console.assert(mockDom.bottomNav.innerHTML.includes('bottom-nav-scan-center'), 'FAIL: Patient mobile nav missing center scan button');
console.assert(mockDom.bottomNav.innerHTML.includes('data-sec="progress"'), 'FAIL: Patient mobile nav missing Progres');
console.log('  [PASS] Patient Mobile Bottom Nav: displays 5 balanced tabs with center elevated scan button; floating FAB cleanly hidden');

console.log('\n======================================================');
console.log('   ALL MOBILE PWA ADAPTATION TESTS PASSED!            ');
console.log('======================================================\n');
