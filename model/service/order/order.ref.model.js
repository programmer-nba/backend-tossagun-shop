const mongoose = require("mongoose");
const Joi = require("joi");

const OrderServiceRefSchema = new mongoose.Schema({
	invoice: { type: String, required: true },
	detail: {
		type: [
			{
				name: { type: String, required: false, default: "" },
			}
		]
	},
	employee: { type: String, required: false, default: "ไม่มี" },
	status: { type: Array, required: false, default: [] },
	timestamp: { type: Date, required: false, default: Date.now() },
})

const OrderServiceRefModels = mongoose.model("order_service_ref", OrderServiceRefSchema);

module.exports = { OrderServiceRefModels };