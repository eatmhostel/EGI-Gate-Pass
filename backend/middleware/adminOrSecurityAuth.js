const auth = require("./auth");

const adminOrSecurityAuth = (req, res, next) => {
  auth(req, res, () => {
    // ✅ Allow BOTH Admin and Security to view data
    if (req.user && (req.user.role === "admin" || req.user.role === "security")) {
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin or Security only." 
      });
    }
  });
};

module.exports = adminOrSecurityAuth;