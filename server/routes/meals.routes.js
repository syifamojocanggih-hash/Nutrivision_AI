const express = require('express');
const db = require('../database/connection');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

function sanitizeMeal(meal) {
  if (!meal) return null;
  return {
    ...meal,
    segments: typeof meal.segments_json === 'string' ? JSON.parse(meal.segments_json || '[]') : (meal.segments_json || [])
  };
}

/**
 * GET /api/meals
 * Retrieve user's logged meals
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    if (!userId) {
      return res.json({ success: true, count: 0, meals: [] });
    }
    const limit = parseInt(req.query.limit) || 50;

    const meals = await db.query(
      'SELECT * FROM meals WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    );

    return res.json({
      success: true,
      count: meals.length,
      meals: meals.map(sanitizeMeal)
    });
  } catch (err) {
    console.error('Get meals error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/meals/today
 * Retrieve only today's logged meals for the current user
 */
router.get('/today', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    if (!userId) {
      return res.json({
        success: true,
        date: new Date().toISOString().split('T')[0],
        count: 0,
        summary: { totalProtein: 0, totalCalories: 0, totalCarbs: 0, totalFat: 0 },
        meals: []
      });
    }

    const meals = await db.query(
      `SELECT * FROM meals
       WHERE user_id = ? AND DATE(timestamp) = CURDATE()
       ORDER BY timestamp DESC`,
      [userId]
    );

    const totalProtein = meals.reduce((sum, m) => sum + (parseFloat(m.total_protein) || 0), 0);
    const totalCalories = meals.reduce((sum, m) => sum + (parseInt(m.total_calories) || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (parseFloat(m.total_carbs) || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (parseFloat(m.total_fat) || 0), 0);

    return res.json({
      success: true,
      date: new Date().toISOString().split('T')[0],
      count: meals.length,
      summary: {
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCalories: Math.round(totalCalories),
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10
      },
      meals: meals.map(sanitizeMeal)
    });
  } catch (err) {
    console.error('Get today meals error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/meals/date/:date
 * Retrieve meals for a specific date (YYYY-MM-DD)
 */
router.get('/date/:date', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.query.userId || 'usr_patient_siti');
    const { date } = req.params;

    // Basic YYYY-MM-DD validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Format tanggal tidak valid. Gunakan YYYY-MM-DD.' });
    }

    const meals = await db.query(
      `SELECT * FROM meals
       WHERE user_id = ? AND DATE(timestamp) = ?
       ORDER BY timestamp DESC`,
      [userId, date]
    );

    const totalProtein = meals.reduce((sum, m) => sum + (parseFloat(m.total_protein) || 0), 0);
    const totalCalories = meals.reduce((sum, m) => sum + (parseInt(m.total_calories) || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (parseFloat(m.total_carbs) || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (parseFloat(m.total_fat) || 0), 0);

    return res.json({
      success: true,
      date,
      count: meals.length,
      summary: {
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCalories: Math.round(totalCalories),
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10
      },
      meals: meals.map(sanitizeMeal)
    });
  } catch (err) {
    console.error('Get meals by date error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/meals
 * Log a newly scanned or custom meal
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'usr_patient_siti');
    const {
      title, mealType, totalCalories, totalProtein, totalCarbs,
      totalFat, imageUrl, confidence, clinicalAdvice, segments
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Judul hidangan makanan wajib diisi.' });
    }

    const mealId = 'meal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    await db.run(`
      INSERT INTO meals (
        id, user_id, meal_type, title, timestamp, total_calories,
        total_protein, total_carbs, total_fat, image_url, confidence,
        clinical_advice, segments_json
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      mealId,
      userId,
      mealType || 'lunch',
      title.trim(),
      parseInt(totalCalories) || 0,
      parseFloat(totalProtein) || 0,
      parseFloat(totalCarbs) || 0,
      parseFloat(totalFat) || 0,
      imageUrl || 'images/plate_bubur_gabus.jpg',
      parseInt(confidence) || 92,
      clinicalAdvice || 'Asupan nutrisi telah dicatat ke pemantauan klinis ERAS.',
      JSON.stringify(segments || [])
    ]);

    // Audit log
    await db.run(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      ['log_' + Date.now(), userId, 'LOG_MEAL', `Pencatatan hidangan: ${title} (${totalProtein}g protein)`, req.ip || '127.0.0.1']
    );

    const created = await db.get('SELECT * FROM meals WHERE id = ?', [mealId]);

    return res.status(201).json({
      success: true,
      message: 'Asupan piring makanan berhasil dicatat ke progres harian!',
      meal: sanitizeMeal(created)
    });
  } catch (err) {
    console.error('Log meal error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mencatat asupan: ' + err.message });
  }
});

/**
 * GET /api/meals/weekly-stats
 * 7-Day compliance breakdown against patient clinical target
 */
router.get('/weekly-stats', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    if (!userId) {
      return res.json({
        success: true,
        userId: 'guest',
        targetProtein: 75,
        targetCalories: 1850,
        averageCompliancePct: 0,
        days: []
      });
    }
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]) || { target_protein: 98, daily_calories: 1850 };

    const targetProtein = user.target_protein || 98;
    const targetCalories = user.daily_calories || 1850;

    // Fetch meals from last 7 days (MySQL DATE() and DATE_SUB)
    const meals = await db.query(`
      SELECT
        DATE_FORMAT(timestamp, '%Y-%m-%d') as meal_date,
        DAYOFWEEK(timestamp) as day_of_week,
        SUM(total_protein) as daily_protein,
        SUM(total_calories) as daily_calories,
        COUNT(id) as meal_count
      FROM meals
      WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d'), DAYOFWEEK(timestamp)
      ORDER BY meal_date ASC
    `, [userId]);

    const daysNameId = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daysNameEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const today = new Date();
    const history = [];
    let totalPct = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();

      const record = meals.find(m => m.meal_date === dateStr);
      const proteinActual = record ? Math.round(record.daily_protein) : 0;
      const caloriesActual = record ? Math.round(record.daily_calories) : 0;
      const pct = Math.min(Math.round((proteinActual / targetProtein) * 100), 120);

      totalPct += pct;

      history.push({
        date: dateStr,
        dayId: daysNameId[dayIdx],
        dayEn: daysNameEn[dayIdx],
        targetProtein,
        actualProtein: proteinActual,
        targetCalories,
        actualCalories: caloriesActual,
        compliancePct: pct,
        status: pct >= 85 ? 'Tercapai' : (pct >= 50 ? 'Terpantau' : 'Kurang')
      });
    }

    const avgCompliance = Math.round(totalPct / 7);

    return res.json({
      success: true,
      userId,
      targetProtein,
      targetCalories,
      averageCompliancePct: avgCompliance,
      days: history
    });
  } catch (err) {
    console.error('Weekly stats error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/meals/:id
 */
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const mealId = req.params.id;
    const userId = req.user ? req.user.id : null;

    let query = 'DELETE FROM meals WHERE id = ?';
    let params = [mealId];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    const result = await db.run(query, params);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Riwayat makanan tidak ditemukan.' });
    }

    return res.json({ success: true, message: 'Riwayat makanan berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
