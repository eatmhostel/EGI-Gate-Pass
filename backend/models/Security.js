const mongoose = require("mongoose");

const securitySchema = new mongoose.Schema({
  name: String,
  empId: { type: String, unique: true },
  email: String,
  phone: String,
  password: String,
});

module.exports = mongoose.model("Security", securitySchema);