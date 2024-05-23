const mongoose = require("mongoose");
const Joi = require("joi");

const TopupWalletSchema = new mongoose.Schema({
    maker_id: { type: String, required: false, default: "" },
    shop_id: { type: String, required: false, default: "" },
    invoice: { type: String, required: false }, // เลขที่ทำรายการ
    transaction: { type: String, required: false, default: "" },
    amount: { type: Number, require: true }, // จำนวนเงิน
    charge: { type: Number, required: false, default: 0 }, // ค่าธรรมเนียม
    payment_type: {
        type: String,
        enum: ["One Stop Shop", "One Stop Service", "One Stop Platform"],
        required: true,
    },
    detail: { type: String, required: false, default: "" },
    status: { type: String, required: false, default: 'รอตรวจสอบ' },
    employee: { type: String, required: false, default: 'ไม่มี' }, //ชื่อเจ้าหน้าที่ ทำรายการยืนยัน กรณีเป็นการแจ้งเติมเงินแบบแนบสลิป
    remark: { type: String, required: false, default: '' },
    timestamp: { type: Date, required: false, default: Date.now() }, // วันที่ทำรายการ
});

const TopupWallet = mongoose.model("topup_wallet", TopupWalletSchema);

const validate = (data) => {
    const schema = Joi.object({
        maker_id: Joi.string().default(""),
        shop_id: Joi.string().default(""),
        invoice: Joi.string(),
        amount: Joi.number().required().label('ไม่มียอดเติมเงิน'),
        charge: Joi.number().default(0),
        payment_type: Joi.string(),
        detail: Joi.string().default(""),
        employee: Joi.string().default('ไม่มี'),
        status: Joi.string().label('รอตรวจสอบ'),
        remark: Joi.string().default(''),
    });
    return schema.validate(data);
}

module.exports = { TopupWallet, validate };
