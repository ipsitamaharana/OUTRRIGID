/**
 * server/middleware/auth.js
 * JWT Authentication, HTTP-Only Cookie Handling & CSRF Protection
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_outrrigid_dev_secret_key_32chars_min";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("fallback"))) {
  console.warn("⚠️  [SECURITY WARNING]: Running in production without a custom JWT_SECRET! Set JWT_SECRET in .env");
}

/**
 * Generate a signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Set HTTP-Only authentication cookie & readable CSRF cookie
 */
function setAuthCookies(res, token, csrfToken) {
  const isProduction = process.env.NODE_ENV === "production";

  // 1. HTTP-Only Auth Cookie (inaccessible to JavaScript, immune to XSS theft)
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // HTTPS in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  // 2. Readable CSRF Cookie (for Double-Submit Cookie Pattern)
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false, // Must be readable by client JS to attach in X-CSRF-Token header
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

/**
 * Clear authentication & CSRF cookies on logout
 */
function clearAuthCookies(res) {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    path: "/",
    secure: isProduction,
    sameSite: "strict",
  };
  res.clearCookie("token", { ...cookieOptions, httpOnly: true });
  res.clearCookie("XSRF-TOKEN", { ...cookieOptions, httpOnly: false });
}

/**
 * Middleware: Verify JWT Authentication from Cookie or Authorization Header
 */
function authenticateUser(req, res, next) {
  // Try cookie first, fallback to Authorization: Bearer <token>
  let token = req.cookies ? req.cookies.token : null;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please sign in to access cloud features.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Session expired or invalid token. Please sign in again.",
    });
  }
}

/**
 * Middleware: Verify CSRF Token on State-Changing Requests
 * Implements Double-Submit Cookie validation with timing-safe comparison
 * and Origin / Referer validation against cross-origin forgery.
 */
function verifyCsrf(req, res, next) {
  // 1. Safe HTTP methods do not change state
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // 2. Public auth entry endpoints do not have an active session yet
  const openAuthPaths = ["/api/v1/auth/login", "/api/v1/auth/register"];
  if (openAuthPaths.includes(req.path)) {
    return next();
  }

  // 3. Pure stateless calculation endpoints (used by guest / offline mode) do not require CSRF
  const guestCalcPaths = ["/api/v1/analyze", "/api/v1/optimize", "/api/v1/compare"];
  if (guestCalcPaths.includes(req.path) && !req.cookies.token) {
    return next();
  }

  // 4. Origin & Referer Verification (OWASP recommendation)
  const host = req.get("host");
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return res.status(403).json({
          success: false,
          error: "Security verification failed: Cross-origin request blocked.",
        });
      }
    } catch (e) {
      return res.status(403).json({
        success: false,
        error: "Security verification failed: Malformed Origin header.",
      });
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return res.status(403).json({
          success: false,
          error: "Security verification failed: Untrusted Referer header.",
        });
      }
    } catch (e) {
      return res.status(403).json({
        success: false,
        error: "Security verification failed: Malformed Referer header.",
      });
    }
  }

  // 5. Double-Submit Token Verification (timing-safe)
  const clientCsrfToken = req.headers["x-csrf-token"];
  const cookieCsrfToken = req.cookies ? req.cookies["XSRF-TOKEN"] : null;

  if (
    !clientCsrfToken ||
    !cookieCsrfToken ||
    typeof clientCsrfToken !== "string" ||
    typeof cookieCsrfToken !== "string" ||
    clientCsrfToken.length !== 64 ||
    cookieCsrfToken.length !== 64
  ) {
    return res.status(403).json({
      success: false,
      error: "Security verification failed: CSRF token missing or invalid format.",
    });
  }

  try {
    const bufA = Buffer.from(clientCsrfToken, "hex");
    const bufB = Buffer.from(cookieCsrfToken, "hex");

    if (bufA.length !== 32 || bufB.length !== 32 || !crypto.timingSafeEqual(bufA, bufB)) {
      return res.status(403).json({
        success: false,
        error: "Security verification failed: CSRF token mismatch.",
      });
    }
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: "Security verification failed: Invalid CSRF token encoding.",
    });
  }

  next();
}

module.exports = {
  JWT_SECRET,
  generateToken,
  generateCsrfToken,
  setAuthCookies,
  clearAuthCookies,
  authenticateUser,
  verifyCsrf,
};
