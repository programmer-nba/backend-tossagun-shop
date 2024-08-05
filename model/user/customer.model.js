const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const complexityOptions = {
	min: 6,
	max: 30,
	lowerCase: 0,
	upperCase: 0,
	numeric: 0,
	symbol: 0,
	requirementCount: 2,
};

const CustomerSchema = new mongoose.Schema({
	cus_prefix: { type: String, required: true },
	cus_firstname: { type: String, required: true }, //ชื่อ
	cus_lastname: { type: String, required: true }, // นามสกุล
	cus_username: { type: String, required: true }, //เลขบัตร
	cus_password: { type: String, required: true }, //รหัส
	cus_address: { type: String, required: true }, // ที่อยู่
	cus_phone: { type: String, required: true },
	cus_date_start: { type: Date, required: false, default: Date.now() }, //เริ่ม
	cus_status: { type: Boolean, required: false, detail: true },
	cus_wallet: { type: Number, require: false, default: 0 },
	cus_token: { type: String, required: false, default: "" },
	cus_function: { type: Array, required: false, default: [] },
	cus_emp: { type: String, required: false, default: "ไม่มี" },
});

const Customers = mongoose.model("customer", CustomerSchema);

const validate = (data) => {
	const schema = Joi.object({
		cus_prefix: Joi.string().required().label("กรุณากรอกคำนำหน้าชื่อ"),
		cus_firstname: Joi.string().required().label("กรุณากรอกชื่อ"),
		cus_lastname: Joi.string().required().label("กรุณากรอกนามสกุล"),
		cus_phone: Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
		cus_username: Joi.string().required().label("กรุณากรอกชื่อผู้ใช้"),
		cus_password: passwordComplexity(complexityOptions).required().label("กรุณากรอกรหัสผู้ใช้"),
		cus_date_start: Joi.date().raw().default(Date.now()),
		cus_wallet: Joi.number().required().default(0),
		cus_status: Joi.boolean().default(true),
		cus_token: Joi.string().default(""),
		cus_function: Joi.array().default([]), // เปิดการใช้งานบริการ
		cus_emp: Joi.string().default("ไม่มี"),
	});
	return schema.validate(data);
};

module.exports = { Customers, validate };