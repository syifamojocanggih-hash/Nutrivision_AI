const express = require('express');
const db = require('../database/connection');
const { optionalAuth, requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Preset taxonomy recovery metadata map for dynamic calculations
const RECOVERY_TAXONOMY_MAP = {
  post_op_digestive: {
    protocol: 'Konsensus ESPEN Surgery, ERAS Society & IDDSI Protocol',
    groupKey: 'medical',
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Hari 1–5',
        title: 'Fase Adaptasi Cair Jernih & Saring',
        desc: 'Diet cair jernih bertransisi ke sup saring bening, stabilisasi elektrolit, dan pencegahan ileus pasca-anestesi.',
        proteinMultiplier: 1.3,
        texture: 'Cair jernih, kaldu saring, puree halus',
        superfoods: ['Kaldu Ikan Gabus Bening', 'Air Kelapa Murni', 'Puree Labu Kuning Halus']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Hari 6–21 (Aktif)',
        title: 'Fase Regenerasi Mukosa & Makanan Lunak',
        desc: 'Makanan lunak tim saring kaya albumin & L-Glutamin untuk epitelisasi mukosa usus dan integritas jahitan.',
        proteinMultiplier: 1.5,
        texture: 'Lunak tim, bubur halus, tahu sutra kukus',
        superfoods: ['Ikan Gabus Tim Albumin', 'Tahu Sutra Kukus Kaldu', 'Putih Telur Rebus']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 4–12',
        title: 'Fase Adaptasi Padat & Reintroduksi Serat',
        desc: 'Pengenalan serat larut air bertahap, normalisasi motilitas peristaltik usus, dan diet seimbang padat.',
        proteinMultiplier: 1.4,
        texture: 'Padat lunak ke normal berkuah',
        superfoods: ['Dada Ayam Kukus Jahe', 'Nasi Tim Beras Putih/Merah', 'Sayur Oyong Bening']
      }
    ]
  },
  post_op_oncology: {
    protocol: 'ESPEN Clinical Practice Guideline in Oncology & Immunonutrition',
    groupKey: 'medical',
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Hari 1–7',
        title: 'Fase Suplementasi Imunonutrisi Awal',
        desc: 'Fokus suplementasi Arginin, Asam Lemak Omega-3 (EPA/DHA), & RNA nukleotida untuk modulasi imunitas.',
        proteinMultiplier: 1.6,
        texture: 'Cair tinggi protein, smoothies nutrisi',
        superfoods: ['Smoothie Alpukat Whey', 'Susu Peptida Terhidrolisis', 'Kaldu Jamur Shiitake']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Hari 8–30 (Aktif)',
        title: 'Fase Preservasi Masa Otot & Anti-Kakeksia',
        desc: 'Pencegahan depletif lemas (kakeksia) dengan rasio kalori tinggi & protein padat kaya antioksidan.',
        proteinMultiplier: 1.8,
        texture: 'Lunak tim berkuah, puree protein tinggi',
        superfoods: ['Ikan Salmon Kukus Lemon', 'Telur Omega-3 Rebus', 'Sup Wortel Brokoli Puree']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Bulan 2–6',
        title: 'Fase Rumatan Long-term & Pemulihan Stamina',
        desc: 'Pemeliharaan status gizi optimal pasca-kemo/radioterapi dengan keanekaragaman pangan antioksidan.',
        proteinMultiplier: 1.5,
        texture: 'Makanan biasa seimbang tinggi mikronutrien',
        superfoods: ['Dada Ayam Panggang Herbal', 'Nasi Merah Organik', 'Jus Buah Naga Bit']
      }
    ]
  },
  gym_hypertrophy: {
    protocol: 'ISSN Position Stand: Protein & Exercise Biomechanics',
    groupKey: 'fitness',
    phases: [
      {
        phaseNum: 1,
        chip: 'Fase 1 · Minggu 1–2',
        title: 'Fase Primer Adaptasi Neuromuskular',
        desc: 'Kondisikan penyimpanan glikogen otot & keseimbangan nitrogen positif awal program hipertrofi.',
        proteinMultiplier: 1.8,
        texture: 'Padat protein tinggi, karbohidrat kompleks',
        superfoods: ['Dada Ayam Panggang', 'Nasi Merah', 'Putih Telur']
      },
      {
        phaseNum: 2,
        chip: 'Fase 2 · Minggu 3–8 (Aktif)',
        title: 'Fase Sintesis Protein Otot & Hipertrofi',
        desc: 'Stimulasi maksimal MPS (Muscle Protein Synthesis) dengan 1.8–2.2 g/kgBB protein & leusin tinggi.',
        proteinMultiplier: 2.0,
        texture: 'Padat tinggi protein & karbo cepat cerna post-workout',
        superfoods: ['Daging Sapi Lean Grills', 'Tempe Kukus Tinggi Leusin', 'Banana Oats Shake']
      },
      {
        phaseNum: 3,
        chip: 'Fase 3 · Minggu 9–12',
        title: 'Fase Konsolidasi & Rekonstruksi Jaringan',
        desc: 'Restrukturisasi miofibril dan stabilisasi retensi massa bebas lemak (Fat-Free Mass).',
        proteinMultiplier: 1.8,
        texture: 'Makanan seimbang tinggi serat & elektrolit',
        superfoods: ['Ikan Tuna Panggang', 'Ubi Jalar Rebus', 'Brokoli Kukus']
      }
    ]
  }
};

function getTaxonomyMeta(condId) {
  if (RECOVERY_TAXONOMY_MAP[condId]) return RECOVERY_TAXONOMY_MAP[condId];
  if (condId && (condId.startsWith('post_op') || condId.startsWith('medical') || condId === 'post-surgery')) {
    return RECOVERY_TAXONOMY_MAP['post_op_digestive'];
  }
  return RECOVERY_TAXONOMY_MAP['gym_hypertrophy'];
}

/**
 * GET /api/phases/progress
 * Fetch dynamic clinical recovery phase roadmap & completion percentages from TiDB Cloud database
 */
router.get('/progress', optionalAuth, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.query.userId || 'usr_patient_siti';
    let requestedCond = req.query.conditionId;

    // 1. Fetch user biometrics from TiDB `users` table
    const user = await db.get('SELECT id, name, weight_kg, clinical_condition, recovery_phase FROM users WHERE id = ?', [userId]);
    const weightKg = (user && user.weight_kg) ? parseFloat(user.weight_kg) : 65.0;
    const condId = requestedCond || (user && user.clinical_condition) || 'post_op_digestive';

    // 2. Query dynamic phase state from TiDB `patient_recovery_phases` table
    let phaseRecord = await db.get(
      'SELECT * FROM patient_recovery_phases WHERE user_id = ? AND condition_id = ?',
      [userId, condId]
    );

    if (!phaseRecord) {
      const recordId = `ph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        await db.run(
          `INSERT INTO patient_recovery_phases 
           (id, user_id, condition_id, active_phase, phase1_status, phase1_pct, phase2_status, phase2_pct, phase3_status, phase3_pct)
           VALUES (?, ?, ?, 2, 'completed', 100, 'active', 35, 'upcoming', 0)`,
          [recordId, userId, condId]
        );
      } catch (insertErr) {
        console.warn('Insert initial phase record notice:', insertErr.message);
      }
      phaseRecord = {
        id: recordId,
        user_id: userId,
        condition_id: condId,
        active_phase: 2,
        phase1_status: 'completed',
        phase1_pct: 100,
        phase2_status: 'active',
        phase2_pct: 35,
        phase3_status: 'upcoming',
        phase3_pct: 0
      };
    }

    // 3. Query logged meals from TiDB `meals` table to compute real-time dynamic progress
    const meals = await db.query(
      'SELECT id, timestamp, total_protein FROM meals WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100',
      [userId]
    );

    const uniqueDays = new Set(meals.map(m => m.timestamp ? new Date(m.timestamp).toISOString().split('T')[0] : null).filter(Boolean));
    const daysLoggedCount = uniqueDays.size;

    const totalProteinLogged = meals.reduce((sum, m) => sum + (parseFloat(m.total_protein) || 0), 0);
    const avgDailyProtein = daysLoggedCount > 0 ? (totalProteinLogged / daysLoggedCount) : (meals.length > 0 ? totalProteinLogged / meals.length : 0);

    // 4. Construct dynamic response
    const meta = getTaxonomyMeta(condId);
    const activePhaseNum = parseInt(phaseRecord.active_phase) || 2;

    const phases = meta.phases.map((p) => {
      const isCompleted = p.phaseNum < activePhaseNum;
      const isActive = p.phaseNum === activePhaseNum;
      const isUpcoming = p.phaseNum > activePhaseNum;

      const status = isCompleted ? 'completed' : (isActive ? 'active' : 'upcoming');
      const badgeText = isCompleted ? 'Selesai' : (isActive ? 'Fase Berjalan' : 'Tahap Lanjut');

      const targetProteinG = Math.round(weightKg * p.proteinMultiplier * 10) / 10;
      const targetProteinStr = `${p.proteinMultiplier} g/kgBB (~${targetProteinG}g/hari)`;

      let dynamicPct = 0;
      if (isCompleted) {
        dynamicPct = 100;
      } else if (isUpcoming) {
        dynamicPct = 0;
      } else {
        // Active Phase: Dynamically calculate from actual TiDB logged meal compliance
        if (daysLoggedCount > 0 && targetProteinG > 0) {
          const proteinAdherence = Math.min(1.25, avgDailyProtein / targetProteinG);
          const daysFactor = Math.min(1.0, daysLoggedCount / 7.0);
          dynamicPct = Math.min(100, Math.max(15, Math.round((daysFactor * 0.5 + proteinAdherence * 0.5) * 100)));
        } else {
          dynamicPct = phaseRecord[`phase${p.phaseNum}_pct`] || 35;
        }
      }

      return {
        phaseNum: p.phaseNum,
        chip: p.chip,
        title: p.title,
        desc: p.desc,
        status,
        badgeText,
        progressPct: dynamicPct,
        proteinMultiplier: p.proteinMultiplier,
        targetProteinG,
        proteinTarget: targetProteinStr,
        texture: p.texture,
        superfoods: p.superfoods
      };
    });

    return res.json({
      success: true,
      conditionId: condId,
      protocol: meta.protocol,
      groupKey: meta.groupKey,
      activePhase: activePhaseNum,
      userWeightKg: weightKg,
      daysLoggedCount,
      avgDailyProtein: Math.round(avgDailyProtein * 10) / 10,
      phases,
      updatedAt: phaseRecord.updated_at || new Date().toISOString()
    });

  } catch (err) {
    console.error('Get dynamic phase progress error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/phases/progress
 * Save updated active condition and phase progress to TiDB Cloud database
 */
router.put('/progress', optionalAuth, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.body.userId || 'usr_patient_siti';
    const { conditionId, activePhase, phase1_pct, phase2_pct, phase3_pct } = req.body;

    if (!conditionId) {
      return res.status(400).json({ success: false, message: 'conditionId is required' });
    }

    const phaseNum = parseInt(activePhase) || 2;
    const p1Status = phaseNum > 1 ? 'completed' : 'active';
    const p2Status = phaseNum > 2 ? 'completed' : (phaseNum === 2 ? 'active' : 'upcoming');
    const p3Status = phaseNum === 3 ? 'active' : 'upcoming';

    const p1Pct = phase1_pct !== undefined ? parseInt(phase1_pct) : (phaseNum > 1 ? 100 : 35);
    const p2Pct = phase2_pct !== undefined ? parseInt(phase2_pct) : (phaseNum > 2 ? 100 : (phaseNum === 2 ? 35 : 0));
    const p3Pct = phase3_pct !== undefined ? parseInt(phase3_pct) : (phaseNum === 3 ? 35 : 0);

    // 1. Update or Insert in `patient_recovery_phases` table in TiDB Cloud
    const existing = await db.get(
      'SELECT id FROM patient_recovery_phases WHERE user_id = ? AND condition_id = ?',
      [userId, conditionId]
    );

    if (existing) {
      await db.run(
        `UPDATE patient_recovery_phases SET
           active_phase = ?,
           phase1_status = ?, phase1_pct = ?,
           phase2_status = ?, phase2_pct = ?,
           phase3_status = ?, phase3_pct = ?,
           updated_at = NOW()
         WHERE user_id = ? AND condition_id = ?`,
        [phaseNum, p1Status, p1Pct, p2Status, p2Pct, p3Status, p3Pct, userId, conditionId]
      );
    } else {
      const recordId = `ph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.run(
        `INSERT INTO patient_recovery_phases
         (id, user_id, condition_id, active_phase, phase1_status, phase1_pct, phase2_status, phase2_pct, phase3_status, phase3_pct)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [recordId, userId, conditionId, phaseNum, p1Status, p1Pct, p2Status, p2Pct, p3Status, p3Pct]
      );
    }

    // 2. Also update `users` table `clinical_condition` & `recovery_phase` for consistency
    await db.run(
      'UPDATE users SET clinical_condition = ?, recovery_phase = ? WHERE id = ?',
      [conditionId, `phase${phaseNum}`, userId]
    );

    return res.json({
      success: true,
      message: 'Status fase pemulihan berhasil diperbarui di database TiDB Cloud.',
      conditionId,
      activePhase: phaseNum
    });
  } catch (err) {
    console.error('Update phase progress error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/phases/select-phase
 * Select active phase for patient in TiDB database
 */
router.post('/select-phase', optionalAuth, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.body.userId || 'usr_patient_siti';
    const { conditionId, phaseNum } = req.body;

    const targetPhase = parseInt(phaseNum) || 2;
    const condId = conditionId || 'post_op_digestive';

    const recordId = `ph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.run(
      `INSERT INTO patient_recovery_phases (id, user_id, condition_id, active_phase)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE active_phase = VALUES(active_phase), updated_at = NOW()`,
      [recordId, userId, condId, targetPhase]
    );

    await db.run(
      'UPDATE users SET clinical_condition = ?, recovery_phase = ? WHERE id = ?',
      [condId, `phase${targetPhase}`, userId]
    );

    return res.json({
      success: true,
      message: `Fase ${targetPhase} berhasil diaktifkan di TiDB Cloud database.`,
      conditionId: condId,
      activePhase: targetPhase
    });
  } catch (err) {
    console.error('Select phase error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
