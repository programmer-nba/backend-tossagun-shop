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

const OutlaySchema = new mongoose.Schema({
    outlay_name: { type: String, required: true }, // ชื่อ - นามสกุล
    outlay_phone: { type: String, required: true }, // เบอร์โทรศัพท์
    outlay_iden: { type: String, required: true }, // เลขบัตรประจำตัวประชาชน
    outlay_email: { type: String, required: false, default: "ไม่มี" }, // อีเมล
    outlay_username: { type: String, required: true }, // ไอดีเข้าใช้ระบบ
    outlay_password: { type: String, required: true }, // รหัสผ่าน
    outlay_address: { type: String, required: true }, // ที่อยู่
    outlay_subdistrict: { type: String, required: true }, // ตำบล
    outlay_district: { type: String, required: true }, // อำเภอ
    outlay_province: { type: String, required: true }, // จังหวัด
    outlay_postcode: { type: String, required: true }, // รหัสไปรษณีย์
    outlay_credit: { type: Number, required: false, default: 0 },
    outlay_timestamp: { type: Date, required: false, default: Date.now() }, //
    outlay_status: { type: Boolean, required: false, default: false }, // สถานะการเปิดให้ใช้งาน
    outlay_promise: {
        type: [
            {
                status: { type: String, required: false },
                timestamp: { type: String, required: false },
            },
        ],
    },
    outlay_status_type: {
        type: [
            {
                status: { type: String, required: false },
                timestamp: { type: String, required: false },
            },
        ],
    },
    outlay_emp: { type: String, required: false, default: "ไม่มี" },
});

OutlaySchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            name: this.outlay_name,
            phone: this.outlay_phone,
            row: "outlay",
            status: this.outlay_status,
        },
        process.env.JWTPRIVATEKEY,
        { expiresIn: "1h" }
    );
    return token;
};

const Outlays = mongoose.model("outlay", OutlaySchema);

const validate = (data) => {
    const schema = Joi.object({
        outlay_name: Joi.string().required().label("กรุณากรอกชื่อ"),
        outlay_phone: Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
        outlay_iden: Joi.string().required().label("กรุณากรอกเลขบัตรประจำตัว"),
        outlay_email: Joi.string().default("ไม่มี"),
        outlay_username: Joi.string().required().label("กรุณากรอกไอดีผู้ใช้งาน"),
        outlay_password: passwordComplexity(complexityOptions)
            .required()
            .label("กรุณากรอกพาสเวิร์ด"),
        outlay_address: Joi.string().required().label("กรุณากรอกที่อยู่"),
        outlay_subdistrict: Joi.string().required().label("กรุณากรอกตำบล"),
        outlay_district: Joi.string().required().label("กรุณากรอกอำเภอ"),
        outlay_province: Joi.string().required().label("กรุณากรอกจังหวัด"),
        outlay_postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์"),
        outlay_credit: Joi.number().default(0),
        // investor_date_start: Joi.date().raw().default(Date.now()),
        // investor_date_end: Joi.date().raw().default(Date.now()),
        outlay_timestamp: Joi.date().raw().default(Date.now()),
        outlay_status: Joi.boolean().default(false),
        outlay_emp: Joi.string().default("ไม่มี"),
    });
    return schema.validate(data);
};

module.exports = { Outlays, validate };