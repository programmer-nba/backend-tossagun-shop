const mongoose = require("mongoose");
const Joi = require("joi");

const PriceArtworkShema = new mongoose.Schema({
    product_id: { type: String, required: true },
    shop: {
        profit: { type: Number, required: true },
        platform: { type: Number, required: true },
    },
    service: {
        profit: { type: Number, required: true },
        platform: { type: Number, required: true },
    },
    platform: {
        profit: { type: Number, required: true },
        platform: { type: Number, required: true },
    },
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    freight: { type: Number, required: true },
    unit: { type: Number, required: true },
    unit_pack: { type: Number, required: true },
});

const PriceArtworks = mongoose.model("artwork_price", PriceArtworkShema);

const validate = (data) => {
    const Schema = Joi.object({
        product_id: Joi.string().required().label("กรอกไอดี Product Artwork"),
        shop: Joi.object({
            profit: Joi.number().required().label("โปรดกรอกกำไร"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        service: Joi.object({
            profit: Joi.number().required().label("โปรดกรอกกำไร"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        platform: Joi.object({
            profit: Joi.number().required().label("โปรดกรอกกำไร"),
            platform: Joi.number().required().label("โปรดก่อนส่วนแบ่งแพลตฟอร์ม"),
        }),
        price: Joi.number().required().label("โปรดกรอกราคา"),
        cost: Joi.number().required().label("โปรดกรอกต้นทุน"),
        freight: Joi.number().required().label("กรอกค่าขนส่ง"),
        unit: Joi.number().required().label("กรอกจำนวนที่ขาย"),
        unit_pack: Joi.number().required().label("กรอกจำนวนแพ็ค"),
    })
    return Schema.validate(data);
}

module.exports = { PriceArtworks, validate };
