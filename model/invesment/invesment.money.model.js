const mongoose = require("mongoose");
const Joi = require("joi");

const InvesmentMoneySchema = new mongoose.Schema({
  investor_id: { type: String, required: true },
  investor_name: { type: String, required: true },
  invoice: { type: String, required: true },
  amount: { type: Number, required: true },
  invesment_type: { type: String, required: false },
  slip_img: { type: String, required: false },
  employee: { type: String, required: false, default: "ไม่มี" }, //ชื่อเจ้าหน้าที่ ทำรายการยืนยัน กรณีเป็นการแจ้งเติมเงินแบบแนบสลิป
  remark: { type: String, required: false, default: "" },
  status: {
    type: [
      {
        status: { type: String, required: false },
        timestamp: { type: String, required: false },
      },
    ],
  },
  timestamp: { type: Date, required: true }, //วันที่ทำรายการ
});

const InvesmentMoneys = mongoose.model("invesment_money", InvesmentMoneySchema);

const validate = (data) => {
  const schema = Joi.object({
    investor_id: Joi.string().required().label("ไม่มี investor_id"),
    investor_name: Joi.string().required().label("ไม่มี investor_name"),
    invoice: Joi.string(),
    amount: Joi.number().required().label("ไม่มียอดการลงทุน"),
    invesment_type: Joi.string(),
    slip_img: Joi.string(),
    employee: Joi.string().default("ไม่มี"),
    remark: Joi.string().default(""),
  });
  return schema.validate(data);
};

module.exports = { InvesmentMoneys, validate };
