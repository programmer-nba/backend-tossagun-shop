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

const LandlordSchema = new mongoose.Schema({
  landlord_name: {type: String, required: true}, // ชื่อ - นามสกุล
  landlord_phone: {type: String, required: true}, // เบอร์โทรศัพท์
  landlord_iden: {type: String, required: true}, // เลขบัตรประจำตัวประชาชน
  landlord_email: {type: String, required: false, default: "ไม่มี"}, // อีเมล
  landlord_username: {type: String, required: true}, // ไอดีเข้าใช้ระบบ
  landlord_password: {type: String, required: true}, // รหัสผ่าน
  landlord_address: {type: String, required: true}, // ที่อยู่
  landlord_subdistrict: {type: String, required: true}, // ตำบล
  landlord_district: {type: String, required: true}, // อำเภอ
  landlord_province: {type: String, required: true}, // จังหวัด
  landlord_postcode: {type: String, required: true}, // รหัสไปรษณีย์
  // landlord_date_start: {type: Date, require: false, default: Date.now()}, // วันที่เริ่มสัญญา
  // landlord_date_end: {type: Date, required: false, default: Date.now()}, // วันที่หมดสัญญา
  landlord_timestamp: {type: Date, required: false, default: Date.now()},
  landlord_status: {type: Boolean, required: false, default: false}, // สถานะการเปิดให้ใช้งาน
  landlord_promise: {
    type: [
      {
        status: {type: String, required: false},
        timestamp: {type: String, required: false},
      },
    ],
  },
  landlord_status_type: {
    type: [
      {
        status: {type: String, required: false},
        timestamp: {type: String, required: false},
      },
    ],
  },
  landlord_emp: {type: String, required: false, default: "ไม่มี"},
});

LandlordSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.landlord_name,
      phone: this.landlord_phone,
      row: "landlord",
      status: this.landlord_status,
    },
    process.env.JWTPRIVATEKEY,
    {expiresIn: "1h"}
  );
  return token;
};

const Landlords = mongoose.model("landlord", LandlordSchema);

const validate = (data) => {
  const schema = Joi.object({
    landlord_name: Joi.string().required().label("กรุณากรอกชื่อ"),
    landlord_phone: Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
    landlord_iden: Joi.string().required().label("กรุณากรอกเลขบัตรประจำตัว"),
    landlord_email: Joi.string().default("ไม่มี"),
    landlord_username: Joi.string().required().label("กรุณากรอกไอดีผู้ใช้งาน"),
    landlord_password: passwordComplexity(complexityOptions)
      .required()
      .label("กรุณากรอกพาสเวิร์ด"),
    landlord_address: Joi.string().required().label("กรุณากรอกที่อยู่"),
    landlord_subdistrict: Joi.string().required().label("กรุณากรอกตำบล"),
    landlord_district: Joi.string().required().label("กรุณากรอกอำเภอ"),
    landlord_province: Joi.string().required().label("กรุณากรอกจังหวัด"),
    landlord_postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์"),
    // landlord_date_start: Joi.date().raw().default(Date.now()),
    // landlord_date_end: Joi.date().raw().default(Date.now()),
    landlord_timestamp: Joi.date().raw().default(Date.now()),
    landlord_status: Joi.boolean().default(false),
    landlord_emp: Joi.string().default("ไม่มี"),
  });
  return schema.validate(data);
};

module.exports = {Landlords, validate};
