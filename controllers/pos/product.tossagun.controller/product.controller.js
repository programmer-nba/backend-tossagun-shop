const {ProductTG, validate} = require("../../../model/pos/product/product.tossagun.model");

exports.findAll = async (req, res) => {
  try {
    const product = await ProductTG.find();
    if (product) {
      return res.status(200).send({data: product, status: true});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ดึงข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    ProductTG.findById(id)
      .then((data) => {
        if (!data)
          return res
            .status(404)
            .send({message: "ไม่สามารถหารายงานนี้ได้", status: false});
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

exports.getByBarcode = async (req, res) => {
  try {
    const barcode = req.params.barcode;
    const product = await ProductTG.findOne({productTG_barcode: barcode});
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
    ProductTG.findByIdAndDelete(id, {useFindAndModify: false})
      .then((data) => {
        if (!data) {
          return res.status(404).send({
            message: `ไม่สามารถลบรายงานนี้ได้`,
            status: false,
          });
        } else {
          return res.send({
            message: "ลบรายงานนี้เรียบร้อยเเล้ว",
            status: true,
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          message: "ไม่สามารถลบรายงานนี้ได้",
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

exports.findByCredit = async (req, res) => {
  try {
    const product = await ProductTG.find({productTG_status_type: "เครดิต"});
    if (product) {
      return res.status(200).send({status: true, data: product});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ดึงข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};
