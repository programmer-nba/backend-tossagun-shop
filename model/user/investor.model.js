const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const dayjs = require("dayjs");

const complexityOptions = {
    min: 6,
    max: 30,
    lowerCase: 0,
    upperCase: 0,
    numeric: 0,
    symbol: 0,
    requirementCount: 2,
};

const InvertorSchema = new mongoose.Schema({
    invertor_name: { type: String, require: true }, // ชื่อ - นามสกุล
    invertor_phone: { type: String, require: true }, // เบอร์โทรศัพท์
    invertor_iden: { type: String, require: true }, // เลขบัตรประจำตัวประชาชน
    invertor_email: { type: String, require: false }, // อีเมล
    invertor_password: { type: String, require: true }, // รหัสผ่าน
    invertor_address: { type: String, require: true }, // ที่อยู่
    invertor_subdistrict: { type: String, require: true }, // ตำบล
    invertor_district: { type: String, require: true }, // อำเภอ
    invertor_provice: { type: String, require: true }, // จังหวัด
    invertor_postcode: { type: String, require: true }, // รหัสไปรษณีย์
    invertor_date_start: { type: Date, require: false, default: Date.now() }, // วันที่เริ่มสัญญา
    invertor_date_end: { type: Date, required: false, default: Date.now() }, // วันที่หมดสัญญา
    invertor_status: { type: Boolean, required: false, default: true }, // สถานะการเปิดให้ใช้งาน
    invertor_promise: {
        status: { type: Boolean, required: false, default: false }, // สถานะการเซ็นสัญญาดิจิตอล
        timestamp: { type: Date, required: false, default: dayjs(Date.now()).format() } // วันที่เซ็นสัญญาดิจิตอล
    },
});

InvertorSchema.method.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, name: this.invertor_name, phone: this.invertor_phone, row: "invertor" },
        process.env.JWTPRIVATEKEY,
        { expiresIn: "1h", }
    );
    return token;
};

const Invertors = mongoose.model("invertor", InvertorSchema);

const validate = (data) => {
    const schema = Joi.object({
        invertor_name: Joi.string().required().label("กรุณากรอกชื่อ"),
        invertor_phone: Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
        invertor_iden: Joi.string().required().label("กรุณากรอกเลขบัตรประจำตัว"),
        invertor_email: Joi.string().default(""),
        invertor_password: passwordComplexity(complexityOptions)
            .required()
            .label("กรุณากรอกพาสเวิร์ด"),
        invertor_address: Joi.string().required().label("กรุณากรอกที่อยู่"),
        invertor_subdistrict: Joi.string().required().label("กรุณากรอกตำบล"),
        invertor_district: Joi.string().required().label("กรุณากรอกอำเภอ"),
        invertor_provice: Joi.string().required().label("กรุณากรอกจังหวัด"),
        invertor_postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์"),
        invertor_date_start: Joi.date().raw().default(Date.now()),
        invertor_date_end: Joi.date().raw().default(Date.now()),
        invertor_status: Joi.boolean().default(true),
        invertor_promise: Joi.object({
            status: Joi.boolean().default(false),
            timestamp: Joi.date().default(dayjs(Date.now()).format())
        }),
    })
    return schema.validate(data);
};

module.exports = { Invertors, validate };