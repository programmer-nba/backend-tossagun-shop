const mongoose = require("mongoose");
const Joi = require("joi");

const LandSchema = new mongoose.Schema({
  land_number: {type: String, required: true},
  land_landlord_id: {type: String, required: true},
  land_image: {type: Array, required: false, default: []},
  land_latitude: {type: Number, required: false, default: 0},
  land_longtitude: {type: Number, required: false, default: 0},
  land_status: {type: Boolean, required: false, default: false},
});

const Lands = mongoose.model("land", LandSchema);

const validateLand = (data) => {
  const schema = Joi.object({
    land_number: Joi.string().required().label("กรุณากรอกรหัสที่ดินด้วย"),
    land_landlord_id: Joi.string().required().label("กรุณากรอกไอดีเจ้าของด้วย"),
    land_image: Joi.array().default([]),
    land_latitude: Joi.number().default(0),
    land_longtitude: Joi.number().default(0),
    land_status: Joi.boolean().default(false),
  });
  return schema.validate(data);
};

module.exports = {Lands, validateLand};
