const { TopupWallet, validate } = require("../../model/wallet/topup.wallet.model");
const { WalletHistory } = require("../../model/wallet/wallet.history.model");
const { Members } = require("../../model/user/member.model");
const multer = require("multer");
const fs = require("fs");
const dayjs = require("dayjs");
const path = require("path");
const line = require("../../lib/line.notify");
const { Shops } = require("../../model/pos/shop.model");

const uploadFolder = path.join(__dirname, '../../assets/wallet');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("slip_image");
        upload(req, res, async function (err) {
            console.log(req.file)
            const { error } = validate(req.body);
            if (error) {
                // fs.unlinkSync(req.file.path);
                return res
                    .status(400)
                    .send({ message: error.details[0].message, status: false });
            } else {
                if (!req.file) {
                    if (req.body.payment_type === 'One Stop Platform') {
                        const member = await Members.findById(req.decoded._id);
                        await new TopupWallet({
                            ...req.body,
                            maker_id: req.decoded._id,
                        }).save();
                        const message = `
แจ้งเติมเงินเข้าระบบ : 
เลขที่ทำรายการ: ${req.body.invoice}
ชื่อ: ${member.fristname} ${member.lastname}
จำนวน: ${req.body.amount} บาท`;
                        await line.linenotify(message);
                        return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
                    } else {
                        const shop = await Shops.findById(req.decoded.shop_id);
                        await new TopupWallet({
                            ...req.body,
                            maker_id: req.decoded._id,
                            shop_id: req.decoded.shop_id,
                        }).save();
                        const message = `
แจ้งเติมเงินเข้าระบบ 
เลขที่ทำรายการ: ${req.body.invoice}
ชื่อ: ${shop.shop_name_main} ${shop.shop_name_second}
จำนวน: ${req.body.amount} บาท`;
                        await line.linenotify(message);
                        return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
                    }
                } else {
                    if (req.body.payment_type === 'One Stop Platform') {
                        const member = await Members.findById(req.decoded._id);
                        console.log(member)
                        await new TopupWallet({
                            ...req.body,
                            maker_id: req.decoded._id,
                            detail: {
                                image_slip: req.file.filename
                            },
                        }).save();
                        const message = `
แจ้งเติมเงินเข้าระบบ : 
เลขที่ทำรายการ: ${req.body.invoice}           
ชื่อ: ${member.fristname} ${member.lastname}
จำนวน: ${req.body.amount} บาท`;
                        await line.linenotify(message);
                        return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
                    } else {
                        const shop = await Shops.findById(req.decoded.shop_id);
                        await new TopupWallet({
                            ...req.body,
                            maker_id: req.decoded._id,
                            shop_id: req.decoded.shop_id,
                            detail: {
                                image_slip: req.file.filename
                            },
                        }).save();
                        const message = `
แจ้งเติมเงินเข้าระบบ : 
เลขที่ทำรายการ: ${req.body.invoice}
ชื่อ: ${shop.shop_name_main} ${shop.shop_name_second}
จำนวน: ${req.body.amount} บาท`;
                        await line.linenotify(message);
                        return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
                    }
                }
            }
        });
    } catch (err) {
        console.log(error)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        if (
            !(
                req.body.status !== "รอตรวจสอบ" ||
                req.body.status !== "ตรวจสอบสำเร็จ" ||
                req.body.status !== "ยกเลิก"
            )
        ) {
            return res.status(400).send({
                status: false,
                message:
                    "status : จะต้องเป็น รอตรวจสอบ, ตรวจสอบสำเร็จ, ยกเลิก เท่านั้น",
            });
        }
        if (req.body.status === "ยกเลิก" && !req.body.remark) {
            return res.status(400).send({
                status: false,
                message: "กรณียกเลิก จะต้องมี Remark หรือ เหตุผลที่ยกเลิก",
            });
        } else {
            TopupWallet.findByIdAndUpdate(id, req.body, { useFindAndModify: false }).then((data) => {
                if (!data) {
                    return res.status(404).send({
                        status: false,
                        message: `ไม่สารมารถแก้ไขรายงานเติมเงินนี้ได้!`,
                    });
                } else {
                    return res.status(201).send({
                        message: "แก้ไขรายเงินเติมเงินสำเร็จ",
                        status: true,
                    });
                }
            }).catch((err) => {
                return res.status(500).send({
                    message: "มีบ่างอย่างผิดพลาด",
                    status: false,
                });
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

module.exports.getImage = async (req, res) => {
    try {
        const imgname = req.params.imgname;
        const imagePath = path.join(__dirname, '../../assets/wallet', imgname);
        // return res.send(`<img src=${imagePath}>`);
        return res.sendFile(imagePath);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};