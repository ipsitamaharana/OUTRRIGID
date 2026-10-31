/**
 * server/routes/project.routes.js
 * User-Specific Highway Project Management & Capped History Endpoints
 */

const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const { authenticateUser, verifyCsrf } = require("../middleware/auth");
const { CalculationEngine } = require("../engine");
const { getDbStatus } = require("../db");

// All project routes require authentication
router.use(authenticateUser);

// -----------------------------------------------------------------------------
// GET /api/v1/projects (List projects belonging to authenticated user)
// -----------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is not connected. Connect MongoDB Atlas to access cloud projects.",
      });
    }

    // Strict multi-tenant isolation: only projects belonging to this user
    const projects = await Project.find({ userId: req.user._id })
      .select("name projectCode state climaticZone roadType status updatedAt createdAt latestCalculation.summary")
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve projects.",
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/v1/projects (Create a new project for authenticated user)
// -----------------------------------------------------------------------------
router.post("/", verifyCsrf, async (req, res) => {
  try {
    const { name, projectCode, description, state, climaticZone, roadType, designParameters, latestCalculation } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Project name is required.",
      });
    }

    const initialHistory = [];
    if (latestCalculation && latestCalculation.summary) {
      initialHistory.push({
        trialThicknessMm: latestCalculation.summary.trialThicknessMm || 310,
        totalCFD: latestCalculation.summary.totalCFD || 0,
        isSafe: latestCalculation.summary.isSafe || false,
        action: "LOAD_PRESET",
        note: "Initial design baseline saved",
      });
    }

    const project = new Project({
      userId: req.user._id,
      name: name.trim(),
      projectCode: projectCode ? projectCode.trim() : undefined,
      description: description ? description.trim() : "",
      state: state || "Bihar",
      climaticZone: climaticZone || "III",
      roadType: roadType || "divided_4lane",
      designParameters: designParameters || {},
      latestCalculation: latestCalculation || {},
      history: initialHistory,
    });

    await project.save();

    return res.status(201).json({
      success: true,
      project,
      message: "Project created successfully.",
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create project.",
    });
  }
});

// -----------------------------------------------------------------------------
// GET /api/v1/projects/:id (Get full project details & active parameters)
// -----------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found or you do not have permission to view it.",
      });
    }

    return res.json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve project details.",
    });
  }
});

// -----------------------------------------------------------------------------
// PUT /api/v1/projects/:id (Update project parameters / metadata)
// -----------------------------------------------------------------------------
router.put("/:id", verifyCsrf, async (req, res) => {
  try {
    const { name, description, state, climaticZone, roadType, status, designParameters } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found or you do not have permission to edit it.",
      });
    }

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (state) project.state = state;
    if (climaticZone) project.climaticZone = climaticZone;
    if (roadType) project.roadType = roadType;
    if (status) project.status = status;
    if (designParameters) project.designParameters = designParameters;

    await project.save();

    return res.json({
      success: true,
      project,
      message: "Project updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update project.",
    });
  }
});

// -----------------------------------------------------------------------------
// DELETE /api/v1/projects/:id (Delete project owned by authenticated user)
// -----------------------------------------------------------------------------
router.delete("/:id", verifyCsrf, async (req, res) => {
  try {
    const result = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Project not found or you do not have permission to delete it.",
      });
    }

    return res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to delete project.",
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/v1/projects/:id/calculations (Run/Record calculation & safely cap history at 30)
// -----------------------------------------------------------------------------
router.post("/:id/calculations", verifyCsrf, async (req, res) => {
  try {
    const { params, action = "MANUAL_ANALYSIS", note = "" } = req.body;

    // Run the IRC:58 engine
    const analysis = CalculationEngine.runFullAnalysis(params);

    const historyEntry = {
      trialThicknessMm: analysis.summary.trialThicknessMm,
      totalCFD: analysis.summary.totalCFD,
      isSafe: analysis.summary.isSafe,
      action: action,
      note: note.trim(),
      timestamp: new Date(),
    };

    // Atomic update with $push and $slice: 30 (strictly keeping only latest 30 entries)
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        $set: {
          designParameters: params,
          latestCalculation: analysis,
        },
        $push: {
          history: {
            $each: [historyEntry],
            $position: 0, // Prepend newest entry to the top
            $slice: 30, // Safely prune entries older than the 30th
          },
        },
      },
      { returnDocument: "after" }
    );

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: "Project not found or unauthorized.",
      });
    }

    return res.json({
      success: true,
      analysis,
      historyCount: updatedProject.history.length,
      latestHistory: updatedProject.history[0],
      message: "Calculation completed and saved to project history.",
    });
  } catch (error) {
    console.error("Calculation save error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Calculation failed.",
    });
  }
});

// -----------------------------------------------------------------------------
// GET /api/v1/projects/:id/history (Get the 30 latest calculation entries)
// -----------------------------------------------------------------------------
router.get("/:id/history", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select("name history");

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found.",
      });
    }

    return res.json({
      success: true,
      history: project.history,
      count: project.history.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve history.",
    });
  }
});

module.exports = router;

