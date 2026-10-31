/**
 * server/routes/auth.routes.js
 * User Authentication Routes (Register, Login, Logout, Current User Profile)
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  generateToken,
  generateCsrfToken,
  setAuthCookies,
  clearAuthCookies,
  authenticateUser,
} = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { getDbStatus } = require("../db");

// -----------------------------------------------------------------------------
// POST /api/v1/auth/register
// -----------------------------------------------------------------------------
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { email, password, fullName, organization, designation } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long.",
      });
    }

    // Check database connection
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is not connected. Please ensure MONGODB_URI is configured in .env",
      });
    }

    // 2. Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    // 3. Hash password and save new user
    const passwordHash = await User.hashPassword(password);
    const user = new User({
      email: email.toLowerCase().trim(),
      passwordHash,
      profile: {
        fullName: fullName ? fullName.trim() : "Highway Engineer",
        organization: organization ? organization.trim() : "Civil Engineering Dept",
        designation: designation ? designation.trim() : "Pavement Design Specialist",
      },
    });

    await user.save();

    // 4. Generate security tokens
    const token = generateToken(user);
    const csrfToken = generateCsrfToken();

    // 5. Issue HTTP-Only authentication cookie
    setAuthCookies(res, token, csrfToken);

    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      csrfToken,
      message: "Account registered successfully.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred during registration. Please try again.",
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/v1/auth/login
// -----------------------------------------------------------------------------
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide both email and password.",
      });
    }

    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is not connected. Please ensure MONGODB_URI is configured in .env",
      });
    }

    // Find user by email and explicitly select passwordHash
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Verify password securely with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Generate security tokens
    const token = generateToken(user);
    const csrfToken = generateCsrfToken();

    // Set secure HTTP-Only cookies
    setAuthCookies(res, token, csrfToken);

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      csrfToken,
      message: "Signed in successfully.",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred during login. Please try again.",
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/v1/auth/logout
// -----------------------------------------------------------------------------
router.post("/logout", (req, res) => {
  clearAuthCookies(res);
  return res.json({
    success: true,
    message: "Signed out successfully.",
  });
});

// -----------------------------------------------------------------------------
// GET /api/v1/auth/me (Returns active user session & profile)
// -----------------------------------------------------------------------------
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    // Ensure a fresh CSRF token is available
    const csrfToken = req.cookies && req.cookies["XSRF-TOKEN"] ? req.cookies["XSRF-TOKEN"] : generateCsrfToken();

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      csrfToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to load user profile.",
    });
  }
});

module.exports = router;

