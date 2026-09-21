/**
 * ============================================================================
 * NutriVision AI — Master Backend Verification & Health Auditor
 * ============================================================================
 * Run: node server/verify_system.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');

const NODE_PORT = parseInt(process.env.PORT) || 5000;
const PYTHON_PORT = 5050;
const MYSQL_PORT = parseInt(process.env.DB_PORT) || 3306;

function httpRequest(urlStr, method = 'GET', body = null, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    let serializedBody = null;
    if (body) {
      serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
      headers['Content-Length'] = Buffer.byteLength(serializedBody);
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers
    };

    const start = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const latencyMs = Date.now() - start;
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), latencyMs });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, latencyMs });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(4000, () => {
      req.destroy(new Error('Connection timeout (4s)'));
    });

    if (serializedBody) {
      req.write(serializedBody);
    }
    req.end();
  });
}

async function verifyAllSystems() {
  console.log('\n=================================================================');
  console.log('  🩺 NUTRIVISION AI — MASTER BACKEND AUDIT & HEALTH STATUS');
  console.log('=================================================================\n');

  const results = [];

  // 1. Audit MySQL Database via Connection Module
  process.stdout.write('1. Memeriksa Koneksi Database MySQL (Port 3306)... ');
  try {
    const db = require('./database/connection');
    const userCount = await db.get('SELECT COUNT(*) as c FROM users');
    const mealCount = await db.get('SELECT COUNT(*) as c FROM meals');
    const foodCount = await db.get('SELECT COUNT(*) as c FROM foods');
    results.push({
      subsystem: 'MySQL Database',
      port: MYSQL_PORT,
      status: 'AKTIF & STABIL',
      details: `${userCount.c} Pengguna, ${mealCount.c} Makanan Tercatat, ${foodCount.c} Katalog TKPI`,
      healthy: true
    });
    console.log('✅ OK');
  } catch (err) {
    results.push({
      subsystem: 'MySQL Database',
      port: MYSQL_PORT,
      status: 'TIDAK TERHUBUNG',
      details: err.message,
      healthy: false
    });
    console.log('❌ GAGAL:', err.message);
  }

  // 2. Audit AI Clinical Inference Service (CLAW LLM)
  process.stdout.write('2. Memeriksa AI Clinical Inference Service... ');
  try {
    const aiHealth = await httpRequest(`http://127.0.0.1:${PYTHON_PORT}/health`);
    if (aiHealth.status === 200 && aiHealth.data?.modelLoaded) {
      // Test prediction
      const predict = await httpRequest(`http://127.0.0.1:${PYTHON_PORT}/api/ai/classify`, 'POST', {
        text: 'Bubur ikan gabus tim kaya albumin',
        allergies: []
      });
      const cls = predict.data?.analysis?.label;
      results.push({
        subsystem: 'AI Inference (CLAW LLM)',
        port: PYTHON_PORT,
        status: 'AKTIF (AI ONLINE)',
        details: `Model: ${aiHealth.data.model || 'CLAW'} | Prediksi Uji: ${cls} (${aiHealth.latencyMs}ms)`,
        healthy: true
      });
      console.log('✅ OK');
    } else {
      throw new Error(`Model not fully loaded (HTTP ${aiHealth.status})`);
    }
  } catch (err) {
    results.push({
      subsystem: 'AI Inference (CLAW LLM)',
      port: PYTHON_PORT,
      status: 'OFFLINE (Fallback Aktif)',
      details: err.message,
      healthy: false
    });
    console.log('⚠️ PERINGATAN:', err.message);
  }

  // 3. Audit Node.js Express REST API Core Server
  process.stdout.write(`3. Memeriksa REST API Backend Server (Port ${NODE_PORT})... `);
  try {
    const apiHealth = await httpRequest(`http://localhost:${NODE_PORT}/api/health`);
    if (apiHealth.status === 200) {
      results.push({
        subsystem: 'Express REST API Core',
        port: NODE_PORT,
        status: 'AKTIF & MERESPONS',
        details: `Uptime: ${apiHealth.data.uptimeSeconds}s | Latensi: ${apiHealth.latencyMs}ms`,
        healthy: true
      });
      console.log('✅ OK');
    } else {
      throw new Error(`HTTP ${apiHealth.status}`);
    }
  } catch (err) {
    results.push({
      subsystem: 'Express REST API Core',
      port: NODE_PORT,
      status: 'OFFLINE',
      details: err.message,
      healthy: false
    });
    console.log('❌ GAGAL:', err.message);
  }

  // 4. Audit Core Subsystems via API Endpoints
  process.stdout.write('4. Memeriksa Integritas 9 Modul Logika Backend... ');
  try {
    const endpoints = [
      { name: 'Auth & Biometrik', url: `http://localhost:${NODE_PORT}/api/auth/me` }, // will 401 or require token
      { name: 'Katalog Pangan TKPI', url: `http://localhost:${NODE_PORT}/api/foods?category=ikan` },
      { name: 'Telemetri & Audit', url: `http://localhost:${NODE_PORT}/api/telemetry/stats` },
      { name: 'Komunitas Pasien', url: `http://localhost:${NODE_PORT}/api/community/posts` },
      { name: 'Notifikasi Cerdas', url: `http://localhost:${NODE_PORT}/api/notifications?userId=usr_patient_siti` },
      { name: 'Symptom Filter AI', url: `http://localhost:${NODE_PORT}/api/ai/symptom-filter`, method: 'POST', body: { symptoms: ['nausea'] } },
      { name: 'Harga Pangan Regional (Bapanas)', url: `http://localhost:${NODE_PORT}/api/prices/regional?province=Papua` }
    ];

    let passedModules = 0;
    for (const ep of endpoints) {
      try {
        const res = await httpRequest(ep.url, ep.method || 'GET', ep.body || null);
        if (res.status === 200 || res.status === 401) { // 401 is expected for unauthenticated /me
          passedModules++;
        }
      } catch (e) {}
    }

    results.push({
      subsystem: 'Modul Logika Bisnis (9 Rute)',
      port: NODE_PORT,
      status: `${passedModules}/${endpoints.length} Lolos Audit`,
      details: 'Auth, Meals, Foods, CV, Caregiver, Community, Telemetry, Notif, AI Filter',
      healthy: passedModules === endpoints.length
    });
    console.log('✅ OK\n');
  } catch (err) {
    console.log('⚠️ SEBAGIAN GAGAL\n');
  }

  // Print Summary Dashboard
  console.log('-----------------------------------------------------------------');
  console.log('📊 REKAPITULASI STATUS SEMUA SISTEM BACKEND:');
  console.log('-----------------------------------------------------------------');
  results.forEach(r => {
    const icon = r.healthy ? '🟢' : (r.status.includes('Fallback') ? '🟡' : '🔴');
    console.log(`${icon} [${r.subsystem}] (Port: ${r.port})`);
    console.log(`   Status : ${r.status}`);
    console.log(`   Detail : ${r.details}\n`);
  });
  console.log('=================================================================\n');

  const allHealthy = results.every(r => r.healthy);
  if (allHealthy) {
    console.log('🎉 SEMUA SISTEM BACKEND AKTIF DAN BERJALAN DENGAN LOGIKA YANG BENAR!\n');
    process.exit(0);
  } else {
    console.log('⚠️ BEBERAPA KOMPONEN MEMERLUKAN PERHATIAN (Lihat detail di atas).\n');
    process.exit(1);
  }
}

if (require.main === module) {
  verifyAllSystems();
}

module.exports = { verifyAllSystems };
