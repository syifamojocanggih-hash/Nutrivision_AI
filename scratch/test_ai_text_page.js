const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
const jsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf-8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'ai_text_eval.css'), 'utf-8');

console.log('🧪 Starting AI Model Teks Dedicated Page Test Suite...\n');

// Test 1: Button on landing page navbar
const hasLpBtn = html.includes('id="lp-nav-ai-btn"');
const hasLpText = html.includes('<span>AI Model Teks</span>');
const hasLpClick = html.includes('onclick="app.goToAITextPage()"');
console.log('Test 1 - Landing navbar button:');
console.log('  lp-nav-ai-btn present:', hasLpBtn);
console.log('  contains "AI Model Teks":', hasLpText);
console.log('  calls app.goToAITextPage():', hasLpClick);
if (!hasLpBtn || !hasLpText || !hasLpClick) throw new Error('Test 1 Failed');
console.log('  ✅ [PASS]\n');

// Test 2: Button on App Topbar
const hasTopbarBtn = html.includes('id="topbar-ai-tester-btn"');
console.log('Test 2 - App topbar button:');
console.log('  topbar-ai-tester-btn present:', hasTopbarBtn);
if (!hasTopbarBtn) throw new Error('Test 2 Failed');
console.log('  ✅ [PASS]\n');

// Test 3: Dedicated view-ai-text section
const hasViewSection = html.includes('id="view-ai-text"');
const hasBackBtn = html.includes("onclick=\"app.navigate('overview')\"");
const hasTitle = html.includes('Evaluasi Kelayakan Menu Pasien');
const hasRoomBadge = html.includes('Ruang Rawat Bedah');
const hasStatusWidget = html.includes('Status AI Klinis');
console.log('Test 3 - Dedicated view-ai-text structure:');
console.log('  view-ai-text present:', hasViewSection);
console.log('  back button to overview present:', hasBackBtn);
console.log('  title present:', hasTitle);
console.log('  room badge present:', hasRoomBadge);
console.log('  status AI klinis widget present:', hasStatusWidget);
if (!hasViewSection || !hasBackBtn || !hasTitle || !hasRoomBadge || !hasStatusWidget) {
  throw new Error('Test 3 Failed');
}
console.log('  ✅ [PASS]\n');

// Test 4: Presets, input textarea, and keyword elements
const hasPresets = html.includes('selectAIEvalPreset');
const hasBakso = html.includes('Bakso Sapi Kuah');
const hasGabus = html.includes('Sup Ikan Gabus');
const hasBayam = html.includes('Bening Bayam Jagung');
const hasSalmon = html.includes('Bubur Salmon');
const hasRendang = html.includes('Rendang Pedas');
const hasGorengan = html.includes('Ayam Goreng Tepung');
const hasTextarea = html.includes('id="ai-eval-input-text"');
const hasKeywordsBox = html.includes('id="ai-eval-chips-box"');
console.log('Test 4 - Presets & Input components:');
console.log('  presets present:', hasPresets && hasBakso && hasGabus && hasBayam && hasSalmon && hasRendang && hasGorengan);
console.log('  textarea present:', hasTextarea);
console.log('  keywords box present:', hasKeywordsBox);
if (!hasPresets || !hasTextarea || !hasKeywordsBox) throw new Error('Test 4 Failed');
console.log('  ✅ [PASS]\n');

// Test 5: Evaluation card, confidence bar, nutrients, order banner
const hasConfidence = html.includes('id="ai-eval-confidence-val"');
const hasProgBar = html.includes('id="ai-eval-progress-bar"');
const hasNutrients = html.includes('id="ai-eval-nutri-protein"') && html.includes('id="ai-eval-nutri-cals"');
const hasOrderBtn = html.includes('sendMenuToKitchen()');
console.log('Test 5 - Assessment Output & Order Banner:');
console.log('  confidence display present:', hasConfidence);
console.log('  progress bar present:', hasProgBar);
console.log('  nutrient metric cards present:', hasNutrients);
console.log('  order to kitchen action present:', hasOrderBtn);
if (!hasConfidence || !hasProgBar || !hasNutrients || !hasOrderBtn) throw new Error('Test 5 Failed');
console.log('  ✅ [PASS]\n');

// Test 6: Verify view-ai-text is NOT in sidebar nav or bottom nav
const sidebarNavIdx = html.indexOf('<aside class="sidebar"');
const sidebarNavEnd = html.indexOf('</aside>');
const sidebarSnippet = html.substring(sidebarNavIdx, sidebarNavEnd);
const inSidebar = sidebarSnippet.includes('ai-text');

const bottomNavIdx = html.indexOf('<nav class="bottom-nav-pwa"');
const bottomNavEnd = html.indexOf('</nav>', bottomNavIdx);
const bottomNavSnippet = html.substring(bottomNavIdx, bottomNavEnd);
const inBottomNav = bottomNavSnippet.includes('ai-text');

console.log('Test 6 - Navigation isolation constraint:');
console.log('  Included in sidebar nav? (must be false):', inSidebar);
console.log('  Included in bottom nav? (must be false):', inBottomNav);
if (inSidebar || inBottomNav) throw new Error('Test 6 Failed: ai-text must not be in sidebar or bottom nav!');
console.log('  ✅ [PASS]\n');

// Test 7: Verify app.js methods
const methods = [
  'goToAITextPage',
  'renderAITextPage',
  'checkAITextHealthStatus',
  'selectAIEvalPreset',
  'handleAIEvalInput',
  'resetAIEvalPage',
  'executeAIEvalPage',
  'renderExtractedKeywords',
  'generateClinicalNotesHTML',
  'sendMenuToKitchen'
];

console.log('Test 7 - app.js methods implementation:');
for (const m of methods) {
  const hasMethod = jsCode.includes(m);
  console.log(`  ${m}: ${hasMethod}`);
  if (!hasMethod) throw new Error(`Missing method ${m} in app.js`);
}
console.log('  ✅ [PASS]\n');

// Test 8: Verify CSS styles
const hasWrapperCss = css.includes('.ai-eval-page-wrapper');
const hasGridCss = css.includes('.ai-eval-main-grid');
const hasNutriGrid = css.includes('.ai-eval-nutri-grid');
console.log('Test 8 - Dedicated CSS styles:');
console.log('  .ai-eval-page-wrapper present:', hasWrapperCss);
console.log('  .ai-eval-main-grid present:', hasGridCss);
console.log('  .ai-eval-nutri-grid present:', hasNutriGrid);
if (!hasWrapperCss || !hasGridCss || !hasNutriGrid) throw new Error('Test 8 Failed');
console.log('  ✅ [PASS]\n');

console.log('==================================================');
console.log('🎉 ALL 8 TEST SUITES PASSED! PAGE IMPLEMENTATION COMPLETE!');
console.log('==================================================');
