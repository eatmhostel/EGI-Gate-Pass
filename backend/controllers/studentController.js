const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// ✅ REGISTER
exports.registerStudent = async (req, res) => {
  try {
    const { regNo, fullName, course, branch, email, gender, password } = req.body;
    const existing = await Student.findOne({ regNo });
    if (existing) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      regNo,
      fullName,
      course,
      branch,
      email,
      gender,
      password: hashedPassword,
    });

    await student.save();

    res.json({
      success: true,
      message: "Registration successful. Wait for admin approval.",
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};

// ✅ LOGIN (ONLY APPROVED)
exports.loginStudent = async (req, res) => {
  try {
    const { regNo, password } = req.body;

    const student = await Student.findOne({ regNo });

    if (!student) {
      return res.json({ success: false, message: "User not found" });
    }

    if (student.status !== "approved") {
      return res.json({
        success: false,
        message: "Wait for admin approval",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }
    res.json({
      success: true,
      user: {
        name: student.fullName,
        regNo: student.regNo,
        course: student.course,
        branch: student.branch,
        email: student.email,
      },
    });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
};