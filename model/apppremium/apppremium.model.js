const mongoose = require("mongoose");
const Joi = require("joi");

const AppPremiumSchema = new mongoose.Schema({
	employee_id: { type: String, required: false },
	shop_id: { type: String, required: true },
	purchase_id: { type: String, required: true },
	invoice: { type: String, required: false },
	detail: { type: Object, required: false },
	cost_tg: { type: Number, required: true },
	cost: { type: Number, required: true },
	total: { type: Number, required: false },
	total_platform: { type: Number, required: false },
	tossagun_tel: { type: String, required: false },
	order_status: { type: String, required: false, default: "" },
	timestamp: { type: Date, required: false, default: Date.now() }
});

const AppPremiumBooking = mongoose.model("apppremium_booking", AppPremiumSchema);

module.exports = { AppPremiumBooking }