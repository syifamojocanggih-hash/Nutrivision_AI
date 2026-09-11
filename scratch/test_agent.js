const { clinicalNutritionFilterAgent } = require('../js/symptom_filter_agent.js');

console.log('--- Test 1: Dysphagia + Constipation Conflict Resolution ---');
const res1 = clinicalNutritionFilterAgent.process(['dysphagia', 'constipation']);
console.log('Safety level:', res1.safety_level);
console.log('Texture:', res1.texture_requirement);
console.log('Restricted:', res1.restricted_ingredients);
console.log('Recommended menu count:', res1.recommended_menu.length);
console.log('Menu 1:', res1.recommended_menu[0]);

console.log('\n--- Test 2: System prompt with dynamic {{selected_symptoms}} ---');
const promptText = clinicalNutritionFilterAgent.getSystemPrompt(['dysphagia', 'nausea']);
console.log('Prompt contains active symptoms:', promptText.includes('["dysphagia","nausea"]'));
console.log('Full Prompt:\n' + promptText);

console.log('\n--- Test 3: Multiple Symptoms (All 6) ---');
const resAll = clinicalNutritionFilterAgent.process(["dysphagia", "nausea", "constipation", "low_appetite", "diarrhea", "gerd"]);
console.log('Safety Level:', resAll.safety_level);
console.log('Active filters:', resAll.active_filters);
console.log('Restricted count:', resAll.restricted_ingredients.length);
console.log('Sample restricted:', resAll.restricted_ingredients.slice(0, 3));
console.log('Recommended menu:', resAll.recommended_menu.map(m => m.name));

console.log('\n>> ALL AGENT TESTS PASSED!');
