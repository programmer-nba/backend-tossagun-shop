const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { ProductTG, validate } = require("../../../model/pos/product/product.tossagun.model");

const uploadFolder = path.join(__dirname, '../../../assets/product');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder)
  },
  filename: function (req, file, cb) {
    cb(null, 'product' + "-" + file.originalname);
  },
});

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    let upload = multer({ storage: storage }).single("productTG_image");
    upload(req, res, async function (err) {
      console.log(req.file)
      if (!req.file) {
        ProductTG.findByIdAndUpdate(id, req.body, { useFindAndModify: false }).then((data) => {
          if (!data) {
            fs.unlinkSync(req.file.path);
            return res.status(404).send({ message: `ไม่สามารถเเก้ไขสินค้านี้ได้!`, status: false });
          } else {
            return res.send({ message: "แก้ไขสินค้าสำเร็จ", status: true });
          }
        }).catch((err) => {
          fs.unlinkSync(req.file.path);
          return res.status(500).send({
            message: "มีบ่างอย่างผิดพลาด",
            status: false,
          });
        })
      } else {
        ProductTG.findByIdAndUpdate(id, { ...req.body, productTG_image: req.file.filename }).then((data) => {
          if (!data) {
            fs.unlinkSync(req.file.path);
            return res.status(404).send({
              status: false,
              message: `ไม่สามารถเเก้ไขสินค้านี้ได้!`,
            });
          } else {
            return res.status(201).send({
              message: "แก้ไขสินค้าสำเร็จ",
              status: true,
            });
          }
        }).catch((err) => {
          fs.unlinkSync(req.file.path);
          return res.status(500).send({
            message: "มีบ่างอย่างผิดพลาด",
            status: false,
          });
        })
      }
    })
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};