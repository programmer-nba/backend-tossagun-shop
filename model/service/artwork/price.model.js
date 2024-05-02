const mongoose = require("mongoose");
const Joi = require("joi");

const PriceArtworkShema = new mongoose.Schema({
    product_id: { type: String, required: true },
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
    unit: { type: Number, required: true },
    unit_pack: { type: Number, required: true },
    emp: { type: String, required: false, default: "ไม่มี" },
});

const PriceArtworks = mongoose.model("artwork_price", PriceArtworkShema);

const validate = (data) => {
    const Schema = Joi.object({
        product_id: Joi.string().required().label("กรอกไอดี Product Artwork"),
        shop: Joi.object({
            profit_TG: Joi.number().required().label("โปรดกรอกกำไรบริษัท"),
            profit_shop: Joi.number().required().label("โปรดกรอกกำไรร้าน"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        service: Joi.object({
            profit_TG: Joi.number().required().label("โปรดกรอกกำไรบริษัท"),
            profit_shop: Joi.number().required().label("โปรดกรอกกำไรร้าน"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        platform: Joi.object({
            profit_TG: Joi.number().required().label("โปรดกรอกกำไรบริษัท"),
            profit_shop: Joi.number().required().label("โปรดกรอกกำไรร้าน"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        price: Joi.number().required().label("โปรดกรอกราคา"),
        cost: Joi.number().required().label("โปรดกรอกต้นทุน"),
        freight: Joi.number().default(0),
        profit: Joi.number().default(0),
        vat: Joi.number().default(0),
        net: Joi.number().default(0),
        unit: Joi.number().required().label("กรอกจำนวนที่ขาย"),
        unit_pack: Joi.number().required().label("กรอกจำนวนแพ็ค"),
        emp: Joi.string().default("ไม่มี"),
    })
    return Schema.validate(data);
}

module.exports = { PriceArtworks, validate };
