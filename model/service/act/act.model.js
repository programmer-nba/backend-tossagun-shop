const mongoose = require("mongoose");
const Joi = require("joi");

const ActSchema = new mongoose.Schema({
    image: { type: String, required: false, default: "" },
    name: { type: String, required: true },
    category: { type: String, required: true },
    code: { type: String, required: false, default: "" },
    detail: { type: String, required: false, default: "" },
    type: { type: String, enum: ['ส่วนบุคคล', 'ส่วนรับจ้าง'], required: true },
    shop: {
        profit_TG: { type: Number, required: true },
        profit_shop: { type: Number, required: true },
        platform: { type: Number, required: true },
    },
    service: {
        profit_TG: { type: Number, required: true },
        profit_shop: { type: Number, required: true },
        platform: { type: Number, required: true },
    },
    platform: {
        profit_TG: { type: Number, required: true },
        profit_shop: { type: Number, required: true },
        platform: { type: Number, required: true },
    },
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    freight: { type: Number, required: false, default: 0 },
    profit: { type: Number, required: false, default: 0 },
    vat: { type: Number, required: false, default: 0 },
    net: { type: Number, required: false, default: 0 },
    status: { type: Boolean, required: false, default: true },
    emp: { type: String, required: false, default: "" },
});

const ProductActs = mongoose.model("act_product", ActSchema);

const validate = (data) => {
    const Schema = Joi.object({
        image: Joi.string().default(""),
        name: Joi.string().required().label("โปรดกรอกชื่อแพ็คเกจ"),
        category: Joi.string().required().label("โปรดกรอกประเภท"),
        code: Joi.string().default(""),
        detail: Joi.string().default(""),
        type: Joi.string().required().label("โปรดกรอกประเภทของแพ็คเกจ"),
        shop: Joi.object({
            profit_TG: Joi.number().required().label("โปรดกรอกกำไรบริษัท"),
            profit_shop: Joi.number().required().label("โปรดกรอกกำไรร้านค้า"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        service: Joi.object({
            profit_TG: Joi.number().required().label("โปรดกรอกกำไรบริษัท"),
            profit_shop: Joi.number().required().label("โปรดกรอกกำไรร้านค้า"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        platform: Joi.object({
            profit_TG: Joi.number().required().label("โปรดกรอกกำไรบริษัท"),
            profit_shop: Joi.number().required().label("โปรดกรอกกำไรร้านค้า"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        price: Joi.number().required().label("โปรดกรอกราคา"),
        cost: Joi.number().required().label("โปรดกรอกต้นทุน"),
        freight: Joi.number().default(0),
        profit: Joi.number().default(0),
        vat: Joi.number().default(0),
        net: Joi.number().default(0),
        status: Joi.boolean().default(true),
        emp: Joi.string().default(""),
    })
    return Schema.validate(data);
}


module.exports = { ProductActs, validate };
