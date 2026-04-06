const express = require("express");
const router = express.Router();
const securityScanController = require("../controllers/securityScanController");
const securityAuth = require("../middleware/securityAuth");
const adminOrSecurityAuth = require("../middleware/adminOrSecurityAuth"); // ✅ NEW

// ✅ SCANNING: Security ONLY (Creating data)
router.post("/verify", securityAuth, securityScanController.verifyScan);

// ✅ VIEWING: Admin OR Security (Reading data)
router.get("/history", adminOrSecurityAuth, securityScanController.getHistory);
router.get("/today-stats", adminOrSecurityAuth, securityScanController.getTodayStats);

module.exports = router;