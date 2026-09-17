/**
 * ============================================================================
 * NutriVision AI — Clinical Data Validation & Integrity Engine
 * Standards: Enhanced Recovery After Surgery (ERAS) & ESPEN Clinical Nutrition
 * ============================================================================
 */

class NutriVisionAdminValidator {
  constructor() {
    this.ERAS_PROTEIN_MIN = 1.2; // g/kg BB
    this.ERAS_PROTEIN_MAX = 2.2; // g/kg BB
    this.CALORIE_SAFE_MIN = 1200; // kkal/hari
    this.CALORIE_SAFE_MAX = 3500; // kkal/hari
  }

  /**
   * Menghitung BMI Pasien
   */
  calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return parseFloat(bmi.toFixed(1));
  }

  /**
   * Klasifikasi BMI Standar Asia-Pasifik (Kemenkes RI)
   */
  getBMICategory(bmi) {
    if (!bmi) return { label: 'Tidak Diketahui', color: '#64748B' };
    if (bmi < 18.5) return { label: 'Underweight (Kurang)', color: '#D97706' };
    if (bmi < 23.0) return { label: 'Normal / Ideal', color: '#059669' };
    if (bmi < 25.0) return { label: 'Kelebihan BB', color: '#2563EB' };
    return { label: 'Obesitas', color: '#DC2626' };
  }

  /**
   * Memvalidasi data klinis dan target nutrisi pengguna
   * @param {Object} user - Data pengguna
   * @returns {Object} Hasil validasi klinis
   */
  validateUserClinicalData(user) {
    if (!user) {
      return {
        status: 'INVALID',
        badgeClass: 'danger',
        label: 'Data Tidak Valid',
        details: 'Objek data pengguna kosong.',
        score: 0,
        flags: ['USER_EMPTY']
      };
    }

    const isPatient = !user.role || user.role === 'patient';
    const weight = parseFloat(user.weight) || 0;
    const height = parseFloat(user.height) || 0;
    const targetProtein = parseFloat(user.targetProtein) || 0;
    const targetCalories = parseFloat(user.targetCalories) || 0;
    const hasCompletedQuiz = Boolean(user.hasCompletedQuiz);
    const flags = [];

    // Jika bukan pasien (misal Admin atau Caregiver), validasi sistem biasa
    if (!isPatient) {
      return {
        status: 'SYSTEM_ROLE',
        badgeClass: 'system',
        label: user.role === 'admin' ? 'Super Admin' : 'Caregiver',
        proteinRatio: null,
        bmi: null,
        bmiCategory: null,
        isErasCompliant: true,
        details: 'Akun Otoritas / Pendamping Sistem (Bukan Subjek Rawat Pasien)',
        score: 100,
        flags: []
      };
    }

    // 1. Validasi Kuis & Kelengkapan Dasar
    if (!hasCompletedQuiz) {
      flags.push('QUIZ_INCOMPLETE');
    }
    if (weight <= 0) flags.push('WEIGHT_MISSING');
    if (height <= 0) flags.push('HEIGHT_MISSING');

    // 2. Hitung Rasio Protein (g / kg BB)
    let proteinRatio = null;
    let proteinStatus = 'UNKNOWN';
    let proteinComment = '';

    if (weight > 0 && targetProtein > 0) {
      proteinRatio = parseFloat((targetProtein / weight).toFixed(2));
      if (proteinRatio >= this.ERAS_PROTEIN_MIN && proteinRatio <= this.ERAS_PROTEIN_MAX) {
        proteinStatus = 'OPTIMAL_ERAS';
        proteinComment = `${proteinRatio} g/kg (Optimal Sesuai Protokol ERAS)`;
      } else if (proteinRatio < this.ERAS_PROTEIN_MIN) {
        proteinStatus = 'SUB_OPTIMAL';
        proteinComment = `${proteinRatio} g/kg (Di Bawah Rekomendasi ERAS < 1.2 g/kg)`;
        flags.push('PROTEIN_LOW');
      } else {
        proteinStatus = 'HIGH_INTAKE';
        proteinComment = `${proteinRatio} g/kg (Target Khusus/Agresif > 2.2 g/kg)`;
        flags.push('PROTEIN_HIGH');
      }
    } else {
      flags.push('PROTEIN_TARGET_MISSING');
    }

    // 3. Validasi Kalori
    let calorieStatus = 'OPTIMAL';
    let calorieComment = '';
    if (targetCalories > 0) {
      if (targetCalories >= this.CALORIE_SAFE_MIN && targetCalories <= this.CALORIE_SAFE_MAX) {
        calorieStatus = 'SAFE';
        calorieComment = `${targetCalories} kkal (Rentang Aman)`;
      } else if (targetCalories < this.CALORIE_SAFE_MIN) {
        calorieStatus = 'CALORIES_LOW';
        calorieComment = `${targetCalories} kkal (Di Bawah Baseline < 1200 kkal)`;
        flags.push('CALORIES_LOW');
      } else {
        calorieStatus = 'CALORIES_HIGH';
        calorieComment = `${targetCalories} kkal (Target Sangat Tinggi > 3500 kkal)`;
        flags.push('CALORIES_HIGH');
      }
    } else {
      flags.push('CALORIES_MISSING');
    }

    // 4. Hitung BMI
    const bmi = this.calculateBMI(weight, height);
    const bmiCategory = this.getBMICategory(bmi);

    // 5. Tentukan Status Validasi Akhir
    let status = 'VALID_OPTIMAL';
    let badgeClass = 'valid';
    let label = '✅ Sesuai ERAS (Optimal)';
    let score = 100;

    if (!hasCompletedQuiz) {
      status = 'PENDING_QUIZ';
      badgeClass = 'pending';
      label = '⏳ Belum Kuis';
      score = 40;
    } else if (flags.includes('PROTEIN_LOW') || flags.includes('CALORIES_LOW')) {
      status = 'NEEDS_ATTENTION';
      badgeClass = 'warning';
      label = '⚠️ Target Perlu Evaluasi';
      score = 70;
    } else if (flags.includes('PROTEIN_HIGH') || flags.includes('CALORIES_HIGH')) {
      status = 'CUSTOM_TARGET';
      badgeClass = 'info';
      label = 'ℹ️ Target Agresif/Khusus';
      score = 90;
    }

    // Jika admin sudah menandai verifikasi klinis manual
    if (user.isClinicallyVerified) {
      status = 'VERIFIED_BY_ADMIN';
      badgeClass = 'verified';
      label = '🌟 Terverifikasi Admin';
      score = 100;
    }

    return {
      status,
      badgeClass,
      label,
      score,
      proteinRatio,
      proteinStatus,
      proteinComment,
      calorieStatus,
      calorieComment,
      bmi,
      bmiCategory,
      flags,
      hasCompletedQuiz,
      isVerified: Boolean(user.isClinicallyVerified),
      verifiedAt: user.verifiedAt || null,
      verifiedBy: user.verifiedBy || null,
      lastValidated: new Date().toISOString()
    };
  }

  /**
   * Menghitung Ringkasan Validasi untuk Seluruh Pengguna
   */
  getValidationSummary(users = []) {
    const patients = users.filter(u => !u.role || u.role === 'patient');
    if (patients.length === 0) {
      return {
        totalPatients: 0,
        validPercentage: 100,
        optimalCount: 0,
        needsReviewCount: 0,
        pendingQuizCount: 0
      };
    }

    let optimalCount = 0;
    let needsReviewCount = 0;
    let pendingQuizCount = 0;

    patients.forEach(patient => {
      const val = this.validateUserClinicalData(patient);
      if (val.status === 'VALID_OPTIMAL' || val.status === 'VERIFIED_BY_ADMIN' || val.status === 'CUSTOM_TARGET') {
        optimalCount++;
      } else if (val.status === 'NEEDS_ATTENTION') {
        needsReviewCount++;
      } else if (val.status === 'PENDING_QUIZ') {
        pendingQuizCount++;
      }
    });

    const validPercentage = Math.round((optimalCount / patients.length) * 100);

    return {
      totalPatients: patients.length,
      validPercentage,
      optimalCount,
      needsReviewCount,
      pendingQuizCount
    };
  }
}

const nutriVisionAdminValidator = new NutriVisionAdminValidator();
if (typeof window !== 'undefined') {
  window.nutriVisionAdminValidator = nutriVisionAdminValidator;
}
