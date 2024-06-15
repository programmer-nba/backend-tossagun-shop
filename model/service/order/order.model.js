const mongoose = require("mongoose");
const Joi = require("joi");

const OrderServiceSchema = new mongoose.Schema({
    invoice: { type: String, required: true },
    maker_id: { type: String, required: false, default: "" },
    shop_id: { type: String, required: false, default: "" },
    platform: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_tel: { type: String, required: true },
    customer_address: { type: String, required: true },
    customer_iden: { type: String, required: false, default: "" },
    customer_line: { type: String, required: true },
    product_detail: {
        type: [
            {
                packageid: { type: String, required: true },
                priceid: { type: String, required: false },
                packagename: { type: String, required: false },
                packagedetail: { type: String, required: false, default: "" },
                quantity: { type: Number, required: true },
                price: { type: Number, required: false, default: 0 },
                cost: { type: Number, required: false, default: 0 },
                freight: { type: Number, required: false, default: 0 },
                platform: { type: Number, required: false, default: 0 },
            },
        ],
    },
    shop_type: {
        type: String,
        enum: ["One Stop Shop", "One Stop Service", "One Stop Platform"],
        required: true,
    },
    paymenttype: {
        type: String,
        enum: ["เงินสด", "เงินโอน", "บัตรเครดิต", "อื่นๆ"],
        required: true,
    },
    servicename: { type: String, required: false },
    profit: { type: Number, required: false, default: 0 },
    profit_shop: { type: Number, required: false, default: 0 },
    cost: { type: Number, required: false, default: 0 },
    price: { type: Number, required: false, default: 0 },
    freight: { type: Number, required: false, default: 0 },
    net: { type: Number, required: false, default: 0 },
    totalplatform: { type: Number, required: false, default: 0 },
    discount: { type: Number, required: true },
    moneyreceive: { type: Number, required: true },
    change: { type: Number, required: true },
    transport: { type: String, required: false, default: "" },
    tracking: { type: String, required: false, default: "" },
    employee: { type: String, required: false, default: "ไม่มี" },
    status: { type: Array, required: false, default: [] },
    timestamp: { type: Date, required: false, default: Date.now() },
});

const OrderServiceModels = mongoose.model("order_service", OrderServiceSchema);

const validate = (data) => {
    const Schema = Joi.object({
        maker_id: Joi.string().default(""),
        shop_id: Joi.string().default(""),
        platform: Joi.string().required().label("โปรดกรอก Platform"),
        customer_name: Joi.string().required().label("โปรดกรอกชื่อลูกค้า"),
        customer_tel: Joi.string().required().label("โปรดกรอกเบอร์โทรลูกค้า"),
        customer_address: Joi.string().required().label("โปรดกรอกที่อยู่ลูกค้า"),
        customer_iden: Joi.string().required().label("โปรดกรอกรหัสบัตรประชาชนลูกค้า"),
        customer_line: Joi.string().required().label("โปรดกรอกไลน์ลูกค้า"),
        packageid: Joi.string().required().label("โปรดกรอกไอดีแพ็คเกจ"),
        quantity: Joi.number().required().label("โปรดกรอกจำนวนสินค้า"),
    });
    return Schema.validate(data);
};

module.exports = { OrderServiceModels, validate };
