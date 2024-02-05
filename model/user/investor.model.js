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

const InvestorSchema = new mongoose.Schema({
  investor_name: {type: String, required: true}, // ชื่อ - นามสกุล
  investor_phone: {type: String, required: true}, // เบอร์โทรศัพท์
  investor_iden: {type: String, required: true}, // เลขบัตรประจำตัวประชาชน
  investor_email: {type: String, required: false}, // อีเมล
  investor_password: {type: String, required: true}, // รหัสผ่าน
  investor_address: {type: String, required: true}, // ที่อยู่
  investor_subdistrict: {type: String, required: true}, // ตำบล
  investor_district: {type: String, required: true}, // อำเภอ
  investor_province: {type: String, required: true}, // จังหวัด
  investor_postcode: {type: String, required: true}, // รหัสไปรษณีย์
  investor_credit: {type: Number, required: false, default: 0},
  // investor_date_start: {type: Date, require: false, default: Date.now()}, // วันที่เริ่มสัญญา
  // investor_date_end: {type: Date, required: false, default: Date.now()}, // วันที่หมดสัญญา
  invertor_timestamp: {type: Date, required: false, default: Date.now()}, //
  investor_status: {type: Boolean, required: false, default: false}, // สถานะการเปิดให้ใช้งาน
  investor_promise: {
    type: [
      {
        status: {type: String, required: false},
        timestamp: {type: String, required: false},
      },
    ],
  },
  investor_status_type: {
    type: [
      {
        status: {type: String, required: false},
        timestamp: {type: String, required: false},
      },
    ],
  },
  investor_emp: {type: String, required: false, default: "ไม่มี"},
});

InvestorSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.investor_name,
      phone: this.investor_phone,
      row: "investor",
    },
    process.env.JWTPRIVATEKEY,
    {expiresIn: "1h"}
  );
  return token;
};

const Investors = mongoose.model("investor", InvestorSchema);

const validate = (data) => {
  const schema = Joi.object({
    investor_name: Joi.string().required().label("กรุณากรอกชื่อ"),
    investor_phone: Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
    investor_iden: Joi.string().required().label("กรุณากรอกเลขบัตรประจำตัว"),
    investor_email: Joi.string().default(""),
    investor_password: passwordComplexity(complexityOptions)
      .required()
      .label("กรุณากรอกพาสเวิร์ด"),
    investor_address: Joi.string().required().label("กรุณากรอกที่อยู่"),
    investor_subdistrict: Joi.string().required().label("กรุณากรอกตำบล"),
    investor_district: Joi.string().required().label("กรุณากรอกอำเภอ"),
    investor_province: Joi.string().required().label("กรุณากรอกจังหวัด"),
    investor_postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์"),
    investor_credit: Joi.number().default(0),
    // investor_date_start: Joi.date().raw().default(Date.now()),
    // investor_date_end: Joi.date().raw().default(Date.now()),
    investor_timestamp: Joi.date().raw().default(Date.now()),
    investor_status: Joi.boolean().default(false),
    investor_emp: Joi.string().default("ไม่มี"),
  });
  return schema.validate(data);
};

module.exports = {Investors, validate};
