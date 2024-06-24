const { Invests, validate } = require("../../../model/pos/invest.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

const uploadFolder = path.join(__dirname, '../../../assets/invest');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadFolder)
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + file.originalname);
	},
});

module.exports.invset = async (req, res) => {
	try {
		let upload = multer({ storage: storage }).array("invest_image", 20);
		upload(req, res, async function (err) {
			if (!req.files) {
				const { error } = validate(req.body);
				if (error) {
					return res.status(400).send({ message: error.details[0].message, status: false });
				} else {
					const invoice = await invoiceNumber();
					const { error } = validate(req.body);
					if (error) {
						return res.status(400).send({ message: error.details[0].message, status: false });
					}
					const data = {
						...req.body,
						invoice: invoice,
						status: [{
							status: "รอตรวจสอบ",
							timestamp: dayjs(Date.now()).format(""),
						}],
						timestamp: dayjs(Date.now()).format(""),
					};
					const invest = await Invests.create(data);
					return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true, data: invest });
				}
			} else {
				const filePath = [];
				const amount = req.files.length;
				for (let i = 0; i < amount; i++) {
					filePath.push(req.files[i].filename)
				}
				const invoice = await invoiceNumber();
				const { error } = validate(req.body);
				if (error) {
					return res.status(400).send({ message: error.details[0].message, status: false });
				}
				const data = {
					...req.body,
					invoice: invoice,
					detail: filePath,
					status: [{
						status: "รอตรวจสอบ",
						timestamp: dayjs(Date.now()).format(""),
					}],
					timestamp: dayjs(Date.now()).format(""),
				};
				const invest = await Invests.create(data);
				return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true, data: invest });
			}
		})
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

async function invoiceNumber() {
	data = `INV`
	let random = Math.floor(Math.random() * 100000000000)
	const combinedData = data + random;
	const findInvoice = await Invests.find({ invoice: combinedData })
	while (findInvoice && findInvoice.length > 0) {
		// สุ่ม random ใหม่
		random = Math.floor(Math.random() * 100000000000);
		combinedData = data + random;
		// เช็คใหม่
		findInvoice = await Invests.find({ invoice: combinedData });
	}
	console.log(combinedData);
	return combinedData;
};

module.exports.approve = async (req, res) => {
	try {
		const id = req.params.id;
		const invest = await Invests.findById(id);
		if (!invest) {
			return res.status(403).send({ status: false, message: 'ไม่พบรายการดังกล่าว' });
		} else {
			const e = invest.status[invest.status.length - 1].status;
			if (e === 'รอตรวจสอบ') {
				const status = {
					status: 'ผ่านการอนุมัติ',
					timestamp: dayjs(Date.now()).format(""),
				};
				invest.status.push(status);
				invest.employee = req.body.employee;
				invest.save();
				return res.status(200).send({ status: true, message: 'อนุมัติผู้ลงทุนสำเร็จ' })
			} else {
				return res.status(403).send({ status: false, message: 'รายการดังกล่าวไม่สามารถอนุมัติได้ หรือรายการดังกล่าวผ่านการอนุมัติแล้ว' })
			}
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.cancel = async (req, res) => {
	try {
		const id = req.params.id;
		const invest = await Invests.findById(id);
		if (!invest) {
			return res.status(403).send({ status: false, message: 'ไม่พบรายการดังกล่าว' });
		} else {
			const e = invest.status[invest.status.length - 1].status;
			if (e === 'รอตรวจสอบ') {
				const status = {
					status: 'ไม่ผ่านการอนุมัติ',
					timestamp: dayjs(Date.now()).format(""),
				};
				invest.status.push(status);
				invest.employee = req.body.employee;
				invest.save();
				return res.status(200).send({ status: true, message: 'ไม่อนุมัติผู้ลงทุนสำเร็จ' })
			} else {
				return res.status(403).send({ status: false, message: 'รายการดังกล่าวไม่สามารถยกเลิกได้ หรือรายการดังกล่าวผ่านการอนุมัติแล้ว' })
			}
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
}

module.exports.getInvestAll = async (req, res) => {
	try {
		const invest = await Invests.find();
		if (!invest)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: invest });
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getInvestById = async (req, res) => {
	try {
		const invest = await Invests.findById(req.params.id);
		if (!invest)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: invest });
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getInvestByPartnerId = async (req, res) => {
	try {
		const id = req.params.partnerid;
		const pipelint = [
			{
				$match: { partner_id: id },
			},
		];
		const invest = await Invests.aggregate(pipelint);
		if (!invest) {
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		} else {
			return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: invest });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
}

module.exports.getImage = async (req, res) => {
	try {
		const imgname = req.params.imgname;
		const imagePath = path.join(__dirname, '../../../assets/invest', imgname);
		// return res.send(`<img src=${imagePath}>`);0
		return res.sendFile(imagePath);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
}