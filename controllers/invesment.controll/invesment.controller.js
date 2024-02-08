const {
  InvesmentMoneys,
} = require("../../model/invesment/invesment.money.model");
const {InvesmentShops} = require("../../model/invesment/invesment.shop.model");

exports.getMoneyAll = async (req, res) => {
  try {
    InvesmentMoneys.find()
      .then((data) => {
        return res.status(200).send({status: true, message: "success", data});
      })
      .catch((err) => {
        return res
          .status(500)
          .send({message: err.message || "มีบางอย่างผิดพลาด"});
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getShopAll = async (req, res) => {
  try {
    InvesmentShops.find()
      .then((data) => {
        return res.status(200).send({status: true, message: "success", data});
      })
      .catch((err) => {
        return res
          .status(500)
          .send({message: err.message || "มีบางอย่างผิดพลาด"});
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getMoneyById = async (req, res) => {
  try {
    InvesmentMoneys.findOne({_id: req.params.id})
      .then((data) => {
        return res.status(200).send({status: true, message: "success", data});
      })
      .catch((err) => {
        return res
          .status(500)
          .send({message: err.message || "มีบางอย่างผิดพลาด"});
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getShopById = async (req, res) => {
  try {
    InvesmentShops.findOne({_id: req.params.id})
      .then((data) => {
        return res.status(200).send({status: true, message: "success", data});
      })
      .catch((err) => {
        return res
          .status(500)
          .send({message: err.message || "มีบางอย่างผิดพลาด"});
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getMoneyByInvestorId = async (req, res) => {
  try {
    const id = req.params.investor_id;
    const investor = await InvesmentMoneys.find();
    const investors = investor.filter((el) => el.investor_id === id);
    if (!investors)
      return res.status(403).send({status: false, message: "ไม่สำเร็จ"});
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: investors});
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getMoneyByLandlordId = async (req, res) => {
  try {
    const id = req.params.landlord_id;
    const landlord = await InvesmentShops.find();
    const landlords = landlord.filter((el) => el.landlord_id === id);
    if (!landlords)
      return res.status(403).send({status: false, message: "ไม่สำเร็จ"});
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: landlords});
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};
