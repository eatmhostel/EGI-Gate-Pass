const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/mailer");

// ✅ REGISTER
exports.registerStudent = async (req, res) => {
  try {
    const { regNo, fullName, course, branch, email, phone, gender, password } = req.body;

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
      phone,
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

// ✅ LOGIN WITH JWT TOKEN
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

    // Generate JWT Token
    const token = jwt.sign(
      { 
        id: student._id, 
        name: student.fullName,
        regNo: student.regNo,
        course: student.course,
        branch: student.branch,
        email: student.email,
        phone: student.phone,
        role: "student" 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: student._id,
        name: student.fullName,
        regNo: student.regNo,
        course: student.course,
        branch: student.branch,
        email: student.email,
        phone: student.phone,
      },
    });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
};

// ✅ VERIFY TOKEN (Keep session alive)
exports.verifyStudent = (req, res) => {
  return res.json({ 
    success: true, 
    user: req.user 
  });
};

// ✅ FORGOT PASSWORD — Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.json({ success: false, message: "Email not registered" });
    }

    if (student.status !== "approved") {
      return res.json({ success: false, message: "Account not approved yet" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    student.otp = hashedOTP;
    student.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await student.save();

    try {
      await sendOTPEmail(student, otp);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr.message);
      return res.json({ success: false, message: "Failed to send OTP email" });
    }

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};

// ✅ VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const student = await Student.findOne({ email });
    if (!student || !student.otp || !student.otpExpires) {
      return res.json({ success: false, message: "Invalid request. Please request a new OTP." });
    }

    // Check expiry
    if (Date.now() > student.otpExpires) {
      student.otp = null;
      student.otpExpires = null;
      await student.save();
      return res.json({ success: false, message: "OTP expired. Please request a new one." });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp.toString(), student.otp);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Generate reset token (short-lived JWT, 15 min)
    const resetToken = jwt.sign(
      { id: student._id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    student.resetToken = resetToken;
    student.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    student.otp = null;
    student.otpExpires = null;
    await student.save();

    res.json({ success: true, message: "OTP verified", resetToken });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};

// ✅ RESEND OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.json({ success: false, message: "Email not registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    student.otp = hashedOTP;
    student.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await student.save();

    try {
      await sendOTPEmail(student, otp);
    } catch (mailErr) {
      return res.json({ success: false, message: "Failed to send OTP email" });
    }

    res.json({ success: true, message: "New OTP sent to your email" });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
};

// ✅ RESET PASSWORD — Set new password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.json({ success: false, message: "Invalid or expired reset token" });
    }

    const student = await Student.findById(decoded.id);
    if (!student || student.resetToken !== resetToken) {
      return res.json({ success: false, message: "Invalid reset token" });
    }

    if (Date.now() > student.resetTokenExpires) {
      return res.json({ success: false, message: "Reset token expired" });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    student.resetToken = null;
    student.resetTokenExpires = null;
    await student.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};