const {Invesments} = require("../../model/invesment/invesment.model");

exports.getAll = async (req, res) => {
  try {
    Invesments.find()
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

exports.getById = async (req, res) => {
  try {
    Invesments.findOne({_id: req.params.id})
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

exports.getByInvestorId = async (req, res) => {
  try {
    const id = req.params.investor_id;
    const investor = await Invesments.find();
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
