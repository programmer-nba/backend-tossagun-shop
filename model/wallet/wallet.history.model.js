const mongoose = require("mongoose")
const Joi = require("joi")

const wallethistory = new mongoose.Schema({
    shop_id: { type: String, default:"", required: false },
    maker_id: { type: String, default:"", required: false, },
    orderid: { type: String },
    name: { type: String, required: true },
    type: { type: String, enum: ['เงินเข้า', 'เงินออก'], required: true },
    amount: { type: Number, required: true },
    before: { type: Number, required: true },
    after: { type: Number, required: true },
    timestamp: { type: Date, required: false, default: Date.now() }
}, { timestamps: true })

const WalletHistory = mongoose.model("wallet_history", wallethistory)

module.exports = { WalletHistory }