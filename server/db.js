/**
 * server/db.js
 * MongoDB Atlas Connection Manager using Mongoose
 */

const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️  [DATABASE WARNING]: MONGODB_URI is not set in environment.");
    console.warn("ℹ️  Running in Offline / In-Memory mode. To connect to MongoDB Atlas, set MONGODB_URI in .env");
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`✅ [DATABASE CONNECTED]: MongoDB Atlas Host: ${conn.connection.host}`);
  } catch (error) {
    const sanitizedMsg = (error.message || "").replace(/mongodb(\+srv)?:\/\/[^@]+@/g, "mongodb$1://***:***@");
    console.error(`❌ [DATABASE ERROR]: Failed to connect to MongoDB Atlas: ${sanitizedMsg}`);
    console.warn("ℹ️  Server will continue running in fallback mode so offline engineering calculations work.");
  }
}

function getDbStatus() {
  return {
    connected: isConnected,
    host: mongoose.connection ? mongoose.connection.host : null,
    databaseName: mongoose.connection ? mongoose.connection.name : null,
    state: mongoose.connection ? mongoose.connection.readyState : 0, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  };
}

module.exports = { connectDB, getDbStatus };

