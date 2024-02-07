const mongoose = require("mongoose");
const Joi = require("joi");

const InvesmentSchema = new mongoose.Schema({
  investor_id: {type: String, required: true},
  invoice: {type: String, required: true},
  amount: {type: Number, required: true},
  charge: {type: Number, required: false, default: 0},
  payment_type: {type: String, required: false},
  invesment_type: {type: String, required: false},
  referenceNo: {type: String, required: false, default: ""},
  detail: {type: Object, required: false, default: null},
  company: {type: String, required: false}, //
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

const Invesments = mongoose.model("invesment", InvesmentSchema);

const validate = (data) => {
  const schema = Joi.object({
    investor_id: Joi.string().required().label("ไม่มี investor_id"),
    invoice: Joi.string(),
    amount: Joi.number().required().label("ไม่มียอดการลงทุน"),
    charge: Joi.number().default(0),
    payment_type: Joi.string(),
    invesment_type: Joi.string(),
    referenceNo: Joi.string().default(""),
    detail: Joi.object().default(null),
    company: Joi.string(),
    employee: Joi.string().default("ไม่มี"),
    remark: Joi.string().default(""),
  });
  return schema.validate(data);
};

module.exports = {Invesments, validate};
