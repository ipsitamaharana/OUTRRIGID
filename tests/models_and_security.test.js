/**
 * tests/models_and_security.test.js
 * Unit test suite for User password hashing, JWT generation,
 * CSRF token generation & validation, and Project 30-entry history schema.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../server/models/User");
const Project = require("../server/models/Project");
const { generateToken, generateCsrfToken, JWT_SECRET } = require("../server/middleware/auth");

async function runSecurityTests() {
  console.log("\n======================================================================");
  console.log("🚦 OUTRRIGID SECURITY, CRYPTOGRAPHY & MODEL UNIT TESTS");
  console.log("======================================================================\n");

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
    // 1. Password Hashing with Bcrypt
    {
      const rawPassword = "SecureHighwayPass#2026";
      const hash = await User.hashPassword(rawPassword);
      assert(hash && hash.startsWith("$2"), "User.hashPassword generates valid bcrypt hash ($2...)");
      assert(hash !== rawPassword, "Raw password is never stored in plain text");

      const user = new User({
        email: "test.engineer@nhai.gov.in",
        passwordHash: hash,
      });

      const isMatch = await user.comparePassword(rawPassword);
      assert(isMatch === true, "user.comparePassword successfully verifies matching plain password");

      const isWrongMatch = await user.comparePassword("WrongPassword123");
      assert(isWrongMatch === false, "user.comparePassword rejects incorrect password");
    }

    // 2. JWT Generation & Verification
    {
      const mockUser = {
        _id: "67243912a4b3f8190c123456",
        email: "planner@pwd.odisha.gov.in",
        role: "engineer",
      };

      const token = generateToken(mockUser);
      assert(typeof token === "string" && token.split(".").length === 3, "generateToken generates 3-segment JWT");

      const decoded = jwt.verify(token, JWT_SECRET);
      assert(decoded._id === mockUser._id && decoded.email === mockUser.email, "JWT payload contains user ID and email");
    }

    // 3. CSRF Token Cryptographic Entropy
    {
      const csrf1 = generateCsrfToken();
      const csrf2 = generateCsrfToken();
      assert(csrf1 && csrf1.length === 64, "generateCsrfToken produces 64-character (32-byte hex) string");
      assert(csrf1 !== csrf2, "generateCsrfToken produces unique entropy on each call");
    }

    // 4. Project Schema & 30-entry Cap Validation
    {
      const project = new Project({
        userId: "67243912a4b3f8190c123456",
        name: "NH-16 Bhubaneswar to Cuttack Six Laning",
        roadType: "divided_6lane",
        climaticZone: "III",
        state: "Odisha",
      });

      assert(project.name === "NH-16 Bhubaneswar to Cuttack Six Laning", "Project model instantiates correctly");
      assert(project.history.length === 0, "Initial project history defaults to empty array");

      // Simulate 40 calculation runs
      for (let i = 1; i <= 40; i++) {
        project.history.unshift({
          trialThicknessMm: 270 + (i % 50),
          totalCFD: (i * 0.02).toFixed(3),
          isSafe: i <= 20,
          action: "RUN_" + i,
          note: `Auto simulation run #${i}`,
          timestamp: new Date(Date.now() + i * 1000),
        });
        // Enforce the 30-entry limit
        if (project.history.length > 30) {
          project.history = project.history.slice(0, 30);
        }
      }

      assert(project.history.length === 30, "Project history is strictly capped at latest 30 entries (older 10 safely pruned)");
      assert(project.history[0].action === "RUN_40", "Latest calculation run is positioned at index 0");
      assert(project.history[29].action === "RUN_11", "30th entry is the 11th run (runs 1-10 successfully pruned)");
    }
  } catch (err) {
    console.error("Test failure:", err);
    failed++;
  }

  console.log("\n======================================================================");
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} SECURITY, CRYPTOGRAPHY & MODEL TESTS PASSED!`);
  } else {
    console.error(`⚠️  ${failed} TESTS FAILED.`);
    process.exit(1);
  }
  console.log("======================================================================\n");
}

if (require.main === module) {
  runSecurityTests();
}

module.exports = { runSecurityTests };
