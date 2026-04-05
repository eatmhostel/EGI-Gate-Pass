const GatePass = require("../models/GatePassRequest");

// ✅ Safe expiry check — never crashes, handles null/invalid dates
const checkIsExpired = (validUntil) => {
    if (!validUntil) return false;
    try {
        const now = new Date();
        const expiry = new Date(validUntil);
        if (isNaN(expiry.getTime())) return false;
        return now > expiry;
    } catch (e) {
        return false;
    }
};

// ✅ Add computed isExpired without mutating the document
const attachExpiryInfo = (doc) => {
    const plain = doc.toObject ? doc.toObject() : doc;
    plain.isExpired = plain.status === "approved" && checkIsExpired(plain.validUntil);
    return plain;
};

// ✅ FIX: Combine returnDate (date) + returnTime (time) into one correct datetime
function getActualReturnDateTime(returnTime, returnDate) {
    const time = new Date(returnTime);
    const date = new Date(returnDate);
    date.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    return date;
}

// CREATE REQUEST
exports.createRequest = async (req, res) => {
    try {
        const { studentId, destination, outTime, returnTime, returnDate } = req.body;
        if (!studentId) return res.json({ success: false, message: "Student ID missing" });

        let status = destination !== "Home" ? "approved" : "pending";
        const outDateTime = new Date(outTime);
        const actualReturnDateTime = returnDate ? getActualReturnDateTime(returnTime, returnDate) : new Date(returnTime);
        const validUntil = new Date(actualReturnDateTime.getTime() + 30 * 60000);

        const qrData = JSON.stringify({ studentId, destination, validUntil: validUntil.toISOString() });

        const request = new GatePass({
            student: studentId, destination, outTime: outDateTime,
            returnTime: actualReturnDateTime, returnDate: returnDate ? new Date(returnDate) : null,
            status, qrData, validUntil,
        });

        await request.save();
        res.json({ success: true, requestId: request._id, status: request.status });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// GET PENDING REQUESTS
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await GatePass.find({ status: "pending" }).populate("student");
        res.json(requests);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// GET PENDING HOME REQUESTS
exports.getPendingHomeRequests = async (req, res) => {
    try {
        const requests = await GatePass.find({ status: "pending", destination: "Home" }).populate("student").sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// COUNT PENDING HOME REQUESTS
exports.countPendingHome = async (req, res) => {
    try {
        const count = await GatePass.countDocuments({ status: "pending", destination: "Home" });
        res.json({ success: true, count });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// APPROVE REQUEST
exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await GatePass.findById(id);
        if (!request) return res.json({ success: false, message: "Request not found" });

        const actualReturnDateTime = request.returnDate ? getActualReturnDateTime(request.returnTime, request.returnDate) : new Date(request.returnTime);
        const validUntil = new Date(actualReturnDateTime.getTime() + 30 * 60000);

        request.status = "approved";
        request.returnTime = actualReturnDateTime;
        request.validUntil = validUntil;
        request.qrData = JSON.stringify({ requestId: request._id, studentId: request.student, validUntil: validUntil.toISOString() });

        await request.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// REJECT REQUEST
exports.rejectRequest = async (req, res) => {
    try {
        await GatePass.findByIdAndUpdate(req.params.id, { status: "rejected" });
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// GET BY ID
exports.getRequestById = async (req, res) => {
    try {
        const request = await GatePass.findById(req.params.id).populate("student");
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });
        res.json({ success: true, request: attachExpiryInfo(request) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET BY STUDENT
exports.getRequestsByStudent = async (req, res) => {
    try {
        const requests = await GatePass.find({ student: req.params.studentId }).sort({ createdAt: -1 });
        res.json({ success: true, requests: requests.map(attachExpiryInfo) });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ NEW: STUDENT DASHBOARD DATA
exports.getStudentDashboard = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find latest active (approved + not expired) pass
        const allApproved = await GatePass.find({ student: studentId, status: "approved" }).sort({ createdAt: -1 });
        let activePass = null;
        
        for (let doc of allApproved) {
            const plain = doc.toObject ? doc.toObject() : doc;
            if (!checkIsExpired(plain.validUntil)) {
                activePass = attachExpiryInfo(plain);
                break;
            }
        }

        // Get 3 most recent requests of any status
        const recentDocs = await GatePass.find({ student: studentId })
            .sort({ createdAt: -1 })
            .limit(3);
            
        const recentRequests = recentDocs.map(attachExpiryInfo);

        // ✅ NEW: Get total pass count
        const totalPasses = await GatePass.countDocuments({ student: studentId });

        res.json({ success: true, activePass, recentRequests, totalPasses });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};