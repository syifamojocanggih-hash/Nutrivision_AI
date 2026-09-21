const express = require('express');
const crypto = require('crypto');
const db = require('../database/connection');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * POST /api/caregiver/generate-token
 * Generate secure read-only telehealth caregiver link
 */
router.post('/generate-token', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const caregiverName = req.body.caregiverName ? req.body.caregiverName.trim() : 'Pendamping Pasien';
    const role = req.body.role || 'family';

    const token = 'cg_' + crypto.randomBytes(16).toString('hex');
    const shareId = 'share_' + Date.now();

    await db.run(`
      INSERT INTO caregiver_shares (id, user_id, token, caregiver_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [shareId, userId, token, caregiverName, role]);

    await db.run(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      ['log_' + Date.now(), userId, 'CAREGIVER_SHARE_CREATED', `Tautan akses pendamping dibuat untuk: ${caregiverName}`, req.ip || '127.0.0.1']
    );

    return res.status(201).json({
      success: true,
      message: 'Tautan akses pendamping berhasil dibuat!',
      token,
      shareUrl: `/caregiver-view.html?token=${token}`,
      caregiverName,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Caregiver generate token error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/caregiver/view/:token
 * Read-only clinical patient stream for caregiver
 */
router.get('/view/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const share = await db.get('SELECT * FROM caregiver_shares WHERE token = ? AND is_active = 1', [token]);

    if (!share) {
      return res.status(404).json({ success: false, message: 'Tautan akses pendamping tidak valid atau sudah dicabut.' });
    }

    // Update last accessed
    await db.run('UPDATE caregiver_shares SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?', [share.id]);

    // Fetch patient public recovery metrics
    const patient = await db.get(`
      SELECT id, name, age, gender, clinical_condition, recovery_phase,
             weight_kg, height_cm, bmi, daily_calories, target_protein,
             restrictions, allergies
      FROM users WHERE id = ?
    `, [share.user_id]);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Data pasien tidak ditemukan.' });
    }

    // Fetch last 7 days of meals
    const meals = await db.query(
      'SELECT id, meal_type, title, timestamp, total_calories, total_protein, clinical_advice FROM meals WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20',
      [share.user_id]
    );

    await db.run(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      ['log_' + Date.now(), patient.id, 'CAREGIVER_PORTAL_ACCESSED', `Portal pendamping dibuka oleh: ${share.caregiver_name}`, req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      mode: 'READ_ONLY_TELEHEALTH',
      caregiverName: share.caregiver_name,
      role: share.role,
      patient: {
        ...patient,
        restrictions: typeof patient.restrictions === 'string' ? JSON.parse(patient.restrictions || '[]') : (patient.restrictions || []),
        allergies: typeof patient.allergies === 'string' ? JSON.parse(patient.allergies || '[]') : (patient.allergies || [])
      },
      mealsSummary: {
        totalLogged: meals.length,
        recentMeals: meals
      }
    });
  } catch (err) {
    console.error('Caregiver view error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
