const mongoose = require('mongoose');
const Joi = require('joi');

const MediaShema = new mongoose.Schema({
    image: { type: String, required: false, default: "" },
    name: { type: String, required: true },
    detail: { type: String, required: true },
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
    freight: { type: Number, required: false, default: 0 },
})

const ProductMedias = mongoose.model("media_product", MediaShema)

const validate = (data) => {
    const Schema = Joi.object({
        image: Joi.string().default(""),
        name: Joi.string().required().label("โปรดกรอกชื่อแพ็คเกจ"),
        detail: Joi.string().label("โปรดกรอกรายละเอียด"),
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
        freight: Joi.number().default(0),
    })
    return Schema.validate(data);
}

module.exports = { ProductMedias, validate }