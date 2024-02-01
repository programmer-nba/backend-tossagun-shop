const router = require("express").Router();
const {Admins} = require("../model/user/admin.model");
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
      console.log("ไม่ใช่แอดมิน")
      // await checkPartners(req, res);
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

module.exports = router;
