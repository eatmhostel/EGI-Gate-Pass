const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  regNo: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: String,
  course: String,
  branch: String,
  email: String,
  phone: {
    type: String,
    default: "",
  },
  gender: String,
  password: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ✅ NEW FIELDS for password reset flow
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpires: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Student", studentSchema);