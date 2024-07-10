const dayjs = require("dayjs");
const { PreOrderShop, validate } = require("../../../model/pos/preorder/preorder.shop.model");
const { Commission } = require("../../../model/pos/commission/commission.model");
const { Shops } = require("../../../model/pos/shop.model");
const { InvoiceShop } = require("../../../model/pos/invoice.shop.model");
const { Percents } = require("../../../model/pos/commission/percent.model");
const platform = require("../../../function/platform");
const commissions = require("../../../function/commission");
const { Members } = require("../../../model/user/member.model");
const { ProductShops } = require("../../../model/pos/product/product.shop.model");

exports.create = async (req, res) => {
  try {
    const shop = await Shops.findOne({ _id: req.body.poshop_shop_id });
    if (!shop) {
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูลร้านค้า" });
    } else {
      if (shop.shop_status === false) {
        return res.status(403).send({ status: false, message: "ร้านค้าดังกล่าวไม่สามารถทำรายการได้" });
      }

      // เช็คสต๊อกสินค้า
      for (let item of req.body.poshop_detail) {
        const product = await ProductShops.findOne({ productShop_barcode: item.productShop_barcode });
        let product_shop = product;
        while (product_shop.productShop_stock < item.amount) {
          // ปรับสต๊อกสินค้า
          await updateProduct(product_shop, item);
          // console.log(res)
          product_shop = await ProductShops.findOne({ productShop_barcode: item.productShop_barcode });
          await delay(1000);
        }
      };

      // ตรวจสอบสินค้าอีกครั้ง
      for (let item of req.body.poshop_detail) {
        const product = await ProductShops.findOne({ productShop_barcode: item.productShop_barcode });
        if (product.productShop_stock < item.amount) {
          return res.status(401).send({ status: false, message: "จำนวนสินค้าไม่เพียงพอ" });
        } else {
          const position = req.body.poshop_detail.findIndex((el) => el.productShop_barcode === product.productShop_barcode);
          const new_data = {
            ...item,
            productShop_stock: product.productShop_stock
          };
          req.body.poshop_detail.splice(position, 1, new_data);
        }
      };

      const order = [];

      // คำนวนยอด
      for (let item of req.body.poshop_detail) {
        const v = {
          ...item,
          cost_tg: (item.product_ref.productTG_cost_tg.cost_tg * item.amount),
          cost: (item.product_ref.productTG_cost.cost_net * item.amount),
          total: (item.product_ref.productTG_price.price * item.amount),
          profit_tg: (item.product_ref.productTG_profit * item.amount),
          profit_shop: (item.product_ref.productTG_profit_shop * item.amount),
        };
        order.push(v);
      };

      // Object.keys(req.body.poshop_detail).forEach(async (ob) => {
      // const item = req.body.poshop_detail[ob];
      // order.push(item);
      // cost_tg += item.product_ref.productTG_cost_tg.cost_tg;
      // cost += item.product_ref.productTG_cost.cost_net;
      // total += item.product_ref.productTG_price.price;
      // profit_tg += item.product_ref.productTG_profit;
      // profit_shop += item.product_ref.productTG_profit_shop;
      // });

      const cost_tg = order.reduce((sum, el) => sum + el.cost_tg, 0);
      const cost = order.reduce((sum, el) => sum + el.cost, 0);
      const total = order.reduce((sum, el) => sum + el.total, 0);
      const profit_tg = order.reduce((sum, el) => sum + el.profit_tg, 0);
      const profit_shop = order.reduce((sum, el) => sum + el.profit_shop, 0);

      const profit = total - cost;

      const total_platform = (profit * 10 / 100);

      const invoice = await invoiceNumber(req.body.poshop_shop_id, shop.shop_number);

      const o = {
        poshop_invoice: invoice,
        poshop_shop_id: req.body.poshop_shop_id,
        poshop_detail: order,
        poshop_platform: req.body.poshop_platform,
        poshop_paymenttype: req.body.poshop_paymenttype,
        poshop_cost_tg: Number(cost_tg.toFixed(2)),
        poshop_cost: Number(cost.toFixed(2)),
        poshop_total: Number(total.toFixed(2)),
        poshop_total_platform: Number(total_platform.toFixed(2)),
        poshop_profit_tg: Number(profit_tg.toFixed(2)),
        poshop_profit_shop: Number(profit_shop.toFixed(2)),
        poshop_discount: req.body.poshop_discount,
        poshop_moneyreceive: req.body.poshop_moneyreceive,
        poshop_change: req.body.poshop_change,
        poshop_cutoff: false,
        poshop_timestamp: dayjs(Date.now()).format(),
        poshop_employee: req.body.poshop_employee,
        poshop_status: [
          { name: "ชำระเงิน", timestamp: dayjs(Date.now()).format() }
        ],
      };

      const new_poshop = new PreOrderShop(o);

      if (!new_poshop)
        return res.status(403).send({ message: "ไม่สามารถทำรายการได้" });

      const getteammember = await GetTeamMember(req.body.poshop_platform);
      if (!getteammember)
        return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });

      // ตัดสต๊อกสินค้า
      for (let item of req.body.poshop_detail) {
        const product = await ProductShops.findOne({ productShop_barcode: item.productShop_barcode });
        product.productShop_stock -= item.amount;
        product.save();
        await delay(1000);
      };

      new_poshop.save();

      const order_data = {
        _id: JSON.stringify(new_poshop._id),
        invoice: new_poshop.poshop_invoice,
        platform: new_poshop.poshop_platform,
      };

      const commissionData = await commissions.Commission(order_data, total_platform, getteammember, 'POS', total);
      const commission = new Commission(commissionData);
      if (!commission)
        return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });

      commission.save();
      return res.status(201).send({ message: "เพิ่มข้อมูลสำเร็จ", status: true, poshop: new_poshop });
    }
  } catch (error) {
    res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

async function invoiceNumber(shopid, shopnumber) {
  const pipelint = [
    {
      $match: { poshop_shop_id: shopid },
    },
    {
      $group: { _id: 0, count: { $sum: 1 } },
    },
  ];
  const count = await PreOrderShop.aggregate(pipelint);
  const countValue = count.length > 0 ? count[0].count + 1 : 1;
  const data = `${shopnumber}${dayjs(Date.now()).format("YYMMDD")}${countValue.toString().padStart(3, "0")}`;
  return data;
};

async function GetTeamMember(tel) {
  try {
    const member = await Members.findOne({ tel: tel });
    if (!member) {
      return res
        .status(403)
        .send({ message: "เบอร์โทรนี้ยังไม่ได้เป็นสมาชิกของทศกัณฐ์แฟมมิลี่" });
    } else {
      const upline = [member.upline.lv1, member.upline.lv2, member.upline.lv3];
      const validUplines = upline.filter((item) => item !== "-");
      const uplineData = [];
      let i = 0;
      for (const item of validUplines) {
        const include = await Members.findOne({ _id: item });
        if (include !== null) {
          uplineData.push({
            iden: include.iden.number,
            name: include.fristname,
            address: {
              address: include.address,
              subdistrict: include.subdistrict,
              district: include.district,
              province: include.province,
              postcode: include.postcode,
            },
            tel: include.tel,
            level: i + 1,
          });
          i++;
        }
      }
      const owner = {
        iden: member.iden.number,
        name: member.fristname,
        address: {
          address: member.address,
          subdistrict: member.subdistrict,
          district: member.district,
          province: member.province,
          postcode: member.postcode,
        },
        tel: member.tel,
        level: "owner",
      };
      const data = [
        owner || null,
        uplineData[0] || null,
        uplineData[1] || null,
        uplineData[2] || null,
      ];
      return data
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: false, error: error.message });
  }
};

async function updateProduct(product, item) {
  let data = [];
  let product_shop = product;
  // let status = false;
  const execute = async () => {
    // while (!status) {
    while (product_shop.productShop_stock < item.amount) {
      if (data.length > 0) {
        let index = 0;
        while (index < data.length) {
          const res = await adjusProduct(data[index]);
          if (!res.status) {
            // const pro = data.find((el) => el.productShop_barcode === res.data.productShop_barcode);
            // if (pro) {
            // console.log('test')
            // status = true;
            // break;
            // } else {
            data.push(res.data)
            // }
          } else {
            const position = data.findIndex((el) => el.productShop_barcode === res.data.productShop_barcode);
            data.splice(position, 1);
          }
        }
      } else {
        const resp = await adjusProduct(product_shop);
        if (!resp.status) {
          data.push(resp.data)
        }
      }
      // console.log(data)
      product_shop = await ProductShops.findOne({ productShop_barcode: item.productShop_barcode });
      console.log('สินค้า :', product_shop);
      await delay(1000);
    };
    // };
  };
  await execute();
};

async function adjusProduct(data) {
  // if (data.productShop_ref !== '') {
  const product_ref = await ProductShops.findOne({ productShop_barcode: data.productShop_ref });
  if (product_ref.productShop_stock !== 0) {
    product_ref.productShop_stock -= 1;
    const product = await ProductShops.findOne({ productShop_barcode: product_ref.productShop_unit_ref.barcode });
    product.productShop_stock += product_ref.productShop_unit_ref.amount;
    product_ref.save();
    product.save();
    await delay(1000);
    console.log('ปรับสต๊อกสำเร็จ')
    return { status: true, data: product };
  } else {
    await delay(1000);
    console.log('สินค้าไม่เพียงพอต่อการปรับสต๊อก')
    return { status: false, data: product_ref };
  }
  // } else {
  // await delay(1000);
  // return { status: false, data: data };
  // }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

module.exports.findByShopId = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await PreOrderShop.find();
    const orders = order.filter(
      (el) => el.poshop_shop_id === id
    );
    if (orders) {
      return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: orders })
    } else {
      return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
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

exports.cutoff = async (req, res) => {
  try {

  } catch (err) {
    res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
}

//ค้นหาและสร้างเลข invoice
// async function invoiceNumber(shop_id, date) {
// const shop = await Shops.findById(shop_id);
// if (shop) {
// const order = await InvoiceShop.find({ invoice_shop_id: shop_id });
// let invoice_number = null;
// if (order.length !== 0) {
// let data = "";
// let num = 0;
// let check = null;
// do {
// num = num + 1;
// data =
// `${shop.shop_number}${dayjs(date).format("YYYYMM")}`.padEnd(13, "0") +
// num;
// check = await InvoiceShop.find({ invoice_ref: data });
// if (check.length === 0) {
// invoice_number =
// `${shop.shop_number}${dayjs(date).format("YYYYMM")}`.padEnd(
// 13,
// "0"
// ) + num;
// }
// } while (check.length !== 0);
// } else {
// invoice_number =
// `${shop.shop_number}${dayjs(date).format("YYYYMM")}`.padEnd(13, "0") +
// "1";
// }
// console.log(invoice_number);
// return invoice_number;
// } else {
// return "0";
// }
// }
