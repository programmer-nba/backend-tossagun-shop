const { ProductArtworks } = require("../../../model/service/artwork/artwork.model");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, 'art' + "-" + file.originalname);
    },
});

// Create product
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage, destination: 'uploads' }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            if (!req.file) {
                const new_product = await new ProductArtworks({
                    ...req.body,
                });
                if (!new_product)
                    return res.status(403).send({ status: false, message: "เพิ่มข้อมูลสินค้าไม่สำเร็จ" })
                new_product.save();
                return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
            } else if (err instanceof multer.MulterError) {
                return res.send(err);
            } else if (err) {
                return res.send(err);
            } else {
                const new_product = await new ProductArtworks({
                    ...req.body,
                    image: req.file.path,
                });
                if (!new_product)
                    return res.status(403).send({ status: false, message: "เพิ่มข้อมูลสินค้าไม่สำเร็จ" })
                new_product.save();
                return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
            }
        });
    } catch (error) {
        console.error(error);
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
            console.log(req.file);
            if (!req.file) {
                ProductArtworks.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
                    if (!data) {
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
                    return res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด",
                        status: false,
                    });
                });
            } else if (err instanceof multer.MulterError) {
                return res.send(err);
            } else if (err) {
                return res.send(err);
            } else {
                ProductArtworks.findByIdAndUpdate(id, { ...req.body, image: req.file.filename }, { useFindAndModify: false }).then((data) => {
                    if (!data) {
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