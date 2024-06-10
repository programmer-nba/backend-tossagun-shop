const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema({
  name: { type: String, require: true },
  ref: { type: String, require: true }, //ข้อมูลอ้างอิงการเข้าสู่ระบบ
  ip_address: { type: String, require: true },
  latitude: { type: String, require: true },
  longitude: { type: String, require: true },
  timestamp: { type: Date, require: true },
});

const LoginHistorys = mongoose.model("login_history", LoginHistorySchema);

module.exports = { LoginHistorys };
