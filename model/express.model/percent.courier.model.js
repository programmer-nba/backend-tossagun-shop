// const mongoose = require("mongoose");
// const Joi = require("joi");

// const PriceCourierSchema = new mongoose.Schema({
//     courier_code: { type: String, required: true },
//     percent_tg: { type: Number, required: true },
//     percent_shop: { type: Number, required: true },
//     employee: { type: String, required: false, default: "" },
// })

// const PriceCourier = mongoose.model("percent_courier", PriceCourierSchema);

// const validate = (data) => {
//     const schema = Joi.object({
//         courier_code: Joi.string().required().label("กรุณากรอกรหัสขนส่ง"),
//         percent_tg: Joi.number().required().label("กรุณากรอกกำไรของบริษัท"),
//         percent_shop: Joi.number().required().label("กรุณากรอกกำไรของร้านค้า"),
//         employee: Joi.string().default(""),
//     });
//     return schema.validate(data);
// }

// module.exports = { PriceCourier, validate };