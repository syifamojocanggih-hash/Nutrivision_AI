const assert = require('assert');
const validator = require('../js/food_clinical_validator.js');

console.log('🧪 Starting Deep Clinical Food Validation Unit Tests...\n');

// 1. Uji Antropometri & BMI
console.log('Test 1: Anthropometric & BMI Calculation');
const anthroNormal = validator.calculateAnthropometrics({
  weightKg: 65,
  heightCm: 170,
  age: 28,
  gender: 'male',
  activityLevel: 'light'
});
assert.strictEqual(anthroNormal.bmi, 22.5);
assert.strictEqual(anthroNormal.bmiCategory, 'Normal (Ideal)');
assert.ok(anthroNormal.tdee > 1800 && anthroNormal.tdee < 2100);
console.log('  ✅ Normal profile calculated correctly:', anthroNormal.bmi, anthroNormal.tdee, 'kcal');

const anthroObese = validator.calculateAnthropometrics({
  weightKg: 95,
  heightCm: 165,
  age: 45,
  gender: 'female',
  activityLevel: 'bedrest'
});
assert.ok(anthroObese.bmi > 34);
assert.strictEqual(anthroObese.bmiRiskLevel, 'danger');
console.log('  ✅ Obese profile classified correctly:', anthroObese.bmi, anthroObese.bmiCategory);

// 2. Uji Penyakit Ginjal Kronis (CKD) vs Pasca-Operasi pada Makanan Tinggi Protein
console.log('\nTest 2: CKD (Chronic Kidney Disease) vs Post-Surgery on High-Protein Meal');
const highProteinPlate = {
  name: 'Ikan Gabus Tim Jumbo & Telur Rebus',
  segments: [
    { name: 'Ikan Gabus', portionGrams: 200, protein: [34, 38], cals: [220, 240], carbs: [0, 0], fat: [3, 4] },
    { name: 'Telur Rebus', portionGrams: 50, protein: [6, 7], cals: [75, 80], carbs: [0.5, 1], fat: [5, 6] }
  ]
};

// Profile Pasca-Operasi (Butuh protein tinggi untuk penyembuhan)
const postSurgeryProfile = {
  weightKg: 60,
  heightCm: 165,
  conditionId: 'post-surgery',
  diseases: ['post-surgery']
};
const resPostSurgery = validator.validateFood(highProteinPlate, postSurgeryProfile);
console.log('  Post-Surgery Evaluation: Score =', resPostSurgery.score, resPostSurgery.safetyBadgeText);
assert.strictEqual(resPostSurgery.safetyLevel, 'SAFE');
assert.ok(resPostSurgery.score >= 85);

// Profile CKD (Penyakit Ginjal Kronis non-dialisis: DILARANG protein berlebih!)
const ckdProfile = {
  weightKg: 60,
  heightCm: 165,
  conditionId: 'wellness',
  diseases: ['ckd']
};
const resCKD = validator.validateFood(highProteinPlate, ckdProfile);
console.log('  CKD Evaluation: Score =', resCKD.score, resCKD.safetyBadgeText);
assert.strictEqual(resCKD.safetyLevel, 'DANGER');
assert.ok(resCKD.score <= 60);
const ckdPilar = resCKD.pillars.find(p => p.title.includes('Biometrik'));
const ckdDangerItem = ckdPilar.items.find(i => i.type === 'danger');
assert.ok(ckdDangerItem, 'Harus ada peringatan bahaya kelebihan beban protein ginjal');
console.log('  ✅ CKD strict protein restriction confirmed:', ckdDangerItem.title);

// 3. Uji Hipertensi (Natrium Tinggi)
console.log('\nTest 3: Hypertension on High Sodium Food');
const highSodiumPlate = {
  name: 'Ikan Asin Balado & Sayur Asem',
  segments: [
    { name: 'Ikan Asin Goreng', portionGrams: 80, protein: [18, 20], cals: [180, 200], carbs: [2, 4], fat: [8, 10] },
    { name: 'Nasi Putih', portionGrams: 150, protein: [3, 4], cals: [195, 210], carbs: [42, 46], fat: [0.5, 1] }
  ]
};
const hypertensionProfile = {
  weightKg: 70,
  heightCm: 170,
  conditionId: 'wellness',
  diseases: ['hipertensi']
};
const resHT = validator.validateFood(highSodiumPlate, hypertensionProfile);
console.log('  Hypertension Evaluation: Score =', resHT.score, resHT.safetyBadgeText);
assert.strictEqual(resHT.safetyLevel, 'DANGER');
const htPilar = resHT.pillars.find(p => p.title.includes('Penyakit'));
const htItem = htPilar.items.find(i => i.disease === 'Hipertensi' && i.type === 'danger');
assert.ok(htItem, 'Harus ada peringatan bahaya natrium');
console.log('  ✅ Hypertension sodium restriction confirmed:', htItem.title);

// 4. Uji Diabetes Mellitus (Gula & Karbohidrat Cepat Serap)
console.log('\nTest 4: Diabetes Mellitus on High Sugar / Simple Carbs');
const highSugarPlate = {
  name: 'Kolak Pisang Manis & Nasi Uduk Porsi Besar',
  segments: [
    { name: 'Kolak Pisang Manis Sirup', portionGrams: 150, protein: [2, 3], cals: [280, 310], carbs: [55, 60], fat: [8, 10] },
    { name: 'Nasi Uduk Gurih', portionGrams: 200, protein: [4, 5], cals: [290, 320], carbs: [58, 65], fat: [9, 11] }
  ]
};
const diabeticProfile = {
  weightKg: 68,
  heightCm: 168,
  conditionId: 'wellness',
  diseases: ['diabetes']
};
const resDM = validator.validateFood(highSugarPlate, diabeticProfile);
console.log('  Diabetes Evaluation: Score =', resDM.score, resDM.safetyBadgeText);
assert.strictEqual(resDM.safetyLevel, 'DANGER');
const dmPilar = resDM.pillars.find(p => p.title.includes('Penyakit'));
const dmItem = dmPilar.items.find(i => i.disease === 'Diabetes Mellitus' && i.type === 'danger');
assert.ok(dmItem, 'Harus ada peringatan bahaya gula postprandial');
console.log('  ✅ Diabetes sugar/glycemic alert confirmed:', dmItem.title);

// 5. Uji Disfagia (Tekstur Keras / Alot / Bahaya Aspirasi)
console.log('\nTest 5: Dysphagia (Difficulty Swallowing) on Hard Texture Food');
const hardTexturePlate = {
  name: 'Keripik Tempe Renyah & Daging Alot Goreng',
  segments: [
    { name: 'Keripik Tempe Kering Renyah', portionGrams: 70, protein: [10, 12], cals: [220, 240], carbs: [15, 18], fat: [12, 14], texture: 'hard' }
  ]
};
const dysphagiaProfile = {
  weightKg: 62,
  heightCm: 165,
  conditionId: 'post-surgery',
  symptoms: ['dysphagia']
};
const resDysphagia = validator.validateFood(hardTexturePlate, dysphagiaProfile);
console.log('  Dysphagia Evaluation: Score =', resDysphagia.score, resDysphagia.safetyBadgeText);
assert.strictEqual(resDysphagia.safetyLevel, 'DANGER');
const dysPilar = resDysphagia.pillars.find(p => p.title.includes('Gejala'));
const dysItem = dysPilar.items.find(i => i.type === 'danger' && i.title.includes('ASPIRASI'));
assert.ok(dysItem, 'Harus ada bahaya aspirasi paru untuk disfagia');
console.log('  ✅ Dysphagia IDDSI texture alert confirmed:', dysItem.title);

// 6. Uji Alergi / Pantangan Pribadi
console.log('\nTest 6: Declared Restrictions / Allergies (e.g. Udang / Seafood)');
const seafoodPlate = {
  name: 'Tumis Udang & Buncis',
  segments: [
    { name: 'Udang Segar', portionGrams: 100, protein: [20, 22], cals: [110, 120], carbs: [1, 2], fat: [1, 2] }
  ]
};
const allergicProfile = {
  weightKg: 65,
  heightCm: 170,
  restrictions: 'Alergi udang, telur'
};
const resAllergy = validator.validateFood(seafoodPlate, allergicProfile);
console.log('  Allergy Evaluation: Score =', resAllergy.score, resAllergy.safetyBadgeText);
assert.strictEqual(resAllergy.safetyLevel, 'DANGER');
const allgPilar = resAllergy.pillars.find(p => p.title.includes('Gejala'));
const allgItem = allgPilar.items.find(i => i.title.includes('KONTRAINDIKASI ALERGEN'));
assert.ok(allgItem, 'Harus ada peringatan alergen terdeteksi');
console.log('  ✅ Personal allergy alert confirmed:', allgItem.title);

console.log('\n🎉 ALL DEEP CLINICAL FOOD VALIDATION UNIT TESTS PASSED SUCCESSFULLY! 🚀');
