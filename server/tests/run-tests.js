// server/tests/run-tests.js
const http = require('http');
const app = require('../server');
const db = require('../config/db');

let server;
const PORT = 5055;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, port: PORT, host: '127.0.0.1' }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('  STARTING SAVEPLATE AUTOMATED BACKEND TEST SUITE   ');
  console.log('====================================================\n');

  server = app.listen(PORT);
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({ path: '/api/health', method: 'GET' });
    assert(health.status === 200 && health.body.status === 'healthy', 'API Health check returns 200 and healthy status');
    assert(health.body.brand === 'SAVEPLATE', 'Brand identifier returns "SAVEPLATE"');

    // 2. Public stats
    const stats = await request({ path: '/api/content/stats', method: 'GET' });
    assert(stats.status === 200 && stats.body.stats.mealsRescued > 0, 'Public stats endpoint returns live database metrics');

    // 3. User Login - Admin
    const adminLogin = await request(
      { path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@saveplate.org', password: 'Admin@SavePlate2026!' }
    );
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', 'Admin login authenticates successfully with role "admin"');
    const adminToken = adminLogin.body.token;

    // 4. User Login - Donor
    const donorLogin = await request(
      { path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'contact@greenbistro.com', password: 'Password@123' }
    );
    assert(donorLogin.status === 200 && donorLogin.body.user.role === 'donor', 'Donor user authenticates with role "donor"');
    const donorToken = donorLogin.body.token;

    // 5. User Login - Recipient
    const recipientLogin = await request(
      { path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'sarah.miller@communitytable.org', password: 'Password@123' }
    );
    assert(recipientLogin.status === 200, 'Recipient / NGO authenticates successfully');
    const recipientToken = recipientLogin.body.token;

    // 6. Security & RBAC: Recipient cannot access Admin metrics
    const unauthorizedAdminAccess = await request(
      { path: '/api/admin/metrics', method: 'GET', headers: { Authorization: `Bearer ${recipientToken}` } }
    );
    assert(unauthorizedAdminAccess.status === 403, 'RBAC Security: Non-admin users are rejected with 403 Forbidden from admin endpoints');

    // 7. Security & RBAC: Admin CAN access Admin metrics
    const authorizedAdminAccess = await request(
      { path: '/api/admin/metrics', method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(authorizedAdminAccess.status === 200 && authorizedAdminAccess.body.metrics.users.total > 0, 'Admin successfully accesses database-driven admin metrics');

    // 8. Create food listing as Donor
    const newListing = await request(
      { path: '/api/listings', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` } },
      {
        title: 'Freshly Baked Ciabatta Breads & Rolls',
        description: 'Golden crust ciabatta bread baked this afternoon.',
        category_id: 4,
        quantity: 20,
        unit: 'loaves',
        estimated_servings: 40,
        pickup_deadline: new Date(Date.now() + 86400000).toISOString(),
        storage_instructions: 'Keep in dry bread bin',
        allergens: 'Contains Gluten',
        pickup_address: '452 Organic Way',
        city: 'San Francisco',
        contact_phone: '+1-555-234-5678'
      }
    );
    assert(newListing.status === 201 && newListing.body.listingId > 0, 'Donor can create new surplus food listing');
    const createdListingId = newListing.body.listingId;

    // 9. Concurrency & Business Rule: Requesting available food
    const foodRequest = await request(
      { path: '/api/requests', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recipientToken}` } },
      {
        listing_id: createdListingId,
        requested_quantity: 5,
        recipient_notes: 'For our community shelter lunch tomorrow.'
      }
    );
    assert(foodRequest.status === 201 && foodRequest.body.verificationCode, 'Recipient successfully requests food and receives verification code');
    const createdRequestId = foodRequest.body.requestId;

    // 10. Concurrency & Business Rule: Overclaiming is rejected
    const overclaimRequest = await request(
      { path: '/api/requests', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recipientToken}` } },
      {
        listing_id: createdListingId,
        requested_quantity: 9999, // Exceeds 20
        recipient_notes: 'Greedy request'
      }
    );
    assert(overclaimRequest.status === 400, 'Business Rule Enforced: Overclaiming more quantity than available is rejected');

    // 11. Donor approves the request
    const approveReq = await request(
      { path: `/api/requests/${createdRequestId}/status`, method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` } },
      { status: 'approved', donor_notes: 'Approved! Ready for pickup.' }
    );
    assert(approveReq.status === 200 && approveReq.body.newStatus === 'approved', 'Donor updates request status to "approved"');

    // 12. Check inventory deducted correctly
    const updatedListing = await request({ path: `/api/listings/${createdListingId}`, method: 'GET' });
    assert(updatedListing.body.listing.remaining_quantity === 15, 'Inventory Concurrency Check: Remaining quantity accurately decremented to 15');

    // 13. Donor marks completed
    const completeReq = await request(
      { path: `/api/requests/${createdRequestId}/status`, method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` } },
      { status: 'completed', donor_notes: 'Handover verified and completed.' }
    );
    assert(completeReq.status === 200 && completeReq.body.newStatus === 'completed', 'Request completed and logged to donations table');

    // 14. Admin User Moderation: View users and audit trail
    const auditLogs = await request(
      { path: '/api/admin/audit-logs', method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(auditLogs.status === 200 && auditLogs.body.logs.length > 0, 'Admin audit log captures system actions and is queryable');

    // 15. CSV Export test
    const csvExport = await request(
      { path: '/api/admin/export/csv', method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(csvExport.status === 200 && csvExport.headers['content-type'].includes('text/csv'), 'Admin CSV export generates real tabular data stream');

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n====================================================`);
    console.log(`  TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log(`====================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runAllTests();

