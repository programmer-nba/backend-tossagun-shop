const mongoose = require("mongoose");
const Joi = require("joi");

const OrderServiceSchema = new mongoose.Schema({
    receiptnumber: { type: String, required: true },
    shop_id: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_tel: { type: String, required: true },
    customer_address: { type: String, required: true },
    customer_iden: { type: String, required: false, default: "" },
    customer_line: { type: String, required: true },
    product_detail: {
        type: [
            {
                packageid: { type: String, required: true },
                packagename: { type: String, required: true },
                packagedetail: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                cost: { type: Number, required: true },
                freight: { type: Number, required: true },
            },
        ],
    },
    shop_type: {
        type: String,
        enum: ["One Stop Shop", "One Stop Service"],
        required: true,
    },
    paymenttype: {
        type: String,
        enum: ["เงินสด", "เงินโอน", "บัตรเครดิต", "อื่นๆ"],
        required: true,
    },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    freight: { type: Number, required: true },
    moneyreceive: { type: Number, required: true },
    change: { type: Number, required: true },
    employee: { type: String, required: false, default: "" },
    status: { type: Array, required: true },
    timestamp: { type: Date, required: false, default: Date.now() },
});

const OrderServiceModels = mongoose.model("orderservice", OrderServiceSchema);

const validate = (data) => {
    const Schema = Joi.object({
        shop_id: Joi.string().required().allow("").label("โปรดกรอก id ร้านค้า"),
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