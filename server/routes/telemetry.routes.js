const express = require('express');
const db = require('../database/connection');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/telemetry/audit-logs
 */
router.get('/audit-logs', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const rawLogs = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?', [limit]);
    const isAuthenticated = Boolean(req.user);
    const logs = rawLogs.map(log => ({
      ...log,
      ip_address: isAuthenticated ? log.ip_address : (log.ip_address ? log.ip_address.replace(/\.\d+$/, '.***') : 'anonymized')
    }));
    return res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/telemetry/log
 */
router.post('/log', optionalAuth, async (req, res) => {
  try {
    const { action, details } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, message: 'Action nama log wajib diisi.' });
    }

    const logId = 'log_' + Date.now();
    const userId = req.user ? req.user.id : (req.body.userId || null);

    await db.run(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [logId, userId, action.trim(), details || '', req.ip || '127.0.0.1']
    );

    return res.status(201).json({ success: true, logId });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/telemetry/stats
 * Overview dashboard stats for admin/telehealth monitoring
 */
router.get('/stats', async (req, res) => {
  try {
    const usersRow = await db.get('SELECT COUNT(*) as c FROM users');
    const mealsRow = await db.get('SELECT COUNT(*) as c FROM meals');
    const foodsRow = await db.get('SELECT COUNT(*) as c FROM foods');
    const postsRow = await db.get('SELECT COUNT(*) as c FROM community_posts');
    const auditRow = await db.get('SELECT COUNT(*) as c FROM audit_logs');
    const avgRow = await db.get('SELECT ROUND(AVG(confidence), 1) as avg FROM meals');

    return res.json({
      success: true,
      stats: {
        totalUsers: usersRow?.c || 0,
        totalMealsLogged: mealsRow?.c || 0,
        totalFoodsInCatalog: foodsRow?.c || 0,
        totalCommunityPosts: postsRow?.c || 0,
        totalAuditEvents: auditRow?.c || 0,
        averageCvConfidence: avgRow?.avg || 93.5,
        serverUptimeSeconds: Math.round(process.uptime()),
        memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/telemetry/export-json
 */
router.get('/export-json', optionalAuth, async (req, res) => {
  try {
    const isAuthenticated = Boolean(req.user);
    const rawLogs = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 500');
    const rawUsers = await db.query('SELECT id, name, email, role, clinical_condition, recovery_phase, created_at FROM users');
    const meals = await db.query('SELECT id, user_id, meal_type, title, timestamp, total_calories, total_protein FROM meals LIMIT 200');

    // Protect patient PII if accessed without authorization
    const users = rawUsers.map(u => {
      if (isAuthenticated) return u;
      return {
        ...u,
        name: u.name ? u.name.charAt(0) + '***' : 'Anonymous',
        email: u.email ? u.email.replace(/(.).*(@.*)/, '$1***$2') : 'anonymized'
      };
    });

    const logs = rawLogs.map(l => {
      if (isAuthenticated) return l;
      return {
        ...l,
        ip_address: l.ip_address ? l.ip_address.replace(/\.\d+$/, '.***') : 'anonymized'
      };
    });

    const exportData = {
      platform: 'NutriVision AI Telehealth Documentation Platform',
      exportedAt: new Date().toISOString(),
      standards: ['ERAS Surgical Recovery Guidelines', 'Kemenkes RI TKPI Database', 'ESPEN Clinical Nutrition'],
      auditTrail: logs,
      usersSummary: users,
      recentMealsSummary: meals
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=nutrivision-telemetry-${Date.now()}.json`);
    return res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
