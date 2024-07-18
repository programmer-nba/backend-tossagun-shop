const mongoose = require("mongoose");
const Joi = require("joi");

const PercentInvestSchema = new mongoose.Schema({
	invest: { type: Number, required: true },
	shop: { type: Number, required: true },
	tg: { type: Number, required: true },
	code: { type: String, required: true },
	employee: { type: String, required: false, default: "ไม่มี" },
});

const PercentInvests = mongoose.model("percent_invest", PercentInvestSchema);

const validate = (data) => {
	const schema = Joi.object({
		invest: Joi.number().required(),
		shop: Joi.number().required(),
		tg: Joi.number().required(),
		code: Joi.string().required(),
		employee: Joi.string().default("ไม่มี"),
	});
	return schema.validate(data);
}

module.exports = { PercentInvests, validate };