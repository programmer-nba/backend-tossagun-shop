const bcrypt = require("bcrypt");
const {Landlords, validate} = require("../../model/user/landlord.model");
const {Lands, validateLand} = require("../../model/pos/land.model");
const platform = require("../../lib/platform");

const multer = require("multer");
const fs = require("fs");
const {google} = require("googleapis");
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-");
  },
});

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
    if (landlord)
      return res.status(409).send({
        status: false,
        message: "มีชื่อผู้ใช้งานนี้ในระบบเเล้ว",
      });
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.landlord_password, salt);
    await new Landlords({
      ...req.body,
      landlord_password: hashPassword,
      landlord_status_type: {
        name: "รอการตรวจสอบ",
        timestamp: dayjs(Date.now().format()),
      },
    }).save();
    return res.status(201).send({message: "เพิ่มข้อมูลสำเร็จ", status: true});
    // const data_platform = {
    //   ref_tel: req.body.ref_tel,
    //   name: req.body.landlord_name,
    //   tel: req.body.landlord_phone,
    //   password: req.body.landlord_password,
    //   address: req.body.landlord_address,
    //   subdistrict: req.body.landlord_subdistrict,
    //   district: req.body.landlord_district,
    //   province: req.body.landlord_province,
    //   postcode: req.body.landlord_postcode,
    // };
    // const response = await platform.Register(data_platform);
    // if (response) {
    //   await new Landlords({
    //     ...req.body,
    //     landlord_password: hashPassword,
    //     landlord_status_type: {
    //       name: "รอการตรวจสอบ",
    //       timestamp: dayjs(Date.now().format()),
    //     },
    //   }).save();
    //   return res.status(201).send({message: "เพิ่มข้อมูลสำเร็จ", status: true});
    // } else {
    //   return res
    //     .status(401)
    //     .send({message: "มีบางอย่างผิดพลาด", status: false});
    // }
  } catch (err) {
    res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
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

exports.createLand = async (req, res) => {
  try {
    const {error} = validateLand(req.body);
    if (error)
      return res
        .status(400)
        .send({message: error.details[0].message, status: false});
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};
