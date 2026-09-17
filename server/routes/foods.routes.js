const express = require('express');
const db = require('../database/connection');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

function sanitizeFood(f) {
  if (!f) return null;
  return {
    ...f,
    symptom_tags: typeof f.symptom_tags === 'string' ? JSON.parse(f.symptom_tags || '[]') : (f.symptom_tags || [])
  };
}

/**
 * GET /api/foods
 * Query Indonesian TKPI food database with category, symptom, and search filters
 */
router.get('/', async (req, res) => {
  try {
    const { q, category, symptom, maxPrice } = req.query;

    let sql = 'SELECT * FROM foods WHERE 1=1';
    const params = [];

    if (q) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(clinical_note) LIKE ?)';
      const queryPattern = `%${q.trim().toLowerCase()}%`;
      params.push(queryPattern, queryPattern);
    }

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (maxPrice) {
      sql += ' AND price_est <= ?';
      params.push(parseInt(maxPrice));
    }

    sql += ' ORDER BY protein DESC';

    const rawFoods = await db.query(sql, params);
    const foods = rawFoods.map(sanitizeFood);

    // Apply symptom filtering if requested
    let filtered = foods;
    if (symptom) {
      const symLower = symptom.toLowerCase();
      filtered = foods.filter(f => {
        if (symLower === 'dysphagia' || symLower === 'disfagia') {
          return f.symptom_tags.includes('dysphagia_friendly') || f.symptom_tags.includes('easy_digest');
        }
        if (symLower === 'nausea' || symLower === 'mual') {
          return f.symptom_tags.includes('nausea_friendly') || f.symptom_tags.includes('hydration');
        }
        if (symLower === 'constipation' || symLower === 'sembelit') {
          return f.fiber >= 2.0 || f.symptom_tags.includes('high_fiber');
        }
        if (symLower === 'appetite' || symLower === 'nafsu_makan') {
          return f.calories >= 100 || f.symptom_tags.includes('high_protein');
        }
        return true;
      });
    }

    return res.json({
      success: true,
      total: filtered.length,
      foods: filtered
    });
  } catch (err) {
    console.error('Get foods error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/foods/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const food = await db.get('SELECT * FROM foods WHERE id = ?', [req.params.id]);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Data pangan tidak ditemukan di katalog TKPI.' });
    }
    return res.json({ success: true, food: sanitizeFood(food) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/foods (Admin only)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Hanya administrator yang dapat menambah katalog pangan.' });
    }

    const {
      name, category, portionGrams, calories, protein, carbs,
      fat, fiber, albumin, iron, vitaminC, zinc, priceEst,
      symptomTags, clinicalNote, imageUrl
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Nama pangan dan kategori wajib diisi.' });
    }

    const foodId = 'food_' + Date.now();

    await db.run(`
      INSERT INTO foods (
        id, name, category, portion_grams, calories, protein, carbs, fat,
        fiber, albumin, iron, vitamin_c, zinc, price_est, symptom_tags, clinical_note, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      foodId,
      name.trim(),
      category,
      parseInt(portionGrams) || 100,
      parseFloat(calories) || 0,
      parseFloat(protein) || 0,
      parseFloat(carbs) || 0,
      parseFloat(fat) || 0,
      parseFloat(fiber) || 0,
      parseFloat(albumin) || 0,
      parseFloat(iron) || 0,
      parseFloat(vitaminC) || 0,
      parseFloat(zinc) || 0,
      parseInt(priceEst) || 0,
      JSON.stringify(symptomTags || []),
      clinicalNote || 'Bahan pangan lokal Indonesia.',
      imageUrl || 'images/plate_nasi_ayam.jpg'
    ]);

    const created = await db.get('SELECT * FROM foods WHERE id = ?', [foodId]);
    return res.status(201).json({ success: true, message: 'Pangan berhasil ditambahkan ke katalog!', food: sanitizeFood(created) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
