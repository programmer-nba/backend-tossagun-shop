const { TopupWallet, validate } = require("../../model/wallet/topup.wallet.model");
const { WalletHistory } = require("../../model/wallet/wallet.history.model");
const { Members } = require("../../model/user/member.model");
const multer = require("multer");
const fs = require("fs");
const dayjs = require("dayjs");
const path = require("path");
const line = require("../../lib/line.notify");
const { Shops } = require("../../model/pos/shop.model");
const axios = require("axios");
const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const FormData = require('form-data');

const uploadFolder = path.join(__dirname, '../../assets/wallet');
fs.mkdirSync(uploadFolder, { recursive: true });

const uploadFolderTest = path.join(__dirname, '../../assets/test');
fs.mkdirSync(uploadFolderTest, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: function (req, file, cb) {
        cb(null, 'act' + Date.now() + file.originalname);
    },
});

const storageTest = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolderTest)
    },
    filename: function (req, file, cb) {
        cb(null, "Test" + Date.now() + file.originalname);
    },
})

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
                // const slip = await checkSlipData(req.file.path, req.body.amount);
                const invoice = await invoiceNumber();
                if (req.file) {
                    if (req.body.payment_type === 'One Stop Platform') {
                        const member = await Members.findById(req.decoded._id);
                        await new TopupWallet({
                            ...req.body,
                            invoice: invoice,
                            maker_id: req.decoded._id,
                            detail: req.file.filename,
                            timestamp: dayjs(Date.now()).format(),
                        }).save();
                        const message = `
แจ้งเติมเงินเข้าระบบ : 
เลขที่ทำรายการ: ${invoice}
ชื่อ: ${member.fristname} ${member.lastname}
จำนวน: ${req.body.amount} บาท

ตรวจสอบได้ที่ : https://shop-admin.tossaguns.com/`;
                        await line.linenotify(message);
                        return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
                    } else {
                        const shop = await Shops.findById(req.decoded.shop_id);
                        await new TopupWallet({
                            ...req.body,
                            invoice: invoice,
                            maker_id: req.decoded._id,
                            shop_id: req.decoded.shop_id,
                            detail: req.file.filename,
                            timestamp: dayjs(Date.now()).format(),
                        }).save();
                        const message = `
แจ้งเติมเงินเข้าระบบ 
เลขที่ทำรายการ: ${invoice}
ชื่อ: ${shop.shop_name_main} (สาขา ${shop.shop_name_second})
จำนวน: ${req.body.amount} บาท

ตรวจสอบได้ที่ : https://shop-admin.tossaguns.com/`;
                        await line.linenotify(message);
                        return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
                    }
                } else {
                    return res.status(403).send({ message: "ไม่สามารถทำรายการได้", status: false });
                }
            }
        });
    } catch (err) {
        console.log(err)
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


module.exports.checkClip = async (req, res) => {
    try {
        let upload = multer({ storage: storageTest }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            const formData = new FormData();
            formData.append("image", fs.createReadStream(req.file.path));
            const resq = await axios.post(`https://9464-2001-fb1-148-1198-c5b2-7c6c-f09b-d8de.ngrok-free.app/detect-slip`, formData);
            console.log(resq);
            if (resq.data.status === 'error') {
                return res.status(403).send({ status: false, message: resq.data.message })
            }
            if (resq.data.status === 'success') {

            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

async function checkSlipData(data, amount) {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(data));
    const resq = await axios.post(`https://9464-2001-fb1-148-1198-c5b2-7c6c-f09b-d8de.ngrok-free.app/detect-slip`, formData);
    if (resq.data.status === 'error') {
        return false;
    }
    if (resq.data.status === 'success') {
        const transaction = resq.data.data.referenceNo;
        const wallet = await TopupWallet.findOne({ transaction: transaction });
        if (wallet) {
            return false;
        }
        return resq.data.data.referenceNo;
        // if (
        // resq.data.data.amount === amount &&
        // resq.data.data.toAccountName === 'บริษัท ทศกัณฐ์ ดิจิตอล นิวเจนเนอเรชั่น จำกัด' && 
        // resq.data.data.receivingBankName === 'กสิกรไทย' &&
        // resq.data.data.toAccount === 'xxx-x-x8293-x'
        // ) {
        // return resq.data.data.referenceNo;
        // }
    }
};

async function invoiceNumber() {
    data = `TSW`
    let random = Math.floor(Math.random() * 100000000000)
    const combinedData = data + random;
    const findInvoice = await TopupWallet.find({ invoice: combinedData })

    while (findInvoice && findInvoice.length > 0) {
        // สุ่ม random ใหม่
        random = Math.floor(Math.random() * 100000000000);
        combinedData = data + random;

        // เช็คใหม่
        findInvoice = await TopupWallet.find({ invoice: combinedData });
    }

    console.log(combinedData);
    return combinedData;
};