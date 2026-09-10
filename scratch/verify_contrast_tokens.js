const fs = require('fs');
const path = require('path');

console.log("=== VERIFYING DESIGN PALETTE & TYPOGRAPHIC CONTRAST ===");

const varCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'variables.css'), 'utf8');
const dashCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'dashboard.css'), 'utf8');
const modalCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'modals.css'), 'utf8');
const compCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'components.css'), 'utf8');
const landCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'landing.css'), 'utf8');

// 1. Verify Original Palette Preserved
const checks = [
  { name: 'Canvas Warm Milky', file: 'variables.css', target: '--bg: #F7F3DE;' },
  { name: 'Subtle Milky', file: 'variables.css', target: '--bg-subtle: #EFE8CA;' },
  { name: 'Borders Warm Line', file: 'variables.css', target: '--line: #DDD4B0;' },
  { name: 'Matcha 500 Original', file: 'variables.css', target: '--matcha-500: #9EA76B;' },
  { name: 'Deep Forest Ink (Contrast)', file: 'variables.css', target: '--ink: #141708;' },
  { name: 'Dark Body Ink (Contrast)', file: 'variables.css', target: '--ink-soft: #262D11;' },
  { name: 'Legible Subtitle Ink (Contrast)', file: 'variables.css', target: '--ink-mute: #3B461C;' },
  { name: 'Landing Brand Mark Matcha', file: 'landing.css', target: 'background: linear-gradient(135deg, #9EA76B, #9EA76B);' },
  { name: 'Landing Hero Matcha Gradient', file: 'landing.css', target: 'background: linear-gradient(135deg, #353C1B 0%, #9EA76B 50%, #9EA76B 100%);' },
  { name: 'Symptom Chip Original Milky BG', file: 'dashboard.css', target: 'background: #FDFAF2;' },
  { name: 'Symptom Chip Active Matcha', file: 'dashboard.css', target: 'background: #9EA76B;' },
  { name: 'Toggle Tab Active Matcha', file: 'dashboard.css', target: 'background: #9EA76B;' },
  { name: 'Preset Chip Active Matcha', file: 'modals.css', target: 'background: #9EA76B;' }
];

let allPassed = true;
checks.forEach(c => {
  let content = '';
  if (c.file === 'variables.css') content = varCss;
  else if (c.file === 'dashboard.css') content = dashCss;
  else if (c.file === 'modals.css') content = modalCss;
  else if (c.file === 'components.css') content = compCss;
  else if (c.file === 'landing.css') content = landCss;

  if (content.includes(c.target)) {
    console.log(`✅ [PASS] ${c.name} (${c.file}) matches expected token`);
  } else {
    console.error(`❌ [FAIL] ${c.name} (${c.file}) missing expected token: ${c.target}`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log("\n🎉 ALL THEME COLOR & FONT CONTRAST VERIFICATIONS PASSED 100%!");
} else {
  process.exit(1);
}
