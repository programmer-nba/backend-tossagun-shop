const {Types, validate} = require("../../../model/pos/type.model");

exports.create = async (req, res) => {
  try {
    const {error} = validate(req.body);
    if (error)
      return res
        .status(400)
        .send({message: error.details[0].message, status: false});
    const result = await new Types({
      ...req.body,
    }).save();
    return res.status(201).send({
      message: "เพิ่มข้อมูลสำเร็จ",
      status: true,
    });
  } catch (error) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.findAll = async (req, res) => {
  try {
    Types.find()
      .then(async (data) => {
        return res.send({data, message: "success", status: true});
      })
      .catch((err) => {
        return res.status(500).send({
          message: err.message || "มีบางอย่างผิดพลาด",
        });
      });
  } catch (error) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    Types.findById(id)
      .then((data) => {
        if (!data)
          return res
            .status(404)
            .send({message: "ไม่สามารถหารายการนี้ได้", status: false});
        else res.send({data, status: true});
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

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).send({
        message: "ส่งข้อมูลผิดพลาด",
      });
    const id = req.params.id;
    Types.findByIdAndUpdate(id, req.body, {useFindAndModify: false})
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
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    Types.findByIdAndDelete(id, {useFindAndModify: false})
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
