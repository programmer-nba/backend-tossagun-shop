const { PercentInvests, validate } = require("../../model/pos/percent.invest.model");

module.exports.create = async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message, status: false });
		const result = await new PercentInvests({
			...req.body,
		}).save().catch((err) => console.log(err));
		return res.status(201).send({ message: "เพิ่มข้อมูลสำเร็จ", status: true, result: result });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getPercentAll = async (req, res) => {
	try {
		const percent = await PercentInvests.find();
		if (!percent)
			return res.status(401).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: percent });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getPercentById = async (req, res) => {
	try {
		const id = req.params.id;
		const percent = await PercentInvests.findOne({ _id: id });
		if (!percent)
			return res.status(401).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: percent });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getPercentByCode = async (req, res) => {
	try {
		const code = req.params.code;
		const percent = await PercentInvests.findOne({ code: code });
		if (!percent)
			return res.status(401).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: percent });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.updatePercentInvest = async (req, res) => {
	try {
		const id = req.params.id;
		const percent = await PercentInvests.findByIdAndUpdate(id, req.body, { useFindAndModify: false });
		if (!percent)
			return res.status(401).send({ status: false, message: 'ไม่สามารแก้ไขข้อมูลดังกล่าวได้' });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: percent });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};