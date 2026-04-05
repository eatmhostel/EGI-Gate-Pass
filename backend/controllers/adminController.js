const Student = require("../models/Student");
const Security = require("../models/Security");
const GatePass = require("../models/GatePassRequest");
const SecurityScan = require("../models/SecurityScan"); // ✅ ADDED

// LOGIN (already done)
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_ID && password === process.env.ADMIN_PASS) {
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
  await Student.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ success: true, message: "Student approved" });
};

// ✅ REJECT
exports.rejectStudent = async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, { status: "rejected" });
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

// ✅ GET ALL STUDENTS
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select("-password").sort({ createdAt: -1 });
        res.json({ success: true, students });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ DELETE STUDENT
exports.deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Student deleted" });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ GET ALL SECURITY
exports.getAllSecurity = async (req, res) => {
    try {
        const security = await Security.find().select("-password").sort({ createdAt: -1 });
        res.json({ success: true, security });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ DELETE SECURITY
exports.deleteSecurity = async (req, res) => {
    try {
        await Security.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Security deleted" });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ DOWNLOAD LAST 24 HOURS DATA (ADVANCED CSV)
exports.downloadData = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 1. Fetch all scans in the last 24 hours
        const scans = await SecurityScan.find({
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .sort({ createdAt: 1 }) // Sort ascending to process exits before entries
        .populate("student", "fullName regNo course branch email phone gender status createdAt")
        .populate("gatePass", "destination validUntil outTime returnTime");

        // 2. Dynamically find Security Guard IDs based on their names (Avoids schema changes!)
        const uniqueGuardNames = [...new Set(scans.map(s => s.scannedBy).filter(Boolean))];
        const guards = await Security.find({ name: { $in: uniqueGuardNames } }).select("name empId");
        const guardMap = new Map(guards.map(g => [g.name, g]));

        // 3. Group scans by Gate Pass (One pass = One Exit + One Entry)
        const passMap = new Map();
        const deniedScans = [];

        scans.forEach(scan => {
            if (scan.status === "denied") {
                deniedScans.push(scan);
                return;
            }

            const gpId = scan.gatePass ? scan.gatePass._id.toString() : `manual-${scan._id}`;
            
            if (!passMap.has(gpId)) {
                passMap.set(gpId, { exit: null, enter: null, student: scan.student, gatePass: scan.gatePass });
            }

            const group = passMap.get(gpId);
            if (scan.action === "exit") group.exit = scan;
            if (scan.action === "enter") group.enter = scan;
        });

        // 4. CSV Helpers
        const esc = (str) => {
            if (!str) return '""';
            return `"${String(str).replace(/"/g, '""')}"`;
        };
        const fmtDT = (d) => d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "";

        // 5. Build CSV Headers (Comprehensive Details)
        const header = [
            "Student Name", "Reg No", "Course", "Branch", "Email", "Phone", "Gender", "Student Status",
            "Destination", "Out Time (Scheduled)", "Return Time (Scheduled)", "Valid Until",
            "Actual Exit Time", "Exit Scanned By (Name)", "Exit Scanned By (Emp ID)",
            "Actual Entry Time", "Entry Scanned By (Name)", "Entry Scanned By (Emp ID)",
            "Final Pass Status"
        ].join(",") + "\n";

        // 6. Build Rows for Allowed Passes
        const allowedRows = [];
        for (const [gpId, data] of passMap.entries()) {
            const s = data.student || {};
            const gp = data.gatePass || {};
            const ex = data.exit || {};
            const en = data.enter || {};

            const exGuard = guardMap.get(ex.scannedBy) || {};
            const enGuard = guardMap.get(en.scannedBy) || {};

            const finalStatus = en ? "Completed (Entered)" : "Active (Outside)";

            allowedRows.push([
                esc(s.fullName), esc(s.regNo), esc(s.course), esc(s.branch), 
                esc(s.email), esc(s.phone), esc(s.gender), esc(s.status),
                esc(gp.destination), esc(fmtDT(gp.outTime)), esc(fmtDT(gp.returnTime)), esc(fmtDT(gp.validUntil)),
                esc(fmtDT(ex.createdAt)), esc(ex.scannedBy), esc(exGuard.empId || "N/A"),
                esc(fmtDT(en.createdAt)), esc(en.scannedBy), esc(enGuard.empId || "N/A"),
                esc(finalStatus)
            ].join(","));
        }

        // 7. Build Rows for Denied Scans
        const deniedHeader = "\n\n--- DENIED / REJECTED SCANS ---\n" + 
        ["Scan Time", "Student Name", "Reg No", "Destination", "Scanned By", "Security Emp ID", "Deny Reason"].join(",") + "\n";

        const deniedRows = deniedScans.map(scan => {
            const s = scan.student || {};
            const guard = guardMap.get(scan.scannedBy) || {};
            return [
                esc(fmtDT(scan.createdAt)), esc(scan.studentName || s.fullName), esc(scan.studentRegNo || s.regNo),
                esc(scan.destination), esc(scan.scannedBy), esc(guard.empId || "N/A"), esc(scan.denyReason)
            ].join(",");
        }).join("\n");

        // 8. Combine and Send
        const finalCsv = header + allowedRows.join("\n") + (deniedScans.length > 0 ? deniedHeader + deniedRows : "");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=gate-activity-last-24h.csv");
        res.status(200).send(finalCsv);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};