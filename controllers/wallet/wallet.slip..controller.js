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
const QrCodeReader = require("qrcode-reader");
const { DataCheckSlip } = require("../../model/slip/slip.model");

const uploadFolder = path.join(__dirname, '../../assets/wallet');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg');
    },
});

exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("slip_image");
        upload(req, res, async function (err) {
            const { error } = validate(req.body);
            if (error) {
                return res
                    .status(400)
                    .send({ message: error.details[0].message, status: false });
            } else {
                // const slip = await checkSlipData(req.file.path, req.body.amount);
                const invoice = await invoiceNumber();

                if (req.file) {
                    const data = await fs.promises.readFile(req.file.path);
                    // โหลดภาพด้วย Jimp
                    const image = await Jimp.read(data);
                    // สร้าง Promise ถอดรหัส QR code
                    const code = await new Promise((reslove, reject) => {
                        const qr = new QrCodeReader();
                        qr.callback = (err, value) => {
                            if (err) {
                                console.error(err);
                            }
                            if (!value) {
                                return res.status(408).send({ status: false, message: "สลิปดังกล่าวไม่สามารถใช้งานได้ กรุณาติดต่อแอดมิน" })
                            }

                            reslove(value.result);
                        };
                        qr.decode(image.bitmap);
                    });

                    const value = {
                        code: code,
                    };

                    let status = false;
                    let data_slip = null;

                    while (!status) {
                        const resp = await axios.post(`${process.env.CHECK_SLIP}/check-slip`, value, {
                            headers: {
                                "Accept-Encoding": "gzip,deflate,compress",
                                "Content-Type": "application/json"
                            },
                        });

                        if (resp.data.status === 'success') {
                            status = true;
                            data_slip = resp.data;
                            console.log('ดึงข้อมูลสำเร็จ')
                        }
                    }

                    const amount = Number(req.body.amount);

                    if (data_slip.status !== 'success') {
                        fs.unlinkSync(req.file.path);
                        return res.status(403).send({ status: false, message: 'กรุณาทำรายการใหม่อีกครั้ง หรือติดต่อแอดมิน' })
                    }

                    if (data_slip.data.amount !== amount) {
                        fs.unlinkSync(req.file.path);
                        return res.status(403).send({ status: false, message: 'ทำรายการไม่สำเร็จ ยอดเงินไม่ตรงกัน' })
                    }

                    console.log(data_slip.data.toAccount)

                    if (data_slip.data.toAccount !== "xxx-x-x3295-x" && // k-plus
                        data_slip.data.toAccount !== "xxx-xxx295-1" && // scb
                        data_slip.data.toAccount !== "816-2-xxx951" && // bangkok
                        data_slip.data.toAccount !== "xxx-2-83295-x" && // krungsri
                        data_slip.data.toAccount !== "xxx-x-xx295-1" && // krungthai & ttb
                        data_slip.data.toAccount !== "81xxxxx2951" // mymo
                    ) {
                        fs.unlinkSync(req.file.path);
                        return res.status(403).send({ status: false, message: 'ทำรายการไม่สำเร็จ บัญชีผู้รับไม่ถูกต้อง' })
                    }

                    const slip = await DataCheckSlip.findOne({ referenceNo: data_slip.data.referenceNo });
                    if (slip) {
                        fs.unlinkSync(req.file.path);
                        return res.status(403).send({ status: false, message: 'สลิปดังกล่าวถูกใช้งานแล้ว' })
                    }

                    const new_data = new DataCheckSlip(data_slip.data);
                    // console.log(new_data)
                    if (new_data) {
                        new_data.save();
                        if (req.body.payment_type === 'One Stop Platform') {
                            const member = await Members.findById(req.decoded._id);
                            await new TopupWallet({
                                ...req.body,
                                invoice: invoice,
                                maker_id: req.decoded._id,
                                detail: req.file.filename,
                                status: "รายการสำเร็จ",
                                employee: `เช็คสลิปอัตโนมัติ ${dayjs(Date.now()).format("DD/MM/YYYY เวลา HH:mm:ss น.")}`,
                                timestamp: dayjs(Date.now()).format(),
                            }).save();

                            const wallet = member.wallet;
                            const new_wallet = member.wallet + amount;
                            member.wallet = new_wallet;
                            member.save();

                            const wallet_history = {
                                maker_id: req.decoded._id,
                                orderid: invoice,
                                type: "เงินเข้า",
                                category: "Wallet",
                                before: wallet,
                                after: new_wallet,
                                amount: amount,
                                name: `เติมเงินเข้าระบบใบเสร็จเลขที่ ${invoice}`,
                                timestamp: dayjs(Date.now()).format(""),
                            };

                            await WalletHistory.create(wallet_history);
                            return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
                        } else {
                            const shop = await Shops.findById(req.decoded.shop_id);
                            await new TopupWallet({
                                ...req.body,
                                invoice: invoice,
                                maker_id: req.decoded._id,
                                shop_id: req.decoded.shop_id,
                                detail: req.file.filename,
                                status: "รายการสำเร็จ",
                                employee: `เช็คสลิปอัตโนมัติ ${dayjs(Date.now()).format("DD/MM/YYYY เวลา HH:mm:ss น.")}`,
                                timestamp: dayjs(Date.now()).format(),
                            }).save();

                            const wallet = shop.shop_wallet;
                            const new_wallet = shop.shop_wallet + amount;
                            shop.shop_wallet = new_wallet;
                            shop.save();

                            const wallet_history = {
                                maker_id: req.decoded._id,
                                shop_id: req.decoded.shop_id,
                                orderid: invoice,
                                type: "เงินเข้า",
                                category: "Wallet",
                                before: wallet,
                                after: new_wallet,
                                amount: amount,
                                name: `เติมเงินเข้าระบบใบเสร็จเลขที่ ${invoice}`,
                                timestamp: dayjs(Date.now()).format(""),
                            };
                            await WalletHistory.create(wallet_history);
                            return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
                        }
                    }
                } else {
                    return res.status(404).send({ status: false, message: 'กรุณาแนบรูปภาพสลิปโอนเงิน' })
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