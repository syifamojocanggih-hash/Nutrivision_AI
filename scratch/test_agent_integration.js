const fs = require('fs');
const assert = require('assert');

console.log('=== TEST 1: ClinicalNutritionFilterAgent System Prompt & Rules ===');
const { clinicalNutritionFilterAgent, CLINICAL_FILTER_SYSTEM_PROMPT } = require('../js/symptom_filter_agent.js');

assert(CLINICAL_FILTER_SYSTEM_PROMPT.includes('[ROLE & SYSTEM PURPOSE]'), 'Contains role & system purpose');
assert(CLINICAL_FILTER_SYSTEM_PROMPT.includes('PRIORITY 1: KESELAMATAN FISIK (SAFETY FIRST - DYSPHAGIA)'), 'Contains Priority 1');
assert(CLINICAL_FILTER_SYSTEM_PROMPT.includes('PRIORITY 2: GANGGUAN PENCERNAAN & IRITASI (GI TRACT PROTECTION)'), 'Contains Priority 2');
assert(CLINICAL_FILTER_SYSTEM_PROMPT.includes('PRIORITY 3: DENSITAS NUTRISI & PORSI'), 'Contains Priority 3');
assert(CLINICAL_FILTER_SYSTEM_PROMPT.includes('{{selected_symptoms}}'), 'Contains {{selected_symptoms}} placeholder');

console.log('>> PASS: System Prompt structure verified.');

console.log('\n=== TEST 2: Dynamic {{selected_symptoms}} Substitution ===');
const promptWithSymptoms = clinicalNutritionFilterAgent.getSystemPrompt(['dysphagia', 'nausea']);
assert(!promptWithSymptoms.includes('{{selected_symptoms}}'), 'Placeholder successfully replaced');
assert(promptWithSymptoms.includes('["dysphagia","nausea"]'), 'Contains dynamic JSON array of active symptoms');
console.log('>> PASS: Dynamic prompt injection verified.');

console.log('\n=== TEST 3: Conflict Resolution (Dysphagia + Constipation) ===');
const conflictRes = clinicalNutritionFilterAgent.process(['dysphagia', 'constipation']);
assert.strictEqual(conflictRes.safety_level, 'High', 'Safety level is High due to Priority 1');
assert(conflictRes.texture_requirement.includes('IDDSI Puree'), 'Mandates IDDSI Puree texture');
const hasPureePapaya = conflictRes.recommended_menu.some(m => m.name.includes('Pepaya Matang Halus'));
assert(hasPureePapaya, 'Recommends pureed papaya rather than whole/rough fruit');
const hasRoughVegRestricted = conflictRes.restricted_ingredients.some(r => r.toLowerCase().includes('kasar'));
assert(hasRoughVegRestricted, 'Restricts rough/raw fiber to protect swallowing safety');
console.log('>> PASS: Priority 1 safety override over constipation verified.');

console.log('\n=== TEST 4: Output JSON Schema Compliance ===');
const sampleRes = clinicalNutritionFilterAgent.process(['gerd', 'nausea', 'low_appetite']);
assert(Array.isArray(sampleRes.active_filters), 'active_filters is array');
assert(typeof sampleRes.safety_level === 'string', 'safety_level is string');
assert(typeof sampleRes.texture_requirement === 'string', 'texture_requirement is string');
assert(Array.isArray(sampleRes.restricted_ingredients), 'restricted_ingredients is array');
assert(Array.isArray(sampleRes.recommended_menu), 'recommended_menu is array');
sampleRes.recommended_menu.forEach(item => {
  assert(typeof item.name === 'string', 'item.name is string');
  assert(typeof item.texture_category === 'string', 'item.texture_category is string');
  assert(typeof item.reason === 'string', 'item.reason is string');
});
console.log('>> PASS: JSON format strictly complies with specification.');

console.log('\n=== TEST 5: HTML, Planner & Server Verification ===');
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(indexHtml.includes('js/symptom_filter_agent.js'), 'index.html includes symptom_filter_agent.js');
assert(indexHtml.includes('data-symptom="dysphagia"'), 'index.html has dysphagia chip');
assert(indexHtml.includes('data-symptom="gerd"'), 'index.html has gerd chip');
assert(indexHtml.includes('data-symptom="diarrhea"'), 'index.html has diarrhea chip');

const plannerJs = fs.readFileSync('js/planner.js', 'utf8');
assert(plannerJs.includes('clinicalNutritionFilterAgent'), 'planner.js uses clinicalNutritionFilterAgent');
assert(plannerJs.includes('safety_level'), 'planner.js renders safety_level');

const aiRoutesJs = fs.readFileSync('server/routes/ai.routes.js', 'utf8');
assert(aiRoutesJs.includes('/symptom-filter'), 'ai.routes.js has /symptom-filter endpoint');

const swJs = fs.readFileSync('sw.js', 'utf8');
assert(swJs.includes('nutrivision-v1.3.'), 'sw.js cache bumped to v1.3.x');
assert(swJs.includes('./js/symptom_filter_agent.js'), 'sw.js caches symptom_filter_agent.js');

console.log('>> PASS: All frontend, backend, and service worker connections verified.');

console.log('\n=============================================');
console.log('🎉 ALL CLINICAL FILTER AGENT TESTS PASSED! 🎉');
console.log('=============================================');
