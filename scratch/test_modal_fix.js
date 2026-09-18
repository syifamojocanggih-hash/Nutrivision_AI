const fs = require('fs');
const assert = require('assert');

function testModalFix() {
  console.log('--- Testing Modal Overlay & Z-Index Stacking Fix ---');

  const html = fs.readFileSync('index.html', 'utf-8');
  const cssModals = fs.readFileSync('css/modals.css', 'utf-8');

  // 1. Check modal-companion-selector
  assert(html.includes('id="modal-companion-selector"'), 'modal-companion-selector must exist');
  assert(html.includes('class="modal-overlay" id="modal-companion-selector"') || html.includes('id="modal-companion-selector" class="modal-overlay"'), 'modal-companion-selector must use modal-overlay class');

  // 2. Check z-index of modal-overlay in css
  assert(cssModals.includes('z-index: 999999 !important;'), 'modals must have top-level z-index (999999)');
  assert(cssModals.includes('.modal-overlay.open') && cssModals.includes('display: flex !important;'), 'open modals must display flex');

  console.log('✓ modal-companion-selector correctly configured as modal-overlay');
  console.log('✓ Modal z-index elevated to 999999 above sidebar & fixed headers');
  console.log('--- Modal Fix Test Passed Successfully! ---');
}

testModalFix();
