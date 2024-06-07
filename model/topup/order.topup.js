const mongoose = require("mongoose");
const Joi = require("joi");

const OrderTopupSchema = new mongoose.Schema({
	shop_id: { type: String, required: true },
	platform: { type: String, required: false, default: '' },
	invoice: { type: String, required: false, default: "ไม่มี" },
	ref_number: { type: Number, required: false },
	invoice_full: { type: String, default: "ไม่มี" },
	total: { type: Number, required: false },
	commission: { type: Number, required: false, default: 0 },
	commission_tg: { type: Number, required: false, default: 0 },
	commission_shop: { type: Number, required: false, default: 0 },
	total_platform: { type: Number, required: false, default: 0 },
	moneyreceive: { type: Number, required: true, default: 0 },
	change: { type: Number, required: true, default: 0 },
	discount: { type: Number, required: true, default: 0 },
	payment_type: { type: String, required: true },
	product: { type: Array, default: [] },
	employee: { type: String, required: true },
	status: { type: Array, default: [] },
	timestamp: { type: String, required: true },
});

const OrderTopup = mongoose.model("order_topup", OrderTopupSchema);

const validate = (data) => {
	const schema = Joi.object({
		shop_id: Joi.string().required().label("ไม่พบ shop_id"),
		platform: Joi.string().default(''),
		invoice: Joi.string().default("ไม่มี"),
		ref_number: Joi.number(),
		invoice_full: Joi.string().default("ไม่มี"),
		total: Joi.number().required().label("ไม่พบยอดรวมใบเสร็จ"),
		commission: Joi.number().default(0),
		commission_tg: Joi.number().default(0),
		commission_shop: Joi.number().default(0),
		total_platform: Joi.number().default(0),
		moneyreceive: Joi.number().default(0),
		change: Joi.number().default(0),
		discount: Joi.number().default(0),
		payment_type: Joi.string().required().label("ประเภทการชำระ"),
		product: Joi.array(),
		employee: Joi.string().required().label("ไม่พบพนักงานทำรายการ"),
		status: Joi.array(),
		timestamp: Joi.string(),
	});
	return schema.validate(data);
};

module.exports = { OrderTopup, validate };