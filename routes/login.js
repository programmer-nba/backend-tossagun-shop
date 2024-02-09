const router = require("express").Router();
const {Admins} = require("../model/user/admin.model");
const {Investors} = require("../model/user/investor.model");
const {Landlords} = require("../model/user/landlord.model");
const {LoginHistorys} = require("../model/login.history.model");
const {Shops} = require("../model/pos/shop.model");
const auth = require("../lib/auth");
const bcrypt = require("bcrypt");
const Joi = require("joi");
require("dotenv").config();
const getmac = require("getmac");
const MACAddress = getmac.default();

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
      // console.log("ไม่ใช่แอดมิน")
      await checkInvestor(req, res);
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
      return res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "admin",
        status: true,
      });
    }
  } catch (error) {
    return res.status(500).send({message: "Internal Server Error"});
  }
});

const checkInvestor = async (req, res) => {
  try {
    let investor = await Investors.findOne({
      investor_username: req.body.username,
    });
    if (!investor) {
      await checkLandLord(req, res);
    } else {
      const validPasswordPartner = await bcrypt.compare(
        req.body.password,
        investor.investor_password
      );
      if (!validPasswordPartner)
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "password is not find",
          status: false,
        });
      // let isShop = await Shops.findOne({
      //   shop_investor: investor._id,
      //   shop_status: true,
      // });
      // if (!isShop)
      //   return res.status(401).send({
      //     message: "ไม่มีสาขาที่ออนไลน์อยู่",
      //     status: false,
      //   });
      const token = investor.generateAuthToken();
      const ResponesData = {
        name: investor.investor_name,
        username: investor.investor_iden,
        phone: investor.investor_phone,
        // shop_id: isShop._id,
        // shop_number: isShop.shop_number,
      };
      return res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "investor",
        status: true,
      });
    }
  } catch (error) {
    return res.status(500).send({message: "Internal Server Error"});
  }
};

const checkLandLord = async (req, res) => {
  try {
    let landlord = await Landlords.findOne({
      landlord_username: req.body.username,
    });
    if (!landlord) {
      return res.status(401).send({
        message: "username is not find",
        status: false,
      });
    } else {
      const validPasswordPartner = await bcrypt.compare(
        req.body.password,
        landlord.landlord_password
      );
      if (!validPasswordPartner)
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "password is not find",
          status: false,
        });
      // let isShop = await Shops.findOne({
      //   shop_landlord_id: landlord._id,
      //   shop_status: true,
      // });
      // if (!isShop)
      //   return res.status(401).send({
      //     message: "ไม่มีสาขาที่ออนไลน์อยู่",
      //     status: false,
      //   });
      const token = landlord.generateAuthToken();
      const ResponesData = {
        name: landlord.landlord_name,
        username: landlord.landlord_iden,
        phone: landlord.landlord_phone,
        // shop_id: isShop._id,
        // shop_number: isShop.shop_number,
      };
      return res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "landlord",
        status: true,
      });
    }
  } catch (error) {
    return res.status(500).send({message: "Internal Server Error"});
  }
};

router.post("/history", auth, async (req, res) => {
  try {
    const login = await LoginHistorys.create({
      ...req.body,
      mac_address: MACAddress,
    });
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
