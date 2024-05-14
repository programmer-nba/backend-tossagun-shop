const { ActCategorys, validate } = require("../../../model/service/act/category.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadFolder = path.join(__dirname, '../../../assets/act');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: function (req, file, cb) {
        cb(null, 'cate' + "-" + file.originalname);
    },
});

// Create category
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            const category = await ActCategorys.findOne({
                name: req.body.name,
            });
            if (category) {
                fs.unlinkSync(req.file.path);
                return res.status(409).send({
                    status: false,
                    message: "มีประเภทสินค้านี้ในระบบแล้ว",
                });
            } else {
                if (!req.file) {
                    await new ActCategorys({
                        ...req.body,
                    }).save();
                    return res.status(201).send({ message: "เพิ่มข้อมูลประเภทสินค้าทำเร็จ", status: true });
                } else {
                    await new ActCategorys({
                        ...req.body,
                        image: req.file.filename
                    }).save();
                    return res.status(201).send({ message: "เพิ่มข้อมูลประเภทสินค้าทำเร็จ", status: true });
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Get All category
module.exports.getCategoryAll = async (req, res) => {
    try {
        const category = await ActCategorys.find();
        if (!category)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get category by id
module.exports.getCategoryById = async (req, res) => {
    try {
        const category = await ActCategorys.findById(req.params.id);
        if (!category)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Delete category
module.exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        ActCategorys.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
            if (!data) {
                return res.status(404).send({ message: `ไม่สามารถลบรายงานนี้ได้`, status: false, });
            } else {
                return res.send({ message: "ลบรายงานนี้เรียบร้อยเเล้ว", status: true, });
            }
        }).catch((err) => {
            return res.status(500).send({ message: "ไม่สามารถลบรายงานนี้ได้", status: false, });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Update category
module.exports.updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            if (!req.file) {
                ActCategorys.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
                    if (!data) {
                        fs.unlinkSync(req.file.path);
                        return res.status(404).send({
                            message: `ไม่สามารถเเก้ไขรายงานนี้ได้`,
                            status: false,
                        });
                    } else
                        return res.send({
                            message: "แก้ไขรายงานนี้เรียบร้อยเเล้ว",
                            status: true,
                        });
                }).catch((err) => {
                    fs.unlinkSync(req.file.path);
                    return res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด",
                        status: false,
                    });
                });
            } else {
                ActCategorys.findByIdAndUpdate(id, { ...req.body, image: req.file.filename }, { useFindAndModify: false }).then((data) => {
                    if (!data) {
                        fs.unlinkSync(req.file.path);
                        return res.status(404).send({
                            status: false,
                            message: `Cannot update Advert with id=${id}. Maybe Advert was not found!`,
                        });
                    } else
                        return res.status(201).send({
                            message: "แก้ไขประเภทสินค้าสำเร็จ.",
                            status: true,
                        });
                }).catch((err) => {
                    fs.unlinkSync(req.file.path);
                    return res.status(500).send({
                        message: "Error updating Advert with id=" + id,
                        status: false,
                    });
                });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};