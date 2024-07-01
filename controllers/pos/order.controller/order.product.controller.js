const dayjs = require("dayjs");
const { Orders,
  validate,
} = require("../../../model/pos/order/order.product.model");
const { PreOrderTossaguns } = require("../../../model/pos/preorder/preorder.tossagun.model");

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
    const shop_id = req.params.shop_id;
    const order = await Orders.find({ shop_id: shop_id });
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
    const dealer_id = req.params.dealer_id;
    const order = await Orders.find({ dealer_id: dealer_id });
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
