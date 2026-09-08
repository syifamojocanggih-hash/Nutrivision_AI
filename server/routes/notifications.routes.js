const express = require('express');
const db = require('../database/connection');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

function sanitizeNotification(n) {
  if (!n) return null;
  return {
    ...n,
    is_read: Boolean(n.is_read),
    data: typeof n.data_json === 'string' ? JSON.parse(n.data_json || '{}') : (n.data_json || {})
  };
}

/**
 * GET /api/notifications
 * Get user smart notifications with unread counter
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.query.userId || 'usr_patient_siti');
    const limit = parseInt(req.query.limit) || 30;

    const notifs = await db.query(`
      SELECT * FROM notifications
      WHERE user_id = ? OR user_id IS NULL
      ORDER BY created_at DESC
      LIMIT ?
    `, [userId, limit]);

    const unreadCountRow = await db.get(`
      SELECT COUNT(*) as unread
      FROM notifications
      WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0
    `, [userId]);

    return res.json({
      success: true,
      unreadCount: unreadCountRow?.unread || 0,
      total: notifs.length,
      notifications: notifs.map(sanitizeNotification)
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark single notification as read
 */
router.put('/:id/read', async (req, res) => {
  try {
    const notifId = req.params.id;
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [notifId]);
    return res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'usr_patient_siti');
    await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL', [userId]);
    return res.json({ success: true, message: 'Semua notifikasi berhasil ditandai sudah dibaca.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/notifications/simulate-trigger
 * Triggers interactive simulation for the 4 smart notification scenarios
 */
router.post('/simulate-trigger', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'usr_patient_siti');
    const type = req.body.type || 'evening_reminder'; // 'morning_reminder', 'evening_reminder', 'price_change', 'info'

    // Fetch user clinical metrics
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]) || {
      id: userId,
      name: 'Siti Rahma',
      target_protein: 93.0,
      daily_calories: 1820
    };

    const notifId = 'notif_sim_' + Date.now();
    let title = '';
    let message = '';
    let icon = 'bell';
    let badgeColor = 'teal';
    let data = {};

    switch (type) {
      case 'morning_reminder': {
        title = 'Target Pemulihan Pagi (06:00 WIB)';
        message = `Selamat Pagi ${user.name}! Target pemulihan Anda hari ini: ${user.target_protein}g Protein & ${user.daily_calories} kkal. Awali sarapan dengan sumber albumin (contoh: Bubur Ikan Gabus Saring atau Putih Telur Rebus).`;
        icon = 'sun';
        badgeColor = 'amber';
        data = { targetProtein: user.target_protein, dailyCalories: user.daily_calories, targetHour: 6 };
        break;
      }

      case 'evening_reminder': {
        // Query today's meals
        const todayMeals = await db.query(
          'SELECT SUM(total_protein) as total_prot, SUM(total_calories) as total_cal FROM meals WHERE user_id = ? AND DATE(timestamp) = CURDATE()',
          [userId]
        );

        const currentProt = todayMeals[0]?.total_prot || 52.0;
        const targetProt = user.target_protein || 93.0;
        const deficit = Math.max(0, Math.round((targetProt - currentProt) * 10) / 10);

        if (deficit > 0) {
          title = 'Pengingat Gizi Makan Malam (18:00 WIB)';
          message = `Perhatian: Asupan protein Anda hari ini baru mencapai ${currentProt}g dari target ${targetProt}g (Defisit ${deficit}g). Disarankan makan malam dengan Tim Ikan Gabus (32g) + Tempe Kukus (12g) sebelum jam 20:00 untuk mendukung regenerasi jaringan saat tidur!`;
          icon = 'moon';
          badgeColor = 'rose';
          data = { currentProtein: currentProt, targetProtein: targetProt, deficitGrams: deficit, targetHour: 18, isUrgent: true };
        } else {
          title = 'Target Gizi Harian Tercapai! (18:00 WIB)';
          message = `Hebat! Anda telah mencapai target protein harian ${currentProt}g/${targetProt}g hari ini. Pertahankan hidrasi hangat malam ini untuk mengoptimalkan sintesis albumin.`;
          icon = 'shield-check';
          badgeColor = 'emerald';
          data = { currentProtein: currentProt, targetProtein: targetProt, deficitGrams: 0, targetHour: 18, isOptimal: true };
        }
        break;
      }

      case 'price_change': {
        const discountFoods = [
          { name: 'Ikan Gabus Segar', oldPrice: 30000, newPrice: 24000, benefit: 'Albumin Tinggi' },
          { name: 'Telur Ayam Ras', oldPrice: 2400, newPrice: 2000, benefit: 'Protein Putih Telur' },
          { name: 'Tempe Kedelai Murni', oldPrice: 6000, newPrice: 5000, benefit: 'Isoflavon & Anti-inflamasi' }
        ];
        const randomFood = discountFoods[Math.floor(Math.random() * discountFoods.length)];
        const savings = randomFood.oldPrice - randomFood.newPrice;

        title = `Hemat Nutrisi: Harga ${randomFood.name} Turun!`;
        message = `Info Pasar Lokal: Harga ${randomFood.name} turun menjadi Rp ${randomFood.newPrice.toLocaleString('id-ID')} (hemat Rp ${savings.toLocaleString('id-ID')}). Manfaat klinis: ${randomFood.benefit}. Rekomendasi hemat untuk menu hari ini!`;
        icon = 'trending-down';
        badgeColor = 'emerald';
        data = { food: randomFood, savings };
        break;
      }

      case 'info':
      default: {
        title = 'Info Klinis Pemulihan ERAS Terbaru';
        message = 'Kemenkes RI & ESPEN memperbarui pedoman nutrisi pasca-bedah: Hindari gorengan bersantan kental pada minggu pertama pasca-operasi; utamakan metode kukus, tim, dan sup bening berprotein tinggi.';
        icon = 'sparkles';
        badgeColor = 'teal';
        data = { category: 'clinical_news', source: 'ESPEN Clinical Guidelines 2026' };
        break;
      }
    }

    await db.run(`
      INSERT INTO notifications (
        id, user_id, type, title, message, icon, badge_color, data_json, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
    `, [
      notifId,
      type === 'info' ? null : userId,
      type,
      title,
      message,
      icon,
      badgeColor,
      JSON.stringify(data)
    ]);

    const created = await db.get('SELECT * FROM notifications WHERE id = ?', [notifId]);

    return res.status(201).json({
      success: true,
      message: `Notifikasi cerdas tipe [${type}] berhasil dipicu!`,
      notification: sanitizeNotification(created)
    });
  } catch (err) {
    console.error('Trigger smart notification error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/notifications/evaluate-smart
 * Evaluates current time or patient status and generates smart notifications if needed
 */
router.post('/evaluate-smart', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'usr_patient_siti');
    const hour = req.body.hour !== undefined ? parseInt(req.body.hour) : new Date().getHours();

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan.' });
    }

    const generated = [];

    // 1. Morning 06:00 AM Evaluation
    if (hour >= 6 && hour < 11) {
      // Check if morning reminder already exists today
      const existingMorning = await db.get(`
        SELECT id FROM notifications
        WHERE user_id = ? AND type = 'morning_reminder' AND DATE(created_at) = CURDATE()
      `, [userId]);

      if (!existingMorning) {
        const notifId = 'notif_morn_' + Date.now();
        await db.run(`
          INSERT INTO notifications (id, user_id, type, title, message, icon, badge_color, data_json, is_read)
          VALUES (?, ?, 'morning_reminder', ?, ?, 'sun', 'amber', ?, 0)
        `, [
          notifId,
          userId,
          'Target Pemulihan Pagi (06:00 WIB)',
          `Selamat Pagi ${user.name}! Target pemulihan Anda hari ini: ${user.target_protein}g Protein & ${user.daily_calories} kkal. Awali sarapan dengan nutrisi albumin lembut untuk mempercepat granulasi luka.`,
          JSON.stringify({ targetProtein: user.target_protein, dailyCalories: user.daily_calories, targetHour: 6 })
        ]);
        generated.push('morning_reminder');
      }
    }

    // 2. Evening 18:00 (06:00 PM) Deficit Evaluation
    if (hour >= 18) {
      const existingEvening = await db.get(`
        SELECT id FROM notifications
        WHERE user_id = ? AND type = 'evening_reminder' AND DATE(created_at) = CURDATE()
      `, [userId]);

      if (!existingEvening) {
        const mealsSum = await db.get(`
          SELECT SUM(total_protein) as prot FROM meals
          WHERE user_id = ? AND DATE(timestamp) = CURDATE()
        `, [userId]);

        const currentProt = mealsSum?.prot || 0;
        const deficit = Math.max(0, Math.round((user.target_protein - currentProt) * 10) / 10);

        if (deficit > 0) {
          const notifId = 'notif_eve_' + Date.now();
          await db.run(`
            INSERT INTO notifications (id, user_id, type, title, message, icon, badge_color, data_json, is_read)
            VALUES (?, ?, 'evening_reminder', ?, ?, 'moon', 'rose', ?, 0)
          `, [
            notifId,
            userId,
            'Pengingat Gizi Makan Malam (18:00 WIB)',
            `Perhatian: Asupan protein Anda hari ini baru ${currentProt}g dari target ${user.target_protein}g (Defisit ${deficit}g). Disarankan makan malam dengan Tim Ikan Gabus (32g) atau Pepes Tempe sebelum tidur!`,
            JSON.stringify({ currentProtein: currentProt, targetProtein: user.target_protein, deficitGrams: deficit, targetHour: 18 })
          ]);
          generated.push('evening_reminder');
        }
      }
    }

    return res.json({
      success: true,
      evaluatedHour: hour,
      generatedCount: generated.length,
      generatedTypes: generated
    });
  } catch (err) {
    console.error('Evaluate smart notifications error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
