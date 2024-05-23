const mongoose = require("mongoose");

const NameExpressSchema = new mongoose.Schema({
	name: { type: String, required: true },
	employee: { type: String, required: false, default: "ไม่มี" },
});

const NameExpress = mongoose.model("name_express", NameExpressSchema);

module.exports = { NameExpress };