const dayjs = require("dayjs");
const { Orders,
  validate,
} = require("../../../model/pos/order/order.product.model");
const { PreOrderTossaguns } = require("../../../model/pos/preorder/preorder.tossagun.model");
const { ProductShops } = require("../../../model/pos/product/product.shop.model");
const { ProductTG } = require("../../../model/pos/product/product.tossagun.model");
const { string } = require("joi");

exports.create = async (req, res) => {
  try {
    const preorder = await PreOrderTossaguns.findOne({ _id: req.body._id });
    if (!preorder)
      return res.status(401).send({ stauts: false, message: 'ไม่พบรายการสั่งซื้อสินค้า' })
    const product_tg = req.body.ponba_detail.filter((el) => el.productTG_store === 'tossagun');
    if (product_tg.length > 0) {
      const order_tg = {
        ponba_id: req.body._id,
        shop_id: req.body.ponba_shop_id,
        dealer_id: 'ไม่มี',
        barcode: dayjs(Date.now()).format("YYMMDDHms") + 0,
        product_detail: product_tg,
        status: [{
          name: "รอรับคำสั่งซื้อ",
          timestamp: dayjs(Date.now()).format(),
        }]
      };
      const order_one = await Orders.create(order_tg);
      if (order_one) {
        console.log('สร้างใบออเดอร์ของ Tossagun สำเร็จ')
      }
    } else {
      console.log('ไม่มีรายการสินค้าของ Tossagun')
    }

    const product_dealer = req.body.ponba_detail.filter((el) => el.productTG_store === 'dealer');
    if (product_dealer.length > 0) {
      const dealer = [
        ...new Set(product_dealer.map((el) => el.productTG_dealer_id))
      ];
      for (let i = 1; i <= dealer.length; i++) {
        const dealer_id = dealer[i - 1];
        let product = product_dealer.filter(
          (el) => el.productTG_dealer_id === dealer_id
        );
        const order_dealer = {
          ponba_id: req.body._id,
          shop_id: req.body.ponba_shop_id,
          dealer_id: dealer_id,
          barcode: dayjs(Date.now()).format("YYMMDDHms") + 0,
          product_detail: product,
          status: [{
            name: "รอรับคำสั่งซื้อ",
            timestamp: dayjs(Date.now()).format(),
          }]
        };
        const order_two = await Orders.create(order_dealer);
        if (order_two) {
          console.log('สร้างใบออเดอร์ของ Dealer สำเร็จ')
        }
      }
    } else {
      console.log('ไม่มีรายการสินค้าของ Dealer')
    }

    preorder.ponba_status = "ยืนยันการสั่งสินค้า";
    const data_time = {
      name: "ยืนยันการสั่งสินค้า",
      timestamp: dayjs(Date.now()).format(),
    };
    preorder.ponba_timestamp.push(data_time);
    preorder.save();

    return res.status(201).send({ message: "เพิ่มข้อมูลสำเร็จ", status: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: err._message });
  }
};

exports.findAll = async (req, res) => {
  console.log("find all");
  try {
    const order = await Orders.find();
    return res.status(200).send({ status: true, data: order });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err._message });
  }
};

exports.findById = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Orders.findById(id);
    if (order) {
      return res.status(200).send({ status: true, data: order });
    } else {
      return res
        .status(400)
        .send({ message: "ค้นหาข้อมูลไม่สำเร็จ", status: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err._message });
  }
};

exports.findByShopId = async (req, res) => {
  try {
    const id = req.params.shopid;
    const order = await Orders.find({ shop_id: id });
    if (order) {
      return res.status(200).send({ status: true, data: order });
    } else {
      return res.status(400).send({ message: "ไม่สำเร็จ", status: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err._message });
  }
};

exports.findByDealerId = async (req, res) => {
  try {
    const id = req.params.dealerid;
    const order = await Orders.find({ dealer_id: id });
    if (order) {
      return res.status(200).send({ status: true, data: order });
    } else {
      return res.status(400).send({ message: "ไม่สำเร็จ", status: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err._message });
  }
};

exports.findByPoNbaId = async (req, res) => {
  try {
    const ponba_id = req.params.ponba_id;
    const order = await Orders.find({ ponba_id: ponba_id });
    if (order) {
      return res.status(200).send({ status: true, data: order });
    } else {
      return res.status(400).send({ message: "ไม่สำเร็จ", status: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
};

exports.findByStoreId = async (req, res) => {
  try {
    const store_id = req.params.store_id;
    const order = await Orders.find({ store_id: store_id });
    if (order) {
      return res.status(200).send({ status: true, data: order });
    } else {
      return res.status(400).send({ message: "ไม่สำเร็จ", status: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err._message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Orders.findByIdAndDelete(id);
    if (order) {
      return res.status(200).send({ status: true, message: "ลบข้อมูลสำเร็จ" });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ลบข้อมูลไม่สำเร็จ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err._message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Orders.findByIdAndUpdate(id, req.body);
    if (order) {
      return res.status(200).send({ status: true, message: "แก้ไขข้อมูลสำเร็จ" });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "แก้ไขข้อมูลไม่สำเร็จ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err._message });
  }
};

module.exports.confrimOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Orders.findOne({ _id: id });
    if (!order)
      return res.status(403).send({ status: false, message: 'ไม่พบรายการออเดอร์สินค้า' });

    const status = {
      name: 'ยืนยันการสั่งซื้อ',
      timestamp: dayjs(Date.now()).format(),
    };
    order.status.push(status);
    order.save();
    return res.status(200).send({ status: true, message: 'ยืนยันรายการออเดอร์สำเร็จ' });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports.confrimTracking = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Orders.findOne({ _id: id });
    if (!order)
      return res.status(403).send({ status: false, message: 'ไม่พบรายการออเดอร์สินค้า' });

    order.tracking_code = req.body.tracking_code;
    order.tracking_number = req.body.tracking_number;
    const status = {
      name: 'ระหว่างจัดส่ง',
      timestamp: dayjs(Date.now()).format(),
    };
    order.status.push(status);
    order.save();
    return res.status(200).send({ status: true, message: 'จัดส่งสินค้าสำเร็จ' });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports.ImportProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Orders.findOne({ _id: id });
    if (!order)
      return res.status(403).send({ status: false, message: 'ไม่พบรายการออเดอร์สินค้า' });

    order.product_detail.forEach(async (el) => {
      let value = "";
      let data = [];
      const product_tg = await ProductTG.findOne({ _id: el._id });
      if (product_tg.productTG_unit_ref.barcode === '') {
        value = {
          productShop_id: order.shop_id,
          productShop_barcode: el.productTG_barcode,
          productShop_stock: el.amount,
          productShop_type: true,
          productShop_pack_name: el.productTG_pack_name,
          productShop_unit_ref: el.productTG_unit_ref,
          productShop_ref: el.productTG_ref,
          productShop_tossagun_id: el._id,
        };

        const product_shop = await ProductShops.findOne({ productShop_tossagun_id: value.productShop_tossagun_id });
        if (product_shop) {
          product_shop.productShop_stock += value.productShop_stock;
          product_shop.save()
        } else {
          const new_product_shop = new ProductShops(item);
          new_product_shop.save();
        }

      } else {
        value = {
          productShop_id: order.shop_id,
          productShop_barcode: el.productTG_barcode,
          productShop_stock: el.amount,
          productShop_type: true,
          productShop_pack_name: el.productTG_pack_name,
          productShop_unit_ref: el.productTG_unit_ref,
          productShop_ref: el.productTG_ref,
          productShop_tossagun_id: el._id,
        };

        data.push(value);

        let i = 0;
        while (i < data.length) {
          if (data[i].productShop_unit_ref.barcode !== '') {
            const resp = await productRef(data[i].productShop_unit_ref.barcode, data, order.shop_id);
            data.push(resp)
          }
          i++;
        };

        for (let item of data) {
          const product_shop = await ProductShops.findOne({ productShop_tossagun_id: item.productShop_tossagun_id });
          if (product_shop) {
            product_shop.productShop_stock += item.productShop_stock;
            product_shop.save()
          } else {
            const new_product_shop = new ProductShops(item);
            new_product_shop.save();
          }
        }
      };
    });

    const new_status = {
      name: "นำเข้าสต๊อก",
      timestamp: dayjs(Date.now()).format(),
    };

    order.status.push(new_status);
    order.save();

    return res.status(200).send({ status: true, message: 'นำสินเค้าเข้าสต๊อกร้านสำเร็จ' })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

async function productRef(barcode, data, shopid) {
  let value = "";
  const productUnit = await ProductTG.findOne({ productTG_barcode: barcode });
  if (productUnit) {
    value = {
      productShop_id: shopid,
      productShop_barcode: productUnit.productTG_barcode,
      productShop_stock: 0,
      productShop_type: true,
      productShop_pack_name: productUnit.productTG_pack_name,
      productShop_unit_ref: productUnit.productTG_unit_ref,
      productShop_ref: productUnit.productTG_ref,
      productShop_tossagun_id: productUnit._id.toString(),
    };
  }
  return value;
};

