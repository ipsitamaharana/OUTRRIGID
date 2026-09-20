/**
 * server.js
 * Main Express server for the IRC:58:2015 JPCP Rigid Pavement Platform.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const { CalculationEngine, TABLES, DEFAULT_SPECTRUM } = require("./server/engine");
const { ProjectStore } = require("./server/storage");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname)));

// ============================================================================
// REST API Routes
// ============================================================================

// 1. Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    service: "IRC:58:2015 Rigid Pavement Design API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// 2. Reference Tables & IRC Lookups
app.get("/api/v1/reference/tables", (req, res) => {
  res.json({ success: true, tables: TABLES, defaultSpectrum: DEFAULT_SPECTRUM });
});

// 3. Complete Stress & Fatigue Analysis
app.post("/api/v1/analyze", (req, res) => {
  try {
    const analysis = CalculationEngine.runFullAnalysis(req.body);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. Automated Thickness Optimizer
app.post("/api/v1/optimize", (req, res) => {
  try {
    const { params, minThickness, maxThickness, step } = req.body;
    const optimization = CalculationEngine.optimizeThickness(params || req.body, minThickness, maxThickness, step);
    res.json({ success: true, optimization });
  } catch (error) {
    console.error("Optimization error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 5. Compare All 4 Construction Variants (Slide 58)
app.post("/api/v1/compare", (req, res) => {
  try {
    const comparisons = CalculationEngine.compareVariants(req.body);
    res.json({ success: true, comparisons });
  } catch (error) {
    console.error("Comparison error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6. Project Management Endpoints
app.get("/api/v1/projects", (req, res) => {
  try {
    const projects = ProjectStore.getProjects();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/v1/projects", (req, res) => {
  try {
    const saved = ProjectStore.saveProject(req.body);
    res.json({ success: true, project: saved });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete("/api/v1/projects/:id", (req, res) => {
  try {
    ProjectStore.deleteProject(req.params.id);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Catch-all route to serve index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 IRC:58:2015 JPCP Rigid Pavement Studio Server Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`⚙️  API Endpoint: http://localhost:${PORT}/api/v1/analyze`);
  console.log(`=======================================================`);
});
