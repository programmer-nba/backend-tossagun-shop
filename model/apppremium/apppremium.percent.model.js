const mongoose = require("mongoose");

const PercentApppremiumSchema = new mongoose.Schema({
	type: { type: String, required: false },
	name: { type: String, required: false },
	percent: { type: Number, default: 0, required: false },
	profit_tg: { type: Number, default: 0, required: false },
	profit_shop: { type: Number, default: 0, required: false },
	platform: { type: Number, default: 0, required: false },
	employee: { type: String, required: false },
});

const PercentApppremium = mongoose.model("percent_apppremium", PercentApppremiumSchema);

module.exports = { PercentApppremium };