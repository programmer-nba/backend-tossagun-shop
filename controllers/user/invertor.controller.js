const bcrypt = require("bcrypt");
const {Investors, validate} = require("../../model/user/investor.model");
const platform = require("../../lib/platform");

exports.create = async (req, res) => {
  try {
    // const {error} = validate(req.body);
    // if (error)
    //   return res
    //     .status(400)
    //     .send({message: error.details[0].message, status: false});
    const invertor = await Investors.findOne({
      investor_iden: req.body.investor_iden,
    });
    if (invertor)
      return res.status(409).send({
        status: false,
        message: "มีชื่อผู้ใช้งานนี้ในระบบเเล้ว",
      });
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.investor_password, salt);
    const data_platform = {
      ref_tel: req.body.ref_tel,
      name: req.body.investor_name,
      tel: req.body.investor_phone,
      password: req.body.investor_password,
      address: req.body.investor_address,
      subdistrict: req.body.investor_subdistrict,
      district: req.body.investor_district,
      province: req.body.investor_province,
      postcode: req.body.investor_postcode,
    };
    const response = await platform.Register(data_platform);
    if (response) {
      await new Investors({
        ...req.body,
        investor_password: hashPassword,
      }).save();
      return res.status(201).send({message: "สร้างข้อมูลสำเร็จ", status: true});
    } else {
      return res
        .status(401)
        .send({message: "มีบางอย่างผิดพลาด", status: false});
    }
  } catch (error) {
    res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.findAll = async (req, res) => {
  try {
    Investors.find()
      .then(async (data) => {
        res.send({data, message: "success", status: true});
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
    Investors.findById(id)
      .then((data) => {
        if (!data)
          res
            .status(404)
            .send({message: "ไม่สามารถหาผู้ใช้งานนี้ได้", status: false});
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
    if (!req.body.investor_password) {
      Investors.findByIdAndUpdate(id, req.body, {useFindAndModify: false})
        .then((data) => {
          if (!data) {
            res.status(404).send({
              message: `ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้`,
              status: false,
            });
          } else
            res.send({
              message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว",
              status: true,
            });
        })
        .catch((err) => {
          res.status(500).send({
            message: "มีบ่างอย่างผิดพลาด" + id,
            status: false,
          });
        });
    } else {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.investor_password, salt);
      Investors.findByIdAndUpdate(
        id,
        {...req.body, investor_password: hashPassword},
        {useFindAndModify: false}
      )
        .then((data) => {
          if (!data) {
            res.status(404).send({
              message: `ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้`,
              status: false,
            });
          } else
            res.send({
              message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว",
              status: true,
            });
        })
        .catch((err) => {
          res.status(500).send({
            message: "ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้",
            status: false,
          });
        });
    }
  } catch (error) {
    res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    Investors.findByIdAndDelete(id, {useFindAndModify: false})
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: `ไม่สามารถลบผู้ใช้งานนี้ได้`,
            status: false,
          });
        } else {
          res.send({
            message: "ลบผู้ใช้งานนี้เรียบร้อยเเล้ว",
            status: true,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบผู้ใช้งานนี้ได้",
          status: false,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "ไม่สามารถลบผู้ใช้งานนี้ได้",
      status: false,
    });
  }
};
