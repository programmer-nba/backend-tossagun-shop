const mongoose = require("mongoose");
const Joi = require("joi");

const OrderExpressSchema = new mongoose.Schema({
    shop_id: { type: String, required: true },
    platform: { type: String, required: false, default: '' },
    invoice: { type: String, required: false, default: "ไม่มี" },
    invoice_full: { type: String, default: "ไม่มี" },
    type: {
        type: String,
        enum: ["Express", "Drop Off"],
        required: false, default: "Express",
    },
    total: { type: Number, required: false },
    total_cost: { type: Number, required: false, default: 0 },
    total_cost_tg: { type: Number, required: false, default: 0 },
    total_platform: { type: Number, required: false, default: 0 },
    total_cod: { type: Number, required: false, default: 0 },
    total_cod_charge: { type: Number, required: false, default: 0 },
    total_cod_vat: { type: Number, required: false, default: 0 },
    total_box: { type: Number, required: false, default: 0 },
    moneyreceive: { type: Number, required: false, default: 0 },
    change: { type: Number, required: false, default: 0 },
    discount: { type: Number, required: false, default: 0 },
    payment_type: { type: String, required: false, default: "เงินสด" },
    purchase_id: { type: String, required: true, default: "ไม่มี" },
    product: { type: Array, required: false, default: [] },
    employee: { type: String, required: false, default: "ไม่มี" },
    status: { type: Array, required: false, default: [] },
    timestamp: { type: String, required: true },
})

const OrderExpress = mongoose.model("order_express", OrderExpressSchema);

const validate = (data) => {
    const schema = Joi.object({
        shop_id: Joi.string().required().label("ไม่พบ shop_id"),
        platform: Joi.string().default(''),
        invoice: Joi.string().default("ไม่มี"),
        invoice_full: Joi.string().default("ไม่มี"),
        total: Joi.number().required().label("ไม่พบยอดรวมใบเสร็จ"),
        total_cost: Joi.number().default(0),
        total_cost_tg: Joi.number().default(0),
        moneyreceive: Joi.number().default(0),
        change: Joi.number().default(0),
        payment_type: Joi.string().required().label("ประเภทการชำระ"),
        purchase_id: Joi.string().default("ไม่มี"),
        product: Joi.array(),
        employee: Joi.string().required().label("ไม่พบพนักงานทำรายการ"),
        status: Joi.array(),
        timestamp: Joi.string(),
    });
    return schema.validate(data);
}

module.exports = { OrderExpress, validate };