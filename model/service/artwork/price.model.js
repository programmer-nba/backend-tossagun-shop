const mongoose = require("mongoose");
const Joi = require("joi");

const PriceArtworkShema = new mongoose.Schema({
    product_id: { type: String, required: true },
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    profit: { type: Number, required: true },
    freight: { type: Number, required: true },
    unit: { type: Number, required: true },
    unit_pack: { type: Number, required: true },
});

const PriceArtworks = mongoose.model("artwork_price", PriceArtworkShema);

const validate = (data) => {
    const Schema = Joi.object({
        product_id: Joi.string().required().label("กรอกไอดี Product Artwork"),
        price: Joi.number().required().label("โปรดกรอกราคา"),
        cost: Joi.number().required().label("โปรดกรอกต้นทุน"),
        profit: Joi.number().required().label("โปรดกรอกกำไร"),
        freight: Joi.number().required().label("กรอกค่าขนส่ง"),
        unit: Joi.number().required().label("กรอกจำนวนที่ขาย"),
        unit_pack: Joi.number().required().label("กรอกจำนวนแพ็ค"),
    })
    return Schema.validate(data);
}

module.exports = { PriceArtworks, validate };
