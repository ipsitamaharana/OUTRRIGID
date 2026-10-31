/**
 * server.js
 * Main Express server for the IRC:58:2015 JPCP Rigid Pavement Platform.
 * Full-stack upgraded with MongoDB Atlas, HTTP-Only Cookie JWT Authentication,
 * CSRF Protection, Rate Limiting, and User-Specific Cloud Projects.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const { connectDB, reconnectDB, getDbStatus } = require("./server/db");
const { CalculationEngine, TABLES, DEFAULT_SPECTRUM } = require("./server/engine");
const { ProjectStore } = require("./server/storage");
const { apiLimiter, optimizeLimiter } = require("./server/middleware/rateLimiter");
const authRoutes = require("./server/routes/auth.routes");
const projectRoutes = require("./server/routes/project.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy headers (e.g. Render, Cloudflare, AWS ALB) for secure cookies & rate-limiting
app.set("trust proxy", 1);

// Connect to MongoDB Atlas (graceful fallback if MONGODB_URI is not yet provided)
connectDB();

// -----------------------------------------------------------------------------
// Core Middleware Configuration
// -----------------------------------------------------------------------------
app.use(
  cors({
    origin: true, // Echo origin to support credentials across development
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Serve frontend static assets
app.use(express.static(path.join(__dirname)));

// -----------------------------------------------------------------------------
// Public REST API Routes (Guest-Accessible, Stateless)
// -----------------------------------------------------------------------------

// 1. Health & Database Status Check
app.get("/api/v1/health", (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: "ok",
    service: "IRC:58:2015 Rigid Pavement Design API",
    version: "2.0.0",
    database: {
      connected: dbStatus.connected,
      host: dbStatus.host,
      databaseName: dbStatus.databaseName,
      egressIp: dbStatus.egressIp,
      lastError: dbStatus.lastError,
      lastAttempt: dbStatus.lastAttempt,
    },
    timestamp: new Date().toISOString(),
  });
});

// Database Reconnection Diagnostic Endpoint
app.all("/api/v1/health/reconnect", async (req, res) => {
  await reconnectDB();
  const dbStatus = getDbStatus();
  res.json({
    status: dbStatus.connected ? "connected" : "retry_failed",
    database: {
      connected: dbStatus.connected,
      host: dbStatus.host,
      databaseName: dbStatus.databaseName,
      egressIp: dbStatus.egressIp,
      lastError: dbStatus.lastError,
      lastAttempt: dbStatus.lastAttempt,
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. Reference Tables & IRC Lookups
app.get("/api/v1/reference/tables", (req, res) => {
  res.json({ success: true, tables: TABLES, defaultSpectrum: DEFAULT_SPECTRUM });
});

// 3. Complete Stress & Fatigue Analysis (Public, used by guest & live preview)
app.post("/api/v1/analyze", (req, res) => {
  try {
    const analysis = CalculationEngine.runFullAnalysis(req.body);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. Automated Thickness Optimizer (Rate-limited, CPU-intensive)
app.post("/api/v1/optimize", optimizeLimiter, (req, res) => {
  try {
    const { params, minThickness, maxThickness, step } = req.body;
    const optimization = CalculationEngine.optimizeThickness(params || req.body, minThickness, maxThickness, step);
    res.json({ success: true, optimization });
  } catch (error) {
    console.error("Optimization error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 5. Compare All 4 Construction Variants
app.post("/api/v1/compare", (req, res) => {
  try {
    const comparisons = CalculationEngine.compareVariants(req.body);
    res.json({ success: true, comparisons });
  } catch (error) {
    console.error("Comparison error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6. Default Benchmarks & Presets (Always accessible offline or online)
app.get("/api/v1/presets", (req, res) => {
  try {
    const presets = ProjectStore.getProjects();
    res.json({ success: true, presets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// Authentication & User-Specific Cloud Project Routes
// -----------------------------------------------------------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);

// -----------------------------------------------------------------------------
// Error Handling Middleware
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled API error:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// Catch-all route to serve index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 IRC:58:2015 JPCP Rigid Pavement Studio Server Running`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`⚙️  API Endpoint: http://localhost:${PORT}/api/v1/analyze`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/v1/auth`);
    console.log(`📁 Cloud Projects API: http://localhost:${PORT}/api/v1/projects`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
