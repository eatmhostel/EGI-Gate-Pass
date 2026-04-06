const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const studentAuth = require("../middleware/studentAuth");

// ✅ Public Routes
router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);

// ✅ Protected Routes (Require Auth)
router.get("/verify", studentAuth, studentController.verifyStudent);

module.exports = router;