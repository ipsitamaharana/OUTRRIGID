/**
 * tests/api_auth_project.test.js
 * Automated integration test suite for REST API endpoints, Auth guards,
 * and IRC:58 public analysis pipelines.
 */

const http = require("http");
const app = require("../server");

async function runApiTests() {
  console.log("\n======================================================================");
  console.log("🚦 OUTRRIGID REST API & AUTH SECURITY INTEGRATION TESTS");
  console.log("======================================================================\n");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

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
    // Test 1: Health endpoint
    {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      const data = await res.json();
      assert(res.status === 200 && data.status === "ok", "GET /api/v1/health returns status 200 with service status");
    }

    // Test 2: Reference tables
    {
      const res = await fetch(`${baseUrl}/api/v1/reference/tables`);
      const data = await res.json();
      assert(res.status === 200 && data.success && data.tables.cbrToK, "GET /api/v1/reference/tables returns IRC:58 lookups");
    }

    // Test 3: Public Stateless Analysis (Trial I 310mm GSB)
    {
      const res = await fetch(`${baseUrl}/api/v1/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subgradeCBR: 8,
          subbaseType: "gsb",
          subbaseThickness: 150,
          trialThickness: 310,
          concreteGrade: "M40",
          zone: "III",
          shoulderType: "tied",
          cvpdPerDirection: 3000,
          useWorkbookExactTraffic: true,
          workbookDayAxleRepetitions: 15019127,
          workbookNightAxleRepetitions: 12390780,
        }),
      });
      const data = await res.json();
      assert(
        res.status === 200 && data.success && data.analysis.summary.isSafe === true,
        "POST /api/v1/analyze runs full calculation for guest users (Trial I h=310 mm Safe)"
      );
    }

    // Test 4: Presets Endpoint
    {
      const res = await fetch(`${baseUrl}/api/v1/presets`);
      const data = await res.json();
      assert(res.status === 200 && data.success && data.presets.length >= 3, "GET /api/v1/presets returns standard benchmark presets");
    }

    // Test 5: Protected Project Route requires authentication
    {
      const res = await fetch(`${baseUrl}/api/v1/projects`);
      const data = await res.json();
      assert(res.status === 401 && data.success === false, "GET /api/v1/projects rejects unauthenticated request with 401");
    }

    // Test 6: Registration validation (short password rejection)
    {
      const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "short",
        }),
      });
      const data = await res.json();
      assert(
        res.status === 400 && data.error.includes("8 characters"),
        "POST /api/v1/auth/register enforces minimum 8 character password"
      );
    }

    // Test 7: Registration empty email rejection
    {
      const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "",
          password: "password123",
        }),
      });
      const data = await res.json();
      assert(res.status === 400 && data.error.includes("required"), "POST /api/v1/auth/register requires valid email");
    }

    // Test 8: Logout clears session
    {
      const res = await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: "POST",
      });
      const data = await res.json();
      const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie") || ""];
      const cookieStr = setCookies.join("; ");
      assert(
        res.status === 200 && data.success && (cookieStr.includes("token=;") || cookieStr.includes("1970")),
        "POST /api/v1/auth/logout clears auth cookies with expired timestamp"
      );
    }

    // Test 9: CSRF Token missing on state-changing request
    {
      const { generateToken } = require("../server/middleware/auth");
      const validToken = generateToken({ _id: "67243912a4b3f8190c123456", email: "test@domain.com" });
      const res = await fetch(`${baseUrl}/api/v1/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${validToken}`,
        },
        body: JSON.stringify({ name: "Test CSRF Missing" }),
      });
      const data = await res.json();
      assert(
        res.status === 403 && data.error.includes("CSRF"),
        "POST /api/v1/projects rejects request missing CSRF token with 403"
      );
    }

    // Test 10: Origin Header Verification blocks cross-origin requests
    {
      const { generateToken, generateCsrfToken } = require("../server/middleware/auth");
      const validToken = generateToken({ _id: "67243912a4b3f8190c123456", email: "test@domain.com" });
      const csrf = generateCsrfToken();
      const res = await fetch(`${baseUrl}/api/v1/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${validToken}; XSRF-TOKEN=${csrf}`,
          "X-CSRF-Token": csrf,
          Origin: "https://malicious-phishing-site.com",
        },
        body: JSON.stringify({ name: "Malicious Cross-Origin" }),
      });
      const data = await res.json();
      assert(
        res.status === 403 && data.error.includes("Cross-origin"),
        "POST /api/v1/projects blocks cross-origin requests with untrusted Origin header"
      );
    }
  } catch (err) {
    console.error("Test execution failure:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log("\n======================================================================");
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} API & SECURITY TESTS PASSED!`);
  } else {
    console.error(`⚠️  ${failed} TESTS FAILED. (${passed} passed)`);
    process.exit(1);
  }
  console.log("======================================================================\n");
}

if (require.main === module) {
  runApiTests();
}

module.exports = { runApiTests };
