const { ProductActs, validate } = require("../../../model/service/act/act.model");
const multer = require('multer')
const fs = require('fs')
const path = require("path");

const uploadFolder = path.join(__dirname, '../../../assets/act');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: (req, file, cb) => {
        cb(null, 'act' + "-" + file.originalname);
    },
});

// Create ACT
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            if (!req.file) {
                const { error } = validate(req.body);
                if (error) {
                    fs.unlinkSync(req.file.path);
                    return res
                        .status(400)
                        .send({ message: error.details[0].message, status: false });
                } else {
                    const product = await ProductActs.findOne({
                        name: req.body.name,
                    });
                    if (product) {
                        fs.unlinkSync(req.file.path);
                        return res.status(409).send({
                            status: false,
                            message: "มีสินค้านี้ในระบบแล้ว",
                        });
                    } else {
                        if (!req.file) {
                            await new ProductActs({
                                ...req.body,
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        } else {
                            await new ProductActs({
                                ...req.body,
                                image: req.file.filename
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        }
                    }
                }
            } else {
                const { error } = validate(req.body);
                if (error) {
                    fs.unlinkSync(req.file.path);
                    return res
                        .status(400)
                        .send({ message: error.details[0].message, status: false });
                } else {
                    const product = await ProductActs.findOne({
                        name: req.body.name,
                    });
                    if (product) {
                        fs.unlinkSync(req.file.path);
                        return res.status(409).send({
                            status: false,
                            message: "มีสินค้านี้ในระบบแล้ว",
                        });
                    } else {
                        if (!req.file) {
                            await new ProductActs({
                                ...req.body,
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        } else {
                            await new ProductActs({
                                ...req.body,
                                image: req.file.filename
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Get All ACT
module.exports.getAll = async (req, res) => {
    try {
        const act = await ProductActs.find();
        if (!act)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: act });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get ACT by id
module.exports.getById = async (req, res) => {
    try {
        const act = await ProductActs.findById(req.params.id);
        if (!act)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: act });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Delete ACT
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        ProductActs.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
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

// Update ACT
module.exports.update = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file);
            if (!req.file) {
                const id = req.params.id;
                ProductActs.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
                    if (!data) {
                        res.status(404).send({
                            message: `ไม่สามารถเเก้ไขรายงานนี้ได้`,
                            status: false,
                        });
                    } else
                        res.send({
                            message: "แก้ไขรายงานนี้เรียบร้อยเเล้ว",
                            status: true,
                        });
                }).catch((err) => {
                    res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด",
                        status: false,
                    });
                });
            } else if (err instanceof multer.MulterError) {
                return res.send(err);
            } else if (err) {
                return res.send(err);
            } else {
                uploadFile(req, res);
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getImage = async (req, res) => {
    try {
        const imgname = req.params.imgname;
        const imagePath = path.join(__dirname, '../../../assets/act', imgname);
        // return res.send(`<img src=${imagePath}>`);
        return res.sendFile(imagePath);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};