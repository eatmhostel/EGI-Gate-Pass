const GatePass = require("../models/GatePassRequest");
const SecurityScan = require("../models/SecurityScan");

// ── Helpers ──────────────────────────────────────────────────
const checkIsExpired = (validUntil) => {
    if (!validUntil) return false;
    try {
        const expiry = new Date(validUntil);
        return isNaN(expiry.getTime()) ? false : new Date() > expiry;
    } catch {
        return false;
    }
};

const fmtDT = (d) =>
    d
        ? new Date(d).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "—";

const fmtTime = (d) =>
    d
        ? new Date(d).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "—";

// Silent helper — never crashes the main flow
async function logDeniedScan(
    gatePassId,
    studentId,
    destination,
    reason,
    scannedBy,
    student
) {
    try {
        await new SecurityScan({
            gatePass: gatePassId,
            student: studentId,
            studentName: student?.fullName || "Unknown",
            studentRegNo: student?.regNo || "—",
            destination: destination || "—",
            action: "exit",
            status: "denied",
            denyReason: reason,
            scannedBy: scannedBy || "Security",
        }).save();
    } catch {
        /* silent */
    }
}

// ── VERIFY QR & RECORD SCAN ─────────────────────────────────
exports.verifyScan = async (req, res) => {
    try {
        const { qrData, scannedBy } = req.body;
        if (!qrData)
            return res.json({ success: false, message: "No QR data received" });

        // 1. Parse
        let parsed;
        try {
            parsed = JSON.parse(qrData);
        } catch {
            await logDeniedScan(null, null, null, "Invalid QR format", scannedBy);
            return res.json({
                success: false,
                message: "Invalid QR code format",
            });
        }

        // 2. Find gate pass
        let gatePass = null;

        if (parsed.requestId) {
            gatePass = await GatePass.findById(parsed.requestId).populate(
                "student"
            );
        }

        if (!gatePass && parsed.studentId && parsed.validUntil) {
            gatePass = await GatePass.findOne({
                student: parsed.studentId,
                validUntil: new Date(parsed.validUntil),
                status: "approved",
            }).populate("student");
        }

        // 3. Not found
        if (!gatePass) {
            await logDeniedScan(
                null,
                parsed.studentId,
                parsed.destination,
                "Pass not found",
                scannedBy
            );
            return res.json({
                success: false,
                message: "Gate pass not found",
            });
        }

        const student = gatePass.student;

        // 4. Status check
        if (gatePass.status === "completed") {
            await logDeniedScan(
                gatePass._id,
                student._id,
                gatePass.destination,
                "Pass already completed",
                scannedBy,
                student
            );
            return res.json({
                success: false,
                message: "This pass has already been used (student entered back).",
                student: { fullName: student.fullName, regNo: student.regNo },
            });
        }
        if (gatePass.status === "pending") {
            await logDeniedScan(
                gatePass._id,
                student._id,
                gatePass.destination,
                "Pass pending",
                scannedBy,
                student
            );
            return res.json({
                success: false,
                message: "This pass is still pending approval.",
                student: { fullName: student.fullName, regNo: student.regNo },
            });
        }
        if (gatePass.status === "rejected") {
            await logDeniedScan(
                gatePass._id,
                student._id,
                gatePass.destination,
                "Pass rejected",
                scannedBy,
                student
            );
            return res.json({
                success: false,
                message: "This pass has been rejected.",
                student: { fullName: student.fullName, regNo: student.regNo },
            });
        }

        // 5. Expiry check
        if (checkIsExpired(gatePass.validUntil)) {
            gatePass.status = "expired";
            await gatePass.save();
            await logDeniedScan(
                gatePass._id,
                student._id,
                gatePass.destination,
                "Expired (valid until " + fmtDT(gatePass.validUntil) + ")",
                scannedBy,
                student
            );
            return res.json({
                success: false,
                message:
                    "Pass expired. Was valid until " + fmtDT(gatePass.validUntil),
                student: { fullName: student.fullName, regNo: student.regNo },
            });
        }

        // 6. Determine action
        const cur = gatePass.gateStatus;
        let action = !cur || cur === "enter" ? "exit" : "enter";

        // ✅ 7. Update pass with explicit scan fields
        gatePass.gateStatus = action;
        if (action === "exit") {
            gatePass.scannedOut = true;
            gatePass.scannedOutAt = new Date();
        } else if (action === "enter") {
            gatePass.scannedIn = true;
            gatePass.scannedInAt = new Date();
            gatePass.status = "completed";
        }
        await gatePass.save();

        // 8. Record scan
        const scan = await new SecurityScan({
            gatePass: gatePass._id,
            student: student._id,
            studentName: student.fullName,
            studentRegNo: student.regNo,
            destination: gatePass.destination,
            action,
            status: "allowed",
            scannedBy: scannedBy || "Security",
        }).save();

        // 9. Respond
        return res.json({
            success: true,
            action,
            message:
                action === "exit"
                    ? "Student exit recorded"
                    : "Student entry recorded",
            student: {
                fullName: student.fullName,
                regNo: student.regNo,
                course: student.course,
                branch: student.branch,
                photo: student.photo,
            },
            gatePass: {
                destination: gatePass.destination,
                validUntil: gatePass.validUntil,
                outTime: gatePass.outTime,
                scannedOut: gatePass.scannedOut,
                scannedIn: gatePass.scannedIn,
                scannedOutAt: gatePass.scannedOutAt,
                scannedInAt: gatePass.scannedInAt,
                status: gatePass.status,
            },
            scannedAt: scan.createdAt,
        });
    } catch (err) {
        return res.json({ success: false, message: "Server error" });
    }
};

// ── SCAN HISTORY ─────────────────────────────────────────────
exports.getHistory = async (req, res) => {
    try {
        const { filter = "all", limit = 50, page = 1, scannedBy } = req.query;

        let query = {};
        
        // ✅ Filter by specific security guard
        if (scannedBy) query.scannedBy = scannedBy;

        if (filter === "denied") {
            query.status = "denied";
        } else if (filter === "exit" || filter === "enter") {
            query.action = filter;
            query.status = "allowed";
        }

        const skip = (Number(page) - 1) * Number(limit);

        const scans = await SecurityScan.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("student", "fullName regNo course branch photo")
            .populate("gatePass", "destination validUntil");

        const total = await SecurityScan.countDocuments(query);

        res.json({
            success: true,
            scans,
            total,
            totalPages: Math.ceil(total / Number(limit)),
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ── TODAY'S STATS ────────────────────────────────────────────
exports.getTodayStats = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const $gte = { $gte: start };

        const scannedBy = req.query.scannedBy;
        let base = { createdAt: $gte };
        if (scannedBy) base.scannedBy = scannedBy;

        const [exits, entries, denied] = await Promise.all([
            SecurityScan.countDocuments({ ...base, action: "exit", status: "allowed" }),
            SecurityScan.countDocuments({ ...base, action: "enter", status: "allowed" }),
            SecurityScan.countDocuments({ ...base, status: "denied" }),
        ]);

        const activeOutside = await GatePass.countDocuments({
            status: "approved",
            gateStatus: "exit",
        });

        res.json({
            success: true,
            stats: {
                exits,
                entries,
                denied,
                passed: exits + entries,     // ✅ Only students who actually passed
                total: exits + entries + denied, // ✅ All scan events (used for Profile's "My QR Scans")
                activeOutside,
            },
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};