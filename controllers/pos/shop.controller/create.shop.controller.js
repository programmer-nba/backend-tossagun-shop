const { Shops, validate } = require("../../../model/pos/shop.model");
const {
  InvesmentMoneys,
} = require("../../../model/invesment/invesment.money.model");
const {
  InvesmentShops,
} = require("../../../model/invesment/invesment.shop.model");
const dayjs = require("dayjs");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-");
    // console.log(file.originalname);
  },
});

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.bpdy);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const data = {
      ...req.body,
    };
    const updateInvesmentShop = await InvesmentShops.findOne({
      landlord_id: req.body.shop_landlord_id,
    });
    updateInvesmentShop.status.push({
      status: "รายการสำเร็จ",
      timestamp: dayjs(Date.now()).format(""),
    });
    updateInvesmentShop.save();
    for (let item of req.body.shop_investor) {
      const updateInvesmentMoney = await InvesmentMoneys.findOne({
        investor_id: item.invester_id,
      });
      updateInvesmentMoney.status.push({
        status: "รายการสำเร็จ",
        timestamp: dayjs(Date.now()).format(""),
      });
      updateInvesmentMoney.save();
    }
    const new_shop = await Shops.create(data);
    return res.status(201).send({
      message: "สร้างช็อปใหม่เรียบร้อย",
      status: true,
      data: new_shop,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Internal Server Error", status: false });
  }
};
