const Student = require("../models/Student");
const Security = require("../models/Security");

// LOGIN (already done)
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_ID &&
    password === process.env.ADMIN_PASS
  ) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: "Invalid credentials" });
  }
};

// ✅ GET ALL PENDING REQUESTS
exports.getRequests = async (req, res) => {
  const students = await Student.find({ status: "pending" });
  res.json(students);
};

// ✅ APPROVE
exports.approveStudent = async (req, res) => {
  const { id } = req.params;

  await Student.findByIdAndUpdate(id, { status: "approved" });

  res.json({ success: true, message: "Student approved" });
};

// ✅ REJECT
exports.rejectStudent = async (req, res) => {
  const { id } = req.params;

  await Student.findByIdAndUpdate(id, { status: "rejected" });

  res.json({ success: true, message: "Student rejected" });
};

// ✅ TOTAL STUDENTS
exports.getTotalStudents = async (req, res) => {
  try {
    const count = await Student.countDocuments({});
    res.json({ success: true, count });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ TOTAL SECURITY
exports.getTotalSecurity = async (req, res) => {
  try {
    const count = await Security.countDocuments({});
    res.json({ success: true, count });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};