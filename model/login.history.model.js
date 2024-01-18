const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema({
  name: {type: String, require: true},
  ref: {type: Object, require: true}, //ข้อมูลอ้างอิงการเข้าสู่ระบบ
  mac_address: {type: String, require: true},
  timestamp: {type: Date, require: true},
});

const LoginHistorys = mongoose.model("login_history", LoginHistorySchema);

module.exports = {LoginHistorys};
