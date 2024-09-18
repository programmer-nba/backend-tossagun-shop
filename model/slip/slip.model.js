const mongoose = require("mongoose");

const SlipSchema = new mongoose.Schema({
	status: { type: String, required: false },
	referenceNo: { type: String, required: false },
	transactionDateTime: { type: String, required: false },
	effectiveDate: { type: String, required: false },
	fromAccount: { type: String, required: false },
	fromAccountName: { type: String, required: false },
	fromBank: { type: String, required: false },
	fromBankName: { type: String, required: false },
	fromBankIconUrl: { type: String, required: false },
	toAnyIdType: { type: String, required: false },
	toAnyId: { type: String, required: false },
	toBillerName: { type: String, required: false },
	toBillericonUrl: { type: String, required: false },
	toAccount: { type: String, required: false },
	toAccountName: { type: String, required: false },
	receivingBank: { type: String, required: false },
	receivingBankName: { type: String, required: false },
	receivingBankIconUrl: { type: String, required: false },
	amount: { type: Number, required: false, default: 0 },
	currency: { type: String, required: false },
	ref1: { type: String, required: false },
	ref2: { type: String, required: false },
	ref3: { type: String, required: false },
});

const DataCheckSlip = mongoose.model("data_slip", SlipSchema);

module.exports = { DataCheckSlip };