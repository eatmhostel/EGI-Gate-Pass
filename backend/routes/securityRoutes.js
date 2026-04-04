const express = require("express");
const router = express.Router();

const {
  addSecurity,
  securityLogin
} = require("../controllers/securityController");

router.post("/add", addSecurity);
router.post("/login", securityLogin);

module.exports = router;