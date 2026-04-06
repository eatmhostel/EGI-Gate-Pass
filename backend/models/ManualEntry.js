const mongoose = require("mongoose");

const manualEntrySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["student", "visitor"],
            required: true,
        },
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        
        // Student specific (NOT required in schema, validated in controller)
        regNo: { type: String },
        course: { type: String },
        branch: { type: String },
        destination: { type: String }, // ✅ Removed required: true

        // Timing
        outTime: { type: String },
        returnTime: { type: String },
        returnDate: { type: String },

        // Status
        currentAction: {
            type: String,
            enum: ["entry", "exit"],
            required: true,
        },
        // ✅ Track if the entry/exit cycle is finished
        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active",
        },
        scannedBy: { type: String, required: true },
    },
    { timestamps: true }
);

manualEntrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });

module.exports = mongoose.model("ManualEntry", manualEntrySchema);