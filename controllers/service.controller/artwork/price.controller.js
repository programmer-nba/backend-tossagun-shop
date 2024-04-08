const { PriceArtworks, validate } = require("../../../model/service/artwork/price.model")

module.exports.create = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message, status: false })
        const price = await PriceArtworks.create(req.body);
        if (price)
            return res.status(200).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getPriceAll = async (req, res) => {
    try {
        const price = await PriceArtworks.find();
        if (!price)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: price });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

module.exports.getPriceById = async (req, res) => {
    try {
        const price = await PriceArtworks.findById(req.params.id);
        if (!price)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: price });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

module.exports.getPriceByProductId = async (req, res) => {
    try {
        const price = await PriceArtworks.find();
        const prices = price.filter(
            (el) => el.product_id === req.params.id
        );
        if (!prices)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: prices });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

module.exports.deletePrice = async (req, res) => {
    try {
        const id = req.params.id;
        PriceArtworks.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
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

module.exports.updatePrice = async (req, res) => {
    try {
        const id = req.params.id;
        PriceArtworks.findByIdAndUpdate(id, { ...req.body }, { useFindAndModify: false }).then((data) => {
            if (!data) {
                res.status(404).send({
                    status: false,
                    message: `Cannot update Advert with id=${id}. Maybe Advert was not found!`,
                });
            } else
                res.status(201).send({
                    message: "แก้ไขรายงานสำเร็จ.",
                    status: true,
                });
        }).catch((err) => {
            res.status(500).send({
                message: "Error updating Advert with id=" + id,
                status: false,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


