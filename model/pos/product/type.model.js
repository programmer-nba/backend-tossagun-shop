const mongoose = require("mongoose");
const Joi = require("joi");

const TypeSchema = new mongoose.Schema({
	name: { type: String, required: true },
});

const Types = mongoose.model("type", TypeSchema);

const validate = (data) => {
	const schema = Joi.object({
		name: Joi.string().required().label("กรุณากรอกชื่อประเภทย่อย"),
	});
	return schema.validate(data);
};

module.exports = { Types, validate };
