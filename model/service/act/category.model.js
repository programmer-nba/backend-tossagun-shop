const mongoose = require('mongoose');
const Joi = require('joi');

const ActCategoruSchema = new mongoose.Schema({
    image: { type: String, required: false, default: "" },
    name: { type: String, required: true },
    emp: { type: String, required: false, default: "" },
})

const ActCategorys = mongoose.model("act_category", ActCategoruSchema)

const validate = (data) => {
    const Schema = Joi.object({
        image: Joi.string().default(""),
        name: Joi.string().required().label("โปรดกรอกชื่อ"),
        emp: Joi.string().default(""),
    })
    return Schema.validate(data);
}

module.exports = { ActCategorys, validate }