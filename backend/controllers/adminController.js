const PDFDocument = require("pdfkit");
const Student = require("../models/Student");
const Security = require("../models/Security");
const GatePass = require("../models/GatePassRequest");
const SecurityScan = require("../models/SecurityScan");
const jwt = require("jsonwebtoken");

// ✅ LOGIN WITH JWT TOKEN
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_ID && password === process.env.ADMIN_PASS) {
    // Generate JWT Token
    const token = jwt.sign(
      { 
        id: "admin_001", 
        name: email, 
        role: "admin" 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    return res.json({ 
      success: true, 
      token,
      user: {
        name: email,
        role: "admin"
      }
    });
  } else {
    return res.json({ success: false, message: "Invalid credentials" });
  }
};

// ✅ VERIFY TOKEN (Keep session alive)
exports.verifyAdmin = (req, res) => {
  return res.json({ 
    success: true, 
    user: req.user 
  });
};

// ✅ GET ALL PENDING REQUESTS
exports.getRequests = async (req, res) => {
  try {
    const students = await Student.find({ status: "pending" });
    // ✅ Return standard object instead of raw array
    res.json({ success: true, requests: students });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
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

// ✅✅✅ DOWNLOAD LAST 24 HOURS DATA AS PDF
exports.downloadData = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const scans = await SecurityScan.find({
      createdAt: { $gte: twentyFourHoursAgo }
    })
    .sort({ createdAt: 1 })
    .populate("student", "fullName regNo course branch phone")
    .populate("gatePass", "destination outTime returnTime");

    // Get guard details
    const uniqueGuardNames = [...new Set(scans.map(s => s.scannedBy).filter(Boolean))];
    const guards = await Security.find({ name: { $in: uniqueGuardNames } }).select("name empId");
    const guardMap = new Map(guards.map(g => [g.name, g]));

    // Process scans into 3 categories
    const qrPassData = [];
    const manualData = [];
    const deniedData = [];
    const passMap = new Map();

    scans.forEach(scan => {
      // Denied scans
      if (scan.status === "denied") {
        const s = scan.student || {};
        deniedData.push({
          name: scan.studentName || s.fullName || "Unknown",
          regNo: scan.studentRegNo || s.regNo || "—",
          phone: s.phone || "—",
          destination: scan.destination || "—",
          time: scan.createdAt,
          securityName: scan.scannedBy || "—",
          securityEmpId: (guardMap.get(scan.scannedBy) || {}).empId || "—",
          reason: scan.denyReason || "Not specified"
        });
        return;
      }

      const s = scan.student || {};
      const isManual = !scan.gatePass;

      // Manual entries/exits
      if (isManual) {
        manualData.push({
          name: scan.studentName || s.fullName || "Unknown",
          regNo: scan.studentRegNo || s.regNo || "—",
          phone: s.phone || "—",
          course: s.course || "—",
          branch: s.branch || "—",
          destination: scan.destination || "—",
          time: scan.createdAt,
          action: scan.action || "—",
          securityName: scan.scannedBy || "—",
          securityEmpId: (guardMap.get(scan.scannedBy) || {}).empId || "—"
        });
        return;
      }

      // QR Pass scans — group by gatePass
      const gpId = scan.gatePass._id.toString();
      if (!passMap.has(gpId)) {
        passMap.set(gpId, { exit: null, enter: null, student: s, gatePass: scan.gatePass });
      }
      const group = passMap.get(gpId);
      if (scan.action === "exit") group.exit = scan;
      if (scan.action === "enter") group.enter = scan;
    });

    // Build QR pass rows
    let idx = 1;
    for (const [, data] of passMap.entries()) {
      const s = data.student || {};
      const gp = data.gatePass || {};
      const ex = data.exit || {};
      const en = data.enter || {};

      qrPassData.push({
        sno: idx++,
        name: s.fullName || "Unknown",
        regNo: s.regNo || "—",
        phone: s.phone || "—",
        course: s.course || "—",
        branch: s.branch || "—",
        destination: gp.destination || "—",
        exitTime: ex.createdAt || null,
        entryTime: en.createdAt || null,
        exitSecurity: ex.scannedBy || "—",
        exitEmpId: (guardMap.get(ex.scannedBy) || {}).empId || "—",
        entrySecurity: en.scannedBy || "—",
        entryEmpId: (guardMap.get(en.scannedBy) || {}).empId || "—",
      });
    }

    // Build denied rows
    const deniedRows = deniedData.map((d, i) => ({ ...d, sno: i + 1 }));

    // ========== PDF GENERATION ==========
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 35, bottom: 35, left: 30, right: 30 },
      info: {
        Title: "Gate Activity Report - Last 24 Hours",
        Author: "Admin System",
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=gate-activity-report.pdf");
    doc.pipe(res);

    const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const fmtDT = (d) =>
      d
        ? new Date(d).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";

    // --- Draw blue header bar ---
    doc.rect(0, 0, doc.page.width, 65).fill("#0040a1");
    doc.fill("#ffffff").fontSize(20).font("Helvetica-Bold")
       .text("GATE ACTIVITY REPORT", 0, 12, { align: "center" });
    doc.fontSize(10).font("Helvetica")
       .text("Last 24 Hours  \u2022  Generated: " + new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), 0, 40, { align: "center" });

    doc.fill("#000000");
    let y = 80;

    // --- Summary box ---
    doc.rect(doc.page.margins.left, y, pageW, 30).fill("#eef2ff").stroke("#c7d2fe");
    doc.fill("#1a237e").fontSize(9).font("Helvetica-Bold");
    doc.text("SUMMARY", doc.page.margins.left + 10, y + 9);
    doc.fill("#333333").font("Helvetica");
    doc.text(`QR Pass Movements: ${qrPassData.length}`, doc.page.margins.left + 80, y + 9);
    doc.text(`Manual Entries/Exits: ${manualData.length}`, doc.page.margins.left + 280, y + 9);
    doc.text(`Denied Scans: ${deniedRows.length}`, doc.page.margins.left + 490, y + 9);
    y += 42;

    // --- Helper: Draw page mini header ---
    function drawPageHeader() {
      doc.rect(0, 0, doc.page.width, 22).fill("#0040a1");
      doc.fill("#ffffff").fontSize(7).font("Helvetica-Bold")
         .text("GATE ACTIVITY REPORT \u2022 Last 24 Hours", 0, 7, { align: "center" });
      doc.fill("#000000");
    }

    // --- Helper: Draw table ---
    function drawTable(title, headers, rows, colWidths, startY) {
      let cy = startY;
      const rowH = 20;
      const headerH = 22;
      const bottomLimit = doc.page.height - doc.page.margins.bottom - 10;
      const fSize = 7;

      // Check if title + header fit
      if (cy + headerH + 25 > bottomLimit) {
        doc.addPage();
        cy = doc.page.margins.top;
        drawPageHeader();
      }

      // Section title
      doc.fill("#1a237e").fontSize(10).font("Helvetica-Bold")
         .text(title, doc.page.margins.left, cy);
      cy += 16;

      // Header background
      doc.rect(doc.page.margins.left, cy, pageW, headerH).fill("#1a237e");
      doc.fill("#ffffff").fontSize(fSize).font("Helvetica-Bold");
      let x = doc.page.margins.left;
      headers.forEach((h, i) => {
        doc.text(h, x + 3, cy + 6, { width: colWidths[i] - 6, align: "left" });
        x += colWidths[i];
      });
      cy += headerH;

      // Rows
      if (rows.length === 0) {
        doc.fill("#999999").fontSize(9).font("Helvetica-Oblique")
           .text("No records found", doc.page.margins.left, cy + 4, { width: pageW, align: "center" });
        cy += 22;
      } else {
        rows.forEach((row, ri) => {
          if (cy + rowH > bottomLimit) {
            doc.addPage();
            cy = doc.page.margins.top;
            drawPageHeader();
            // Redraw header on new page
            doc.rect(doc.page.margins.left, cy, pageW, headerH).fill("#1a237e");
            doc.fill("#ffffff").fontSize(fSize).font("Helvetica-Bold");
            let hx = doc.page.margins.left;
            headers.forEach((h, i) => {
              doc.text(h, hx + 3, cy + 6, { width: colWidths[i] - 6, align: "left" });
              hx += colWidths[i];
            });
            cy += headerH;
          }

          // Alternate row background
          if (ri % 2 === 0) {
            doc.rect(doc.page.margins.left, cy, pageW, rowH).fill("#f5f7fa");
          }

          // Cell text
          doc.fill("#222222").fontSize(fSize).font("Helvetica");
          x = doc.page.margins.left;
          row.forEach((cell, ci) => {
            doc.text(String(cell || "\u2014"), x + 3, cy + 5, {
              width: colWidths[ci] - 6,
              align: "left",
              lineBreak: false,
            });
            x += colWidths[ci];
          });

          // Row bottom line
          doc.moveTo(doc.page.margins.left, cy + rowH)
             .lineTo(doc.page.margins.left + pageW, cy + rowH)
             .stroke("#e0e0e0");
          cy += rowH;
        });
      }

      // Table outer border
      const tableTop = startY + 16;
      doc.rect(doc.page.margins.left, tableTop, pageW, cy - tableTop).stroke("#cccccc");

      return cy + 15;
    }

    // ===== SECTION 1: QR PASS ENTRIES/EXITS =====
    const qrHeaders = [
      "S.No", "Student Name", "Reg No", "Mobile", "Course", "Branch",
      "Destination", "Exit Time", "Entry Time", "Exit Security", "Entry Security"
    ];
    const qrWidths = [24, 88, 58, 70, 55, 55, 68, 88, 88, 88, 88]; // 780
    const qrRows = qrPassData.map((d) => [
      d.sno, d.name, d.regNo, d.phone, d.course, d.branch, d.destination,
      fmtDT(d.exitTime), fmtDT(d.entryTime),
      `${d.exitSecurity} (${d.exitEmpId})`,
      `${d.entrySecurity} (${d.entryEmpId})`
    ]);
    y = drawTable("QR PASS ENTRIES / EXITS", qrHeaders, qrRows, qrWidths, y);

    // ===== SECTION 2: MANUAL ENTRIES/EXITS =====
    const mnHeaders = [
      "S.No", "Student Name", "Reg No", "Mobile", "Course", "Branch",
      "Destination", "Time", "Type", "Security Name"
    ];
    const mnWidths = [24, 88, 58, 70, 55, 55, 68, 88, 38, 225]; // 769
    const mnRows = manualData.map((d, i) => [
      i + 1, d.name, d.regNo, d.phone, d.course, d.branch, d.destination,
      fmtDT(d.time),
      d.action === "exit" ? "EXIT" : d.action === "enter" ? "ENTRY" : "\u2014",
      `${d.securityName} (${d.securityEmpId})`
    ]);
    y = drawTable("MANUAL ENTRIES / EXITS", mnHeaders, mnRows, mnWidths, y);

    // ===== SECTION 3: DENIED SCANS =====
    if (deniedRows.length > 0) {
      const dnHeaders = [
        "S.No", "Student Name", "Reg No", "Mobile", "Destination",
        "Time", "Security Name", "Deny Reason"
      ];
      const dnWidths = [24, 88, 58, 70, 68, 88, 95, 290]; // 781
      const dnRows = deniedRows.map((d) => [
        d.sno, d.name, d.regNo, d.phone, d.destination,
        fmtDT(d.time), `${d.securityName} (${d.securityEmpId})`, d.reason
      ]);
      y = drawTable("DENIED / REJECTED SCANS", dnHeaders, dnRows, dnWidths, y);
    }

    // --- Footer on last page ---
    doc.fill("#aaaaaa").fontSize(7).font("Helvetica")
       .text("This is a system-generated report.", doc.page.margins.left, doc.page.height - 25, {
         width: pageW,
         align: "center"
       });

    doc.end();

  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};