const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const complexityOptions = {
    min: 6,
    max: 30,
    lowerCase: 0,
    upperCase: 0,
    numeric: 0,
    symbol: 0,
    requirementCount: 2,
};

const MemberSchema = new mongoose.Schema({
    image: { type: String, required: false, default: "" },
    card_number: { type: String, required: false }, //รหัสสมาชิก
    prefix: { type: String, required: true }, //คำนำหน้า
    fristname: { type: String, required: true }, //ชื่อ
    lastname: { type: String, required: true }, //นามสกุล
    tel: { type: String, required: true }, //เบอร์โทร
    email: { type: String, required: false, default: "" }, //อีเมล
    password: { type: String, required: true }, //รหัสผ่าน
    address: { type: String, required: true }, //ที่อยู่
    subdistrict: { type: String, required: true }, //ที่อยู่ เเขวน ตำบล
    district: { type: String, required: true }, //เขต
    province: { type: String, required: true }, //จังหวัด
    postcode: { type: String, required: true }, //รหัสไปรษณีย์
    current_address: {
        address: { type: String, required: false, default: "-" }, //ที่อยู่
        subdistrict: { type: String, required: false, default: "-" }, //ที่อยู่ เเขวน ตำบล
        district: { type: String, required: false, default: "-" }, //อำเภอ
        province: { type: String, required: false, default: "-" }, //จังหวัด
        postcode: { type: String, required: false, default: "-" }, //รหัสไปรษณีย์
    },
    wallet: { type: Number, required: false, default: 0 }, //ยอดเงินในประเป๋าอิเล็กทรอนิกส์
    commission: { type: Number, required: false, default: 0 }, //ยอดรายได้สะสม
    // passcode: { type: Number, required: false, default: "" },
    pin: { type: String },
    allsale: { type: Number, required: false, default: 0 }, //ยอดสะสมการขาย
    happy_point: { type: Number, required: false, default: 0 },
    bank: {
        name: { type: String, required: false, default: "-" },
        number: { type: String, required: false, default: "-" },
        image: { type: String, required: false, default: "-" },
        status: { type: Boolean, required: false, default: false },
        remark: { type: String, required: false, default: "-" }, //อยู่ระหว่างการตรวจสอบ , ไม่ผ่านการตรวจสอบ ,ตรวจสอบสำเร็จ
    },
    iden: {
        number: { type: String, required: false, default: "-" },
        image: { type: String, required: false, default: "-" },
        status: { type: Boolean, required: false, default: false },
        remark: { type: String, required: false, default: "-" }, //อยู่ระหว่างการตรวจสอบ , ไม่ผ่านการตรวจสอบ ,ตรวจสอบสำเร็จ
    },
    upline: {
        lv1: { type: String, required: false, default: "-" },
        lv2: { type: String, required: false, default: "-" },
        lv3: { type: String, required: false, default: "-" },
    },
    heritage: {
        //มรดกตกทอด
        lv1: {
            name: { type: String, required: false, default: "-" },
            percent: { type: Number, required: false, default: 0 },
        },
        lv2: {
            name: { type: String, required: false, default: "-" },
            percent: { type: Number, required: false, default: 0 },
        },
        lv3: {
            name: { type: String, required: false, default: "-" },
            percent: { type: Number, required: false, default: 0 },
        },
    },
    timmestamp: { type: Date, required: false, default: Date.now() },
    status: { type: Boolean, required: false, default: true },
});
MemberSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, name: this.name, row: "member", tel: this.tel },
        process.env.JWTPRIVATEKEY,
        {
            expiresIn: "6h",
        }
    );
    return token;
};

const Members = mongoose.model("member", MemberSchema);

const validate = (data) => {
    const schema = Joi.object({
        ref_tel: Joi.string().required().label("กรุณากรอก รหัสผู้เชิญชวน"),
        prefix: Joi.string().required().label("กรุณากรอกชื่อ"),
        fristname: Joi.string().required().label("กรุณากรอกชื่อ"),
        lastname: Joi.string().required().label("กรุณากรอกนามสกุล"),
        tel: Joi.string().required().label("กรุณากรอกเบอร์โทร"),
        email: Joi.string().default(""),
        password: passwordComplexity(complexityOptions)
            .required()
            .label("ไม่มีข้อมูลรหัสผ่าน"),
        current_address: Joi.object({
            address: Joi.string().required().label("กรุณากรอกที่อยู่"),
            subdistrict: Joi.string()
                .required()
                .label("กรุณากรอกที่อยู่ เเขวน ตำบล"),
            district: Joi.string().required().label("กรุณากรอกเขต"),
            province: Joi.string().required().label("กรุณากรอกจังหวัด"),
            postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์"),
        }),
        address: Joi.string().required().label("กรุณากรอกที่อยู่"),
        subdistrict: Joi.string().required().label("กรุณากรอก ที่อยู่ เเขวน ตำบล"),
        district: Joi.string().required().label("กรุณากรอก เขต"),
        province: Joi.string().required().label("กรุณากรอก จังหวัด"),
        postcode: Joi.string().required().label("กรุณากรอก รหัสไปรษณีย์"),
    });
    return schema.validate(data);
};

module.exports = { Members, validate };
