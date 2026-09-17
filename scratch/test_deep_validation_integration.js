const fs = require('fs');
const assert = require('assert');
const validator = require('../js/food_clinical_validator.js');

console.log('🧪 Starting Deep Food Validation Integration Tests...\n');

// 1. Periksa Integritas File index.html
console.log('Test 1: Check HTML Containers & Script Tags');
const html = fs.readFileSync('index.html', 'utf8');
assert.ok(html.includes('<script src="js/food_clinical_validator.js"></script>'), 'food_clinical_validator.js harus dimuat di index.html');
assert.ok(html.includes('id="overview-clinical-validation-box"'), 'overview-clinical-validation-box harus ada di index.html');
assert.ok(html.includes('id="modal-clinical-validation-box"'), 'modal-clinical-validation-box harus ada di index.html');
assert.ok(html.includes('id="profile-diseases-card"'), 'profile-diseases-card harus ada di index.html');
assert.ok(html.includes('id="quiz-disease-chips"'), 'quiz-disease-chips harus ada di index.html');
console.log('  ✅ HTML elements and scripts verified.');

// 2. Periksa Integritas CSS
console.log('\nTest 2: Check CSS Dashboard Rules');
const css = fs.readFileSync('css/dashboard.css', 'utf8');
assert.ok(css.includes('.clinical-scorecard-card'), 'CSS .clinical-scorecard-card harus ada');
assert.ok(css.includes('.clinical-safety-pill'), 'CSS .clinical-safety-pill harus ada');
assert.ok(css.includes('.clinical-pillars-grid'), 'CSS .clinical-pillars-grid harus ada');
assert.ok(css.includes('.disease-chip-btn'), 'CSS .disease-chip-btn harus ada');
console.log('  ✅ CSS rules verified.');

// 3. Uji Skenario Klinis Mendalam Berdasarkan Pengaruh BB & TB
console.log('\nTest 3: Deep Weight (BB) & Height (TB) Validation on Same Meal');
const meal700kcal = {
  name: 'Nasi Ayam Lengkap',
  segments: [
    { name: 'Nasi Putih', portionGrams: 250, cals: [320, 350], protein: [5, 6], carbs: [70, 75], fat: [1, 2] },
    { name: 'Ayam Goreng', portionGrams: 150, cals: [320, 360], protein: [28, 32], carbs: [0, 2], fat: [18, 22] }
  ]
};

// Pasien A: BB 95kg, TB 160cm (BMI 37.1 Obesitas Morbid)
const patientObese = {
  weightKg: 95,
  heightCm: 160,
  age: 40,
  gender: 'female',
  activityLevel: 'light',
  conditionId: 'wellness',
  diseases: []
};
const valObese = validator.validateFood(meal700kcal, patientObese);
console.log('  Obese Patient (95kg/160cm):', valObese.safetyBadgeText, 'Score:', valObese.score);
assert.ok(valObese.score < 85, 'Pasien obesitas dengan porsi lemak/kalori tinggi harus mendapat peringatan');

// Pasien B: BB 42kg, TB 165cm (BMI 15.4 Underweight)
const mealLight200kcal = {
  name: 'Sup Bening Bayam Porsi Kecil',
  segments: [
    { name: 'Sayur Bayam Bening', portionGrams: 100, cals: [40, 50], protein: [2, 3], carbs: [6, 8], fat: [0.5, 1] }
  ]
};
const patientUnderweight = {
  weightKg: 42,
  heightCm: 165,
  age: 24,
  gender: 'female',
  activityLevel: 'bedrest',
  conditionId: 'post-surgery',
  diseases: ['post-surgery']
};
const valUnderweight = validator.validateFood(mealLight200kcal, patientUnderweight);
console.log('  Underweight Patient (42kg/165cm):', valUnderweight.safetyBadgeText, 'Score:', valUnderweight.score);
const underItem = valUnderweight.pillars[0].items.find(i => i.title.includes('Rendah'));
assert.ok(underItem, 'Harus ada peringatan kalori terlalu rendah untuk underweight');
console.log('  ✅ Underweight calorie density warning confirmed:', underItem.title);

// 4. Uji Skenario Perubahan Penyakit pada Makanan yang Sama
console.log('\nTest 4: Same Food Evaluated Under Different Diseases (Comorbidities)');
const balancedPlate = {
  name: 'Ikan Gabus Tim Bening & Sayur Wortel',
  segments: [
    { name: 'Ikan Gabus Tim', portionGrams: 150, cals: [140, 160], protein: [28, 30], carbs: [0, 0], fat: [2, 3] },
    { name: 'Wortel & Labu Kukus', portionGrams: 100, cals: [40, 50], protein: [1, 2], carbs: [8, 10], fat: [0.2, 0.5] }
  ]
};

// Kondisi 1: Pasien Pasca-Operasi Normal
const valSurgery = validator.validateFood(balancedPlate, {
  weightKg: 65,
  heightCm: 170,
  conditionId: 'post-surgery',
  diseases: ['post-surgery']
});
console.log('  Post-Surgery Evaluation:', valSurgery.safetyBadgeText, '(Score:', valSurgery.score, ')');
assert.strictEqual(valSurgery.safetyLevel, 'SAFE');
assert.ok(valSurgery.score >= 85);

// Kondisi 2: Pasien Mengaktifkan Riwayat Penyakit Ginjal Kronis (CKD)
const valCKD = validator.validateFood(balancedPlate, {
  weightKg: 65,
  heightCm: 170,
  conditionId: 'post-surgery',
  diseases: ['post-surgery', 'ckd']
});
console.log('  Post-Surgery + CKD Evaluation:', valCKD.safetyBadgeText, '(Score:', valCKD.score, ')');
assert.strictEqual(valCKD.safetyLevel, 'DANGER');
assert.ok(valCKD.score <= 60);
console.log('  ✅ Disease addition (CKD) instantly changes safe plate to medical alert!');

// Kondisi 3: Pasien Mengaktifkan Hipertensi pada Makanan Asin
const saltyPlate = {
  name: 'Sup Daging Asin Kaldu Gurih',
  segments: [
    { name: 'Daging Sapi Kornet Asin', portionGrams: 100, cals: [220, 240], protein: [18, 20], carbs: [2, 3], fat: [14, 16] }
  ]
};
const valHT = validator.validateFood(saltyPlate, {
  weightKg: 65,
  heightCm: 170,
  diseases: ['hipertensi']
});
console.log('  Hypertension Evaluation:', valHT.safetyBadgeText, '(Score:', valHT.score, ')');
assert.strictEqual(valHT.safetyLevel, 'DANGER');
console.log('  ✅ Hypertension triggers high sodium alert.');

// Kondisi 4: Pasien Mengaktifkan GERD pada Makanan Pedas
const spicyPlate = {
  name: 'Ayam Sambal Cabai Rawit Pedas',
  segments: [
    { name: 'Ayam Goreng Sambal Pedas Cabai Rawit', portionGrams: 120, cals: [250, 280], protein: [22, 24], carbs: [4, 6], fat: [16, 18] }
  ]
};
const valGERD = validator.validateFood(spicyPlate, {
  weightKg: 65,
  heightCm: 170,
  diseases: ['gerd']
});
console.log('  GERD Evaluation:', valGERD.safetyBadgeText, '(Score:', valGERD.score, ')');
assert.ok(valGERD.safetyLevel === 'CAUTION' || valGERD.safetyLevel === 'DANGER');
const gerdItem = valGERD.pillars[1].items.find(i => i.disease.includes('GERD'));
assert.ok(gerdItem, 'Harus ada peringatan iritasi refluks lambung');
console.log('  ✅ GERD spicy/fat alert confirmed:', gerdItem.title);

console.log('\n🎉 ALL DEEP FOOD VALIDATION INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🚀');
