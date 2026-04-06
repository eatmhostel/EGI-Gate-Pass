const Security = require("../models/Security");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ADD SECURITY
exports.addSecurity = async (req, res) => {
  try {
    const { name, empId, email, phone, password } = req.body;

    // ✅ Check if empId already exists
    const existingEmpId = await Security.findOne({ empId });
    if (existingEmpId) {
      return res.json({ success: false, message: "Employee ID already exists" });
    }

    // ✅ Check if email already exists
    const existingEmail = await Security.findOne({ email });
    if (existingEmail) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSecurity = new Security({
      name,
      empId,
      email,
      phone,
      password: hashedPassword,
    });

    await newSecurity.save();

    res.json({ success: true, message: "Security added successfully" });
  } catch (err) {
    // ✅ Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.json({ success: false, message: `${field} already exists` });
    }
    res.json({ success: false, message: err.message });
  }
};

// ✅ LOGIN WITH JWT TOKEN
exports.securityLogin = async (req, res) => {
  try {
    const { empId, password } = req.body;

    const user = await Security.findOne({ empId });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name,
        empId: user.empId,
        email: user.email,
        phone: user.phone,
        role: "security" 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    res.json({ 
      success: true, 
      token,
      user: {
        name: user.name,
        empId: user.empId,
        email: user.email,
        phone: user.phone,
      }
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ VERIFY TOKEN (Keep session alive)
exports.verifySecurity = (req, res) => {
  return res.json({ 
    success: true, 
    user: req.user 
  });
};