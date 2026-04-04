require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");
const securityRoutes = require("./routes/securityRoutes");

// DB connect
connectDB();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/security", securityRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});