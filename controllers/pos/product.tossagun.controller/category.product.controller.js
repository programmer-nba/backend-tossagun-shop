const {Categorys, validate} = require("../../../model/pos/category.model");

exports.create = async (req, res) => {
  try {
    const {error} = validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({status: false, message: error.details[0].message});
    }
    const checkcategory = await Categorys.find({name: req.body.name});
    if (checkcategory.length > 0) {
      return res
        .status(400)
        .send({status: false, message: "มีหมวดหมู่นี้อยู่ในระบบเรียบร้อยแล้ว"});
    }
    const category = await Categorys.create(req.body);
    if (category) {
      return res.status(201).send({status: true, data: category});
    } else {
      return res
        .status(400)
        .send({status: false, message: "สร้างรายการไม่สำเร็จ"});
    }
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลา"});
  }
};

exports.getAll = async (req, res) => {
  try {
    const category = await Categorys.find();
    if (category) {
      return res.status(200).send({status: true, data: category});
    } else {
      return res.status(400).send({message: "ดึงข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Categorys.findById(id);
    if (category) {
      return res.status(200).send({status: true, data: category});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ดึงข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.body.name === undefined) {
      return res
        .status(400)
        .send({status: false, message: "กรุณากรอกชื่อที่ต้องการแก้ไข"});
    }
    const category = await Categorys.findByIdAndUpdate(id, req.body);
    if (category) {
      return res.status(200).send({status: true, message: "แก้ไขข้อมูลสำเร็จ"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "แก้ไขข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Categorys.findByIdAndDelete(id);
    if (category) {
      return res
        .status(200)
        .send({status: true, message: "ลบข้อมูลเรียบร้อยแล้ว"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ลบข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};
