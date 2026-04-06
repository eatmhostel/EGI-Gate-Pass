const express = require("express");
const router = express.Router();
const securityController = require("../controllers/securityController");
const securityAuth = require("../middleware/securityAuth");
const adminAuth = require("../middleware/adminAuth"); // ✅ Import adminAuth

// ✅ Public Routes
router.post("/login", securityController.securityLogin);

// ✅ Protected Routes (Require Auth)
router.get("/verify", securityAuth, securityController.verifySecurity);

// ✅ NEW: Admin can add security personnel
router.post("/add", adminAuth, securityController.addSecurity);

module.exports = router;