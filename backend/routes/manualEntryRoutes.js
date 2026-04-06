const express = require("express");
const router = express.Router();
const manualEntryController = require("../controllers/manualEntryController");
const securityAuth = require("../middleware/securityAuth");
const adminOrSecurityAuth = require("../middleware/adminOrSecurityAuth"); // ✅ NEW

// ✅ CREATING/EDITING: Security ONLY
router.post("/create", securityAuth, manualEntryController.createEntry);
router.put("/toggle/:id", securityAuth, manualEntryController.toggleStatus);

// ✅ VIEWING: Admin OR Security
router.get("/today", adminOrSecurityAuth, manualEntryController.getTodayEntries);
router.get("/all", adminOrSecurityAuth, manualEntryController.getAllEntries);
router.get("/:id", adminOrSecurityAuth, manualEntryController.getEntryById);

module.exports = router;