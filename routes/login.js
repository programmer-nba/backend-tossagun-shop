const router = require("express").Router();
const { Admins } = require("../model/user/admin.model");
const { LoginHistorys } = require("../model/login.history.model");
const { Employees } = require("../model/user/employee.model");
const { Shops } = require("../model/pos/shop.model");
const { Members } = require("../model/user/member.model");
const auth = require("../lib/auth");
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const Joi = require("joi");
require("dotenv").config();
const getmac = require("getmac");
const { default: axios } = require("axios");
const MACAddress = getmac.default();

const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().label("username"),
    password: Joi.string().required().label("password"),
    ip_address: Joi.string().required().label("ip_address"),
    // latitude: Joi.string().required().label("latitude"),
    // longitude: Joi.string().required().label("longitude"),
  });
  return schema.validate(data);
};

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });
    let admin = await Admins.findOne({
      admin_username: req.body.username,
    });
    if (!admin) {
      // console.log("ไม่ใช่แอดมิน")
      await checkMember(req, res);
    } else {
      const validPasswordAdmin = await bcrypt.compare(
        req.body.password,
        admin.admin_password
      );
      if (!validPasswordAdmin)
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "รหัสผ่านไม่ถูกต้อง",
          status: false,
        });
      const token = admin.generateAuthToken();
      const ResponesData = {
        name: admin.admin_name,
        username: admin.admin_username,
        position: admin.admin_position,
      };
      return res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "admin",
        status: true,
      });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

const checkMember = async (req, res) => {
  try {
    let member = await Members.findOne({
      tel: req.body.username,
    });
    if (!member) {
      // return res.status(401).send({
      // message: "ไม่พบข้อมูลผู้ใช้งาน",
      // status: false,
      // });
      await checkEmployee(req, res);
    } else {
      const validPasswordEmployee = await bcrypt.compare(
        req.body.password,
        member.password
      );
      if (!validPasswordEmployee)
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "รหัสผ่านไม่ถูกต้อง",
          status: false,
        });
      const token = member.generateAuthToken();
      const ResponesData = {
        name: member.fristname,
        username: member.tel,
        phone: member.tel,
        position: "One Stop Platform",
      };
      const login_history = {
        name: member.fristname,
        ref: member._id,
        ip_address: req.body.ip_address,
        // latitude: req.body.latitude,
        // longitude: req.body.longitude,
        timestamp: dayjs(Date.now()).format(),
      };
      await LoginHistorys.create(login_history);
      return res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "member",
        status: true,
      });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const checkEmployee = async (req, res) => {
  try {
    let employee = await Employees.findOne({
      employee_username: req.body.username,
    });
    if (!employee) {
      return res.status(401).send({
        message: "ไม่พบข้อมูลผู้ใช้งาน",
        status: false,
      });
    } else {
      const validPasswordEmployee = await bcrypt.compare(
        req.body.password,
        employee.employee_password
      );
      if (!validPasswordEmployee)
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "รหัสผ่านไม่ถูกต้อง",
          status: false,
        });
      let isShop = await Shops.findOne({
        _id: employee.employee_shop_id,
        shop_status: true,
      });
      if (!isShop)
        return res.status(401).send({
          message: "ไม่มีสาขาที่ออนไลน์อยู่",
          status: false,
        });
      const token = employee.generateAuthToken();
      const ResponesData = {
        name: employee.employee_firstname,
        username: employee.employee_username,
        phone: employee.employee_phone,
        position: isShop.shop_type,
        shop_id: isShop._id,
        shop_number: isShop.shop_number,
        status: employee.employee_status,
      };
      const login_history = {
        name: employee.employee_firstname,
        ref: employee._id,
        ip_address: req.body.ip_address,
        // latitude: req.body.latitude,
        // longitude: req.body.longitude,
        timestamp: dayjs(Date.now()).format(),
      };
      await LoginHistorys.create(login_history);
      return res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "employee",
        status: true,
      });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

router.get("/history", auth, async (req, res) => {
  try {
    let id;
    if (req.user.row === 'member') {
      id = req.user._id;
    } else if (req.user.row === 'employee') {
      id = req.user._id;
    }
    const pipeline = [
      {
        $match: { "ref": id },
      }
    ];
    const data = await LoginHistorys.aggregate(pipeline);
    if (data) {
      return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: data });
    } else {
      return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
});

module.exports = router;
