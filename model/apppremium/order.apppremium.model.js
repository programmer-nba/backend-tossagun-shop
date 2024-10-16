const mongoose = require("mongoose");
const Joi = require("joi");

const OrderAppPremiumSchema = new mongoose.Schema({
	shop_id: { type: String, required: true },
	platform: { type: String, required: false, default: '' },
	invoice: { type: String, required: false, default: "ไม่มี" },
	invoice_full: { type: String, default: "ไม่มี" },
	customer_name: { type: String, required: true },
	customer_tel: { type: String, required: true },
	customer_line: { type: String, required: true },
	total: { type: Number, required: true },
	total_cost: { type: Number, required: false, default: 0 },
	total_profit: { type: Number, required: false, default: 0 },
	total_profit_tg: { type: Number, required: false, default: 0 },
	total_profit_shop: { type: Number, required: false, default: 0 },
	// total_cost_tg: { type: Number, required: false, default: 0 },
	total_platform: { type: Number, required: false, default: 0 },
	moneyreceive: { type: Number, required: true, default: 0 },
	change: { type: Number, required: true, default: 0 },
	discount: { type: Number, required: true, default: 0 },
	payment_type: { type: String, required: true },
	purchase_id: { type: String, required: true, default: "ไม่มี" },
	product: { type: Array, default: [] },
	employee: { type: String, required: true },
	status: { type: Array, default: [] },
	timestamp: { type: String, required: true },
});

const OrderApppremium = mongoose.model("order_apppremium", OrderAppPremiumSchema);

module.exports = { OrderApppremium };