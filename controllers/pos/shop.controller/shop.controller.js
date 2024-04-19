const { Shops, validate } = require("../../../model/pos/shop.model");

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
    const shop = Shops.find();
    const shops = shop.filter(
      (el) => el.shop_partner_id === id
    );
    if (!shops)
      return res.status(403).send({ status: false, message: "ดึงข้อมูลร้านไม่สำเร็จ" });
    return res.status(200).send({ status: true, message: "ดึงข้อมูลร้านสำเร็จ", data: shops });
  } catch {
    res.status(500).send({
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
