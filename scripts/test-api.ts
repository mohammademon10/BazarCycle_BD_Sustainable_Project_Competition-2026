/**
 * BazarCycle BD Automated Integration Test Suite
 * Validates health checks, authentication, authorization, rule engine,
 * and core concurrency-safe pickup workflows.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let data: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data, headers: res.headers };
}

async function runAllTests() {
  console.log(`\n======================================================`);
  console.log(`🚀 Running BazarCycle BD Integration Tests`);
  console.log(`   Target Server: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let adminToken = '';
  let managerToken = '';
  let collectorToken = '';
  let createdWasteId = '';
  let createdPickupId = '';

  // 1. Health Endpoint
  await test('Health check returns HTTP 200 with healthy status', async () => {
    const res = await request('/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'healthy', `Expected status "healthy", got "${res.data.status}"`);
  });

  // 2. Public Impact Summary
  await test('Public impact summary returns valid aggregation metrics', async () => {
    const res = await request('/api/impact/summary');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(typeof res.data.total_waste_registered_kg === 'number', 'total_waste_registered_kg must be a number');
    assert(typeof res.data.total_estimated_value_bdt === 'number', 'total_estimated_value_bdt must be a number');
  });

  // 3. Rule Engine Recommendation
  await test('Rule engine computes deterministic value & avoided CO2 for 100kg vegetable waste', async () => {
    const res = await request('/api/waste/recommend', {
      method: 'POST',
      body: JSON.stringify({ category: 'Vegetable Waste', quantity_kg: 100 }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.estimated_value === 1500, `Expected 1500 BDT, got ${res.data.estimated_value}`);
    assert(res.data.co2_impact_estimate === 45, `Expected 45 kg CO2, got ${res.data.co2_impact_estimate}`);
    assert(res.data.recommended_pathway === 'Composting', `Expected Composting pathway, got ${res.data.recommended_pathway}`);
  });

  // 4. Rule Engine Validation Guard (quantity <= 0)
  await test('Rule engine rejects zero or negative waste quantity', async () => {
    const res = await request('/api/waste/recommend', {
      method: 'POST',
      body: JSON.stringify({ category: 'Vegetable Waste', quantity_kg: -5 }),
    });
    assert(res.status === 400, `Expected 400 for negative quantity, got ${res.status}`);
  });

  // 5. Authentication: Invalid Credentials
  await test('Login with incorrect password returns HTTP 401 Unauthorized', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@bazarcycle.bd', password: 'WrongPassword999!' }),
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // 6. Authentication: Admin Demo Login
  await test('Login as Platform Admin succeeds with valid JWT Bearer token', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@bazarcycle.bd', password: 'BazarCycle2026!' }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(typeof res.data.access_token === 'string', 'Expected access_token in response');
    assert(res.data.user.role === 'ADMIN', `Expected role ADMIN, got ${res.data.user.role}`);
    adminToken = res.data.access_token;
  });

  // 7. Authentication: Market Manager Demo Login
  await test('Login as Market Manager succeeds and returns manager profile', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'manager@bazarcycle.bd', password: 'BazarCycle2026!' }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.user.role === 'MARKET_MANAGER', `Expected role MARKET_MANAGER, got ${res.data.user.role}`);
    managerToken = res.data.access_token;
  });

  // 8. Authentication: Collector Demo Login
  await test('Login as Waste Collector succeeds and returns collector profile', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'collector@bazarcycle.bd', password: 'BazarCycle2026!' }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.user.role === 'COLLECTOR', `Expected role COLLECTOR, got ${res.data.user.role}`);
    collectorToken = res.data.access_token;
  });

  // 9. Profile Me endpoint
  await test('GET /api/auth/me returns authenticated user details', async () => {
    const res = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.email === 'manager@bazarcycle.bd', `Expected manager email, got ${res.data.email}`);
  });

  // 10. Role-Based Access Control: Unauthorized route access
  await test('Non-admin user (Collector) cannot create a market (HTTP 403 Forbidden)', async () => {
    const res = await request('/api/markets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${collectorToken}` },
      body: JSON.stringify({ name: 'Unauthorized Bazar', location: 'Dhaka', area: 'Central' }),
    });
    assert(res.status === 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  // 11. Waste Batch Creation by Manager
  await test('Market Manager can register a new waste batch with auto-valuation', async () => {
    const categoriesRes = await request('/api/waste/categories');
    assert(categoriesRes.status === 200, 'Categories must load');
    const cat = categoriesRes.data[0];

    const marketsRes = await request('/api/markets');
    assert(marketsRes.status === 200, 'Markets must load');
    const myMarketRes = await request('/api/markets/my/market', {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const m = myMarketRes.status === 200 ? myMarketRes.data : marketsRes.data[0];

    const res = await request('/api/waste/records', {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({
        market_id: m.id,
        category_id: cat.id,
        quantity_kg: 75.5,
        description: 'Automated integration test waste batch',
      }),
    });
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    assert(res.data.quantity_kg === 75.5, `Expected 75.5 kg, got ${res.data.quantity_kg}`);
    assert(typeof res.data.estimated_value === 'number', 'Estimated value must be computed');
    createdWasteId = res.data.id;
  });

  // 12. Pickup Request Dispatch
  await test('Market Manager can dispatch a pickup request for the registered batch', async () => {
    const res = await request('/api/pickups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({
        waste_record_id: createdWasteId,
        notes: 'Integration test pickup dispatch notes',
      }),
    });
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    assert(res.data.status === 'AVAILABLE', `Expected status AVAILABLE, got ${res.data.status}`);
    createdPickupId = res.data.id;
  });

  // 13. Duplicate Pickup Request Protection
  await test('Submitting duplicate pickup request for same batch is rejected', async () => {
    const res = await request('/api/pickups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({
        waste_record_id: createdWasteId,
      }),
    });
    assert(res.status === 400, `Expected 400 for duplicate pickup, got ${res.status}`);
  });

  // 14. Available Pickups Feed
  await test('Collector can browse newly created pickup on available feed', async () => {
    const res = await request('/api/pickups/available');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const found = res.data.some((p: any) => p.id === createdPickupId);
    assert(found, 'Created pickup must appear in available pickups list');
  });

  // 15. Concurrency Guard: Claiming Pickup
  await test('Collector can accept an available pickup (status becomes ACCEPTED)', async () => {
    const res = await request(`/api/pickups/${createdPickupId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${collectorToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'ACCEPTED', `Expected status ACCEPTED, got ${res.data.status}`);
  });

  // 16. Concurrency Conflict Guard: Duplicate Claim
  await test('Second claim on already accepted pickup is rejected with HTTP 409 Conflict', async () => {
    const res = await request(`/api/pickups/${createdPickupId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${collectorToken}` },
    });
    assert(res.status === 409, `Expected 409 Conflict for double-accept, got ${res.status}`);
  });

  // 17. Complete Collection Workflow
  await test('Collector marks pickup as COLLECTED and triggers ImpactRecord creation', async () => {
    const res = await request(`/api/pickups/${createdPickupId}/collect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${collectorToken}` },
      body: JSON.stringify({ notes: 'Physically collected at Gate 1' }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'COLLECTED', `Expected status COLLECTED, got ${res.data.status}`);
  });

  // 18. Market Sustainability Score Calculation
  await test('Sustainability score endpoint computes 4-factor score breakdown', async () => {
    const marketsRes = await request('/api/markets');
    const mId = marketsRes.data[0].id;
    const res = await request(`/api/sustainability/score/${mId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(typeof res.data.total_score === 'number', 'total_score must be numeric');
    assert(res.data.total_score >= 0 && res.data.total_score <= 100, 'Score must be between 0 and 100');
    assert(typeof res.data.score_label === 'string', 'score_label must be present');
  });

  // 19. Dashboard Endpoints
  await test('Role-specific dashboards respond with aggregated KPIs', async () => {
    const adminDash = await request('/api/dashboard/admin', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDash.status === 200, `Admin dashboard expected 200, got ${adminDash.status}`);

    const mgrDash = await request('/api/dashboard/market-manager', {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert(mgrDash.status === 200, `Manager dashboard expected 200, got ${mgrDash.status}`);

    const collDash = await request('/api/dashboard/collector', {
      headers: { Authorization: `Bearer ${collectorToken}` },
    });
    assert(collDash.status === 200, `Collector dashboard expected 200, got ${collDash.status}`);
  });

  // Summary
  console.log(`\n======================================================`);
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`📊 Test Summary: ${passed}/${results.length} PASSED (${failed} failed)`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
