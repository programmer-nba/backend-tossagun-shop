const {Percents, validate} = require("../../model/pos/percent.model");

exports.create = async (req, res) => {
  try {
    const {error} = validate(req.body);

    if (error)
      return res
        .status(400)
        .send({message: error.details[0].message, status: false});
    const result = await new Percents({
      ...req.body,
    })
      .save()
      .catch((err) => console.log(err));
    res.status(201).send({
      message: "เพิ่มข้อมูลสำเร็จ",
      status: true,
      result: result,
    });
  } catch (error) {
    res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.findAll = async (req, res) => {
  try {
    Percents.find()
      .then(async (data) => {
        res.send({data: data, message: "success", status: true});
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "มีบางอย่างผิดพลาด",
        });
      });
  } catch (error) {
    res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    Percents.findById(id)
      .then((data) => {
        if (!data)
          res
            .status(404)
            .send({message: "ไม่สามารถหารายการนี้ได้", status: false});
        else res.send({data, status: true});
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

exports.findCode = async (req, res) => {
  const code = req.params.id;
  try {
    Percents.findOne({code: code})
      .then((data) => {
        if (!data)
          res
            .status(404)
            .send({message: "ไม่สามารถหารายการนี้ได้", status: false});
        else res.send({data, status: true});
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

exports.update = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        message: "ส่งข้อมูลผิดพลาด",
      });
    }
    const id = req.params.id;

    Percents.findByIdAndUpdate(id, req.body, {useFindAndModify: false})
      .then((data) => {
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
    res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};
