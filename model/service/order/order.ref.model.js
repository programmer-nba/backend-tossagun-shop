const mongoose = require("mongoose");
const Joi = require("joi");

const OrderActRefSchema = new mongoose.Schema({
	invoice: { type: String, required: true },
	iden: { type: String, required: false, default: "" },
	book: { type: String, required: false, default: "" },
	employee: { type: String, required: false, default: "ไม่มี" },
	status: { type: Array, required: false, default: [] },
	timestamp: { type: Date, required: false, default: Date.now() },
})

const OrderActRefModels = mongoose.model("order_act_ref", OrderActRefSchema);

module.exports = { OrderActRefModels };