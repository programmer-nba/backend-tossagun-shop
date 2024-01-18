const {
  ProductsTossaguns,
  validate,
} = require("../../../model/pos/product.tossagun.model");

exports.findAll = async (req, res) => {
  try {
    console.log("Get All Product NBA");
    const product = await ProductsTossaguns.find();
    if (product) {
      return res.status(200).send({data: product, status: true});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ดึงข้อมูลไม่สำเร็จ"});
    }
  } catch (error) {
    res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    ProductsTossaguns.findById(id)
      .then((data) => {
        if (!data)
          res
            .status(404)
            .send({message: "ไม่สามารถหารายงานนี้ได้", status: false});
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

exports.getByBarcode = async (req, res) => {
  try {
    const barcode = req.params.barcode;
    const product = await ProductsTossaguns.findOne({product_barcode: barcode});
    if (product) {
      return res.status(200).send({status: true, data: product});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ไม่พบข้อมูลสินค้า"});
    }
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    ProductsTossaguns.findByIdAndRemove(id, {useFindAndModify: false})
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: `ไม่สามารถลบรายงานนี้ได้`,
            status: false,
          });
        } else {
          res.send({
            message: "ลบรายงานนี้เรียบร้อยเเล้ว",
            status: true,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบรายงานนี้ได้",
          status: false,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "ไม่สามารถลบรายงานนี้ได้",
      status: false,
    });
  }
};
