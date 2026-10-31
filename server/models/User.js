/**
 * server/models/User.js
 * User Account & Embedded Profile Schema (Collection 1 of 2)
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // Prevents accidental exposure in queries
    },
    role: {
      type: String,
      enum: ["engineer", "senior_engineer", "admin"],
      default: "engineer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      fullName: {
        type: String,
        trim: true,
        default: "Highway Engineer",
      },
      organization: {
        type: String,
        trim: true,
        default: "Civil Engineering Department",
      },
      designation: {
        type: String,
        trim: true,
        default: "Pavement Specialist",
      },
      preferences: {
        theme: {
          type: String,
          enum: ["light", "dark"],
          default: "dark",
        },
        defaultZone: {
          type: String,
          default: "III",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password securely
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash passwords
UserSchema.statics.hashPassword = async function (plainPassword) {
  return await bcrypt.hash(plainPassword, 12);
};

module.exports = mongoose.model("User", UserSchema);

