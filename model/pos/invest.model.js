const mongoose = require("mongoose");
const Joi = require("joi");

const InvestSchema = new mongoose.Schema({
	partner_id: { type: String, required: true },
	name: { type: String, required: true },
	phone: { type: String, required: true },
	iden: { type: String, required: true },
	invoice: { type: String, required: true },
	type: {
		type: String,
		enum: ["Land", "Money", "LandAndMoney"],
		required: true,
	},
	size: {
		type: String,
		enum: ["S", "M", "L", "XL", "ไม่มี"],
		required: true,
	},
	position: {
		type: String,
		enum: ["ลงทุนคนเดียว", "ลงทุนหลายคน", ""],
		required: false,
	},
	money: { type: Number, required: false, defail: 0 },
	detail: { type: Array, require: false, default: [] },
	address: { type: String, required: false, defail: "" },
	subdistrict: { type: String, required: false, defail: "" },
	district: { type: String, required: false, defail: "" },
	province: { type: String, required: false, defail: "" },
	postcode: { type: String, required: false, defail: "" },
	latitude: { type: String, required: false, default: "" },
	longtitude: { type: String, required: false, default: "" },
	remark: { type: String, required: false, default: "" },
	status: { type: Array, required: false, default: [] },
	timestamp: { type: Date, required: false, default: Date.now() },
	employee: { type: String, required: false, default: "ไม่มี" }, //ชื่อเจ้าหน้าที่ ทำรายการยืนยัน
});

const Invests = mongoose.model("invest", InvestSchema);

const validate = (data) => {
	const schema = Joi.object({
		partner_id: Joi.string().required().label("กรุณากรอก partner_id"),
		name: Joi.string().required().label("กรุณากรอกชื่อ"),
		phone: Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
		iden: Joi.string().required().label("กรุณากรอกเลขบัตรปชช"),
		type: Joi.string().required().label("กรุณากรอกประเภท"),
		size: Joi.string().required().label("กรุณากรอกขนาดร้าน"),
		position: Joi.string().default(""),
		money: Joi.number().default(0),
		detail: Joi.array().default([]),
		address: Joi.string().default(""),
		subdistrict: Joi.string().default(""),
		district: Joi.string().default(""),
		province: Joi.string().default(""),
		postcode: Joi.string().default(""),
		latitude: Joi.string().default(''),
		longtitude: Joi.string().default(''),
		timestamp: Joi.date().raw().default(Date.now()),
		employee: Joi.string().default("ไม่มี"),
	});
	return schema.validate(data);
};

module.exports = { Invests, validate };