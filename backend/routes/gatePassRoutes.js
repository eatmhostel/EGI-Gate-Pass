const express = require("express");
const router = express.Router();
const gatePassController = require("../controllers/gatePassController");
const studentAuth = require("../middleware/studentAuth");
const adminAuth = require("../middleware/adminAuth");

// ✅ Admin Routes (Protected) — MUST come BEFORE /:id
router.get("/pending", adminAuth, gatePassController.getPendingRequests);
router.get("/pending-home", adminAuth, gatePassController.getPendingHomeRequests);
router.get("/count-pending-home", adminAuth, gatePassController.countPendingHome);
router.put("/approve/:id", adminAuth, gatePassController.approveRequest);
router.put("/reject/:id", adminAuth, gatePassController.rejectRequest);

// ✅ Student Routes (Protected) — /:id MUST come LAST
router.post("/create", studentAuth, gatePassController.createRequest);
router.get("/student/:studentId", studentAuth, gatePassController.getRequestsByStudent);
router.get("/student-dashboard/:studentId", studentAuth, gatePassController.getStudentDashboard);
router.get("/:id", studentAuth, gatePassController.getRequestById);

module.exports = router;