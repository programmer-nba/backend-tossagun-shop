const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const complexityOptions = {
	min: 6,
	max: 30,
	lowerCase: 0,
	upperCase: 0,
	numeric: 0,
	symbol: 0,
	requirementCount: 2,
};

const PartnerSchema = new mongoose.Schema({
	partner_prefix: { type: String, required: true },
	partner_firstname: { type: String, required: true }, //ชื่อ
	partner_lastname: { type: String, required: true }, // นามสกุล
	partner_username: { type: String, required: true }, //เลขบัตร
	partner_password: { type: String, required: true }, //รหัส
	partner_date_start: { type: Date, required: false, default: Date.now() }, //เริ่ม
	partner_status: { type: Boolean, required: false, detail: true },
	partner_token: { type: String, required: false, default: "" },
	partner_emp: { type: String, required: false, default: "ไม่มี" },
});

const Partners = mongoose.model("partner", PartnerSchema);

const validate = (data) => {
	const schema = Joi.object({
		partner_prefix: Joi.string().required().label("กรุณากรอกคำนำหน้าชื่อ"),
		partner_firstname: Joi.string().required().label("กรุณากรอกชื่อ"),
		partner_lastname: Joi.string().required().label("กรุณากรอกนามสกุล"),
		partner_username: Joi.string().required().label("กรุณากรอกชื่อผู้ใช้"),
		partner_password: passwordComplexity(complexityOptions).required().label("กรุณากรอกรหัสผู้ใช้"),
		partner_date_start: Joi.date().raw().default(Date.now()),
		partner_status: Joi.boolean().default(true),
		partner_token: Joi.string().default(""),
		partner_emp: Joi.string().default("ไม่มี"),
	});
	return schema.validate(data);
};

module.exports = { Partners, validate };