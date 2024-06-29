const {
  PreOrderTossaguns,
  validate,
} = require("../../../model/pos/preorder/preorder.tossagun.model");
const { Shops } = require("../../../model/pos/shop.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    // console.log("error");
    if (error) {
      return res
        .status(400)
        .send({ message: error.details[0].message, status: false });
    } else {
      const shop = await Shops.findOne({ _id: req.body.ponba_shop_id });
      if (!shop)
        return res.status(401).send({ status: false, message: 'ไม่ข้อมูลร้านค้าที่ทำรายการ' })

      if (shop.shop_credit < req.body.ponba_total)
        return res.status(402).send({ status: false, message: 'ยอดเครดิตในร้านของท่านไม่เพียงพอต่อการทำรายการ' })

      const new_preorder = new PreOrderTossaguns(req.body);
      if (!new_preorder)
        return res.status(403).send({ status: false, message: 'ทำรายการไม่สำเร็จ' })

      const new_credit = shop.shop_credit - req.body.ponba_total;

      shop.shop_credit = new_credit;
      new_preorder.save();
      shop.save()

      // const result = await new PreOrderTossaguns({
      // ...req.body,
      // }).save();
      return res.status(201).send({ status: true, message: "สร้างใบสั่งซื้อสินค้าสำเร็จ", ponba: new_preorder });
    }
  } catch (error) {
    res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.findByShopId = async (req, res) => {
  const id = req.params.id;
  try {
    PreOrderTossaguns.find({ ponba_shop_id: id })
      .then((data) => {
        if (!data)
          return res
            .status(404)
            .send({ message: "ไม่สามารถหารายงานนี้ได้", status: false });
        else res.send({ data, status: true });
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

exports.findAll = async (req, res) => {
  try {
    PreOrderTossaguns.find()
      .then(async (data) => {
        return res.send({ data, message: "success", status: true });
      })
      .catch((err) => {
        return res.status(500).send({
          message: err.message || "มีบางอย่างผิดพลาด",
        });
      });
  } catch (error) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    PreOrderTossaguns.findById(id)
      .then((data) => {
        if (!data)
          return res
            .status(404)
            .send({ message: "ไม่สามารถหารายการนี้ได้", status: false });
        else res.send({ data, status: true });
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

exports.findShopId = async (req, res) => {
  const shop_id = req.params.id;
  try {
    const preorder = await PreOrderTossaguns.find();
    const preorder_shop = preorder.filter((el) => el.ponba_shop_id === shop_id);
    if (!preorder_shop)
      return res
        .status(404)
        .send({ message: "ไม่สามารถหารายการนี้ได้", status: false });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: preorder_shop });
  } catch (err) {
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    PreOrderTossaguns.findByIdAndDelete(id, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          return res.status(404).send({
            message: `ไม่สามารถลบรายการนี้ได้`,
            status: false,
          });
        } else {
          return res.send({
            message: "ลบรายการนี้เรียบร้อยเเล้ว",
            status: true,
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          message: "ไม่สามารถลบรายการนี้ได้",
          status: false,
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "ไม่สามารถลบรายงานนี้ได้",
      status: false,
    });
  }
};
exports.update = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        message: "ส่งข้อมูลผิดพลาด",
      });
    }
    const id = req.params.id;
    PreOrderTossaguns.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          return res.status(404).send({
            message: `ไม่สามารถเเก้ไขข้อมูลนี้ได้`,
            status: false,
          });
        } else
          return res.send({
            message: "แก้ไขข้อมูลนี้เรียบร้อยเเล้ว",
            status: true,
          });
      })
      .catch((err) => {
        return res.status(500).send({
          message: "มีบ่างอย่างผิดพลาด",
          status: false,
        });
      });
  } catch (error) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};
