const mongoose = require("mongoose");

const PercentTopupShema = new mongoose.Schema({
	topup_id: { type: Number, required: false },
	topup_type: { type: String, required: false },
	topup_name: { type: String, required: false },
	percent: { type: Number, default: 0, required: false },
	profit_tg: { type: Number, default: 0, required: false },
	profit_shop: { type: Number, default: 0, required: false },
	platform: { type: Number, default: 0, required: false },
	employee: { type: String, required: false },
});

const PercentTopup = mongoose.model("percent_topup", PercentTopupShema);

module.exports = { PercentTopup };