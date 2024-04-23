const { ProductArtworks, validate } = require("../../../model/service/artwork/artwork.model");
const multer = require("multer");
const fs = require("fs");
const request = require('request');
const axios = require('axios');
const path = require("path");
const uuidv4 = require("uuid");
const base64Img = require("base64-img");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './assets/artwork')
    },
    filename: (req, file, cb) => {
        cb(null, 'art' + '-' + file.originalname);
    },
});

// Create product
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
                            image: req.file.path
                        }).save();
                        return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
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
        const id = req.params.id;
        const product = await ProductArtworks.find();
        const products = product.filter(
            (el) => el.category === id,
        );
        if (!products)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: products });
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
            if (!req.file) {
                ProductArtworks.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
                    if (!data) {
                        fs.unlinkSync(req.file.path);
                        return res.status(404).send({
                            message: `ไม่สามารถเเก้ไขรายงานนี้ได้`,
                            status: false,
                        });
                    } else
                        res.send({
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
                ProductArtworks.findByIdAndUpdate(id, { ...req.body, image: req.file.path }, { useFindAndModify: false }).then((data) => {
                    if (!data) {
                        fs.unlinkSync(req.file.path);
                        return res.status(404).send({
                            status: false,
                            message: `Cannot update Advert with id=${id}. Maybe Advert was not found!`,
                        });
                    } else
                        return res.status(201).send({
                            message: "แก้ไขรายงานสำเร็จ.",
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

module.exports.getImage = async (req, res) => {
    try {
        const imgname = req.params.imgname;
        fs.readFile(`assets/artwork/${imgname}`, (err, data) => {
            if (err) {
                return res.status(403).send({ status: false, message: err })
            }
            let base64Image = Buffer.from(data, 'binary').toString('base64');
            return res.status(200).send(base64Image)
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}