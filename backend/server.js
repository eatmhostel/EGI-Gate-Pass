require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes")
const securityRoutes = require("./routes/securityRoutes");
const gatePassRoutes = require("./routes/gatePassRoutes")
const securityScanRoutes = require("./routes/securityScanRoutes");

// DB connect
connectDB();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/student",studentRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/gatepass", gatePassRoutes);
app.use("/api/security-scans", securityScanRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});