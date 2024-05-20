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
    cb(null, 'product' + "-" + Date.now() + file.originalname);
  },
});

exports.create = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("productTG_image");
    upload(req, res, async function (err) {
      console.log(req.file)
      if (!req.file) {
        const { error } = validate(req.body);
        if (error) {
          return res.status(400).send({ message: error.details[0].message, status: false });
        } else {
          const product = await ProductTG.findOne({
            productTG_name: req.body.productTG_name,
            productTG_barcode: req.body.productTG_barcode
          });
          if (product) {
            return res.status(409).send({
              status: false,
              message: "มีสินค้านี้ในระบบแล้ว",
            });
          } else {
            await new ProductTG({
              ...req.body,
            }).save();
            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
          }
        }
      } else {
        const { error } = validate(req.body);
        if (error) {
          fs.unlinkSync(req.file.path);
          return res.status(400).send({ message: error.details[0].message, status: false });
        } else {
          const product = await ProductTG.findOne({
            productTG_name: req.body.productTG_name,
            productTG_barcode: req.body.productTG_barcode
          });
          if (product) {
            fs.unlinkSync(req.file.path);
            return res.status(409).send({ status: false, message: "มีสินค้านี้ในระบบแล้ว", });
          } else {
            await new ProductTG({
              ...req.body,
              productTG_image: req.file.filename
            }).save();
            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
          }
        }
      }
    });
  } catch (error) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};