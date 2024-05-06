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

const EmployeeSchema = new mongoose.Schema({
  employee_shop_id: { type: String, required: true },
  employee_prefix: { type: String, required: true }, //คำนำหน้า
  employee_firstname: { type: String, required: true }, //ชื่อ
  employee_lastname: { type: String, required: true }, //นามสกุล
  employee_username: { type: String, required: true }, //id
  employee_password: { type: String, required: true }, //รหัส
  employee_phone: { type: String, required: true },
  employee_email: { type: String, required: true },
  employee_position: { type: String, required: false, default: "general" },
  employee_status: { type: Boolean, required: false, default: true },
  employee_date_start: { type: Date, required: false, default: Date.now() }, // เริ่ม
});

EmployeeSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: `${this.employee_firstname} ${this.employee_lastname}`,
      shop_id: this.employee_shop_id,
      phone: this.employee_phone,
      row: "employee",
      status: this.employee_status,
    },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "1h",
    }
  );
  return token;
};

const Employees = mongoose.model("employee", EmployeeSchema);

const validate = (data) => {
  const schema = Joi.object({
    employee_shop_id: Joi.string().required().label("กรุณากรอกไอดี Shop ด้วย"),
    employee_prefix: Joi.string().required().label("กรุณากรอกคำนำหน้าชื่อ"),
    employee_firstname: Joi.string().required().label("กรุณากรอกชื่อผู้ใช้ด้วย"),
    employee_lastname: Joi.string().required().label("กรุณากรอกนามสกุลผู้ใช้ด้วย"),
    employee_username: Joi.string().required().label("กรุณากรอกไอดีผู้ใช้ด้วย"),
    employee_password: passwordComplexity(complexityOptions)
      .required()
      .label("กรุณากรอกรหัสผ่าน"),
    employee_phone: Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
    employee_email: Joi.string().required().label("กรุณากรอกที่อยู่อีเมล"),
    employee_position: Joi.string().default("กรุณากรอกระดับผู้ใช้งาน"),
    employee_status: Joi.boolean().default(true),
    employee_date_start: Joi.date().raw().default(Date.now()),
  });
  return schema.validate(data);
};

module.exports = { Employees, validate };
