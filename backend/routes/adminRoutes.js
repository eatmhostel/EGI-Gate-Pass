const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// ✅ Public Routes
router.post("/login", adminController.adminLogin);

// ✅ Protected Routes (Require Auth)
router.get("/verify", adminAuth, adminController.verifyAdmin);
router.get("/requests", adminAuth, adminController.getRequests);
router.put("/approve/:id", adminAuth, adminController.approveStudent);
router.put("/reject/:id", adminAuth, adminController.rejectStudent);
router.get("/total-students", adminAuth, adminController.getTotalStudents);
router.get("/total-security", adminAuth, adminController.getTotalSecurity);
router.get("/all-students", adminAuth, adminController.getAllStudents);
router.delete("/delete-student/:id", adminAuth, adminController.deleteStudent);
router.get("/all-security", adminAuth, adminController.getAllSecurity);
router.delete("/delete-security/:id", adminAuth, adminController.deleteSecurity);
router.get("/download-data", adminAuth, adminController.downloadData);

module.exports = router;