const mongoose = require("mongoose");

const securityScanSchema = new mongoose.Schema(
    {
        gatePass: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GatePassRequest",
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
        studentName: { type: String },
        studentRegNo: { type: String },
        destination: { type: String },

        action: {
            type: String,
            enum: ["exit", "enter"],
        },
        status: {
            type: String,
            enum: ["allowed", "denied"],
            required: true,
        },
        denyReason: { type: String },
        scannedBy: { type: String, default: "Security" },
    },
    { timestamps: true }
);

securityScanSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SecurityScan", securityScanSchema);