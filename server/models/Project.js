/**
 * server/models/Project.js
 * Highway Pavement Project Schema with Embedded Parameters & Capped History (Collection 2 of 2)
 */

const mongoose = require("mongoose");

const HistoryEntrySchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    trialThicknessMm: {
      type: Number,
      required: true,
    },
    totalCFD: {
      type: Number,
      required: true,
    },
    isSafe: {
      type: Boolean,
      required: true,
    },
    action: {
      type: String,
      enum: ["MANUAL_ANALYSIS", "AUTO_OPTIMIZE", "LOAD_PRESET", "PARAMETER_UPDATE"],
      default: "MANUAL_ANALYSIS",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project must belong to a user"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [150, "Project name cannot exceed 150 characters"],
    },
    projectCode: {
      type: String,
      trim: true,
      default: function () {
        return `PRJ-${Date.now().toString().slice(-6)}`;
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      default: "Bihar",
    },
    climaticZone: {
      type: String,
      default: "III",
    },
    roadType: {
      type: String,
      default: "divided_4lane",
    },
    status: {
      type: String,
      enum: ["draft", "in_review", "approved", "archived"],
      default: "draft",
    },
    // Embedded design parameters matching currentParams in app.js
    designParameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Embedded calculation results snapshot
    latestCalculation: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Embedded calculation history (capped at latest 30 entries)
    history: {
      type: [HistoryEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for high performance user project queries
ProjectSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("Project", ProjectSchema);

