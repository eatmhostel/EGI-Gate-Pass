const express = require("express");
const router = express.Router();

const {
  adminLogin,
  getRequests,
  approveStudent,
  rejectStudent,
  getTotalStudents,
  getTotalSecurity
} = require("../controllers/adminController");

router.post("/login", adminLogin);

// NEW
router.get("/requests", getRequests);
router.put("/approve/:id", approveStudent);
router.put("/reject/:id", rejectStudent);
router.get("/total-students", getTotalStudents);
router.get("/total-security", getTotalSecurity);

module.exports = router;