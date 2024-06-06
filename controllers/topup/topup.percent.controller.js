const { PercentTopup } = require("../../model/topup/topup.percent");

module.exports.create = async (req, res) => {
	try {
		const percent = await PercentTopup.findOne({ topup_id: req.body.topup_id });
		if (percent) {
			return res.status(401).send({ status: false, message: "รหัสเปอร์เซ็นต์ดังกล่าวมีอยู่ในระบบแล้ว" });
		} else {
			const new_percent = new PercentTopup(req.body);
			if (!new_percent) {
				return res.status(403).send({ status: false, message: "เพิ่มข้อมูลไม่สำเร็จ กรุณาทำรายอีกครั้ง" });
			} else {
				new_percent.save();
				return res.status(200).send({ status: true, message: 'เพิ่มข้อมูลสำเร็จ', data: new_percent });
			}
		}
	} catch (error) {
		console.log(err);
		return res.status(500).send({ status: false, message: err.message });
	}
};

module.exports.getAll = async (req, res) => {
	try {
		const percent = await PercentTopup.find();
		if (!percent) {
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		} else {
			return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: percent });
		}
	} catch (error) {
		console.log(err);
		return res.status(500).send({ status: false, message: err.message });
	}
};

module.exports.getById = async (req, res) => {
	try {
		const id = req.params.id;
		const percent = await PercentTopup.findOne({ _id: id });
		if (!percent) {
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		} else {
			return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: percent });
		}
	} catch (error) {
		console.log(err);
		return res.status(500).send({ status: false, message: err.message });
	}
};

module.exports.update = async (req, res) => {
	try {
		const id = req.params.id;
		const percent = await PercentTopup.findByIdAndUpdate(id, { ...req.body }, { useFindAndModify: false });
		if (!percent) {
			return res.status(403).send({ status: false, message: "แก้ไขข้อมูลเปอร์เซ็นต์ไม่สำเร็จ" });
		} else {
			return res.status(200).send({ status: true, message: "แก้ไขข้อมูลเปอร์เซ็นต์สำเร็จ", data: percent });
		}
	} catch (error) {
		console.log(err);
		return res.status(500).send({ status: false, message: err.message });
	}
};

module.exports.delete = async (req, res) => {
	try {
		const id = req.params.id;
		const percent = await PercentTopup.findByIdAndDelete(id);
		if (!percent) {
			return res.status(403).send({ status: false, message: "ลบข้อมูลเปอร์เซ็นต์ไม่สำเร็จ" });
		} else {
			return res.status(200).send({ status: true, message: "ลบข้อมูลเปอร์เซ็นต์สำเร็จ" });
		}
	} catch (error) {
		console.log(err);
		return res.status(500).send({ status: false, message: err.message });
	}
};