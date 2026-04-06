const auth = require("./auth");

const studentAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === "student") {
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Student only." 
      });
    }
  });
};

module.exports = studentAuth;