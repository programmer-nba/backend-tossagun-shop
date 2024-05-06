const mongoose = require("mongoose")

const CategoryAccountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: false },
    emp: { type: String, required: false, default: "" },
});

const CategoryAccounts = mongoose.model("account_category", CategoryAccountSchema);

module.exports = { CategoryAccounts }