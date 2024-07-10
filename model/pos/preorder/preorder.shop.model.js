const mongoose = require("mongoose");
const Joi = require("joi");

const PreOrderShopSchema = new mongoose.Schema({
  poshop_invoice: { type: String, required: true },
  poshop_ref_full: { type: String, required: false, default: "ไม่มี" },
  poshop_shop_id: { type: String, required: true },
  poshop_detail: { type: Array, required: false, default: [] },
  poshop_platform: { type: String, required: true },
  poshop_paymenttype: {
    type: String,
    enum: ["เงินสด", "เงินโอน", "บัตรเครดิต", "อื่นๆ"],
    required: true,
  },
  poshop_cost: { type: Number, required: false, default: 0 },
  poshop_cost_tg: { type: Number, required: false, default: 0 },
  poshop_total: { type: Number, required: false, default: 0 },
  // poshop_total_price: { type: Number, required: true },
  poshop_total_platform: { type: Number, required: false, default: 0 },
  poshop_profit_tg: { type: Number, required: false, default: 0 },
  poshop_profit_shop: { type: Number, required: false, default: 0 },
  poshop_discount: { type: Number, required: true },
  poshop_moneyreceive: { type: Number, required: true },
  poshop_change: { type: Number, required: true },
  poshop_cutoff: { type: Boolean, required: false, default: false },
  poshop_timestamp: { type: Date, required: false, default: Date.now() },
  poshop_employee: { type: String, required: false, default: "ไม่มี" },
  poshop_status: { type: Array, required: false, default: [] },
  // poshop_ref_short_id: { type: String, required: false, default: "ไม่มี" }, // อ้างอิงกรณียกเลิกบิล
});

const PreOrderShop = mongoose.model("preorder_shop", PreOrderShopSchema);

const validate = (data) => {
  const schema = Joi.object({
    poshop_invoice: Joi.string().required().label("กรุณากรอกไอดีรายการด้วย"),
    poshop_ref_full: Joi.string().default("ไม่มี"),
    poshop_shop_id: Joi.string().required().label("กรุณากรอกไอดีร้านที่ทำรายการด้วย"),
    poshop_platform: Joi.string().required().label("กรุณากรอกเบอร์แพลตฟอร์ม"),
    poshop_total: Joi.number().required().label("ไม่พบยอดรวมใบเสร็จ"),
    poshop_cost: Joi.number().default(0),
    poshop_cost_tg: Joi.number().default(0),
    poshop_moneyreceive: Joi.number().default(0),
    poshop_change: Joi.number().default(0),
    poshop_paymenttype: Joi.string().required().label("ประเภทการชำระ"),
    poshop_detail: Joi.array().default([]),
    poshop_employee: Joi.string().required().label("ไม่พบพนักงานทำรายการ"),
    poshop_status: Joi.array().default([]),
  });
  return schema.validate(data);
};

module.exports = { PreOrderShop, validate };
