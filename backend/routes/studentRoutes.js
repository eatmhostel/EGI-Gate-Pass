const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const studentAuth = require("../middleware/studentAuth");

// ✅ Public Routes
router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);

// ✅ NEW: Forgot password flow
router.post("/forgot-password", studentController.forgotPassword);
router.post("/verify-otp", studentController.verifyOTP);
router.post("/resend-otp", studentController.resendOTP);
router.post("/reset-password", studentController.resetPassword);

// ✅ Protected Routes (Require Auth)
router.get("/verify", studentAuth, studentController.verifyStudent);

module.exports = router;