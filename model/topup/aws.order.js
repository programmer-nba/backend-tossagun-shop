const mongoose = require("mongoose");

const AWSSchema = new mongoose.Schema({
	employee_id: { type: String, required: false },
	shop_id: { type: String, required: true },
	invoice: { type: String, required: false },
	ref_number: { type: Number, required: false },
	order_id: { type: String, required: false },
	mobile: { type: String, required: false },
	branch: { type: String, required: false },
	service_id: { type: Number, required: false },
	name: { type: String, required: false },
	type: { type: String, required: false },
	amount: { type: Number, required: false, default: 0  },
	commission: { type: Number, required: false, default: 0 },
	commission_tg: { type: Number, required: false, default: 0 },
	commission_shop: { type: Number, required: false, default: 0 },
	total_platform: { type: Number, required: false, default: 0 },
	type_payment: { type: String, required: false, default: 0 },
	tossagun_tel: { type: String, required: false, default: 0 },
	order_status: { type: String, default: "", required: false },
	timestamp: { type: Date, required: true }
});

const AWSBooking = mongoose.model("aws_booking", AWSSchema);

module.exports = { AWSBooking };