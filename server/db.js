/**
 * server/db.js
 * MongoDB Atlas Connection Manager using Mongoose with Egress Diagnostic & Auto-Retry
 */

const mongoose = require("mongoose");

let isConnected = false;
let lastError = null;
let lastAttempt = null;
let egressIp = null;
let retryTimer = null;

async function detectEgressIp() {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        egressIp = data.ip;
        return egressIp;
      }
    }
  } catch (e) {
    // fallback to text endpoint
  }

  try {
    const res2 = await fetch("https://ifconfig.me/ip", {
      signal: AbortSignal.timeout(3000),
    });
    if (res2.ok) {
      const text = (await res2.text()).trim();
      if (text) {
        egressIp = text;
        return egressIp;
      }
    }
  } catch (e) {
    // ignore
  }

  return egressIp;
}

async function connectDB() {
  lastAttempt = new Date().toISOString();

  if (isConnected && mongoose.connection && mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    lastError = "MONGODB_URI is not set in environment";
    console.warn("⚠️  [DATABASE WARNING]: MONGODB_URI is not set in environment.");
    return false;
  }

  // Detect public egress IP asynchronously to identify host firewall/NAT identity
  if (!egressIp) {
    detectEgressIp().catch(() => {});
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    lastError = null;
    console.log(`✅ [DATABASE CONNECTED]: MongoDB Atlas Host: ${conn.connection.host}`);

    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    return true;
  } catch (error) {
    isConnected = false;
    const rawMsg = error.message || "";
    // Mask sensitive URI credentials
    const sanitizedMsg = rawMsg.replace(/mongodb(\+srv)?:\/\/[^@]+@/g, "mongodb$1://***:***@");
    lastError = sanitizedMsg;
    console.error(`❌ [DATABASE ERROR]: Failed to connect to MongoDB Atlas: ${sanitizedMsg}`);

    // If not connected and no retry timer running, retry every 25 seconds
    if (!retryTimer) {
      retryTimer = setInterval(() => {
        if (!isConnected) {
          connectDB();
        } else if (retryTimer) {
          clearInterval(retryTimer);
          retryTimer = null;
        }
      }, 25000);
      if (typeof retryTimer.unref === "function") {
        retryTimer.unref();
      }
    }
    return false;
  }
}

async function reconnectDB() {
  await detectEgressIp().catch(() => {});
  return await connectDB();
}

function getDbStatus() {
  const readyState = mongoose.connection ? mongoose.connection.readyState : 0;
  const connected = readyState === 1;
  return {
    connected,
    host: mongoose.connection ? mongoose.connection.host : null,
    databaseName: mongoose.connection ? mongoose.connection.name : null,
    state: readyState,
    egressIp,
    lastError,
    lastAttempt,
  };
}

module.exports = { connectDB, reconnectDB, getDbStatus, detectEgressIp };
