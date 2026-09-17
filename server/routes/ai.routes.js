const express = require('express');
const db = require('../database/connection');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:5050';

/**
 * GET /api/ai/health
 * Check status of Python AI Inference Service (.safetensors)
 */
router.get('/health', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${PYTHON_AI_URL}/api/ai/health`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return res.json({
        success: true,
        aiService: 'Online',
        ...data
      });
    } else {
      return res.json({
        success: false,
        aiService: 'Degraded',
        statusCode: response.status
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      aiService: 'Offline (Fallback active)',
      error: err.message
    });
  }
});

/**
 * POST /api/ai/classify
 * Analyze food description, meal plan, or community recipe text using DistilBERT model
 */
router.post('/classify', optionalAuth, async (req, res) => {
  try {
    const { text, patientId } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Teks makanan atau resep wajib diisi.' });
    }

    const userId = req.user ? req.user.id : (patientId || 'usr_patient_siti');
    const patient = await db.get('SELECT * FROM users WHERE id = ?', [userId]) || {
      id: userId,
      restrictions: '[]',
      allergies: '[]'
    };

    let allergies = [];
    let restrictions = [];
    try {
      allergies = typeof patient.allergies === 'string' ? JSON.parse(patient.allergies || '[]') : (patient.allergies || []);
      restrictions = typeof patient.restrictions === 'string' ? JSON.parse(patient.restrictions || '[]') : (patient.restrictions || []);
    } catch (e) {}

    // Call Python AI Service
    let aiResult = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const aiResponse = await fetch(`${PYTHON_AI_URL}/api/ai/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          allergies,
          restrictions
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (aiResponse.ok) {
        const aiJson = await aiResponse.json();
        aiResult = aiJson.analysis;
      }
    } catch (serviceErr) {
      console.warn('[AI Service] Python service unreachable, using clinical heuristic fallback:', serviceErr.message);
    }

    // If Python service was down, use smart clinical fallback
    if (!aiResult) {
      const lower = text.toLowerCase();
      const hasWarning = ['goreng', 'jelantah', 'santan kental', 'pedas', 'cabe', 'berlemak'].some(k => lower.includes(k));
      const hasSafe = ['gabus', 'albumin', 'telur', 'kukus', 'rebus', 'tim', 'bening', 'sayur', 'tempe', 'tahu'].some(k => lower.includes(k));

      const predictedClass = hasWarning ? 2 : (hasSafe ? 0 : 1);
      const intentMap = { "0": "meal_plan", "1": "nutrisi", "2": "workout" };
      const predictedIntent = intentMap[String(predictedClass)];
      const intentNames = {
        meal_plan: 'Perencana Menu Pemulihan',
        nutrisi: 'Analisis Komposisi Gizi',
        workout: 'Rehabilitasi Fisik & Gerak'
      };

      const isClass0 = predictedClass === 0;
      const isClass2 = predictedClass === 2;

      aiResult = {
        predictedClass,
        intent: predictedIntent,
        intentName: intentNames[predictedIntent] || predictedIntent,
        intentMap,
        label: isClass0 ? 'AMAN_TINGGI_GIZI' : (isClass2 ? 'PERINGATAN_PANTANGAN' : 'NETRAL_MODERASI'),
        name: isClass0 ? 'Aman & Direkomendasikan (Tinggi Gizi)' : (isClass2 ? 'Peringatan Pantangan / Hati-hati' : 'Netral (Konsumsi Wajar)'),
        confidence: isClass0 ? 94.0 : (isClass2 ? 88.0 : 72.0),
        clinicalAdvice: isClass0
          ? 'Bahan pangan kaya nutrisi albumin & protein ramah penyembuhan jaringan pasca-bedah.'
          : (isClass2 ? 'Sebaiknya dihindari selama masa pemulihan luka bedah akut.' : 'Kandungan gizi seimbang, perhatikan porsi.'),
        engine: 'Clinical Rule Fallback',
        nutrients: {
          protein: isClass0 ? 28.5 : (isClass2 ? 8.5 : 18.0),
          albumin: isClass0 ? 6.2 : (isClass2 ? 0.8 : 2.5),
          calories: isClass0 ? 320 : (isClass2 ? 510 : 380),
          carbs: isClass0 ? 35.0 : (isClass2 ? 46.0 : 48.0),
          fat: isClass0 ? 5.0 : (isClass2 ? 26.0 : 11.0),
          vitaminsPct: isClass0 ? 85 : (isClass2 ? 25 : 65),
          mineralsPct: isClass0 ? 80 : (isClass2 ? 30 : 60),
          targetProtein: 98.0,
          targetCalories: 1850
        },
        config: {
          modelType: 'distilbert',
          vocabSize: 119547
        }
      };
    }

    // Check allergy and clinical restrictions conflict against patient profile
    const conflicts = [];
    const lowerText = text.toLowerCase();

    // 1. Check direct & tokenized allergies
    allergies.forEach(a => {
      const aLower = a.toLowerCase();
      if (lowerText.includes(aLower) || aLower.split(/\s+/).some(w => w.length > 3 && lowerText.includes(w))) {
        conflicts.push(`Alergi: ${a}`);
      }
    });

    // 2. Check post-operative clinical restrictions (e.g. jelantah, gorengan, santan, pedas)
    restrictions.forEach(r => {
      const rLower = r.toLowerCase();
      const keywords = rLower.split(/\s+/).filter(w => w.length > 3 && !['bebas', 'tanpa', 'tidak', 'rendah'].includes(w));
      if (keywords.some(k => lowerText.includes(k))) {
        conflicts.push(`Pantangan Pasca-Bedah: ${r}`);
      }
    });

    if (conflicts.length > 0) {
      aiResult.patientConflict = {
        hasConflict: true,
        conflictingAllergies: conflicts,
        warningNote: `PERINGATAN REKAM MEDIS: Mengandung bahan bertentangan dengan rekam medis pasien (${conflicts.join(', ')})!`
      };
      // Escalation: If food violates patient post-op medical record, enforce Warning
      aiResult.predictedClass = 2;
      aiResult.label = 'PERINGATAN_PANTANGAN';
      aiResult.name = 'Peringatan Pantangan Pasien';
      aiResult.clinicalAdvice = `Terdeteksi konflik langsung dengan rekam medis pasien pasca bedah: ${conflicts.join(', ')}.`;
    }

    aiResult.patientProfile = {
      name: patient.name || 'Siti Rahma',
      condition: patient.clinical_condition || 'post-surgery',
      recoveryPhase: patient.recovery_phase || 'phase2',
      targetProtein: Number(patient.target_protein || 93.0),
      dailyCalories: Number(patient.daily_calories || 1820)
    };

    // Log to MySQL audit_logs
    await db.run(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [
        'log_ai_' + Date.now(),
        userId,
        'AI_INFERENCE_SAFETENSORS',
        `Klasifikasi teks gizi [${aiResult.label}]: "${text.substring(0, 60)}"`,
        req.ip || '127.0.0.1'
      ]
    );

    return res.json({
      success: true,
      text: text.trim(),
      result: aiResult
    });
  } catch (err) {
    console.error('AI classify error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/ai/symptom-filter
 * Clinical Nutrition & Food Filter AI Agent (Symptom-Aware Texture & Food Filter)
 * Strict Priority Rules: Priority 1 (Dysphagia) > Priority 2 (GI Tract) > Priority 3 (Appetite)
 */
router.post('/symptom-filter', optionalAuth, async (req, res) => {
  try {
    const { symptoms } = req.body;
    const { clinicalNutritionFilterAgent } = require('../../js/symptom_filter_agent.js');

    const selectedSymptoms = Array.isArray(symptoms) ? symptoms : (typeof symptoms === 'string' ? [symptoms] : []);
    const filterResult = clinicalNutritionFilterAgent.process(selectedSymptoms);

    return res.json({
      success: true,
      ...filterResult
    });
  } catch (err) {
    console.error('Symptom filter error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
