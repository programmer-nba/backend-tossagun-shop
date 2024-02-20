const {
  PreOrderShop,
  validate,
} = require("../../../model/pos/preorder/preorder.shop.model");
const { Commission } = require("../../../model/pos/commission/commission.model");
const { Shops } = require("../../../model/pos/shop.model");
const { InvoiceShop } = require("../../../model/pos/invoice.shop.model");
const { Percents } = require("../../../model/pos/commission/percent.model");
const platform = require("../../../function/platform");
const dayjs = require("dayjs");

exports.create = async (req, res) => {
  console.log("สร้าง");
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(400)
        .send({ message: error.details[0].message, status: false });

    const result = await new PreOrderShop({
      ...req.body,

      //เพิ่มข้อมูลการแบ่งปันตรงนี้

      //end
    }).save();
    res.status(201).send({
      message: "เพิ่มข้อมูลสำเร็จ",
      status: true,
      poshop: result,
    });
  } catch (error) {
    res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.findAll = async (req, res) => {
  try {
    PreOrderShop.find()
      .then(async (data) => {
        res.send({ data, message: "success", status: true });
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
    PreOrderShop.findById(id)
      .then((data) => {
        if (!data)
          res
            .status(404)
            .send({ message: "ไม่สามารถหารายการนี้ได้", status: false });
        else res.send({ data, status: true });
      })
      .catch((err) => {
        res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          status: false,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.findByShopId = async (req, res) => {
  const id = req.params.id;
  try {
    PreOrderShop.find({ poshop_shop_id: id })
      .then((data) => {
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
  } catch (error) {
    res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    PreOrderShop.findByIdAndDelete(id, { useFindAndModify: false })
      .then((data) => {
        console.log(data);
        if (!data) {
          res.status(404).send({
            message: `ไม่สามารถลบรายการนี้ได้`,
            status: false,
          });
        } else {
          res.send({
            message: "ลบรายการนี้เรียบร้อยเเล้ว",
            status: true,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบรายการนี้ได้",
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

exports.update = async (req, res) => {
  console.log(req.body);
  try {
    if (!req.body) {
      return res.status(400).send({
        message: "ส่งข้อมูลผิดพลาด",
      });
    }
    const id = req.params.id;
    PreOrderShop.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then((data) => {
        console.log(data);
        if (!data) {
          res.status(404).send({
            message: `ไม่สามารถเเก้ไขข้อมูลนี้ได้`,
            status: false,
          });
        } else
          res.send({
            message: "แก้ไขข้อมูลนี้เรียบร้อยเเล้ว",
            status: true,
          });
      })
      .catch((err) => {
        res.status(500).send({
          message: "มีบ่างอย่างผิดพลาด",
          status: false,
        });
      });
  } catch (error) {
    res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.createCommission = async (req, res) => {
  try {
    const token = await platform.GetToken();
    const getteammember = await platform.GetTeamMember(
      req.body.tel_platform,
      token.token
    );
    const code = "POS";
    const percent = await Percents.findOne({ code: code });
    // console.log(percent)
    if (getteammember.status === false) {
      return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
    } else {
      const level = getteammember.data;

      const validLevel = level.filter((item) => item !== null);

      const storeData = [];
      const platforms = percent.percent_platform;
      //calculation from 80% for member
      const owner = (req.body.platform * platforms.level_owner) / 100;
      const lv1 = (req.body.platform * platforms.level_one) / 100;
      const lv2 = (req.body.platform * platforms.level_two) / 100;
      const lv3 = (req.body.platform * platforms.level_tree) / 100;

      //calculation vat 3%
      const ownervat = (owner * 3) / 100;
      const lv1vat = (lv1 * 3) / 100;
      const lv2vat = (lv2 * 3) / 100;
      const lv3vat = (lv3 * 3) / 100;

      //real commission for member
      const ownercommission = owner - ownervat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
      const lv1commission = lv1 - lv1vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
      const lv2commission = lv2 - lv2vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
      const lv3commission = lv3 - lv3vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน

      for (const TeamMemberData of validLevel) {
        let integratedData;

        if (TeamMemberData.level == "owner") {
          integratedData = {
            lv: TeamMemberData.level,
            iden: TeamMemberData.iden,
            name: TeamMemberData.name,
            address: `${TeamMemberData.address.address} ${TeamMemberData.address.subdistrict} ${TeamMemberData.address.district} ${TeamMemberData.address.province} ${TeamMemberData.address.postcode}`,
            tel: TeamMemberData.tel,
            commission_amount: owner,
            vat3percent: ownervat,
            remainding_commission: ownercommission,
          };
        }
        if (TeamMemberData.level == "1") {
          integratedData = {
            lv: TeamMemberData.level,
            iden: TeamMemberData.iden,
            name: TeamMemberData.name,
            address: `${TeamMemberData.address.address} ${TeamMemberData.address.subdistrict} ${TeamMemberData.address.district} ${TeamMemberData.address.province} ${TeamMemberData.address.postcode}`,
            tel: TeamMemberData.tel,
            commission_amount: lv1,
            vat3percent: lv1vat,
            remainding_commission: lv1commission,
          };
        }
        if (TeamMemberData.level == "2") {
          integratedData = {
            lv: TeamMemberData.level,
            iden: TeamMemberData.iden,
            name: TeamMemberData.name,
            address: `${TeamMemberData.address.address} ${TeamMemberData.address.subdistrict} ${TeamMemberData.address.district} ${TeamMemberData.address.province} ${TeamMemberData.address.postcode}`,
            tel: TeamMemberData.tel,
            commission_amount: lv2,
            vat3percent: lv2vat,
            remainding_commission: lv2commission,
          };
        }
        if (TeamMemberData.level == "3") {
          integratedData = {
            lv: TeamMemberData.level,
            iden: TeamMemberData.iden,
            name: TeamMemberData.name,
            address: `${TeamMemberData.address.address} ${TeamMemberData.address.subdistrict} ${TeamMemberData.address.district} ${TeamMemberData.address.province} ${TeamMemberData.address.postcode}`,
            tel: TeamMemberData.tel,
            commission_amount: lv3,
            vat3percent: lv2vat,
            remainding_commission: lv3commission,
          };
        }
        if (integratedData) {
          storeData.push(integratedData);
        }
      }
      const commissionData = {
        data: storeData,
        platform: req.body.platform,
        bonus: req.body.bonus,
        allSale: req.body.allSale,
        fund: req.body.fund,
        orderid: req.body.orderid,
        code: "POS",
      };
      const commission_platform = {
        data: storeData,
        happy_point: req.body.platform + req.body.bonus + req.body.allSale + req.body.fund,
      };
      const update_platform = await platform.Commission(commission_platform, token);
      if (update_platform.status === true) {
        const commission = new Commission(commissionData);
        commission.save();
        return res.status(200).send({ status: true, message: update_platform.message, data: commission });
      }
      // const commission = new Commission(commissionData);
      // commission.save();
      // return res.status(200).send({ status: true, message: "จ่ายค่าคอมมิชชั่นสำเร็จ", data: commission });
    }
  } catch (error) {
    res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

//ค้นหาและสร้างเลข invoice
async function invoiceNumber(shop_id, date) {
  const shop = await Shops.findById(shop_id);
  if (shop) {
    const order = await InvoiceShop.find({ invoice_shop_id: shop_id });
    let invoice_number = null;
    if (order.length !== 0) {
      let data = "";
      let num = 0;
      let check = null;
      do {
        num = num + 1;
        data =
          `${shop.shop_number}${dayjs(date).format("YYYYMM")}`.padEnd(13, "0") +
          num;
        check = await InvoiceShop.find({ invoice_ref: data });
        if (check.length === 0) {
          invoice_number =
            `${shop.shop_number}${dayjs(date).format("YYYYMM")}`.padEnd(
              13,
              "0"
            ) + num;
        }
      } while (check.length !== 0);
    } else {
      invoice_number =
        `${shop.shop_number}${dayjs(date).format("YYYYMM")}`.padEnd(13, "0") +
        "1";
    }
    console.log(invoice_number);
    return invoice_number;
  } else {
    return "0";
  }
}
