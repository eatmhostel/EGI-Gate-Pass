const ManualEntry = require("../models/ManualEntry");

// CREATE MANUAL ENTRY
exports.createEntry = async (req, res) => {
    try {
        const {
            type, name, mobile, regNo, course, branch,
            destination, outTime, returnTime, returnDate,
            currentAction, scannedBy
        } = req.body;

        if (!name || !mobile || !currentAction || !scannedBy) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        if (type === "student" && !destination) {
            return res.json({ success: false, message: "Destination is required for students." });
        }

        const entryData = {
            type, name, mobile, regNo, course, branch,
            destination, outTime, returnTime, returnDate,
            currentAction, scannedBy
        };

        // ✅ FIX: Record specific action time
        if (currentAction === "exit") {
            entryData.exitTime = new Date();
        } else {
            entryData.entryTime = new Date();
        }

        const entry = new ManualEntry(entryData);
        await entry.save();
        res.json({ success: true, message: "Manual entry recorded", entry });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// GET TODAY'S MANUAL ENTRIES
exports.getTodayEntries = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const entries = await ManualEntry.find({
            createdAt: { $gte: start }
        }).sort({ createdAt: -1 });

        res.json({ success: true, entries });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// GET ALL ENTRIES
exports.getAllEntries = async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const entries = await ManualEntry.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await ManualEntry.countDocuments();
        res.json({ success: true, entries, total });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// GET SINGLE ENTRY DETAILS
exports.getEntryById = async (req, res) => {
    try {
        const entry = await ManualEntry.findById(req.params.id);
        if (!entry) return res.json({ success: false, message: "Not found" });
        res.json({ success: true, entry });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// TOGGLE ENTRY/EXIT STATUS
exports.toggleStatus = async (req, res) => {
    try {
        const entry = await ManualEntry.findById(req.params.id);
        if (!entry) return res.json({ success: false, message: "Not found" });

        if (entry.status === "completed") {
            return res.json({ 
                success: false, 
                message: "This entry is already completed and cannot be changed." 
            });
        }

        // Flip the status
        entry.currentAction = entry.currentAction === "entry" ? "exit" : "entry";
        
        // ✅ FIX: Record the new action time
        if (entry.currentAction === "exit") {
            if (!entry.exitTime) entry.exitTime = new Date();
        } else {
            if (!entry.entryTime) entry.entryTime = new Date();
        }

        entry.status = "completed";
        await entry.save();

        res.json({ 
            success: true, 
            message: `Status updated to ${entry.currentAction}. Entry is now completed.`, 
            currentAction: entry.currentAction,
            status: entry.status,
            exitTime: entry.exitTime,
            entryTime: entry.entryTime
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};