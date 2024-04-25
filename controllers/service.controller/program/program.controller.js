const { ProductPrograms, validate } = require("../../../model/service/program/program.model")
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './assets/program')
    },
    filename: function (req, file, cb) {
        cb(null, 'program' + "-" + file.originalname);
    },
});

// Create Media
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            const { error } = validate(req.body);
            if (error) {
                fs.unlinkSync(req.file.path);
                return res
                    .status(400)
                    .send({ message: error.details[0].message, status: false });
            } else {
                const product = await ProductPrograms.findOne({
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
                        await new ProductPrograms({
                            ...req.body,
                        }).save();
                        return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                    } else {
                        await new ProductPrograms({
                            ...req.body,
                            image: req.file.filename
                        }).save();
                        return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Get All Media
module.exports.getMediaAll = async (req, res) => {
    try {
        const media = await ProductPrograms.find();
        if (!media)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: media });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get Media by id
module.exports.getMediaById = async (req, res) => {
    try {
        const media = await ProductPrograms.findById(req.params.id);
        if (!media)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: media });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};


// Delete Media
module.exports.deleteMedia = async (req, res) => {
    try {
        const id = req.params.id;
        ProductPrograms.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
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

// Update Media
module.exports.updateMedia = async (req, res) => {
    try {
        const id = req.params.id;
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            if (!req.file) {
                ProductPrograms.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
                    if (!data) {
                        fs.unlinkSync(req.file.path);
                        return res.status(404).send({
                            message: `ไม่สามารถเเก้ไขสินค้านี้ได้!`,
                            status: false,
                        });
                    } else
                        res.send({
                            message: "แก้ไขสินค้าสำเร็จ",
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
                ProductPrograms.findByIdAndUpdate(id, { ...req.body, image: req.file.filename }, { useFindAndModify: false }).then((data) => {
                    if (!data) {
                        fs.unlinkSync(req.file.path);
                        return res.status(404).send({
                            status: false,
                            message: `ไม่สามารถเเก้ไขสินค้านี้ได้!`,
                        });
                    } else
                        return res.status(201).send({
                            message: "แก้ไขสินค้าสำเร็จ",
                            status: true,
                        });
                }).catch((err) => {
                    fs.unlinkSync(req.file.path);
                    return res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด",
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

module.exports.getImage = async (req, res) => {
    try {
        const imgname = req.params.imgname;
        const imagePath = path.join(__dirname, '../../../assets/program', imgname);
        // return res.send(`<img src=${imagePath}>`);
        return res.sendFile(imagePath);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};