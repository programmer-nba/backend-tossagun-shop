const bcrypt = require("bcrypt");
const {Landlords, validate} = require("../../model/user/landlord.model");
const platform = require("../../function/platform");
const dayjs = require("dayjs");

exports.create = async (req, res) => {
  try {
    const {error} = validate(req.body);
    if (error)
      return res
        .status(400)
        .send({message: error.details[0].message, status: false});
    const landlord = await Landlords.findOne({
      landlord_iden: req.body.landlord_iden,
    });
    if (landlord) {
      return res.status(409).send({
        status: false,
        message: "มีชื่อผู้ใช้งานนี้ในระบบเเล้ว",
      });
    } else {
      const promise = [];
      const status = [];
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.landlord_password, salt);
      promise.push({
        status: "ยังไม่ได้เซ็นสัญญา",
        timestamp: dayjs(Date.now()).format(""),
      });
      status.push({
        status: "รอการตรวจสอบ",
        timestamp: dayjs(Date.now()).format(""),
      });
      const data = {
        ...req.body,
        landlord_password: hashPassword,
        landlord_promise: promise,
        landlord_status_type: status,
      };
      const new_landlord = await Landlords.create(data);
      new_landlord.save();
      // await new Landlords({
      //   ...req.body,
      //   landlord_password: hashPassword,
      //   landlord_promise: promise,
      //   landlord_status_type: status,
      // }).save();
      return res.status(201).send({message: "เพิ่มข้อมูลสำเร็จ", status: true});
    }
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.findAll = async (req, res) => {
  try {
    Landlords.find()
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
    Landlords.findById(id)
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
    if (!req.body.landlord_password) {
      Landlords.findByIdAndUpdate(id, req.body, {useFindAndModify: false})
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
      const hashPassword = await bcrypt.hash(req.body.landlord_password, salt);
      Landlords.findByIdAndUpdate(
        id,
        {...req.body, landlord_password: hashPassword},
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
    Landlords.findByIdAndDelete(id, {useFindAndModify: false})
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

exports.confirm = async (req, res) => {
  try {
    const updateStatus = await Landlords.findOne({_id: req.params.id});
    if (updateStatus) {
      updateStatus.landlord_emp = req.body.landlord_emp;
      updateStatus.landlord_status_type.push({
        status: "ผ่านการตรวจสอบ",
        timestamp: dayjs(Date.now()).format(""),
      });
      updateStatus.landlord_status = true;
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "ยืนยันการตรวจสอบเจ้าของที่ดินสำเร็จ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
    }
  } catch (error) {
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.contract = async (req, res) => {
  try {
    const updateContract = await Landlords.findOne({_id: req.params.id});
    if (updateContract) {
      updateContract.landlord_promise.push({
        status: "เซ็นสัญญา",
        timestamp: dayjs(Date.now()).format(""),
      });
      updateContract.save();
      return res.status(200).send({
        status: true,
        message: "ยืนยันการเซ็นสัญญา",
        data: updateContract,
      });
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
    }
  } catch (err) {
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};
