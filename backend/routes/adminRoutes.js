const express = require("express");
const router = express.Router();

const {
  adminLogin,
  getRequests,
  approveStudent,
  rejectStudent,
  getTotalStudents,
  getTotalSecurity,
  getAllStudents,
  deleteStudent,
  getAllSecurity,
  deleteSecurity,
  downloadData        
} = require("../controllers/adminController");

router.post("/login", adminLogin);

// Existing routes
router.get("/requests", getRequests);
router.put("/approve/:id", approveStudent);
router.put("/reject/:id", rejectStudent);
router.get("/total-students", getTotalStudents);
router.get("/total-security", getTotalSecurity);

// List & Delete routes
router.get("/students", getAllStudents);
router.delete("/student/:id", deleteStudent);
router.get("/security-list", getAllSecurity);
router.delete("/security/:id", deleteSecurity);

// ✅ Download Route
router.get("/download-data", downloadData);

module.exports = router;