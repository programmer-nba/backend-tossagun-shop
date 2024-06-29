const mongoose = require("mongoose");
const Joi = require("joi");

const PreOrderTossagunSchema = new mongoose.Schema({
  ponba_shop_id: {type: String, required: true}, // Partner
  ponba_number: {type: String, required: true}, //
  ponba_detail: {type: Array, required: false, default: []},
  ponba_total: {type: Number, required: true},
  ponba_status: {type: String, required: false, default: "รอตรวจสอบ"},
  ponba_date: {type: Date, required: false, default: Date.now()},
  ponba_timestamp: {type: Array, required: false, default: []},
  ponba_emp: {type: String, required: false, default: "ไม่มี"},
});

const PreOrderTossaguns = mongoose.model(
  "preorder_tossagun",
  PreOrderTossagunSchema
);

const validate = (data) => {
  const schema = Joi.object({
    ponba_shop_id: Joi.string()
      .required()
      .label("กรุณากรอกไอดีผู้ทำรายการด้วย"),
    ponba_number: Joi.string().required().label("กรุณากรอกเลขที่ใบ PO ด้วย"),
    ponba_detail: Joi.array().default([]),
    ponba_total: Joi.number().required().label("กรุณากรอกยอดคำสั่งซื้อด้วย"),
    ponba_status: Joi.string().default("รอตรวจสอบ"),
    ponba_timestamp: Joi.array().default([]),
    ponba_date: Joi.date().raw().default(Date.now()),
    ponba_emp: Joi.string().default("ไม่มี"),
  });
  return schema.validate(data);
};

module.exports = {PreOrderTossaguns, validate};
