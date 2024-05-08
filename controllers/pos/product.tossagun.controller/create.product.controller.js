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
    cb(null, Date.now() + "-");
  },
});

exports.create = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("productTG_image");
    upload(req, res, async function (err) {
      console.log(req.file)
    });


  } catch (error) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};