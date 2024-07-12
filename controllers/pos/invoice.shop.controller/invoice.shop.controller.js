const { InvoiceShop, validate } = require("../../../model/pos/invoice.shop.model");
const { PreOrderShop } = require("../../../model/pos/preorder/preorder.shop.model");
const line = require("../../../lib/line.notify");

const dayjs = require("dayjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadFolder = path.join(__dirname, '../../../assets/invoice');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadFolder)
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});

module.exports.create = async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const new_invoice = new InvoiceShop(req.body);
		if (new_invoice) {
			for (let item of req.body.invoice_poshop) {
				const poshop = await PreOrderShop.findOne({ _id: item._id });
				poshop.poshop_cutoff = true;
				poshop.save();
				await delay(1000);
			}
			new_invoice.save();
			return res.status(201).send({ message: "ปิดการขายประจำวันสำเร็จ", status: true });
		}
	} catch (error) {
		console.log(error);
		return res.status(400).send({ message: error._message });
	}
};

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports.findInvoiceAll = async (req, res) => {
	try {
		const invoice = await InvoiceShop.find();
		if (!invoice)
			return res.status(401).send({ status: false, message: 'ดึงข้อมูลใบแจ้งหนี้ไม่สำเร็จ' });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลใบแจ้งหนี้สำเร็จ', data: invoice });
	} catch (error) {
		console.log(error);
		return res.status(400).send({ message: error._message });
	}
};

module.exports.findInvoiceById = async (req, res) => {
	try {
		const id = req.params.id;
		const invoice = await InvoiceShop.findOne({ _id: id });
		if (!invoice)
			return res.status(401).send({ status: false, message: 'ดึงข้อมูลใบแจ้งหนี้ไม่สำเร็จ' });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลใบแจ้งหนี้สำเร็จ', data: invoice });
	} catch (error) {
		console.log(error);
		return res.status(400).send({ message: error._message });
	}
};

module.exports.findInvoiceByShopId = async (req, res) => {
	try {
		const id = req.params.shopid;
		const pipelint = [
			{
				$match: { invoice_shop_id: id },
			}
		];
		const invoice = await InvoiceShop.aggregate(pipelint);
		if (!invoice)
			return res.status(401).send({ status: false, message: 'ดึงข้อมูลใบแจ้งหนี้ไม่สำเร็จ' });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลใบแจ้งหนี้สำเร็จ', data: invoice });
	} catch (error) {
		console.log(error);
		return res.status(400).send({ message: error._message });
	}
};

module.exports.updateInvoice = async (req, res) => {
	try {
		const id = req.params.id;
		let upload = multer({ storage: storage }).single("invoice_image");
		upload(req, res, async function (err) {
			console.log(req.file);
			if (!req.file) {
				InvoiceShop.findByIdAndUpdate(id, { ...req.body }, { useFindAndModify: false }).then((data) => {
					if (!data) {
						return res.status(404).send({
							status: false,
							message: `อัพเดทข้อมูลไม่สำเร็จ!`,
						});
					} else {
						return res.status(201).send({
							message: "อัพเดทข้อมูลสำเร็จ",
							status: true,
						});
					}
				}).catch((err) => {
					return res.status(500).send({
						message: "มีบ่างอย่างผิดพลาด",
						status: false,
					});
				})
			} else {
				InvoiceShop.findByIdAndUpdate(id, { ...req.body, invoice_image: req.file.filename }, { useFindAndModify: false }).then((data) => {
					if (!data) {
						return res.status(404).send({
							status: false,
							message: `อัพเดทข้อมูลไม่สำเร็จ!`,
						});
					} else {
						return res.status(201).send({
							message: "อัพเดทข้อมูลสำเร็จ",
							status: true,
						});
					}
				}).catch((err) => {
					return res.status(500).send({
						message: "มีบ่างอย่างผิดพลาด",
						status: false,
					});
				})
			}

		})
	} catch (error) {
		console.log(error);
		return res.status(400).send({ message: error._message });
	}
};

module.exports.getImage = async (req, res) => {
	try {
		const imgname = req.params.imgname;
		const imagePath = path.join(__dirname, '../../../assets/invoice', imgname);
		return res.sendFile(imagePath);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
}