const mongoose = require("mongoose");

const BoxExpressSchema = new mongoose.Schema({
	shop_id: { type: String, required: true },
	name: { type: String, required: true },
	width: { type: Number, required: true }, //กว้าง
	length: { type: Number, required: true }, //ยาว
	height: { type: Number, required: true }, //สูง
	cost: { type: Number, required: true },
	price: { type: Number, required: true },
	employee: { type: String, required: false, default: "ไม่มี" },
});

const BoxExpress = mongoose.model("box_express", BoxExpressSchema);

module.exports = { BoxExpress };