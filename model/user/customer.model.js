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
	cus_logo: { type: String, required: false, default: "" },
	cus_prefix: { type: String, required: true },
	cus_firstname: { type: String, required: true }, //ชื่อ
	cus_lastname: { type: String, required: true }, // นามสกุล
	cus_email: { type: String, required: true }, //เลขบัตร
	cus_pass: { type: String, required: true }, //รหัส
	cus_password: { type: String, required: true }, //รหัส
	cus_address: { type: String, required: true }, // ที่อยู่
	cus_subdistrict: { type: String, required: true },
	cus_district: { type: String, required: true },
	cus_provice: { type: String, required: true },
	cus_postcode: { type: String, required: true },
	cus_phone: { type: String, required: true },
	cus_date_start: { type: Date, required: false, default: Date.now() }, //เริ่ม
	cus_status: { type: Boolean, required: false, detail: true },
	cus_wallet: { type: Number, require: false, default: 0 },
	cus_token: { type: String, required: false, default: "" },
	cus_function: {
		type: [
			{
				name: { type: String, required: true },
				percent: { type: Number, required: false, default: 0 },
				status: { type: Boolean, required: false, detail: false },
			}
		]
	},
	cus_emp: { type: String, required: false, default: "ไม่มี" },
});

const Customers = mongoose.model("customer", CustomerSchema);

const validate = (data) => {
	const schema = Joi.object({
		cus_logo: Joi.string().default(""),
		cus_prefix: Joi.string().required().label("กรุณากรอกคำนำหน้าชื่อ"),
		cus_firstname: Joi.string().required().label("กรุณากรอกชื่อ"),
		cus_lastname: Joi.string().required().label("กรุณากรอกนามสกุล"),
		cus_phone: Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
		cus_address: Joi.string().required().label("กรุณากรอกที่อยู่"),
		cus_subdistrict: Joi.string().required().label("กรุณากรอกตำบล"),
		cus_district: Joi.string().required().label("กรุณากรอกอำเภอ"),
		cus_provice: Joi.string().required().label("กรุณากรอกจังหวัด"),
		cus_postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์"),
		cus_email: Joi.string().required().label("กรุณากรอกอีเมล"),
		cus_pass: Joi.string().required().label("กรุณากรอกรหัสผ่าน"),
		cus_password: passwordComplexity(complexityOptions).required().label("กรุณากรอกรหัสผ่าน"),
		cus_date_start: Joi.date().raw().default(Date.now()),
		cus_wallet: Joi.number().default(0),
		cus_status: Joi.boolean().default(true),
		cus_token: Joi.string().default(""),
		// cus_function: Joi.array().default([]), // เปิดการใช้งานบริการ
		cus_emp: Joi.string().default("ไม่มี"),
	});
	return schema.validate(data);
};

module.exports = { Customers, validate };