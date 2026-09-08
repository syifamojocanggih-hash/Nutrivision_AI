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
