const { Shops, validate } = require("../../../model/pos/shop.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Invests } = require("../../../model/pos/invest.model");
const dayjs = require("dayjs");
const { WalletHistory } = require("../../../model/wallet/wallet.history.model");

const uploadFolder = path.join(__dirname, '../../../assets/shop');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

module.exports.create = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("shop_logo");
    upload(req, res, async function (err) {
      console.log(req.file)
      if (!req.file) {
        const { error } = validate(req.body);
        if (error) {
          // fs.unlinkSync(req.file.path);
          return res
            .status(400)
            .send({ message: error.details[0].message, status: false });
        } else {
          const shop = await Shops.findOne({
            shop_name_second: req.body.shop_name_second,
            // shop_number: req.body.shop_number,
          });
          if (shop) {
            // fs.unlinkSync(req.file.path);
            return res.status(409).send({ status: false, message: "รหัสร้าน หรือ ชื่อร้านค้าซ้ำในระบบ", });
          } else {
            const shop_number = await GenerateNumber(req.body.shop_type);
            const updateInvestShop = await Invests.findOne({
              invoice: req.body.shop_landlord_id,
            });
            updateInvestShop.status.push({
              status: "รายการสำเร็จ",
              timestamp: dayjs(Date.now()).format(""),
            });
            let updateInvestMoney = [];
            let invest = [];
            for (let item of req.body.shop_investor) {
              updateInvestMoney = await Invests.findOne({
                invoice: item.invester_id,
              });
              updateInvestMoney.status.push({
                status: "รายการสำเร็จ",
                timestamp: dayjs(Date.now()).format(""),
              });
              const e = {
                invester_id: updateInvestMoney.partner_id,
                investor_price: updateInvestMoney.money,
              };
              invest.push(e);
            }
            const data = {
              ...req.body,
              shop_landlord_id: updateInvestShop.partner_id,
              shop_investor: invest,
              shop_number: shop_number,
              shop_status: true,
            };
            const new_shop = new Shops(data);
            if (!new_shop) {
              return res.status(403).send({ status: false, message: 'ไม่สามารถร้านค้าได้' });
            } else {
              new_shop.save();
              updateInvestShop.save();
              updateInvestMoney.save();
              return res.status(201).send({ message: "เพิ่มร้านค้าสำเร็จ", status: true, data: new_shop });
            }
          }
        }
      } else {
        const { error } = validate(req.body);
        if (error) {
          // fs.unlinkSync(req.file.path);
          return res
            .status(400)
            .send({ message: error.details[0].message, status: false });
        } else {
          const shop = await Shops.findOne({
            shop_name_second: req.body.shop_name_second,
            // shop_number: req.body.shop_number,
          });
          if (shop) {
            // fs.unlinkSync(req.file.path);
            return res.status(409).send({ status: false, message: "รหัสร้าน หรือ ชื่อร้านค้าซ้ำในระบบ", });
          } else {
            // const data = {
            // ...req.body,
            // shop_logo: req.file.filename,
            // shop_number: shop_number,
            // shop_status: true,
            // };
            // const new_shop = new Shops(data);
            const updateInvestShop = await Invests.findOne({
              invoice: req.body.shop_landlord_id,
            });
            updateInvestShop.status.push({
              status: "รายการสำเร็จ",
              timestamp: dayjs(Date.now()).format(""),
            });
            let updateInvestMoney = [];
            let invest = [];
            for (let item of req.body.shop_investor) {
              updateInvestMoney = await Invests.findOne({
                invoice: item.invester_id,
              });
              updateInvestMoney.status.push({
                status: "รายการสำเร็จ",
                timestamp: dayjs(Date.now()).format(""),
              });
              const e = {
                invester_id: updateInvestMoney.partner_id,
                investor_price: updateInvestMoney.money,
              };
              invest.push(e);
            };
            const data = {
              ...req.body,
              shop_landlord_id: updateInvestShop.partner_id,
              shop_investor: invest,
              shop_logo: req.file[0].filename,
              shop_number: shop_number,
              shop_status: true,
            };
            const new_shop = new Shops(data);
            if (!new_shop) {
              return res.status(403).send({ status: false, message: 'ไม่สามารถร้านค้าได้' });
            } else {
              new_shop.save();
              updateInvestShop.save();
              updateInvestMoney.save();
              return res.status(201).send({ message: "เพิ่มร้านค้าสำเร็จ", status: true, data: new_shop });
            }
            // const shop_number = await GenerateNumber(req.body.shop_type);
            // const data = {
            // ...req.body,
            // shop_number: shop_number,
            // shop_logo: req.file.filename,
            // shop_status: true,
            // };
            // const new_shop = new Shops(data);
            // console.log(new_shop)
            // return res.status(201).send({ message: "เพิ่มร้านค้าสำเร็จ", status: true });
          }
        }
      }
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

exports.findAll = async (req, res, next) => {
  try {
    Shops.find()
      .then(async (data) => {
        res.status(201).send({ data, message: "success", status: true });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "มีบางอย่างผิดพลาด",
        });
      });
  } catch (error) {
    res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    Shops.findById(id)
      .then((data) => {
        if (!data)
          return res
            .status(404)
            .send({ message: "ไม่สามารถหารายงานนี้ได้", status: false });
        return res.send({ data, status: true });
      })
      .catch((err) => {
        return res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          status: false,
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.findByPartnerId = async (req, res) => {
  const id = req.params.partnerid;
  try {
    let shop_partner = [];
    const shop = await Shops.find();
    if (!shop) {
      return res.status(403).send({ status: false, message: 'ดึงข้อมูลร้านไม่สำเร็จ' });
    } else {
      const shops = shop.filter(
        (el) => el.shop_partner_id === id
      );
      for (let item of shops) {
        shop_partner.push(item)
      }

      const shop_land = shop.filter(
        (el) => el.shop_landlord_id === id
      );
      for (let item1 of shop_land) {
        shop_partner.push(item1)
      }
      return res.status(200).send({ status: true, message: "ดึงข้อมูลร้านสำเร็จ", data: shop_partner });
    }
  } catch {
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.findByLandlord = async (req, res) => {
  const id = req.params.id;
  try {
    Shops.find({ shop_landlord_id: id })
      .then((data) => {
        console.log(data);
        if (!data)
          res
            .status(404)
            .send({ message: "ไม่สามารถหารายงานนี้ได้", status: false });
        else res.send({ data, status: true });
      })
      .catch((err) => {
        res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          status: false,
        });
      });
  } catch {
    res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.findByInvestor = async (req, res) => {
  const id = req.params.id;
  try {
    const shop = await Shops.find();
    const shops = shop.filter((el) => el.shop_investor[0].invester_id === id);
    if (!shops)
      return res
        .status(403)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: shops });
  } catch {
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

module.exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    Shops.findByIdAndUpdate(id, req.body, { useFindAndModify: false }).then((data) => {
      if (!data) {
        return res.status(404).send({
          message: 'ไม่สามารถแก้ไขข้อมูลร้านค้าได้',
          status: false,
        });
      } else {
        return res.send({
          message: 'แก้ไขข้อมูลร้านค้าสำเร็จ',
          status: true,
        });
      }
    }).catch((err) => {
      return res.status(500).send({
        message: err.response.data.message,
        status: false,
      });
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    Shops.findByIdAndDelete(id, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: `ไม่สามารถลบรายงานนี้ได้`,
            status: false,
          });
        } else {
          res.send({
            message: "ลบรายงานนี้เรียบร้อยเเล้ว",
            status: true,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบรายงานนี้ได้",
          status: false,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "ไม่สามารถลบรายงานนี้ได้",
      status: false,
    });
  }
};

async function GenerateNumber(shop_type) {
  const pipelint = [
    {
      $match: { shop_type: shop_type },
    },
    {
      $group: { _id: 0, count: { $sum: 1 } },
    },
  ];
  const count = await Shops.aggregate(pipelint);
  const countValue = count.length > 0 ? count[0].count + 1 : 1;
  const data = `TGS${countValue.toString().padStart(5, "0")}`;
  return data;
};

module.exports.getWalletHistory = async (res, res) => {
  try {
    const id = req.params.shopid;
    const pipelint = [
      {
        $match: {
          $and: [
            { shop_id: id }
          ]
        },
      },
    ];
    const wallet = await WalletHistory.aggregate(pipelint);
    if (!wallet)
      return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: wallet });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: "Internal Server Error" });
  }
}