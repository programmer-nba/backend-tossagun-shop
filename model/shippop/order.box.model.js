const mongoose = require("mongoose");

const OrderBoxSchema = new mongoose.Schema({
	invoice: { type: String, required: false, default: "ไม่มี" },
	employee_id: { type: String, required: false },
	shop_id: { type: String, required: false },
	name: { type: String, required: false },
	type: { type: String, required: false },
	cost: { type: Number, required: false },
	price: { type: Number, required: false },
	width: { type: Number, required: false },
	length: { type: Number, required: false },
	height: { type: Number, required: false },
	total: { type: Number, required: false },
	amount: { type: Number, required: false },
	timestamp: { type: Date, required: false, default: Date.now() }
});

const OrderBoxExpress = mongoose.model("order_box", OrderBoxSchema);

module.exports = { OrderBoxExpress };