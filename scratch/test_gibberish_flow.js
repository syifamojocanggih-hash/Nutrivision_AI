const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf-8');

console.log('🧪 Testing Gibberish & Icon Removal Updates...\n');

// 1. Check icon removal in presets
const presetsBlock = html.substring(html.indexOf('id="ai-eval-presets-container"'), html.indexOf('id="ai-eval-input-text"'));
const hasPresetIcons = /🍲|🐟|🥗|🥣|🌶️|🍗/.test(presetsBlock);
console.log('1. Preset icons removed from HTML:', !hasPresetIcons);
if (hasPresetIcons) throw new Error('Preset icons still exist in HTML!');

// 2. Check icon removal in nutrients
const nutriBlock = html.substring(html.indexOf('class="ai-eval-nutri-grid"'), html.indexOf('class="ai-eval-order-banner"'));
const hasNutriIcons = /⚡|🔄|⚗️|🧂/.test(nutriBlock);
console.log('2. Nutri icons removed from HTML:', !hasNutriIcons);
if (hasNutriIcons) throw new Error('Nutrient icons still exist in HTML!');

// 3. Check preset pill un-highlighting logic on typing in handleAIEvalInput
const hasUnhighlight = js.includes('document.querySelectorAll(\'.ai-eval-preset-pill\').forEach(btn => {') &&
                       js.includes('btn.classList.remove(\'active\');');
console.log('3. handleAIEvalInput un-highlights preset pills on manual typing:', hasUnhighlight);
if (!hasUnhighlight) throw new Error('Missing unhighlight logic in handleAIEvalInput');

// 4. Check checkFoodTextValidity presence
const hasValFunction = js.includes('checkFoodTextValidity(text)');
const hasInvalidRenderer = js.includes('renderInvalidInputState(text, valCheck.reason)');
console.log('4. checkFoodTextValidity implemented:', hasValFunction);
console.log('   renderInvalidInputState implemented:', hasInvalidRenderer);
if (!hasValFunction || !hasInvalidRenderer) throw new Error('Missing gibberish detection methods in app.js');

console.log('\n🎉 ALL GIBBERISH & ICON VERIFICATIONS PASSED!');
