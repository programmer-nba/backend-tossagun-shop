const { ProductArtworks, validate } = require("../../../model/service/artwork/artwork.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadFolder = path.join(__dirname, '../../../assets/artwork');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: (req, file, cb) => {
        cb(null, 'art' + file.originalname, + "-" + Date.now());
    },
});

// Create product
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            if (!req.file) {
                const { error } = validate(req.body);
                if (error) {
                    // fs.unlinkSync(req.file.path);
                    return res
                        .status(400)
                        .send({ message: error.details[0].message, status: false });
                } else {
                    const product = await ProductArtworks.findOne({
                        name: req.body.name,
                    });
                    if (product) {
                        // fs.unlinkSync(req.file.path);
                        return res.status(409).send({
                            status: false,
                            message: "มีสินค้านี้ในระบบแล้ว",
                        });
                    } else {
                        if (!req.file) {
                            await new ProductArtworks({
                                ...req.body,
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        } else {
                            await new ProductArtworks({
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
                    const product = await ProductArtworks.findOne({
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
                            await new ProductArtworks({
                                ...req.body,
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        } else {
                            await new ProductArtworks({
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
        // console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Get All product
module.exports.getProductAll = async (req, res) => {
    try {
        const product = await ProductArtworks.find();
        if (!product)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get product by id
module.exports.getProductById = async (req, res) => {
    try {
        const product = await ProductArtworks.findById(req.params.id);
        if (!product)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get product by categiry id
module.exports.getProductByCategoryId = async (req, res) => {
    try {
        const pipeline = [
            {
                $match: { "category": req.params.cateid },
            }
        ];
        const product = await ProductArtworks.aggregate(pipeline);
        if (!product)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Delete product
module.exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        ProductArtworks.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
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

// Update product
module.exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            if (!req.file) {
                ProductArtworks.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
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
                ProductArtworks.findByIdAndUpdate(id, { ...req.body, image: req.file.filename }, { useFindAndModify: false }).then((data) => {
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
        const imagePath = path.join(__dirname, '../../../assets/artwork', imgname);
        // return res.send(`<img src=${imagePath}>`);
        return res.sendFile(imagePath);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};