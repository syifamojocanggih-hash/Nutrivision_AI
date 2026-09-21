/**
 * ============================================================================
 * NutriVision AI — Backend API Automated Test Suite
 * ============================================================================
 */

const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting NutriVision AI Backend API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('1. Health Check:');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'GET /api/health returned HTTP 200');
    assert(health.data?.status === 'ok', 'Health response status is "ok"');
    assert(health.data?.database?.includes('MySQL'), `Database engine confirmed MySQL (${health.data?.database})`);

    // 2. Auth - Login Demo Patient
    console.log('\n2. Auth - Login:');
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'pasien@nutrivision.id',
      password: 'pasien123'
    });
    assert(loginRes.status === 200, 'POST /api/auth/login returned HTTP 200');
    assert(!!loginRes.data?.token, 'Received valid JWT token');
    const userToken = loginRes.data?.token;

    // 3. Auth - Get Me
    console.log('\n3. Auth - Current User Profile:');
    const meRes = await request('GET', '/api/auth/me', null, userToken);
    assert(meRes.status === 200, 'GET /api/auth/me returned HTTP 200');
    assert(meRes.data?.user?.name === 'Siti Rahma', 'User is Siti Rahma');
    assert(meRes.data?.user?.target_protein === 93, 'Target protein is 93g');

    // 4. Foods - Catalog & Symptom Filters
    console.log('\n4. Food Catalog (TKPI):');
    const foodsAll = await request('GET', '/api/foods');
    assert(foodsAll.status === 200, 'GET /api/foods returned HTTP 200');
    assert(foodsAll.data?.foods?.length > 5, `Foods count: ${foodsAll.data?.foods?.length}`);

    const foodsSearch = await request('GET', '/api/foods?q=gabus');
    assert(foodsSearch.data?.foods?.length >= 1, 'Search "gabus" found snakehead fish');

    const foodsDysphagia = await request('GET', '/api/foods?symptom=dysphagia');
    assert(foodsDysphagia.data?.foods?.length >= 2, 'Dysphagia symptom filter returns puree/soft foods');

    // 5. Meals - Get User Meals
    console.log('\n5. Meal Tracking:');
    const mealsRes = await request('GET', '/api/meals', null, userToken);
    assert(mealsRes.status === 200, 'GET /api/meals returned HTTP 200');
    assert(mealsRes.data?.meals?.length >= 1, 'Found logged meals');

    // Log a new meal
    const newMeal = await request('POST', '/api/meals', {
      title: 'Ikan Gabus Tim & Nasi Merah Organik',
      mealType: 'dinner',
      totalCalories: 450,
      totalProtein: 38.0,
      totalCarbs: 45.0,
      totalFat: 6.0,
      confidence: 96,
      clinicalAdvice: 'Mendukung fase proliferasi jaringan dengan albumin tinggi.',
      segments: [
        { name: 'Ikan Gabus Tim', portionGrams: 140, protein: [32, 36], cals: [140, 160] },
        { name: 'Nasi Merah', portionGrams: 100, protein: [3, 4], cals: [110, 130] }
      ]
    }, userToken);
    assert(newMeal.status === 201, 'POST /api/meals created new meal (HTTP 201)');

    // Weekly stats
    const statsRes = await request('GET', '/api/meals/weekly-stats', null, userToken);
    assert(statsRes.status === 200, 'GET /api/meals/weekly-stats returned HTTP 200');
    assert(statsRes.data?.days?.length === 7, 'Weekly stats contains exactly 7 days');

    // Clean up test meal to keep user journal clean
    if (newMeal.data?.meal?.id) {
      const delRes = await request('DELETE', `/api/meals/${newMeal.data.meal.id}`, null, userToken);
      assert(delRes.status === 200, 'DELETE /api/meals/:id cleaned up test meal');
    }

    // 6. Computer Vision Simulation & Analysis
    console.log('\n6. Computer Vision Analysis:');
    const cvRes = await request('POST', '/api/cv/analyze', {
      presetKey: 'soft_bubur_gabus'
    });
    assert(cvRes.status === 200, 'POST /api/cv/analyze returned HTTP 200');
    assert(cvRes.data?.data?.confidence === 96, 'CV Confidence is 96%');
    assert(cvRes.data?.data?.segments?.length === 3, 'Identified 3 plate segments');

    // 7. Caregiver Access Portal
    console.log('\n7. Caregiver Portal:');
    const cgRes = await request('POST', '/api/caregiver/generate-token', {
      caregiverName: 'Budi (Anak Pendamping)',
      role: 'family'
    }, userToken);
    assert(cgRes.status === 201, 'POST /api/caregiver/generate-token returned HTTP 201');
    const token = cgRes.data?.token;

    const cgView = await request('GET', `/api/caregiver/view/${token}`);
    assert(cgView.status === 200, 'GET /api/caregiver/view/:token returned HTTP 200');
    assert(cgView.data?.patient?.name === 'Siti Rahma', 'Caregiver view shows patient Siti Rahma');
    assert(cgView.data?.mode === 'READ_ONLY_TELEHEALTH', 'Caregiver portal is read-only');

    // 8. Community Sharing
    console.log('\n8. Community & Recipes:');
    const postsRes = await request('GET', '/api/community/posts');
    assert(postsRes.status === 200, 'GET /api/community/posts returned HTTP 200');
    assert(postsRes.data?.posts?.length >= 2, 'Found initial community posts');

    const firstPostId = postsRes.data?.posts[0]?.id;
    const likeRes = await request('POST', `/api/community/posts/${firstPostId}/like`);
    assert(likeRes.status === 200, 'POST /api/community/posts/:id/like incremented like count');

    // 9. Telemetry & Audit Logs
    console.log('\n9. Telemetry & Audit:');
    const telemStats = await request('GET', '/api/telemetry/stats');
    assert(telemStats.status === 200, 'GET /api/telemetry/stats returned HTTP 200');
    assert(telemStats.data?.stats?.totalUsers >= 4, 'Stats total users count is valid');

    const auditLogs = await request('GET', '/api/telemetry/audit-logs?limit=5');
    assert(auditLogs.status === 200, 'GET /api/telemetry/audit-logs returned HTTP 200');
    assert(auditLogs.data?.logs?.length >= 3, 'Audit trail logs populated');

    // 10. Smart Clinical Notifications
    console.log('\n10. Smart Clinical Notifications (Pagi 06:00, Malam 18:00, Harga, Info):');
    const notifsRes = await request('GET', '/api/notifications', null, userToken);
    assert(notifsRes.status === 200, 'GET /api/notifications returned HTTP 200');
    assert(notifsRes.data?.notifications !== undefined, 'Received notifications array');

    // Test Morning 06:00 AM target reminder trigger
    const morningTrigger = await request('POST', '/api/notifications/simulate-trigger', {
      type: 'morning_reminder'
    }, userToken);
    assert(morningTrigger.status === 201, 'POST /api/notifications/simulate-trigger (morning_reminder) returned HTTP 201');
    assert(morningTrigger.data?.notification?.icon === 'sun', 'Morning notification uses "sun" icon and morning target');

    // Test Evening 18:00 PM deficit reminder trigger
    const eveningTrigger = await request('POST', '/api/notifications/simulate-trigger', {
      type: 'evening_reminder'
    }, userToken);
    assert(eveningTrigger.status === 201, 'POST /api/notifications/simulate-trigger (evening_reminder) returned HTTP 201');
    assert(
      eveningTrigger.data?.notification?.icon === 'moon' || eveningTrigger.data?.notification?.icon === 'shield-check',
      `Evening notification evaluated condition (icon: "${eveningTrigger.data?.notification?.icon}", title: "${eveningTrigger.data?.notification?.title}")`
    );

    // Test Food Price Change trigger
    const priceTrigger = await request('POST', '/api/notifications/simulate-trigger', {
      type: 'price_change'
    }, userToken);
    assert(priceTrigger.status === 201, 'POST /api/notifications/simulate-trigger (price_change) returned HTTP 201');
    assert(priceTrigger.data?.notification?.type === 'price_change', 'Price notification generated with local discount savings');

    // Test Clinical Info trigger
    const infoTrigger = await request('POST', '/api/notifications/simulate-trigger', {
      type: 'info'
    }, userToken);
    assert(infoTrigger.status === 201, 'POST /api/notifications/simulate-trigger (info) returned HTTP 201');

    // Test Mark All as Read
    const readAllRes = await request('PUT', '/api/notifications/read-all', {}, userToken);
    assert(readAllRes.status === 200, 'PUT /api/notifications/read-all returned HTTP 200');

    // 11. NutriVision AI Model Service (CLAW LLM)
    console.log('\n11. NutriVision AI Model Service (CLAW LLM):');
    const aiHealth = await request('GET', '/api/ai/health');
    assert(aiHealth.status === 200, 'GET /api/ai/health returned HTTP 200');
    assert(aiHealth.data?.success === true, 'AI Health success is true');
    assert(aiHealth.data?.modelLoaded === true, 'NutriVision AI Model (CLAW) successfully initialized');

    const aiSafeTest = await request('POST', '/api/ai/classify', {
      text: 'Sup kaldu bening labu siam dengan ikan gabus kukus halus dan telur rebus',
      patientId: 'P-88219'
    });
    assert(aiSafeTest.status === 200, 'POST /api/ai/classify (Safe meal) returned HTTP 200');
    assert(aiSafeTest.data?.result?.predictedClass === 0, 'Classified as AMAN_TINGGI_GIZI (Class 0)');
    assert(aiSafeTest.data?.result?.confidence >= 50, 'Confidence score >= 50%');

    const aiWarningTest = await request('POST', '/api/ai/classify', {
      text: 'Ayam goreng krispi pedas ekstra sambal korek minyak panas',
      patientId: 'P-88219'
    });
    assert(aiWarningTest.status === 200, 'POST /api/ai/classify (Warning meal) returned HTTP 200');
    assert(aiWarningTest.data?.result?.predictedClass === 2, 'Classified as PERINGATAN_PANTANGAN (Class 2)');

    // 12. Symptom-Aware Texture & Food Filter Agent
    console.log('\n12. Clinical Symptom-Aware Texture & Food Filter AI Agent:');
    const symptomTest = await request('POST', '/api/ai/symptom-filter', {
      symptoms: ['dysphagia', 'nausea', 'constipation']
    });
    assert(symptomTest.status === 200, 'POST /api/ai/symptom-filter returned HTTP 200');
    assert(symptomTest.data?.safety_level === 'High', 'Safety level escalated to High for Dysphagia');
    assert(symptomTest.data?.texture_requirement?.includes('Puree'), 'Texture requirement strictly enforces Puree');
    assert(symptomTest.data?.recommended_menu?.length > 0, 'Menu recommendations synthesized successfully');

    console.log('\n==================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// If run directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
