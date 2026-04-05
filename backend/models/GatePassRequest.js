const mongoose = require("mongoose");

const gatePassSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        destination: { type: String, required: true },
        outTime: Date,
        returnTime: Date,
        returnDate: Date,

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "expired", "completed"],
            default: "pending",
        },

        // ✅ NEW — tracks whether student exited / entered
        gateStatus: {
            type: String,
            enum: ["exit", "enter"],
            default: null,
        },

        qrData: String,
        validUntil: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("GatePassRequest", gatePassSchema);