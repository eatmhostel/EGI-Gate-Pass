const Security = require("../models/Security");
const bcrypt = require("bcryptjs");

// ADD SECURITY
exports.addSecurity = async (req, res) => {
  try {
    const { name, empId, email, phone, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSecurity = new Security({
      name,
      empId,
      email,
      phone,
      password: hashedPassword,
    });

    await newSecurity.save();

    res.json({ success: true, message: "Security added" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// LOGIN SECURITY
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

    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};