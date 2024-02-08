const mongoose = require("mongoose");
const Joi = require("joi");

const InvesmentShopsSchema = new mongoose.Schema({
  landlord_id: {type: String, required: true},
  landlord_name: {type: String, required: true},
  invoice: {type: String, required: true},
  invesment_type: {type: String, required: false},
  invesment_detail: {type: Array, default: []},
  address: {type: String, required: true},
  subdistrict: {type: String, required: true},
  district: {type: String, required: true},
  province: {type: String, required: true},
  postcode: {type: String, required: true},
  latitude: {type: Number, required: false, default: 0},
  longtitude: {type: Number, required: false, default: 0},
  employee: {type: String, required: false, default: "ไม่มี"}, //ชื่อเจ้าหน้าที่ ทำรายการยืนยัน กรณีเป็นการแจ้งเติมเงินแบบแนบสลิป
  remark: {type: String, required: false, default: ""},
  status: {
    type: [
      {
        status: {type: String, required: false},
        timestamp: {type: String, required: false},
      },
    ],
  },
  timestamp: {type: Date, required: true}, //วันที่ทำรายการ
});

const InvesmentShops = mongoose.model("invesment_shop", InvesmentShopsSchema);

const validate = (data) => {
  const schema = Joi.object({
    landlord_id: Joi.string().required().label("ไม่มี landlord_id"),
    landlord_name: Joi.string().required().label("ไม่มี landlord_name"),
    invoice: Joi.string(),
    invesment_type: Joi.string(),
    invesment_detail: Joi.array().default([]),
    address: Joi.string().required().label("กรุณากรอกที่อยู่ร้านด้วย"),
    subdistrict: Joi.string().required().label("กรุณากรอกตำบลด้วย"),
    district: Joi.string().required().label("กรุณากรอกอำเภอด้วย"),
    province: Joi.string().required().label("กรุณากรอกจังหวัดด้วย"),
    postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์ด้วย"),
    latitude: Joi.number().default(0),
    longtitude: Joi.number().default(0),
    employee: Joi.string().default("ไม่มี"),
    remark: Joi.string().default(""),
  });
  return schema.validate(data);
};

module.exports = {InvesmentShops, validate};
