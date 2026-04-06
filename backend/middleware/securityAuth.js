const auth = require("./auth");

const securityAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === "security") {
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Security only." 
      });
    }
  });
};

module.exports = securityAuth;