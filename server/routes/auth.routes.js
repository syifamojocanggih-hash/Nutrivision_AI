const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { generateToken, requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Helper: Calculate Clinical Biometrics & Nutrition Targets
 */
function calculateNutritionTargets(weightKg, heightCm, age, gender, condition, activityLevel) {
  const w = parseFloat(weightKg) || 65;
  const h = parseFloat(heightCm) || 165;
  const a = parseInt(age) || 45;
  const g = gender || 'male';

  // 1. BMI
  const hMeters = h / 100;
  const bmi = parseFloat((w / (hMeters * hMeters)).toFixed(1));

  // 2. Basal Metabolic Rate (Harris-Benedict Formula)
  let bmr = (g === 'female')
    ? 655.1 + (9.563 * w) + (1.850 * h) - (4.676 * a)
    : 66.5 + (13.75 * w) + (5.003 * h) - (6.755 * a);

  // Activity Factor
  let actMultiplier = 1.2;
  if (activityLevel === 'light') actMultiplier = 1.375;
  if (activityLevel === 'moderate') actMultiplier = 1.55;
  if (activityLevel === 'active') actMultiplier = 1.725;

  // Clinical Injury / Stress Factor (ERAS Guidelines)
  let stressMultiplier = 1.2;
  if (condition === 'post-surgery') stressMultiplier = 1.3;
  if (condition === 'rehabilitation') stressMultiplier = 1.25;
  if (condition === 'gym-recovery') stressMultiplier = 1.35;

  const dailyCalories = Math.round(bmr * actMultiplier * (stressMultiplier / 1.15));

  let protPerKg = 1.5;
  if (condition === 'post-surgery') protPerKg = 1.6;
  if (condition === 'rehabilitation') protPerKg = 1.5;
  if (condition === 'gym-recovery') protPerKg = 1.8;

  const targetProtein = Math.round(w * protPerKg);
  const targetCarbs = Math.round((dailyCalories * 0.50) / 4);
  const targetFat = Math.round((dailyCalories * 0.25) / 9);

  return { bmi, dailyCalories, targetProtein, targetCarbs, targetFat };
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return {
    ...rest,
    restrictions: typeof rest.restrictions === 'string' ? JSON.parse(rest.restrictions || '[]') : (rest.restrictions || []),
    allergies: typeof rest.allergies === 'string' ? JSON.parse(rest.allergies || '[]') : (rest.allergies || [])
  };
}

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const {
      email, password, name, phone, age, gender,
      clinicalCondition, recoveryPhase, weightKg, heightCm,
      activityLevel, restrictions, allergies
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan kata sandi wajib diisi.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.get('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar. Silakan masuk.' });
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const passwordHash = bcrypt.hashSync(password, 10);

    const calc = calculateNutritionTargets(
      weightKg || 65,
      heightCm || 168,
      age || 45,
      gender || 'male',
      clinicalCondition || 'post-surgery',
      activityLevel || 'light'
    );

    await db.run(`
      INSERT INTO users (
        id, name, email, password_hash, phone, role, age, gender,
        clinical_condition, recovery_phase, weight_kg, height_cm, bmi,
        activity_level, restrictions, allergies, daily_calories,
        target_protein, target_carbs, target_fat
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      name.trim(),
      cleanEmail,
      passwordHash,
      phone ? phone.trim() : null,
      'patient',
      parseInt(age) || 45,
      gender || 'male',
      clinicalCondition || 'post-surgery',
      recoveryPhase || 'phase2',
      parseFloat(weightKg) || 65.0,
      parseFloat(heightCm) || 168.0,
      calc.bmi,
      activityLevel || 'light',
      JSON.stringify(restrictions || []),
      JSON.stringify(allergies || []),
      calc.dailyCalories,
      calc.targetProtein,
      calc.targetCarbs,
      calc.targetFat
    ]);

    // Audit log
    await db.run(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      ['log_' + Date.now(), userId, 'USER_REGISTER', `Akun terdaftar: ${name} (${cleanEmail})`, req.ip || '127.0.0.1']
    );

    const createdUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    const token = generateToken(createdUser);

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil! Selamat datang di NutriVision AI.',
      token,
      user: sanitizeUser(createdUser)
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat pendaftaran: ' + err.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak cocok.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak cocok.' });
    }

    // Audit log
    await db.run(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      ['log_' + Date.now(), user.id, 'USER_LOGIN', `Login sukses: ${user.name}`, req.ip || '127.0.0.1']
    );

    const token = generateToken(user);
    return res.json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat login: ' + err.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Profil pengguna tidak ditemukan.' });
    }
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/auth/profile
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const {
      name, phone, age, gender, clinicalCondition,
      recoveryPhase, weightKg, heightCm, activityLevel,
      restrictions, allergies
    } = req.body;

    const newWeight = weightKg !== undefined ? parseFloat(weightKg) : currentUser.weight_kg;
    const newHeight = heightCm !== undefined ? parseFloat(heightCm) : currentUser.height_cm;
    const newAge = age !== undefined ? parseInt(age) : currentUser.age;
    const newGender = gender || currentUser.gender;
    const newCondition = clinicalCondition || currentUser.clinical_condition;
    const newActivity = activityLevel || currentUser.activity_level;

    const calc = calculateNutritionTargets(newWeight, newHeight, newAge, newGender, newCondition, newActivity);

    await db.run(`
      UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        age = ?,
        gender = ?,
        clinical_condition = ?,
        recovery_phase = COALESCE(?, recovery_phase),
        weight_kg = ?,
        height_cm = ?,
        bmi = ?,
        activity_level = ?,
        restrictions = COALESCE(?, restrictions),
        allergies = COALESCE(?, allergies),
        daily_calories = ?,
        target_protein = ?,
        target_carbs = ?,
        target_fat = ?
      WHERE id = ?
    `, [
      name ? name.trim() : null,
      phone ? phone.trim() : null,
      newAge,
      newGender,
      newCondition,
      recoveryPhase || null,
      newWeight,
      newHeight,
      calc.bmi,
      newActivity,
      restrictions ? JSON.stringify(restrictions) : null,
      allergies ? JSON.stringify(allergies) : null,
      calc.dailyCalories,
      calc.targetProtein,
      calc.targetCarbs,
      calc.targetFat,
      userId
    ]);

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    await db.run(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      ['log_' + Date.now(), userId, 'PROFILE_UPDATE', `Update profil biometrik & diagnostik nutrisi`, req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      message: 'Profil klinis dan target gizi berhasil diperbarui!',
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil: ' + err.message });
  }
});

module.exports = router;
