const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/securityScanController");

router.post("/verify", ctrl.verifyScan);
router.get("/history", ctrl.getHistory);
router.get("/today-stats", ctrl.getTodayStats);

module.exports = router;