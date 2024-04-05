const mongoose = require("mongoose");
const Joi = require("joi");

const WalletSlipSchema = new mongoose.Schema({
    partner_id: { type: String, required: false, default: "" },
    invoice: { type: String, required: false, default: "" }, // เลขที่ทำรายการ
    amount: { type: Number, require: true }, // จำนวนเงิน
    detail: { type: String, required: false, default: "" },
    status: { type: Array, default: [] },
    timestamp: { type: Date, required: false, default: Date.now() }, // วันที่ทำรายการ
});

const WalletSlips = mongoose.model("wallet_slip", WalletSlipSchema);

module.exports = { WalletSlips };
