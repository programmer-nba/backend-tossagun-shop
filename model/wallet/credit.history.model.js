const mongoose = require("mongoose")
const Joi = require("joi")

const CreditSchema = new mongoose.Schema({
    // form: { type: String, required: false, default: "" },
    shop_id: { type: String, default: "", required: false },
    // maker_id: { type: String, default: "", required: false },
    // orderid: { type: String },
    // category: { type: String, enum: ['Wallet', 'Commission', 'Income'], required: false },
    name: { type: String, required: true },
    type: { type: String, enum: ['เครดิตเข้า', 'เครดิตออก'], required: true },
    // vat: { type: Number, required: false, default: 0 },
    // total: { type: Number, required: false, default: 0 },
    amount: { type: Number, required: true },
    before: { type: Number, required: true },
    after: { type: Number, required: true },
    timestamp: { type: Date, required: false, default: Date.now() }
}, { timestamps: true })

const CreditHistory = mongoose.model("credit_history", CreditSchema)

module.exports = { CreditHistory }