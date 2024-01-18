const router = require("express").Router();
const {Admins} = require("../model/user/admin.model");
const {Partners} = require("../model/user/partner.model");
const {Employees} = require("../model/user/employee.model");
const {Shops} = require("../model/pos/shop.model");
const {LoginHistorys} = require("../model/login.history.model");
const auth = require("../lib/auth");
const bcrypt = require("bcrypt");
const Joi = require("joi");
require("dotenv").config();

const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().label("username"),
    password: Joi.string().required().label("password"),
  });
  return schema.validate(data);
};

router.post("/", async (req, res) => {
  try {
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    let admin = await Admins.findOne({
      admin_username: req.body.username,
    });
    if (!admin) {
      await checkPartners(req, res);
    } else {
      const validPasswordAdmin = await bcrypt.compare(
        req.body.password,
        admin.admin_password
      );
      if (!validPasswordAdmin)
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "password is not find",
          status: false,
        });
      const token = admin.generateAuthToken();
      const ResponesData = {
        name: admin.admin_name,
        username: admin.admin_username,
        position: admin.admin_position,
      };
      res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "admin",
        status: true,
      });
    }
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"});
  }
});

router.post("/history", auth, async (req, res) => {
  try {
    const login = await LoginHistorys.create(req.body);
    if (login) {
      return res.status(201).send({status: true, message: "เพิ่มข้อมูลสำเร็จ"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "เพิ่มข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
});

const checkPartners = async (req, res) => {
  console.log(req.body);
  try {
    let partner = await Partners.findOne({
      partner_iden: req.body.username,
    });
    if (!partner) {
      await checkEmployee(req, res);
    } else {
      const validPasswordPartner = await bcrypt.compare(
        req.body.password,
        partner.partner_password
      );
      if (!validPasswordPartner)
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "password is not find",
          status: false,
        });
      let isShop = await Shops.findOne({
        shop_partner_id: partner._id,
        shop_status: true,
      });
      if (!isShop) {
        return res.status(401).send({
          message: "ไม่มีสาขาที่ออนไลน์อยู่",
          status: false,
        });
      }
      const token = partner.generateAuthToken();
      const ResponesData = {
        name: partner.partner_name,
        username: partner.partner_iden,
        email: partner.partner_email,
        shop_id: isShop._id,
        shop_level_name: isShop.shop_level_name,
        shop_level_note: isShop.shop_level_note,
        shop_function: isShop.shop_function,
      };
      res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "partner",
        status: true,
      });
    }
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"});
  }
};

const checkEmployee = async (req, res) => {
  try {
    let employee = await Employees.findOne({
      employee_username: req.body.username,
    });
    if (!employee) {
      return res.status(401).send({
        message: "username is not find",
        status: false,
      });
    } else {
      let isShop = await Shop.findOne({
        _id: employee.employee_shop_id,
        shop_status: true,
      });
      if (!isShop) {
        return res.status(401).send({
          message: "ไม่มีสาขาที่ออนไลน์อยู่",
          status: false,
        });
      }
      const validPasswordAdmin = await bcrypt.compare(
        req.body.password,
        employee.employee_password
      );
      if (!validPasswordAdmin)
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "password is not find",
          status: false,
        });
      const token = employee.generateAuthToken();
      const ResponesData = {
        name: employee.employee_name,
        username: employee.employee_username,
        employee_status: employee.employee_status,
        shop_id: isShop._id,
        shop_level_name: isShop.shop_level_name,
        shop_level_note: isShop.shop_level_note,
        shop_function: isShop.shop_function,
      };
      res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "employee",
        position: employee.employee_position,
        status: true,
      });
    }
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"});
  }
};

module.exports = router;
