const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided. Please login." 
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token format." 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token." 
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired. Please login again." 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: "Authentication error." 
    });
  }
};

module.exports = auth;