const mongoose = require("mongoose");
const Joi = require("joi");

const PreOrderTossagunRefSchema = new mongoose.Schema({
	ponba_ref_shop_id: { type: String, required: true },
	ponba_ref_number: { type: String, required: true },
	ponba_ref_detail: { type: Array, required: false, default: [] },
	ponba_status: { type: String, required: false, default: "ยกเลิกรายการ" },
	ponba_ref_date: { type: Date, required: false, default: Date.now() },
	ponba_ref_emp: { type: String, required: false, default: "ไม่มี" },
});

const PreOrderTossagunRef = mongoose.model("preorder_tossagun_ref", PreOrderTossagunRefSchema);

const valiedate = (data) => {
	const schema = Joi.object({
		ponba_ref_shop_id: Joi.string().required().label("กรุณากรอกไอดีร้านค้า"),
		ponba_ref_number: Joi.string().required().label("กรุณากรอกเลขที่ทำรายการ"),
		ponba_ref_detail: Joi.array().default([]),
		ponba_status: Joi.string().default("ยกเลิกรายการ"),
		ponba_ref_date: Joi.date().raw().default(Date.now()),
		ponba_ref_emp: Joi.string().default("ไม่มี"),
	});
	return schema.validate(data);
};

module.exports = { PreOrderTossagunRef, valiedate };