const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Jimp = require('jimp');
const QrCodeReader = require("qrcode-reader");
const axios = require("axios");

const { DataCheckSlip } = require("../model/slip/slip.model");

const uploadFolder = path.join(__dirname, '../assets/slip');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadFolder)
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '.jpg');
	},
});

router.post("/", async (req, res) => {
	try {
		let upload = multer({ storage: storage }).single("image_slip");
		upload(req, res, async function (err) {
			if (err) {
				// จัดการข้อผิดพลาดที่เกิดขึ้นใน multer
				return res.status(500).send({ status: false, message: "การอัปโหลดสลิปผิดพลาด", error: err.message });
			}

			// console.log(req.file)
			if (req.file) {
				const data = await fs.promises.readFile(req.file.path);

				// โหลดภาพด้วย Jimp
				const image = await Jimp.read(data);

				// สร้าง Promise ถอดรหัส QR code
				const code = await new Promise((reslove, reject) => {
					const qr = new QrCodeReader();
					qr.callback = (err, value) => {
						if (err) {
							return reject(err);
						}
						if (!value) {
							return reject(new Error("สลิปดังกล่าวไม่สามารถใช้งานได้ กรุณาติดต่อแอดมิน"));
						}
						reslove(value.result);
					};
					qr.decode(image.bitmap);
				});

				const value = {
					code: code,
				};

				// let status = false;
				let data_slip = null;
				for (let i = 0; i < 3; i++) {
					const resp = await axios.post(`${process.env.CHECK_SLIP}/check-slip`, value, {
						headers: {
							"Accept-Encoding": "gzip,deflate,compress",
							"Content-Type": "application/json"
						},
					});
					data_slip = resp.data;
				}

				// console.log(data_slip)
				if (data_slip.status === 'success') {
					const slip = await DataCheckSlip.findOne({ referenceNo: data_slip.data.referenceNo });
					if (slip) {
						fs.unlinkSync(req.file.path);
						const data = {
							"เลขทำรายการ": data_slip.data.referenceNo,
							"ผู้รับ": data_slip.data.toAccountName,
							"บัญชีผู้รับ": data_slip.data.toAccount,
							"จำนวนเงิน": data_slip.data.amount,
						};
						return res.status(403).send({ status: false, message: 'สลิปดังกล่าวถูกใช้งานแล้ว', data: data })
					} else {
						const new_data = new DataCheckSlip(data_slip.data);
						if (!new_data) {
							fs.unlinkSync(req.file.path);
							return res.status(403).send({ status: false, message: 'ทำรายการไม่สำเร็จ มีบางอย่างผิดพลาด' })
						} else {
							new_data.save();
							const data = {
								"เลขทำรายการ": new_data.referenceNo,
								"ผู้รับ": new_data.toAccountName,
								"บัญชีผู้รับ": new_data.toAccount,
								"จำนวนเงิน": new_data.amount,
							};
							return res.status(201).send({ status: true, message: 'สลิปดังกล่าวสามารถใช้งานได้', data: data })
						}
					}
				} else if (data_slip.status === 'error') {
					fs.unlinkSync(req.file.path);
					return res.status(404).send({ status: false, message: "ตรวจไม่พบสลิปดังกล่าว กรุณาติดต่อแอดมิน" })
				}
			} else {
				return res.status(400).send({ status: false, message: "กรุณาอัปโหลดไฟล์สลิป" });
			}
		})
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;