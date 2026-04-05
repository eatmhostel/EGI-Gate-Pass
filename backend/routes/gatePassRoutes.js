const express = require("express");
const router = express.Router();
const controller = require("../controllers/gatePassController");

// student request
router.post("/request", controller.createRequest);

// admin
router.get("/pending", controller.getPendingRequests);
router.get("/pending-home", controller.getPendingHomeRequests);
router.get("/pending-home/count", controller.countPendingHome);
router.put("/approve/:id", controller.approveRequest);
router.put("/reject/:id", controller.rejectRequest);

// student dashboard & history (MUST be before /:id to avoid route collision)
router.get("/dashboard/:studentId", controller.getStudentDashboard);
router.get("/student/:studentId", controller.getRequestsByStudent);

// dynamic id
router.get("/:id", controller.getRequestById);

module.exports = router;