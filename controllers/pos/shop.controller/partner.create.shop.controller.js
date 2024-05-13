const { Shops, validate } = require("../../../model/pos/shop.model")
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
        cb(null, 'shop' + "-" + file.originalname);
    },
});

// Create category
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("shop_logo");
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
                    const shop = await Shops.findOne({
                        shop_name_second: req.body.shop_name_second,
                        shop_number: req.body.shop_number,
                    });
                    if (shop) {
                        fs.unlinkSync(req.file.path);
                        return res.status(409).send({ status: false, message: "รหัสร้าน หรือ ชื่อร้านค้าซ้ำในระบบ", });
                    } else {
                        const shop_number = await GenerateNumber(req.body.shop_type);
                        await new Shops({
                            ...req.body,
                            shop_number: shop_number,
                        }).save();
                        return res.status(201).send({ message: "เพิ่มร้านค้าสำเร็จ", status: true });
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
                    const shop = await Shops.findOne({
                        shop_name_second: req.body.shop_name_second,
                        shop_number: req.body.shop_number,
                    });
                    if (shop) {
                        fs.unlinkSync(req.file.path);
                        return res.status(409).send({ status: false, message: "รหัสร้าน หรือ ชื่อร้านค้าซ้ำในระบบ", });
                    } else {
                        const shop_number = await GenerateNumber(req.body.shop_type);
                        await new Shops({
                            ...req.body,
                            shop_number: shop_number,
                            shop_logo: req.file.filename,
                        }).save();
                        return res.status(201).send({ message: "เพิ่มร้านค้าสำเร็จ", status: true });
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

async function GenerateNumber(shop_type) {
    if (shop_type === 'One Stop Service') {
        const pipelint = [
            {
                $match: { shop_type: shop_type },
            },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const count = await Shops.aggregate(pipelint);
        const countValue = count.length > 0 ? count[0].count + 1 : 1;
        const data = `TGSS${countValue.toString().padStart(5, "0")}`;
        return data;
    } else if (shop_type === 'One Stop Shop') {
        const pipelint = [
            {
                $match: { shop_type: shop_type },
            },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const count = await Shops.aggregate(pipelint);
        const countValue = count.length > 0 ? count[0].count + 1 : 1;
        const data = `TGS${countValue.toString().padStart(5, "0")}`;
        return data;
    }
};