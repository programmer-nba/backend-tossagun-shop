const mongoose = require("mongoose");
const Joi = require("joi");

const ShopSchema = new mongoose.Schema({
  shop_landlord_id: {type: String, required: true}, // เจ้าของที่ดิน
  shop_investor_id: {type: Array, required: true}, // คนลงทุน
  shop_number: {type: String, required: true},
  shop_logo: {type: String, required: false, default: ""}, // Logo
  shop_name: {type: String, required: true}, //ชื่อ
  shop_type: {
    type: String,
    enum: ["One Stop Shop", "One Stop Service"],
    required: true,
  },
  shop_credit: {type: Number, required: true},
  shop_address: {type: String, required: true}, //ที่อยู่
  shop_subdistrict: {type: String, required: true}, //ตำบล
  shop_district: {type: String, required: true}, //อำเภอ
  shop_province: {type: String, required: true}, //จังหวัด
  shop_postcode: {type: String, required: true}, //รหัสไปรษณีย์
  shop_latitude: {type: Number, required: false, default: 0},
  shop_longtitude: {type: Number, required: false, default: 0},
  shop_status: {type: Boolean, required: false, default: true},
  shop_status_tax: {type: String, required: false, default: "ไม่มี"},
  shop_tax_name: {type: String, required: false, default: "ไม่มี"},
  shop_tax_number: {type: String, required: false, default: "ไม่มี"},
  shop_tax_address: {type: String, required: false, default: "ไม่มี"},
  shop_tax_phone: {type: String, required: false, default: "ไม่มี"},
  shop_date_start: {type: Date, required: false, default: Date.now()}, // เริ่ม
});

const Shops = mongoose.model("shop", ShopSchema);

const validate = (data) => {
  const schema = Joi.object({
    shop_landlord_id: Joi.string().required().label("กรุณากรอกไอดีเจ้าของด้วย"),
    shop_investor_id: Joi.array().required().label("กรุณากรอกไอดีผู้ลงทุนด้วย"),
    shop_logo: Joi.string().default(""),
    shop_name: Joi.string().required().label("กรุณากรอกชื่อร้านด้วย"),
    shop_type: Joi.string().required().label("กรุณากรอกประเภทเจ้าของด้วย"),
    shop_credit: Joi.number().required().label("กรุณากรอกเครดิตเริ่มต้นด้วย"),
    shop_address: Joi.string().required().label("กรุณากรอกที่อยู่ร้านด้วย"),
    shop_subdistrict: Joi.string().required().label("กรุณากรอกตำบลด้วย"),
    shop_district: Joi.string().required().label("กรุณากรอกอำเภอด้วย"),
    shop_province: Joi.string().required().label("กรุณากรอกจังหวัดด้วย"),
    shop_postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์ด้วย"),
    shop_latitude: Joi.number().default(0),
    shop_longtitude: Joi.number().default(0),
    shop_status: Joi.boolean().default(true),
    shop_status_tax: Joi.string().default("ไม่มี"), // ลงทะเบียนพาณิย์, เป็นผู้เสียภาษี
    shop_tax_name: Joi.string().default("ไม่มี"), // ชื่อผู้ประกอบการ, ชื่อผู้ลงทะเบียนผู้เสียภาษี
    shop_tax_number: Joi.string().default("ไม่มี"), // เลขผู้เสียภาษี
    shop_tax_address: Joi.string().default("ไม่มี"), //
    shop_tax_phone: Joi.string().default("ไม่มี"),
    
    shop_vat_name: Joi.string().default("ไม่มี"), // ชื่อผู้เสีย
    shop_date_start: Joi.date().raw().default(Date.now()),
  });
  return schema.validate(data);
};

module.exports = {Shops, validate};
