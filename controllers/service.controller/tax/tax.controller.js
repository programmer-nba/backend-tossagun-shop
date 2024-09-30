const multer = require('multer')
const fs = require('fs')
const path = require("path");
const dayjs = require("dayjs");

const { Shops } = require('../../../model/pos/shop.model');

const { ProductTaxs, validate } = require('../../../model/service/tax/tax.model');
const { OrderServiceModels } = require('../../../model/service/order/order.model');

const uploadFolder = path.join(__dirname, '../../../assets/tax');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadFolder)
	},
	filename: (req, file, cb) => {
		cb(null, 'tax' + '-' + Date.now());
	},
});

module.exports.create = async (req, res) => {
	try {
		let upload = multer({ storage: storage }).single("image");
		upload(req, res, async function (err) {
			console.log(req.file);
			if (!req.file) {
				const { error } = validate(req.body);
				if (error) {
					return res
						.status(400)
						.send({ message: error.details[0].message, status: false });
				} else {
					const product = await ProductTaxs.findOne({ name: req.body.name });
					if (product) {
						return res.status(409).send({
							status: false,
							message: "มีสินค้านี้ในระบบแล้ว",
						});
					} else {
						await new ProductTaxs({
							...req.body,
						}).save();
						return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
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
					const product = await ProductTaxs.findOne({
						name: req.body.name,
					});
					if (product) {
						fs.unlinkSync(req.file.path);
						return res.status(409).send({
							status: false,
							message: "มีสินค้านี้ในระบบแล้ว",
						});
					} else {
						await new ProductTaxs({
							...req.body,
							image: req.file.filename
						}).save();
						return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
					}
				}
			}
		})
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getProductAll = async (req, res) => {
	try {
		const product = await ProductTaxs.find();
		if (!product)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product })
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getProductById = async (req, res) => {
	try {
		const id = req.params.id;
		const product = await ProductTaxs.findOne({ _id: id });
		if (!product)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product })
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

// Delete
module.exports.delete = async (req, res) => {
	try {
		const id = req.params.id;
		ProductTaxs.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
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

// Update
module.exports.update = async (req, res) => {
	try {
		const id = req.params.id;
		let upload = multer({ storage: storage }).single("image");
		upload(req, res, async function (err) {
			console.log(req.file);
			if (!req.file) {
				ProductTaxs.findByIdAndUpdate(id, { ...req.body }, { useFindAndModify: false }).then((data) => {
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
					res.status(500).send({
						message: "มีบ่างอย่างผิดพลาด",
						status: false,
					});
				});
			} else {
				ProductTaxs.findByIdAndUpdate(id, { ...req.body, image: req.file.filename }, { useFindAndModify: false }).then((data) => {
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
					res.status(500).send({
						message: "มีบ่างอย่างผิดพลาด",
						status: false,
					});
				});
			}
		})
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getImage = async (req, res) => {
	try {
		const imgname = req.params.imgname;
		const imagePath = path.join(__dirname, '../../../assets/tax', imgname);
		// return res.send(`<img src=${imagePath}>`);
		return res.sendFile(imagePath);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.createOrder = async (req, res) => {
	try {
		if (req.body.shop_type === 'One Stop Platform') {
			console.log('ยังไม่สามารถดำเนินการได้')
		} else {
			await checkEmployee(req, res);
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

const checkEmployee = async (req, res) => {
	try {
		const shop = await Shops.findOne({ _id: req.body.shop_id });
		if (!shop) {
			return res.status(403).send({ message: "ไม่พบข้อมูลร้านค้า" });
		} else {
			if (shop.shop_status === false) {
				return res.status(403).send({ message: "ร้านค้าดังกล่าวไม่สามารถทำรายการได้" });
			}

			const invoice = await GenerateRiceiptNumber(req.body.shop_type, '', '');

			const data = {
				invoice: invoice,
				maker_id: req.body.maker_id,
				shop_id: req.body.shop_id,
				platform: req.body.platform,
				customer_name: req.body.customer_name,
				customer_tel: req.body.customer_tel,
				customer_address: req.body.customer_address,
				customer_iden: req.body.customer_iden,
				customer_line: req.body.customer_line,

				shop_type: req.body.shop_type,
				paymenttype: req.body.paymenttype,
				servicename: "TAX",

				discount: req.body.discount,
				moneyreceive: req.body.moneyreceive,
				employee: req.body.employee,
				change: req.body.change,
				status: [{
					name: "รอการตรวจสอบราคา",
					timestamp: dayjs(Date.now()).format(""),
				}],
				timestamp: dayjs(Date.now()).format(""),
			};

			console.log(data)
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

async function GenerateRiceiptNumber(shop_type, id, number) {
	if (shop_type === 'One Stop Shop') {
		const pipelint = [
			{
				$match: {
					$and: [
						{ shop_type: shop_type },
						{ shop_id: id },
					],
				},
			},
			{
				$group: { _id: 0, count: { $sum: 1 } },
			},
		];
		const count = await OrderServiceModels.aggregate(pipelint);
		const countValue = count.length > 0 ? count[0].count + 1 : 1;
		const data = `TG${dayjs(Date.now()).format("YYMM")}${number}${countValue.toString().padStart(3, "0")}`;
		return data;
	} else {
		const pipelint = [
			{
				$group: { _id: 0, count: { $sum: 1 } },
			},
		];
		const count = await OrderServiceModels.aggregate(pipelint);
		const countValue = count.length > 0 ? count[0].count + 1 : 1;
		const data = `TGS${dayjs(Date.now()).format("YYMM")}${countValue.toString().padStart(3, "0")}`;
		return data;
	}
}